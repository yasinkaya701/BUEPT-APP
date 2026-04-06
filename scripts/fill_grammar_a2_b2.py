import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/grammar_tasks.json'

REAL_CONTENT = {
  "g_a2_01": {
    "explain": "Past Simple describes finished actions at a specific time in the past. Regular verbs: add -ed (work → worked). Irregular: (go → went, see → saw). Negative: did not (didn't) + base verb. Questions: Did + subject + base verb? Keywords: yesterday, last night, two days ago, in 2010.",
    "questions": [
      {"q": "I ___ to the library yesterday afternoon.", "options": ["go", "went", "gone", "going"], "answer": 1},
      {"q": "She ___ not study for the final exam last night.", "options": ["did", "does", "was", "is"], "answer": 0},
      {"q": "___ you see the professor after the lecture?", "options": ["Do", "Did", "Are", "Were"], "answer": 1},
      {"q": "They ___ a new car two weeks ago.", "options": ["buy", "bought", "buys", "buying"], "answer": 1},
      {"q": "The class ___ at 10:00 instead of 9:00.", "options": ["start", "started", "starts", "starting"], "answer": 1},
      {"q": "We ___ very tired after the long journey.", "options": ["are", "was", "were", "be"], "answer": 2},
      {"q": "He ___ his keys this morning.", "options": ["lose", "lost", "loses", "losted"], "answer": 1},
      {"q": "___ it rain during your holiday?", "options": ["Did", "Does", "Was", "Is"], "answer": 0},
      {"q": "I ___ not watch TV last night.", "options": ["did", "do", "was", "am"], "answer": 0},
      {"q": "They ___ to Istanbul in 2015.", "options": ["move", "moved", "moving", "moves"], "answer": 1}
    ]
  },
  "g_a2_02": {
    "explain": "Past Continuous describes actions in progress at a specific past time. Form: was/were + verb+ing. I/He/She/It was; You/We/They were. Use: (1) Parallel actions (I was reading while he was sleeping). (2) Background action interrupted by Past Simple (I was walking when it started to rain).",
    "questions": [
      {"q": "At 8 PM last night, I ___ studying for the test.", "options": ["am", "was", "were", "be"], "answer": 1},
      {"q": "They ___ playing football when it started to rain.", "options": ["was", "were", "are", "been"], "answer": 1},
      {"q": "___ you listening while the teacher was talking?", "options": ["Was", "Were", "Did", "Are"], "answer": 1},
      {"q": "She ___ not sleeping when I called her.", "options": ["was", "were", "is", "did"], "answer": 0},
      {"q": "While I ___ cooking, my sister was doing her homework.", "options": ["am", "was", "were", "be"], "answer": 1},
      {"q": "What ___ you doing at this time yesterday?", "options": ["did", "were", "was", "are"], "answer": 1},
      {"q": "The children ___ laughing loudly in the garden.", "options": ["was", "were", "is", "are"], "answer": 1},
      {"q": "I ___ walking to school when I saw the accident.", "options": ["was", "were", "did", "am"], "answer": 0},
      {"q": "___ it snowing when you left the house?", "options": ["Was", "Were", "Did", "Is"], "answer": 0},
      {"q": "We ___ not paying attention to the presentation.", "options": ["was", "were", "did", "are"], "answer": 1}
    ]
  },
  "g_a2_03": {
    "explain": "Comparatives (more / -er than) compare two things. Superlatives (the most / -est) compare 3+ things. Short words: -er / -est (fast → faster → fastest). Y-ending: -ier / -iest (happy → happier → happiest). Long words: more / the most (beautiful → more beautiful → the most beautiful). Irregular: Good / better / best; Bad / worse / worst.",
    "questions": [
      {"q": "This book is ___ than the one we read last week.", "options": ["interesting", "more interesting", "most interesting", "interestinger"], "answer": 1},
      {"q": "Mount Everest is ___ mountain in the world.", "options": ["high", "higher", "highest", "the highest"], "answer": 3},
      {"q": "My sister is ___ than me.", "options": ["young", "younger", "youngest", "the youngest"], "answer": 1},
      {"q": "He is ___ student in the entire class.", "options": ["good", "better", "best", "the best"], "answer": 3},
      {"q": "The exam was ___ than I expected.", "options": ["difficult", "more difficult", "most difficult", "difficulter"], "answer": 1},
      {"q": "Jupiter is ___ planet in our solar system.", "options": ["big", "bigger", "biggest", "the biggest"], "answer": 3},
      {"q": "This coffee is ___ than the one I had this morning.", "options": ["bad", "worse", "worst", "bader"], "answer": 1},
      {"q": "Summer is ___ season of the year.", "options": ["hot", "hotter", "hottest", "the hottest"], "answer": 3},
      {"q": "Your laptop is ___ than mine.", "options": ["expensive", "more expensive", "most expensive", "expensiver"], "answer": 1},
      {"q": "He arrived ___ than everyone else.", "options": ["late", "later", "latest", "the latest"], "answer": 1}
    ]
  },
  "g_a2_04": {
    "explain": "Present Continuous for the future: Use it for planned/arranged actions (I'm meeting Sarah at 5). 'Be going to': Use it for intentions (I'm going to buy a car) or predictions based on evidence (Look! It's going to rain). 'Will': Use it for sudden decisions (I'll help you), promises, or future facts.",
    "questions": [
      {"q": "Look at those dark clouds! It ___ rain.", "options": ["will", "is going to", "rains", "is raining"], "answer": 1},
      {"q": "We ___ dinner with the Dean tonight at 7 PM.", "options": ["have", "are having", "will have", "going to have"], "answer": 1},
      {"q": "I'm thirsty. I think I ___ some water.", "options": ["will have", "am going to have", "have", "am having"], "answer": 0},
      {"q": "___ you ___ anything interesting this weekend?", "options": ["Do / do", "Are / doing", "Will / do", "Are / to do"], "answer": 1},
      {"q": "I ___ study medicine after I graduate.", "options": ["will", "am going to", "study", "am studying"], "answer": 1},
      {"q": "Wait! I ___ you with those heavy bags.", "options": ["help", "am helping", "will help", "am going to help"], "answer": 2},
      {"q": "The plane ___ at 10:30 tonight.", "options": ["leaves", "is leaving", "will leave", "going to leave"], "answer": 1},
      {"q": "I promise I ___ tell anyone your secret.", "options": ["don't", "won't", "am not going to", "not"], "answer": 1},
      {"q": "My parents ___ me a new laptop for my birthday.", "options": ["buy", "are buying", "will buy", "going to buy"], "answer": 1},
      {"q": "What ___ you ___ when you finish university?", "options": ["will / do", "are / going to do", "do / do", "are / doing"], "answer": 1}
    ]
  },
  "g_a2_05": {
    "explain": "Countable nouns can be counted (book, apples). Use 'a/an', 'many', or 'few'. Uncountable nouns are seen as a mass (water, information, advice). Use 'much' or 'little'. 'Some' is for affirmative; 'any' for negative/questions. 'A lot of' works for both in positive sentences.",
    "questions": [
      {"q": "How ___ sugar do you want in your tea?", "options": ["many", "much", "few", "a few"], "answer": 1},
      {"q": "Are there ___ extra seats in the hall?", "options": ["some", "any", "much", "little"], "answer": 1},
      {"q": "I have ___ friends who study at Boğaziçi.", "options": ["a little", "a few", "much", "any"], "answer": 1},
      {"q": "We don't have ___ information about the results yet.", "options": ["many", "any", "some", "few"], "answer": 1},
      {"q": "I need ___ help with my project.", "options": ["some", "any", "many", "few"], "answer": 0},
      {"q": "How ___ students are in your department?", "options": ["much", "many", "a lot", "little"], "answer": 1},
      {"q": "There is ___ water in the bottle.", "options": ["a few", "a little", "many", "any"], "answer": 1},
      {"q": "I would like ___ coffee, please.", "options": ["any", "some", "many", "few"], "answer": 1},
      {"q": "She spent ___ time studying for the exam.", "options": ["many", "a lot of", "few", "any"], "answer": 1},
      {"q": "There aren't ___ good movies on TV tonight.", "options": ["some", "any", "much", "little"], "answer": 1}
    ]
  },
  "g_a2_06": {
    "explain": "Adverbs of manner describe HOW an action is done. Form: Adjective + -ly (quick → quickly, slow → slowly). Y-ending: -ily (happy → happily). Irregular: good → well, fast → fast, hard → hard. Position: usually after the verb or after the object.",
    "questions": [
      {"q": "He speaks English very ___.", "options": ["good", "well", "goodly", "better"], "answer": 1},
      {"q": "Please drive ___ in this area.", "options": ["careful", "carefully", "carefuller", "carefullest"], "answer": 1},
      {"q": "The students worked ___ on their project.", "options": ["hard", "hardly", "hardied", "hardy"], "answer": 0},
      {"q": "She finished the exam ___.", "options": ["quick", "quickly", "quickest", "quickied"], "answer": 1},
      {"q": "The sun is shining ___ today.", "options": ["bright", "brightly", "brighter", "brightest"], "answer": 1},
      {"q": "He ran ___ to catch the bus.", "options": ["fast", "fastly", "faster", "fastest"], "answer": 0},
      {"q": "They danced ___ at the wedding.", "options": ["happy", "happily", "happier", "happiest"], "answer": 1},
      {"q": "The teacher explained the topic ___.", "options": ["clear", "clearly", "clearest", "cleary"], "answer": 1},
      {"q": "I slept very ___ last night.", "options": ["bad", "badly", "worse", "worst"], "answer": 1},
      {"q": "She answered the question ___.", "options": ["polite", "politely", "pollite", "pollitely"], "answer": 1}
    ]
  },
  "g_a2_07": {
    "explain": "Possessive pronouns replace a noun to show ownership (mine, yours, his, hers, ours, theirs). Unlike possessive adjectives (my, your), pronouns stand alone. Example: 'This is my pen' (adjective) vs 'This pen is mine' (pronoun). Do not use 'it's' as a possessive pronoun.",
    "questions": [
      {"q": "That laptop belongs to me. It is ___.", "options": ["my", "mine", "me", "mines"], "answer": 1},
      {"q": "Is this car yours or ___?", "options": ["she", "her", "hers", "herself"], "answer": 2},
      {"q": "We bought this house together. It is ___.", "options": ["our", "ours", "us", "ourselves"], "answer": 1},
      {"q": "I found a bag. Is it ___?", "options": ["your", "yours", "you", "yourselves"], "answer": 1},
      {"q": "They have their own room, and we have ___.", "options": ["our", "ours", "us", "ourselves"], "answer": 1},
      {"q": "This is his coat, and that one is ___.", "options": ["their", "theirs", "them", "themselves"], "answer": 1},
      {"q": "Are these keys ___?", "options": ["your", "yours", "you", "yourselves"], "answer": 1},
      {"q": "I've lost my phone. Can I use ___?", "options": ["you", "your", "yours", "yourself"], "answer": 2},
      {"q": "Her book is on the table, but where is ___?", "options": ["my", "mine", "me", "myself"], "answer": 1},
      {"q": "The decision was entirely ___.", "options": ["their", "theirs", "them", "themselves"], "answer": 1}
    ]
  },
  "g_a2_08": {
    "explain": "Place prepositions describe location: 'In' (inside a space: in a box, in the room). 'On' (on a surface: on the table, on the wall). 'At' (at a specific point: at the door, at the airport). 'Under', 'Over', 'Next to', 'Between', 'Behind', 'In front of'.",
    "questions": [
      {"q": "My keys are ___ the table.", "options": ["in", "on", "at", "to"], "answer": 1},
      {"q": "She is waiting for you ___ the bus stop.", "options": ["in", "on", "at", "to"], "answer": 2},
      {"q": "There is a beautiful painting ___ the wall.", "options": ["in", "on", "at", "over"], "answer": 1},
      {"q": "I'll meet you ___ front of the library.", "options": ["in", "on", "at", "to"], "answer": 0},
      {"q": "The book is ___ the two cushions.", "options": ["among", "between", "next to", "under"], "answer": 1},
      {"q": "He is sitting ___ me in class.", "options": ["next to", "between", "under", "on"], "answer": 0},
      {"q": "There are some people ___ the building.", "options": ["in", "on", "at", "to"], "answer": 0},
      {"q": "I left my bag ___ the chair.", "options": ["under", "in", "to", "at"], "answer": 0},
      {"q": "The clock is ___ the door.", "options": ["above", "in", "at", "on"], "answer": 0},
      {"q": "She lives ___ the third floor.", "options": ["in", "on", "at", "to"], "answer": 1}
    ]
  },
  "g_a2_09": {
    "explain": "Relative pronouns connect ideas. 'Who' for people, 'Which' for things, 'Where' for places. Defining relative clauses give essential information. Example: 'The man who lives next door' (I need this to know WHICH man). Commas are not used in defining clauses.",
    "questions": [
      {"q": "This is the boy ___ won the competition.", "options": ["who", "which", "where", "whose"], "answer": 0},
      {"q": "The city ___ I live is quite noisy.", "options": ["who", "which", "where", "when"], "answer": 2},
      {"q": "I bought a camera ___ takes great photos.", "options": ["who", "which", "where", "whose"], "answer": 1},
      {"q": "That is the house ___ my parents were born.", "options": ["who", "which", "where", "when"], "answer": 2},
      {"q": "She is the teacher ___ helped me with my essay.", "options": ["who", "which", "where", "whose"], "answer": 0},
      {"q": "The car ___ was stolen belongs to my neighbor.", "options": ["who", "which", "where", "whose"], "answer": 1},
      {"q": "Is this the cafe ___ we met last summer?", "options": ["who", "which", "where", "when"], "answer": 2},
      {"q": "A person ___ speaks many languages is called a polyglot.", "options": ["who", "which", "where", "whose"], "answer": 0},
      {"q": "The ring ___ I'm wearing was my grandmother's.", "options": ["who", "which", "where", "whose"], "answer": 1},
      {"q": "The park ___ we played was destroyed.", "options": ["who", "which", "where", "when"], "answer": 2}
    ]
  },
  "g_a2_10": {
    "explain": "Modal verbs express different functions: 'Should' (advice), 'Could' (past ability or polite request), 'May/Might' (possibility), 'Have to' (strong obligation/external rule). Never use 'to' after should/could/may (e.g., 'should go', NOT 'should to go').",
    "questions": [
      {"q": "You ___ study harder if you want to pass.", "options": ["should", "should to", "could to", "may to"], "answer": 0},
      {"q": "It ___ rain this afternoon, so take an umbrella.", "options": ["should", "could", "might", "have to"], "answer": 2},
      {"q": "In Turkey, you ___ be 18 to drive a car.", "options": ["should", "could", "have to", "may"], "answer": 2},
      {"q": "___ I borrow your pen for a second?", "options": ["May", "Have to", "Should", "Shall"], "answer": 0},
      {"q": "He ___ swim when he was only four years old.", "options": ["can", "could", "should", "may"], "answer": 1},
      {"q": "You ___ eat so much junk food; it's bad for you.", "options": ["shouldn't", "couldn't", "mustn't to", "don't have to"], "answer": 0},
      {"q": "I ___ see the professor tomorrow during office hours.", "options": ["have to", "has to", "should to", "could to"], "answer": 0},
      {"q": "___ you help me with this heavy box?", "options": ["Should", "Could", "May", "Might"], "answer": 1},
      {"q": "She ___ be at home, but I'm not entirely sure.", "options": ["should", "must", "might", "has to"], "answer": 2},
      {"q": "We ___ wear a uniform at our school.", "options": ["should", "could", "have to", "may"], "answer": 2}
    ]
  },
  "g_b2_01": {
    "explain": "Conditionals summarize real and unreal situations: Zero (If you heat ice, it melts). First (If it rains, I will stay home). Second (If I were you, I would go). Third (If I had known, I would have come). Each has a specific tense pattern to follow strictly.",
    "questions": [
      {"q": "If I ___ more time, I would learn play the guitar.", "options": ["have", "had", "will have", "would have"], "answer": 1},
      {"q": "If you ___ water, it boils.", "options": ["heat", "will heat", "heated", "would heat"], "answer": 0},
      {"q": "If we ___ the train, we will be late for the meeting.", "options": ["miss", "will miss", "missed", "would miss"], "answer": 0},
      {"q": "If I ___ you, I would take that job offer.", "options": ["am", "was", "were", "be"], "answer": 2},
      {"q": "If she ___ earlier, she wouldn't have missed the flight.", "options": ["leaves", "left", "had left", "has left"], "answer": 2},
      {"q": "Plants die if they ___ enough water.", "options": ["don't get", "won't get", "didn't get", "wouldn't get"], "answer": 0},
      {"q": "What ___ you do if you saw a shark?", "options": ["will", "would", "do", "did"], "answer": 1},
      {"q": "If he ___ harder, he would have passed the exam.", "options": ["studies", "studied", "had studied", "has studied"], "answer": 2},
      {"q": "I ___ to the party if I'm not too tired.", "options": ["go", "will go", "went", "would go"], "answer": 1},
      {"q": "If you touch that wire, you ___ an electric shock.", "options": ["get", "will get", "got", "would get"], "answer": 1}
    ]
  },
  "g_b2_02": {
    "explain": "Wish + Past Simple expresses a desire for a different present (I wish I were rich). Wish + Past Perfect expresses regret about the past (I wish I had studied harder). Wish + would describes annoyance or a desire for someone else's behavior to change.",
    "questions": [
      {"q": "I wish I ___ more free time to travel.", "options": ["have", "had", "will have", "has"], "answer": 1},
      {"q": "I wish I ___ so much money last night.", "options": ["didn't spend", "hadn't spent", "won't spend", "haven't spent"], "answer": 1},
      {"q": "She wishes she ___ play the piano.", "options": ["can", "could", "will", "is able to"], "answer": 1},
      {"q": "I wish you ___ making that noise! It's annoying.", "options": ["will stop", "would stop", "stopped", "had stopped"], "answer": 1},
      {"q": "They wish they ___ to the concert yesterday.", "options": ["went", "had gone", "go", "have gone"], "answer": 1},
      {"q": "I wish the weather ___ better today.", "options": ["is", "was", "were", "be"], "answer": 2},
      {"q": "He wishes he ___ more attention in class.", "options": ["pays", "paid", "had paid", "will pay"], "answer": 2},
      {"q": "Do you ever wish you ___ in a different country?", "options": ["live", "lived", "had lived", "will live"], "answer": 1},
      {"q": "I wish I ___ my camera. The view is amazing.", "options": ["bring", "brought", "had brought", "have brought"], "answer": 2},
      {"q": "She wishes her brother ___ help her more.", "options": ["will", "would", "did", "had"], "answer": 1}
    ]
  },
  "g_b2_03": {
    "explain": "Passive Voice focuses on the action or the object being acted upon. Present Perfect Passive: has/have been + V3. Past Perfect Passive: had been + V3. Modal Passive: modal + be + V3. Continuous Passive: be + being + V3. Example: 'The room is being cleaned.'",
    "questions": [
      {"q": "The report ___ by the end of the day.", "options": ["will finish", "will be finished", "is finishing", "finishes"], "answer": 1},
      {"q": "A new hospital ___ in our city at the moment.", "options": ["is built", "is being built", "builds", "was built"], "answer": 1},
      {"q": "The results ___ yet.", "options": ["didn't announce", "haven't been announced", "haven't announced", "aren't announced"], "answer": 1},
      {"q": "The letter ___ yesterday afternoon.", "options": ["sent", "was sent", "is sent", "was sending"], "answer": 1},
      {"q": "These books must ___ to the library.", "options": ["return", "be returned", "returned", "be returning"], "answer": 1},
      {"q": "Dinner ___ when we arrived at the house.", "options": ["served", "was being served", "is served", "was serving"], "answer": 1},
      {"q": "All the tickets ___ already.", "options": ["have sold", "have been sold", "sell", "were sold"], "answer": 1},
      {"q": "The road ___ because of the accident.", "options": ["closed", "was closed", "is closing", "closes"], "answer": 1},
      {"q": "I think the car ___ by tomorrow.", "options": ["will repair", "will be repaired", "repairs", "is repaired"], "answer": 1},
      {"q": "The match ___ because of heavy rain.", "options": ["cancelled", "was cancelled", "cancels", "is cancelled"], "answer": 1}
    ]
  },
  "g_b2_04": {
    "explain": "Reported Speech shifts tenses backwards when the reporting verb is in the past (said/told). Present Simple → Past Simple; Present Continuous → Past Continuous; Will → Would; Can → Could. Time markers also change (tomorrow → the next day, yesterday → the day before).",
    "questions": [
      {"q": "He said, 'I am tired.' → He said that he ___ tired.", "options": ["is", "was", "were", "been"], "answer": 1},
      {"q": "She told me, 'I will call you.' → She told me she ___ call me.", "options": ["will", "would", "shall", "can"], "answer": 1},
      {"q": "They said, 'We are coming.' → They said they ___ coming.", "options": ["are", "were", "was", "been"], "answer": 1},
      {"q": "He asked, 'Where do you live?' → He asked where I ___.", "options": ["live", "lived", "to live", "was living"], "answer": 1},
      {"q": "She said, 'I've finished.' → She said she ___ finished.", "options": ["has", "had", "did", "was"], "answer": 1},
      {"q": "He told me, 'Don't go.' → He told me ___ go.", "options": ["not to", "to not", "don't", "didn't"], "answer": 0},
      {"q": "They asked, 'Can you help us?' → They asked if I ___ help them.", "options": ["can", "could", "will", "would"], "answer": 1},
      {"q": "She said, 'I saw him yesterday.' → She said she had seen him ___.", "options": ["yesterday", "the day before", "the next day", "last night"], "answer": 1},
      {"q": "I asked him, 'Have you eaten?' → I asked him if he ___.", "options": ["has eaten", "had eaten", "ate", "was eating"], "answer": 1},
      {"q": "He promised, 'I'll be there.' → He promised he ___ be there.", "options": ["will", "would", "is", "was"], "answer": 1}
    ]
  },
  "g_b2_05": {
    "explain": "Complex verb patterns: Verb + -ing (enjoy, suggest, avoid, risk, keep). Verb + to + infinitive (decide, hope, promise, expect, agree). Some verbs change meaning (Remember to do = task in future vs Remember doing = past memory). Other verbs use both (begin, start, like).",
    "questions": [
      {"q": "I suggested ___ to the cinema.", "options": ["go", "to go", "going", "gone"], "answer": 2},
      {"q": "She promised ___ me back the money.", "options": ["pay", "to pay", "paying", "paid"], "answer": 1},
      {"q": "We decided ___ in a hotel.", "options": ["stay", "to stay", "staying", "stayed"], "answer": 1},
      {"q": "He avoided ___ my questions.", "options": ["answer", "to answer", "answering", "answered"], "answer": 2},
      {"q": "I'll never forget ___ Istanbul for the first time.", "options": ["see", "to see", "seeing", "saw"], "answer": 2},
      {"q": "Please remember ___ the lights before leaving.", "options": ["turn off", "to turn off", "turning off", "turned off"], "answer": 1},
      {"q": "She kept ___ while I was talking.", "options": ["interrupt", "to interrupt", "interrupting", "interrupted"], "answer": 2},
      {"q": "We expect ___ the results next week.", "options": ["receive", "to receive", "receiving", "received"], "answer": 1},
      {"q": "I enjoy ___ music while I study.", "options": ["listen", "to listen", "listening", "listened"], "answer": 2},
      {"q": "He managed ___ the exam despite the difficulty.", "options": ["pass", "to pass", "passing", "passed"], "answer": 1}
    ]
  },
  "g_b2_06": {
    "explain": "Relative Clauses (Non-defining): Use commas to give extra, non-essential information. Use 'which' for things, 'who' for people. You CANNOT use 'that' in non-defining clauses. Example: 'My brother, who lives in London, is a doctor.' (I only have one brother).",
    "questions": [
      {"q": "My father, ___ is 60, is retiring next month.", "options": ["who", "which", "that", "whose"], "answer": 0},
      {"q": "Paris, ___ is the capital of France, is beautiful.", "options": ["who", "which", "that", "where"], "answer": 1},
      {"q": "The Titanic, ___ sank in 1912, was a huge ship.", "options": ["who", "which", "that", "when"], "answer": 1},
      {"q": "My best friend, ___ sister is a nurse, lives here.", "options": ["who", "which", "whose", "whom"], "answer": 2},
      {"q": "Istanbul, ___ I was born, is a historic city.", "options": ["which", "where", "that", "who"], "answer": 1},
      {"q": "This computer, ___ I bought only last week, is slow.", "options": ["which", "who", "that", "where"], "answer": 0},
      {"q": "Mr. Brown, ___ you met yesterday, is my boss.", "options": ["who", "whom", "which", "whose"], "answer": 0},
      {"q": "The Nile, ___ flows through Egypt, is a long river.", "options": ["who", "which", "that", "where"], "answer": 1},
      {"q": "My car, ___ cost a lot of money, has broken down.", "options": ["who", "which", "that", "where"], "answer": 1},
      {"q": "His parents, ___ live in Ankara, are visiting us.", "options": ["who", "which", "that", "where"], "answer": 0}
    ]
  },
  "g_b2_07": {
    "explain": "Modals of Deduction (Present): 'Must be' (90% sure true). 'Can't be' (90% sure impossible). 'Might/Could be' (50% sure possible). Form: modal + base verb. Example: 'She isn't here; she must be at work.' 'It can't be true' (I know it's a lie).",
    "questions": [
      {"q": "He's wearing a thick coat. He ___ cold.", "options": ["must be", "can't be", "might be", "should be"], "answer": 0},
      {"q": "She isn't answering. She ___ busy with something.", "options": ["must be", "can't be", "could be", "should be"], "answer": 2},
      {"q": "It ___ a mistake! I checked it three times.", "options": ["must be", "can't be", "should be", "would be"], "answer": 1},
      {"q": "You haven't eaten all day. You ___ hungry.", "options": ["must be", "can't be", "could be", "may be"], "answer": 0},
      {"q": "He ___ the manager. He looks far too young.", "options": ["must be", "can't be", "should be", "would be"], "answer": 1},
      {"q": "I'm not sure where he is. He ___ in the library.", "options": ["must be", "could be", "can't be", "should be"], "answer": 1},
      {"q": "That ___ Sarah's car. Hers is blue, this is red.", "options": ["must be", "can't be", "might be", "could be"], "answer": 1},
      {"q": "The phone is ringing. It ___ my mother.", "options": ["must be", "might be", "can't be", "would be"], "answer": 1},
      {"q": "She speaks perfect French. She ___ from Paris.", "options": ["must be", "can't be", "could be", "should be"], "answer": 0},
      {"q": "This answer ___ correct. Let's ask the teacher.", "options": ["must be", "can't be", "might not be", "should be"], "answer": 2}
    ]
  },
  "g_b2_08": {
    "explain": "Future Perfect: will have + V3 (action finished by a future time). Future Continuous: will be + verb+ing (action in progress at a future time). Use time markers like 'By 2025', 'By the time you arrive', 'In three years' time', 'This time next week'.",
    "questions": [
      {"q": "By 10 PM tonight, I ___ my homework.", "options": ["will finish", "will have finished", "will be finishing", "finish"], "answer": 1},
      {"q": "This time tomorrow, I ___ on a beach in Antalya.", "options": ["will sit", "will have sat", "will be sitting", "sit"], "answer": 2},
      {"q": "The project ___ by next Friday.", "options": ["completes", "will be completed", "will have been completed", "is completing"], "answer": 2},
      {"q": "In five years' time, she ___ as a doctor.", "options": ["works", "will be working", "will have worked", "working"], "answer": 1},
      {"q": "By the time you wake up, I ___ for three hours.", "options": ["will work", "will be working", "will have worked", "worked"], "answer": 2},
      {"q": "Don't call me at 8. I ___ my favorite show.", "options": ["will watch", "will be watching", "will have watched", "watch"], "answer": 1},
      {"q": "They ___ their exams by the end of June.", "options": ["will finish", "will have finished", "will be finishing", "finish"], "answer": 1},
      {"q": "I ___ my degree in three years.", "options": ["will get", "will be getting", "will have gotten", "get"], "answer": 2},
      {"q": "By 2030, technology ___ a lot.", "options": ["changes", "will change", "will have changed", "is changing"], "answer": 2},
      {"q": "This time next week, we ___ our results.", "options": ["celebrate", "will be celebrating", "will have celebrated", "will celebrate"], "answer": 1}
    ]
  },
  "g_b2_09": {
    "explain": "Mixed Conditionals combine past and present. Pattern 1: If + Past Perfect, would + base verb → Past action with a present result (If I hadn't missed the bus, I would be there now). Pattern 2: If + Past Simple, would have + V3 → Present state with a past result.",
    "questions": [
      {"q": "If I had studied harder, I ___ a better job now.", "options": ["have", "would have", "would have had", "will have"], "answer": 1},
      {"q": "If he were taller, he ___ the basketball team.", "options": ["could join", "could have joined", "will join", "can join"], "answer": 1},
      {"q": "If she ___ the map, we wouldn't be lost now.", "options": ["doesn't lose", "didn't lose", "hadn't lost", "hasn't lost"], "answer": 2},
      {"q": "If I ___ you, I would have told the truth.", "options": ["am", "was", "were", "be"], "answer": 2},
      {"q": "We ___ now if we had left on time.", "options": ["are", "will be", "would be", "would have been"], "answer": 2},
      {"q": "If they had a car, they ___ to the party yesterday.", "options": ["went", "would go", "would have gone", "will go"], "answer": 2},
      {"q": "If I hadn't eaten so much, I ___ sick now.", "options": ["am not", "won't be", "wouldn't be", "wouldn't have been"], "answer": 2},
      {"q": "If she ___ speak French, she would have applied for the job.", "options": ["can", "could", "is able to", "will be able to"], "answer": 1},
      {"q": "If we had won the lottery, we ___ in a mansion now.", "options": ["live", "will live", "would live", "would have lived"], "answer": 2},
      {"q": "If he ___ more talented, he would have become a pro.", "options": ["is", "was", "were", "been"], "answer": 2}
    ]
  },
  "g_b2_10": {
    "explain": "Articles (Advanced): 'The' with unique things (the earth, the internet), superlative adjectives, and geographical features (rivers, oceans, deserts). No article with continents, most countries (except plural/republic ones), and abstract nouns in general contexts.",
    "questions": [
      {"q": "She traveled across ___ Atlantic Ocean last summer.", "options": ["a", "an", "the", "—"], "answer": 2},
      {"q": "I want to visit ___ South America one day.", "options": ["a", "an", "the", "—"], "answer": 3},
      {"q": "___ Mount Everest is very high.", "options": ["A", "An", "The", "—"], "answer": 3},
      {"q": "He lives in ___ Netherlands.", "options": ["a", "an", "the", "—"], "answer": 2},
      {"q": "___ education is important for everyone.", "options": ["A", "An", "The", "—"], "answer": 3},
      {"q": "I usually listen to ___ radio in the morning.", "options": ["a", "an", "the", "—"], "answer": 2},
      {"q": "___ Nile is the longest river in the world.", "options": ["A", "An", "The", "—"], "answer": 2},
      {"q": "She is ___ most talented person I know.", "options": ["a", "an", "the", "—"], "answer": 2},
      {"q": "He comes from ___ United States.", "options": ["a", "an", "the", "—"], "answer": 2},
      {"q": "___ happiness cannot be bought.", "options": ["A", "An", "The", "—"], "answer": 3}
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
