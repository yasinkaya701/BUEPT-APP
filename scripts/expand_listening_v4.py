import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/listening_tasks.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

NEW_LISTENING = [
    {
        "id": "l_26",
        "title": "Astronomy: Black Holes and Event Horizons",
        "level": "C2",
        "type": "Lecture",
        "transcript": "A black hole is a region of spacetime where gravity is so strong that nothing—no particles or even electromagnetic radiation such as light—can escape from it. The theory of general relativity predicts that a sufficiently compact mass can deform spacetime to form a black hole. The boundary of the region from which no escape is possible is called the event horizon. Although the event horizon has an enormous effect on the fate and circumstances of an object crossing it, no locally detectable features appear to be observed. In many ways, a black hole acts like an ideal black body, as it reflects no light. Moreover, quantum field theory in curved spacetime predicts that event horizons emit Hawking radiation, with the same spectrum as a black body of a temperature inversely proportional to its mass.",
        "questions": [
            {"q": "What characterizes the gravity of a black hole?", "options": ["Weak and unstable.", "So strong that light cannot escape.", "Equivalent to Earth's gravity.", "Only affects large planets."], "answer": 1},
            {"q": "What does the theory of general relativity predict about compact mass?", "options": ["It can form a black hole by deforming spacetime.", "It will always explode.", "It becomes a star.", "It moves faster than light."], "answer": 0},
            {"q": "Define the 'event horizon' based on the text.", "options": ["A place where time stops.", "The boundary from which no escape is possible.", "The center of the black hole.", "A bright ring of light."], "answer": 1},
            {"q": "Why is a black hole compared to an ideal black body?", "options": ["It is very hot.", "It reflects no light.", "It is perfectly round.", "It is made of carbon."], "answer": 1},
            {"q": "What is Hawking radiation?", "options": ["Light from nearby stars.", "Radiation emitted by event horizons.", "A type of radio wave.", "Heat from the center of the Earth."], "answer": 1}
        ]
    },
    {
        "id": "l_27",
        "title": "Environmental Science: Principles of Sustainable Architecture",
        "level": "C1",
        "type": "Seminar",
        "transcript": "Sustainable architecture seeks to minimize the negative environmental impact of buildings by efficiency and moderation in the use of materials, energy, development space, and the ecosystem at large. Sustainable architecture uses a conscious approach to energy and ecological conservation in the design of the built environment. The idea of sustainability, or ecological design, is to ensure that our actions and decisions today do not inhibit the opportunities of future generations. Key strategies include the use of renewable energy sources such as solar and wind, the implementation of passive solar design, and the selection of sustainable building materials like bamboo or recycled steel. Furthermore, it involves managing waste and water through systems like greywater recycling and on-site composting.",
        "questions": [
            {"q": "What is the primary goal of sustainable architecture?", "options": ["To build as fast as possible.", "To minimize negative environmental impact.", "To make the most expensive buildings.", "To ignore local ecosystems."], "answer": 1},
            {"q": "What does 'ecological design' aim to ensure?", "options": ["Future generations have no resources.", "Our actions do not inhibit future opportunities.", "All buildings are made of wood.", "Electricity is never used."], "answer": 1},
            {"q": "Name a renewable energy source mentioned in the text.", "options": ["Coal.", "Solar and wind.", "Oil.", "Natural gas."], "answer": 1},
            {"q": "What is 'passive solar design'?", "options": ["Using solar panels for everything.", "Designing to use the sun's energy for heating and cooling naturally.", "Storing sunlight in batteries.", "Painting buildings yellow."], "answer": 1},
            {"q": "How is water managed in sustainable architecture?", "options": ["Using only bottled water.", "Greywater recycling and on-site composting.", "Dumping waste into rivers.", "Building deep wells."], "answer": 1}
        ]
    },
    {
        "id": "l_28",
        "title": "Psychology: The Stanford Prison Experiment",
        "level": "C1",
        "type": "Discussion",
        "transcript": "The Stanford prison experiment was a social psychology experiment that attempted to investigate the psychological effects of perceived power, focusing on the struggle between prisoners and prison officers. It was conducted at Stanford University in 1971 by a team of researchers led by Philip Zimbardo. In the study, volunteers were assigned to be either 'guards' or 'prisoners' in a mock prison environment. However, the experiment had to be terminated after only six days because the guards began to engage in sadistic and abusive behavior toward the prisoners. The study demonstrated the power of situational factors and social roles in shaping human behavior, suggesting that even 'normal' individuals can commit atrocities if placed in a dehumanizing environment with total authority.",
        "questions": [
            {"q": "What was the main focus of the Stanford prison experiment?", "options": ["The history of prisons.", "The psychological effects of perceived power.", "The diet of prisoners.", "The architecture of Stanford University."], "answer": 1},
            {"q": "Who led the research team for this experiment?", "options": ["Stanley Milgram.", "Philip Zimbardo.", "Abraham Maslow.", "Sigmund Freud."], "answer": 1},
            {"q": "Why was the experiment terminated early?", "options": ["Lack of funding.", "Guards became abusive and sadistic.", "The prisoners escaped.", "The university closed for holidays."], "answer": 1},
            {"q": "What did the study demonstrate about human behavior?", "options": ["People are naturally evil.", "The power of situational factors and social roles.", "Guards are more intelligent than prisoners.", "Experiments are always dangerous."], "answer": 1},
            {"q": "How long did the experiment actually last?", "options": ["Two weeks.", "Six days.", "One month.", "One day."], "answer": 1}
        ]
    },
    {
        "id": "l_29",
        "title": "Economics: Adam Smith's 'Invisible Hand'",
        "level": "B2",
        "type": "Lecture",
        "transcript": "Adam Smith, the 18th-century Scottish philosopher and economist, is often called the 'father of modern economics.' His most famous concept is the 'invisible hand,' which he introduced in his book 'The Wealth of Nations.' The theory suggests that individuals acting in their own self-interest can unintentionally promote the public good. In a free market, when a person works to earn a profit, they provide goods or services that others want and need. This creates a self-regulating system where competition keeps prices low and quality high. Smith argued that government intervention should be minimal, as the 'invisible hand' of the market is more efficient at allocating resources than any central planner. However, modern economists note that this only works when there are no market failures or monopolies.",
        "questions": [
            {"q": "Who is considered the 'father of modern economics'?", "options": ["Karl Marx.", "Adam Smith.", "John Maynard Keynes.", "David Ricardo."], "answer": 1},
            {"q": "What is the core idea of the 'invisible hand'?", "options": ["The government should control everything.", "Self-interest can unintentionally promote public good.", "People should only work for others.", "Hands are invisible in a factory."], "answer": 1},
            {"q": "In which book did Smith introduce this concept?", "options": ["Das Kapital.", "The Wealth of Nations.", "The Social Contract.", "Principia Mathematica."], "answer": 1},
            {"q": "What keeps prices low in a free market?", "options": ["Government laws.", "Competition.", "Rich people's generosity.", "Lack of demand."], "answer": 1},
            {"q": "Under what condition might the 'invisible hand' fail?", "options": ["When people are too honest.", "In the presence of market failures or monopolies.", "When there is too much competition.", "When taxes are too low."], "answer": 1}
        ]
    },
    {
        "id": "l_30",
        "title": "History: The Great Depression of the 1930s",
        "level": "C1",
        "type": "Lecture",
        "transcript": "The Great Depression was the worst economic downturn in the history of the industrialized world, lasting from 1929 to 1939. It began after the stock market crash of October 1929, which sent Wall Street into a panic and wiped out millions of investors. Over the next several years, consumer spending and investment dropped, causing steep declines in industrial output and employment as failing companies laid off workers. By 1933, when the Great Depression reached its lowest point, some 15 million Americans were unemployed and nearly half the country's banks had failed. Relief only came with the entry of the US into World War II, which stimulated the economy through massive government spending. The legacy of the Depression led to the creation of the Social Security system and stricter banking regulations in the US.",
        "questions": [
            {"q": "How long did the Great Depression last?", "options": ["Two years.", "Ten years (1929-1939).", "Twenty years.", "Five years."], "answer": 1},
            {"q": "What event triggered the Great Depression?", "options": ["World War I.", "The stock market crash of October 1929.", "The end of the British Empire.", "A massive drought."], "answer": 1},
            {"q": "How many Americans were unemployed at the lowest point?", "options": ["1 million.", "15 million.", "50 million.", "5 million."], "answer": 1},
            {"q": "What helped the US economy finally recover?", "options": ["A decrease in taxes.", "Entry into World War II.", "A new gold discovery.", "Stopping all international trade."], "answer": 1},
            {"q": "Name one long-term legacy of the Great Depression mentioned.", "options": ["The invention of the internet.", "Creation of Social Security and banking regulations.", "The end of capitalism.", "Moving the capital to Washington."], "answer": 1}
        ]
    }
]

data.extend(NEW_LISTENING)
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(NEW_LISTENING)} listening more modules (Total: {len(data)})")
