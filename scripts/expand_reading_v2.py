import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/reading_tasks.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

NEW_READING = [
    {
        "id": "r_31",
        "title": "The Neuroplasticity of Adult Language Acquisition",
        "level": "C1",
        "text": "For decades, the 'Critical Period Hypothesis' dominated linguistic theory, suggesting that after puberty, the brain's ability to acquire a second language (L2) with native-like proficiency diminishes significantly. However, recent advancements in neuroimaging have challenged this rigid paradigm. Magnetic Resonance Imaging (MRI) studies reveal that adult brains consistently exhibit structural changes, such as increased gray matter density in the inferior parietal lobule, following intensive language training. This phenomenon, known as neuroplasticity, suggests that the adult brain is far more adaptable than previously thought. While adults may struggle with phonological nuances, their cognitive maturity often allows for a more sophisticated grasp of complex syntax and abstract lexical semantic networks. Thus, the debate has shifted from 'whether' adults can learn, to 'how' neurobiological constraints interact with pedagogical methods.",
        "questions": [
            {"q": "What was the traditional view regarding adult language learning?", "options": ["Adults learn better than children.", "Language learning is impossible after puberty.", "Proficiency decline is inevitable after puberty.", "Adults have more gray matter."], "answer": 2},
            {"q": "How has neuroimaging affected linguistic theory?", "options": ["It proved the Critical Period Hypothesis.", "It showed that adult brains are static.", "It challenged the idea of a fixed learning window.", "It focused solely on phonology."], "answer": 2},
            {"q": "What specific brain change is mentioned in the text?", "options": ["Decreased gray matter Density.", "Increased density in the parietal lobule.", "Loss of neurons in the frontal lobe.", "Shrinkage of the hippocampus."], "answer": 1},
            {"q": "In which area do adult learners typically face the most difficulty?", "options": ["Syntax", "Abstract meanings", "Phonological nuances", "Lexical networks"], "answer": 2},
            {"q": "What is the new focus of the learning debate?", "options": ["The age of the learner.", "The interaction of biology and teaching.", "The cost of MRI scans.", "The number of languages learned."], "answer": 1}
        ]
    },
    {
        "id": "r_32",
        "title": "The Impact of Game Theory on Modern Economics",
        "level": "C1",
        "text": "Game theory, the mathematical study of strategic decision-making, has revolutionized modern economics by moving beyond the classical model of 'perfect competition.' In the mid-20th century, John Nash introduced the concept of the 'Nash Equilibrium,' a state where no participant can gain by changing their strategy if others keep theirs constant. This framework proved indispensable for analyzing oligopolistic markets, where a few firms dominate. Unlike the 'invisible hand' theory of Adam Smith, which assumes that individual self-interest naturally leads to optimal social outcomes, game theory demonstrates that rational individuals can sometimes reach sub-optimal results, such as the Prisoner's Dilemma. Today, game theory is applied not only to market pricing but also to global trade negotiations, auction design, and even environmental treaties, providing a rigorous tool for anticipating human behavior in competitive environments.",
        "questions": [
            {"q": "What is the primary contribution of game theory mentioned?", "options": ["It supports perfect competition.", "It focuses on strategic decision-making.", "It simplifies economic models.", "It ignores human behavior."], "answer": 1},
            {"q": "Define the 'Nash Equilibrium' based on the text.", "options": ["A state of constant change.", "A situation where no one benefits from switching alone.", "A market with no competition.", "A state of total chaos."], "answer": 1},
            {"q": "How does game theory differ from Adam Smith's 'invisible hand'?", "options": ["It assumes individuals are irrational.", "It shows that self-interest can lead to bad outcomes.", "It only applies to small businesses.", "It denies the existence of markets."], "answer": 1},
            {"q": "The 'Prisoner's Dilemma' is an example of what?", "options": ["An optimal social outcome.", "A sub-optimal result from rational choices.", "A successful trade negotiation.", "A perfect competition model."], "answer": 1},
            {"q": "Which of these is NOT a current application of game theory?", "options": ["Auction design", "Global trade", "Environmental treaties", "Classical music composition"], "answer": 3}
        ]
    },
    {
        "id": "r_33",
        "title": "The Anthropocene: A New Geological Epoch?",
        "level": "C1",
        "text": "The term 'Anthropocene' was coined by Paul Crutzen to describe a new geological epoch characterized by humanity's profound impact on Earth's ecosystems. Geologically, epochs are defined by distinct 'signals' in the Earth's strata, such as fossilized remains or chemical isotopes. Proponents of the Anthropocene point to the mid-20th century 'Great Acceleration' as the starting point, citing the presence of radioactive fallout from nuclear testing and the ubiquity of plastic particles in the sediment record. However, critics argue that the Anthropocene is a socio-political construct rather than a formal geological term, noting that the impact of humans is spatially uneven and difficult to pinpoint to a specific date. Despite the controversy, the concept has become a powerful metaphor for the scale of environmental change, urging a move toward global sustainability.",
        "questions": [
            {"q": "What is the Anthropocene meant to describe?", "options": ["The beginning of the Earth.", "The era of human impact on ecosystems.", "The extinction of dinosaurs.", "The rise of agricultural societies."], "answer": 1},
            {"q": "How are geological epochs usually identified?", "options": ["By historical records.", "By distinct signals in the Earth's layers.", "By the weather patterns.", "By the number of humans."], "answer": 1},
            {"q": "Why is the mid-20th century proposed as the start date?", "options": ["The birth of Paul Crutzen.", "The invention of the wheel.", "The 'Great Acceleration' and nuclear fallout.", "The end of the Ice Age."], "answer": 2},
            {"q": "What is a major criticism of the term?", "options": ["It is too scientific.", "Human impact is even across the globe.", "It is more of a socio-political idea than a geological one.", "It is too difficult to pronounce."], "answer": 2},
            {"q": "Despite the debate, how is the term currently viewed?", "options": ["As a useless word.", "As a metaphor for environmental change.", "As a fixed date in history.", "As a strictly biological term."], "answer": 1}
        ]
    },
    {
        "id": "r_34",
        "title": "The Rise of Artificial Intelligence in Medical Diagnosis",
        "level": "C1",
        "text": "The integration of Artificial Intelligence (AI) into medical diagnostics represents a significant leap in precision medicine. machine learning algorithms, particularly deep learning networks, are now capable of analyzing medical images—such as X-rays and MRIs—with an accuracy that often exceeds that of experienced radiologists. For instance, AI systems have shown remarkable success in early cancer detection and retinal disease mapping. The primary advantage of AI lies in its ability to process vast datasets of historical cases, identifying subtle patterns that may be invisible to the human eye. However, this 'black box' nature of AI decision-making raises ethical concerns regarding accountability and transparency. If an AI misdiagnoses a patient, who is responsible? While AI is unlikely to replace physicians, it is poised to become an indispensable assistant, augmenting the diagnostic capabilities of healthcare professionals.",
        "questions": [
            {"q": "What is the main advantage of AI in diagnosis?", "options": ["It is cheaper than a doctor.", "It can identify patterns in large datasets.", "It replaces the need for radiologists.", "It works without electricity."], "answer": 1},
            {"q": "What is 'precision medicine' in this context?", "options": ["Quick surgery.", "High-accuracy, data-driven healthcare.", "Traditional medicine.", "Medicine for robots."], "answer": 1},
            {"q": "What does the 'black box' refer to?", "options": ["A medical storage container.", "The lack of transparency in AI's thinking process.", "The computer screen.", "A type of X-ray machine."], "answer": 1},
            {"q": "What ethical concern is emphasized?", "options": ["The cost of AI.", "Accountability for misdiagnosis.", "The speed of the algorithms.", "The color of the machines."], "answer": 1},
            {"q": "What is the expected future role of AI in medicine?", "options": ["Replacing all doctors.", "Acting as an assistant to doctors.", "Becoming a patient.", "Being banned from hospitals."], "answer": 1}
        ]
    },
    {
        "id": "r_35",
        "title": "Sociolinguistics and the Concept of 'Linguistic Prestige'",
        "level": "C1",
        "text": "In sociolinguistics, 'prestige' refers to the social value attached to a particular language or dialect. Standard varieties often carry 'overt prestige,' being associated with formal education, professional success, and the ruling class. Conversely, non-standard dialects may possess 'covert prestige,' where speakers maintain their local accent to show solidarity with their community and resist external social pressures. William Labov's pioneering study in New York City demonstrated that linguistic variation is not random but rather a 'social marker.' He found that speakers often adjust their speech toward the more prestigious variety in formal settings to gain social standing, a process known as 'style-shifting.' This dynamic highlights the role of language not just as a means of communication, but as a tool for navigating social hierarchies and expressing identity.",
        "questions": [
            {"q": "What does 'overt prestige' signify?", "options": ["A secret dialect.", "Informal education.", "Formal education and social success.", "Resistance to authority."], "answer": 2},
            {"q": "Why would someone use a dialect with 'covert prestige'?", "options": ["To gain a promotion.", "To show community solidarity.", "To hide their identity.", "Because they forgot the standard variety."], "answer": 1},
            {"q": "What did William Labov discover in his study?", "options": ["Language change is random.", "Linguistic variation is a social marker.", "New Yorkers speak the best English.", "Dialects are disappearing."], "answer": 1},
            {"q": "What is 'style-shifting'?", "options": ["Changing clothes before a meeting.", "Adjusting speech patterns depending on the context.", "Moving to a new city.", "Learning a new language."], "answer": 1},
            {"q": "What is language's dual role according to the text?", "options": ["Writing and reading.", "Communication and social navigation.", "Speaking and listening.", "Science and art."], "answer": 1}
        ]
    }
]

data.extend(NEW_READING)
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(NEW_READING)} reading more modules (Total: {len(data)})")
