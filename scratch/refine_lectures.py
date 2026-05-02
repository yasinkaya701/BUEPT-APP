import json

def refine_mega_lecture_questions():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    # --- CSL_REAL_001: Psychology (SELECTIVE - Non-sequential / Synthesis) ---
    t1 = next((t for t in tasks if t["id"] == "CSL_REAL_001"), None)
    if t1:
        t1["questions"] = [
            {
                "type": "short_answer",
                "q": "What is the primary overarching goal of this course as stated by Professor Gabrieli?",
                "answer": ["To understand the human mind and brain", "Understanding how we perceive, think, and act"],
                "skill": "main_idea",
                "explain": "The professor frames the course around the ultimate mystery of human consciousness."
            },
            {
                "type": "short_answer",
                "q": "Explain the relationship between 'fMRI' technology and the shift away from traditional behaviorism.",
                "answer": ["fMRI allowed scientists to see the mind's internal workings which behaviorism ignored"],
                "skill": "synthesis",
                "explain": "The lecture discusses how neuro-imaging made 'hidden' mental processes observable."
            },
            {
                "type": "short_answer",
                "q": "Why does the professor categorize psychology as a 'hub science'?",
                "answer": ["Because it connects medicine, education, and social policy"],
                "skill": "inference",
                "explain": "It sits at the center of multiple disciplines that impact human life."
            },
            {
                "type": "short_answer",
                "q": "What core dichotomy (nature vs nurture) does the speaker use to structure the discussion on intelligence?",
                "answer": ["Biological potential vs environmental influence"],
                "skill": "detail",
                "explain": "The talk uses this classic debate to explain modern genetic findings."
            }
        ]

    # --- CSL_REAL_004: Physics (CAREFUL - Sequential / Detail-heavy) ---
    t4 = next((t for t in tasks if t["id"] == "CSL_REAL_004"), None)
    if t4:
        t4["questions"] = [
            {
                "type": "short_answer",
                "q": "What is the first disclaimer Professor Shankar gives regarding the 'mathematical prerequisite' of the course?",
                "answer": ["Calculus is essential but will be reviewed as needed"],
                "skill": "detail",
                "explain": "Sequential: This is mentioned in the first 5 minutes."
            },
            {
                "type": "short_answer",
                "q": "How many 'standard units' of measurement are explicitly listed on the first blackboard diagram?",
                "answer": ["Three", "Length, mass, and time"],
                "skill": "detail",
                "explain": "Sequential: Follows the intro, found in the setup phase."
            },
            {
                "type": "short_answer",
                "q": "What specific example of a 'non-physical' force does he use to contrast with gravity?",
                "answer": ["Psychological motivation", "Emotional force"],
                "skill": "detail",
                "explain": "Sequential: Found in the middle section of the lecture."
            },
            {
                "type": "short_answer",
                "q": "What is the final logistical instruction given about the 'textbook' before the lecture concludes?",
                "answer": ["Students should not buy the latest edition as older ones are sufficient"],
                "skill": "detail",
                "explain": "Sequential: This is the closing remark."
            }
        ]

    # --- CSL_REAL_005: Microeconomics (CAREFUL - Sequential) ---
    t5 = next((t for t in tasks if t["id"] == "CSL_REAL_005"), None)
    if t5:
        t5["questions"] = [
            {
                "type": "short_answer",
                "q": "What is the very first 'central problem' of economics defined in the opening minutes?",
                "answer": "The allocation of scarce resources",
                "skill": "detail",
                "explain": "Sequential: Definition given at start."
            },
            {
                "type": "short_answer",
                "q": "According to the professor, what distinguishes 'Micro' from 'Macro' economics in the introductory chart?",
                "answer": "Micro focuses on individual decision makers (firms and households)",
                "skill": "detail",
                "explain": "Sequential: Part of the classification section."
            },
            {
                "type": "short_answer",
                "q": "What specific phrase does the speaker use to describe the 'invisible hand' of the market?",
                "answer": "Spontaneous order",
                "skill": "detail",
                "explain": "Sequential: Found in the Adam Smith discussion block."
            }
        ]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Refined Mega Lecture questions: Careful is sequential, Selective is synthesis-based.")

if __name__ == "__main__":
    refine_mega_lecture_questions()
