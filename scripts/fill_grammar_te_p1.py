import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/test_english_grammar_tasks.json'

REAL_CONTENT = {
  "g_te_a1_01": {
    "explain": "TE A1 Checklist: Verb Be (am/is/are) for identity and location. Practice affirmative, negative, and question forms in common English contexts.",
    "questions": [
      {"q": "___ you at home right now?", "options": ["Am", "Is", "Are", "Be"], "answer": 2},
      {"q": "She ___ a very talented musician.", "options": ["am", "is", "are", "be"], "answer": 1},
      {"q": "We ___ not students at this school.", "options": ["am", "is", "are", "be"], "answer": 2},
      {"q": "My brother ___ very happy today.", "options": ["am", "is", "are", "be"], "answer": 1},
      {"q": "___ it cold outside?", "options": ["Am", "Is", "Are", "Be"], "answer": 1},
      {"q": "They ___ from Germany.", "options": ["am", "is", "are", "be"], "answer": 2},
      {"q": "I ___ a doctor.", "options": ["am", "is", "are", "be"], "answer": 0},
      {"q": "___ she your sister?", "options": ["Am", "Is", "Are", "Be"], "answer": 1},
      {"q": "The books ___ on the table.", "options": ["am", "is", "are", "be"], "answer": 2},
      {"q": "He ___ not in the office.", "options": ["am", "is", "are", "be"], "answer": 1}
    ]
  },
  "g_te_a1_02": {
    "explain": "TE A1 Checklist: Have Got / Has Got for possession. Remember: I/You/We/They have got; He/She/It has got.",
    "questions": [
      {"q": "I ___ got a new apartment.", "options": ["have", "has", "is", "am"], "answer": 0},
      {"q": "___ she got any brothers?", "options": ["Have", "Has", "Does", "Is"], "answer": 1},
      {"q": "They ___ got three children.", "options": ["have", "has", "are", "be"], "answer": 0},
      {"q": "He ___ got a blue car.", "options": ["have", "has", "is", "are"], "answer": 1},
      {"q": "___ you got a minute?", "options": ["Have", "Has", "Do", "Are"], "answer": 0},
      {"q": "We ___ got enough money.", "options": ["haven't", "hasn't", "don't", "aren't"], "answer": 0},
      {"q": "It ___ got many windows.", "options": ["have", "has", "is", "are"], "answer": 1},
      {"q": "___ they got a map?", "options": ["Have", "Has", "Do", "Are"], "answer": 0},
      {"q": "I ___ got my keys.", "options": ["haven't", "hasn't", "don't", "isn't"], "answer": 0},
      {"q": "She ___ got a big dog.", "options": ["have", "has", "is", "are"], "answer": 1}
    ]
  },
  "g_te_a2_01": {
    "explain": "TE A2 Checklist: Past Simple (completed actions) vs Past Continuous (actions in progress). Use while + continuous and when + simple.",
    "questions": [
      {"q": "I ___ my book when the bell rang.", "options": ["read", "was reading", "were reading", "reading"], "answer": 1},
      {"q": "What ___ you doing at 10 PM last night?", "options": ["did", "were", "was", "are"], "answer": 1},
      {"q": "She ___ TV while her mother was cooking.", "options": ["watched", "was watching", "were watching", "watching"], "answer": 1},
      {"q": "We ___ to sleep when we heard a loud noise.", "options": ["went", "were going", "was going", "going"], "answer": 1},
      {"q": "He ___ his leg while he was skiing.", "options": ["broke", "was breaking", "were breaking", "broken"], "answer": 0},
      {"q": "___ it raining when you left the office?", "options": ["Was", "Were", "Did", "Is"], "answer": 0},
      {"q": "They ___ the movie when I arrived.", "options": ["didn't watch", "weren't watching", "wasn't watching", "not watching"], "answer": 1},
      {"q": "I ___ for the bus when I saw the accident.", "options": ["waited", "was waiting", "were waiting", "waiting"], "answer": 1},
      {"q": "She ___ a beautiful dress yesterday.", "options": ["wore", "was wearing", "were wearing", "wearing"], "answer": 0},
      {"q": "While we ___ dinner, the power went out.", "options": ["had", "were having", "was having", "having"], "answer": 1}
    ]
  },
  "g_te_a2_02": {
    "explain": "TE A2 Checklist: Comparatives and Superlatives. Use -er/more and -est/most. Remember irregulars: good/better/best, bad/worse/worst.",
    "questions": [
      {"q": "This is ___ film I've ever seen.", "options": ["better", "best", "the best", "goodest"], "answer": 2},
      {"q": "My house is ___ than yours.", "options": ["big", "bigger", "biggest", "the biggest"], "answer": 1},
      {"q": "Who is ___ person in your family?", "options": ["tall", "taller", "tallest", "the tallest"], "answer": 3},
      {"q": "This exam was ___ than the last one.", "options": ["easy", "easier", "easiest", "the easiest"], "answer": 1},
      {"q": "It's ___ day of the year.", "options": ["hot", "hotter", "hottest", "the hottest"], "answer": 3},
      {"q": "She is ___ than her sister.", "options": ["intelligent", "more intelligent", "most intelligent", "intelligenter"], "answer": 1},
      {"q": "That is ___ mistake of all.", "options": ["bad", "worse", "worst", "the worst"], "answer": 3},
      {"q": "He is ___ runner in the class.", "options": ["fast", "faster", "fastest", "the fastest"], "answer": 3},
      {"q": "My car is ___ than yours.", "options": ["cheap", "cheaper", "cheapest", "the cheapest"], "answer": 1},
      {"q": "This is ___ part of the book.", "options": ["interesting", "more interesting", "most interesting", "the most interesting"], "answer": 3}
    ]
  },
  "g_te_b1_01": {
    "explain": "TE B1 Checklist: Modals of Ability and Permission (Can, Could, Be able to). Use 'could' for past and 'be able to' for future or perfect tenses.",
    "questions": [
      {"q": "I ___ swim when I was four years old.", "options": ["can", "could", "am able to", "could to"], "answer": 1},
      {"q": "She ___ speak five languages fluently.", "options": ["can", "could", "is able to", "cans"], "answer": 0},
      {"q": "We ___ to finish the project by tomorrow.", "options": ["will can", "will be able", "can", "could"], "answer": 1},
      {"q": "___ I use your phone for a moment?", "options": ["Could", "Able to", "Can to", "Might to"], "answer": 0},
      {"q": "They haven't ___ find a solution yet.", "options": ["could", "been able to", "can", "able to"], "answer": 1},
      {"q": "He ___ jump very high before the injury.", "options": ["can", "could", "is able to", "could to"], "answer": 1},
      {"q": "___ you help me with this box?", "options": ["Can", "Could", "Are able to", "Might"], "answer": 0},
      {"q": "I'm sorry, I ___ come to the party tonight.", "options": ["couldn't", "can't", "won't be able", "not able to"], "answer": 1},
      {"q": "She ___ to read without her glasses.", "options": ["can't", "isn't able", "not able", "cannot"], "answer": 1},
      {"q": "___ they finish the marathon?", "options": ["Could", "Were able to", "Can", "Might"], "answer": 1}
    ]
  },
  "g_te_b1_02": {
    "explain": "TE B1 Checklist: Present Perfect (Experience/Result) vs Past Simple (Finished Time). Keywords: just, already, yet, ever, never, recently.",
    "questions": [
      {"q": "I ___ my lunch an hour ago.", "options": ["have eaten", "ate", "eat", "eaten"], "answer": 1},
      {"q": "She ___ to London three times.", "options": ["went", "has been", "has gone", "go"], "answer": 1},
      {"q": "___ you ever ___ sushi?", "options": ["Have / eat", "Did / eat", "Have / eaten", "Did / eaten"], "answer": 2},
      {"q": "We ___ haven't finished the project.", "options": ["already", "yet", "just", "still"], "answer": 3},
      {"q": "They ___ to the cinema last night.", "options": ["have gone", "went", "gone", "go"], "answer": 1},
      {"q": "I ___ just ___ the news.", "options": ["have / heard", "did / hear", "have / hear", "had / heard"], "answer": 0},
      {"q": "She ___ her keys yesterday morning.", "options": ["has lost", "lost", "lose", "loses"], "answer": 1},
      {"q": "We ___ here for ten years.", "options": ["lived", "have lived", "live", "lives"], "answer": 1},
      {"q": "___ they ___ from university yet?", "options": ["Did / graduate", "Have / graduated", "Has / graduated", "Did / graduated"], "answer": 1},
      {"q": "I ___ that movie when I was a child.", "options": ["have seen", "saw", "see", "seen"], "answer": 1}
    ]
  },
  "g_te_b1_03": {
    "explain": "TE B1 Checklist: Multiple Choice Use of English. Focused on vocabulary in context, prepositions, and grammatical accuracy in sentence completion.",
    "questions": [
      {"q": "Are you interested ___ learning a new language?", "options": ["in", "on", "at", "to"], "answer": 0},
      {"q": "I'm looking forward ___ meeting you.", "options": ["to", "at", "for", "with"], "answer": 0},
      {"q": "She is very good ___ playing the piano.", "options": ["on", "at", "in", "to"], "answer": 1},
      {"q": "We depend ___ the weather for our trip.", "options": ["on", "in", "at", "with"], "answer": 0},
      {"q": "He apologized ___ being late.", "options": ["to", "for", "at", "with"], "answer": 1},
      {"q": "Keep ___ studying and you will pass.", "options": ["on", "at", "to", "in"], "answer": 0},
      {"q": "I'm responsible ___ this project.", "options": ["for", "to", "at", "with"], "answer": 0},
      {"q": "She belongs ___ the local sports club.", "options": ["to", "on", "in", "at"], "answer": 0},
      {"q": "We are proud ___ our achievements.", "options": ["of", "for", "to", "at"], "answer": 0},
      {"q": "He's afraid ___ spiders.", "options": ["of", "to", "at", "for"], "answer": 0}
    ]
  },
  "g_te_b2_01": {
    "explain": "TE B2 Checklist: Conditionals and Wish. Focus on hypothetical situations and regrets about the past and present states.",
    "questions": [
      {"q": "If I ___ you, I wouldn't do that.", "options": ["am", "was", "were", "be"], "answer": 2},
      {"q": "I wish I ___ more time to study last week.", "options": ["have", "had", "had had", "would have"], "answer": 2},
      {"q": "If it ___ tomorrow, we'll cancel the picnic.", "options": ["rains", "will rain", "rained", "rain"], "answer": 0},
      {"q": "She wishes she ___ speak French fluently.", "options": ["can", "could", "will", "would"], "answer": 1},
      {"q": "If you ___ me, I would have helped you.", "options": ["ask", "asked", "had asked", "would have asked"], "answer": 2},
      {"q": "I wish you ___ making that noise!", "options": ["stop", "stopped", "would stop", "had stopped"], "answer": 2},
      {"q": "If he ___ harder, he would have passed.", "options": ["studies", "studied", "had studied", "would study"], "answer": 2},
      {"q": "Do you wish you ___ in a bigger house?", "options": ["live", "lived", "had lived", "will live"], "answer": 1},
      {"q": "If we ___ the map, we wouldn't be lost.", "options": ["have", "had", "had had", "would have"], "answer": 1},
      {"q": "I wish I ___ a car. It's so far to walk.", "options": ["have", "had", "am having", "would have"], "answer": 1}
    ]
  },
  "g_te_b2_02": {
    "explain": "TE B2 Checklist: Passive Mastery. Focus on passive in different tenses: present/past continuous, and modal passive structures.",
    "questions": [
      {"q": "The bridge ___ when I was there.", "options": ["built", "was built", "was being built", "is built"], "answer": 2},
      {"q": "The homework must ___ by tomorrow.", "options": ["finish", "be finished", "be finishing", "finished"], "answer": 1},
      {"q": "A new hospital ___ in our city.", "options": ["is built", "is being built", "builds", "was built"], "answer": 1},
      {"q": "The letter ___ yesterday afternoon.", "options": ["sent", "was sent", "is sent", "was sending"], "answer": 1},
      {"q": "These cars ___ in Germany.", "options": ["make", "are made", "are making", "made"], "answer": 1},
      {"q": "The match ___ because of the rain.", "options": ["cancelled", "was cancelled", "is cancelled", "cancels"], "answer": 1},
      {"q": "Coffee ___ in Brazil.", "options": ["grows", "is grown", "is growing", "grew"], "answer": 1},
      {"q": "The results ___ yet.", "options": ["haven't announced", "haven't been announced", "didn't announce", "aren't announced"], "answer": 1},
      {"q": "The report ___ by Friday.", "options": ["will finish", "will be finished", "finishes", "is finishing"], "answer": 1},
      {"q": "The window ___ by the boy.", "options": ["broke", "was broken", "is breaking", "is broken"], "answer": 1}
    ]
  },
  "g_te_b2_03": {
    "explain": "TE B2 Checklist: Verb Patterns (-ing / to infinitive). Some verbs can take both with a change in meaning (stop, remember, forget).",
    "questions": [
      {"q": "I enjoy ___ to music.", "options": ["listen", "to listen", "listening", "listened"], "answer": 2},
      {"q": "She promised ___ me back.", "options": ["calling", "to call", "call", "called"], "answer": 1},
      {"q": "I suggest ___ to the park.", "options": ["go", "to go", "going", "gone"], "answer": 2},
      {"q": "He avoided ___ my questions.", "options": ["answering", "to answer", "answer", "answered"], "answer": 0},
      {"q": "We decided ___ a new car.", "options": ["buying", "to buy", "buy", "bought"], "answer": 1},
      {"q": "Please remember ___ the light.", "options": ["turning off", "to turn off", "turn off", "turned off"], "answer": 1},
      {"q": "He kept ___ while I was talking.", "options": ["to talk", "talking", "talked", "talk"], "answer": 1},
      {"q": "I'll never forget ___ Istanbul.", "options": ["visit", "to visit", "visiting", "visited"], "answer": 2},
      {"q": "She manage ___ pass the exam.", "options": ["to", "in", "into", "at"], "answer": 0},
      {"q": "We expect ___ for dinner.", "options": ["they stay", "them staying", "them to stay", "they to stay"], "answer": 2}
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

print(f"Replaced {replaced} TE modules (Part 1) with real content. Total modules: {len(data)}")
