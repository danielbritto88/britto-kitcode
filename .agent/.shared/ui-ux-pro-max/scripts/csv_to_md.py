#!/usr/bin/env python3
"""
CSV to Markdown converter — Britto KitCode
==========================================
Converts all CSVs in data/ to indexed Markdown files.
Grouping column per file is configured below.
Run from the project root or the scripts/ directory.
"""

import csv
import os
from pathlib import Path
from collections import OrderedDict

# Resolve data directory relative to this script
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data"

# --- Config: which column to group by for each file ---
# None = flat table (no grouping)
GROUP_BY = {
    "charts.csv":           None,          # 25 chart types, flat
    "colors.csv":           None,          # 96 products, keep flat (too diverse)
    "icons.csv":            "Category",
    "landing.csv":          None,          # 30 patterns, flat
    "products.csv":         None,          # 96 products, flat (keywords cover lookup)
    "prompts.csv":          None,          # each row IS a style
    "react-performance.csv": "Category",
    "styles.csv":           "Style Category",
    "typography.csv":       "Category",
    "ui-reasoning.csv":     None,          # flat — ui_category is the key column
    "ux-guidelines.csv":    "Category",
    "web-interface.csv":    "Category",
    # stacks (all have Category)
    "flutter.csv":          "Category",
    "html-tailwind.csv":    "Category",
    "jetpack-compose.csv":  "Category",
    "nextjs.csv":           "Category",
    "nuxt-ui.csv":          "Category",
    "nuxtjs.csv":           "Category",
    "react-native.csv":     "Category",
    "react.csv":            "Category",
    "shadcn.csv":           "Category",
    "svelte.csv":           "Category",
    "swiftui.csv":          "Category",
    "vue.csv":              "Category",
}

# Columns to drop (verbose / redundant in md context)
DROP_COLS = {
    "charts.csv": {"No"},
    "colors.csv": {"No"},
    "icons.csv": {"STT"},
    "landing.csv": {"No"},
    "products.csv": {"No"},
    "prompts.csv": {"STT"},
    "react-performance.csv": {"No"},
    "styles.csv": {"STT"},
    "typography.csv": {"STT"},
    "ui-reasoning.csv": {"No"},
    "ux-guidelines.csv": {"No"},
    "web-interface.csv": {"No"},
}

TITLES = {
    "charts.csv":            "Chart Types Reference",
    "colors.csv":            "Color Palettes by Product Type",
    "icons.csv":             "Icon Reference (Lucide React)",
    "landing.csv":           "Landing Page Patterns",
    "products.csv":          "Product Style Recommendations",
    "prompts.csv":           "UI Style Prompts & CSS Keywords",
    "react-performance.csv": "React Performance Patterns",
    "styles.csv":            "UI Style Catalog",
    "typography.csv":        "Font Pairing Reference",
    "ui-reasoning.csv":      "UI Reasoning by Product Type",
    "ux-guidelines.csv":     "UX Guidelines",
    "web-interface.csv":     "Web Interface Best Practices",
    "flutter.csv":           "Flutter Guidelines",
    "html-tailwind.csv":     "HTML + Tailwind Guidelines",
    "jetpack-compose.csv":   "Jetpack Compose Guidelines",
    "nextjs.csv":            "Next.js Guidelines",
    "nuxt-ui.csv":           "Nuxt UI Guidelines",
    "nuxtjs.csv":            "Nuxt.js Guidelines",
    "react-native.csv":      "React Native Guidelines",
    "react.csv":             "React Guidelines",
    "shadcn.csv":            "shadcn/ui Guidelines",
    "svelte.csv":            "Svelte Guidelines",
    "swiftui.csv":           "SwiftUI Guidelines",
    "vue.csv":               "Vue.js Guidelines",
}


def escape_md(text) -> str:
    """Minimal escaping so pipes inside cells don't break tables."""
    if text is None:
        return ""
    return str(text).replace("|", "\\|").replace("\n", " ").strip()


def rows_to_table(headers: list[str], rows: list[dict]) -> str:
    cols = headers
    header_row = "| " + " | ".join(cols) + " |"
    sep_row    = "| " + " | ".join(["---"] * len(cols)) + " |"
    lines = [header_row, sep_row]
    for row in rows:
        cells = [escape_md(row.get(c, "")) for c in cols]
        lines.append("| " + " | ".join(cells) + " |")
    return "\n".join(lines)


def convert(csv_path: Path, md_path: Path, filename: str):
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        all_rows = list(reader)
        if not all_rows:
            return
        raw_headers = list(all_rows[0].keys())

    drop = DROP_COLS.get(filename, set())
    headers = [h for h in raw_headers if h not in drop]
    group_col = GROUP_BY.get(filename)
    title = TITLES.get(filename, filename.replace(".csv", "").replace("-", " ").title())

    lines = [f"# {title}", ""]
    lines.append(f"> Auto-generated from `{filename}`. Sections enable targeted reads.")
    lines.append("")

    if group_col and group_col in raw_headers:
        # Group rows by the group column value
        groups: OrderedDict[str, list[dict]] = OrderedDict()
        for row in all_rows:
            key = row.get(group_col, "Other").strip()
            groups.setdefault(key, []).append(row)

        table_headers = [h for h in headers if h != group_col]

        for group_name, group_rows in groups.items():
            lines.append(f"## {group_name}")
            lines.append("")
            lines.append(rows_to_table(table_headers, group_rows))
            lines.append("")
    else:
        # Flat table
        lines.append(rows_to_table(headers, all_rows))
        lines.append("")

    md_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"  ✓ {filename} → {md_path.name}")


def main():
    # Root data files
    for csv_path in sorted(DATA_DIR.glob("*.csv")):
        md_path = csv_path.with_suffix(".md")
        convert(csv_path, md_path, csv_path.name)

    # Stacks sub-directory
    stacks_dir = DATA_DIR / "stacks"
    if stacks_dir.exists():
        for csv_path in sorted(stacks_dir.glob("*.csv")):
            md_path = csv_path.with_suffix(".md")
            convert(csv_path, md_path, csv_path.name)

    print("\nDone. MD files written alongside CSVs.")


if __name__ == "__main__":
    main()
