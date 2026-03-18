import json
import os
import time
import urllib.request
import urllib.error

FILE_PATH = "BUEPTApp/data/test_english_vocab_items.json"
OUTPUT_PATH = "BUEPTApp/data/test_english_vocab_items_massive.json"

def fetch_synonyms(word):
    url = f"https://api.datamuse.com/words?rel_syn={urllib.parse.quote(word)}&max=8"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            # Extract just the words
            synonyms = [item['word'] for item in data if 'word' in item]
            return synonyms
    except Exception as e:
        print(f"Error fetching synonyms for '{word}': {e}")
        return []

def enhance_data():
    if not os.path.exists(FILE_PATH):
        print(f"Error: Could not find {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    enhancement_count = 0
    total = len(data)

    for idx, item in enumerate(data):
        word = item.get("word", "").lower().strip()
        if not word or ' ' in word: # Skip multi-word phrases for Datamuse
            continue
            
        print(f"Processing {idx+1}/{total}: {word}")
        
        existing_synonyms = item.get("synonyms", [])
        
        # Only fetch if we have very few synonyms to save time
        if len(existing_synonyms) < 6:
            new_syns = fetch_synonyms(word)
            if new_syns:
                # Merge, preserving order
                merged = existing_synonyms.copy()
                for s in new_syns:
                    if s not in merged and s != word:
                        merged.append(s)
                
                item["synonyms"] = merged
                enhancement_count += 1
                
        # Small delay to respect Datamuse API limits (100k/day, max ~10 req/sec)
        time.sleep(0.05)

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Successfully added synonyms to {enhancement_count} vocabulary items.")

if __name__ == "__main__":
    import urllib.parse # imported locally just in case
    enhance_data()
