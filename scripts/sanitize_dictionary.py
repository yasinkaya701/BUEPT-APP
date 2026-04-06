import json
import re

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/dictionary_subset.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Words that often get hijacked by technical senses/abbreviations
CLEAN_FIXES = {
    "as": {
        "word_type": "adverb, conjunction",
        "simple_definition": "to the same degree or amount; in the way that",
        "synonyms": ["equally", "similarly", "like", "while"],
    },
    "or": {
        "word_type": "conjunction",
        "simple_definition": "used to link alternatives",
        "synonyms": ["otherwise", "either"],
    },
    "so": {
        "word_type": "adverb, conjunction",
        "simple_definition": "to such a great extent; therefore",
        "synonyms": ["therefore", "consequently", "hence", "thus"],
    },
    "if": {
        "word_type": "conjunction",
        "simple_definition": "on the condition that; provided that",
        "synonyms": ["provided", "supposing", "whenever"],
    },
    "one": {
        "word_type": "noun, adjective",
        "simple_definition": "the number 1; a single person or thing",
        "synonyms": ["single", "individual", "sole"],
    },
    "it": {
        "word_type": "pronoun",
        "simple_definition": "used to refer to a thing previously mentioned",
        "synonyms": [],
    },
}

def guess_pos(word):
    w = word.lower()
    if w.endswith('ly'): return 'adverb'
    if any(w.endswith(s) for s in ['ous', 'ive', 'able', 'ible', 'ical', 'ful', 'less']): return 'adjective'
    if any(w.endswith(s) for s in ['tion', 'sion', 'ment', 'ness', 'ity', 'ism', 'ance', 'ence']): return 'noun'
    if any(w.endswith(s) for s in ['ize', 'ise', 'ify', 'ate']): return 'verb'
    return 'noun'

def sanitize_entry(entry):
    word = entry.get('word', '').lower()
    
    # 1. Apply manual fixes for common function words
    if word in CLEAN_FIXES:
        fix = CLEAN_FIXES[word]
        entry['word_type'] = fix['word_type']
        entry['simple_definition'] = fix['simple_definition']
        entry['synonyms'] = fix['synonyms']
        return entry

    # 2. Clean word_type
    wt = entry.get('word_type', '').lower()
    # Remove technical jargon like "chemical symbol", "abbreviation", etc.
    if "chemical symbol" in entry.get('simple_definition', '').lower() or "abbreviation" in wt:
        # If it's a very common word, we already fixed it above. 
        # For others, we might want to flag them if they are nonsense.
        pass

    # 3. Filter Synonyms strictly
    # Remove synonyms with underscores, numbers, or non-alpha (except hyphens)
    # Remove synonyms that are exactly the same as the word
    pos = guess_pos(word)
    new_syns = []
    seen = set()
    for s in entry.get('synonyms', []):
        s_clean = s.lower().replace('_', ' ')
        if s_clean == word: continue
        if not re.match(r'^[a-z][a-z\s-]*$', s_clean): continue
        if s_clean in seen: continue
        
        # Simple POS check for synonyms
        s_pos = guess_pos(s_clean.split()[-1]) # Check last word if multi-word
        # If headword is adjective, synonym should look like adjective or be in data
        # For now, just remove absolute junk
        new_syns.append(s_clean)
        seen.add(s_clean)
    
    entry['synonyms'] = new_syns[:8]
    
    # 4. Clean Definition
    # Remove "a United States territory..." etc for common words if seen
    bad_def_markers = ["chemical element", "atomic number", "unit of", "abbreviation for", "capital of"]
    if any(m in entry.get('simple_definition', '').lower() for m in bad_def_markers):
        if len(word) < 4: # Small words with heavy tech defs are usually noisy
            entry['simple_definition'] = "" # dictionary.js will fallback or hide
            
    return entry

new_data = []
for e in data:
    sanitized = sanitize_entry(e)
    # Keep only if it has a definition or is a common word
    if sanitized.get('simple_definition') or sanitized.get('word') in CLEAN_FIXES:
        new_data.append(sanitized)

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(new_data, f, indent=2, ensure_ascii=False)

print(f"Sanitized {len(data)} -> {len(new_data)} entries.")
