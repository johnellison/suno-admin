#!/usr/bin/env python3
import sys
import json
import argparse
from pathlib import Path

try:
    import matchering as mg
except ImportError:
    print(
        json.dumps(
            {
                "success": False,
                "error": "matchering not installed. Run: pip install matchering",
            }
        )
    )
    sys.exit(1)


def master_with_reference(
    target: str, reference: str, output: str, bit_depth: int = 24
) -> dict:
    try:
        import subprocess
        import tempfile

        target_path = Path(target)
        output_path = Path(output)

        if not target_path.exists():
            return {"success": False, "error": f"Target file not found: {target}"}

        if not Path(reference).exists():
            return {"success": False, "error": f"Reference file not found: {reference}"}

        output_path.parent.mkdir(parents=True, exist_ok=True)

        output_ext = output_path.suffix.lower()
        is_mp3_output = output_ext == ".mp3"
        temp_wav_path = None

        if is_mp3_output:
            temp_wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            temp_wav_path = temp_wav.name
            temp_wav.close()
            processing_output = temp_wav_path
        else:
            processing_output = str(output_path)

        if bit_depth == 16:
            result_config = mg.pcm16(processing_output)
        elif bit_depth == 24:
            result_config = mg.pcm24(processing_output)
        else:
            result_config = mg.Result(
                file=processing_output,
                subtype="FLOAT",
                use_limiter=True,
                normalize=True,
            )

        config = mg.Config(
            max_length=30 * 60,
            threshold=0.7079,
        )

        mg.process(
            target=target,
            reference=reference,
            results=[result_config],
            config=config,
        )

        if is_mp3_output and temp_wav_path:
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-i",
                    temp_wav_path,
                    "-codec:a",
                    "libmp3lame",
                    "-qscale:a",
                    "0",
                    str(output_path),
                ],
                capture_output=True,
                check=True,
            )
            Path(temp_wav_path).unlink()

        return {
            "success": True,
            "output": str(output_path),
            "target": target,
            "reference": reference,
            "bit_depth": bit_depth,
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def batch_master(
    targets_dir: str, reference: str, output_dir: str, bit_depth: int = 24
) -> dict:
    targets_path = Path(targets_dir)
    output_path = Path(output_dir)

    if not targets_path.exists():
        return {"success": False, "error": f"Target directory not found: {targets_dir}"}

    audio_files = list(targets_path.glob("*.wav")) + list(targets_path.glob("*.mp3"))

    if not audio_files:
        return {"success": False, "error": f"No audio files found in {targets_dir}"}

    output_path.mkdir(parents=True, exist_ok=True)

    results = []
    for target_file in audio_files:
        original_format = target_file.suffix
        out_file = output_path / f"{target_file.stem}_mastered{original_format}"

        result = master_with_reference(
            target=str(target_file),
            reference=reference,
            output=str(out_file),
            bit_depth=bit_depth,
        )
        results.append(result)

        if result["success"]:
            print(f"✅ {target_file.name}", file=sys.stderr)
        else:
            print(f"❌ {target_file.name}: {result['error']}", file=sys.stderr)

    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]

    return {
        "success": len(failed) == 0,
        "total": len(results),
        "successful": len(successful),
        "failed": len(failed),
        "output_dir": str(output_path),
        "results": results,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Master audio using a reference track")
    parser.add_argument("target", help="Target audio file or directory")
    parser.add_argument("--reference", "-r", required=True, help="Reference audio file")
    parser.add_argument("--output", "-o", help="Output file or directory")
    parser.add_argument(
        "--bit-depth",
        "-b",
        type=int,
        default=24,
        choices=[16, 24, 32],
        help="Output bit depth",
    )

    args = parser.parse_args()

    target_path = Path(args.target)

    if target_path.is_dir():
        output_dir = args.output or str(target_path / "mastered")
        result = batch_master(
            targets_dir=args.target,
            reference=args.reference,
            output_dir=output_dir,
            bit_depth=args.bit_depth,
        )
    else:
        if args.output:
            output_file = args.output
        else:
            original_format = target_path.suffix
            output_file = str(
                target_path.parent / f"{target_path.stem}_mastered{original_format}"
            )

        result = master_with_reference(
            target=args.target,
            reference=args.reference,
            output=output_file,
            bit_depth=args.bit_depth,
        )

    print(json.dumps(result, indent=2))
