#!/usr/bin/env python3
"""Rebuild buept_exams.json mock exams (mock_1..mock_5) with real inline
sections resolved from reading_tasks.json / reading_tasks_hard.json and
listening_tasks.json, so ExamDetailScreen (which only reads exam.sections)
can actually render and score them.

New schema (per mock exam):
  sections:
    reading:   { passages: [{title, passage, questions:[mcq]}] }   (5 tasks)
    listening: { groups:   [{title, transcript, questions:[mcq]}] } (4 tasks)
    grammar:   { questions: [mcq] }                                 (Language Use)

Reading MCQ options are parsed from the source question text
("A) ... B) ... C) ... D) ...") with answer stored as the letter index
(0-3) matching ExamDetailScreen expectations.
"""
import json
import random
import re

DATA = "data"

rs = json.load(open(f"{DATA}/reading_sets.json"))
rt = json.load(open(f"{DATA}/reading_tasks.json"))
rh = json.load(open(f"{DATA}/reading_tasks_hard.json"))
lt = json.load(open(f"{DATA}/listening_tasks.json"))

reading_tasks = {x["id"]: x for x in list(rt) + list(rh) if isinstance(x.get("id"), str)}
listening_tasks = {x["id"]: x for x in lt if isinstance(x.get("id"), str)}

exams = json.load(open(f"{DATA}/buept_exams.json"))
rng = random.Random(42)


def pick(rng, keys, n):
    if len(keys) < n:
        raise SystemExit(f"not enough candidates for {n}")
    return rng.sample(keys, n)


def strip_markers(text):
    """Remove leading [Paragraph n] markers."""
    return re.sub(r"^\s*\[Paragraph\s*\d+\]\s*", "", text, flags=re.MULTILINE)


def parse_mcq(q):
    """Convert a source question (embedded A) B) C) D) options) into
    {q, options:[...], answer:<idx>, type:'mcq'}; keep others untouched."""
    src_type = q.get("type", "short_answer")
    body = (q.get("q") or "").strip()
    has_options = re.search(r"([A-D])\)[\s]", body) is not None
    if src_type != "short_answer" or not has_options:
        out = {"q": body, "answer": q.get("answer"), "type": src_type}
        if q.get("explain"):
            out["explain"] = q["explain"]
        if q.get("similar"):
            out["similar"] = q["similar"]
        return out

    m = re.search(r"([A-D])\)[\s]", body)
    if not m:
        return {"q": body, "answer": q.get("answer"), "type": "short_answer",
                "explain": q.get("explain"), "similar": q.get("similar")}
    stem = body[:m.start()].strip().rstrip()
    tail = body[m.start():]
    opts = re.split(r"\s*([A-D])\)\s", tail)
    options = []
    i = 0
    while i < len(opts):
        if opts[i] == "":
            i += 1
            continue
        label = opts[i]
        content = opts[i + 1].strip() if i + 1 < len(opts) else ""
        cm = re.match(r"^[A-D]\)\s", content)
        if cm:
            content = content[cm.end():].strip()
        options.append(f"{label}) {content}")
        i += 2
    options = [o for o in options if o]

    raw = q.get("answer")
    target = (raw[0] if isinstance(raw, list) else raw) if raw else None
    ans_idx = None
    if isinstance(target, str):
        key = target.strip().upper()
        for oi, o in enumerate(options):
            if o.upper().startswith(f"{key})"):
                ans_idx = oi
                break
        if ans_idx is None:
            for oi, o in enumerate(options):
                if o.lower().strip().rstrip('.') == key.lower().strip().rstrip('.'):
                    ans_idx = oi
                    break
    if ans_idx is None:
        out = {"q": body, "answer": q.get("answer"), "type": "short_answer"}
        if q.get("explain"):
            out["explain"] = q["explain"]
        if q.get("similar"):
            out["similar"] = q["similar"]
        return out
    out = {"q": stem, "options": options, "answer": ans_idx, "type": "mcq",
           "skill": q.get("skill")}
    if q.get("explain"):
        out["explain"] = q["explain"]
    if q.get("similar"):
        out["similar"] = q["similar"]
    return out


def parse_mcq_with_source(q, task_id):
    mq = parse_mcq(q)
    mq["_source_task"] = task_id
    return mq


def make_grammar_pool(rng):
    """Language Use pool built from cloze-style fill-in questions converted
    to MCQ with 4 options."""
    pool = []
    all_tasks = list(reading_tasks.values()) + list(listening_tasks.values())
    for t in all_tasks:
        for q in t.get("questions", []):
            body = (q.get("q") or "").strip()
            if not re.search(r"___", body):
                continue
            ans_text = ((q.get("answer") or [""])[0] if isinstance(q.get("answer"), list)
                        else (q.get("answer") or ""))
            if not ans_text or not isinstance(ans_text, str) or len(ans_text) > 25:
                continue
            distractors = []
            for other in all_tasks:
                for oq in other.get("questions", []):
                    oa = oq.get("answer") or []
                    if not oa:
                        continue
                    cand = oa[0] if isinstance(oa, list) else oa
                    if isinstance(cand, str) and 2 <= len(cand) <= 25 and cand != ans_text:
                        distractors.append(cand)
                    if len(distractors) >= 3:
                        break
                if len(distractors) >= 3:
                    break
            if len(distractors) < 3:
                continue
            distractors = rng.sample(distractors, 3)
            opts = distractors + [ans_text]
            rng.shuffle(opts)
            pool.append({
                "q": body,
                "options": opts,
                "answer": opts.index(ans_text),
                "type": "mcq",
                "skill": "language_use",
            })
            if len(pool) >= 30:
                return pool
    return pool


for e in exams:
    if not e.get("id", "").startswith("mock_"):
        continue
    n_read, n_listen = 5, 4
    read_keys = pick(rng, list(reading_tasks.keys()), n_read)
    listen_keys = pick(rng, list(listening_tasks.keys()), n_listen)

    passages = []
    for task_id in read_keys:
        t = reading_tasks[task_id]
        qs = [parse_mcq_with_source(q, task_id) for q in t.get("questions", [])]
        passages.append({
            "title": t.get("title", task_id),
            "passage": strip_markers(t.get("text", "")),
            "questions": qs,
            "_source_task": task_id,
        })

    groups = []
    for task_id in listen_keys:
        t = listening_tasks[task_id]
        qs = [parse_mcq_with_source(q, task_id) for q in t.get("questions", [])]
        groups.append({
            "title": t.get("title", task_id),
            "transcript": t.get("transcript", ""),
            "questions": qs,
            "_source_task": task_id,
        })

    grammar_pool = make_grammar_pool(rng)

    sections = {
        "reading": {"passages": passages},
        "listening": {"groups": groups},
        "grammar": {"questions": grammar_pool},
    }
    e["sections"] = sections
    e["reading_section"] = read_keys
    e["listening_section"] = listen_keys

    total = (sum(len(p["questions"]) for p in passages)
             + sum(len(g["questions"]) for g in groups)
             + len(grammar_pool))
    print(f"{e['id']}: reading={sum(len(p['questions']) for p in passages)} "
          f"listening={sum(len(g['questions']) for g in groups)} "
          f"grammar={len(grammar_pool)} total={total}")

json.dump(exams, open(f"{DATA}/buept_exams.json", "w"), indent=2, ensure_ascii=False)
print("buept_exams.json updated")
