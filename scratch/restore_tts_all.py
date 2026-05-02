import json

def restore_tts_all_csl():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    for task in tasks:
        tid = task.get("id", "")
        # Remove audioUrl from ALL CSL tasks EXCEPT TEDx to restore classic TTS mode
        if tid.startswith("CSL_") and "audioUrl" in task:
            del task["audioUrl"]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Restored Classic TTS Model for all CSL tasks (excluding TEDx).")

if __name__ == "__main__":
    restore_tts_all_csl()
