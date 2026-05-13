#!/usr/bin/env python3
"""Generate whitepaper PDF from markdown source.

Requires: pip install markdown weasyprint (or panflute+pandoc)
Uses: pandoc (markdown → PDF) if available, weasyprint as fallback.

Usage:
    python scripts/generate_whitepaper.py
    python scripts/generate_whitepaper.py --output docs/whitepaper/praxis-proof-protocol.pdf
"""

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
SRC = ROOT / "docs" / "whitepaper" / "praxis-proof-protocol.md"
DEFAULT_OUT = ROOT / "docs" / "whitepaper" / "praxis-proof-protocol.pdf"


def pandoc(src: Path, dst: Path) -> bool:
    """Try pandoc markdown → PDF."""
    try:
        subprocess.run(
            [
                "pandoc",
                str(src),
                "-o", str(dst),
                "--pdf-engine=xelatex",
                "-V", "geometry:margin=1in",
                "-V", "fontsize=11pt",
                "-V", "colorlinks=true",
                "--from", "markdown+smart",
            ],
            check=True,
            capture_output=True,
        )
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False


def weasyprint_fallback(src: Path, dst: Path) -> bool:
    """Fallback: weasyprint from markdown → HTML → PDF."""
    try:
        import markdown
        from weasyprint import HTML

        md_text = src.read_text()
        html_body = markdown.markdown(md_text, extensions=["extra", "codehilite", "toc"])

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Praxis Proof Protocol Whitepaper</title>
<style>
  body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a1a; }}
  h1 {{ font-size: 2rem; border-bottom: 2px solid #715BFF; padding-bottom: 0.5rem; }}
  h2 {{ font-size: 1.5rem; margin-top: 2rem; color: #715BFF; }}
  h3 {{ font-size: 1.2rem; }}
  table {{ border-collapse: collapse; width: 100%; margin: 1rem 0; }}
  th, td {{ border: 1px solid #ddd; padding: 8px 12px; text-align: left; }}
  th {{ background: #f5f5f5; }}
  code {{ background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }}
  pre {{ background: #1a1a2e; color: #e0e0e0; padding: 1rem; border-radius: 4px; overflow-x: auto; }}
  pre code {{ background: none; color: inherit; }}
  blockquote {{ border-left: 3px solid #715BFF; padding-left: 1rem; color: #555; margin: 1rem 0; }}
  a {{ color: #715BFF; }}
  @page {{ margin: 0.8in; size: letter; }}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

        HTML(string=html).write_pdf(str(dst))
        return True
    except ImportError:
        return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate whitepaper PDF")
    parser.add_argument("--output", default=str(DEFAULT_OUT), help="Output PDF path")
    args = parser.parse_args()

    if not SRC.is_file():
        print(f"Error: whitepaper source not found at {SRC}", file=sys.stderr)
        return 1

    dst = Path(args.output)
    dst.parent.mkdir(parents=True, exist_ok=True)

    if pandoc(SRC, dst):
        print(f"Whitepaper PDF generated (pandoc): {dst}")
        return 0

    print("pandoc not available, trying weasyprint...")
    if weasyprint_fallback(SRC, dst):
        print(f"Whitepaper PDF generated (weasyprint): {dst}")
        return 0

    print("Error: neither pandoc nor weasyprint available.", file=sys.stderr)
    print("Install: brew install pandoc && pip install markdown weasyprint", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
