#!/usr/bin/env python3
"""Normalize offline METU mocks to the official Oct-2025 item types.

- Official METU sections use MULTIPLE CHOICE only (While Listening 16 MC,
  Reading 24 items incl. 4 vocab MC, Note-Taking 6 MC).
- Speaking (Day-2) = 4 unprepared questions + 1 prepared broader-perspective.

Short-answer questions in Note-Taking and Listening are converted to
multiple-choice with the original correct answer kept as the correct option.
Distractors are generated from the original option set where possible.
"""
import re

PATH = 'src/data/offlineMocksOdtu.js'
src = open(PATH).read()

# Split source into line list for targeted rewrites.
lines = src.split('\n')


def mc_from_sa(question, options_line):
    """Convert a shortAnswer(...) call followed by its options into MC.
    This is a targeted manual pass done via regex on the whole source."""
    pass


# --- Pass 1: convert shortAnswer(...) with an `options` field already ---
def convert_sa_with_options(s):
    pat = re.compile(
        r"shortAnswer\('([^']+)', '([^']+)', (\[[^\]]+\]), (\[[^\]]+\])\)"
    )
    def repl(m):
        qid, q, answers, opts = m.groups()
        correct = 0
        answers_list = eval(answers)
        opts_list = eval(opts)
        for i, o in enumerate(opts_list):
            if o.lower() in [a.lower() for a in answers_list]:
                correct = i
                break
        return f"multipleChoice('{qid}', '{q}', {opts}, {correct})"
    return pat.sub(repl, s)


# --- Pass 2: convert bare shortAnswer (2-arg) into MC with generated options ---
def convert_bare_sa(s):
    pat = re.compile(r"shortAnswer\('([^']+)', '([^']+)', (\[[^\]]+\])\)")
    def repl(m):
        qid, q, answers = m.groups()
        answers_list = eval(answers)
        best = answers_list[0]
        # Simple distractor generation: keep best answer + fabricate variants
        return f"multipleChoice('{qid}', '{q}', [\"{best}\", \"None of the above\", \"It is not mentioned in the text\", \"The text states the opposite\"], 0)"
    return pat.sub(repl, s)


# Only touch Note-Taking and Listening blocks for MC conversion.
# We'll process the whole file but only within note-taking / listening sections.
lines_out = []
in_note = False
in_listen = False
for ln in lines:
    if re.match(r"const l\dNoteTaking = \{", ln):
        in_note = True
    elif re.match(r"const l\dListening = \{", ln):
        in_listen = True
    elif ln.startswith('};') and (in_note or in_listen):
        in_note = False
        in_listen = False
    if in_note or in_listen:
        ln = convert_sa_with_options(ln)
        ln = convert_bare_sa(ln)
    lines_out.append(ln)

src = '\n'.join(lines_out)

# --- Pass 3: speaking blocks -> 5 questions (4 unprepared + 1 prepared) ---
# Find speaking question arrays and ensure exactly 5 items, last one marked prepared.
pat = re.compile(r"(const l(\d)Speaking = \{\n  questions: \[\n)((?:    \{ id: '[^']+', type: 'speaking', q: '[^']+'\ },\n)+)(  \],\n\};)", )
def speak_repl(m):
    head, lvl, body, tail = m.groups()
    qs = re.findall(r"\{ id: '([^']+)', type: 'speaking', q: '([^']+)' \}", body)
    if len(qs) < 4:
        raise SystemExit('unexpected speaking count')
    # keep first 4 as unprepared; if a 5th exists, label it prepared
    out = []
    for i, (qid, q) in enumerate(qs[:4], 1):
        out.append(f"    {{ id: '{qid}', type: 'speaking', q: '{q}', prepared: false }},\n")
    if len(qs) >= 5:
        qid, q = qs[4]
        out.append(f"    {{ id: '{qid}', type: 'speaking', q: '{q}', prepared: true }},\n")
    else:
        out.append(f"    {{ id: 'sp_prepared_l{lvl}', type: 'speaking', q: 'In your opinion, what is the biggest challenge facing universities today, and how would you address it?', prepared: true }},\n")
    return head + ''.join(out) + tail

src = pat.sub(speak_repl, src)

open(PATH, 'w').write(src)
print('done')

# Verify
import subprocess
print(subprocess.run(['grep', '-c', 'multiple_choice', PATH], capture_output=True, text=True).stdout)
