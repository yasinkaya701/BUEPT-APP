import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/grammar_tasks.json'

REAL_CONTENT = {
  "g_a1_01": {
    "explain": "The verb 'be' (am/is/are) is used for identity, descriptions, and states. Affirmative: I am / You are / He is. Negative: add 'not' (I am not / She is not). Questions: invert (Are you...? / Is he...?). Contractions: I'm, he's, they're, isn't, aren't.",
    "questions": [
      {"q": "I ___ a student at Boğaziçi University.", "options": ["am", "is", "are", "be"], "answer": 0},
      {"q": "___ she from Istanbul?", "options": ["Am", "Is", "Are", "Be"], "answer": 1},
      {"q": "They ___ not ready for the exam.", "options": ["am", "is", "are", "be"], "answer": 2},
      {"q": "We ___ in the library right now.", "options": ["am", "is", "are", "be"], "answer": 2},
      {"q": "He ___ very tired after the lecture.", "options": ["am", "is", "are", "be"], "answer": 1},
      {"q": "___ you a first-year student?", "options": ["Am", "Is", "Are", "Do"], "answer": 2},
      {"q": "The weather ___ cold today.", "options": ["am", "is", "are", "do"], "answer": 1},
      {"q": "I ___ not from Ankara.", "options": ["am", "is", "are", "do"], "answer": 0},
      {"q": "My parents ___ both teachers.", "options": ["am", "is", "are", "be"], "answer": 2},
      {"q": "___ it a difficult course?", "options": ["Am", "Is", "Are", "Does"], "answer": 1}
    ]
  },
  "g_a1_02": {
    "explain": "Use 'have got / has got' to talk about possession. Affirmative: I have got (I've got) / She has got (She's got). Negative: I haven't got / She hasn't got. Questions: Have you got...? / Has he got...? Note: In American English, 'have' without 'got' is also common.",
    "questions": [
      {"q": "She ___ got a new laptop.", "options": ["have", "has", "is", "do"], "answer": 1},
      {"q": "___ you got a dictionary?", "options": ["Has", "Have", "Do", "Are"], "answer": 1},
      {"q": "They ___ got three cats.", "options": ["has", "have", "is", "are"], "answer": 1},
      {"q": "He ___ got any brothers.", "options": ["haven't", "hasn't", "don't", "isn't"], "answer": 1},
      {"q": "I ___ got enough money for lunch.", "options": ["has", "have", "am", "do"], "answer": 1},
      {"q": "___ she got a car?", "options": ["Have", "Has", "Does", "Is"], "answer": 1},
      {"q": "We ___ got a meeting at 3 PM.", "options": ["has", "have", "is", "are"], "answer": 1},
      {"q": "The school ___ got a big library.", "options": ["have", "has", "is", "are"], "answer": 1},
      {"q": "I ___ got any free time today.", "options": ["hasn't", "haven't", "don't", "isn't"], "answer": 1},
      {"q": "___ they got enough chairs?", "options": ["Has", "Have", "Do", "Are"], "answer": 1}
    ]
  },
  "g_a1_03": {
    "explain": "Present Simple is used for habits, routines, facts, and schedules. Structure: I/You/We/They + base verb; He/She/It + verb+s/es. Negative: do not (don't) / does not (doesn't) + base verb. Questions: Do/Does + subject + base verb? Time signals: always, usually, often, sometimes, never, every day.",
    "questions": [
      {"q": "She ___ to university every day.", "options": ["go", "goes", "going", "gone"], "answer": 1},
      {"q": "I ___ coffee in the morning.", "options": ["drinks", "drink", "drinking", "drank"], "answer": 1},
      {"q": "He ___ not like spicy food.", "options": ["do", "does", "is", "has"], "answer": 1},
      {"q": "___ you speak French?", "options": ["Does", "Do", "Are", "Is"], "answer": 1},
      {"q": "The train ___ at 8:30 every morning.", "options": ["leave", "leaves", "leaving", "left"], "answer": 1},
      {"q": "We ___ play football on Sundays.", "options": ["doesn't", "don't", "isn't", "aren't"], "answer": 1},
      {"q": "My father ___ as an engineer.", "options": ["work", "works", "working", "worked"], "answer": 1},
      {"q": "___ she study medicine?", "options": ["Do", "Does", "Is", "Has"], "answer": 1},
      {"q": "Water ___ at 100 degrees Celsius.", "options": ["boil", "boils", "boiling", "boiled"], "answer": 1},
      {"q": "They always ___ breakfast together.", "options": ["has", "have", "having", "had"], "answer": 1}
    ]
  },
  "g_a1_04": {
    "explain": "Articles: 'a' before consonant sounds (a book), 'an' before vowel sounds (an apple). 'The' for specific/known things (the sun, the book on the table). No article for general plurals (Dogs are loyal) and uncountable nouns in general (Water is essential).",
    "questions": [
      {"q": "She is ___ engineer.", "options": ["a", "an", "the", "—"], "answer": 1},
      {"q": "I saw ___ movie last night. ___ movie was great.", "options": ["a / The", "the / A", "an / The", "a / A"], "answer": 0},
      {"q": "___ sun rises in the east.", "options": ["A", "An", "The", "—"], "answer": 2},
      {"q": "He wants to buy ___ new car.", "options": ["a", "an", "the", "—"], "answer": 0},
      {"q": "___ water is essential for life.", "options": ["A", "An", "The", "—"], "answer": 3},
      {"q": "Can you pass me ___ salt, please?", "options": ["a", "an", "the", "—"], "answer": 2},
      {"q": "She is ___ honest person.", "options": ["a", "an", "the", "—"], "answer": 1},
      {"q": "I need ___ umbrella. It's raining.", "options": ["a", "an", "the", "—"], "answer": 1},
      {"q": "___ children love playing outside.", "options": ["A", "An", "The", "—"], "answer": 3},
      {"q": "He is ___ best student in the class.", "options": ["a", "an", "the", "—"], "answer": 2}
    ]
  },
  "g_a1_05": {
    "explain": "Regular plurals: add -s (book→books), -es after s/sh/ch/x/o (bus→buses), -ies for consonant+y (city→cities). Irregular: man→men, woman→women, child→children, tooth→teeth, foot→feet, mouse→mice, person→people, sheep→sheep, fish→fish.",
    "questions": [
      {"q": "There are three ___ in the garden.", "options": ["childs", "children", "childrens", "child"], "answer": 1},
      {"q": "I bought two ___ of bread.", "options": ["loafs", "loaves", "loafes", "loaf"], "answer": 1},
      {"q": "How many ___ are in your class?", "options": ["persons", "peoples", "people", "person"], "answer": 2},
      {"q": "She has beautiful ___.", "options": ["tooths", "teeth", "teeths", "tooth"], "answer": 1},
      {"q": "There are five ___ on the farm.", "options": ["sheeps", "sheep", "sheepes", "sheepies"], "answer": 1},
      {"q": "The ___ are playing in the park.", "options": ["woman", "womans", "womens", "women"], "answer": 3},
      {"q": "We caught three ___ in the lake.", "options": ["fishs", "fishes", "fish", "fishies"], "answer": 2},
      {"q": "Both of my ___ hurt after running.", "options": ["foots", "foot", "feets", "feet"], "answer": 3},
      {"q": "I saw two ___ near the barn.", "options": ["mouses", "mices", "mice", "mouse"], "answer": 2},
      {"q": "The ___ are in the kitchen.", "options": ["knifes", "knives", "knife", "knivees"], "answer": 1}
    ]
  },
  "g_a1_06": {
    "explain": "Possessive adjectives show ownership: my, your, his, her, its, our, their. They come before a noun (my book, her car). Possessive 's shows belonging: Tom's bag, the teacher's desk. For plural nouns ending in s, add only apostrophe: the students' books.",
    "questions": [
      {"q": "This is ___ pen. (I)", "options": ["me", "my", "mine", "I"], "answer": 1},
      {"q": "___ name is Sarah.", "options": ["She", "Hers", "Her", "She's"], "answer": 2},
      {"q": "The dog wagged ___ tail.", "options": ["it's", "its", "his", "it"], "answer": 1},
      {"q": "We love ___ new house.", "options": ["us", "we", "ours", "our"], "answer": 3},
      {"q": "This is _____ car. (Tom)", "options": ["Toms", "Tom's", "Toms'", "Tom"], "answer": 1},
      {"q": "The ___ classroom is on the second floor.", "options": ["students", "students'", "student's", "students's"], "answer": 1},
      {"q": "Is this ___ bag? (you)", "options": ["you", "yours", "your", "you're"], "answer": 2},
      {"q": "___ teacher is very kind.", "options": ["They", "Them", "Their", "Theirs"], "answer": 2},
      {"q": "The ___ toys are everywhere.", "options": ["children's", "childrens", "childrens'", "children"], "answer": 0},
      {"q": "Have you seen ___ keys? (he)", "options": ["he", "him", "his", "he's"], "answer": 2}
    ]
  },
  "g_a1_07": {
    "explain": "Object pronouns replace the object of a verb or preposition: me, you, him, her, it, us, them. They come after verbs (She likes him) or prepositions (Give it to me). Don't confuse with subject pronouns (I/he/she/we/they) which come before verbs.",
    "questions": [
      {"q": "Please give ___ the book.", "options": ["I", "my", "me", "mine"], "answer": 2},
      {"q": "I saw ___ at the cafeteria.", "options": ["they", "them", "their", "theirs"], "answer": 1},
      {"q": "Can you help ___?", "options": ["we", "our", "ours", "us"], "answer": 3},
      {"q": "She told ___ the answer.", "options": ["he", "his", "him", "he's"], "answer": 2},
      {"q": "The teacher asked ___ a question.", "options": ["she", "her", "hers", "she's"], "answer": 1},
      {"q": "Don't forget to call ___.", "options": ["I", "me", "my", "mine"], "answer": 1},
      {"q": "I bought a present for ___.", "options": ["they", "their", "them", "theirs"], "answer": 2},
      {"q": "He showed ___ his new phone.", "options": ["we", "our", "us", "ours"], "answer": 2},
      {"q": "The dog followed ___ home.", "options": ["I", "me", "my", "mine"], "answer": 1},
      {"q": "Listen to ___ carefully.", "options": ["he", "his", "him", "he's"], "answer": 2}
    ]
  },
  "g_a1_08": {
    "explain": "Imperatives give commands, instructions, or requests. Use the base verb without a subject: Sit down. Open your books. Be quiet. Negative: Don't + base verb (Don't run. Don't be late). For polite requests, add 'please': Please close the door.",
    "questions": [
      {"q": "___ the door, please.", "options": ["Closing", "Closes", "Close", "Closed"], "answer": 2},
      {"q": "___ run in the corridor!", "options": ["Not", "Don't", "Doesn't", "Isn't"], "answer": 1},
      {"q": "___ quiet during the exam.", "options": ["Are", "Is", "Be", "Being"], "answer": 2},
      {"q": "___ your homework before class.", "options": ["Doing", "Does", "Did", "Do"], "answer": 3},
      {"q": "Please ___ me your notebook.", "options": ["giving", "gives", "give", "gave"], "answer": 2},
      {"q": "___ forget to bring your ID card.", "options": ["Not", "Don't", "Doesn't", "No"], "answer": 1},
      {"q": "___ at the board and listen.", "options": ["Looking", "Looks", "Look", "Looked"], "answer": 2},
      {"q": "___ careful with the glass.", "options": ["Are", "Is", "Be", "Being"], "answer": 2},
      {"q": "___ eat in the library.", "options": ["Not", "Don't", "No", "Doesn't"], "answer": 1},
      {"q": "Please ___ down and wait.", "options": ["sitting", "sits", "sit", "sat"], "answer": 2}
    ]
  },
  "g_a1_09": {
    "explain": "Time prepositions: 'at' for clock times and specific points (at 3 PM, at night, at the weekend). 'On' for days and dates (on Monday, on 15th March). 'In' for months, years, seasons, and parts of the day (in June, in 2024, in summer, in the morning). Exception: at night (not 'in the night').",
    "questions": [
      {"q": "The class starts ___ 9 o'clock.", "options": ["in", "on", "at", "by"], "answer": 2},
      {"q": "I was born ___ 1998.", "options": ["in", "on", "at", "by"], "answer": 0},
      {"q": "We have a meeting ___ Monday.", "options": ["in", "on", "at", "by"], "answer": 1},
      {"q": "She usually studies ___ the evening.", "options": ["in", "on", "at", "by"], "answer": 0},
      {"q": "The exam is ___ March 15th.", "options": ["in", "on", "at", "by"], "answer": 1},
      {"q": "I like walking ___ night.", "options": ["in", "on", "at", "by"], "answer": 2},
      {"q": "It always rains ___ autumn.", "options": ["in", "on", "at", "by"], "answer": 0},
      {"q": "The shop opens ___ 8:30.", "options": ["in", "on", "at", "by"], "answer": 2},
      {"q": "We go skiing ___ winter.", "options": ["in", "on", "at", "by"], "answer": 0},
      {"q": "Her birthday is ___ July.", "options": ["in", "on", "at", "by"], "answer": 0}
    ]
  },
  "g_a1_10": {
    "explain": "Use 'can' to express ability (I can swim), permission (Can I go?), and possibility (It can be cold in winter). Negative: cannot / can't (She can't drive). Questions: Can + subject + base verb? (Can you help me?). Past: could / couldn't (I could read at age 5).",
    "questions": [
      {"q": "She ___ speak three languages.", "options": ["can", "cans", "is can", "do can"], "answer": 0},
      {"q": "I ___ swim when I was five.", "options": ["can", "can't", "could", "could to"], "answer": 2},
      {"q": "___ I use your phone?", "options": ["Do", "Am", "Can", "Have"], "answer": 2},
      {"q": "He ___ play the piano very well.", "options": ["can't", "can not to", "doesn't can", "not can"], "answer": 0},
      {"q": "We ___ see the mountains from here.", "options": ["can", "cans", "are can", "do can"], "answer": 0},
      {"q": "She ___ come to the party yesterday.", "options": ["can't", "couldn't", "don't can", "wasn't can"], "answer": 1},
      {"q": "___ you ride a bicycle?", "options": ["Do", "Are", "Can", "Have"], "answer": 2},
      {"q": "I ___ find my keys anywhere.", "options": ["can", "can't", "don't can", "am not can"], "answer": 1},
      {"q": "My grandmother ___ cook amazing food.", "options": ["can", "cans", "is can", "does can"], "answer": 0},
      {"q": "They ___ finish the project on time.", "options": ["can't", "can not to", "doesn't can", "not can"], "answer": 0}
    ]
  },
  "g_b1_01": {
    "explain": "Present Perfect (have/has + past participle) connects a past action to the present. Uses: (1) Experience: I have visited Paris. (2) Recent results: She has just finished. (3) Unfinished time: I have eaten today. Key signals: already, yet, just, ever, never, recently, since, for.",
    "questions": [
      {"q": "I ___ never ___ to London.", "options": ["have / been", "has / been", "have / went", "has / gone"], "answer": 0},
      {"q": "She ___ just ___ her homework.", "options": ["has / finished", "have / finished", "has / finish", "have / finish"], "answer": 0},
      {"q": "___ you ever ___ sushi?", "options": ["Have / eaten", "Has / eaten", "Have / ate", "Did / eaten"], "answer": 0},
      {"q": "They ___ already ___ the movie.", "options": ["have / seen", "has / seen", "have / saw", "did / seen"], "answer": 0},
      {"q": "He ___ not ___ yet.", "options": ["has / arrived", "have / arrived", "has / arrive", "did / arrived"], "answer": 0},
      {"q": "We ___ ___ here since 2020.", "options": ["have / lived", "has / lived", "have / live", "are / lived"], "answer": 0},
      {"q": "I ___ ___ three cups of coffee today.", "options": ["have / drunk", "has / drunk", "have / drank", "did / drunk"], "answer": 0},
      {"q": "She ___ recently ___ a new job.", "options": ["has / found", "have / found", "has / find", "did / found"], "answer": 0},
      {"q": "___ he ___ the email yet?", "options": ["Has / sent", "Have / sent", "Has / send", "Did / sent"], "answer": 0},
      {"q": "They ___ ___ friends for ten years.", "options": ["have / been", "has / been", "have / be", "are / been"], "answer": 0}
    ]
  },
  "g_b1_02": {
    "explain": "Present Perfect vs Past Simple: Use Past Simple for completed actions at a specific past time (I visited Paris in 2019). Use Present Perfect for actions relevant to now, without a specific time (I have visited Paris). Key: 'yesterday/last week/in 2020' → Past Simple. 'already/yet/ever/never/just' → Present Perfect.",
    "questions": [
      {"q": "I ___ that film last week.", "options": ["have seen", "saw", "have saw", "seen"], "answer": 1},
      {"q": "She ___ never ___ Chinese food.", "options": ["has / tried", "— / tried", "did / try", "has / try"], "answer": 0},
      {"q": "We ___ to Spain in 2018.", "options": ["have gone", "went", "have went", "go"], "answer": 1},
      {"q": "___ you ___ the new restaurant yet?", "options": ["Have / visited", "Did / visit", "Have / visit", "Did / visited"], "answer": 0},
      {"q": "He ___ his keys yesterday.", "options": ["has lost", "lost", "has lose", "lose"], "answer": 1},
      {"q": "I ___ already ___ breakfast.", "options": ["have / had", "— / had", "did / have", "have / have"], "answer": 0},
      {"q": "They ___ married in 2015.", "options": ["have got", "got", "have gotten", "get"], "answer": 1},
      {"q": "___ she ___ from university yet?", "options": ["Has / graduated", "Did / graduate", "Has / graduate", "Did / graduated"], "answer": 0},
      {"q": "We ___ three tests so far this month.", "options": ["have taken", "took", "have took", "take"], "answer": 0},
      {"q": "I ___ there when I was a child.", "options": ["have lived", "lived", "have live", "live"], "answer": 1}
    ]
  },
  "g_b1_03": {
    "explain": "Zero Conditional: If + present simple, present simple → general truths (If you heat water, it boils). First Conditional: If + present simple, will + base verb → real/likely future situations (If it rains, I will take an umbrella). Don't use 'will' in the if-clause.",
    "questions": [
      {"q": "If you ___ ice, it melts.", "options": ["heat", "will heat", "heated", "would heat"], "answer": 0},
      {"q": "If it rains tomorrow, we ___ at home.", "options": ["stay", "will stay", "stayed", "would stay"], "answer": 1},
      {"q": "If you mix red and blue, you ___ purple.", "options": ["will get", "get", "got", "would get"], "answer": 1},
      {"q": "If she ___ hard, she will pass the exam.", "options": ["studies", "will study", "studied", "would study"], "answer": 0},
      {"q": "Water ___ if you heat it to 100°C.", "options": ["will boil", "boils", "boiled", "would boil"], "answer": 1},
      {"q": "If I ___ enough money, I will buy a laptop.", "options": ["save", "will save", "saved", "would save"], "answer": 0},
      {"q": "If you ___ plants, they die.", "options": ["don't water", "won't water", "didn't water", "wouldn't water"], "answer": 0},
      {"q": "We ___ late if we don't leave now.", "options": ["are", "will be", "were", "would be"], "answer": 1},
      {"q": "If he ___ the bus, he will take a taxi.", "options": ["misses", "will miss", "missed", "would miss"], "answer": 0},
      {"q": "If you touch fire, you ___ burned.", "options": ["will get", "get", "got", "would get"], "answer": 1}
    ]
  },
  "g_b1_04": {
    "explain": "Second Conditional: If + past simple, would + base verb → unreal/hypothetical present or future (If I had a million dollars, I would travel the world). Use 'were' for all subjects with 'be' (If I were you, I would study harder). It expresses imaginary situations.",
    "questions": [
      {"q": "If I ___ rich, I would buy a yacht.", "options": ["am", "was", "were", "be"], "answer": 2},
      {"q": "She ___ travel the world if she had more time.", "options": ["will", "would", "can", "shall"], "answer": 1},
      {"q": "If he ___ harder, he would get better grades.", "options": ["studies", "studied", "will study", "study"], "answer": 1},
      {"q": "What ___ you do if you won the lottery?", "options": ["will", "would", "do", "did"], "answer": 1},
      {"q": "If I ___ you, I would accept the offer.", "options": ["am", "was", "were", "be"], "answer": 2},
      {"q": "They ___ come if they had a car.", "options": ["will", "would", "can", "shall"], "answer": 1},
      {"q": "If we ___ near the beach, we would swim every day.", "options": ["live", "lived", "will live", "living"], "answer": 1},
      {"q": "She wouldn't be late if she ___ up earlier.", "options": ["gets", "got", "will get", "get"], "answer": 1},
      {"q": "If I ___ French, I would move to Paris.", "options": ["speak", "spoke", "will speak", "speaking"], "answer": 1},
      {"q": "He ___ help you if he knew the answer.", "options": ["will", "would", "can", "shall"], "answer": 1}
    ]
  },
  "g_b1_05": {
    "explain": "Passive Voice shifts focus from the doer to the action/receiver. Form: subject + be + past participle. Present: is/are + V3 (English is spoken here). Past: was/were + V3 (The letter was written yesterday). Use 'by' for the agent if important.",
    "questions": [
      {"q": "English ___ in many countries.", "options": ["speaks", "is spoken", "is speaking", "spoke"], "answer": 1},
      {"q": "The cake ___ by my mother yesterday.", "options": ["baked", "was baked", "is baked", "baking"], "answer": 1},
      {"q": "These cars ___ in Germany.", "options": ["make", "are made", "are making", "made"], "answer": 1},
      {"q": "The window ___ by the storm last night.", "options": ["broke", "was broken", "is broken", "breaking"], "answer": 1},
      {"q": "Homework ___ every day by the students.", "options": ["does", "is done", "is doing", "did"], "answer": 1},
      {"q": "The new bridge ___ next year.", "options": ["will build", "will be built", "is building", "builds"], "answer": 1},
      {"q": "The book ___ by millions of people.", "options": ["reads", "is read", "is reading", "read"], "answer": 1},
      {"q": "The thief ___ by the police yesterday.", "options": ["caught", "was caught", "is caught", "catching"], "answer": 1},
      {"q": "Coffee ___ in Brazil.", "options": ["grows", "is grown", "is growing", "grew"], "answer": 1},
      {"q": "The report must ___ by Friday.", "options": ["finish", "be finished", "finished", "finishing"], "answer": 1}
    ]
  },
  "g_b1_06": {
    "explain": "Must/Have to express obligation. 'Must' = personal/internal obligation (I must study harder). 'Have to' = external obligation (I have to wear a uniform). Negative: 'mustn't' = prohibition (You mustn't smoke here). 'Don't have to' = no obligation, it's optional (You don't have to come).",
    "questions": [
      {"q": "You ___ drive on the left in the UK.", "options": ["must", "mustn't", "don't have to", "haven't to"], "answer": 0},
      {"q": "She ___ wear a uniform at work. It's the rule.", "options": ["must", "has to", "mustn't", "doesn't have to"], "answer": 1},
      {"q": "You ___ park here. It's forbidden.", "options": ["must", "mustn't", "don't have to", "have to"], "answer": 1},
      {"q": "Tomorrow is a holiday. We ___ go to school.", "options": ["must", "mustn't", "don't have to", "have to"], "answer": 2},
      {"q": "I ___ finish this essay tonight. It's due tomorrow.", "options": ["must", "mustn't", "don't have to", "haven't to"], "answer": 0},
      {"q": "Students ___ use their phones during exams.", "options": ["must", "mustn't", "don't have to", "have to"], "answer": 1},
      {"q": "You ___ bring food. The restaurant provides everything.", "options": ["must", "mustn't", "don't have to", "have to"], "answer": 2},
      {"q": "He ___ see a doctor. He looks very ill.", "options": ["must", "mustn't", "doesn't have to", "haven't to"], "answer": 0},
      {"q": "We ___ pay for the tickets. They're free.", "options": ["must", "mustn't", "don't have to", "have to"], "answer": 2},
      {"q": "You ___ be 18 to vote in Turkey.", "options": ["must", "have to", "mustn't", "don't have to"], "answer": 1}
    ]
  },
  "g_b1_07": {
    "explain": "Should/Ought to express advice and recommendations. 'Should' = It's a good idea (You should study more). 'Ought to' = slightly more formal, same meaning (You ought to apologize). Negative: shouldn't (You shouldn't eat so much sugar). Question: Should I...?",
    "questions": [
      {"q": "You ___ eat more vegetables. It's healthy.", "options": ["should", "shouldn't", "must", "mustn't"], "answer": 0},
      {"q": "She ___ stay up so late. She has an exam.", "options": ["should", "shouldn't", "must", "mustn't"], "answer": 1},
      {"q": "___ I take an umbrella?", "options": ["Should", "Must", "Would", "Could"], "answer": 0},
      {"q": "You ___ to apologize for being rude.", "options": ["should", "ought", "must", "have"], "answer": 1},
      {"q": "He ___ drink more water.", "options": ["should", "shouldn't", "mustn't", "doesn't have to"], "answer": 0},
      {"q": "You ___ drive so fast. It's dangerous.", "options": ["should", "shouldn't", "ought to", "must"], "answer": 1},
      {"q": "I think you ___ talk to your professor about it.", "options": ["should", "shouldn't", "mustn't", "don't have to"], "answer": 0},
      {"q": "Students ___ to review their notes regularly.", "options": ["should", "ought", "must", "have"], "answer": 1},
      {"q": "You ___ be more careful with your belongings.", "options": ["should", "shouldn't", "mustn't", "don't have to"], "answer": 0},
      {"q": "She ___ spend all her money on clothes.", "options": ["should", "shouldn't", "mustn't", "ought to"], "answer": 1}
    ]
  },
  "g_b1_08": {
    "explain": "Relative clauses give extra information about a noun. 'Who' for people (The man who called is my uncle). 'Which' for things (The book which I read was good). 'That' replaces who/which in defining clauses. 'Where' for places. 'Whose' for possession.",
    "questions": [
      {"q": "The woman ___ lives next door is a doctor.", "options": ["who", "which", "where", "whose"], "answer": 0},
      {"q": "The book ___ I bought yesterday is interesting.", "options": ["who", "which", "where", "whose"], "answer": 1},
      {"q": "This is the restaurant ___ we had dinner.", "options": ["who", "which", "where", "whose"], "answer": 2},
      {"q": "The student ___ essay won the prize is very talented.", "options": ["who", "which", "where", "whose"], "answer": 3},
      {"q": "The car ___ is parked outside belongs to my father.", "options": ["who", "that", "where", "whose"], "answer": 1},
      {"q": "I know the man ___ daughter studies at Boğaziçi.", "options": ["who", "which", "where", "whose"], "answer": 3},
      {"q": "The city ___ I was born is very beautiful.", "options": ["who", "which", "where", "whose"], "answer": 2},
      {"q": "She is the teacher ___ helped me the most.", "options": ["who", "which", "where", "whose"], "answer": 0},
      {"q": "The phone ___ you gave me doesn't work.", "options": ["who", "which", "where", "whose"], "answer": 1},
      {"q": "He is the person ___ opinion I trust.", "options": ["who", "which", "where", "whose"], "answer": 3}
    ]
  },
  "g_b1_09": {
    "explain": "'Used to' describes past habits or states that are no longer true: I used to play football (I don't anymore). Negative: didn't use to. Question: Did you use to...? 'Would' can replace 'used to' for repeated past actions only (NOT for states): I would visit my grandparents every summer.",
    "questions": [
      {"q": "I ___ live in Ankara, but now I live in Istanbul.", "options": ["used to", "use to", "would", "am used to"], "answer": 0},
      {"q": "She ___ have long hair when she was young.", "options": ["used to", "use to", "would", "was used to"], "answer": 0},
      {"q": "We ___ play in the garden every afternoon.", "options": ["used to", "would", "use to", "were used to"], "answer": 1},
      {"q": "He didn't ___ like vegetables as a child.", "options": ["used to", "use to", "would", "using to"], "answer": 1},
      {"q": "___ you ___ walk to school?", "options": ["Did / use to", "Did / used to", "Do / use to", "Were / used to"], "answer": 0},
      {"q": "There ___ be a cinema here. Now it's a parking lot.", "options": ["used to", "would", "use to", "was used to"], "answer": 0},
      {"q": "My grandfather ___ tell us stories every night.", "options": ["used to", "would", "use to", "was used to"], "answer": 1},
      {"q": "She ___ be shy, but now she's very confident.", "options": ["used to", "would", "use to", "is used to"], "answer": 0},
      {"q": "I didn't ___ enjoy reading, but now I love it.", "options": ["used to", "use to", "would", "using to"], "answer": 1},
      {"q": "We ___ go camping every summer when I was young.", "options": ["used to", "would", "use to", "were used to"], "answer": 1}
    ]
  },
  "g_b1_10": {
    "explain": "Question tags are short questions at the end of sentences to confirm information. Positive statement → negative tag (You are a student, aren't you?). Negative statement → positive tag (She doesn't like coffee, does she?). Match the auxiliary verb and tense of the main clause.",
    "questions": [
      {"q": "You are a student, ___ you?", "options": ["are", "aren't", "don't", "do"], "answer": 1},
      {"q": "She can swim, ___ she?", "options": ["can", "can't", "does", "doesn't"], "answer": 1},
      {"q": "They don't like fish, ___ they?", "options": ["don't", "do", "aren't", "are"], "answer": 1},
      {"q": "He went to the party, ___ he?", "options": ["did", "didn't", "wasn't", "was"], "answer": 1},
      {"q": "We should leave now, ___ we?", "options": ["should", "shouldn't", "don't", "do"], "answer": 1},
      {"q": "It isn't raining, ___ it?", "options": ["isn't", "is", "doesn't", "does"], "answer": 1},
      {"q": "You have finished, ___ you?", "options": ["have", "haven't", "don't", "do"], "answer": 1},
      {"q": "She won't come, ___ she?", "options": ["won't", "will", "doesn't", "does"], "answer": 1},
      {"q": "They were late, ___ they?", "options": ["were", "weren't", "didn't", "did"], "answer": 1},
      {"q": "He hasn't called yet, ___ he?", "options": ["hasn't", "has", "didn't", "did"], "answer": 1}
    ]
  }
}

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

replaced = 0
for item in data:
    if item['id'] in REAL_CONTENT:
        rc = REAL_CONTENT[item['id']]
        item['explain'] = rc['explain']
        item['questions'] = rc['questions']
        replaced += 1

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Replaced {replaced} modules with real content. Total modules: {len(data)}")
