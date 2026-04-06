import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/reading_tasks.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

NEW_READING = [
    {
        "id": "r_36",
        "title": "Quantum Entanglement and the Einstein-Podolsky-Rosen Paradox",
        "level": "C2",
        "text": "Quantum entanglement, a phenomenon famously dubbed 'spooky action at a distance' by Albert Einstein, refers to the state where two or more particles become inseparable, sharing a single existence regardless of the spatial interval between them. In 1935, Einstein, Podolsky, and Rosen (EPR) argued that this paradox suggested either quantum theory was incomplete or it violated the principle of locality—the idea that objects are only influenced by their immediate surroundings. However, Bell's Theorem in 1964 provided a mathematical proof that could be tested experimentally. Subsequent tests by Alain Aspect and others confirmed that entanglement is indeed real, challenging our fundamental understanding of causality and locality. Today, this 'spooky' connection is the cornerstone of quantum computing and secure cryptographic communication, where information is encoded in the states of entangled photons.",
        "questions": [
            {"q": "What did Einstein think of quantum entanglement?", "options": ["He was its biggest supporter.", "He was skeptical and called it 'spooky'.", "He invented the technology to test it.", "He used it for his theory of relativity."], "answer": 1},
            {"q": "What is the 'principle of locality'?", "options": ["Everything is connected to everything else.", "Objects are only affected by their immediate surroundings.", "Particles move faster than light.", "Space is an illusion."], "answer": 1},
            {"q": "How did Bell's Theorem change the debate?", "options": ["It proved Einstein was 100% correct.", "It provided a way to test entanglement mathematically.", "It showed that quantum theory was a mistake.", "It focused on gravity instead of particles."], "answer": 1},
            {"q": "What did experiments in the 1980s confirm?", "options": ["Einstein's locality was preserved.", "Entanglement is a real physical phenomenon.", "Particles don't exist.", "The EPR paradox was solved by classical physics."], "answer": 1},
            {"q": "Name a modern application of this phenomenon.", "options": ["Classical music", "Quantum computing and cryptography", "Steam engine design", "Radio broadcasting"], "answer": 1}
        ]
    },
    {
        "id": "r_37",
        "title": "The Evolution of Urban Resilience in the Face of Climate Change",
        "level": "C1",
        "text": "As the global population becomes increasingly urbanized, the concept of 'urban resilience' has moved to the forefront of city planning. Resilience is defined as the capacity of a city to absorb, recover from, and adapt to systemic shocks, particularly those induced by climate change, such as sea-level rise and extreme heatwaves. Historically, urban planning relied on 'gray infrastructure'—concrete sea walls and drainage pipes. However, modern strategies prioritize 'nature-based solutions' (NBS), such as urban wetlands and green roofs, which provide both ecological and social benefits. For instance, sponge cities in China utilize permeable surfaces to manage stormwater and mitigate flooding. While these innovations require significant capital investment, they offer long-term sustainability by restoring the natural hydrological cycle and reducing the urban heat island effect.",
        "questions": [
            {"q": "How is 'urban resilience' defined?", "options": ["The size of a city's population.", "The ability of a city to adapt and recover from shocks.", "The height of skyscrapers.", "The speed of public transport."], "answer": 1},
            {"q": "What was the traditional approach to urban flooding?", "options": ["Building green roofs.", "Using concrete structures (gray infrastructure).", "Moving cities to higher ground.", "Planting trees in the center."], "answer": 1},
            {"q": "What is a 'nature-based solution' (NBS)?", "options": ["Banning all cars.", "Using wetlands and green roofs to manage the environment.", "Ignoring climate change.", "Moving to rural areas."], "answer": 1},
            {"q": "What is the primary function of a 'sponge city'?", "options": ["To absorb sunlight.", "To manage stormwater using permeable surfaces.", "To grow food on rooftops.", "To clean the air."], "answer": 1},
            {"q": "Why are these new strategies considered sustainable?", "options": ["They are cheaper to build.", "They restore natural cycles and reduce heat.", "They are only for small towns.", "They don't require any maintenance."], "answer": 1}
        ]
    },
    {
        "id": "r_38",
        "title": "The Decipherment of Ancient Scripts: The Rosetta Stone Case",
        "level": "C1",
        "text": "The decipherment of Egyptian hieroglyphs in the early 19th century was one of the greatest intellectual feats in history. The key was the Rosetta Stone, a basalt slab discovered in 1799, which featured a decree written in three scripts: Hieroglyphic, Demotic, and Ancient Greek. Since scholars already knew Greek, they could use it as a bridge to understand the other two. Jean-François Champollion and Thomas Young were the primary rivals in the race to crack the code. Young correctly identified that some hieroglyphs represented sounds (phoneticism) rather than just ideas (ideographic). However, it was Champollion who fully realized the complexities of the system—a mix of phonetic and symbolic signs—and successfully translated the names of Ptolemy and Cleopatra. This breakthrough opened a window into three millennia of Egyptian history, allowing modern historians to read the voices of the past.",
        "questions": [
            {"q": "What made the Rosetta Stone so important?", "options": ["It was made of gold.", "It had the same text in three different scripts.", "It was the first book ever written.", "It was discovered by Napoleon himself."], "answer": 1},
            {"q": "Which script on the stone was already known to scholars?", "options": ["Hieroglyphic", "Demotic", "Ancient Greek", "Latin"], "answer": 2},
            {"q": "What was Thomas Young's main discovery?", "options": ["Hieroglyphs are purely symbolic.", "Hieroglyphs can represent sounds.", "Egyptian history began in 1799.", "The stone was a fake."], "answer": 1},
            {"q": "How did Champollion exceed Young's work?", "options": ["He found more stones.", "He understood the mix of phonetic and symbolic signs.", "He spoke Egyptian fluently.", "He used a computer."], "answer": 1},
            {"q": "What was the result of this decipherment?", "options": ["Egyptian history was forgotten.", "Scholars could finally read 3,000 years of records.", "The stone was lost again.", "Archeology was banned in Egypt."], "answer": 1}
        ]
    },
    {
        "id": "r_39",
        "title": "The Psychology of 'Heuristics' in Human Decision-Making",
        "level": "C1",
        "text": "Heuristics are mental shortcuts or 'rules of thumb' that allow humans to make decisions quickly and efficiently. While often beneficial, these shortcuts can lead to predictable errors, known as cognitive biases. Amos Tversky and Daniel Kahneman's work on the 'Availability Heuristic' showed that people tend to judge the probability of an event based on how easily examples come to mind. For example, individuals may overestimate the risk of a plane crash because such events are vividly reported in the media, while ignoring the statistically higher risk of car accidents. Another common bias is the 'Anchoring Effect,' where the first piece of information offered (the anchor) heavily influences subsequent judgments. Understanding these mental mechanisms is crucial for fields ranging from marketing and law to public policy, where nudging behavior can lead to better social outcomes.",
        "questions": [
            {"q": "Define 'heuristics' based on the text.", "options": ["Complex mathematical formulas.", "Mental shortcuts for quick decision-making.", "Scientific experiments.", "A type of brain surgery."], "answer": 1},
            {"q": "What is the relationship between heuristics and cognitive biases?", "options": ["They are the same thing.", "Heuristics always prevent biases.", "Heuristics can lead to systematic errors (biases).", "Biases are used to create heuristics."], "answer": 2},
            {"q": "How does the 'Availability Heuristic' work?", "options": ["Judging probability based on Vivid, recent examples.", "Using a calculator for every choice.", "Ignoring all previous experiences.", "Waiting for more information before deciding."], "answer": 0},
            {"q": "What is 'anchoring' in decision-making?", "options": ["Being stuck on a ship.", "Letting the first piece of info influence your judgment.", "Changing your mind constantly.", "Following the crowd."], "answer": 1},
            {"q": "Why is studying heuristics important for public policy?", "options": ["To build better anchors.", "To 'nudge' people toward better decisions.", "To stop people from making choices.", "To increase marketing budgets."], "answer": 1}
        ]
    },
    {
        "id": "r_40",
        "title": "The Dynamics of Plate Tectonics and the Theory of Continental Drift",
        "level": "C1",
        "text": "The theory of plate tectonics provides a comprehensive framework for understanding Earth's geological activity. It originated from Alfred Wegener's 1912 hypothesis of 'Continental Drift,' which suggested that the continents were once joined in a supercontinent called Pangaea. Wegener's theory was initially rejected because he lacked a mechanism for how continents moved. In the 1960s, the discovery of 'seafloor spreading'—the creation of new oceanic crust at mid-ocean ridges—provided the missing link. We now know that the Earth's lithosphere is divided into several tectonic plates that glide over the asthenosphere. Their interactions at boundaries—divergent, convergent, and transform—give rise to earthquakes, volcanic activity, and the formation of mountain ranges like the Himalayas. This dynamic process continuously reshapes the planet's surface over millions of years.",
        "questions": [
            {"q": "What was the name of the supercontinent proposed by Wegener?", "options": ["Atlantis", "Pangaea", "Gondwana", "Eurasia"], "answer": 1},
            {"q": "Why was Wegener's theory initially rejected?", "options": ["He had no evidence of fossil similarity.", "He couldn't explain how the continents moved.", "He didn't have a PhD.", "The continents aren't moving."], "answer": 1},
            {"q": "What discovery in the 1960s supported Wegener's idea?", "options": ["The invention of the telescope.", "Seafloor spreading at mid-ocean ridges.", "The Moon landing.", "The core of the Earth."], "answer": 1},
            {"q": "How does the text describe the Earth's lithosphere?", "options": ["A solid, unbreakable shell.", "A liquid layer of water.", "Divided into plates that glide.", "A giant magnet."], "answer": 2},
            {"q": "What results from the interaction of tectonic plates?", "options": ["Extreme weather only.", "Earthquakes, volcanoes, and mountains.", "The change of seasons.", "The rise of the oceans only."], "answer": 1}
        ]
    }
]

data.extend(NEW_READING)
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(NEW_READING)} reading more modules (Total: {len(data)})")
