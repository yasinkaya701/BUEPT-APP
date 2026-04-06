#!/usr/bin/env python3
"""
Build WASC vocabulary datasets for the mobile app.

Outputs:
  - data/wasc_vocab_lists.json
  - data/wasc_quizlet_decks.json
"""

from __future__ import annotations

import io
import json
import re
from datetime import date
from pathlib import Path

import pdfplumber
import requests


A2_URL = "https://wasc.bogazici.edu.tr/uploads/resources/69b7dd3ac733f_1773657402.pdf"
B1_URL = "https://wasc.bogazici.edu.tr/uploads/resources/69b58eb08c132_1773506224.pdf"
B2_URL = "https://wasc.bogazici.edu.tr/uploads/resources/69b7e29cc8e94_1773658780.pdf"
QUIZLET_URL = "https://quizlet.com/user/WASC_Bogazici/sets"
SOURCE_PAGE_URL = "https://wasc.bogazici.edu.tr/kaynaklar"

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"


def normalize_space(text: str) -> str:
    return " ".join(str(text or "").replace("\u00a0", " ").split()).strip()


def sanitize_word(word: str) -> str:
    value = normalize_space(word).replace("’", "'").lower()
    if not value:
        return ""
    tokens = value.split(" ")
    # OCR/PDF split bug: "technolog y" -> "technology"
    if len(tokens) == 2 and len(tokens[1]) == 1 and len(tokens[0]) > 3:
        value = "".join(tokens)
    value = re.sub(r"\s+", " ", value).strip()
    if not re.fullmatch(r"[a-z][a-z'\- ]*[a-z]", value):
        return ""
    if len(value) < 2 or len(value) > 40:
        return ""
    return value


def split_examples(raw: str) -> list[str]:
    text = normalize_space(raw)
    if not text:
        return []
    parts = re.split(r"\b\d+\.\s*", text)
    examples = []
    for part in parts:
        chunk = normalize_space(part)
        if not chunk:
            continue
        chunk = re.sub(r"^e\.g\.\s*", "", chunk, flags=re.I)
        examples.append(chunk)
    if not examples:
        fallback = re.sub(r"^e\.g\.\s*", "", text, flags=re.I).strip()
        if fallback:
            examples = [fallback]
    return examples[:2]


def parse_a2(url: str) -> list[dict]:
    raw = requests.get(url, timeout=30).content
    entries = []
    with pdfplumber.open(io.BytesIO(raw)) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables() or []:
                for row in table:
                    if not row or len(row) < 2:
                        continue
                    word = sanitize_word(row[0] or "")
                    if not word or word == "word":
                        continue
                    definition = normalize_space(row[1])
                    if not definition:
                        continue
                    examples = split_examples(row[2] if len(row) > 2 else "")
                    entries.append(
                        {
                            "word": word,
                            "definition": definition,
                            "examples": examples,
                        }
                    )
    return entries


HEADER_PATTERNS = [
    re.compile(r"^boğaziçi university$", re.I),
    re.compile(r"^writing and academic support center", re.I),
    re.compile(r"^oxford b1 word list", re.I),
    re.compile(r"^part\s+\d+", re.I),
    re.compile(r"^—\s*[a-z]\s*—$", re.I),
    re.compile(r"^page\s+\d+", re.I),
]


def is_header_line(line: str) -> bool:
    text = normalize_space(line)
    if not text:
        return True
    if any(pattern.search(text) for pattern in HEADER_PATTERNS):
        return True
    if "writing and academic support center (wasc) page" in text.lower():
        return True
    return False


def is_word_candidate(line: str) -> bool:
    token = sanitize_word(line)
    if not token:
        return False
    if token.startswith("e.g"):
        return False
    return len(token.split()) <= 3


def parse_b1(url: str) -> list[dict]:
    raw = requests.get(url, timeout=30).content
    lines = []
    with pdfplumber.open(io.BytesIO(raw)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            for raw_line in text.splitlines():
                line = normalize_space(raw_line)
                if not line or is_header_line(line):
                    continue
                lines.append(line)

    entries = []
    current = None
    mode = "word"

    def flush() -> None:
        nonlocal current
        if not current:
            return
        word = sanitize_word(current.get("word", ""))
        definition = normalize_space(current.get("definition", ""))
        if word and definition:
            example_text = normalize_space(current.get("example", ""))
            if example_text:
                example_text = re.sub(r"^e\.g\.\s*", "", example_text, flags=re.I)
                examples = [example_text]
            else:
                examples = []
            entries.append(
                {
                    "word": word,
                    "definition": definition,
                    "examples": examples,
                }
            )
        current = None

    for line in lines:
        if line.lower().startswith("e.g."):
            if current:
                current["example"] = normalize_space(
                    f"{current.get('example', '')} {line}"
                )
                mode = "example"
            continue

        if is_word_candidate(line):
            if current and mode in ("definition", "example"):
                flush()
            current = {"word": line, "definition": "", "example": ""}
            mode = "definition"
            continue

        if not current:
            continue

        if mode == "definition":
            current["definition"] = normalize_space(
                f"{current.get('definition', '')} {line}"
            )
        else:
            current["example"] = normalize_space(f"{current.get('example', '')} {line}")

    flush()
    return entries


def parse_b2(url: str) -> list[dict]:
    raw = requests.get(url, timeout=30).content
    entries = []
    with pdfplumber.open(io.BytesIO(raw)) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables() or []:
                if len(table) < 2:
                    continue
                first_row = table[0]
                if not first_row or not first_row[0]:
                    continue
                word = sanitize_word(first_row[0])
                if not word or word == "word":
                    continue

                body_chunks = []
                for row in table[1:]:
                    if isinstance(row, list):
                        body_chunks.extend(normalize_space(cell) for cell in row if cell)
                    else:
                        body_chunks.append(normalize_space(row))
                body = normalize_space(" ".join(body_chunks))
                if not body:
                    continue

                lower = body.lower()
                if "e.g." in lower:
                    idx = lower.index("e.g.")
                    definition = normalize_space(body[:idx])
                    example = normalize_space(body[idx:])
                    example = re.sub(r"^e\.g\.\s*", "", example, flags=re.I)
                    examples = [example] if example else []
                else:
                    definition = body
                    examples = []

                if definition:
                    entries.append(
                        {
                            "word": word,
                            "definition": definition,
                            "examples": examples,
                        }
                    )
    return entries


def dedupe(entries: list[dict], level: str) -> list[dict]:
    out = []
    seen = {}
    for item in entries:
        word = item.get("word")
        if not word:
            continue
        key = word.lower()
        if key in seen:
            prev = out[seen[key]]
            if not prev.get("definition") and item.get("definition"):
                prev["definition"] = item["definition"]
            if not prev.get("examples") and item.get("examples"):
                prev["examples"] = item["examples"]
            continue
        clean = {
            "word": word,
            "definition": normalize_space(item.get("definition", "")),
            "examples": [
                normalize_space(x)
                for x in item.get("examples", [])
                if normalize_space(x)
            ][:2],
            "level": level,
            "word_type": "general",
            "source": "wasc-glossary",
            "source_tag": f"WASC {level} Glossary",
        }
        if not clean["definition"]:
            continue
        seen[key] = len(out)
        out.append(clean)
    return out


def build() -> None:
    print("Fetching and parsing WASC glossaries...")
    a2 = dedupe(parse_a2(A2_URL), "A2")
    b1 = dedupe(parse_b1(B1_URL), "B1")
    b2 = dedupe(parse_b2(B2_URL), "B2")
    print(f"A2={len(a2)} B1={len(b1)} B2={len(b2)}")

    lists = [
        {
            "id": "wasc_a2_glossary",
            "title": "WASC A2 Glossary",
            "level": "A2",
            "source_url": A2_URL,
            "quizlet_source_url": QUIZLET_URL,
            "entries": a2,
            "count": len(a2),
        },
        {
            "id": "wasc_b1_glossary",
            "title": "WASC B1 Glossary",
            "level": "B1",
            "source_url": B1_URL,
            "quizlet_source_url": QUIZLET_URL,
            "entries": b1,
            "count": len(b1),
        },
        {
            "id": "wasc_b2_glossary",
            "title": "WASC B2 Glossary",
            "level": "B2",
            "source_url": B2_URL,
            "quizlet_source_url": QUIZLET_URL,
            "entries": b2,
            "count": len(b2),
        },
    ]

    vocab_payload = {
        "source": "Writing and Academic Support Center (WASC)",
        "source_page": SOURCE_PAGE_URL,
        "generated_at": str(date.today()),
        "lists": lists,
    }
    with open(DATA_DIR / "wasc_vocab_lists.json", "w", encoding="utf-8") as file:
        json.dump(vocab_payload, file, ensure_ascii=False, indent=2)

    deck_limits = {"A2": 220, "B1": 220, "B2": 220}
    decks = []
    for group in lists:
        level = group["level"]
        cards = []
        for item in group["entries"][: deck_limits[level]]:
            cards.append(
                {
                    "word": item["word"],
                    "definition": item["definition"],
                    "example": item["examples"][0] if item["examples"] else "",
                    "collocations": [],
                    "level": level,
                }
            )
        decks.append(
            {
                "id": f"quizlet_wasc_{level.lower()}",
                "title": f"WASC Quizlet {level}",
                "description": f"Quizlet-style flashcards from WASC {level} glossary ({len(cards)} cards).",
                "level": level,
                "source_url": QUIZLET_URL,
                "source_glossary_url": group["source_url"],
                "total_source_count": len(group["entries"]),
                "cards": cards,
            }
        )

    mixed_source = []
    for group in lists:
        mixed_source.extend(group["entries"][:110])
    mixed_cards = [
        {
            "word": item["word"],
            "definition": item["definition"],
            "example": item["examples"][0] if item["examples"] else "",
            "collocations": [],
            "level": item["level"],
        }
        for item in mixed_source
    ]
    decks.insert(
        0,
        {
            "id": "quizlet_wasc_mixed",
            "title": "WASC Quizlet Mixed",
            "description": "Mixed A2-B1-B2 WASC cards for rapid review.",
            "level": "A2-B2",
            "source_url": QUIZLET_URL,
            "source_glossary_url": SOURCE_PAGE_URL,
            "total_source_count": sum(len(group["entries"]) for group in lists),
            "cards": mixed_cards,
        },
    )

    with open(DATA_DIR / "wasc_quizlet_decks.json", "w", encoding="utf-8") as file:
        json.dump(decks, file, ensure_ascii=False, indent=2)
    print("Wrote data/wasc_vocab_lists.json and data/wasc_quizlet_decks.json")


if __name__ == "__main__":
    build()
