import json
import os

def enrich_data():
    data_dir = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data'
    curated_path = os.path.join(data_dir, 'curated_word_data.json')
    wasc_path = os.path.join(data_dir, 'wasc_vocab_lists.json')
    awl_path = os.path.join(data_dir, 'academic_wordlist.json')
    dept_path = os.path.join(data_dir, 'bogazici_department_vocab.json')

    curated = {}

    # 1. Load WASC data (High Fidelity)
    if os.path.exists(wasc_path):
        with open(wasc_path, 'r') as f:
            wasc = json.load(f)
            for l in wasc.get('lists', []):
                for entry in l.get('entries', []):
                    word = entry['word'].lower().strip()
                    if word not in curated:
                        curated[word] = {
                            "word": entry['word'],
                            "simple_definition": entry.get('definition'),
                            "examples": entry.get('examples', []),
                            "level": entry.get('level'),
                            "word_type": entry.get('word_type', 'general'),
                            "source": "WASC"
                        }

    # 2. Load Academic Word List (High Fidelity)
    if os.path.exists(awl_path):
        with open(awl_path, 'r') as f:
            awl = json.load(f)
            for entry in awl:
                word = entry['word'].lower().strip()
                if word not in curated:
                    curated[word] = {
                        "word": entry['word'],
                        "simple_definition": entry.get('definition'),
                        "examples": [entry.get('example')] if entry.get('example') else [],
                        "level": entry.get('level', 'B2'),
                        "word_type": entry.get('word_type', 'academic'),
                        "synonyms": entry.get('synonyms', []),
                        "antonyms": entry.get('antonyms', []),
                        "collocations": entry.get('collocations', []),
                        "source": "AWL"
                    }
                else:
                    # Update existing with extra data if missing
                    if not curated[word].get('synonyms'):
                        curated[word]['synonyms'] = entry.get('synonyms', [])
                    if not curated[word].get('antonyms'):
                        curated[word]['antonyms'] = entry.get('antonyms', [])
                    if not curated[word].get('collocations'):
                        curated[word]['collocations'] = entry.get('collocations', [])

    # 3. Load Dept data
    if os.path.exists(dept_path):
        with open(dept_path, 'r') as f:
            dept = json.load(f)
            for d in dept:
                for entry in d.get('words', []):
                    word = entry['word'].lower().strip()
                    if word not in curated:
                        curated[word] = {
                            "word": entry['word'],
                            "simple_definition": entry.get('definition'),
                            "examples": [entry.get('example')] if entry.get('example') else [],
                            "level": "C1",
                            "word_type": "departmental",
                            "source": f"Dept: {d.get('department')}"
                        }

    # 4. Save to curated_word_data.json
    with open(curated_path, 'w') as f:
        json.dump(curated, f, indent=2)

    print(f"Industrialized {len(curated)} words in curated_word_data.json")

if __name__ == "__main__":
    enrich_data()
