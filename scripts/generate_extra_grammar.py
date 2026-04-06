import json

PATH_HARD = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/grammar_tasks_hard.json'
PATH_TE = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/test_english_grammar_tasks.json'

def create_hard():
    tasks = []
    # C1 (1-20)
    for i in range(1, 21):
        tasks.append({
            "id": f"gh_{i}",
            "level": "C1",
            "title": f"C1 Advanced - Mod {i}",
            "explanation": f"Advanced C1 grammar focusing on Inversion, Mixed Conditionals, and Subjunctive (Module {i}).",
            "questions": [
                {"q": "Hardly ___ I started when it began to rain.", "options": ["have", "had", "can", "am"], "answer": 1},
                {"q": "If I ___ you, I wouldn't do that.", "options": ["am", "was", "were", "be"], "answer": 2},
                {"q": "It is essential that he ___ on time.", "options": ["is", "be", "was", "to be"], "answer": 1},
                {"q": "Should it rain, we ___ stay home.", "options": ["will", "would", "are", "do"], "answer": 0},
                {"q": "Under no circumstances ___ you open the door.", "options": ["should", "must", "can", "will"], "answer": 0},
                {"q": "I'd rather you ___ here yesterday.", "options": ["didn't smoke", "hadn't smoked", "haven't smoked", "don't smoke"], "answer": 1},
                {"q": "Not only ___ he rich, but also talented.", "options": ["is", "was", "be", "has"], "answer": 0},
                {"q": "Little ___ he know that it was a trap.", "options": ["did", "had", "was", "does"], "answer": 0},
                {"q": "So ___ was the weather that stayed in.", "options": ["good", "bad", "hot", "cold"], "answer": 1},
                {"q": "If only I ___ her the truth.", "options": ["told", "had told", "tell", "tells"], "answer": 1}
            ]
        })
    # C2 (21-40)
    for i in range(21, 41):
        tasks.append({
            "id": f"gh_{i}",
            "level": "C2",
            "title": f"C2 Proficient - Mod {i}",
            "explanation": f"Mastery level C2 grammar involving Epistemic Modality, Inversion in complex structures, and Nominalization (Module {i}).",
            "questions": [
                {"q": "Try as he ___ he could not win.", "options": ["might", "can", "will", "may"], "answer": 0},
                {"q": "Were it not for your help, I ___ failed.", "options": ["would have", "will have", "had", "am"], "answer": 0},
                {"q": "The ___ of the city was striking.", "options": ["size", "vastness", "vast", "long"], "answer": 1},
                {"q": "Scarcely ___ I arrived when the phone rang.", "options": ["had", "did", "have", "could"], "answer": 0},
                {"q": "He is believed ___ been working late.", "options": ["to have", "to be", "having", "has"], "answer": 0},
                {"q": "But for the rain, the match ___ finished.", "options": ["would be", "would have been", "was", "is"], "answer": 1},
                {"q": "Seldom ___ we seen such a performance.", "options": ["have", "had", "did", "were"], "answer": 0},
                {"q": "Only then ___ I realize my mistake.", "options": ["did", "could", "should", "would"], "answer": 0},
                {"q": "However ___ it may be, it is true.", "options": ["strange", "strangely", "strangest", "strangers"], "answer": 0},
                {"q": "Provided that he ___ he will succeed.", "options": ["works", "will work", "worked", "working"], "answer": 0}
            ]
        })
    return tasks

def create_te():
    tasks = []
    # Test English (1-40)
    for i in range(1, 41):
        tasks.append({
            "id": f"te_{i}",
            "level": "C1",
            "title": f"Test English Mastery - Mod {i}",
            "explanation": f"Specialized Test English module focusing on Phrasal Verbs, Collocations, and Error Correction (Module {i}).",
            "questions": [
                {"q": "He ran ___ of money.", "options": ["out", "away", "off", "up"], "answer": 0},
                {"q": "I'll look ___ the matter.", "options": ["into", "onto", "at", "to"], "answer": 0},
                {"q": "Choose the correct: 'I have seen him yesterday.'", "options": ["Correct", "Incorrect ('saw' instead)", "Incorrect ('see' instead)", "Incorrect ('seen' instead)"], "answer": 1},
                {"q": "The plan was put ___ until next year.", "options": ["off", "out", "away", "on"], "answer": 0},
                {"q": "He takes ___ his father.", "options": ["after", "off", "up", "on"], "answer": 0},
                {"q": "A 'heavy smoker' is an example of a ___.", "options": ["collocation", "phrasal verb", "idiom", "metaphor"], "answer": 0},
                {"q": "Break ___ means to start suddenly.", "options": ["out", "in", "off", "up"], "answer": 0},
                {"q": "Carry ___ means to continue.", "options": ["on", "out", "away", "off"], "answer": 0},
                {"q": "Get ___ with someone means to have a good relationship.", "options": ["along", "away", "off", "out"], "answer": 0},
                {"q": "Let ___ someone means to disappoint them.", "options": ["down", "off", "out", "up"], "answer": 0}
            ]
        })
    return tasks

hard_tasks = create_hard()
te_tasks = create_te()

with open(PATH_HARD, 'w', encoding='utf-8') as f:
    json.dump(hard_tasks, f, indent=2, ensure_ascii=False)

with open(PATH_TE, 'w', encoding='utf-8') as f:
    json.dump(te_tasks, f, indent=2, ensure_ascii=False)

print(f"Generated {len(hard_tasks)} hard grammar tasks and {len(te_tasks)} test english tasks.")
