import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/reading_tasks.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

NEW_READING = [
    {
        "id": "r_41",
        "title": "The Thermodynamics of Life: Entropy and Biological Order",
        "level": "C2",
        "text": "The second law of thermodynamics states that the total entropy, or disorder, of an isolated system can never decrease over time. This principle seems to contradict the existence of complex biological life, which is highly ordered. However, as Erwin Schrödinger famously noted in 'What is Life?', organisms maintain their low-entropy state by 'feeding on negative entropy' from their environment. They take in high-quality energy and matter, using it to build and repair their structures, while exporting even more entropy—mostly in the form of heat—back into the surroundings. Thus, life does not violate the second law; rather, it accelerates the overall increase in entropy of the universe to maintain its own internal order. This perspective views life as a thermodynamic engine, constantly churning to stay one step ahead of total dissolution.",
        "questions": [
            {"q": "What is the second law of thermodynamics about?", "options": ["Energy conservation.", "Total entropy in an isolated system never decreases.", "Heat is always lost.", "Life is impossible."], "answer": 1},
            {"q": "Does biological life violate the second law?", "options": ["Yes, it is too ordered.", "No, it exports more entropy to the environment.", "Only in its early stages.", "It is not an isolated system."], "answer": 1},
            {"q": "What did Schrödinger mean by 'feeding on negative entropy'?", "options": ["Eating inorganic matter.", "Taking in energy to maintain internal order.", "Living in cold environments.", "Reducing the temperature of the universe."], "answer": 1},
            {"q": "How do organisms primarily export entropy?", "options": ["As light.", "As heat.", "As waste products only.", "As genetic information."], "answer": 1},
            {"q": "What is the final metaphor used for life?", "options": ["A biological computer.", "A thermodynamic engine.", "A static chemical reaction.", "A closed loop system."], "answer": 1}
        ]
    },
    {
        "id": "r_42",
        "title": "The Great Filter: Why We Haven't Found Alien Life",
        "level": "C1",
        "text": "The Fermi Paradox asks: if the universe is so vast and old, why haven't we found evidence of extraterrestrial civilizations? One possible answer is the 'Great Filter'—a theoretical barrier that makes the development of long-lasting, space-faring civilizations extremely difficult. This filter could be in our past (e.g., the difficult transition from single-celled to multi-celled life) or in our future (e.g., self-destruction through nuclear war or climate change). If the filter is behind us, humanity might be unique and have a bright future. If the filter is ahead of us, we may be doomed to vanish before we can colonize the stars. Finding simple life on Mars would, ironically, be bad news, as it would suggest that the filter is likely ahead of us, not behind us.",
        "questions": [
            {"q": "What is the Fermi Paradox?", "options": ["The study of space travel.", "The contradiction between high probability of alien life and lack of evidence.", "The speed of light being too slow.", "The origin of the Big Bang."], "answer": 1},
            {"q": "Define the 'Great Filter'.", "options": ["A giant space telescope.", "A theoretical barrier to civilization development.", "A method to clean space debris.", "The edge of the galaxy."], "answer": 1},
            {"q": "What happens if the filter is in our past?", "options": ["We are likely doomed.", "Humanity might be unique and survive.", "Alien life is everywhere.", "Dinosaurs will return."], "answer": 1},
            {"q": "Why would finding life on Mars be 'bad news' for humanity?", "options": ["Mars is too far away.", "It suggests the Great Filter is in our future.", "The life would be dangerous.", "It would prove the Big Bang theory."], "answer": 1},
            {"q": "What are examples of 'future filters' mentioned?", "options": ["Black holes.", "Nuclear war or climate change.", "Asteroid strikes.", "Solar flares."], "answer": 1}
        ]
    },
    {
        "id": "r_43",
        "title": "The Philosophy of Existentialism and Jean-Paul Sartre",
        "level": "C1",
        "text": "Existentialism is a philosophical movement that emphasizes individual freedom, choice, and responsibility. Jean-Paul Sartre, its most famous proponent, argued that 'existence precedes essence.' This means that humans are not born with a predefined purpose; instead, we define ourselves through our actions. This radical freedom leads to 'angst'—the realization that we alone are responsible for our choices. Sartre also warned against 'bad faith,' where individuals lie to themselves or follow social conventions to avoid the burden of freedom. To live 'authentically' is to accept one's freedom and take full responsibility for one's life, even in an inherently meaningless or 'absurd' universe. This philosophy rose to prominence after World War II as people sought to make sense of a shattered world.",
        "questions": [
            {"q": "What does 'existence precedes essence' mean?", "options": ["God defines our purpose.", "Humans define themselves through their actions.", "The soul is older than the body.", "We are born with a fixed destiny."], "answer": 1},
            {"q": "What is 'angst' in existentialism?", "options": ["Fear of the dark.", "The stress of modern life.", "Realization of absolute responsibility for choices.", "Anger at social injustice."], "answer": 2},
            {"q": "Define 'bad faith'.", "options": ["Not believing in any religion.", "Denying one's freedom to fit into society.", "Acting out of spite.", "A type of legal contract."], "answer": 1},
            {"q": "What does it mean to live 'authentically'?", "options": ["Following all the rules.", "Accepting freedom and responsibility.", "Becoming famous.", "Living in the wild."], "answer": 1},
            {"q": "When did existentialism gain popularity?", "options": ["During the Renaissance.", "After World War II.", "Before the Industrial Revolution.", "In ancient Greece."], "answer": 1}
        ]
    },
    {
        "id": "r_44",
        "title": "The Economic Consequences of Labor Automation",
        "level": "C1",
        "text": "As robotics and AI continue to advance, the automation of labor has moved from the factory floor to the service and professional sectors. Proponents argue that automation increases productivity, lowers costs for consumers, and frees humans from repetitive, dangerous tasks. However, economists warn of 'technological unemployment,' where machines replace workers faster than new jobs can be created. Unlike the Industrial Revolution, which replaced muscle power with machine power, the current revolution targets cognitive tasks, potentially hollowing out the middle class. Possible solutions range from Universal Basic Income (UBI) to 'robot taxes' intended to fund retraining programs. The challenge for policymakers is to harness the benefits of automation while ensuring that the gains are broadly shared across society.",
        "questions": [
            {"q": "How has automation shifted recently?", "options": ["It has stopped completely.", "From factory floors to service and professional sectors.", "It now only affects agriculture.", "It only involves mechanical power."], "answer": 1},
            {"q": "What is a benefit of automation mentioned?", "options": ["Lower productivity.", "Higher costs.", "Freeing humans from dangerous tasks.", "Creating more manual labor jobs."], "answer": 2},
            {"q": "Define 'technological unemployment'.", "options": ["Refusing to use computers.", "Machines replacing workers faster than new jobs disappear.", "Workers losing jobs due to rapid machine replacement.", "The inability to repair robots."], "answer": 2},
            {"q": "How does this revolution differ from the Industrial one?", "options": ["It is slower.", "It targets cognitive tasks instead of just muscle power.", "It only affects one country.", "It uses less energy."], "answer": 1},
            {"q": "What are two proposed solutions for policy makers?", "options": ["Banning all robots.", "UBI and 'robot taxes'.", "Higher taxes on workers.", "Increasing the work week."], "answer": 1}
        ]
    },
    {
        "id": "r_45",
        "title": "The Microbiology of the Human Microbiome",
        "level": "C1",
        "text": "The human microbiome consists of trillions of bacteria, fungi, and viruses living in and on our bodies, particularly in the gut. Far from being simple 'germs,' these microbes are essential for health, helping to digest food, produce vitamins, and train the immune system. Recent research has linked the microbiome to a wide range of conditions, from obesity and allergies to mental health through the 'gut-brain axis.' Factors like diet, antibiotic use, and even the method of birth can significantly alter the composition of our microbial community. As we understand more, treatments like 'probiotics' and fecal transplants are becoming more common. This 'invisible organ' reminds us that humans are not individuals but ecosystems containing more microbial cells than human ones.",
        "questions": [
            {"q": "What is the human microbiome?", "options": ["A type of medicine.", "Trillions of microbes living in and on our bodies.", "A part of the skeletal system.", "The study of human fossils."], "answer": 1},
            {"q": "Which of these is NOT a function of the microbiome?", "options": ["Helping digest food.", "Producing vitamins.", "Creating oxygen for the blood.", "Training the immune system."], "answer": 2},
            {"q": "What is the 'gut-brain axis'?", "options": ["A physical bone.", "The connection between gut health and mental health.", "A surgical procedure.", "The path of a nerve."], "answer": 1},
            {"q": "What can alter the composition of the microbiome?", "options": ["Only the weather.", "Diet and antibiotic use.", "The length of one's hair.", "The number of clothes worn."], "answer": 1},
            {"q": "How does the author describe humans at the end?", "options": ["As purely rational beings.", "As ecosystems rather than individuals.", "As the only important life form.", "As a collection of organs only."], "answer": 1}
        ]
    }
]

data.extend(NEW_READING)
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(NEW_READING)} reading more modules (Total: {len(data)})")
