import json

def add_mega_lectures():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    # Filter out existing ones if they are placeholders or keep them if they are good
    # I'll append the new "Mega" lectures with real audio
    
    mega_lectures = [
        {
            "id": "CSL_REAL_001",
            "title": "Introduction to Psychology (MIT 9.00SC)",
            "type": "selective",
            "level": "P4",
            "category": "Real Lecture Lab",
            "audioUrl": "https://www.youtube.com/watch?v=P_V_vT_9Nl8",
            "duration": "50 min",
            "description": "Professor John Gabrieli introduces the fundamental questions of psychology, from the biological basis of behavior to the complexities of human cognition.",
            "transcript": "[Real External Lecture - Use Note Taking Mode]",
            "questions": [
                {"type": "short_answer", "q": "What is the primary definition of psychology provided in the lecture?", "answer": "The scientific study of mind and behavior", "explain": "Introductory definition."},
                {"type": "short_answer", "q": "Which historical figure is associated with the 'unconscious mind'?", "answer": "Sigmund Freud", "explain": "Discussed in the history section."},
                {"type": "short_answer", "q": "What is the 'nature vs nurture' debate?", "answer": ["biology vs environment", "genetics vs experience"], "explain": "Core psychological dichotomy."},
                {"type": "short_answer", "q": "Mention one biological tool used to study the brain mentioned in the talk.", "answer": ["fMRI", "EEG", "PET"], "explain": "Neuroscience methods."}
            ]
        },
        {
            "id": "CSL_REAL_002",
            "title": "Human Behavioral Biology (Stanford Sapolsky)",
            "type": "selective",
            "level": "P4",
            "category": "Real Lecture Lab",
            "audioUrl": "https://www.youtube.com/watch?v=NNnIGh9g6fA",
            "duration": "57 min",
            "description": "Robert Sapolsky explores the biological roots of human behavior, challenging categorical thinking.",
            "transcript": "[Real External Lecture - Use Note Taking Mode]",
            "questions": [
                {"type": "short_answer", "q": "What is the main danger of 'categorical thinking' according to Sapolsky?", "answer": "It limits our ability to see the complexity of biological systems", "explain": "Opening theme."},
                {"type": "short_answer", "q": "Which field of study combines evolution and behavior?", "answer": "Sociobiology", "explain": "Interdisciplinary focus."},
                {"type": "short_answer", "q": "How does Sapolsky describe the influence of genes on behavior?", "answer": "Genes provide potential, but environment triggers expression", "explain": "Epigenetics concept."}
            ]
        },
        {
            "id": "CSL_REAL_003",
            "title": "The Early Middle Ages (Yale)",
            "type": "selective",
            "level": "P4",
            "category": "Real Lecture Lab",
            "audioUrl": "https://www.youtube.com/watch?v=L-I2KzZ6r8o",
            "duration": "45 min",
            "description": "An investigation into the transition from the Roman world to the Medieval period.",
            "transcript": "[Real External Lecture - Use Note Taking Mode]",
            "questions": [
                {"type": "short_answer", "q": "What event is traditionally cited as the 'end' of the Roman Empire in the West?", "answer": "The deposition of Romulus Augustulus in 476", "explain": "Historical milestone."},
                {"type": "short_answer", "q": "What role did the Church play in post-Roman Europe?", "answer": "It provided a sense of continuity and administrative structure", "explain": "Religious influence."}
            ]
        }
    ]

    tasks.extend(mega_lectures)

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Successfully added Mega Lectures with real audio URLs.")

if __name__ == "__main__":
    add_mega_lectures()
