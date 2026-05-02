import json

def bueptify_samples():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    for task in tasks:
        tid = task.get("id", "")
        if not tid.startswith("CSL_MEGA_"):
            continue
            
        is_careful = task.get("type") == "careful"
        
        if is_careful:
            # --- CAREFUL: SEQUENTIAL & DETAIL-ORIENTED ---
            if tid == "CSL_MEGA_002": # Industrial Sociology
                task["questions"] = [
                    {"q": "What was the dominant rhythm of life before the Industrial Revolution?", "answer": ["The sun and the seasons", "Natural cycles"], "explain": "Sequential: Mentioned in the agrarian section."},
                    {"q": "Define the 'domestic system' or 'cottage industry'.", "answer": "Production centered in the home or village workshop", "explain": "Sequential: Pre-factory era description."},
                    {"q": "What was the primary unit of production in the domestic system?", "answer": "The family", "explain": "Sequential: Family-based labor vs factory labor."},
                    {"q": "Name the specific invention by James Watt that allowed factories to expand.", "answer": "Improved steam engine", "explain": "Sequential: Technological catalyst."},
                    {"q": "What sociological change occurred regarding the 'private' and 'public' spheres?", "answer": "The total separation of the home from the work environment", "explain": "Sequential: Fundamental social shift."},
                    {"q": "By 1850, what percentage of the British population lived in urban areas?", "answer": "50 percent", "explain": "Sequential: Urbanization data point."},
                    {"q": "In Liverpool during the 1840s, what was the average life expectancy for a laborer?", "answer": "Fifteen years", "explain": "Sequential: Health impact detail."},
                    {"q": "What did sociologists call the training of the human body to behave like a machine?", "answer": "Industrial discipline", "explain": "Sequential: Behavioral training."},
                    {"q": "Explain Frederick Taylor's 'one best way' theory.", "answer": "Using stopwatches to eliminate wasted motion and maximize efficiency", "explain": "Sequential: Scientific Management."},
                    {"q": "According to the lecture, why were women and children often preferred as factory laborers?", "answer": ["Cheaper and perceived as more docile/easier to discipline", "Low cost and submissive"], "explain": "Sequential: Labor market selection."}
                ]
            elif tid == "CSL_MEGA_004": # Anthropocene
                task["questions"] = [
                    {"q": "What does the Greek root 'Anthropos' literally translate to?", "answer": "Human", "explain": "Sequential: Intro etymology."},
                    {"q": "How long was the 'Holocene' period of climate stability?", "answer": "11,700 years", "explain": "Sequential: Preceding epoch stats."},
                    {"q": "What year marks the beginning of the 'Great Acceleration'?", "answer": "1950", "explain": "Sequential: Modern timeline marker."},
                    {"q": "What specific radioactive isotope is used as a 'Golden Spike' for the year 1950?", "answer": ["Plutonium-239", "Plutonium"], "explain": "Sequential: Nuclear marker."},
                    {"q": "What are 'Technofossils'?", "answer": "Human-made materials like plastic and concrete preserved in rocks", "explain": "Sequential: Geological evidence."},
                    {"q": "What is the result of the 'Haber-Bosch Process' in the environment?", "answer": ["Doubling of reactive nitrogen", "Synthetic fertilizer production"], "explain": "Sequential: Nitrogen cycle disruption."},
                    {"q": "Define 'Anthroturbation'.", "answer": "Human-driven churning of soil through mining and construction", "explain": "Sequential: Sediment movement."},
                    {"q": "Why is the current era called the 'Sixth Mass Extinction'?", "answer": "It is driven by a single species (humans) rather than natural disasters", "explain": "Sequential: Biodiversity loss."},
                    {"q": "What is the current atmospheric CO2 level mentioned in the talk?", "answer": "420 ppm", "explain": "Sequential: Climate data point."},
                    {"q": "What is the 'Planetary Boundaries' framework?", "answer": "A set of limits for safe human operation in Earth's systems", "explain": "Sequential: Policy framework."}
                ]
        else:
            # --- SELECTIVE: NON-SEQUENTIAL, SYNTHESIS, MAIN IDEA ---
            if tid == "CSL_MEGA_001": # Quantum
                task["questions"] = [
                    {"q": "Explain the fundamental difference between a classical bit and a qubit in terms of their state space.", "answer": ["Bits are binary (0/1), qubits occupy a complex sphere (superposition)"], "skill": "synthesis", "explain": "Contrasting core concepts from the intro and physics sections."},
                    {"q": "How does the professor use the 'noise-canceling headphones' analogy to explain quantum algorithms?", "answer": ["To describe quantum interference amplifying the correct answer and canceling the noise"], "skill": "main_idea", "explain": "Synthesizing the mechanical principle with a real-world analogy."},
                    {"q": "Why is Shor's Algorithm considered an 'existential threat' to the global economy?", "answer": ["Because it can break RSA encryption by factoring large primes in minutes"], "skill": "synthesis", "explain": "Connecting mathematical theory to economic impact."},
                    {"q": "What are the primary environmental requirements for a modern quantum computer to maintain coherence?", "answer": ["Temperatures near absolute zero (15 millikelvins) to stop molecular motion"], "skill": "detail", "explain": "Summary of engineering constraints."},
                    {"q": "Discuss the trade-offs between 'Superconducting loops' and 'Trapped ions' as mentioned in the lecture.", "answer": ["Loops are fast but hard to scale; ions are stable but slow"], "skill": "synthesis", "explain": "Comparison of hardware approaches."},
                    {"q": "What is the 'dark side' of quantum computing described by the speaker?", "answer": ["The Quantum Cold War and 'Harvest Now, Decrypt Later' attacks"], "skill": "inference", "explain": "Extracting the geopolitical argument."},
                    {"q": "How could a 'Quantum Internet' theoretically prevent eavesdropping?", "answer": ["Entangled photons alert the sender immediately if the signal is observed"], "skill": "synthesis", "explain": "Synthesizing the security section."}
                ]
            elif tid == "CSL_MEGA_003": # CRISPR
                task["questions"] = [
                    {"q": "How does the CRISPR system function as a 'natural immune system' in bacteria?", "answer": ["It stores viral DNA snippets as 'mugshots' and uses Cas9 to cut matching intruders"], "skill": "main_idea", "explain": "Foundation of the biological argument."},
                    {"q": "Contrast 'somatic' versus 'germline' gene editing in terms of ethical acceptance.", "answer": ["Somatic is individual and accepted; germline is permanent/inheritable and controversial"], "skill": "synthesis", "explain": "Core ethical dichotomy of the talk."},
                    {"q": "Why was the 2018 experiment by He Jiankui condemned by the scientific community?", "answer": ["It was medically unnecessary and exposed children to unknown off-target effects"], "skill": "synthesis", "explain": "Case study analysis."},
                    {"q": "Explain the concept of a 'biological caste system' in the context of genetic enhancement.", "answer": ["The wealthy upgrade children's potential while the poor are left with the natural lottery"], "skill": "inference", "explain": "Sociological implication of the technology."},
                    {"q": "What are 'gene drives' and what is the primary risk associated with them?", "answer": ["Ways to spread traits through wild populations; risk of irreversible ecological collapse"], "skill": "synthesis", "explain": "Ecological section summary."}
                ]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("BUEPT-ified Samples: Careful is sequential, Selective is synthesis-based.")

if __name__ == "__main__":
    bueptify_samples()
