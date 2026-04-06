import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/reading_tasks.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

NEW_READING = [
    {
        "id": "r_81",
        "title": "Medicine: The Science of the Placebo Effect",
        "level": "C1",
        "text": "The placebo effect is a remarkable phenomenon where a patient experiences a real improvement in their condition after receiving a 'dummy' treatment, such as a sugar pill, that has no active pharmaceutical ingredients. This effect is driven by the patient's expectation of healing, which triggers the brain to release its own natural pain-relieving chemicals, like endorphins. Clinical trials must always include a placebo group to determine if a new drug is actually more effective than the power of belief alone. Interestingly, the color, price, and even the method of delivery (injection vs. pill) can influence the strength of the placebo effect. While once dismissed as 'all in the head,' modern neuroscience shows that placebos cause real, measurable changes in brain activity and body chemistry.",
        "questions": [
            {"q": "What is the placebo effect?", "options": ["A types of vaccine.", "Real improvement caused by a treatment with no active ingredients.", "A side effect of strong medicine.", "A psychological disorder."], "answer": 1},
            {"q": "What triggers the brain to release healing chemicals in this effect?", "options": ["The sugar in the pill.", "The patient's expectation of healing.", "Exercise.", "A loud noise."], "answer": 1},
            {"q": "Why are placebo groups used in clinical trials?", "options": ["To save money.", "To see if a drug is truly more effective than belief alone.", "To test the sugar quality.", "To trick the doctors."], "answer": 1},
            {"q": "Which factor can influence the strength of the placebo effect?", "options": ["The weather.", "The color and price of the treatment.", "The day of the week.", "The patient's name."], "answer": 1},
            {"q": "What does modern neuroscience show about placebos?", "options": ["They are a waste of time.", "They cause real, measurable changes in brain activity.", "They only work on children.", "They are very dangerous."], "answer": 1}
        ]
    },
    {
        "id": "r_82",
        "title": "Law: The Presumption of Innocence",
        "level": "B2",
        "text": "The presumption of innocence is a fundamental legal principle that any person accused of an offense is considered innocent until proven guilty according to law. This means that the 'burden of proof' lies with the prosecution, who must present evidence that establishes the defendant's guilt 'beyond a reasonable doubt.' If there is any logical doubt, the person must be acquitted. This principle protects individuals from the power of the state and prevents innocent people from being wrongly convicted. While it can be controversial in high-profile cases, it remains the cornerstone of fair and just legal systems in democratic societies around the world.",
        "questions": [
            {"q": "What does 'presumption of innocence' mean?", "options": ["The accused must prove they are innocent.", "The accused is considered innocent until proven guilty.", "Everyone is always guilty.", "Lawyers are never wrong."], "answer": 1},
            {"q": "Where does the 'burden of proof' lie?", "options": ["With the judge.", "With the prosecution.", "With the defendant.", "With the jury."], "answer": 1},
            {"q": "What is the standard for proving guilt in a criminal case?", "options": ["Beyond a reasonable doubt.", "Probably guilty.", "Guilty unless proven innocent.", "Depending on the crime."], "answer": 0},
            {"q": "What does this principle protect individuals from?", "options": ["Taxes.", "The power of the state and wrongful conviction.", "Other people.", "Paying for a lawyer."], "answer": 1},
            {"q": "Why is this principle considered a 'cornerstone'?", "options": ["It is very old.", "It ensures a fair and just legal system.", "It is only used in cities.", "It is written in stone."], "answer": 1}
        ]
    },
    {
        "id": "r_83",
        "title": "Art History: The Influence of the Bauhaus Movement",
        "level": "C1",
        "text": "The Bauhaus was an influential German art school that combined crafts and the fine arts, active from 1919 to 1933. Its philosophy was 'form follows function,' meaning that the design of an object or building should be based primarily on its intended purpose rather than decoration. The movement sought to bridge the gap between art and industry, creating functional, mass-produced designs that were accessible to everyone. Bauhaus designers like Walter Gropius and Mies van der Rohe pioneered modern architecture, characterized by clean lines, geometric shapes, and industrial materials like steel and glass. Though the school was closed by the Nazis, its ideas spread across the globe and continue to influence modern architecture and graphic design today.",
        "questions": [
            {"q": "What was the core philosophy of the Bauhaus?", "options": ["Decoration first.", "Form follows function.", "Art for the rich only.", "Traditional beauty."], "answer": 1},
            {"q": "Between which two areas did the school bridge the gap?", "options": ["Math and Science.", "Art and Industry.", "War and Peace.", "Nature and Cities."], "answer": 1},
            {"q": "What was the goal of Bauhaus design?", "options": ["Unique, handmade art.", "Functional, mass-produced, accessible designs.", "Very expensive buildings.", "Using only wood."], "answer": 1},
            {"q": "Which materials were commonly used in Bauhaus architecture?", "options": ["Marble and Gold.", "Steel and glass.", "Mud and Straw.", "Plastic only."], "answer": 1},
            {"q": "Why did the Bauhaus school eventually close?", "options": ["It ran out of money.", "It was closed by the Nazis in 1933.", "The students left.", "A fire."], "answer": 1}
        ]
    },
    {
        "id": "r_84",
        "title": "Engineering: The Principles of Lean Manufacturing",
        "level": "C1",
        "text": "Lean manufacturing is a methodology developed primarily by Toyota in Japan, focused on minimizing waste within manufacturing systems while simultaneously maximizing productivity. 'Waste' is defined as any activity that consumes resources but adds no value to the customer. The five key principles are: defining value, mapping the value stream, creating flow, establishing pull, and pursuing perfection. By identifying and eliminating inefficiencies—such as overproduction, waiting times, and defects—companies can produce higher-quality goods more quickly and at a lower cost. Today, the 'Lean' philosophy has spread beyond the factory floor into healthcare, software development, and government services.",
        "questions": [
            {"q": "Which company is most famous for developing Lean manufacturing?", "options": ["Ford.", "Toyota.", "Apple.", "Tesla."], "answer": 1},
            {"q": "What is the primary focus of Lean?", "options": ["Increasing waste.", "Minimizing waste and maximizing productivity.", "Hiring more workers.", "Using more space."], "answer": 1},
            {"q": "How is 'waste' defined in this methodology?", "options": ["Garbage in the factory.", "Any activity consuming resources without adding customer value.", "Unused energy.", "Old machines."], "answer": 1},
            {"q": "Name one of the five key principles of Lean.", "options": ["Defining value.", "Increasing price.", "Hiding errors.", "Slow production."], "answer": 0},
            {"q": "In which non-factory area has Lean been applied?", "options": ["Sports coaching.", "Healthcare and software development.", "Farming.", "Classical music."], "answer": 1}
        ]
    },
    {
        "id": "r_85",
        "title": "Biology: The Endosymbiotic Theory of Cell Evolution",
        "level": "C2",
        "text": "The endosymbiotic theory explains the origin of complex 'eukaryotic' cells from simpler 'prokaryotic' ancestors. It suggests that organelles like mitochondria and chloroplasts were once free-living bacteria that were engulfed by a larger cell billions of years ago. Instead of being digested, these bacteria entered a symbiotic relationship, providing energy to the host cell in exchange for protection. Over time, they became permanent parts of the cell. Evidence for this theory includes the fact that mitochondria and chloroplasts have their own separate DNA, similar to bacterial DNA, and reproduce independently of the rest of the cell. This theory, championed by Lynn Margulis, was initially met with skepticism but is now a cornerstone of evolutionary biology.",
        "questions": [
            {"q": "What does the endosymbiotic theory explain?", "options": ["The extinction of dinosaurs.", "The origin of eukaryotic cells from prokaryotic ones.", "How cells breathe.", "The structure of the ocean."], "answer": 1},
            {"q": "Which organelles are thought to have been free-living bacteria?", "options": ["Nucleus and Ribosomes.", "Mitochondria and chloroplasts.", "Cell wall and membrane.", "Cytoplasm."], "answer": 1},
            {"q": "Why were the bacteria not digested by the larger cell?", "options": ["They were too small.", "They entered a symbiotic relationship.", "They were poisonous.", "They were already dead."], "answer": 1},
            {"q": "What is a key piece of evidence for this theory?", "options": ["Mitochondria have their own DNA.", "The cell uses oxygen.", "Bacteria are found in the stomach.", "Cells have color."], "answer": 0},
            {"q": "Who was the main champion of this theory?", "options": ["Charles Darwin.", "Lynn Margulis.", "Gregor Mendel.", "James Watson."], "answer": 1}
        ]
    },
    {
        "id": "r_86",
        "title": "Physics: The Standard Model of Particle Physics",
        "level": "C2",
        "text": "The Standard Model is the theoretical framework that describes the fundamental particles that make up all matter and the forces that govern their interactions. It categorizes particles into 'quarks' (which form protons and neutrons), 'leptons' (including electrons), and 'bosons' (force-carriers). For example, the photon is the boson for electromagnetism, while the gluon holds quarks together. The discovery of the 'Higgs Boson' in 2012 confirmed the mechanism by which particles acquire mass. While the Standard Model is incredibly accurate, it is known to be incomplete, as it does not include gravity or explain dark matter and dark energy. Physicists around the world are now searching for 'New Physics' that goes beyond this model.",
        "questions": [
            {"q": "What does the Standard Model describe?", "options": ["The movement of planets.", "Fundamental particles and forces.", "The history of the Earth.", "The speed of light."], "answer": 1},
            {"q": "Which particles form protons and neutrons?", "options": ["Leptons.", "Quarks.", "Photons.", "Gluons."], "answer": 1},
            {"q": "What is the function of 'bosons'?", "options": ["Forming matter.", "Carrying forces.", "Creating gravity.", "Storing energy."], "answer": 1},
            {"q": "Why was the discovery of the Higgs Boson important?", "options": ["It created a lot of energy.", "It confirmed the mechanism of how particles acquire mass.", "It showed gravity.", "It made light."], "answer": 1},
            {"q": "What is a major omission from the Standard Model?", "options": ["Electricity.", "Gravity.", "Light.", "Time."], "answer": 1}
        ]
    },
    {
        "id": "r_87",
        "title": "Marketing: The 4 Ps (Marketing Mix)",
        "level": "B2",
        "text": "The 4 Ps of marketing—Product, Price, Place, and Promotion—is a foundational model known as the marketing mix. E. Jerome McCarthy first proposed it in 1960. 'Product' refers to what the company is selling and its unique features. 'Price' is the cost to the consumer and strategy behind it. 'Place' is how the product is distributed and where consumers can buy it. 'Promotion' involves advertising, public relations, and sales strategies to reach the target audience. A successful marketing campaign requires a careful balance of these four elements, modified to fit the specific needs of the market and the desired position of the brand. In the digital age, some have expanded this to the '7 Ps' to include People, Processes, and Physical evidence.",
        "questions": [
            {"q": "Name the original 4 Ps of marketing.", "options": ["Plan, Power, People, Pride.", "Product, Price, Place, Promotion.", "Payment, Paper, Plastic, Place.", "Phone, Photo, Post, Pay."], "answer": 1},
            {"q": "What does 'Place' refer to in the marketing mix?", "options": ["The location of the office.", "How the product is distributed and sold.", "A vacation spot.", "The size of a store."], "answer": 1},
            {"q": "What does 'Promotion' involve?", "options": ["Increasing the salary.", "Advertising and sales strategies.", "Moving to a new building.", "Hiring better workers."], "answer": 1},
            {"q": "Who first proposed this model?", "options": ["Steve Jobs.", "E. Jerome McCarthy.", "Philip Kotler.", "Elon Musk."], "answer": 1},
            {"q": "What are added in the '7 Ps' version?", "options": ["Profit, Power, Price.", "People, Processes, Physical evidence.", "Photos, Posts, Pins.", "Packaging, Paper, Print."], "answer": 1}
        ]
    },
    {
        "id": "r_88",
        "title": "History: The Meiji Restoration in Japan",
        "level": "C1",
        "text": "The Meiji Restoration was a period of rapid modernization and industrialization in Japan, beginning in 1868. It saw the end of the Tokugawa shogunate (military rule) and the restoration of central power to the Emperor. Facing the threat of Western imperialism, Japan's new leaders realized they needed to modernize to survive. They abolished the feudal system, adopted a Western-style constitution and military, and invested heavily in infrastructure and education. In just a few decades, Japan transformed from a relatively isolated agrarian society into a major world power. This 'top-down' revolution is often cited as one of the most successful examples of rapid national transformation in history.",
        "questions": [
            {"q": "When did the Meiji Restoration begin?", "options": ["1768.", "1868.", "1968.", "1800."], "answer": 1},
            {"q": "What system of government did it end?", "options": ["The Japanese Republic.", "The Tokugawa shogunate (military rule).", "A democracy.", "A colony."], "answer": 1},
            {"q": "What was the primary goal of the new leaders?", "options": ["To stay isolated.", "To modernize and industrialized to survive Western imperialism.", "To move to the USA.", "To ban all trade."], "answer": 1},
            {"q": "How was the revolution categorized?", "options": ["Bottom-up.", "Top-down.", "Unsuccessful.", "Lengthy (lasting 100 years)."], "answer": 1},
            {"q": "What was the result for Japan after a few decades?", "options": ["It became a colony.", "It became a major world power.", "It returned to farming.", "It was destroyed."], "answer": 1}
        ]
    },
    {
        "id": "r_89",
        "title": "Psychology: The Halo Effect",
        "level": "C1",
        "text": "The Halo Effect is a cognitive bias in which our overall impression of a person influences how we feel and think about their character. For instance, if we find someone physically attractive, we are unconsciously more likely to believe they are also intelligent, kind, and trustworthy. We let their one 'positive' trait cast a 'halo' over their entire personality. This bias has significant impacts on various areas of life, from job interviews and classroom grading to jury trials and marketing. Celebrity endorsements rely heavily on this; because we like a famous singer, we are more likely to trust the perfume or car they are promoting, even if they have no expertise in those products.",
        "questions": [
            {"q": "What is the 'Halo Effect'?", "options": ["Wearing bright clothes.", "Allowing one positive trait to influence your total impression of a person.", "Being afraid of light.", "A technique used by angels."], "answer": 1},
            {"q": "What is an example mentioned in the text?", "options": ["Hating everyone.", "Assuming an attractive person is also intelligent and kind.", "Buying cheap shoes.", "Forgetting someone's name."], "answer": 1},
            {"q": "In which professional area can this bias affect outcomes?", "options": ["Cooking.", "Job interviews and classroom grading.", "Carpentry.", "Swimming."], "answer": 1},
            {"q": "Why do celebrity endorsements work according to this effect?", "options": ["Celebrities use the best products.", "Our liking of the celebrity makes us trust the product they promote.", "They are very rich.", "They are world-famous."], "answer": 1},
            {"q": "Is the halo effect a conscious or unconscious bias?", "options": ["Conscious.", "Unconscious.", "Only for kids.", "Only in movies."], "answer": 1}
        ]
    },
    {
        "id": "r_90",
        "title": "Environmental Science: Ocean Acidification",
        "level": "C1",
        "text": "Ocean acidification is the ongoing decrease in the pH of the Earth's oceans, caused by the uptake of carbon dioxide (CO2) from the atmosphere. Approximately 30% of the CO2 emitted by human activities dissolves into the oceans, where it reacts with water to form carbonic acid. This changes the chemical balance of the sea, making it difficult for calcifying organisms—such as corals, shellfish, and some plankton—to build and maintain their calcium carbonate shells and skeletons. As coral reefs crumble and plankton populations decline, the entire marine food web is at risk. While less talked about than global warming, ocean acidification is often called the 'other CO2 problem' because of its potentially catastrophic impact on marine biodiversity.",
        "questions": [
            {"q": "What causes ocean acidification?", "options": ["Oil spills.", "Uptake of CO2 from the atmosphere.", "Overfishing.", "Plastic waste."], "answer": 1},
            {"q": "What percentage of human-emitted CO2 is absorbed by oceans?", "options": ["10%.", "30%.", "100%.", "50%."], "answer": 1},
            {"q": "What acid is formed when CO2 dissolves in water?", "options": ["Citric acid.", "Carbonic acid.", "Sulfuric acid.", "Vinegar."], "answer": 1},
            {"q": "Which organisms are most directly harmed by this process?", "options": ["Dolphins.", "Calcifying organisms like corals and shellfish.", "Sharks.", "Whales."], "answer": 1},
            {"q": "Why is it called the 'other CO2 problem'?", "options": ["It doesn't exist.", "It's a major, less-discussed consequence of CO2 emissions.", "It's a new name for global warming.", "It's for the next century."], "answer": 1}
        ]
    },
    {
        "id": "r_91",
        "title": "Philosophy: The Concept of Nihilism",
        "level": "C2",
        "text": "Nihilism is the philosophical viewpoint that suggests that life is without objective meaning, purpose, or intrinsic value. Often associated with Friedrich Nietzsche—though his views were more complex—nihilism argues that traditional values and beliefs are unfounded. There are different forms: 'existential nihilism' argues that life has no inherent meaning, while 'cosmic nihilism' suggests humans are insignificant in the vast universe. While it can sound bleak, 'optimistic nihilism' argues that if nothing ultimately matters, we are free to create our own meaning and enjoy life without the pressure of eternal purpose. This philosophy has profoundly influenced 20th-century literature and art, particularly the 'Theater of the Absurd.'",
        "questions": [
            {"q": "What is the core viewpoint of nihilism?", "options": ["Everything is full of meaning.", "Life is without objective meaning or intrinsic value.", "People should only live for art.", "The world was created last Tuesday."], "answer": 1},
            {"q": "Which philosopher is most often associated with this concept?", "options": ["Karl Marx.", "Friedrich Nietzsche.", "John Locke.", "Plato."], "answer": 1},
            {"q": "Define 'existential nihilism'.", "options": ["Belief in a higher power.", "Idea that life has no inherent meaning.", "Searching for stars.", "Living in the wild."], "answer": 1},
            {"q": "What is 'optimistic nihilism'?", "options": ["Feeling sad about everything.", "Being free to create your own meaning since nothing matters inherently.", "Waiting for the end of the world.", "A political party."], "answer": 1},
            {"q": "Which artistic movement was influenced by this philosophy?", "options": ["The Renaissance.", "The Theater of the Absurd.", "Realism.", "Impressionism."], "answer": 1}
        ]
    },
    {
        "id": "r_92",
        "title": "Technology: The Internet of Things (IoT)",
        "level": "C1",
        "text": "The Internet of Things (IoT) refers to the billions of physical devices around the world that are now connected to the internet, all collecting and sharing data. This ranges from 'smart' kitchen appliances and thermostats to industrial sensors and self-driving cars. By embedding chips and wireless connectivity into everyday objects, they can become semi-intelligent 'smart' devices that can be controlled remotely and communicate with each other. For example, a smart fridge could track its contents and alert the owner when milk is low. While IoT promises to make our lives more efficient and convenient, it also raises significant concerns about data privacy and security, as every connected device is a potential entry point for hackers.",
        "questions": [
            {"q": "What does IoT stand for?", "options": ["Internal Output Tool.", "Internet of Things.", "Information on Technology.", "Input Only Task."], "answer": 1},
            {"q": "Give an example of an IoT device mentioned.", "options": ["A types of book.", "A 'smart' thermostat or industrial sensor.", "A simple hammer.", "A wooden table."], "answer": 1},
            {"q": "How do everyday objects become 'smart'?", "options": ["By being painted.", "By embedding chips and wireless connectivity.", "By being expensive.", "By having a name."], "answer": 1},
            {"q": "What is a benefit of IoT?", "options": ["Using more power.", "Increased efficiency and convenience.", "Lower taxes.", "No more work."], "answer": 1},
            {"q": "What is the primary concern associated with IoT?", "options": ["Weight.", "Data privacy and security.", "The color of the devices.", "Internet speed."], "answer": 1}
        ]
    },
    {
        "id": "r_93",
        "title": "Sociology: The Dynamics of Social Stratification",
        "level": "C1",
        "text": "Social stratification is a society's categorization of its people into groups based on socioeconomic factors like wealth, income, race, education, ethnicity, gender, and power. It is often visualized as a hierarchy or pyramid, with most resources concentrated at the top. Stratification is universal but varies across cultures; for example, 'caste' systems are rigid and determined by birth, while 'class' systems allow for some 'social mobility'—the ability to move between layers through education or career success. Sociologists study stratification to understand how these divisions affect life chances, access to resources, and overall social stability. It remains one of the most debated topics in social science as societies grapple with increasing inequality.",
        "questions": [
            {"q": "What is social stratification?", "options": ["Categorizing people into socioeconomic groups.", "Building large towers.", "Predicting the weather.", "The study of old maps."], "answer": 0},
            {"q": "How is stratification often visualized?", "options": ["A circle.", "A hierarchy or pyramid.", "A flat line.", "A mirror."], "answer": 1},
            {"q": "What is 'social mobility'?", "options": ["The ability to move between social layers.", "Moving to a new city.", "Using a car.", "Talking on the phone."], "answer": 0},
            {"q": "How does a 'caste' system differ from a 'class' system?", "options": ["It doesn't.", "Caste is rigid and determined by birth.", "Caste is optional.", "Class is only for students."], "answer": 1},
            {"q": "Why do sociologists study social stratification?", "options": ["To find gold.", "To understand how divisions affect life chances and access to resources.", "To make more money.", "To count the population."], "answer": 1}
        ]
    },
    {
        "id": "r_94",
        "title": "Economics: The Tragedy of the Commons",
        "level": "C1",
        "text": "The tragedy of the commons is a situation in which individual users, acting independently according to their own self-interest, behave contrary to the common good of all users by depleting or spoiling a shared resource through their collective action. The term was coined by ecologist Garrett Hardin in 1968. A classic example is a shared pasture for cattle. If each farmer adds more cows to maximize their own profit, the pasture will eventually be overgrazed and destroyed, hurting everyone. Today, this concept is used to explain environmental issues like overfishing in international waters and air pollution. Solutions often involve government regulation or the 'privatization' of the resource to ensure its long-term sustainability.",
        "questions": [
            {"q": "What is the 'tragedy of the commons'?", "options": ["A types of theater.", "Individual self-interest depleting a shared resource.", "A war between farmers.", "The end of history."], "answer": 1},
            {"q": "Who coined the term in 1968?", "options": ["Adam Smith.", "Garrett Hardin.", "David Attenborough.", "Charles Darwin."], "answer": 1},
            {"q": "What is the classic example used?", "options": ["A private garden.", "A shared pasture for cattle.", "A types of car.", "A school."], "answer": 1},
            {"q": "Which modern environmental issue is explained by this concept?", "options": ["Overfishing in international waters.", "Building more skyscrapers.", "Solar energy.", "Recycling paper."], "answer": 0},
            {"q": "What are two proposed solutions?", "options": ["Doing nothing.", "Government regulation or privatization.", "Removing all rules.", "Increasing self-interest."], "answer": 1}
        ]
    },
    {
        "id": "r_95",
        "title": "Astronomy: Exoplanets and the Habitable Zone",
        "level": "C1",
        "text": "An exoplanet is a planet that orbits a star outside our solar system. Since the first discovery in 1992, astronomers have found thousands of them using telescopes like Kepler and James Webb. A key goal is finding an 'Earth-like' planet in the 'habitable zone' (or Goldilocks zone)—the region around a star where the temperature is just right for liquid water to exist on the surface. If a planet is too close to its star, the water would boil away; if it's too far, it would freeze. Finding life beyond Earth is the ultimate prize, but we must also consider the planet's atmosphere and magnetic field, as these are crucial for protecting life from harmful radiation. Every new discovery brings us closer to answering the question: Are we alone?",
        "questions": [
            {"q": "What is an exoplanet?", "options": ["A types of comet.", "A planet orbiting a star outside our solar system.", "A small dwarf planet.", "A planet with no sun."], "answer": 1},
            {"q": "What is the 'habitable zone'?", "options": ["The center of the galaxy.", "The region where temperatures allow liquid water.", "The highest mountain on Earth.", "A types of zoo."], "answer": 1},
            {"q": "When was the first exoplanet discovered?", "options": ["1892.", "1992.", "2022.", "1950."], "answer": 1},
            {"q": "Which current telescope is used to find exoplanets?", "options": ["The Internet.", "The James Webb Space Telescope.", "A simple binoculars.", "A types of radio."], "answer": 1},
            {"q": "Besides water, what is crucial for a habitable planet?", "options": ["Having two moons.", "The atmosphere and magnetic field.", "The color of the rocks.", "The shape of the planet."], "answer": 1}
        ]
    },
    {
        "id": "r_96",
        "title": "Linguistics: Noam Chomsky and Universal Grammar",
        "level": "C2",
        "text": "Noam Chomsky revolutionized linguistics with his theory of Universal Grammar (UG). He argued that the human brain contains an innate, biological template for language, rather than learning it purely through imitation or experience (as behaviorists suggested). Chomsky pointed to the 'poverty of the stimulus'—the fact that children learn to produce infinite complex sentences despite only hearing a limited number of examples. This suggests that certain grammatical rules are hard-wired into all human brains. While languages look different on the surface, UG suggests they share a deep structure. Though controversial and challenged by newer theories of cognitive linguistics, Universal Grammar remains a massive pillar of modern science.",
        "questions": [
            {"q": "What is the core of Noam Chomsky's theory?", "options": ["Language is purely imitation.", "Humans have an innate biological template for language.", "Languages are too difficult to learn.", "Grammar is not important."], "answer": 1},
            {"q": "What is 'poverty of the stimulus'?", "options": ["Not having enough books.", "The fact that kids learn language beyond what they hear.", "Being too poor to go to school.", "A lack of intelligence."], "answer": 1},
            {"q": "What did Chomsky suggest about grammatical rules?", "options": ["They are taught by parents.", "Certain rules are hard-wired into human brains.", "They change every year.", "They are different for everyone."], "answer": 1},
            {"q": "How does UG view different languages?", "options": ["As completely unrelated.", "They look different on the surface but share a deep structure.", "As simple codes.", "As ancient secrets."], "answer": 1},
            {"q": "Is Universal Grammar widely accepted today?", "options": ["Yes, by everyone.", "It remains a pillar but is challenged by new theories.", "No, it is forgotten.", "Only in America."], "answer": 1}
        ]
    },
    {
        "id": "r_97",
        "title": "History: The Scientific Revolution",
        "level": "C1",
        "text": "The Scientific Revolution was a period of rapid development in science, mathematics, and philosophy in Europe, spanning from the mid-16th to the late 18th century. It marked the emergence of modern science, as thinkers shifted from relying on ancient authority to using observation and experimentation—the scientific method. Pioneered by figures like Copernicus, who argued the Earth revolved around the sun, and Galileo, who used the telescope to study the heavens, it culminated in Isaac Newton's laws of motion and gravitation. This era transformed the human understanding of the natural world and laid the foundation for the Enlightenment and the Industrial Revolution. It was the birth of the modern world view.",
        "questions": [
            {"q": "When was the Scientific Revolution?", "options": ["5th century.", "Mid-16th to late 18th century.", "19th century.", "Ancient Greece."], "answer": 1},
            {"q": "What was the key shift in the Scientific Revolution?", "options": ["Relying on old books only.", "Using observation and experimentation (Scientific Method).", "Banning all math.", "Stopped studying nature."], "answer": 1},
            {"q": "What did Copernicus argue?", "options": ["The Earth is flat.", "The Earth revolves around the sun.", "The moon is made of cheese.", "Stars are fireballs."], "answer": 1},
            {"q": "Who is famous for his laws of motion and gravitation?", "options": ["Darwin.", "Isaac Newton.", "Albert Einstein.", "Marie Curie."], "answer": 1},
            {"q": "What did this period lay the foundation for?", "options": ["World War I.", "The Enlightenment and Industrial Revolution.", "The Roman Empire.", "The Internet."], "answer": 1}
        ]
    },
    {
        "id": "r_98",
        "title": "Biology: The Essential Role of Enzymes",
        "level": "C1",
        "text": "Enzymes are biological catalysts, mostly proteins, that significantly speed up the rate of chemical reactions in living cells without being consumed in the process. They work by lowering the 'activation energy' needed for a reaction to occur. Each enzyme is highly specific, having an 'active site' that fits only a particular molecule (the substrate)—often compared to a lock and key. For example, amylase in our saliva breaks down starch into sugar. Enzymes are essential for almost every biological process, including digestion, DNA replication, and energy production. Without them, the chemical reactions in our bodies would happen far too slowly to sustain life.",
        "questions": [
            {"q": "What is an enzyme?", "options": ["A types of sugar.", "A biological catalyst that speeds up reactions.", "A part of the bone.", "A types of virus."], "answer": 1},
            {"q": "What are most enzymes made of?", "options": ["Fats.", "Proteins.", "Rocks.", "Water."], "answer": 1},
            {"q": "How do enzymes work?", "options": ["By getting hot.", "By lowering the activation energy of a reaction.", "By disappearing after use.", "By blocking all reactions."], "answer": 1},
            {"q": "What is the 'lock and key' metaphor for?", "options": ["The strength of a cell.", "The specificity of enzymes and their substrates.", "A security system in a lab.", "Building houses."], "answer": 1},
            {"q": "What would happen to life without enzymes?", "options": ["Nothing.", "Chemical reactions would happen too slowly to sustain life.", "Life would be faster.", "We would only need water."], "answer": 1}
        ]
    },
    {
        "id": "r_99",
        "title": "Psychology: The Pygmalion Effect in Education",
        "level": "C1",
        "text": "The Pygmalion Effect, or the self-fulfilling prophecy, is a psychological phenomenon where high expectations lead to improved performance in a given area. In a famous 1968 study, researchers told teachers that certain students were 'intellectual bloomers' who would show massive gains. These students were actually chosen at random. However, because the teachers *expected* them to succeed, they subconsciously provided more support, feedback, and encouragement. As a result, those students actually did show significant IQ gains by the end of the year. This illustrates the power of expectations in shaping human behavior, suggesting that we often become what others expect of us.",
        "questions": [
            {"q": "What is the Pygmalion Effect?", "options": ["Expecting failure.", "High expectations leading to improved performance.", "Learning music easily.", "Feeling tired at school."], "answer": 1},
            {"q": "What happened in the famous 1968 education study?", "options": ["Students were given more money.", "Randomly chosen students succeeded because of high teacher expectations.", "Teachers were replaced by computers.", "No change was found."], "answer": 1},
            {"q": "How did teachers treat the 'intellectual bloomers'?", "options": ["They ignored them.", "They provided more support, feedback, and encouragement.", "They were mean to them.", "They gave them less work."], "answer": 1},
            {"q": "What was the result for those students?", "options": ["They failed.", "They showed significant IQ gains.", "They left school.", "Nothing changed."], "answer": 1},
            {"q": "What is the broader lesson of this effect?", "options": ["Expectations don't matter.", "We often become what others expect of us.", "Only students are affected.", "It only works in math."], "answer": 1}
        ]
    },
    {
        "id": "r_100",
        "title": "Philosophy: Aristotle’s Virtue Ethics",
        "level": "C2",
        "text": "Unlike ethical theories that focus on rules (deontology) or consequences (utilitarianism), Aristotle's Virtue Ethics focuses on the character of the person. He argued that the goal of life is 'eudaimonia' (flourishing), which is achieved by practicing 'virtue'—the middle point between two extremes (the Golden Mean). For example, courage is the virtue between the extremes of cowardice (too little) and recklessness (too much). Aristotle believed that virtue is not innate but a habit that must be practiced consistently throughout one's life. By developing a virtuous character, a person will naturally make the right choices in any situation. This ancient philosophy remains a powerful alternative to modern rule-based ethics, emphasizing personal growth and moral excellence.",
        "questions": [
            {"q": "What is the focus of Aristotle's Virtue Ethics?", "options": ["Strict rules.", "The character of the person.", "Future consequences.", "Making money."], "answer": 1},
            {"q": "What is 'eudaimonia'?", "options": ["Death.", "Flourishing or living well.", "A types of planet.", "A medical drug."], "answer": 1},
            {"q": "What is the 'Golden Mean'?", "options": ["A types of bank.", "The virtuous middle point between two extremes.", "The highest possible score.", "A gold coin."], "answer": 1},
            {"q": "Give an example of a virtue and its extremes.", "options": ["Writing and Reading.", "Courage (between cowardice and recklessness).", "Hot and Cold.", "Big and Small."], "answer": 1},
            {"q": "How did Aristotle believe people become virtuous?", "options": ["They are born that way.", "Through consistent practice and habit-building.", "By reading books once.", "By lucky accidents."], "answer": 1}
        ]
    }
]

data.extend(NEW_READING)
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(NEW_READING)} reading more modules (Total: {len(data)})")
