import json

def restore_tts_for_samples():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    for task in tasks:
        tid = task.get("id", "")
        # Remove audioUrl from MEGA samples to restore classic TTS mode
        if tid.startswith("CSL_MEGA_") and "audioUrl" in task:
            del task["audioUrl"]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Restored Classic TTS Model for Real BUEPT Level tasks.")

if __name__ == "__main__":
    restore_tts_for_samples()
