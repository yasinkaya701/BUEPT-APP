import json
import os

# Paths
GRAMMAR_JSON = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/grammar_tasks.json'
EXPAND_P1_P4 = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/expand_grammar.py'
EXPAND_ALL_TMP = '/tmp/expand_grammar_all.py'
ACADEMIC_JS = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/add_academic_items.js'
EXPLAIN_PY = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/update_grammar_explain.py'

def extract_from_py(filepath, list_name='new_items'):
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Simple extraction for known script structures
    start_marker = f'{list_name} = ['
    if start_marker not in content:
        return []
    
    start_idx = content.find(start_marker) + len(start_marker) - 1
    # We need to find the matching closing bracket
    bracket_count = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '[': bracket_count += 1
        elif content[i] == ']':
            bracket_count -= 1
            if bracket_count == 0:
                end_idx = i + 1
                break
    
    if end_idx == -1: return []
    
    json_str = content[start_idx:end_idx]
    # Clean up some python-isms if needed (though usually they are just JSON strings)
    # But here they are literal python lists. We might need a safer way.
    # Let's try to eval it for simplicity since we know the content.
    try:
        data = eval(json_str)
        return data
    except:
        return []

def extract_from_js(filepath, var_name='newGrammarTasks'):
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r') as f:
        content = f.read()
    
    start_marker = f'const {var_name} = ['
    if start_marker not in content: return []
    
    start_idx = content.find(start_marker) + len(start_marker) - 1
    bracket_count = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '[': bracket_count += 1
        elif content[i] == ']':
            bracket_count -= 1
            if bracket_count == 0:
                end_idx = i + 1
                break
    
    if end_idx == -1: return []
    
    json_str = content[start_idx:end_idx]
    # JS sometimes has trailing commas or different quotes, but this is simple JSON-like
    try:
        # Replace JS comments if any
        import re
        json_str = re.sub(r'//.*', '', json_str)
        # Handle trailing commas which JSON doesn't like but JS does
        json_str = re.sub(r',\s*\]', ']', json_str)
        json_str = re.sub(r',\s*\}', '}', json_str)
        return json.loads(json_str)
    except:
        return []

# 1. Start with current grammar_tasks.json (standalone items)
with open(GRAMMAR_JSON, 'r') as f:
    current_data = json.load(f)

# Group existing standalone questions into a module
intensive_module = {
    "id": "g_intensive_01",
    "level": "C1/P4",
    "title": "BUEPT Intensive Practice: Mixed Advanced Rules",
    "time": "15 min",
    "difficulty": "hard",
    "explain": "A high-intensity collection of advanced grammar points including inversion, mixed conditionals, and participle clauses. This module is designed for final-stage P4 preparation.",
    "questions": []
}

for item in current_data:
    if 'question' in item:
        intensive_module['questions'].append({
            "q": item['question'],
            "options": item['options'],
            "answer": item['correctIndex'],
            "explain": item.get('explanation', ''),
            "translation": item.get('translation', '')
        })

restored_data = [intensive_module]

# 2. Add from expand_grammar.py
restored_data.extend(extract_from_py(EXPAND_P1_P4))

# 3. Add from tmp/expand_grammar_all.py
restored_data.extend(extract_from_py(EXPAND_ALL_TMP))

# 4. Add from add_academic_items.js
restored_data.extend(extract_from_js(ACADEMIC_JS))

# 5. Handle missing modules (g_p3_04 to g_p3_08)
# I will generate these manually or look for them.
# For now, let's just make sure we don't have duplicates
final_data = []
seen_ids = set()
for item in restored_data:
    if item['id'] not in seen_ids:
        final_data.append(item)
        seen_ids.add(item['id'])

# Save
with open(GRAMMAR_JSON, 'w', encoding='utf-8') as f:
    json.dump(final_data, f, indent=4, ensure_ascii=False)

print(f"Restoration complete. {len(final_data)} modules saved to {GRAMMAR_JSON}.")
