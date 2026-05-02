import json

def industrialize_tedx_questions():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    # --- TEDX_002: Ken Robinson (Selective) ---
    t2 = next((t for t in tasks if t["id"] == "TEDX_002"), None)
    if t2:
        t2["questions"] = [
            {"q": "What is Robinson's primary thesis regarding the 'industrial' origins of modern education?", "answer": ["Education was designed to meet the needs of 19th-century industrialism"], "skill": "main_idea", "explain": "Synthesizing the historical argument."},
            {"q": "How does the speaker define 'intelligence' in contrast to the traditional academic view?", "answer": ["Diverse, dynamic, and distinct"], "skill": "synthesis", "explain": "Defining the core philosophy of the talk."},
            {"q": "Explain why Robinson believes we are 'educating people out of their creative capacities'.", "answer": ["Because schools stigmatize mistakes, and creativity requires being wrong"], "skill": "synthesis", "explain": "Core synthesis of the education critique."},
            {"q": "What is 'Academic Inflation' and how has it affected the value of a university degree?", "answer": ["The requirement of higher degrees for jobs that previously didn't need them"], "skill": "synthesis", "explain": "Synthesizing the job market section."},
            {"q": "Synthesize the significance of the Gillian Lynne story—how did the doctor's 'unconventional' diagnosis save her career?", "answer": ["The doctor recognized she wasn't sick, but was a dancer, allowing her to thrive"], "skill": "synthesis", "explain": "Case study synthesis."},
            {"q": "Why does the speaker argue that the hierarchy of subjects (Arts at the bottom) is problematic?", "answer": ["It ignores the dynamic and diverse nature of human talent"], "skill": "inference", "explain": "Synthesizing the subject hierarchy argument."},
            {"q": "What is the ultimate 'human resource' metaphor used to conclude the talk?", "answer": ["Human potential is like a resource that must be cultivated, not just extracted"], "skill": "main_idea", "explain": "Synthesizing the final message."}
        ]

    # --- TEDX_005: Dan Pink (Selective) ---
    t5 = next((t for t in tasks if t["id"] == "TEDX_005"), None)
    if t5:
        t5["questions"] = [
            {"q": "Why does Dan Pink argue that there is a 'mismatch' between what science knows and what business does?", "answer": ["Business relies on rewards (carrots/sticks) that science proves are ineffective for creative work"], "skill": "main_idea", "explain": "Core thesis synthesis."},
            {"q": "Explain the outcome of the 'Candle Problem' when financial incentives were introduced.", "answer": ["Incentives narrowed focus and actually slowed down the group solving the problem"], "skill": "synthesis", "explain": "Evidence synthesis."},
            {"q": "Contrast 'algorithmic' tasks with 'heuristic' tasks in the context of motivation.", "answer": ["Algorithmic tasks follow a path and work with rewards; heuristic tasks require creativity"], "skill": "synthesis", "explain": "Defining task categories."},
            {"q": "What are the three core elements of 'Intrinsic Motivation' as proposed by the speaker?", "answer": ["Autonomy, Mastery, and Purpose"], "skill": "synthesis", "explain": "Synthesizing the new motivational framework."},
            {"q": "Discuss the 'ROWE' (Results-Only Work Environment) example and its impact on productivity.", "answer": ["Employees have total autonomy over time/place, leading to higher engagement"], "skill": "synthesis", "explain": "Case study synthesis."},
            {"q": "How does the speaker use the contrast between 'Microsoft Encarta' and 'Wikipedia' to prove his point?", "answer": ["Wikipedia's success proves that passion and purpose out-compete financial incentives"], "skill": "inference", "explain": "Analogy synthesis."}
        ]

    # --- TEDX_006: Angela Duckworth (Selective) ---
    t6 = next((t for t in tasks if t["id"] == "TEDX_006"), None)
    if t6:
        t6["questions"] = [
            {"q": "What was the 'surprise' finding in the West Point military academy study regarding success?", "answer": ["Grit predicted completion better than IQ, test scores, or physical talent"], "skill": "main_idea", "explain": "Evidence synthesis."},
            {"q": "How does Duckworth define 'Grit' and how does it differ from a 'sprint'?", "answer": ["Grit is passion and perseverance for long-term goals; it's a marathon, not a sprint"], "skill": "synthesis", "explain": "Defining the core concept."},
            {"q": "Synthesize the relationship between 'Growth Mindset' and building grit in children.", "answer": ["Believing that ability can change makes children more likely to persevere through failure"], "skill": "synthesis", "explain": "Connecting psychology to performance."},
            {"q": "Why does the speaker argue that 'talent' is not a reliable predictor of grit?", "answer": ["Her data shows that many talented individuals fail to follow through on commitments"], "skill": "inference", "explain": "Synthesizing the talent vs effort argument."}
        ]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Industrialized TEDx question sets with high-fidelity BUEPT-style items.")

if __name__ == "__main__":
    industrialize_tedx_questions()
