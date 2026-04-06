import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/reading_tasks.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

NEW_READING = [
    {
        "id": "r_61",
        "title": "Political Science: The Theory of Social Contract",
        "level": "C1",
        "text": "The social contract theory posits that individuals have consented, either explicitly or tacitly, to surrender some of their freedoms and submit to the authority of the ruler in exchange for protection of their remaining rights. Philosophers like Thomas Hobbes, John Locke, and Jean-Jacques Rousseau have provided differing interpretations. Hobbes viewed life without a ruler as 'nasty, brutish, and short,' necessitating absolute authority. Locke, however, argued that the contract was conditional; if a government failed to protect life, liberty, and property, the people had a right to revolt. Rousseau's version focused on the 'general will,' suggesting that true freedom is found in following laws that the citizens themselves have created. These ideas became the cornerstone of modern constitutional democracy.",
        "questions": [
            {"q": "What is the core premise of social contract theory?", "options": ["Rulers are chosen by God.", "Individuals exchange some freedoms for protection.", "People should never follow laws.", "Property is theft."], "answer": 1},
            {"q": "How did Hobbes describe life in the state of nature?", "options": ["Peaceful and long.", "Nasty, brutish, and short.", "Free and equal.", "Unimportant."], "answer": 1},
            {"q": "What condition did Locke place on the social contract?", "options": ["It can never be broken.", "Governments must protect life, liberty, and property.", "The ruler must be a king.", "No taxes allowed."], "answer": 1},
            {"q": "What was Rousseau's focus in his theory?", "options": ["Individual wealth.", "The general will of the people.", "Military strength.", "Religious purity."], "answer": 1},
            {"q": "Which modern system did these theories influence?", "options": ["Absolute monarchy.", "Constitutional democracy.", "Feudalism.", "Tribalism."], "answer": 1}
        ]
    },
    {
        "id": "r_62",
        "title": "Astrophysics: The Mystery of Dark Matter and Dark Energy",
        "level": "C2",
        "text": "Observations of the universe suggest that visible matter—stars, planets, and galaxies—accounts for only about 5% of its total mass-energy density. The remaining 95% is composed of two mysterious substances: dark matter and dark energy. Dark matter provides the extra gravity needed to hold galaxies together, acting as an invisible 'glue.' Despite decades of research, it has never been directly detected, as it does not emit or reflect light. Dark energy, on the other hand, is a repulsive force that is causing the expansion of the universe to accelerate. While dark matter pulls things together, dark energy pushes them apart. Understanding these components is the greatest challenge in modern cosmology, as they determine the ultimate fate of the universe.",
        "questions": [
            {"q": "What percentage of the universe is visible matter?", "options": ["95%.", "50%.", "5%.", "80%."], "answer": 2},
            {"q": "What is the primary function of dark matter?", "options": ["Creating light.", "Providing extra gravity to hold galaxies.", "Pushing galaxies away.", "Generating heat."], "answer": 1},
            {"q": "Why is dark matter difficult to detect?", "options": ["It is too small.", "It does not emit or reflect light.", "It moves too fast.", "It is only found on Earth."], "answer": 1},
            {"q": "What effect does dark energy have on the universe?", "options": ["It slows the expansion.", "It accelerates the expansion.", "It makes the universe collapse.", "It creates new stars."], "answer": 1},
            {"q": "What is the broader significance of these substances?", "options": ["They help us find aliens.", "They determine the ultimate fate of the universe.", "They produce electricity.", "They explain weather patterns."], "answer": 1}
        ]
    },
    {
        "id": "r_63",
        "title": "Genetics: The Science of Epigenetics",
        "level": "C1",
        "text": "Epigenetics is the study of changes in organisms caused by modification of gene expression rather than alteration of the genetic code itself. While our DNA sequence is like a fixed 'script,' epigenetic markers—such as DNA methylation and histone modification—act as 'director's notes' that tell cells which genes to turn on or off. Environmental factors like diet, stress, and toxins can influence these markers, potentially leading to long-term changes in health. Crucially, some of these epigenetic changes can be passed down to future generations, which challenges the traditional view of inheritance. This field suggests that our lifestyle choices can have a biological impact not just on ourselves, but on our children and grandchildren.",
        "questions": [
            {"q": "What does epigenetics study?", "options": ["Changes to DNA sequences.", "Modification of gene expression.", "The behavior of animals.", "The history of evolution."], "answer": 1},
            {"q": "What metaphor is used for DNA and epigenetic markers?", "options": ["Map and Compass.", "Script and Director's Notes.", "Engine and Fuel.", "Hard drive and Software."], "answer": 1},
            {"q": "Which environmental factor can influence epigenetic markers?", "options": ["Height.", "Diet and stress.", "Eye color.", "The moon's cycle."], "answer": 1},
            {"q": "Can epigenetic changes be inherited?", "options": ["No, never.", "Yes, some can be passed to future generations.", "Only in plants.", "Only in insects."], "answer": 1},
            {"q": "What is the broader impact of this science?", "options": ["We cannot change our fate.", "Lifestyle choices can impact future generations' biology.", "DNA is no longer important.", "Stress is good for health."], "answer": 1}
        ]
    },
    {
        "id": "r_64",
        "title": "Economics: The Keynesian Multiplier Effect",
        "level": "C1",
        "text": "The multiplier effect refers to the proportional amount of increase in final income that results from an injection of spending. In Keynesian economics, an initial increase in government spending leads to a much larger increase in national income (GDP). For example, if the government builds a bridge, it pays contractors and workers. These people then spend their extra income on goods and services, which benefits store owners and suppliers, who in turn spend more. This cycle of spending is the 'multiplier.' However, the size of the multiplier depends on the 'marginal propensity to consume' (MPC)—the fraction of extra income that people spend rather than save. If people save too much, the multiplier effect is weakened.",
        "questions": [
            {"q": "What is the multiplier effect?", "options": ["Increasing taxes to pay debt.", "An initial spending injection leading to a larger income increase.", "Printing more money.", "Reducing government size."], "answer": 1},
            {"q": "How does government spending on a bridge trigger the multiplier?", "options": ["The bridge costs a lot.", "Workers spend their income, creating more demand.", "It reduces traffic.", "It replaces the need for jobs."], "answer": 1},
            {"q": "What is 'MPC'?", "options": ["Money per capita.", "Marginal propensity to consume.", "Market price control.", "Main policy change."], "answer": 1},
            {"q": "What happens if people save most of their extra income?", "options": ["The multiplier effect increases.", "The multiplier effect is weakened.", "The economy grows faster.", "Taxes disappear."], "answer": 1},
            {"q": "To which school of economics does this concept belong?", "options": ["Classical.", "Keynesian.", "Marxist.", "Monetarist."], "answer": 1}
        ]
    },
    {
        "id": "r_65",
        "title": "History: The Impact of the Silk Road",
        "level": "C1",
        "text": "The Silk Road was a network of trade routes connecting East and West, central to cultural, commercial, and religious interaction between these regions for centuries. Though silk was the most famous product, the route also carried spices, gems, and technology like paper-making and gunpowder. Beyond trade, the Silk Road was a conduit for the transmission of ideas. Buddhism, Islam, and Christianity spread along its paths, transforming the cultures of Central Asia and China. However, the route also facilitated the spread of the Bubonic Plague, which devastated populations in the 14th century. The decline of the Silk Road coincided with the rise of maritime trade, as European explorers sought direct sea routes to the East.",
        "questions": [
            {"q": "What was the Silk Road?", "options": ["A single road made of silk.", "A network of trade routes connecting East and West.", "A military wall.", "A secret path to India."], "answer": 1},
            {"q": "What technological inventions traveled along this route?", "options": ["The internet.", "Paper-making and gunpowder.", "The steam engine.", "The radio."], "answer": 1},
            {"q": "How did the Silk Road influence religion?", "options": ["It banned all religions.", "It acted as a conduit for religions like Buddhism and Islam.", "It created one global religion.", "It only spread Christianity."], "answer": 1},
            {"q": "What was a negative consequence of these connections?", "options": ["High taxes.", "The spread of the Bubonic Plague.", "The end of silk production.", "Wars between travelers."], "answer": 1},
            {"q": "Why did the Silk Road eventually decline?", "options": ["The silk ran out.", "The rise of maritime (sea) trade.", "The continents separated.", "Bridges were destroyed."], "answer": 1}
        ]
    },
    {
        "id": "r_66",
        "title": "Philosophy: The Principles of Stoicism",
        "level": "C1",
        "text": "Stoicism is a school of Hellenistic philosophy founded by Zeno of Citium. It teaches that the path to 'eudaimonia' (happiness) is through the development of virtue and living in accordance with nature. Stoics emphasize the distinction between what we can control—our own thoughts, beliefs, and actions—and what we cannot—the weather, other people's opinions, and external events. By focusing only on the former and accepting the latter with equanimity, a person can achieve inner peace. Famous Stoics include the Roman emperor Marcus Aurelius and the philosopher Epictetus. Stoicism has seen a modern resurgence as a practical tool for resilience in the face of anxiety and chaos.",
        "questions": [
            {"q": "According to Stoicism, how does one achieve happiness?", "options": ["Through wealth and power.", "Through virtue and living with nature.", "By avoiding all work.", "By being lucky."], "answer": 1},
            {"q": "What is the key distinction in Stoic thought?", "options": ["Between men and women.", "Between things we can and cannot control.", "Between art and science.", "Between day and night."], "answer": 1},
            {"q": "Which of these can we control, according to a Stoic?", "options": ["The weather.", "Our own thoughts and actions.", "What other people think of us.", "Future events."], "answer": 1},
            {"q": "Who was a famous Stoic Roman emperor?", "options": ["Julius Caesar.", "Marcus Aurelius.", "Nero.", "Augustus."], "answer": 1},
            {"q": "What is a Stoic attitude toward external events?", "options": ["Anger and frustration.", "Equanimity and acceptance.", "Fear.", "Complete ignorance."], "answer": 1}
        ]
    },
    {
        "id": "r_67",
        "title": "Technology: The Quantum Computing Frontier",
        "level": "C2",
        "text": "Quantum computing is an area of computing focused on developing technology based on the principles of quantum theory. Unlike classical computers, which use bits (0 or 1), quantum computers use 'qubits.' Qubits can exist in 'superposition,' representing both 0 and 1 simultaneously. Furthermore, 'entanglement' allows qubits to be linked across distances, where the state of one instantly influences the other. These properties enable quantum computers to perform complex calculations at speeds that would take classical supercomputers thousands of years. Potential applications include drug discovery, cracking encryption, and optimizing logistics. However, maintaining the delicate state of qubits—which is easily disturbed—remains a significant engineering hurdle.",
        "questions": [
            {"q": "How do quantum computers differ from classical ones?", "options": ["They are smaller.", "They use qubits instead of bits.", "They don't use electricity.", "They are made of wood."], "answer": 1},
            {"q": "What is 'superposition'?", "options": ["Moving fast.", "Representing both 0 and 1 simultaneously.", "Being very heavy.", "Stopped motion."], "answer": 1},
            {"q": "Define 'entanglement' in this context.", "options": ["Knots in a wire.", "Linked qubits where one state influences the other instantly.", "A bug in the software.", "A complex math problem."], "answer": 1},
            {"q": "Name one potential application of quantum computing.", "options": ["Browsing the web.", "Drug discovery and encryption cracking.", "Cooking food.", "Driving cars."], "answer": 1},
            {"q": "What is the main challenge in building these computers?", "options": ["Lack of money.", "Maintaining the delicate state of qubits.", "It is too hot.", "No one wants them."], "answer": 1}
        ]
    },
    {
        "id": "r_68",
        "title": "Environmental Science: Carbon Sequestration",
        "level": "C1",
        "text": "Carbon sequestration is the process of capturing and storing atmospheric carbon dioxide to mitigate climate change. This can happen naturally through biological processes, such as the growth of forests and the absorption of CO2 by oceans. Alternatively, it can be done through technological means (Carbon Capture and Storage - CCS), where CO2 from industrial sources is captured and injected deep underground into geological formations. While forests are excellent natural sinks, they are limited by land availability and the threat of fires. Technological sequestration is promising but currently expensive and energy-intensive. A combination of protecting natural sinks and scaling up technology is seen as essential for achieving 'net zero' targets.",
        "questions": [
            {"q": "What is the goal of carbon sequestration?", "options": ["Increasing CO2 emissions.", "Capturing and storing CO2 to mitigate climate change.", "Producing more oil.", "Growing food faster."], "answer": 1},
            {"q": "How do forests naturally sequester carbon?", "options": ["They produce heat.", "Through growth (biological absorption).", "By attracting rain.", "By blocking the sun."], "answer": 1},
            {"q": "What is CCS?", "options": ["Carbon Capture and Storage.", "Climate Control System.", "Cloud Computing Service.", "Cold Cooling Station."], "answer": 0},
            {"q": "Where is CO2 stored in technological sequestration?", "options": ["In the atmosphere.", "Deep underground in geological formations.", "In water tanks.", "In plastic bags."], "answer": 1},
            {"q": "What is a downside of technological sequestration?", "options": ["It's too cheap.", "It is currently expensive and energy-intensive.", "It makes too much oxygen.", "It only works in winter."], "answer": 1}
        ]
    },
    {
        "id": "r_69",
        "title": "Psychology: Leon Festinger's Cognitive Dissonance",
        "level": "C1",
        "text": "Cognitive dissonance is the mental discomfort experienced by a person who holds two or more contradictory beliefs, values, or ideas. Leon Festinger, who first proposed the theory, argued that humans have an inner drive to maintain harmony (consonance) between their beliefs and actions. When dissonance occurs—for example, when a smoker knows that smoking is unhealthy—it creates stress. To reduce this stress, people either change their behavior (stop smoking) or, more commonly, change their beliefs ('I don't smoke that much' or 'Medical studies are wrong'). This theory explains why people often stick to their opinions even when faced with contradictory evidence, as admitting error creates painful dissonance.",
        "questions": [
            {"q": "What is 'cognitive dissonance'?", "options": ["Being very smart.", "Mental discomfort from contradictory beliefs.", "Forgetting things.", "Learning new languages."], "answer": 1},
            {"q": "Who proposed this theory?", "options": ["Sigmund Freud.", "Leon Festinger.", "B.F. Skinner.", "Philip Zimbardo."], "answer": 1},
            {"q": "What do humans have an inner drive to maintain?", "options": ["Physical strength.", "Harmony between beliefs and actions.", "A large family.", "A high salary."], "answer": 1},
            {"q": "How do people often reduce the stress of dissonance?", "options": ["By crying.", "By changing their beliefs or behavior.", "By sleeping more.", "By ignoring everyone."], "answer": 1},
            {"q": "Why do people stick to opinions despite new evidence?", "options": ["They are lazy.", "Admitting error creates painful dissonance.", "They have bad memory.", "They don't understand the evidence."], "answer": 1}
        ]
    },
    {
        "id": "r_70",
        "title": "Sociology: The Concept of Social Capital",
        "level": "C1",
        "text": "Social capital refers to the networks of relationships among people who live and work in a particular society, enabling that society to function effectively. Popularized by Robert Putnam in his book 'Bowling Alone,' the concept highlights how trust, cooperation, and shared values within a community create value. There are two main types: 'bonding' social capital (strong ties within a homogeneous group, like family) and 'bridging' social capital (weaker ties across diverse groups). Bridging capital is considered crucial for a healthy democracy, as it connects different types of people. Critics, however, warn that high social capital within a closed group can lead to exclusion or corruption (e.g., organized crime).",
        "questions": [
            {"q": "What is social capital?", "options": ["Money in a bank.", "Networks of relationships that enable society to function.", "The number of people in a city.", "The buildings in a neighborhood."], "answer": 1},
            {"q": "Who popularized the concept in 'Bowling Alone'?", "options": ["Karl Marx.", "Robert Putnam.", "Max Weber.", "Émile Durkheim."], "answer": 1},
            {"q": "Define 'bridging' social capital.", "options": ["Building physical bridges.", "Ties across diverse groups.", "Family bonds only.", "Secret societies."], "answer": 1},
            {"q": "Why is bridging capital important for democracy?", "options": ["It costs nothing.", "It connects different types of people.", "It makes elections faster.", "It stops people from voting."], "answer": 1},
            {"q": "What is a potential negative of high social capital in a closed group?", "options": ["Too much talking.", "Exclusion or corruption.", "Higher taxes.", "People moving away."], "answer": 1}
        ]
    },
    {
        "id": "r_71",
        "title": "Architecture: The Philosophy of Brutalism",
        "level": "C1",
        "text": "Brutalism is a style of architecture that flourished from the 1950s to the 1970s, characterized by the use of monolithic forms and raw, unadorned concrete (béton brut). Emerging from the modernist movement, Brutalism prioritized function and honesty of materials over decorative aesthetics. Many Brutalist buildings were designed for social housing or public institutions, symbolizing a post-war commitment to progress and community. However, the style became highly controversial. Critics often perceived the buildings as cold, imposing, and 'ugly.' Today, while many Brutalist structures are being demolished, others are being preserved as iconic examples of 20th-century utopian design.",
        "questions": [
            {"q": "What is the hallmark of Brutalist architecture?", "options": ["Using lots of glass.", "Monolithic forms and raw concrete.", "Small, wooden houses.", "Ancient Greek columns."], "answer": 1},
            {"q": "What does 'béton brut' mean?", "options": ["Beautiful stone.", "Raw concrete.", "Broken brick.", "Smooth glass."], "answer": 1},
            {"q": "What did Brutalism prioritize?", "options": ["Decoration.", "Function and honesty of materials.", "Cost reduction.", "Bright colors."], "answer": 1},
            {"q": "Why is the style controversial?", "options": ["It was too expensive.", "Buildings were often perceived as cold and imposing.", "It used too much metal.", "It was only used for shops."], "answer": 1},
            {"q": "What is happening to many Brutalist buildings today?", "options": ["They are all being painted.", "Some are being demolished, while others are preserved as icons.", "They are being converted into parks.", "They are being hidden."], "answer": 1}
        ]
    },
    {
        "id": "r_72",
        "title": "Nutrition: The Gut-Brain Connection",
        "level": "B2",
        "text": "Recent scientific discoveries have revealed a complex communication system between the gut and the brain, often called the 'gut-brain axis.' Trillions of microbes in our intestines produce neurotransmitters like serotonin and dopamine, which affect our mood and mental health. This means that what we eat can directly influence our emotions and cognitive function. For instance, diets high in fiber and fermented foods promote a diverse microbiome, which is linked to lower levels of anxiety and depression. Conversely, high-sugar and highly processed diets can lead to inflammation and mood swings. This field of 'nutritional psychiatry' is changing how we approach mental health treatment, shifting focus from the head to the stomach.",
        "questions": [
            {"q": "What is the 'gut-brain axis'?", "options": ["A physical bone.", "A communication system between the gut and the brain.", "A type of surgery.", "A diet plan."], "answer": 1},
            {"q": "What do gut microbes produce that affects mood?", "options": ["Oxygen.", "Neurotransmitters like serotonin.", "Muscle cells.", "Waste only."], "answer": 1},
            {"q": "Which type of food promotes a diverse microbiome?", "options": ["Sugar.", "Fiber and fermented foods.", "Fast food.", "Processed meat."], "answer": 1},
            {"q": "How does diet influence mental health according to the text?", "options": ["It has no effect.", "What we eat directly influences emotions and cognitive function.", "Only drinking water matters.", "It only affects weight."], "answer": 1},
            {"q": "What is 'nutritional psychiatry'?", "options": ["Studying old recipes.", "Approaching mental health treatment through diet and gut health.", "A form of exercise.", "Surgery on the stomach."], "answer": 1}
        ]
    },
    {
        "id": "r_73",
        "title": "Business: The Pareto Principle (80/20 Rule)",
        "level": "C1",
        "text": "The Pareto Principle, also known as the 80/20 rule, states that for many outcomes, roughly 80% of consequences come from 20% of causes. It was first observed by Italian economist Vilfredo Pareto, who noticed that 80% of the land in Italy was owned by 20% of the population. In business, this often means that 80% of sales come from 20% of clients, or 80% of productivity comes from 20% of tasks. The principle encourages individuals and companies to identify and focus on the 'vital few' rather than the 'trivial many.' While not a strict mathematical law, it serves as a powerful heuristic for time management and resource allocation.",
        "questions": [
            {"q": "What is the 80/20 rule?", "options": ["Spending 80% of your time sleeping.", "80% of consequences come from 20% of causes.", "Paying 80% tax.", "Hiring 20 people."], "answer": 1},
            {"q": "Who first observed this principle?", "options": ["Adam Smith.", "Vilfredo Pareto.", "Henry Ford.", "Steve Jobs."], "answer": 1},
            {"q": "What does the principle suggest for productivity?", "options": ["Do everything at once.", "Focus on the 20% of tasks that yield 80% of results.", "Work 80 hours a week.", "Ignore all tasks."], "answer": 1},
            {"q": "Is the Pareto Principle a strict mathematical law?", "options": ["Yes, always.", "No, it's a heuristic/observation.", "Only in Italy.", "Only in science."], "answer": 1},
            {"q": "What is the core advice of this rule?", "options": ["Identify the 'vital few'.", "Spread effort equally.", "Increase the number of clients.", "Wait for results."], "answer": 0}
        ]
    },
    {
        "id": "r_74",
        "title": "Education: The Bloom's Taxonomy of Learning",
        "level": "C1",
        "text": "Bloom's Taxonomy is a hierarchical model used to classify educational learning objectives into levels of complexity and specificity. The levels, from lowest to highest, are: Remember, Understand, Apply, Analyze, Evaluate, and Create. The lowest levels involve rote memorization and basic comprehension, while the higher levels—Analyze, Evaluate, and Create—represent 'higher-order thinking.' Bloom argued that true education should move beyond simple content knowledge to developing the ability to critique, synthesize, and produce new ideas. This model is widely used by teachers to design curricula and assessments that challenge students to think deeply.",
        "questions": [
            {"q": "What is Bloom's Taxonomy?", "options": ["A names of plants.", "A hierarchical model of learning objectives.", "A type of textbook.", "A school schedule."], "answer": 1},
            {"q": "What is at the lowest level of the taxonomy?", "options": ["Create.", "Remember (rote memorization).", "Evaluate.", "Analyze."], "answer": 1},
            {"q": "What are 'higher-order thinking' skills according to this model?", "options": ["Reading and Writing.", "Analyze, Evaluate, and Create.", "Listening and Speaking.", "Sleeping and Eating."], "answer": 1},
            {"q": "What was Bloom's main argument about education?", "options": ["Memory is the only thing that matters.", "It should move to higher-order thinking.", "Teachers should be strict.", "Tests are bad."], "answer": 1},
            {"q": "What is the highest level of Bloom's Taxonomy?", "options": ["Analyze.", "Understand.", "Create.", "Apply."], "answer": 2}
        ]
    },
    {
        "id": "r_75",
        "title": "Chemistry: The Development of the Periodic Table",
        "level": "C1",
        "text": "The periodic table is a tabular display of chemical elements arranged by atomic number, electron configuration, and recurring chemical properties. It was pioneered by Dmitri Mendeleev in 1869. Mendeleev's genius lay not just in organizing existing elements, but in leaving gaps for elements that had not yet been discovered. He even predicted the properties of these missing elements with remarkable accuracy. As new elements were discovered, they fit perfectly into his framework. The modern table is ordered by atomic number rather than atomic weight, reflecting our deeper understanding of protons and neutrons. It remains an essential tool for chemists, providing a systematic way to understand the relationships between all forms of matter.",
        "questions": [
            {"q": "Who pioneered the periodic table in 1869?", "options": ["Marie Curie.", "Dmitri Mendeleev.", "Albert Einstein.", "Isaac Newton."], "answer": 1},
            {"q": "What was unique about Mendeleev's approach?", "options": ["He used alphabetical order.", "He left gaps for undiscovered elements.", "He made it circular.", "He didn't use names."], "answer": 1},
            {"q": "How is the modern table ordered?", "options": ["By color.", "By atomic weight.", "By atomic number.", "By price."], "answer": 2},
            {"q": "What did Mendeleev predict accurately?", "options": ["The weather.", "Properties of missing elements.", "The price of gold.", "The end of the world."], "answer": 1},
            {"q": "What does the periodic table help chemists understand?", "options": ["The history of the Earth.", "Relationships between forms of matter.", "The speed of light.", "How to use fire."], "answer": 1}
        ]
    },
    {
        "id": "r_76",
        "title": "Sociology: Urbanization and the 'Tipping Point'",
        "level": "C1",
        "text": "The concept of a 'tipping point' refers to a critical threshold where a minor change prompts a significant and often unstoppable shift in a system. In urban sociology, this is used to explain rapid changes in neighborhoods, such as gentrification or the sudden decline of an area. Malcolm Gladwell, in his book 'The Tipping Point,' argues that social trends behave like viral outbreaks. A trend can simmer for years until reaching a 'magic moment' where it spreads exponentially. This is driven by three factors: the 'Law of the Few' (key influential people), the 'Stickiness Factor' (how memorable a message is), and the 'Power of Context' (environmental conditions). Understanding these dynamics allows policymakers to potentially nudge social change in positive directions.",
        "questions": [
            {"q": "What is a 'tipping point'?", "options": ["A scale for weight.", "A critical threshold for significant change.", "The end of a street.", "A types of garbage bin."], "answer": 1},
            {"q": "Which author popularized this concept in sociology?", "options": ["Stephen King.", "Malcolm Gladwell.", "J.K. Rowling.", "George Orwell."], "answer": 1},
            {"q": "According to Gladwell, how do social trends behave?", "options": ["Like slow rivers.", "Like viral outbreaks.", "Like static rocks.", "Like loud noises."], "answer": 1},
            {"q": "Name the three factors influencing a tipping point.", "options": ["Money, Time, Power.", "Law of the Few, Stickiness Factor, Power of Context.", "Reading, Writing, Math.", "Sun, Moon, Stars."], "answer": 1},
            {"q": "How can this knowledge be used by policymakers?", "options": ["To predict the weather.", "To nudge social change positively.", "To stop all travel.", "To increase the price of food."], "answer": 1}
        ]
    },
    {
        "id": "r_77",
        "title": "Linguistics: The Hypothesis of Linguistic Relativity",
        "level": "C2",
        "text": "The Sapir-Whorf hypothesis, or linguistic relativity, suggests that the structure of a language affects its speakers' world view or cognition. The 'strong' version of the hypothesis (linguistic determinism) argues that language *determines* thought, while the 'weak' version suggests that language *influences* thought. For example, some languages have many words for 'snow' or specific colors, which may make their speakers more attuned to subtle differences in those areas. However, critics argue that while language can influence perception, it doesn't limit it; humans can still understand concepts even if their language lacks a specific word for them. Despite the controversy, the hypothesis remains central to the study of how culture and language intertwine.",
        "questions": [
            {"q": "What is the Sapir-Whorf hypothesis?", "options": ["Translation is impossible.", "Language structure affects its speakers' world view.", "All languages are the same.", "Learning languages makes you smarter."], "answer": 1},
            {"q": "Define 'linguistic determinism'.", "options": ["Language influences thought.", "Language determines thought.", "Thought determines language.", "Languages are fixed."], "answer": 1},
            {"q": "What is an example often cited for this hypothesis?", "options": ["Number of vowels.", "Words for 'snow' or colors.", "Types of punctuation.", "Length of sentences."], "answer": 1},
            {"q": "What do critics argue against the strong version?", "options": ["Language is too old.", "Language influences but doesn't limit perception.", "Thought doesn't exist.", "All words are the same."], "answer": 1},
            {"q": "Is the hypothesis still studied today?", "options": ["No, it's forgotten.", "Yes, it's central to culture and language studies.", "Only in secret.", "Only in math."], "answer": 1}
        ]
    },
    {
        "id": "r_78",
        "title": "Economics: The Concept of Opportunity Cost",
        "level": "B2",
        "text": "Opportunity cost is one of the most fundamental concepts in economics. It refers to the value of the next best alternative that is given up when a choice is made. For example, if you spend $10 on a movie ticket, the opportunity cost is whatever else you could have bought with that $10, such as a meal. Similarly, if you choose to spend your time studying, the opportunity cost might be the time you could have spent working or relaxing. Understanding opportunity cost helps individuals and businesses make more rational decisions by considering the 'true' cost of their actions, which includes the benefits they are missing out on. It reminds us that every choice has a price, even if no money changes hands.",
        "questions": [
            {"q": "What is 'opportunity cost'?", "options": ["The price of a product.", "The value of the next best alternative given up.", "A tax on new businesses.", "The cost of building a school."], "answer": 1},
            {"q": "If you spend time studying, what is a likely opportunity cost?", "options": ["Learning a lot.", "Time you could have spent relaxing.", "Getting a good grade.", "Buying books."], "answer": 1},
            {"q": "Why is this concept important for decision-making?", "options": ["It makes choices more difficult.", "It helps consider the 'true' cost including missed benefits.", "It saves money.", "It helps you find better jobs."], "answer": 1},
            {"q": "Can there be an opportunity cost if no money is spent?", "options": ["No.", "Yes, such as the value of your time.", "Only for students.", "Only for businesses."], "answer": 1},
            {"q": "What does this concept remind us about choices?", "options": ["Choices are free.", "Every choice has a price.", "It's better not to choose.", "Choice is an illusion."], "answer": 1}
        ]
    },
    {
        "id": "r_79",
        "title": "Psychology: The Power of Habit and Charles Duhigg",
        "level": "C1",
        "text": "Habits, according to Charles Duhigg in his book 'The Power of Habit,' function through a simple three-part neurological loop: the cue, the routine, and the reward. The 'cue' is a trigger that tells your brain to go into automatic mode. The 'routine' is the behavior itself (physical, mental, or emotional). The 'reward' is something your brain likes that helps it remember the loop in the future. Over time, this loop becomes automatic, creating a craving that drives the behavior. Duhigg argues that to change a habit, you don't necessarily eliminate it; instead, you keep the same cue and reward but substitute a new routine. This 'Golden Rule' of habit change has been used successfully in everything from dieting to corporate management.",
        "questions": [
            {"q": "What are the three parts of the 'habit loop'?", "options": ["Start, Middle, End.", "Cue, Routine, Reward.", "Eat, Sleep, Repeat.", "Think, Feel, Do."], "answer": 1},
            {"q": "Define the 'cue' in a habit loop.", "options": ["The feeling of winning.", "A trigger that starts the behavior.", "The behavior itself.", "A prize."], "answer": 1},
            {"q": "What is the 'reward's' function?", "options": ["To make you tired.", "To help the brain remember the loop.", "To stop the habit.", "To punish the brain."], "answer": 1},
            {"q": "How does Duhigg suggest changing a habit?", "options": ["Removing the cue entirely.", "Keeping cue and reward but changing the routine.", "Stopping all behavior.", "Buying new things."], "answer": 1},
            {"q": "What is this rule of habit change called?", "options": ["The Silver Rule.", "The Golden Rule.", "The Habit Law.", "The Cycle Rule."], "answer": 1}
        ]
    },
    {
        "id": "r_80",
        "title": "History: The Mongol Empire and Global Integration",
        "level": "C1",
        "text": "The Mongol Empire, founded by Genghis Khan in 1206, became the largest contiguous land empire in history. While known for their brutal conquests, the Mongols also established a period of 'Pax Mongolica' (Mongol Peace). This era allowed for unprecedented safety and stability across Eurasia, which revolutionized international trade and communication. The Mongols created the 'Yam' system—a postal relay network that was the fastest of its time. They also practiced religious tolerance and encouraged the exchange of scholars and technologies. However, this same integration facilitated the rapid spread of the Black Death across the empire. The fragmentation of the empire eventually led to the rise of regional powers like the Ming Dynasty and the Ottoman Empire.",
        "questions": [
            {"q": "Who founded the Mongol Empire in 1206?", "options": ["Kublai Khan.", "Genghis Khan.", "Marco Polo.", "Alexander the Great."], "answer": 1},
            {"q": "What was the 'Pax Mongolica'?", "options": ["A types of weapon.", "A period of safety and stability across Eurasia.", "A tax on silk.", "A great library."], "answer": 1},
            {"q": "What was the 'Yam' system?", "options": ["A food storage method.", "A postal relay network for fast communication.", "A religious ceremony.", "A types of bridge."], "answer": 1},
            {"q": "What was the Mongols' attitude toward religion?", "options": ["Complete intolerance.", "Religious tolerance.", "They had no religion.", "They banned all books."], "answer": 1},
            {"q": "What negative outcome was facilitated by Mongol integration?", "options": ["The loss of all silk.", "The rapid spread of the Black Death.", "The invention of gunpowder.", "Higher prices for salt."], "answer": 1}
        ]
    }
]

data.extend(NEW_READING)
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(NEW_READING)} reading more modules (Total: {len(data)})")
