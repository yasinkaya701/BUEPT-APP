import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/listening_tasks.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

NEW_LISTENING = [
    {
        "id": "l_41",
        "title": "Philosophy: The Socratic Method",
        "level": "C1",
        "type": "Lecture",
        "transcript": "The Socratic method, named after the Greek philosopher Socrates, is a form of cooperative argumentative dialogue between individuals, based on asking and answering questions to stimulate critical thinking and to draw out ideas and underlying presuppositions. Rather than providing direct answers, a teacher using the Socratic method asks questions that lead the student to discover the truth on their own. This process often reveals contradictions in one's beliefs, leading to 'aporia' or a state of bewilderment. Socrates believed that 'the unexamined life is not worth living,' and this method remains a foundational tool in legal education and philosophical inquiry today.",
        "questions": [
            {"q": "What is the primary feature of the Socratic method?", "options": ["Giving long lectures.", "Asking and answering questions to stimulate critical thinking.", "Reading ancient books.", "Writing poems."], "answer": 1},
            {"q": "How does a teacher using this method help a student?", "options": ["By giving them the answers.", "By leading them to discover truth through questions.", "By telling them to stop thinking.", "By grading them strictly."], "answer": 1},
            {"q": "Define 'aporia' based on the text.", "options": ["A state of happiness.", "A state of bewilderment or confusion.", "A new idea.", "The end of a book."], "answer": 1},
            {"q": "What was Socrates's view on the 'unexamined life'?", "options": ["It is the best life.", "It is not worth living.", "It is very easy.", "It is for animals."], "answer": 1},
            {"q": "In which field is this method still widely used today?", "options": ["Culinary arts.", "Legal education.", "Carpentry.", "Sports."], "answer": 1}
        ]
    },
    {
        "id": "l_42",
        "title": "Biology: The Process of Photosynthesis",
        "level": "B2",
        "type": "Lecture",
        "transcript": "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water. Photosynthesis in plants generally involves the green pigment chlorophyll and generates oxygen as a byproduct. The process can be divided into two stages: the light-dependent reactions, which capture energy from light, and the light-independent reactions (or the Calvin cycle), which use that energy to create sugar. This process is the foundation of life on Earth, as it provides the oxygen we breathe and the food energy for nearly all living things. Without photosynthesis, the atmosphere would lack the necessary oxygen to support complex life.",
        "questions": [
            {"q": "What are the three main components needed for photosynthesis?", "options": ["Soil, Rock, Dust.", "Sunlight, Carbon Dioxide, and Water.", "Oxygen, Nitrogen, Argon.", "Wind, Rain, Heat."], "answer": 1},
            {"q": "Which pigment is responsible for capturing light energy?", "options": ["Hemoglobin.", "Chlorophyll.", "Melanin.", "Xanthophyll."], "answer": 1},
            {"q": "What is the primary byproduct of photosynthesis for humans?", "options": ["Sugar.", "Oxygen.", "Carbon dioxide.", "Water."], "answer": 1},
            {"q": "What is the second stage of photosynthesis called?", "options": ["The Light Race.", "The Calvin Cycle.", "The Krebs Cycle.", "The Solar Path."], "answer": 1},
            {"q": "Why is photosynthesis considered the 'foundation of life'?", "options": ["It makes the sky blue.", "It provides oxygen and food energy.", "It keeps the Earth warm.", "It creates soil."], "answer": 1}
        ]
    },
    {
        "id": "l_43",
        "title": "Psychology: The Barnum Effect in Personality Tests",
        "level": "C1",
        "type": "Seminar",
        "transcript": "The Barnum Effect, also called the Forer Effect, is a psychological phenomenon whereby individuals give high accuracy ratings to descriptions of their personality that supposedly are tailored specifically to them, but that are, in fact, vague and general enough to apply to a wide range of people. This effect explains the widespread belief in astrology, fortune-telling, and some types of personality tests. It works because it uses 'Barnum statements' like 'You have a great deal of unused capacity which you have not turned to your advantage.' Most people want to believe positive things about themselves and will find personal meaning in these generalities. Research shows that people are more likely to accept these descriptions if the 'test' is perceived as being highly scientific or official.",
        "questions": [
            {"q": "What is the Barnum Effect?", "options": ["Forgetting your name.", "Rating vague personality descriptions as highly accurate.", "Fear of clowns.", "The ability to read minds."], "answer": 1},
            {"q": "Which of these is an example of a 'Barnum statement'?", "options": ["You were born on a Monday.", "You have a great deal of unused capacity.", "You weigh 70 kilograms.", "You live in a city."], "answer": 1},
            {"q": "Why do people tend to believe these general descriptions?", "options": ["They are stupid.", "They want to believe positive things about themselves.", "They have no memory.", "They are looking for attention."], "answer": 1},
            {"q": "What increases the likelihood of people accepting these descriptions?", "options": ["If the test results are negative.", "If the test is perceived as highly scientific.", "If the test is very short.", "If the test is free."], "answer": 1},
            {"q": "Name one area where the Barnum Effect is highly visible.", "options": ["Mathematics.", "Astrology and fortune-telling.", "Cooking.", "Engineering."], "answer": 1}
        ]
    },
    {
        "id": "l_44",
        "title": "Economics: The Prisoner's Dilemma",
        "level": "C1",
        "type": "Lecture",
        "transcript": "The prisoner's dilemma is a standard example of a game analyzed in game theory that shows why two completely rational individuals might not cooperate, even if it appears that it is in their best interests to do so. In the classic scenario, two prisoners are interrogated separately. If both betray each other, they each serve two years. If one betrays and the other stays silent, the betrayer goes free and the silent one serves three years. If both stay silent, they both serve only one year. For each individual, the rational choice is to betray (defect), because it yields a better individual result regardless of the other's choice. However, when both choose this 'rational' individual strategy, the outcome is worse for both than if they had cooperated by remaining silent. I must emphasize that this model is used to explain everything from arms races to price wars in businesses.",
        "questions": [
            {"q": "What does the prisoner's dilemma illustrate?", "options": ["Why criminals are caught.", "Why rational individuals might not cooperate even if it benefits them.", "How to escape from prison.", "The history of the legal system."], "answer": 1},
            {"q": "In the classic scenario, what is the 'silent' strategy called?", "options": ["Defection.", "Cooperation.", "Betrayal.", "Ignorance."], "answer": 1},
            {"q": "Why is 'betraying' the rational choice for one individual?", "options": ["It always leads to the best result for both.", "It yields a better individual result regardless of the other's choice.", "Because they hate each other.", "Because they want to stay in prison."], "answer": 1},
            {"q": "What is the result when *both* prisoners act rationally in their own self-interest?", "options": ["They both go free.", "They both serve a longer sentence than if they had cooperated.", "One goes free, one stays.", "The game ends immediately."], "answer": 1},
            {"q": "What real-world situation is explained by this model?", "options": ["Birthday parties.", "Arms races and price wars.", "Building a house.", "Writing a book."], "answer": 1}
        ]
    },
    {
        "id": "l_45",
        "title": "History: The Great Fire of London, 1666",
        "level": "B2",
        "type": "Discussion",
        "transcript": "The Great Fire of London was a major conflagration that swept through the central parts of the English city of London from September 2 to September 6, 1666. It began in a bakery in Pudding Lane and, fueled by strong winds and timber-framed buildings, quickly spread across the medieval city. Although the death toll was remarkably low, the fire consumed 13,200 houses and 87 parish churches, including St. Paul's Cathedral. Interestingly, the fire is often credited with helping to end the Great Plague of London, which had been devastating the city the previous year, by killing the rats and fleas that carried the disease. The subsequent rebuilding of London led to the creation of wider streets and brick buildings, significantly changing the city's architecture and making it safer from future fires.",
        "questions": [
            {"q": "When did the Great Fire of London occur?", "options": ["1066.", "1666.", "1866.", "1966."], "answer": 1},
            {"q": "Where did the fire start?", "options": ["A palace.", "A bakery in Pudding Lane.", "A library.", "A church."], "answer": 1},
            {"q": "What fuel made the fire spread so quickly?", "options": ["Strong winds and timber-framed buildings.", "A lot of oil.", "Large piles of paper.", "Coal mines."], "answer": 0},
            {"q": "What surprising positive effect did the fire have?", "options": ["It created more jobs.", "It helped end the Great Plague.", "It made the weather warmer.", "It improved the food."], "answer": 1},
            {"q": "How did London change after the fire?", "options": ["It was abandoned.", "It was rebuilt with wider streets and brick buildings.", "It became a park.", "It was moved to a new location."], "answer": 1}
        ]
    },
    {
        "id": "l_46",
        "title": "Astronomy: The Life Cycle of a Star",
        "level": "C1",
        "type": "Lecture",
        "transcript": "Stars are born in huge clouds of gas and dust called nebulae. Gravity pulls the matter together until it becomes hot and dense enough for nuclear fusion to begin—this is the 'protostar' stage. Once a star begins fusing hydrogen into helium, it enters the 'main sequence,' where it spends most of its life. Our Sun is currently in this stable phase. However, when the hydrogen runs out, the star expands into a 'red giant.' The final fate of a star depends on its mass. Average stars like our Sun eventually shed their outer layers and leave behind a 'white dwarf.' Massively larger stars end their lives in a 'supernova' explosion, which can leave behind a 'neutron star' or even collapse into a 'black hole.'",
        "questions": [
            {"q": "Where are stars born?", "options": ["In black holes.", "In nebulae (clouds of gas and dust).", "On planets.", "At the center of the galaxy."], "answer": 1},
            {"q": "What process powers a star in the 'main sequence'?", "options": ["Burning wood.", "Nuclear fusion (hydrogen into helium).", "Electricity.", "Solar panels."], "answer": 1},
            {"q": "What happens to a star when its hydrogen runs out?", "options": ["It disappears.", "It expands into a red giant.", "It becomes a planet.", "It turns blue."], "answer": 1},
            {"q": "What is the final stage for an average-sized star like our Sun?", "options": ["Supernova.", "White dwarf.", "Black hole.", "Neutron star."], "answer": 1},
            {"q": "What creates a black hole?", "options": ["A small star dying.", "The collapse of a very massive star after a supernova.", "Two planets crashing.", "A giant comet."], "answer": 1}
        ]
    },
    {
        "id": "l_47",
        "title": "Environmental Science: Eutrophication in Water Bodies",
        "level": "C1",
        "type": "Seminar",
        "transcript": "Eutrophication is the process by which a body of water becomes overly enriched with minerals and nutrients which induce excessive growth of algae. This process may result in oxygen depletion of the water body. The main drivers are nitrogen and phosphorus, often from agricultural runoff (fertilizers) and sewage. When these nutrients enter a lake or river, they cause an 'algal bloom.' As the dense layer of algae dies and decomposes, microbes consume nearly all the dissolved oxygen in the water. This creates 'dead zones' where fish and other aquatic life cannot survive. Eutrophication not only kills biodiversity but also compromises water quality for human use and recreation.",
        "questions": [
            {"q": "What is eutrophication?", "options": ["Water becoming very clean.", "Water becoming overly enriched with nutrients, causing algae growth.", "The movement of water into the ocean.", "Drought in a lake."], "answer": 1},
            {"q": "What are the two main nutrients that drive this process?", "options": ["Oxygen and carbon.", "Nitrogen and phosphorus.", "Gold and silver.", "Salt and sugar."], "answer": 1},
            {"q": "What is a major source of these nutrients?", "options": ["Rainwater.", "Agricultural runoff from fertilizers.", "Wind.", "Trees."], "answer": 1},
            {"q": "Why do fish die during eutrophication?", "options": ["They eat too much algae.", "The decomposing algae use up all the dissolved oxygen.", "The water becomes too hot.", "The algae are poisonous."], "answer": 1},
            {"q": "What are 'dead zones'?", "options": ["Areas in space.", "Areas in water with too little oxygen for life to survive.", "Old cemeteries.", "Abandoned cities."], "answer": 1}
        ]
    },
    {
        "id": "l_48",
        "title": "Linguistics: Phonemes versus Morphemes",
        "level": "B2",
        "type": "Lecture",
        "transcript": "In linguistics, it's essential to distinguish between the smallest units of sound and the smallest units of meaning. A 'phoneme' is the smallest unit of sound that can change the meaning of a word. For example, in 'bat' and 'cat', the /b/ and /c/ sounds are different phonemes. A 'morpheme', on the other hand, is the smallest unit of *meaning* or grammatical function. This can be a whole word, like 'cat', or a suffix, like the 's' in 'cats', which adds the meaning of 'plural.' Some morphemes are 'free', meaning they can stand alone, while others are 'bound', meaning they must be attached to another word. Understanding these levels is key to analyzing how any language is structured.",
        "questions": [
            {"q": "What is a phoneme?", "options": ["A type of letter.", "The smallest unit of sound that changes meaning.", "A whole word.", "A sentence structure."], "answer": 1},
            {"q": "Give an example of two phonemes based on the text.", "options": ["'cat' and 'dog'.", "The /b/ in 'bat' and /c/ in 'cat'.", "'s' in 'cats'.", "A loud noise."], "answer": 1},
            {"q": "What is a morpheme?", "options": ["A types of book.", "The smallest unit of meaning or grammatical function.", "A single vowel.", "A paragraph."], "answer": 1},
            {"q": "What does the 's' in 'cats' represent in linguistics?", "options": ["A phoneme.", "A morpheme (adding plural meaning).", "A mistake.", "A silent letter."], "answer": 1},
            {"q": "What's the difference between a free and bound morpheme?", "options": ["Fast vs slow.", "A free one can stand alone; a bound one must be attached.", "Big vs small.", "Written vs spoken."], "answer": 1}
        ]
    },
    {
        "id": "l_49",
        "title": "Anthropology: Ötzi the Iceman",
        "level": "C1",
        "type": "Discussion",
        "transcript": "Ötzi the Iceman is a natural mummy of a man who lived between 3350 and 3105 BCE, discovered in 1991 in the Ötztal Alps. Because his body was frozen and preserved in ice, anthropologists have been able to gain unprecedented insights into Copper Age life. Analysis of his clothing, tools (including a copper axe), and even his last meals has revealed a complex story. For example, he had tattoos, possibly for medicinal purposes, and samples from his stomach showed he had recently eaten ibex and grains. X-rays eventually revealed an arrowhead lodged in his shoulder, suggesting he was killed during a conflict. Ötzi provides a unique, direct link to our distant human past, far more detailed than stone archaeology alone.",
        "questions": [
            {"q": "Who was Ötzi the Iceman?", "options": ["A modern explorer.", "A natural mummy from the Copper Age.", "A king of the Alps.", "A fictional character."], "answer": 1},
            {"q": "When was he discovered?", "options": ["1891.", "1991.", "2001.", "1950."], "answer": 1},
            {"q": "What was unique about the tool he was carrying?", "options": ["It was made of plastic.", "It was a copper axe.", "It was a gold sword.", "He had no tools."], "answer": 1},
            {"q": "What did scientists find in his stomach?", "options": ["Nothing.", "Ibex (wild goat meat) and grains.", "Modern food.", "Fish and wine."], "answer": 1},
            {"q": "How did Ötzi likely die?", "options": ["Old age.", "An arrow wound revealed by X-rays.", "A fall.", "Freezing in a storm."], "answer": 1}
        ]
    },
    {
        "id": "l_50",
        "title": "Sociology: Émile Durkheim’s Study on Suicide",
        "level": "C2",
        "type": "Lecture",
        "transcript": "Émile Durkheim, one of the founders of sociology, conducted a landmark study on suicide in 1897. His goal was to prove that suicide, which seems like a purely individual act, is strongly influenced by social factors. He analyzed statistical data from different countries and discovered that suicide rates vary consistently between different social groups. He identified four types of suicide based on the level of social integration and regulation. 'Egoistic' suicide occurs when a person is poorly integrated into society. 'Anomic' suicide happens during periods of social chaos where norms break down. 'Altruistic' suicide occurs when someone is *too* integrated (e.g., dying for a cause). Durkheim’s work proved that even our most private acts have deep social roots.",
        "questions": [
            {"q": "What was Durkheim's goal in his study on suicide?", "options": ["To find a cure for doctors.", "To prove that individual acts are influenced by social factors.", "To teach people how to live longer.", "To study the history of Rome."], "answer": 1},
            {"q": "Which data did Durkheim analyze?", "options": ["His own dreams.", "Statistical data from different countries/social groups.", "Private letters.", "Newspaper opinions."], "answer": 1},
            {"q": "Define 'anomic' suicide.", "options": ["Happens when someone is too famous.", "Occurs during social chaos where norms break down.", "Dying for a friend.", "Suicide out of selfishness."], "answer": 1},
            {"q": "What is 'altruistic' suicide in this context?", "options": ["Dying for a cause or group.", "Dying because you are lonely.", "Accidental death.", "Dying because of health issues."], "answer": 0},
            {"q": "What did this work prove about private acts?", "options": ["They are completely random.", "They have deep social roots.", "They are not important to sociology.", "They are only psychological."], "answer": 1}
        ]
    },
    {
        "id": "l_51",
        "title": "Physics: Static Electricity and Charge Transfer",
        "level": "B2",
        "type": "Demonstration",
        "transcript": "Static electricity is an imbalance of electric charges within or on the surface of a material. The charge remains until it is able to move away by means of an electric current or electrical discharge. We can create static electricity by rubbing two different materials together, a process called 'triboelectric' charging. This causes electrons to jump from one material to the other. For example, if you rub a balloon against your hair, electrons move from your hair to the balloon. The balloon becomes negatively charged, while your hair becomes positively charged. Because opposite charges attract, the balloon will then stick to things, and your hair might stand up. The 'spark' you feel when touching a metal handle is just the sudden discharge of that accumulated energy.",
        "questions": [
            {"q": "What is static electricity?", "options": ["Current in a wire.", "An imbalance of electric charges on a material's surface.", "A type of battery.", "Magnetism."], "answer": 1},
            {"q": "What is 'triboelectric' charging?", "options": ["Charging a phone.", "Creating static charge by rubbing two materials together.", "A way to use solar energy.", "A types of light."], "answer": 1},
            {"q": "What particles jump between materials to create charge?", "options": ["Protons.", "Neutrons.", "Electrons.", "Atoms."], "answer": 2},
            {"q": "Why does hair stand up after being rubbed with a balloon?", "options": ["It gets hot.", "Opposite charges attract or like charges repel.", "It's a chemical reaction.", "The hair becomes heavy."], "answer": 1},
            {"q": "What is the 'spark' you feel on a metal handle?", "options": ["A small fire.", "Sudden discharge of accumulated static energy.", "A bad wire.", "A nerve reaction."], "answer": 1}
        ]
    },
    {
        "id": "l_52",
        "title": "Neuroscience: The Function of the Amygdala",
        "level": "C1",
        "type": "Lecture",
        "transcript": "The amygdala is a small, almond-shaped cluster of nuclei located deep within the brain's temporal lobe. It is the primary processing center for emotions, especially those related to survival, such as fear and aggression. When you encounter a threat, the amygdala triggers the 'fight-or-flight' response, sending signals to the rest of your body to prepare for action. This happens almost instantly, often before your conscious mind even realizes what the threat is. Studies of 'Patient SM,' who had damage to her amygdala, showed that she was unable to experience fear in dangerous situations. While vital for survival, an overactive amygdala is also linked to anxiety disorders and PTSD, where the brain remains in a constant state of high alert.",
        "questions": [
            {"q": "Where is the amygdala located?", "options": ["The spinal cord.", "Deep within the brain's temporal lobe.", "In the eyes.", "On the skin."], "answer": 1},
            {"q": "What is the primary function of the amygdala?", "options": ["Processing language.", "Processing emotions like fear and aggression.", "Controlling motor skills.", "Storing long-term facts."], "answer": 1},
            {"q": "Which survival response does it trigger?", "options": ["Eat or sleep.", "Fight-or-flight.", "Think and wait.", "Run and hide only."], "answer": 1},
            {"q": "What happened to Patient SM who had amygdala damage?", "options": ["She couldn't speak.", "She was unable to experience fear.", "She lost her memory.", "She could not see colors."], "answer": 1},
            {"q": "What disorder is linked to an overactive amygdala?", "options": ["Diabetes.", "Anxiety disorders and PTSD.", "Cancer.", "Broken bones."], "answer": 1}
        ]
    },
    {
        "id": "l_53",
        "title": "Environmental Science: Desertification",
        "level": "C1",
        "type": "Lecture",
        "transcript": "Desertification is a type of land degradation in which relatively dry areas of land become increasingly arid, typically losing its bodies of water as well as vegetation and wildlife. It's often caused by a combination of climate change and human activities such as overgrazing, deforestation, and poor irrigation practices. When the vegetation is removed, the soil loses its ability to retain moisture and is easily eroded by wind and rain. This creates a cycle where the land becomes less and less productive. Desertification is a global issue, particularly in the Sahel region of Africa, where it threatens the food security and livelihoods of millions. Efforts to combat it include 'Great Green Wall' projects—planting vast belts of trees to halt the desert's expansion.",
        "questions": [
            {"q": "What is desertification?", "options": ["Building cities in the desert.", "Land degradation making dry areas increasingly arid.", "A types of storm.", "Planting new forests."], "answer": 1},
            {"q": "Name one human cause of desertification.", "options": ["Overgrazing or deforestation.", "Building skyscrapers.", "The internet.", "Solar energy."], "answer": 0},
            {"q": "Why does removing vegetation lead to desertification?", "options": ["It makes the soil too cold.", "The soil loses its ability to retain moisture and erodes.", "The plants were producing oil.", "The sun gets brighter."], "answer": 1},
            {"q": "Which region is famously affected by desertification?", "options": ["Greenland.", "The Sahel region of Africa.", "The Amazon.", "The Alps."], "answer": 1},
            {"q": "What is one method to combat desertification mentioned?", "options": ["Building giant fans.", "Great Green Wall projects (planting trees).", "Replacing soil with sand.", "Removing all water."], "answer": 1}
        ]
    },
    {
        "id": "l_54",
        "title": "Economics: Market Equilibrium and Price Signals",
        "level": "B2",
        "type": "Lecture",
        "transcript": "In microeconomics, market equilibrium is a situation where the quantity of a good supplied by producers is exactly equal to the quantity demanded by consumers at a certain price. This price is called the 'equilibrium price.' If the price is too high, there is a 'surplus' because more people want to sell than buy. If the price is too low, there is a 'shortage' because more people want to buy than sell. In a free market, prices act as signals that guide consumers and producers. A high price signals producers to make more and consumers to buy less, eventually bringing the market back to balance. This 'invisible hand' of the market ensures that resources are allocated efficiently without needing a central manager.",
        "questions": [
            {"q": "What is market equilibrium?", "options": ["The government sets all prices.", "Product supply equals consumer demand at a certain price.", "The market is closed for holidays.", "Only one person is buying."], "answer": 1},
            {"q": "What happens when the price is too high?", "options": ["A shortage.", "A surplus (more supply than demand).", "A fire.", "Everyone gets rich."], "answer": 1},
            {"q": "What is a 'shortage'?", "options": ["Too many goods.", "Quantity demanded is greater than quantity supplied.", "The price is too high.", "Nobody wants the good."], "answer": 1},
            {"q": "How do prices act as 'signals'?", "options": ["They are bright lights.", "They guide behavior of producers and consumers.", "They show the date.", "They are used for counting people."], "answer": 1},
            {"q": "What is the result of the 'invisible hand' in equilibrium?", "options": ["Inefficient waste.", "Efficient allocation of resources.", "Total chaos.", "Higher taxes."], "answer": 1}
        ]
    },
    {
        "id": "l_55",
        "title": "History: The Industrial Revolution and Urbanization",
        "level": "C1",
        "type": "Podcast",
        "transcript": "The Industrial Revolution, which began in Britain in the late 18th century, was a period of rapid development in manufacturing and transport. The shift from hand production to machine production led to a massive increase in factory jobs, especially in the textile industry. This sparked an unprecedented wave of urbanization, as millions of people moved from rural farms to rapidly growing industrial cities like Manchester and Birmingham. While this led to economic growth, it also created miserable living conditions in overcrowded slums, with poor sanitation and long working hours. The social changes of this era eventually led to the rise of labor unions and the first laws protecting workers' rights. It was the birth of our modern-day industrial society.",
        "questions": [
            {"q": "Where did the Industrial Revolution begin?", "options": ["USA.", "Britain.", "China.", "France."], "answer": 1},
            {"q": "What was the main shift in production?", "options": ["From machines to hand production.", "From hand production to machine production.", "From food to clothing.", "From wood to plastic."], "answer": 1},
            {"q": "Why did people move to cities during this time?", "options": ["For factory jobs.", "To go to university.", "To see the king.", "Because the farms were too big."], "answer": 0},
            {"q": "What was a negative side effect of rapid urbanization?", "options": ["Too much money.", "Overcrowded slums and poor sanitation.", "Fewer factory jobs.", "Too many trees."], "answer": 1},
            {"q": "What social movement arose as a result of these conditions?", "options": ["The space race.", "Labor unions.", "The French Revolution.", "The Renaissance."], "answer": 1}
        ]
    },
    {
        "id": "l_56",
        "title": "Psychology: Carol Dweck and the Growth Mindset",
        "level": "B2",
        "type": "Lecture",
        "transcript": "Psychologist Carol Dweck is famous for her research on two distinct mindsets: the 'fixed' mindset and the 'growth' mindset. In a fixed mindset, people believe their basic qualities, like their intelligence or talent, are fixed traits that cannot be changed. They fear failure because it seems to prove they aren't smart. In a growth mindset, however, people believe that their most basic abilities can be developed through dedication and hard work—brains and talent are just the starting point. This view creates a love of learning and a resilience that is essential for great accomplishment. Dweck's research shows that the way we praise others—focusing on effort rather than innate talent—can significantly influence their mindset and success.",
        "questions": [
            {"q": "Who is the researcher behind the fixed vs growth mindset theory?", "options": ["Sigmund Freud.", "Carol Dweck.", "Abraham Maslow.", "Jane Goodall."], "answer": 1},
            {"q": "What do people in a 'fixed' mindset believe?", "options": ["They can learn anything.", "Their intelligence is a fixed trait.", "Hard work is fun.", "Failure is not possible."], "answer": 1},
            {"q": "Define the 'growth' mindset.", "options": ["Believing qualities are fixed.", "Believing abilities can be developed through hard work.", "Growing taller.", "Thinking you are already perfect."], "answer": 1},
            {"q": "What is a key benefit of a growth mindset?", "options": ["Never working.", "A love of learning and resilience.", "Instant success.", "Being popular."], "answer": 1},
            {"q": "What should we praise to encourage a growth mindset?", "options": ["Innate talent.", "Effort and dedication.", "Grade point average.", "Good luck."], "answer": 1}
        ]
    },
    {
        "id": "l_57",
        "title": "Ecology: The Role of Keystone Species",
        "level": "C1",
        "type": "Lecture",
        "transcript": "A keystone species is a species that has a disproportionately large effect on its natural environment relative to its abundance. Just as a keystone holds an arch together, these species hold an entire ecosystem together. A classic example is the sea otter. Sea otters eat sea urchins. In areas without otters, sea urchins overgraze on kelp forests, leading to the collapse of the entire marine habitat. Another example is the grey wolf. When wolves were reintroduced to Yellowstone National Park, they controlled elk populations, which allowed trees to grow back and rivers to change course. Protecting keystone species is a top priority for conservationists because losing even one can lead to a cascade of disappearances in the ecosystem.",
        "questions": [
            {"q": "What is a keystone species?", "options": ["A very common animal.", "A species with a disproportionately large effect on its environment.", "A species that lives in caves.", "The biggest predator."], "answer": 1},
            {"q": "What happens to the ecosystem if a keystone species is removed?", "options": ["It becomes stronger.", "It can collapse or change dramatically.", "It has no effect.", "More animals arrive."], "answer": 1},
            {"q": "Why are sea otters considered a keystone species?", "options": ["They are cute.", "They keep sea urchin populations in check, protecting kelp forests.", "They produce a lot of oxygen.", "They build dams."], "answer": 1},
            {"q": "What happened when wolves returned to Yellowstone?", "options": ["They killed all the trees.", "They controlled elks, allowing vegetation to recover.", "They left the park.", "They ate the visitors."], "answer": 1},
            {"q": "Why are these species a priority for conservation?", "options": ["They are rare.", "Losing one can lead to an ecosystem collapse.", "They are easier to catch.", "They only live in parks."], "answer": 1}
        ]
    },
    {
        "id": "l_58",
        "title": "Economics: The Concept of Hyperinflation",
        "level": "C1",
        "type": "Lecture",
        "transcript": "Hyperinflation is a term used to describe rapid, excessive, and out-of-control general price increases in an economy. While inflation is a normal part of economics, hyperinflation typically involves prices rising more than 50% per month. The most famous example occurred in Weimar Germany in the 1920s, where prices doubled every few days, and people needed wheelbarrows of cash to buy bread. Hyperinflation is usually caused by a sudden increase in the money supply that is not supported by economic growth—essentially, the government prints too much money to pay off its debts. This destroys the value of the currency and people's savings, often leading to social and political instability.",
        "questions": [
            {"q": "What is hyperinflation?", "options": ["Prices going down slowly.", "Rapid, out-of-control price increases (over 50% per month).", "A types of computer game.", "The cost of flying to space."], "answer": 1},
            {"q": "When did a famous example occur in Weimar Germany?", "options": ["1720s.", "1920s.", "1990s.", "2020s."], "answer": 1},
            {"q": "What did people in 1920s Germany need to buy bread?", "options": ["One coin.", "Wheelbarrows of cash.", "A credit card.", "A secret password."], "answer": 1},
            {"q": "What is the primary cause of hyperinflation?", "options": ["Too much gold.", "Printing too much money not supported by growth.", "Not enough demand.", "Banning all trade."], "answer": 1},
            {"q": "What is a consequence of hyperinflation?", "options": ["Savings become more valuable.", "The value of currency and savings is destroyed.", "The government gets richer.", "Everyone stops working."], "answer": 1}
        ]
    },
    {
        "id": "l_59",
        "title": "Zoology: The Social Structure of Bees",
        "level": "B2",
        "type": "Demonstration",
        "transcript": "Honey bees are social insects that live in complex colonies with a highly organized social structure. A typical colony contains one queen, hundreds of male drones, and tens of thousands of female worker bees. The queen is the only fertile female and her primary job is to lay eggs. Drones exist only to mate with the queen. The worker bees perform all the tasks needed to maintain the hive, from collecting pollen and nectar to cleaning the hive and nursing the young. Bees communicate using a 'waggle dance,' which tells other foragers the exact direction and distance to a rich food source. This level of cooperation makes bees one of the most successful and important groups of pollinators on the planet.",
        "questions": [
            {"q": "What are the three types of bees in a colony?", "options": ["King, Queen, Soldier.", "Queen, Drone, Worker.", "Pilot, Builder, Nurse.", "Fly, Stinger, Honey."], "answer": 1},
            {"q": "What is the primary job of the queen bee?", "options": ["Collecting honey.", "Laying eggs.", "Guarding the entrance.", "Dancing."], "answer": 1},
            {"q": "What is the role of male drones?", "options": ["Hard labor.", "Mating with the queen.", "Cleaning the hive.", "Building wax."], "answer": 1},
            {"q": "How do bees communicate the location of food?", "options": ["Singing.", "Using a 'waggle dance'.", "Leaving a trail of wax.", "Making loud buzzing noises."], "answer": 1},
            {"q": "Why are worker bees important for the hive?", "options": ["They are the biggest.", "They perform all maintenance, collection, and nursing tasks.", "They are the only ones with wings.", "They become the next queen."], "answer": 1}
        ]
    },
    {
        "id": "l_60",
        "title": "Technology: The Ethics of Self-Driving Cars",
        "level": "C1",
        "type": "Discussion",
        "transcript": "As autonomous vehicles become more advanced, we face the 'trolley problem' in a real-world setting. If an accident is unavoidable, how should the car's AI prioritize lives? Should it protect its occupants at all costs, or should it minimize the total number of casualties, even if it means hitting a wall and killing the driver? Furthermore, there are questions of legal liability: if a self-driving car crashes, who is responsible—the owner, the software programmer, or the manufacturer? While autonomous cars promise to eliminate the 90% of accidents caused by human error, these ethical and legal dilemmas must be solved before we see widespread adoption on our roads. It's a classic case of technology developing faster than our legal and moral frameworks.",
        "questions": [
            {"q": "What ethical problem do self-driving cars face?", "options": ["High fuel costs.", "The 'trolley problem' of prioritizing lives in an accident.", "They are too fast.", "They lack color choice."], "answer": 1},
            {"q": "What is the 'trolley problem' metaphor for?", "options": ["Train schedules.", "Choosing between different bad outcomes in an unavoidable accident.", "How to use a brake.", "Saving money on transit."], "answer": 1},
            {"q": "Who might be legally liable for an autonomous car crash?", "options": ["Only the car.", "The owner, programmer, or manufacturer.", "The person walking.", "Nobody."], "answer": 1},
            {"q": "What is one major promise of autonomous vehicles?", "options": ["Unlimited speed.", "Eliminating 90% of accidents caused by human error.", "Free travel.", "Curing traffic jams."], "answer": 1},
            {"q": "Why is adoption difficult despite the technology?", "options": ["Technology is too slow.", "The technology outpaces legal and moral frameworks.", "The cars are too small.", "The colors are too bright."], "answer": 1}
        ]
    }
]

data.extend(NEW_LISTENING)
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(NEW_LISTENING)} listening more modules (Total: {len(data)})")
