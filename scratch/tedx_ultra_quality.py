import json

def tedx_ultra_quality():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    # --- TEDX_004: Daphne Bavelier - Video Games (CAREFUL - Sequential) ---
    t_ted4 = next((t for t in tasks if t["id"] == "TEDX_004"), None)
    if t_ted4:
        t_ted4["questions"] = [
            {"q": "What is the first 'myth' about vision and gaming that Bavelier debunks?", "answer": ["That video games ruin your eyesight", "Screen time causes blindness"], "skill": "detail", "explain": "Sequential: First 2 minutes."},
            {"q": "According to her research, what specific visual ability is 30% better in action gamers?", "answer": ["Contrast sensitivity", "Seeing shades of gray"], "skill": "detail", "explain": "Sequential: Visual testing section."},
            {"q": "In the 'multiple object tracking' test, how many items can an average person track versus a gamer?", "answer": ["Average tracks 3 or 4; Gamer tracks 6 or 7"], "skill": "detail", "explain": "Sequential: Comparison section."},
            {"q": "Define 'attentional blink' as explained in the middle of the talk.", "answer": "The window of time where the brain 'misses' a second target because it is busy with the first", "skill": "detail", "explain": "Sequential: Cognitive science section."},
            {"q": "What region of the brain shows more efficient activation in gamers during the 'search' task?", "answer": ["The parietal lobe", "Regions governing attention"], "skill": "detail", "explain": "Sequential: Brain mapping section."},
            {"q": "Why does the speaker use the term 'Chocolate-covered broccoli'?", "answer": "To describe games that try to be educational but aren't actually fun", "skill": "detail", "explain": "Sequential: Game design section."},
            {"q": "What is the primary hurdle in using video games for clinical therapy?", "answer": ["Finding the right dose (dosage)", "Personalizing the training for patients"], "skill": "detail", "explain": "Sequential: Closing clinical application."}
        ]

    # --- TEDX_001: Susan Cain - Introverts (SELECTIVE - Synthesis) ---
    t_ted1 = next((t for t in tasks if t["id"] == "TEDX_001"), None)
    if t_ted1:
        t_ted1["questions"] = [
            {"q": "Synthesize Cain's argument about why modern architecture (open-plan offices) is detrimental to introverts.", "answer": ["It creates a 'low-level hum' of noise and constant gaze that prevents deep work"], "skill": "synthesis", "explain": "Connecting architectural design to cognitive needs."},
            {"q": "How does the speaker contrast the 'Extrovert Ideal' with the historical 'Culture of Character'?", "answer": ["Focus shifted from inner merit to external charisma and magnetism"], "skill": "synthesis", "explain": "Synthesizing the historical shift section."},
            {"q": "Explain the relationship between 'solitude' and 'creativity' as proposed in the talk.", "answer": ["Most major creative breakthroughs happen during solitary reflection, not group brainstorms"], "skill": "synthesis", "explain": "Main idea synthesis."},
            {"q": "What is the 'Stop the madness' call to action aiming to achieve in schools?", "answer": ["A balance where introverts can work independently instead of in constant groups"], "skill": "inference", "explain": "Extracting the pedagogical goal."},
            {"q": "Why does she mention her grandfather's study as an example at the end?", "answer": ["To show that one can be socially connected while still being deeply introverted"], "skill": "synthesis", "explain": "Personal narrative synthesis."}
        ]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("TEDx Ultra-Quality: Final pass complete.")

if __name__ == "__main__":
    tedx_ultra_quality()
