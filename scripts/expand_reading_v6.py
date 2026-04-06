import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/reading_tasks.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

NEW_READING = [
    {
        "id": "r_51",
        "title": "The Philosophy of Utilitarianism: Ethics of the Greater Good",
        "level": "C1",
        "text": "Utilitarianism is a consequentialist ethical theory founded by Jeremy Bentham and refined by John Stuart Mill. Its central principle is the 'Greatest Happiness Principle,' which states that the most ethical action is the one that produces the most overall happiness and minimizes suffering for the largest number of people. Utilitarians use a 'felicific calculus' to weigh the pleasure and pain resulting from an action. Mill distinguished between 'higher pleasures' (intellectual and moral) and 'lower pleasures' (physical), arguing that a satisfied pig is less valuable than a dissatisfied Socrates. While criticized for ignoring individual rights—as it could justify harming a minority for the majority's benefit—utilitarianism remains a foundational tool in public policy, health economics, and law.",
        "questions": [
            {"q": "What is the core principle of utilitarianism?", "options": ["Focusing on personal freedom.", "Producing the most happiness for the most people.", "Following religious rules strictly.", "Treating everyone identically regardless of outcomes."], "answer": 1},
            {"q": "Who were the primary founders mentioned?", "options": ["Kant and Hegel.", "Bentham and Mill.", "Sartre and Camus.", "Smith and Marx."], "answer": 1},
            {"q": "What is 'felicific calculus'?", "options": ["A way to calculate interest rates.", "Measuring the pleasure and pain of an action.", "A type of advanced geometry.", "A method to count votes."], "answer": 1},
            {"q": "How did Mill distinguish between pleasures?", "options": ["By their cost.", "By their duration.", "Into 'higher' intellectual and 'lower' physical.", "He didn't distinguish them."], "answer": 2},
            {"q": "What is a major criticism of this theory?", "options": ["It is too difficult to apply.", "It can ignore individual rights for the majority's benefit.", "It only cares about animals.", "It was created too long ago."], "answer": 1}
        ]
    },
    {
        "id": "r_52",
        "title": "The CRISPR Revolution and the Ethics of Gene Editing",
        "level": "C1",
        "text": "CRISPR-Cas9 is a revolutionary gene-editing technology that allows scientists to make precise changes to DNA with unprecedented ease and low cost. Derived from a bacterial immune system, CRISPR acts as 'molecular scissors' that can cut specific sequences of DNA, allowing for the deletion or replacement of genes. This has immense potential for curing genetic diseases like sickle cell anemia and muscular dystrophy. However, the prospect of 'germline editing'—changing DNA in embryos that will be passed to future generations—raises profound ethical concerns. Critics warn of 'designer babies' and the potential for creating a permanent genetic divide in society. As the technology outpaces regulation, the scientific community is debating a global moratorium on certain types of human gene editing.",
        "questions": [
            {"q": "What is the primary function of CRISPR-Cas9?", "options": ["Storing data in DNA.", "Precise gene editing.", "Creating new vaccines.", "Viewing cells under a microscope."], "answer": 1},
            {"q": "How is CRISPR metaphorically described?", "options": ["A biological computer.", "Molecular scissors.", "A genetic map.", "A cell's brain."], "answer": 1},
            {"q": "Which disease might be cured using CRISPR?", "options": ["The flu.", "Sickle cell anemia.", "Broken bones.", "Vitamin deficiency."], "answer": 1},
            {"q": "Define 'germline editing'.", "options": ["Editing plants only.", "Changes to embryos passed to future generations.", "Changing a person's hair color.", "Creating robots with DNA."], "answer": 1},
            {"q": "What is a major ethical worry regarding this technology?", "options": ["The cost of the equipment.", "The creation of a genetic divide in society.", "It is too experimental.", "It requires too much energy."], "answer": 1}
        ]
    },
    {
        "id": "r_53",
        "title": "The Sociological Paradigm of Global Urbanization",
        "level": "C1",
        "text": "For the first time in history, more than half of the world's population lives in cities, a trend that is accelerating in developing nations. Urbanization is more than just a demographic shift; it is a fundamental transformation of social life. Classic sociologists like Georg Simmel noted that city life creates an 'urban personality'—more reserved and intellectual but also more alienated than in rural communities. Today, the rise of 'megacities' with over 10 million residents creates massive challenges for infrastructure, housing, and social cohesion. Slums and informal settlements often house the poorest residents, highlighting the spatial inequality within urban environments. Despite these issues, cities remain the primary hubs for innovation, economic growth, and cultural exchange, offering opportunities that rural areas often lack.",
        "questions": [
            {"q": "What historical milestone in urbanization was recently reached?", "options": ["Cities are disappearing.", "More than half the global population lives in cities.", "Everyone has moved to cities.", "Cities are now all the same size."], "answer": 1},
            {"q": "What did Georg Simmel observe about city life?", "options": ["People are more friendly.", "City life creates a reserved 'urban personality'.", "Rural life is more intellectual.", "There is no difference."], "answer": 1},
            {"q": "Define a 'megacity'.", "options": ["A city with a lot of shops.", "A city with over 10 million residents.", "A city that spans several countries.", "A city with no pollution."], "answer": 1},
            {"q": "What issue is highlighted by the presence of slums?", "options": ["Rapid transportation.", "Spatial inequality within the city.", "Excessive city lighting.", "Low population density."], "answer": 1},
            {"q": "Why do cities continue to attract people despite their challenges?", "options": ["They are quieter than rural areas.", "They are hubs for innovation and economic growth.", "They are the only place with hospitals.", "They have more nature."], "answer": 1}
        ]
    },
    {
        "id": "r_54",
        "title": "The French Revolution: Foundations of Modern Democracy",
        "level": "C1",
        "text": "The French Revolution, which began in 1789, was a watershed event that ended the absolute monarchy in France and paved the way for modern democratic ideals. Driven by Enlightenment philosophy and widespread economic hardship, the revolutionaries demanded 'Liberty, Equality, and Fraternity.' The 'Declaration of the Rights of Man and of the Citizen' became a foundational document for human rights globally. However, the revolution also descended into the 'Reign of Terror,' where thousands were executed as enemies of the state. Despite this violence and the eventual rise of Napoleon Bonaparte, the revolution fundamentally changed the world by challenging the divine right of kings and establishing the principle that political power comes from the people (popular sovereignty).",
        "questions": [
            {"q": "When did the French Revolution begin?", "options": ["1776.", "1789.", "1815.", "1914."], "answer": 1},
            {"q": "What were the three key demands of the revolutionaries?", "options": ["Peace, Land, and Bread.", "Liberty, Equality, and Fraternity.", "Gold, Glory, and God.", "Death to the King."], "answer": 1},
            {"q": "What document served as a foundation for global human rights?", "options": ["The Magna Carta.", "The Declaration of the Rights of Man.", "The Constitution of the USA.", "The Communist Manifesto."], "answer": 1},
            {"q": "What was the 'Reign of Terror'?", "options": ["A period of high taxes.", "A period of mass executions and violence.", "A successful military campaign.", "The name of the King's army."], "answer": 1},
            {"q": "What was the most important political shift caused by the revolution?", "options": ["Napoleon became Emperor.", "Power was seen as coming from the people (popular sovereignty).", "France became a colony.", "The church gained more power."], "answer": 1}
        ]
    },
    {
        "id": "r_55",
        "title": "Keynesian Economics and the Role of Government Stimulus",
        "level": "C1",
        "text": "Keynesian economics, named after John Maynard Keynes, challenged the classical belief that free markets always return to full employment. During the Great Depression, Keynes argued that in a recession, a lack of 'aggregate demand' leads to a downward spiral. Because individuals and businesses save their money, the economy stalls. His solution was for the government to step in and spend money—even if it meant going into debt—to stimulate demand and create jobs. This 'deficit spending' was used to fund massive public works projects. While critics argue that this leads to inflation and high debt, Keynesianism remains a vital tool for governments today when responding to economic crises, such as the 2008 financial crash or the COVID-19 pandemic.",
        "questions": [
            {"q": "What did Keynes believe about free markets during a recession?", "options": ["They always fix themselves quickly.", "They do not always return to full employment automatically.", "They should be banned.", "They are the only way to save money."], "answer": 1},
            {"q": "Define 'aggregate demand'.", "options": ["Small-scale shopping.", "The total demand for goods and services in an economy.", "The price of a single product.", "The export capacity of a nation."], "answer": 1},
            {"q": "What was Keynes's proposed solution to a recession?", "options": ["Save as much as possible.", "The government should spend money to stimulate demand.", "Cut all taxes.", "Invest in foreign markets only."], "answer": 1},
            {"q": "What is 'deficit spending'?", "options": ["Spending money you don't have (creating debt).", "Spending only what you earn.", "Banning all spending.", "A type of saving account."], "answer": 0},
            {"q": "When is Keynesianism typically used by governments today?", "options": ["During periods of high growth.", "In response to economic crises.", "To increase the price of gold.", "To stop people from working."], "answer": 1}
        ]
    },
    {
        "id": "r_56",
        "title": "Quantum Mechanics: The Wave-Particle Duality",
        "level": "C2",
        "text": "One of the most counterintuitive aspects of quantum mechanics is 'wave-particle duality'—the concept that every quantum entity can be described as both a particle and a wave. The famous 'Double-Slit Experiment' demonstrated this perfectly. When light or electrons are fired at two slits, they form an 'interference pattern' on a screen, which is characteristic of waves. However, if we place a detector to watch which slit a particle passes through, the interference pattern disappears, and they behave like discrete particles. This suggests that the act of observation itself collapses the 'wavefunction' into a definite state. This mystery remains at the heart of quantum physics, challenging our concepts of reality and the role of the observer in the physical world.",
        "questions": [
            {"q": "What is 'wave-particle duality'?", "options": ["Particles moving in waves.", "Quantum entities behaving as both waves and particles.", "Waves turning into water.", "A type of light bulb."], "answer": 1},
            {"q": "Which experiment proved this phenomenon?", "options": ["The Apple Drop.", "The Double-Slit Experiment.", "The Kite in the Rain.", "The Cat in the Box."], "answer": 1},
            {"q": "What happens when an interference pattern is formed?", "options": ["Light behaves like particles.", "Light behaves like waves.", "The screen turns black.", "The electrons stop moving."], "answer": 1},
            {"q": "How does 'observation' affect a quantum system?", "options": ["It makes it move faster.", "It collapses the wavefunction into a definite state.", "It has no effect.", "It makes it disappear."], "answer": 1},
            {"q": "What is the broader implication of these findings?", "options": ["Reality is fixed and simple.", "It challenges our concept of reality and the role of the observer.", "Science is always right.", "Computers are better than humans."], "answer": 1}
        ]
    },
    {
        "id": "r_57",
        "title": "Sociolinguistics: The Dynamics of Code-Switching",
        "level": "C1",
        "text": "Code-switching is the practice of alternating between two or more languages or dialects in a single conversation. Once viewed by some as a sign of linguistic deficiency, sociolinguists now recognize it as a sophisticated skill used by bilingual speakers to navigate social identities. Code-switching can serve various functions: emphasizing a point, expressing solidarity with a specific group, or following the 'norms' of a particular social setting. For example, a person might use a formal standard dialect at work but switch to a local dialect or native language with family. Far from being random, code-switching is governed by complex grammmatical and social rules. It reflects the speaker's ability to operate in multiple cultural worlds simultaneously, serving as a powerful tool for identity construction.",
        "questions": [
            {"q": "Define 'code-switching'.", "options": ["Learning a new code for a bank.", "Alternating between languages or dialects in conversation.", "A malfunction in a computer.", "Translating a book."], "answer": 1},
            {"q": "How was code-switching viewed in the past?", "options": ["As a great skill.", "As a sign of linguistic deficiency.", "As a secret code.", "It wasn't studied."], "answer": 1},
            {"q": "What is one function of code-switching mentioned?", "options": ["Hiding information.", "Expressing solidarity with a group.", "Forgetting words.", "Practicing grammar."], "answer": 1},
            {"q": "Is code-switching random?", "options": ["Yes, completely.", "No, it is governed by complex social and grammatical rules.", "Only for children.", "Only in certain countries."], "answer": 1},
            {"q": "What does code-switching reflect about a speaker?", "options": ["Their lack of vocabulary.", "Their ability to navigate multiple cultural worlds.", "Their level of education.", "Their age."], "answer": 1}
        ]
    },
    {
        "id": "r_58",
        "title": "The Psychology of Memory: Encoding, Storage, and Forgetting",
        "level": "C1",
        "text": "Human memory is not a single recorder but a complex system involving three stages: encoding, storage, and retrieval. Encoding is the process of getting information into the system, often through focus and association. Storage refers to the retention of information over time, divided into short-term (working) memory and long-term memory. Retrieval is the ability to access that info when needed. Forgetting can occur at any stage due to 'interference' (new info blocking old), 'decay' (info fading over time), or 'retrieval failure'. Herman Ebbinghaus's 'Forgetting Curve' showed that we lose most of what we learn very quickly if it isn't reinforced. Techniques like 'spaced repetition' and 'elaborative rehearsal' can help move information into permanent storage, making learning far more efficient.",
        "questions": [
            {"q": "Name the three stages of memory in order.", "options": ["Writing, Reading, Speaking.", "Encoding, Storage, Retrieval.", "Listening, Hearing, Remembering.", "Past, Present, Future."], "answer": 1},
            {"q": "What is 'encoding'?", "options": ["Writing a code.", "Getting information into the memory system.", "Remembering a name.", "Storing bits in a computer."], "answer": 1},
            {"q": "Define 'interference' in forgetting.", "options": ["Losing one's phone.", "New information blocking the retrieval of old info.", "A broken radio.", "Forgetting because of age."], "answer": 1},
            {"q": "What does the 'Forgetting Curve' demonstrate?", "options": ["Memory improves over time.", "We lose most info very quickly without reinforcement.", "Old people forget more than kids.", "Stress helps memory."], "answer": 1},
            {"q": "Name a technique to improve long-term memory.", "options": ["Cramming all at once.", "Spaced repetition.", "Ignoring the topic.", "Drinking coffee."], "answer": 1}
        ]
    },
    {
        "id": "r_59",
        "title": "Anthropology: The Concept of 'Gift Cultures'",
        "level": "C2",
        "text": "In many indigenous societies, the economy is based not on market exchange but on 'gift-giving.' As Marcel Mauss explored in 'The Gift,' these exchanges aren't purely altruistic; they create powerful social obligations. To receive a gift is to incur a 'debt' of honor that must be repaid, often with interest. This creates a dense network of relationships and dependencies that bind the community together. A famous example is the 'Kula Ring' in the Trobriand Islands, where people travel hundreds of miles to exchange shells of no practical value. These shells gain 'value' purely through their history of exchange. In a gift culture, status is gained by giving away one's wealth, rather than accumulating it—a direct contrast to the capitalist model focusing on individual accumulation.",
        "questions": [
            {"q": "What is the basis of economy in a 'gift culture'?", "options": ["Market exchange with money.", "Gift-giving and social obligations.", "Stealing from neighbors.", "International trade."], "answer": 1},
            {"q": "Who is the author of the book 'The Gift'?", "options": ["Charles Darwin.", "Marcel Mauss.", "Adam Smith.", "Margaret Mead."], "answer": 1},
            {"q": "Why is a gift considered a 'debt' of honor?", "options": ["It costs a lot of money.", "It creates an obligation to repay.", "It is a form of punishment.", "It is given in secret."], "answer": 1},
            {"q": "What is the Kula Ring?", "options": ["A types of jewelry.", "A network of gift exchange in the Trobriand Islands.", "A sports competition.", "A religious ceremony."], "answer": 1},
            {"q": "How is status gained in a gift culture?", "options": ["By becoming very rich.", "By giving away wealth.", "By working the most hours.", "By having a large house."], "answer": 1}
        ]
    },
    {
        "id": "r_60",
        "title": "Environmental Science: The Nuclear Energy Debate",
        "level": "C1",
        "text": "The role of nuclear energy in the transition to a low-carbon economy is one of the most contentious issues in environmental science. Proponents argue that nuclear power provides a reliable, high-capacity source of energy that produces almost zero CO2 emissions during operation, making it essential for meeting climate goals. However, critics point to the risks of catastrophic accidents, like Chernobyl and Fukushima, and the unresolved problem of long-term radioactive waste storage. While 'Generation IV' reactors and small modular reactors (SMRs) promise to be safer and more efficient, public opposition remains high. The debate often boils down to a choice between the immediate threat of climate change and the long-term safety risks associated with nuclear technology.",
        "questions": [
            {"q": "What is the main argument for nuclear energy?", "options": ["It is the cheapest source.", "It provides zero-CO2, high-capacity energy.", "It is the oldest technology.", "It is 100% safe."], "answer": 1},
            {"q": "What are two major risks cited by critics?", "options": ["High costs and low efficiency.", "Accidents and radioactive waste storage.", "It uses too much water.", "It requires a lot of land."], "answer": 1},
            {"q": "Name one of the famous nuclear accidents mentioned.", "options": ["The Hindenburg.", "Chernobyl or Fukushima.", "The Titanic.", "The Dust Bowl."], "answer": 1},
            {"q": "What are 'SMRs'?", "options": ["Small modular reactors.", "Simple motor radios.", "Slow moving rockets.", "Super market retailers."], "answer": 0},
            {"q": "What is the fundamental choice in this debate?", "options": ["Taxes vs Spending.", "Climate change threat vs long-term safety risks.", "Solar vs Wind.", "Nature vs Cities."], "answer": 1}
        ]
    }
]

data.extend(NEW_READING)
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(NEW_READING)} reading more modules (Total: {len(data)})")
