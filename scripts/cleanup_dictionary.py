import json
import os
import re

DATA_DIR = "/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data"
DICT_PATH = os.path.join(DATA_DIR, "dictionary_subset.json")
BACKUP_PATH = os.path.join(DATA_DIR, "dictionary_subset_backup.json")

# Forbidden scientific/rare patterns from WordNet noise
BANNED_PATTERNS = [
    r"atomic number \d+",
    r"rare soft silvery metallic element",
    r"nonmetallic element belonging to the halogens",
    r"biochemistry\) purine base",
    r"chemical element",
    r"radioactive element",
    r"isotope",
    r"genus",
    r"family [A-Z][a-z]+",
    r"species of",
    r"native to [A-Z][a-z]+",
    r"dialectal fragment",
    r"obsolete variant",
    r"archaic",
]

# Words that should NEVER be scientific nouns in an academic prep app
TOP_FUNCTION_WORDS = {
    "a", "an", "the", "in", "on", "at", "by", "for", "with", "about", "against", "between",
    "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "can", "could", "will", "would", "shall", "should", "may", "might", "must",
    "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
    "my", "your", "his", "its", "our", "their",
    "this", "that", "these", "those",
    "which", "who", "whom", "whose", "what", "where", "when", "why", "how",
    "all", "any", "some", "every", "each", "both", "neither", "either", "none",
}

def cleanup():
    if not os.path.exists(DICT_PATH):
        print(f"Error: {DICT_PATH} not found.")
        return

    print(f"Reading {DICT_PATH}...")
    with open(DICT_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Original size: {len(data)} entries.")
    
    cleaned = []
    removed_count = 0
    
    banned_re = [re.compile(p, re.IGNORECASE) for p in BANNED_PATTERNS]

    for item in data:
        word = item.get("word", "").lower().strip()
        defn = item.get("simple_definition", "")
        
        # 1. Drop single/double characters that aren't specific academic entries
        if len(word) < 3 and word not in ["of", "as", "at", "by", "if", "in", "is", "it", "no", "on", "or", "so", "to", "up", "us"]:
            removed_count += 1
            continue

        # 2. Block scientific noise for function words
        if word in TOP_FUNCTION_WORDS:
            removed_count += 1
            continue

        # 3. Check for banned patterns in definition
        is_noisy = False
        for pattern in banned_re:
            if pattern.search(defn):
                is_noisy = True
                break
        
        if is_noisy:
            removed_count += 1
            continue

        # 4. Filter obvious non-human-readable metadata entries
        if not re.match(r"^[a-z -]+$", word):
            removed_count += 1
            continue

        cleaned.append(item)

    # Save backup
    if not os.path.exists(BACKUP_PATH):
        print(f"Creating backup at {BACKUP_PATH}...")
        os.rename(DICT_PATH, BACKUP_PATH)
    
    print(f"Saving {len(cleaned)} cleaned entries (Removed {removed_count}).")
    with open(DICT_PATH, 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)
    
    print("Cleanup complete.")

if __name__ == "__main__":
    cleanup()
