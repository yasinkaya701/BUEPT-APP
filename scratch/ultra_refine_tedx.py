import json

def ultra_refine_tedx():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    # --- TEDX_001: Susan Cain (Selective) ---
    t1 = next((t for t in tasks if t["id"] == "TEDX_001"), None)
    if t1:
        t1["questions"] = [
            {"q": "What is the 'Extrovert Ideal' and how does it manifest in modern workplaces?", "answer": ["The belief that the ideal person is gregarious, alpha, and comfortable in the spotlight"], "skill": "main_idea", "explain": "Synthesis of the intro argument."},
            {"q": "Contrast 'shyness' with 'introversion' as defined by the speaker.", "answer": ["Shyness is fear of social judgment; introversion is a preference for low-stimulation environments"], "skill": "synthesis", "explain": "Defining core terminology."},
            {"q": "Why does Cain argue that 'solitude' is a prerequisite for creativity?", "answer": ["Deep work and major breakthroughs (like Wozniak's) require solitary reflection"], "skill": "synthesis", "explain": "Synthesizing the creativity section."},
            {"q": "What was the 'Culture of Character' and why did it shift to a 'Culture of Personality'?", "answer": ["Character focused on inner merit; Personality focused on charisma and external magnetism"], "skill": "synthesis", "explain": "Synthesizing the historical context."},
            {"q": "Explain the concept of 'Groupthink' and why it is a risk in brainstorming sessions.", "answer": ["People tend to mimic the loudest voices rather than the best ideas"], "skill": "inference", "explain": "Synthesizing the business critique."},
            {"q": "What is the significance of the speaker's grandfather's library in her conclusion?", "answer": ["It represents a life of quiet connection and deep intellectual service"], "skill": "synthesis", "explain": "Synthesizing the final metaphor."},
            {"q": "What are the three 'calls to action' for the audience at the end of the talk?", "answer": ["Stop the madness for group work, go to the wilderness (solitude), and look inside your own suitcase"], "skill": "synthesis", "explain": "Summary of closing recommendations."}
        ]

    # --- TEDX_003: Daniel Levitin (Careful) ---
    t3 = next((t for t in tasks if t["id"] == "TEDX_003"), None)
    if t3:
        t3["questions"] = [
            {"q": "Describe the incident at the speaker's front door that sets the stage for the talk.", "answer": ["He broke into his own house with a rock during a snowy night"], "skill": "detail", "explain": "Sequential: Intro story."},
            {"q": "Who pioneered the concept of the 'Pre-mortem' and what is its goal?", "answer": ["Gary Klein; to think about failure before it happens"], "skill": "detail", "explain": "Sequential: Core concept."},
            {"q": "What effect does cortisol have on the brain's prefrontal cortex?", "answer": ["It impairs rational thinking and disrupts the hippocampus"], "skill": "detail", "explain": "Sequential: Biological impact."},
            {"q": "Explain the 'designated place' rule for preventing stress.", "answer": ["Always keeping essential items (like keys) in the same spot"], "skill": "detail", "explain": "Sequential: Practical tip."},
            {"q": "What is the 'NNT' (Number Needed to Treat) in medical statistics?", "answer": ["The number of people who must take a drug for one person to benefit"], "skill": "detail", "explain": "Sequential: Technical detail."},
            {"q": "If a statin has an NNT of 300, what does this imply for a single patient?", "answer": ["They have a 1 in 300 chance of actually being helped by the drug"], "skill": "detail", "explain": "Sequential: Statistical application."},
            {"q": "What question should a patient ask about the 'worst-case scenario' of a surgery?", "answer": ["What is the outcome if I do nothing (the 'base case')?"], "skill": "detail", "explain": "Sequential: Decision-making advice."},
            {"q": "Why does the speaker argue that we are 'incapable of rational thinking' under stress?", "answer": ["Evolution has hard-wired us for survival-based reactions over logic"], "skill": "detail", "explain": "Sequential: Theoretical basis."},
            {"q": "What is the ultimate purpose of the 'pre-mortem' regarding the 'designated place'?", "answer": ["To move stressful tasks from the prefrontal cortex to the procedural memory"], "skill": "detail", "explain": "Sequential: Neurological goal."}
        ]

    # --- TEDX_004: Daphne Bavelier (Careful) ---
    t4 = next((t for t in tasks if t["id"] == "TEDX_004"), None)
    if t4:
        t4["questions"] = [
            {"q": "What is the first 'myth' about video games and vision that she debunks?", "answer": ["That video games ruin your eyesight"], "skill": "detail", "explain": "Sequential: Myth-busting section."},
            {"q": "What specific visual skill is 30% better in gamers according to her tests?", "answer": ["Contrast sensitivity (seeing shades of gray)"], "skill": "detail", "explain": "Sequential: First data point."},
            {"q": "In the 'multiple object tracking' test, how many dots can a gamer track simultaneously?", "answer": ["6 or 7 dots"], "skill": "detail", "explain": "Sequential: Tracking section."},
            {"q": "Define the 'attentional blink' and its results in gamers.", "answer": ["The delay in noticing a second target; gamers have a much smaller blink"], "skill": "detail", "explain": "Sequential: Attention section."},
            {"q": "Which part of the brain (the 'attention commander') shows more efficiency in gamers?", "answer": ["The parietal lobe"], "skill": "detail", "explain": "Sequential: Neuroscience section."},
            {"q": "What does the 'Chocolate-covered broccoli' metaphor describe in game design?", "answer": ["Educational games that are boring because they aren't fun"], "skill": "detail", "explain": "Sequential: Design critique."},
            {"q": "What is the 'dosage' hurdle in using games for medical therapy?", "answer": ["Finding the exact amount of gaming needed for a clinical effect"], "skill": "detail", "explain": "Sequential: Closing challenge."}
        ]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Ultra-refined TEDx questions and restored TTS for MEGA samples.")

if __name__ == "__main__":
    ultra_refine_tedx()
