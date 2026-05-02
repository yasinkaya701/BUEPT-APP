import json

def ultra_industrial_listening():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    # --- CSL_MEGA_002: Industrial Sociology (CAREFUL - Sequential) ---
    t002 = next((t for t in tasks if t["id"] == "CSL_MEGA_002"), None)
    if t002:
        t002["questions"] = [
            {"q": "According to the intro, what is the most transformative event since agriculture?", "answer": "The Industrial Revolution", "explain": "Sequential: First 2 minutes."},
            {"q": "What was the 'primary unit of production' before the factory system?", "answer": "The family", "explain": "Sequential: Domestic system description."},
            {"q": "Why was early labor called 'task-oriented'?", "answer": "You worked until the task was done, dictated by sun/seasons", "explain": "Sequential: Pre-industrial rhythm."},
            {"q": "What invention by James Watt forced workers to be brought to a central location?", "answer": "Improved steam engine", "explain": "Sequential: Technological catalyst."},
            {"q": "By 1850, what percentage of the British population lived in cities?", "answer": "50 percent", "explain": "Sequential: Urbanization statistics."},
            {"q": "What was the average age of death for a laborer in Liverpool in the 1840s?", "answer": "Fifteen years", "explain": "Sequential: Slum conditions."},
            {"q": "Define the sociological term 'industrial discipline'.", "answer": "The training of the human body to behave like a machine", "explain": "Sequential: Behavioral shift."},
            {"q": "How did Frederick Taylor determine the 'one best way' to perform a task?", "answer": "Using stopwatches to measure every movement", "explain": "Sequential: Scientific Management."},
            {"q": "Why were children as young as five sent into coal mines?", "answer": "Small size allowed them to crawl into narrow shafts", "explain": "Sequential: Child labor specifics."},
            {"q": "What is Max Weber's 'Iron Cage' a metaphor for?", "answer": "The trapping of humanity in cold, calculated logic and bureaucracy", "explain": "Sequential: Closing sociological theory."}
        ]

    # --- CSL_MEGA_005: Roman Collapse (CAREFUL - Sequential) ---
    t005 = next((t for t in tasks if t["id"] == "CSL_MEGA_005"), None)
    if t005:
        t005["questions"] = [
            {"q": "What was the silver purity of the Denarius under Augustus?", "answer": "95 percent", "explain": "Sequential: Starting purity."},
            {"q": "What was the single largest expense for the Roman Empire?", "answer": "Maintaining the professional standing army", "explain": "Sequential: Budgetary constraints."},
            {"q": "Who was the first Emperor to begin currency debasement?", "answer": "Nero", "explain": "Sequential: Origin of the policy."},
            {"q": "By the mid-third century, what was the silver percentage in a coin?", "answer": "Less than 5 percent", "explain": "Sequential: Peak debasement."},
            {"q": "How did merchants react to the loss of coin value?", "answer": "Raised prices to compensate (Hyperinflation)", "explain": "Sequential: Market response."},
            {"q": "What does 'taxation in kind' mean?", "answer": "Collecting taxes as grain or livestock instead of money", "explain": "Sequential: State's desperate measures."},
            {"q": "Why did citizens flee to the 'Latifundia'?", "answer": "For protection and food in exchange for labor", "explain": "Sequential: Rural migration."},
            {"q": "What was the penalty for violating Diocletian's 'Price Edict'?", "answer": "Death", "explain": "Sequential: Administrative force."},
            {"q": "How did Diocletian try to ensure a steady labor supply?", "answer": "Forced children to follow their fathers' professions", "explain": "Sequential: Social caste system."},
            {"q": "What does 'Gresham's Law' state regarding the Roman collapse?", "answer": "Bad money drives out good", "explain": "Sequential: Closing economic principle."}
        ]

    # --- TEDX_003: Daniel Levitin - Calm (CAREFUL - Sequential) ---
    t_ted3 = next((t for t in tasks if t["id"] == "TEDX_003"), None)
    if t_ted3:
        t_ted3["questions"] = [
            {"q": "What is the 'Pre-mortem' technique based on?", "answer": "Thinking ahead about what could go wrong and planning for it", "explain": "Sequential: Intro definition."},
            {"q": "What hormone drives the 'fight or flight' response?", "answer": "Cortisol", "explain": "Sequential: Biological basis."},
            {"q": "What is the specific benefit of having a 'designated place' for items like keys?", "answer": ["It prevents the release of cortisol during stress", "It saves time and brain power"], "explain": "Sequential: Practical example."},
            {"q": "Why does stress impair our 'rational' thinking?", "answer": "The brain's survival mechanisms take over the prefrontal cortex", "explain": "Sequential: Middle theory."},
            {"q": "What question should you ask your doctor to understand the risks of a procedure?", "answer": ["What is the 'number needed to treat' (NNT)?", "What are the statistics for success?"], "explain": "Sequential: Closing medical advice."}
        ]

    # --- CSL_MEGA_001: Quantum (SELECTIVE - Synthesis) ---
    t001 = next((t for t in tasks if t["id"] == "CSL_MEGA_001"), None)
    if t001:
        t001["questions"] = [
            {"q": "Why is quantum computing considered a 'paradigm shift' rather than just an improvement?", "answer": ["It uses subatomic laws to solve problems classical bits cannot handle"], "skill": "main_idea", "explain": "Synthesizing the intro argument."},
            {"q": "Explain the 'sphere' analogy used to contrast bits and qubits.", "answer": ["Bits are fixed at the poles; qubits can be anywhere on the surface (superposition)"], "skill": "synthesis", "explain": "Synthesizing the mechanical difference."},
            {"q": "What is the significance of the year 1994 in the history of cryptography?", "answer": ["Shor's Algorithm proved that RSA could be broken by quantum computers"], "skill": "synthesis", "explain": "Connecting math to security history."},
            {"q": "How does 'Quantum Interference' function like noise-canceling headphones?", "answer": ["It amplifies the correct answer and cancels out the incorrect paths"], "skill": "synthesis", "explain": "Analogy synthesis."},
            {"q": "Why is 'Quantum Error Correction' (QEC) the 'bottleneck' for scalability?", "answer": ["It requires millions of physical qubits to protect one logical qubit"], "skill": "synthesis", "explain": "Engineering barrier synthesis."},
            {"q": "Discuss the 'dark side' of quantum computing as described in the lecture.", "answer": ["National security risks and 'Harvest Now, Decrypt Later' strategies"], "skill": "inference", "explain": "Extracting the geopolitical theme."},
            {"q": "What is the 'Quantum Internet' and why is it theoretically unhackable?", "answer": ["Entangled photons change state if observed, alerting the users"], "skill": "synthesis", "explain": "Future technology synthesis."}
        ]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Ultra-Industrialized all listening tasks: Precise sequential details for Careful, Deep synthesis for Selective.")

if __name__ == "__main__":
    ultra_industrial_listening()
