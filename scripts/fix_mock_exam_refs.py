#!/usr/bin/env python3
"""Rebuild buept_exams.json mock exams (mock_1..mock_5) with real inline
sections resolved from reading_tasks.json / reading_tasks_hard.json and
listening_tasks.json, so ExamDetailScreen (which only reads exam.sections)
can actually render and score them.
"""
import json
import random

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

for e in exams:
    if not e.get("id", "").startswith("mock_"):
        continue
    n_read, n_listen = 5, 4
    read_keys = pick(rng, list(reading_tasks.keys()), n_read)
    listen_keys = pick(rng, list(listening_tasks.keys()), n_listen)
    sections = {
        "reading": {
            "passage": "BUSEPT reading sets combined. Answer each question below the related passage.",
            "questions": [
                {
                    "q": q.get("q", ""),
                    "answer": q.get("answer", ""),
                    "similar": q.get("similar"),
                    "type": q.get("type", "short_answer"),
                    "_source_task": task_id,
                }
                for task_id in read_keys
                for q in reading_tasks[task_id].get("questions", [])
            ],
        },
        "listening": {
            "passage": "BUSEPT listening sets combined. Listen carefully; each recording is played once.",
            "questions": [
                {
                    "q": q.get("q", ""),
                    "answer": q.get("answer", ""),
                    "similar": q.get("similar"),
                    "type": q.get("type", "short_answer"),
                    "_source_task": task_id,
                }
                for task_id in listen_keys
                for q in listening_tasks[task_id].get("questions", [])
            ],
        },
        "grammar": {"questions": []},
    }
    e["sections"] = sections
    e["reading_section"] = read_keys
    e["listening_section"] = listen_keys
    total = len(sections["reading"]["questions"]) + len(sections["listening"]["questions"])
    print(f"{e['id']}: reading={len(sections['reading']['questions'])} listening={len(sections['listening']['questions'])} total={total}")

json.dump(exams, open(f"{DATA}/buept_exams.json", "w"), indent=2, ensure_ascii=False)
print("buept_exams.json updated")
