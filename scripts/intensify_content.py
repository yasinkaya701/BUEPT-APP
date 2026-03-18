import json
import os
import re

ROOT_DIR = "/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp"
DATA_DIR = os.path.join(ROOT_DIR, "data")

def intensify_text(text):
    """
    Simulates making text more 'academic' and 'hard' by:
    1. Replacing common connectors with formal ones.
    2. Slightly lengthening sentences with qualifying clauses.
    """
    replacements = {
        r'\bBut\b': 'However,',
        r'\bbut\b': 'yet',
        r'\bSo\b': 'Consequently,',
        r'\bso\b': 'thus',
        r'\bAnd\b': 'Furthermore,',
        r'\balso\b': 'moreover',
        r'\bimportant\b': 'pivotal',
        r'\bvery\b': 'exceptionally',
        r'\bgood\b': 'advantageous',
        r'\bbad\b': 'detrimental',
        r'\blike\b': 'such as',
        r'\bshow\b': 'illustrate',
        r'\bthink\b': 'postulate',
    }
    
    intensified = text
    for old, new in replacements.items():
        intensified = re.sub(old, new, intensified)
    
    return intensified

def upgrade_vocab():
    path = os.path.join(DATA_DIR, "test_english_vocab_items.json")
    if not os.path.exists(path): return
    
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    count = 0
    for item in data:
        # Move B2 to C1, C1 to C2
        if item.get('level') == 'B2':
            item['level'] = 'C1'
            count += 1
        elif item.get('level') == 'C1':
            item['level'] = 'C2'
            count += 1
            
        # Intensify definition and examples
        if 'simple_definition' in item:
            item['simple_definition'] = intensify_text(item['simple_definition'])
        if 'examples' in item:
            item['examples'] = [intensify_text(ex) for ex in item['examples']]
            
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Upgraded {count} vocab items to C1/C2 levels.")

def upgrade_reading_listening():
    files = ["reading_tasks.json", "listening_tasks.json"]
    for filename in files:
        path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(path): continue
        
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        count = 0
        for task in data:
            # Shift levels to Hard
            if task.get('level', '').startswith('P'):
                # P1..P5 are already practice, but we can make them 'C1/C2'
                task['level'] = 'C1' if task['level'] in ['P1','P2'] else 'C2'
                count += 1
            
            # Intensify content
            if 'content' in task:
                task['content'] = intensify_text(task['content'])
            
            # Intensify questions and explanations
            if 'questions' in task:
                for q in task['questions']:
                    if 'question' in q:
                        q['question'] = intensify_text(q['question'])
                    if 'explanation' in q:
                        q['explanation'] = intensify_text(q['explanation'])
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Intensified {count} tasks in {filename}.")

if __name__ == "__main__":
    print("Starting Content Intensity Upgrade...")
    upgrade_vocab()
    upgrade_reading_listening()
    print("Done.")
