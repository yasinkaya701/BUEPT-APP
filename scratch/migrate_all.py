import json
import os

def migrate_question(q):
    # If q has 'options' and 'answer' is an int, migrate it
    if 'options' in q and isinstance(q.get('answer'), int):
        # Don't migrate cloze questions if they have a specific type
        if q.get('type') == 'cloze':
            return
        
        ans_idx = q['answer']
        if 0 <= ans_idx < len(q['options']):
            correct_text = q['options'][ans_idx]
            q['type'] = 'short_answer'
            q['answer'] = [correct_text]
            del q['options']
            # Also handle 'similar' if it exists
            if 'similar' in q and isinstance(q['similar'], dict):
                migrate_question(q['similar'])
            return True
    return False

def recursive_migrate(obj):
    count = 0
    if isinstance(obj, list):
        for item in obj:
            count += recursive_migrate(item)
    elif isinstance(obj, dict):
        if 'q' in obj and ('options' in obj or 'answer' in obj):
            if migrate_question(obj):
                count += 1
        else:
            for key, value in obj.items():
                count += recursive_migrate(value)
    return count

def migrate_file(filepath):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (not found)")
        return
    
    print(f"Migrating {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"Error loading {filepath}: {e}")
            return

    migrated_count = recursive_migrate(data)

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Done. Migrated {migrated_count} questions in {filepath}")

data_dir = "/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data"
files_to_migrate = [
    "reading_tasks.json",
    "listening_tasks.json",
    "grammar_tasks.json",
    "reading_tasks_hard.json",
    "listening_tasks_hard.json",
    "grammar_tasks_hard.json",
    "buept_exams.json",
    "mock_exams.json",
    "placement_tasks.json",
    "test_english_grammar_tasks.json"
]

for filename in files_to_migrate:
    migrate_file(os.path.join(data_dir, filename))
