import json
import os

def migrate_file(filepath):
    print(f"Migrating {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    migrated_count = 0
    for task in data:
        if 'questions' in task:
            for q in task['questions']:
                # Some questions might not have 'type' but have 'options' and 'answer' as int
                q_type = q.get('type', 'multiple-choice')
                if (q_type == 'multiple-choice' or 'options' in q) and q_type != 'cloze':
                    if 'options' in q and 'answer' in q:
                        ans_idx = q['answer']
                        if isinstance(ans_idx, int) and 0 <= ans_idx < len(q['options']):
                            correct_text = q['options'][ans_idx]
                            q['type'] = 'short_answer'
                            q['answer'] = [correct_text]
                            del q['options']
                            migrated_count += 1
                        elif isinstance(ans_idx, list):
                            # Already migrated or weird format
                            pass
                    elif 'options' in q and 'answer' not in q:
                        # Should not happen in valid data but let's be safe
                        del q['options']

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Done. Migrated {migrated_count} questions in {filepath}")

reading_path = "/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/reading_tasks.json"
listening_path = "/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/listening_tasks.json"

migrate_file(reading_path)
migrate_file(listening_path)
