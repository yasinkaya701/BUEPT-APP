import json

def add_audio_to_samples():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    audio_map = {
        "CSL_MEGA_001": "https://www.youtube.com/watch?v=QuR969uMICM", # Quantum Intro
        "CSL_MEGA_002": "https://www.youtube.com/watch?v=zhL5DCizj5c", # Industrial Soc
        "CSL_MEGA_003": "https://www.youtube.com/watch?v=G9nO0nUv72A", # CRISPR
        "CSL_MEGA_004": "https://www.youtube.com/watch?v=fvgG-pxlobk", # Anthropocene
        "CSL_MEGA_005": "https://www.youtube.com/watch?v=Xn72a7U_G4M", # Roman Econ
        "CSL_MEGA_006": "https://www.youtube.com/watch?v=nE8S79f8yA8", # Language Roots
        "CSL_MEGA_007": "https://www.youtube.com/watch?v=6U_X1m7vK_U"  # Perovskites
    }

    for task in tasks:
        tid = task.get("id")
        if tid in audio_map:
            task["audioUrl"] = audio_map[tid]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Added Real Audio URLs to all Mega Samples.")

if __name__ == "__main__":
    add_audio_to_samples()
