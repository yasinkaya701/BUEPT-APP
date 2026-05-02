import json

def add_more_mega_lectures():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    more_lectures = [
        {
            "id": "CSL_REAL_004",
            "title": "Fundamentals of Physics (Yale)",
            "type": "careful",
            "level": "P4",
            "category": "Real Lecture Lab",
            "audioUrl": "https://www.youtube.com/watch?v=MSm7Z4m0mC4",
            "duration": "48 min",
            "description": "Professor Ramamurti Shankar provides an overview of the course and the nature of physical laws.",
            "transcript": "[Real External Lecture - Use Careful Mode]",
            "questions": [
                {"type": "short_answer", "q": "What is the primary language of physics according to the professor?", "answer": "Mathematics", "explain": "Introductory concept."},
                {"type": "short_answer", "q": "Why is it important to define units in physical measurements?", "answer": "To ensure universal consistency and comparison", "explain": "Standardization discussion."}
            ]
        },
        {
            "id": "CSL_REAL_005",
            "title": "Principles of Microeconomics (MIT)",
            "type": "careful",
            "level": "P4",
            "category": "Real Lecture Lab",
            "audioUrl": "https://www.youtube.com/watch?v=v6_GSt_tAyo",
            "duration": "51 min",
            "description": "An introduction to economic modeling, supply and demand, and the allocation of resources.",
            "transcript": "[Real External Lecture - Use Careful Mode]",
            "questions": [
                {"type": "short_answer", "q": "What is the 'central problem' of economics mentioned in the talk?", "answer": "Scarcity", "explain": "Fundamental economic principle."},
                {"type": "short_answer", "q": "Define 'opportunity cost' as explained by the professor.", "answer": "The value of the next best alternative forgone", "explain": "Core economic concept."}
            ]
        }
    ]

    tasks.extend(more_lectures)

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Successfully added Physics and Economics Mega Lectures.")

if __name__ == "__main__":
    add_more_mega_lectures()
