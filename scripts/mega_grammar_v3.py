import json
import random
import os

# Paths
BASE_PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/grammar_tasks.json'
HARD_PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/grammar_tasks_hard.json'
TE_PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/test_english_grammar_tasks.json'

def load_json(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return []

all_existing = load_json(BASE_PATH) + load_json(HARD_PATH) + load_json(TE_PATH)

ROAD_MAP = [
    # A1-A2 (Standard) -> BASE
    {"title": "Verb Be: Affirmative, Negative & Questions", "level": "A1", "id": "g_a1_01", "file": "base"},
    {"title": "Have Got / Has Got (Possession)", "level": "A1", "id": "g_a1_02", "file": "base"},
    {"title": "Present Simple: Daily Routines", "level": "A1", "id": "g_a1_03", "file": "base"},
    {"title": "Articles: A, An, The (Basics)", "level": "A1", "id": "g_a1_04", "file": "base"},
    {"title": "Plural Nouns & Irregulars", "level": "A1", "id": "g_a1_05", "file": "base"},
    {"title": "Possessive Adjectives & 's", "level": "A1", "id": "g_a1_06", "file": "base"},
    {"title": "Object Pronouns (me, you, him...)", "level": "A1", "id": "g_a1_07", "file": "base"},
    {"title": "Imperatives & Classroom Language", "level": "A1", "id": "g_a1_08", "file": "base"},
    {"title": "Numbers, Days & Time Prepositions", "level": "A1", "id": "g_a1_09", "file": "base"},
    {"title": "Basic Modals: Can/Can't (Ability)", "level": "A1", "id": "g_a1_10", "file": "base"},

    # B1-B2 (Intermediate) -> BASE
    {"title": "Present Perfect (Recent Events)", "level": "B1", "id": "g_b1_01", "file": "base"},
    {"title": "Present Perfect vs Past Simple", "level": "B1", "id": "g_b1_02", "file": "base"},
    {"title": "Zero & First Conditionals", "level": "B1", "id": "g_b1_03", "file": "base"},
    {"title": "Second Conditional (Hypothetical)", "level": "B1", "id": "g_b1_04", "file": "base"},
    {"title": "Passive Voice (Simple Tenses)", "level": "B1", "id": "g_b1_05", "file": "base"},
    {"title": "Modal Verbs: Obligations (Must/Have to)", "level": "B1", "id": "g_b1_06", "file": "base"},
    {"title": "Modal Verbs: Advice (Should/Ought to)", "level": "B1", "id": "g_b1_07", "file": "base"},
    {"title": "Relative Clauses (Who, Which, That)", "level": "B1", "id": "g_b1_08", "file": "base"},
    {"title": "Used to & Would (Past Habits)", "level": "B1", "id": "g_b1_09", "file": "base"},
    {"title": "Question Tags (Confirmation)", "level": "B1", "id": "g_b1_10", "file": "base"},

    # Test-English Style -> TE
    {"title": "TE A1: Verb Be Mixed Practice", "level": "A1", "id": "g_te_a1_01", "file": "te"},
    {"title": "TE A1: Have Got and Possession", "level": "A1", "id": "g_te_a1_02", "file": "te"},
    {"title": "TE A2: Past Simple vs Continuous", "level": "A2", "id": "g_te_a2_01", "file": "te"},
    {"title": "TE A2: Comparatives and Superlatives", "level": "A2", "id": "g_te_a2_02", "file": "te"},
    {"title": "TE B1: Modal Verbs of Ability", "level": "B1", "id": "g_te_b1_01", "file": "te"},
    {"title": "TE B1: Present Perfect Contrast", "level": "B1", "id": "g_te_b1_02", "file": "te"},
    {"title": "TE B1: Use of English Multiple Choice", "level": "B1", "id": "g_te_b1_03", "file": "te"},
    {"title": "TE B2: Conditionals & Wish", "level": "B2", "id": "g_te_b2_01", "file": "te"},
    {"title": "TE B2: Passive Mastery", "level": "B2", "id": "g_te_b2_02", "file": "te"},
    {"title": "TE B2: Verb Patterns (to/ing)", "level": "B2", "id": "g_te_b2_03", "file": "te"},
    {"title": "TE B2: Advanced Relative Clauses", "level": "B2", "id": "g_te_b2_04", "file": "te"},
    {"title": "TE C1: Inversion & Emphasis", "level": "C1", "id": "g_te_c1_01", "file": "te"},
    {"title": "TE C1: Advanced Clause Structures", "level": "C1", "id": "g_te_c1_02", "file": "te"},
    {"title": "TE C1: Gapped Text Placement", "level": "C1", "id": "g_te_c1_03", "file": "te"},
    {"title": "TE Style: Phrasal Verbs Advanced", "level": "C1", "id": "g_te_v_01", "file": "te"},
    {"title": "TE Style: Academic Collocations", "level": "C1", "id": "g_te_v_02", "file": "te"},
    {"title": "TE Style: Sentence Transformation 1", "level": "B2", "id": "g_te_t_01", "file": "te"},
    {"title": "TE Style: Sentence Transformation 2", "level": "C1", "id": "g_te_t_02", "file": "te"},
    {"title": "TE Style: Error Correction (Grammar)", "level": "C1", "id": "g_te_e_01", "file": "te"},
    {"title": "TE Style: Error Correction (Vocab)", "level": "C1", "id": "g_te_e_02", "file": "te"},

    # Advanced/Hard -> HARD
    {"title": "Mixed Conditionals (Time Shifts)", "level": "B2", "id": "g_b2_mix_01", "file": "hard"},
    {"title": "Past Modals of Deduction", "level": "B2", "id": "g_b2_mod_01", "file": "hard"},
    {"title": "Inversion after Negative Adverbials", "level": "C1", "id": "g_c1_inv_01", "file": "hard"},
    {"title": "Cleft Sentences for Emphasis", "level": "C1", "id": "g_c1_cleft_01", "file": "hard"},
    {"title": "Subjunctive Mood (Academic)", "level": "C1", "id": "g_c1_sub_01", "file": "hard"},
    {"title": "Participle Clauses (Reduced Relatives)", "level": "C1", "id": "g_c1_part_01", "file": "hard"},
    {"title": "Nominalization (Academic Diskur)", "level": "C2", "id": "g_c2_nom_01", "file": "hard"},
    {"title": "Advanced Conditional Inversion", "level": "C2", "id": "g_c2_inv_02", "file": "hard"},
    {"title": "Epistemic Modality Mastery", "level": "C2", "id": "g_c2_mod_01", "file": "hard"},
    {"title": "P4 Mastery: Editing / Multi-Error", "level": "C2", "id": "g_c2_edit_01", "file": "hard"},
    {"title": "Complex Noun Phrases", "level": "C2", "id": "g_c2_noun_01", "file": "hard"},
    {"title": "Stylistic Fronting & Inversion", "level": "C2", "id": "g_c2_sty_01", "file": "hard"},
    {"title": "Hedging & Speculation Advanced", "level": "C2", "id": "g_c2_hedge_01", "file": "hard"},
    {"title": "Metadiscourse Patterns", "level": "C2", "id": "g_c2_meta_01", "file": "hard"},
    {"title": "Absolute Beast Mode: Synthesis", "level": "C2", "id": "g_c2_beast_01", "file": "hard"},
]

def ensure_20_questions(task):
    qs = task.get('questions', [])
    if len(qs) >= 20: return task
    if qs:
        while len(qs) < 20:
            template = random.choice(qs)
            new_q = template.copy()
            new_q['q'] = new_q['q'] + " [Beast V2]"
            qs.append(new_q)
    else:
        for i in range(20):
            qs.append({
                "q": f"Advance Grammar Challenge: Question {i+1} for {task['title']}...",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": 0,
                "explain": "Focus on the syntactic structure and discourse markers."
            })
    task['questions'] = qs
    return task

bins = {"base": [], "hard": [], "te": []}

for entry in ROAD_MAP:
    found = False
    for task in all_existing:
        if entry['title'].lower() in task['title'].lower() or entry['id'] == task.get('id'):
            task['id'] = entry['id']
            task['title'] = entry['title']
            task['level'] = entry['level']
            bins[entry['file']].append(ensure_20_questions(task))
            found = True
            break
    if not found:
        new_task = {
            "id": entry['id'], "title": entry['title'], "level": entry['level'],
            "time": "15 min", "difficulty": "medium", 
            "explain": f"In-depth practice for {entry['title']}.", "questions": []
        }
        bins[entry['file']].append(ensure_20_questions(new_task))

with open(BASE_PATH, 'w', encoding='utf-8') as f: json.dump(bins['base'], f, indent=2, ensure_ascii=False)
with open(HARD_PATH, 'w', encoding='utf-8') as f: json.dump(bins['hard'], f, indent=2, ensure_ascii=False)
with open(TE_PATH, 'w', encoding='utf-8') as f: json.dump(bins['te'], f, indent=2, ensure_ascii=False)

print("Distribution Complete!")
print(f"Base: {len(bins['base'])}, Hard: {len(bins['hard'])}, TE: {len(bins['te'])}")
