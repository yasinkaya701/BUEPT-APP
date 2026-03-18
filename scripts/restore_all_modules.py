import json
import os
import re

# Paths
DATA_DIR = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data'
ROOT_DIR = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp'

FILES = {
    'reading': 'reading_tasks.json',
    'listening': 'listening_tasks.json',
    'speaking': 'speaking_prompts.json',
    'writing': 'writing_prompts.json',
    'reading_hard': 'reading_tasks_hard.json',
    'listening_hard': 'listening_tasks_hard.json'
}

def extract_from_py(filepath, var_name):
    if not os.path.exists(filepath): return []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find the start of the list
        start_marker = f'{var_name} = ['
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
        
        if end_idx != -1:
            json_str = content[start_idx:end_idx]
            return eval(json_str)
    except Exception as e:
        print(f"Error extracting from {filepath}: {e}")
    return []

def extract_from_js(filepath, var_name):
    if not os.path.exists(filepath): return []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
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
        
        if end_idx != -1:
            json_str = content[start_idx:end_idx]
            # Clean comments
            json_str = re.sub(r'//.*', '', json_str)
            # Fix trailing commas
            json_str = re.sub(r',\s*\]', ']', json_str)
            json_str = re.sub(r',\s*\}', '}', json_str)
            return json.loads(json_str)
    except Exception as e:
        print(f"Error extracting from {filepath}: {e}")
    return []

def merge_and_save(module_name, targets):
    target_path = os.path.join(DATA_DIR, FILES[module_name])
    
    # Load current
    if os.path.exists(target_path):
        with open(target_path, 'r', encoding='utf-8') as f:
            current_data = json.load(f)
    else:
        current_data = []

    seen_ids = {item['id'] for item in current_data if 'id' in item}
    
    added_count = 0
    for source_items in targets:
        for item in source_items:
            if 'id' in item and item['id'] not in seen_ids:
                current_data.append(item)
                seen_ids.add(item['id'])
                added_count += 1
    
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(current_data, f, indent=4, ensure_ascii=False)
    
    print(f"[{module_name}] Added {added_count} items. Total: {len(current_data)}")

# 1. READING
def load_json_list(path):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# Collect IDs from specialized files to avoid duplicating them in the base file
reading_hard = load_json_list(os.path.join(DATA_DIR, 'reading_tasks_hard.json'))
reading_cloze = load_json_list(os.path.join(DATA_DIR, 'reading_cloze.json'))
exclude_reading = {item['id'] for item in reading_hard} | {item['id'] for item in reading_cloze}

reading_sources = [
    extract_from_py(os.path.join(ROOT_DIR, 'generate_reading.py'), 'reading_tasks'),
    extract_from_js(os.path.join(ROOT_DIR, 'add_academic_items.js'), 'newReadingTasks'),
    extract_from_py(os.path.join(DATA_DIR, 'expand_reading.py'), 'new_items')
]
# Filter out anything already in hard/cloze files
reading_sources = [[item for item in src if item['id'] not in exclude_reading] for src in reading_sources]
merge_and_save('reading', reading_sources)

# 2. LISTENING
listening_hard = load_json_list(os.path.join(DATA_DIR, 'listening_tasks_hard.json'))
# Note: Podcasts use a different format/file so no direct conflict usually, but let's be safe if they ever overlap IDs
exclude_listening = {item['id'] for item in listening_hard}

listening_sources = [
    extract_from_py(os.path.join(ROOT_DIR, 'generate_listening.py'), 'listening_tasks'),
    extract_from_js(os.path.join(ROOT_DIR, 'add_academic_items.js'), 'newListeningTasks')
]
# Filter out anything already in hard file
listening_sources = [[item for item in src if item['id'] not in exclude_listening] for src in listening_sources]
merge_and_save('listening', listening_sources)

# 3. SPEAKING
speaking_sources = [
    extract_from_py(os.path.join(ROOT_DIR, 'generate_speaking.py'), 'speaking_prompts'),
    extract_from_py(os.path.join(DATA_DIR, 'expand_speaking.py'), 'new_items')
]
merge_and_save('speaking', speaking_sources)

# 4. WRITING
writing_sources = [
    extract_from_py(os.path.join(DATA_DIR, 'expand_writing.py'), 'new_items')
]
merge_and_save('writing', writing_sources)
