import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/listening_tasks.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

NEW_LISTENING = [
    {
        "id": "l_16",
        "title": "Macroeconomics: Inflation and Central Bank Policy",
        "level": "C1",
        "type": "Lecture",
        "transcript": "Good morning, everyone. Today we'll explore the complex relationship between inflation and interest rates. Inflation, simply put, is the general increase in prices and the fall in the purchasing power of money. Central banks, like the Federal Reserve, use interest rates as a primary tool to manage this. When inflation is too high, the central bank usually raises interest rates. Why? Because higher rates make borrowing more expensive, which slows down spending and investment, eventually cooling the economy. Conversely, in a recession, the goal is to stimulate growth, so rates are lowered. However, there's a delicate balance; raising rates too quickly can lead to unemployment, while keeping them too low for too long can cause a speculative bubble. We call this 'taming the beast' of the macroeconomy.",
        "questions": [
            {"q": "What is the main definition of inflation given?", "options": ["Increase in purchasing power.", "General increase in prices.", "The study of central banks.", "A period of high employment."], "answer": 1},
            {"q": "How do central banks respond to high inflation?", "options": ["Lowering interest rates.", "Raising interest rates.", "Printing more money.", "Increasing government spending."], "answer": 1},
            {"q": "What is the risk of raising interest rates too quickly?", "options": ["Low prices.", "Unemployment.", "High investment.", "A speculative bubble."], "answer": 1},
            {"q": "What is the goal of lowering interest rates during a recession?", "options": ["To slow down the economy.", "To stimulate growth.", "To increase savings.", "To reduce imports."], "answer": 1},
            {"q": "What phrase is used to describe macroeconomic management?", "options": ["Feeding the beast.", "Taming the beast.", "Ignoring the beast.", "Creating the beast."], "answer": 1}
        ]
    },
    {
        "id": "l_17",
        "title": "Biology: The Mechanism of Photosynthesis",
        "level": "C1",
        "type": "Lecture",
        "transcript": "In today's biology session, we're diving into photosynthesis—the process by which green plants and some organisms use sunlight to synthesize nutrients. It's essentially a two-stage process: the light-dependent reactions and the Calvin Cycle. In the first stage, solar energy is captured by chlorophyll and used to split water molecules, releasing oxygen as a byproduct. This energy is then converted into chemical form—ATP and NADPH. In the second stage, the Calvin Cycle, this chemical energy is used to fix carbon dioxide from the atmosphere into glucose, a sugar that the plant uses for energy and growth. Without this fundamental conversion of inorganic matter into organic energy, life on Earth as we know it would cease to exist. It is the literal foundation of the global food web.",
        "questions": [
            {"q": "What are the two main stages of photosynthesis?", "options": ["Respiration and Digestion.", "Light-dependent reactions and the Calvin Cycle.", "Evaporation and Condensation.", "Growth and Decay."], "answer": 1},
            {"q": "What is the role of chlorophyll in the first stage?", "options": ["To create oxygen directly.", "To capture solar energy.", "To produce glucose.", "To absorb water from the roots."], "answer": 1},
            {"q": "Which molecule is a byproduct of the first stage?", "options": ["Carbon dioxide.", "Oxygen.", "Glucose.", "Nitrogen."], "answer": 1},
            {"q": "What happens during the Calvin Cycle?", "options": ["Sunlight is captured.", "Water is split.", "Carbon dioxide is fixed into glucose.", "Energy is lost as heat."], "answer": 2},
            {"q": "How does the speaker describe photosynthesis at the end?", "options": ["A secondary process.", "The foundation of the global food web.", "A wasteful energy conversion.", "A process only for flowers."], "answer": 1}
        ]
    },
    {
        "id": "l_18",
        "title": "Sociology: Theories of Social Stratification",
        "level": "C1",
        "type": "Seminar",
        "transcript": "Social stratification refers to the systematic categorization of people into hierarchical layers based on wealth, power, and prestige. Today, we'll contrast two major theories. First, the functionalist perspective, which argues that stratification is necessary for society to function. It suggests that high rewards—like high salaries—are needed to motivate the most capable people to fill the most important roles, such as doctors or engineers. On the other hand, conflict theory, heavily influenced by Karl Marx, views stratification as a source of inequality. It posits that the ruling class maintains its position by exploiting the working class and controlling the resources. Rather than motivating talent, conflict theorists argue that stratification limits the opportunities ofThose at the bottom, creating a cycle of poverty. The debate continues: is society a meritocracy or a system of power struggle?",
        "questions": [
            {"q": "What is 'social stratification'?", "options": ["A way to plant trees.", "Hierarchical layering of society.", "The study of ancient rocks.", "Movement between cities."], "answer": 1},
            {"q": "What does the functionalist perspective argue?", "options": ["Stratification is unnecessary.", "High rewards motivate individuals for key roles.", "Wealth should be distributed equally.", "Everyone should be a doctor."], "answer": 1},
            {"q": "Who influenced the conflict theory?", "options": ["William Labov.", "Karl Marx.", "Adam Smith.", "John Nash."], "answer": 1},
            {"q": "How does conflict theory view the ruling class?", "options": ["As providers of jobs.", "As exploiters of the working class.", "As the most talented members of society.", "As a neutral group."], "answer": 1},
            {"q": "What core question does the speaker pose at the end?", "options": ["Is wealth good?", "Is society a meritocracy or a power struggle?", "When will poverty end?", "Who is the richest person?"], "answer": 1}
        ]
    },
    {
        "id": "l_19",
        "title": "History: The Socio-economic Impact of the Industrial Revolution",
        "level": "C1",
        "type": "Podcast",
        "transcript": "Welcome to our history podcast. Today, we look at the Industrial Revolution, which began in Britain in the late 18th century. While we often focus on inventions like the steam engine, the socio-economic impact was far more profound. It transformed Britain from an agrarian society to an industrial one, sparking rapid urbanization. Millions moved from the countryside to growing cities like Manchester and Birmingham. This led to the rise of a new middle class of factory owners and managers. However, for the working class, life was often brutal, with 16-hour workdays and child labor being common. This period also saw the birth of labor unions as workers began to demand better rights. Ultimately, while it brought unprecedented economic growth, it also laid the groundwork for modern social and environmental challenges.",
        "questions": [
            {"q": "Where and when did the Industrial Revolution begin?", "options": ["France in the 17th century.", "Britain in the late 18th century.", "USA in the 19th century.", "Germany in the 15th century."], "answer": 1},
            {"q": "What does 'urbanization' mean in this context?", "options": ["Building more farms.", "Movement of people to cities.", "The invention of trains.", "A decrease in population."], "answer": 1},
            {"q": "Which group emerged as a 'new middle class'?", "options": ["Farmers.", "Factory owners and managers.", "Kings and Queens.", "Artists."], "answer": 1},
            {"q": "What negative aspect of working-class life is mentioned?", "options": ["High salaries.", "Brutal conditions and child labor.", "Too many holidays.", "Lack of available jobs."], "answer": 1},
            {"q": "What organization was born during this period to help workers?", "options": ["The Red Cross.", "Labor unions.", "Central banks.", "University clubs."], "answer": 1}
        ]
    },
    {
        "id": "l_20",
        "title": "Linguistics: The Sapir-Whorf Hypothesis",
        "level": "C1",
        "type": "Discussion",
        "transcript": "Let's discuss the Sapir-Whorf Hypothesis, also known as linguistic relativity. This theory suggests that the structure of the language we speak influences our perception of the world. Edward Sapir and Benjamin Whorf argued that if a language lacks a word for a specific concept, its speakers might struggle to conceptualize it. For example, some languages have multiple words for 'snow' or 'green,' leading speakers to perceive subtle differences that others might miss. However, critics like Noam Chomsky argue for 'universal grammar,' suggesting that all humans share a biological template for language and that thought exists independently of speech. While the extreme version of the hypothesis is largely discredited, most linguists today agree that language does have at least some 'framing effect' on our cognitive processes.",
        "questions": [
            {"q": "What is the core idea of the Sapir-Whorf Hypothesis?", "options": ["Language is purely biological.", "Language structure influences how we see the world.", "Everyone should speak the same language.", "Thinking is impossible without words."], "answer": 1},
            {"q": "What example is given for linguistic variation in concepts?", "options": ["Words for 'car'.", "Words for 'snow' or 'green'.", "The number of verbs.", "Pronunciation of names."], "answer": 1},
            {"q": "What is Noam Chomsky's alternative view?", "options": ["Linguistic relativity.", "Universal grammar.", "Phoneticism.", "Cultural determinism."], "answer": 1},
            {"q": "Is the 'extreme' version of the hypothesis accepted today?", "options": ["Yes, completely.", "No, it is largely discredited.", "It is only accepted in Asia.", "It was never studied."], "answer": 1},
            {"q": "What is the current consensus among linguists?", "options": ["Language has no effect on thought.", "Language has at least some 'framing effect' on cognition.", "Grammar is more important than meaning.", "All languages are equally difficult."], "answer": 1}
        ]
    }
]

data.extend(NEW_LISTENING)
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(NEW_LISTENING)} listening more modules (Total: {len(data)})")
