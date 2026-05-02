import json

def final_refine_lectures():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    # --- CSL_REAL_002: Biology (SELECTIVE - Synthesis) ---
    t2 = next((t for t in tasks if t["id"] == "CSL_REAL_002"), None)
    if t2:
        t2["questions"] = [
            {
                "type": "short_answer",
                "q": "What is the primary danger of 'categorical thinking' in biology as explained throughout the lecture?",
                "answer": ["It creates artificial boundaries that hide the continuum of behavior", "It makes us miss the underlying complexity"],
                "skill": "main_idea",
                "explain": "Sapolsky's central thesis is about breaking these mental categories."
            },
            {
                "type": "short_answer",
                "q": "How does the professor synthesize the roles of 'genetics' and 'environment' by the end of the talk?",
                "answer": ["Genes are not the master plan but a list of options triggered by the environment"],
                "skill": "synthesis",
                "explain": "Requires combining the start and end of the behavioral biology argument."
            },
            {
                "type": "short_answer",
                "q": "What does the 'bucket' metaphor represent in the context of scientific disciplines?",
                "answer": ["The isolation of different fields (genetics, sociology, neurology)"],
                "skill": "inference",
                "explain": "Discussed as a limitation to holistic understanding."
            }
        ]

    # --- CSL_REAL_003: History (SELECTIVE - Synthesis) ---
    t3 = next((t for t in tasks if t["id"] == "CSL_REAL_003"), None)
    if t3:
        t3["questions"] = [
            {
                "type": "short_answer",
                "q": "According to the professor, why is the term 'Fall of Rome' a problematic simplification of the transition to the Middle Ages?",
                "answer": ["Because the transformation was gradual and involved cultural continuity", "It was more of a shift in power than a total collapse"],
                "skill": "synthesis",
                "explain": "The lecture challenges the 476 AD 'end point' narrative."
            },
            {
                "type": "short_answer",
                "q": "Explain the dual role of the 'Church' as both a religious and an administrative successor to Rome.",
                "answer": ["It preserved Latin literacy and the organizational hierarchy of the Empire"],
                "skill": "synthesis",
                "explain": "Synthesizes the religious and political sections of the talk."
            }
        ]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Final refinement: Biology and History Selective tasks now use synthesis-based questions.")

if __name__ == "__main__":
    final_refine_lectures()
