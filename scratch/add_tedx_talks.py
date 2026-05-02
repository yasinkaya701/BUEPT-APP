import json

def add_tedx_talks():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/careful_selective_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    tedx_talks = [
        {
            "id": "TEDX_001",
            "title": "The Power of Introverts",
            "source": "Susan Cain (TEDx)",
            "type": "selective",
            "level": "P4",
            "category": "TEDx",
            "audioUrl": "https://www.youtube.com/watch?v=c0KYU2j0TM4",
            "duration": "19 min",
            "description": "Susan Cain argues that we design our schools and workplaces for extroverts, missing out on the unique talents of introverts.",
            "transcript": "",
            "questions": [
                {"q": "What is the primary 'bias' in modern culture that Cain identifies regarding personality?", "answer": ["The Extrovert Ideal", "Bias against introverts"], "skill": "main_idea", "explain": "She argues that society values talkers over thinkers."},
                {"q": "How does Cain use the example of 'solitude' to explain creativity?", "answer": ["Solitude is a crucial ingredient for creativity", "Introverts need solitude to produce their best work"], "skill": "synthesis", "explain": "She contrasts collaborative work with the need for individual reflection."},
                {"q": "What is the 'Stop the madness' call to action mentioned towards the end?", "answer": ["A plea for better work/school design that respects quiet people"], "skill": "synthesis", "explain": "A general summary of her recommendations."}
            ]
        },
        {
            "id": "TEDX_002",
            "title": "Do Schools Kill Creativity?",
            "source": "Sir Ken Robinson (TEDx)",
            "type": "selective",
            "level": "P4",
            "category": "TEDx",
            "audioUrl": "https://www.youtube.com/watch?v=iG9CE55wbtY",
            "duration": "19 min",
            "description": "A humorous and profound plea for creating an education system that nurtures (rather than undermines) creativity.",
            "transcript": "",
            "questions": [
                {"q": "What is Robinson's main argument regarding the 'hierarchy of subjects' in education?", "answer": ["Arts are at the bottom while math/science are at the top", "Education systems prioritize utility over creativity"], "skill": "main_idea", "explain": "He criticizes the focus on academic ability at the expense of other talents."},
                {"q": "Explain the significance of the Gillian Lynne story in the context of his talk.", "answer": ["She was a dancer who was seen as having a learning disorder", "It shows how 'moving' is a form of intelligence"], "skill": "synthesis", "explain": "A key piece of evidence for diversifying education."},
                {"q": "Why does he believe we are 'educating people out of their creative capacities'?", "answer": ["Because schools stigmatize mistakes", "The system focuses on producing university professors"], "skill": "synthesis", "explain": "A summary of the systemic failure he identifies."}
            ]
        },
        {
            "id": "TEDX_003",
            "title": "Staying Calm Under Stress",
            "source": "Daniel Levitin (TEDx)",
            "type": "careful",
            "level": "P4",
            "category": "TEDx",
            "audioUrl": "https://www.youtube.com/watch?v=8jPQjjsBbIc",
            "duration": "12 min",
            "description": "Neuroscientist Daniel Levitin explains the 'pre-mortem'—a technique to stay rational when things go wrong.",
            "transcript": "",
            "questions": [
                {"q": "What is the 'Pre-mortem' technique as defined by the speaker?", "answer": ["Looking ahead to what could go wrong and planning for it", "Thinking about failures before they happen"], "skill": "detail", "explain": "Sequential: Found in the first 3 minutes."},
                {"q": "What specific hormone is released during the 'fight or flight' response?", "answer": "Cortisol", "skill": "detail", "explain": "Sequential: Mentioned in the physiological section."},
                {"q": "What logistical advice does he give regarding the location of your 'keys'?", "answer": ["Have a designated place for them", "Always put them in the same spot"], "skill": "detail", "explain": "Sequential: Practical example in the middle."},
                {"q": "What is the final piece of advice regarding 'medical decisions'?", "answer": ["Ask the doctor about the 'number needed to treat'", "Ask about statistics and probabilities"], "skill": "detail", "explain": "Sequential: Closing segment advice."}
            ]
        },
        {
            "id": "TEDX_004",
            "title": "Your Brain on Video Games",
            "source": "Daphne Bavelier (TEDx)",
            "type": "careful",
            "level": "P4",
            "category": "TEDx",
            "audioUrl": "https://www.youtube.com/watch?v=FktsFcooIG8",
            "duration": "18 min",
            "description": "Bavelier explores how action video games can improve vision, attention, and multitasking.",
            "transcript": "",
            "questions": [
                {"q": "What is the first 'myth' about video games and vision she addresses?", "answer": ["That video games ruin your eyesight", "Games make you blind"], "skill": "detail", "explain": "Sequential: Intro segment myth-busting."},
                {"q": "According to her study, what specific visual skill is 30% better in gamers?", "answer": ["Contrast sensitivity", "Seeing shades of gray"], "skill": "detail", "explain": "Sequential: First data point."},
                {"q": "In the 'tracking' test, how many objects can a gamer track simultaneously?", "answer": ["6 or 7", "Six to seven"], "skill": "detail", "explain": "Sequential: Comparison section."},
                {"q": "Define the 'attentional blink' as used in her research.", "answer": ["The delay in processing a second stimulus right after a first one", "A gap in attention"], "skill": "detail", "explain": "Sequential: Middle section definition."}
            ]
        },
        {
            "id": "TEDX_005",
            "title": "The Puzzle of Motivation",
            "source": "Dan Pink (TEDx)",
            "type": "selective",
            "level": "P4",
            "category": "TEDx",
            "audioUrl": "https://www.youtube.com/watch?v=rrkrvAUbU9Y",
            "duration": "18 min",
            "description": "Dan Pink argues that business motivation is built around 'carrots and sticks' that actually do more harm than good.",
            "transcript": "",
            "questions": [
                {"q": "Why does Pink argue that traditional rewards (carrots and sticks) fail for creative tasks?", "answer": ["They narrow focus and block creativity", "They only work for simple, linear tasks"], "skill": "main_idea", "explain": "The mismatch between science and business practice."},
                {"q": "Explain the 'Candle Problem' experiment and its outcome.", "answer": ["Incentives slowed down the group solving the problem", "Financial rewards led to worse performance"], "skill": "synthesis", "explain": "Key evidence for the failure of extrinsic motivation."},
                {"q": "What are the three core elements of 'intrinsic motivation'?", "answer": ["Autonomy, Mastery, and Purpose", "Self-direction, getting better, and making a difference"], "skill": "synthesis", "explain": "The framework for a new motivational system."}
            ]
        },
        {
            "id": "TEDX_006",
            "title": "Grit: The Power of Passion",
            "source": "Angela Duckworth (TEDx)",
            "type": "selective",
            "level": "P4",
            "category": "TEDx",
            "audioUrl": "https://www.youtube.com/watch?v=H14bBuluwB8",
            "duration": "6 min",
            "description": "Angela Duckworth explains her research on Grit as the #1 predictor of success.",
            "transcript": "",
            "questions": [
                {"q": "What was the 'surprising' conclusion of the West Point military academy study?", "answer": ["Grit predicted success better than IQ or physical talent", "Social intelligence wasn't the top predictor"], "skill": "main_idea", "explain": "Talent alone does not guarantee finishing the training."},
                {"q": "How does the speaker define 'Grit'?", "answer": ["Passion and perseverance for long-term goals", "Living life like a marathon, not a sprint"], "skill": "synthesis", "explain": "A core definition of the concept."},
                {"q": "What is the relationship between 'Growth Mindset' and building grit?", "answer": ["Growth mindset makes you believe ability can change, leading to grit", "It provides the belief system needed to persevere"], "skill": "synthesis", "explain": "The cognitive foundation of grit."}
            ]
        }
    ]

    tasks.extend(tedx_talks)

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Successfully added 6 TEDx talks to the database.")

if __name__ == "__main__":
    add_tedx_talks()
