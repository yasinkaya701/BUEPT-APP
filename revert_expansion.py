import json
import os

files = [
    "data/grammar_tasks.json",
    "data/speaking_prompts.json",
    "data/reading_tasks.json",
    "data/listening_tasks.json"
]

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as infile:
            data = json.load(infile)
        
        # Filter out anything with an id containing an underscore and a number (e.g. "_1", "_2")
        filtered = [item for item in data if '_' not in str(item.get('id', '')) or not str(item.get('id', '')).split('_')[-1].isdigit()]
        
        with open(f, 'w', encoding='utf-8') as outfile:
            json.dump(filtered, outfile, indent=4)
        print(f"Restored {f} to original {len(filtered)} items.")
    except Exception as e:
        print(f"Failed on {f}: {e}")
