import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/listening_tasks.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

NEW_LISTENING = [
    {
        "id": "l_31",
        "title": "Biology: The Theory of Natural Selection",
        "level": "C1",
        "type": "Lecture",
        "transcript": "Charles Darwin's theory of natural selection is the cornerstone of modern biology. It posits that individuals with traits better suited to their environment are more likely to survive and reproduce, passing those advantageous traits to the next generation. Over vast periods of time, this process leads to the adaptation of species and the emergence of new biological forms. Darwin's 'survival of the fittest' is often misunderstood as being about physical strength; in reality, 'fitness' refers to reproductive success. This mechanism explains the incredible diversity of life on Earth, from the beaks of finches to the complex camouflage of insects. Today, we know that these traits are encoded in DNA, providing the genetic foundation for Darwin's observations.",
        "questions": [
            {"q": "What is the primary mechanism of evolution according to Darwin?", "options": ["Genetic engineering.", "Natural selection.", "Random chance.", "Climate change."], "answer": 1},
            {"q": "What does 'fitness' mean in a biological context?", "options": ["Physical strength.", "Reproductive success.", "Speed.", "Intelligence."], "answer": 1},
            {"q": "How did Darwin explain the diversity of life?", "options": ["Through overnight changes.", "Through adaptation over long periods.", "By studying only humans.", "By ignoring the environment."], "answer": 1},
            {"q": "What is the genetic foundation of these traits?", "options": ["Protein.", "DNA.", "Carbohydrates.", "Vitamin C."], "answer": 1},
            {"q": "Give an example of adaptation mentioned.", "options": ["The size of a rock.", "Beaks of finches or insect camouflage.", "The color of the sky.", "The speed of light."], "answer": 1}
        ]
    },
    {
        "id": "l_32",
        "title": "Sociology: The Panopticon and Modern Surveillance",
        "level": "C1",
        "type": "Seminar",
        "transcript": "The Panopticon is a theoretical prison design by Jeremy Bentham, where a single guard can observe all prisoners without them knowing if they are being watched. Michel Foucault later used this as a metaphor for modern society's system of 'disciplinary power.' He argued that when people feel they might be under surveillance, they internalize the gaze and begin to police their own behavior. This 'self-surveillance' is highly efficient because it doesn't require constant physical force. In the digital age, this concept has gained new relevance with the rise of data tracking, social media, and CCTV. We live in a 'digital panopticon' where our actions are constantly logged, leading to subtle changes in how we express ourselves and interact with others.",
        "questions": [
            {"q": "What was the original Panopticon?", "options": ["A type of camera.", "A prison design where one guard watches many.", "A new social media app.", "A museum in Paris."], "answer": 1},
            {"q": "Who used the Panopticon as a metaphor for social power?", "options": ["Karl Marx.", "Michel Foucault.", "Jeremy Bentham.", "Jean-Paul Sartre."], "answer": 1},
            {"q": "What is 'self-surveillance'?", "options": ["Watching yourself in the mirror.", "Policing one's own behavior because of potential monitoring.", "Setting up cameras in your house.", "Reading your own diary."], "answer": 1},
            {"q": "Why is this system considered efficient?", "options": ["It costs no money.", "It doesn't require constant physical force.", "It makes people happy.", "It's faster than the internet."], "answer": 1},
            {"q": "What is the 'digital panopticon'?", "options": ["A types of computer virus.", "A world of constant data tracking and logging.", "A new government agency.", "A movie about space."], "answer": 1}
        ]
    },
    {
        "id": "l_33",
        "title": "Psychology: The Bystander Effect",
        "level": "C1",
        "type": "Discussion",
        "transcript": "The bystander effect is a social psychological phenomenon in which individuals are less likely to offer help to a victim when other people are present. The probability of help is inversely related to the number of bystanders. This is often explained by the 'diffusion of responsibility'—where each person assumes someone else will take action—and 'pluralistic ignorance,' where people look to others for cues and, seeing no one reacting, assume the situation isn't an emergency. The famous 1964 case of Kitty Genovese, who was attacked while neighbors supposedly did nothing, sparked initial research into this behavior. Understanding these psychological barriers can help us overcome them by teaching individuals to take personal responsibility in a crowd.",
        "questions": [
            {"q": "What is the 'bystander effect'?", "options": ["Helping people more in a crowd.", "Being less likely to help when others are present.", "Staying at home during emergencies.", "Always recording events on a phone."], "answer": 1},
            {"q": "Define 'diffusion of responsibility'.", "options": ["Taking full blame.", "Assuming someone else will take action in a group.", "Ignoring all responsibility.", "A mathematical formula."], "answer": 1},
            {"q": "What is 'pluralistic ignorance'?", "options": ["Learning many things at once.", "Assuming a situation isn't an emergency because others aren't reacting.", "Not knowing the law.", "Ignoring the needs of others."], "answer": 1},
            {"q": "Which famous case sparked research into this effect?", "options": ["The Stanford Prison case.", "The Kitty Genovese case.", "The Milgram case.", "The French Revolution."], "answer": 1},
            {"q": "How can we overcome the bystander effect?", "options": ["By having more people nearby.", "By teaching individual personal responsibility.", "By calling for more help.", "By ignoring the crowd."], "answer": 1}
        ]
    },
    {
        "id": "l_34",
        "title": "Economics: Game Theory and the Nash Equilibrium",
        "level": "C1",
        "type": "Lecture",
        "transcript": "As we discussed in our reading session, game theory is the study of strategic interaction. The most vital concept is the Nash Equilibrium, named after John Nash. It's a situation in which each player has chosen a strategy and no player can benefit by changing their strategy while the other players keep theirs unchanged. It's a state of stable 'no-regret.' However, it doesn't necessarily mean the outcome is the best for everyone; it's simply the most stable given everyone's self-interest. Think of firms in an oligopoly setting prices. If one firm cuts prices and the other doesn't, the cutter wins. But if both cut, both lose profit. The Nash Equilibrium often leads to both firms keeping prices high, even though they could both benefit from a secret agreement to cut.",
        "questions": [
            {"q": "What is a 'Nash Equilibrium'?", "options": ["A state of constant change.", "A situation where no player benefits from switching alone.", "A market with no competition.", "A state where everyone wins."], "answer": 1},
            {"q": "Is a Nash Equilibrium always the 'best' outcome for society?", "options": ["Yes, always.", "No, it's just the most stable.", "It only applies to small groups.", "It is only true in math."], "answer": 1},
            {"q": "Who is the theory named after?", "options": ["John Nash.", "Adam Smith.", "David Ricardo.", "John Maynard Keynes."], "answer": 0},
            {"q": "What example is given for firm behavior?", "options": ["Firms in an oligopoly setting prices.", "A bakery selling bread.", "A government building a bridge.", "A person shopping for clothes."], "answer": 0},
            {"q": "What is the core takeaway regarding self-interest?", "options": ["It always leads to the best result.", "It can lead to a stable but sub-optimal state.", "It should be ignored.", "It is the only way to play."], "answer": 1}
        ]
    },
    {
        "id": "l_35",
        "title": "History: The Geopolitics of the Cold War",
        "level": "C1",
        "type": "Podcast",
        "transcript": "The Cold War was a period of ideological and geopolitical tension between the United States and the Soviet Union, lasting from the end of World War II in 1947 until 1991. It's called 'cold' because there was no large-scale direct fighting between the two superpowers. Instead, it was characterized by proxy wars in regions like Korea and Vietnam, an intense nuclear arms race, and the space race. The world was divided into two blocs: the Western capitalist nations led by the US and the Eastern communist nations led by the USSR. This bipolar world order shaped everything from international trade to culture. The symbolic end came with the fall of the Berlin Wall in 1989 and the eventual dissolution of the Soviet Union in 1991.",
        "questions": [
            {"q": "Why was it called the 'Cold' War?", "options": ["It happened in winter.", "There was no large-scale direct fighting between superpowers.", "The technology used was cold.", "It was a very peaceful time."], "answer": 1},
            {"q": "Between which two superpowers did the tension exist?", "options": ["UK and France.", "US and Soviet Union.", "China and Japan.", "Germany and Italy."], "answer": 1},
            {"q": "What are 'proxy wars'?", "options": ["Wars fought by computer programs.", "Wars where superpowers support opposing sides rather than fighting directly.", "Wars about the ocean.", "Wars that only last one day."], "answer": 1},
            {"q": "What were the two main races during the Cold War?", "options": ["A car race and a horse race.", "A nuclear arms race and a space race.", "A marathon and a sprint.", "A wealth race and a food race."], "answer": 1},
            {"q": "What event symbolically marked the end of the Cold War?", "options": ["The moon landing.", "The fall of the Berlin Wall in 1989.", "The invention of the computer.", "A meeting in London."], "answer": 1}
        ]
    },
    {
        "id": "l_36",
        "title": "Physics: Einstein's Special Theory of Relativity",
        "level": "C2",
        "type": "Lecture",
        "transcript": "In 1905, Albert Einstein published his theory of special relativity, which upended our understanding of space and time. It is based on two postulates: first, that the laws of physics are the same in all inertial frames of reference, and second, that the speed of light in a vacuum is constant for all observers, regardless of their motion. This led to the counterintuitive conclusion that time is not absolute. 'Time dilation' means that time moves slower for an object in motion relative to a stationary observer. Similarly, 'length contraction' means that moving objects appear shorter. The most famous result is the equation E=mc², which shows that mass and energy are interchangeable. These principles are essential for technologies like GPS, which must account for relativistic effects to remain accurate.",
        "questions": [
            {"q": "What is the speed of light in a vacuum according to the theory?", "options": ["Variable depending on the observer.", "Constant for all observers.", "Faster than any star.", "Only true in space."], "answer": 1},
            {"q": "What is 'time dilation'?", "options": ["Time stopping completely.", "Time moving slower for an object in motion.", "Time moving faster in a vacuum.", "A way to travel to the past."], "answer": 1},
            {"q": "What does the equation E=mc² demonstrate?", "options": ["Light is very fast.", "Mass and energy are interchangeable.", "Electricity is powerful.", "Gravity is a wave."], "answer": 1},
            {"q": "Which modern technology requires these principles to work?", "options": ["The radio.", "GPS.", "The steam engine.", "The television."], "answer": 1},
            {"q": "Are the laws of physics different in moving frames of reference?", "options": ["Yes, they change completely.", "No, they are the same in all inertial frames.", "They only vary in space.", "They only apply to light."], "answer": 1}
        ]
    },
    {
        "id": "l_37",
        "title": "Linguistics: The Formation of Pidgins and Creoles",
        "level": "C1",
        "type": "Seminar",
        "transcript": "When speakers of different languages need to communicate for trade or labor, they often develop a 'pidgin.' A pidgin is a simplified language with a limited vocabulary and basic grammar, used as a bridge between groups. It is nobody's first language. However, when a pidgin is learned by kids as their native tongue, it expands in complexity and logic, becoming a 'creole.' This process reflects the innate human capacity for language creation. Creoles have fully developed grammatical systems and are as sophisticated as any other language. We see this today in cases like Haitian Creole or Tok Pisin in Papua New Guinea. This transition from pidgin to creole provides vital evidence for the existence of 'universal grammar' in the human brain.",
        "questions": [
            {"q": "What is a 'pidgin'?", "options": ["A types of bird.", "A simplified language used between different language speakers.", "A secret code.", "A language that is only written."], "answer": 1},
            {"q": "Is a pidgin anyone's first language?", "options": ["Yes, always.", "No, it is a bridge language used for limited purposes.", "Only for traders.", "It was once."], "answer": 1},
            {"q": "How does a pidgin become a 'creole'?", "options": ["By being written down.", "When it is learned as a native language by children.", "By adding more English words.", "By being banned by the government."], "answer": 1},
            {"q": "What characterizes a creole language?", "options": ["Simplified grammar.", "Fully developed and sophisticated grammatical systems.", "Only used for trade.", "A mix of math and logic."], "answer": 1},
            {"q": "What does this process provide evidence for in linguistics?", "options": ["Cultural evolution.", "The existence of 'universal grammar'.", "The history of travel.", "The importance of translation."], "answer": 1}
        ]
    },
    {
        "id": "l_38",
        "title": "Anthropology: The Neolithic Revolution",
        "level": "C1",
        "type": "Lecture",
        "transcript": "The Neolithic Revolution, which began around 10,000 BCE, was perhaps the single most significant shift in human history. It was the transition from a lifestyle of hunting and gathering to one of agriculture and settlement. This 'domestication' of plants and animals allowed for a stable food surplus, which in turn led to a population explosion. No longer needing to move constantly for food, humans built permanent villages, which eventually grew into the first cities. This also led to social stratification, as some individuals could accumulate more wealth than others. While agriculture brought more food, it also brought challenges like new diseases from livestock and more labor-intensive days compared to the hunter-gatherer lifestyle.",
        "questions": [
            {"q": "What was the core shift of the Neolithic Revolution?", "options": ["Invention of fire.", "From hunting/gathering to agriculture and settlement.", "The start of the Industrial Revolution.", "Moving to the Americas."], "answer": 1},
            {"q": "When did this revolution begin?", "options": ["1,000 BCE.", "10,000 BCE.", "2025 CE.", "50,000 BCE."], "answer": 1},
            {"q": "What did a 'food surplus' allow for?", "options": ["Population explosion and specialization.", "Everyone became a hunter.", "People stopped eating plants.", "The invention of money immediately."], "answer": 0},
            {"q": "How did social structure change because of settlement?", "options": ["Everyone became equal.", "It led to social stratification and wealth accumulation.", "People moved more often.", "There was no change."], "answer": 1},
            {"q": "What was a negative consequence mentioned?", "options": ["Less food.", "New diseases and more labor-intensive days.", "Bigger houses.", "No more travel."], "answer": 1}
        ]
    },
    {
        "id": "l_39",
        "title": "Environmental Science: The Hole in the Ozone Layer",
        "level": "B2",
        "type": "Discussion",
        "transcript": "In the 1980s, scientists discovered a massive 'hole' in the ozone layer over Antarctica. The ozone layer is crucial because it absorbs the majority of the sun's harmful ultraviolet (UV) radiation. The cause was found to be chlorofluorocarbons, or CFCs, chemicals used in refrigerators, air conditioners, and aerosol sprays. These CFCs rise into the stratosphere, where they break down and release chlorine atoms that destroy ozone molecules. This sparked a global response, leading to the 1987 Montreal Protocol, an international treaty that phased out the use of CFCs. Today, the ozone layer is slowly recovering, serving as a successful example of how global cooperation can solve an environmental crisis.",
        "questions": [
            {"q": "Why is the ozone layer important?", "options": ["It keeps the Earth warm.", "It absorbs harmful UV radiation.", "It provides oxygen for flight.", "It creates the color of the sky."], "answer": 1},
            {"q": "What chemicals were found to be destroying the ozone?", "options": ["CO2.", "CFCs (chlorofluorocarbons).", "Nitrogen.", "Natural gas."], "answer": 1},
            {"q": "Where were these chemicals mainly used?", "options": ["Cars and trains.", "Refrigerators, air conditioners, and aerosols.", "Food production.", "Building materials."], "answer": 1},
            {"q": "What is the Montreal Protocol?", "options": ["A treaty to stop all industry.", "An international treaty to phase out CFCs.", "A meeting about climate change in general.", "A types of computer software."], "answer": 1},
            {"q": "What is the current status of the ozone layer?", "options": ["It is completely gone.", "It is slowly recovering.", "It is getting worse every day.", "It never changed."], "answer": 1}
        ]
    },
    {
        "id": "l_40",
        "title": "Philosophy: Plato's Allegory of the Cave",
        "level": "C1",
        "type": "Lecture",
        "transcript": "In 'The Republic,' Plato presents the 'Allegory of the Cave' to describe the nature of belief and knowledge. He imagines prisoners chained in a cave since childhood, facing a wall. Behind them is a fire, and people pass by carrying objects, casting shadows on the wall. For the prisoners, these shadows are reality. However, if one prisoner is freed and dragged out into the sunlight, they would eventually see the true forms of things. At first, the light would be painful and blinding. This journey represents the process of education—moving from the 'shadows' of sensory perception to the 'sunlight' of intellectual truth. Plato argues that the philosopher's duty is to return to the cave and try to free the others, even if they are met with mockery or anger.",
        "questions": [
            {"q": "What do the 'shadows' on the wall represent for the prisoners?", "options": ["A movie.", "Their entire reality.", "A dream.", "A mistake."], "answer": 1},
            {"q": "What does the journey out of the cave represent?", "options": ["Moving to a new city.", "The process of education and finding truth.", "Escaping from prison.", "Learning how to build a fire."], "answer": 1},
            {"q": "Why is the sunlight initially painful for the freed prisoner?", "options": ["It is too hot.", "They aren't used to the true light/intellectual truth.", "They have an eye disease.", "The sun is too bright on Earth."], "answer": 1},
            {"q": "What is the 'philosopher's duty' according to Plato?", "options": ["To stay outside in the sun.", "To return to the cave and free others.", "To write books only.", "To become the king."], "answer": 1},
            {"q": "In which book did Plato present this allegory?", "options": ["The Social Contract.", "The Republic.", "The Prince.", "Ethics."], "answer": 1}
        ]
    }
]

data.extend(NEW_LISTENING)
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(NEW_LISTENING)} listening more modules (Total: {len(data)})")
