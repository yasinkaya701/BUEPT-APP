import json
import os

filepath = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/grammar_tasks.json'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_items = [
    {
        "id": "g_p1_03",
        "level": "P1",
        "title": "Present Simple vs Present Continuous",
        "time": "7 min",
        "explain": "Use the Present Simple for routines, habits, and general facts.",
        "questions": [
            {
                "q": "I ___ (study) English every morning.",
                "options": ["study", "am studying", "studies", "studying"],
                "answer": 0
            }
        ],
        "difficulty": "easy"
    }
]

# Just full definitions from before, let's paste the big ones.
