import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/test_english_grammar_tasks.json'

REAL_CONTENT = {
  "g_te_b2_04": {
    "explain": "TE B2 Checklist: Advanced Relative Clauses. Use 'whose' for possession, 'where/when' for place/time, and non-defining clauses for extra info.",
    "questions": [
      {"q": "The man, ___ car was stolen, was very upset.", "options": ["who", "which", "whose", "whom"], "answer": 2},
      {"q": "Paris, ___ is the capital of France, is beautiful.", "options": ["who", "which", "where", "that"], "answer": 1},
      {"q": "He is the person ___ I told you about.", "options": ["who", "which", "whose", "whom"], "answer": 0},
      {"q": "That's the restaurant ___ we had our first date.", "options": ["who", "which", "where", "when"], "answer": 2},
      {"q": "The book ___ I bought yesterday is great.", "options": ["who", "which", "where", "whose"], "answer": 1},
      {"q": "My brother, ___ lives in London, is a doctor.", "options": ["who", "which", "that", "where"], "answer": 0},
      {"q": "I'll never forget the day ___ we met.", "options": ["who", "which", "where", "when"], "answer": 3},
      {"q": "The house ___ roof is red is mine.", "options": ["who", "which", "whose", "whom"], "answer": 2},
      {"q": "This is the computer ___ I use at work.", "options": ["who", "which", "that", "where"], "answer": 1},
      {"q": "She is the teacher ___ helped me the most.", "options": ["who", "which", "where", "whose"], "answer": 0}
    ]
  },
  "g_te_c1_01": {
    "explain": "TE C1 Checklist: Inversion and Emphasis. Use negative frequency adverbs (Never, Seldom) or 'Only when/after' at the beginning of the sentence.",
    "questions": [
      {"q": "Never ___ I seen such a beautiful lady.", "options": ["I have", "have I", "I saw", "did I see"], "answer": 1},
      {"q": "Not only ___ he late, but he also forgot his notes.", "options": ["was", "did", "were", "been"], "answer": 0},
      {"q": "Only after the show ___ we realize the mistake.", "options": ["we did", "did we", "have we", "we have"], "answer": 1},
      {"q": "Rarely ___ we go to the cinema these days.", "options": ["we go", "do we go", "are we go", "have we go"], "answer": 1},
      {"q": "No sooner ___ we arrived than it started to rain.", "options": ["we had", "had we", "we have", "have we"], "answer": 1},
      {"q": "Under no circumstances ___ you tell him the truth.", "options": ["you should", "should you", "you must", "must you"], "answer": 1},
      {"q": "Little ___ he know what was about to happen.", "options": ["he did", "did he", "he knew", "knowing"], "answer": 1},
      {"q": "At no time ___ she mention the project.", "options": ["she did", "did she", "she was", "has she"], "answer": 1},
      {"q": "Not until the next day ___ we get the news.", "options": ["we did", "did we", "we have", "have we"], "answer": 1},
      {"q": "Only by working hard ___ you succeed.", "options": ["can you", "you can", "will you", "you will"], "answer": 0}
    ]
  },
  "g_te_c1_02": {
    "explain": "TE C1 Checklist: Advanced Clause Structures (Conditionals, Subjunctive, Nominalization). Precision in academic register is key.",
    "questions": [
      {"q": "The committee insisted that she ___ her decision.", "options": ["reconsidered", "reconsider", "reconsidering", "reconsiders"], "answer": 1},
      {"q": "Were it not for your help, I ___ have finished.", "options": ["won't", "wouldn't", "don't", "didn't"], "answer": 1},
      {"q": "___ of the law is no excuse for breaking it.", "options": ["Ignoring", "Ignorance", "Ignorant", "Ignored"], "answer": 1},
      {"q": "Had I known, I ___ have told you.", "options": ["will", "would", "shall", "can"], "answer": 1},
      {"q": "It is vital that he ___ informed immediately.", "options": ["is", "was", "be", "been"], "answer": 2},
      {"q": "The ___ of the new policy was met with criticism.", "options": ["implement", "implementation", "implementing", "implemented"], "answer": 1},
      {"q": "___ you need any assistance, please let me know.", "options": ["Should", "Were", "Had", "If"], "answer": 0},
      {"q": "I suggest that he ___ a doctor.", "options": ["sees", "see", "seeing", "saw"], "answer": 1},
      {"q": "The ___ of the experiment was questioned.", "options": ["valid", "validity", "validate", "validating"], "answer": 1},
      {"q": "___ by the news, she left the room.", "options": ["Shocking", "Shocked", "Shock", "Having shocked"], "answer": 1}
    ]
  },
  "g_te_c1_03": {
    "explain": "TE C1 Checklist: Gapped Text and Sentence Transformation. Mastery of synonyms, phrasal verbs, and structural variety.",
    "questions": [
      {"q": "I'm looking forward to ___ you again.", "options": ["see", "seeing", "saw", "seen"], "answer": 1},
      {"q": "He is not used to ___ early.", "options": ["wake up", "waking up", "woke up", "woken up"], "answer": 1},
      {"q": "By the time he arrives, they ___ left.", "options": ["will", "will have", "have", "would have"], "answer": 1},
      {"q": "She denied ___ the money.", "options": ["steal", "to steal", "stealing", "stole"], "answer": 2},
      {"q": "Regardless ___ the weather, we will go out.", "options": ["of", "to", "at", "with"], "answer": 0},
      {"q": "I'd rather you ___ do that.", "options": ["don't", "didn't", "wasn't", "not"], "answer": 1},
      {"q": "It's high time you ___ your homework.", "options": ["start", "started", "starting", "starts"], "answer": 1},
      {"q": "She was so tired that she ___ sleep.", "options": ["cannot", "couldn't", "won't", "don't"], "answer": 1},
      {"q": "He's the man ___ I've heard so much about.", "options": ["who", "whom", "whose", "which"], "answer": 1},
      {"q": "The more you study, ___ you'll learn.", "options": ["the better", "better", "best", "the best"], "answer": 0}
    ]
  },
  "g_te_v_01": {
    "explain": "TE Style: Phrasal Verbs Advanced. Common phrasal verbs in high-frequency academic and social contexts (take up, get over, look into).",
    "questions": [
      {"q": "I need to ___ my notes before the test.", "options": ["look over", "look into", "look around", "look up"], "answer": 0},
      {"q": "Don't ___ on your dreams.", "options": ["give up", "give away", "give in", "give out"], "answer": 0},
      {"q": "We need to ___ a solution soon.", "options": ["come up with", "come down with", "come across", "come along"], "answer": 0},
      {"q": "He ___ the invitation because he was busy.", "options": ["turned down", "turned up", "turned off", "turned on"], "answer": 0},
      {"q": "I ___ an old friend in the street today.", "options": ["ran into", "ran out of", "ran away", "ran over"], "answer": 0},
      {"q": "The meeting was ___ until next week.", "options": ["put off", "put out", "put on", "put up"], "answer": 0},
      {"q": "She ___ from university last year.", "options": ["graduated", "left", "dropped out", "came out"], "answer": 2},
      {"q": "Can you ___ the TV? I want to watch the news.", "options": ["turn on", "turn off", "turn up", "turn down"], "answer": 0},
      {"q": "I'm ___ my keys. Have you seen them?", "options": ["looking for", "looking at", "looking after", "looking around"], "answer": 0},
      {"q": "He ___ for his father in every way.", "options": ["takes after", "takes off", "takes up", "takes in"], "answer": 0}
    ]
  },
  "g_te_v_02": {
    "explain": "TE Style: Academic Collocations. Common verb-noun and adjective-noun pairings (conduct research, draw conclusions, highly significant).",
    "questions": [
      {"q": "The results were ___ significant.", "options": ["highly", "very", "too", "so"], "answer": 0},
      {"q": "He ___ research on the topic for years.", "options": ["did", "conducted", "made", "had"], "answer": 1},
      {"q": "We need to ___ a conclusion based on the data.", "options": ["draw", "make", "take", "do"], "answer": 0},
      {"q": "There is a ___ difference between the two groups.", "options": ["big", "substantial", "large", "huge"], "answer": 1},
      {"q": "The theory is ___ on solid evidence.", "options": ["based", "founded", "built", "placed"], "answer": 0},
      {"q": "He made a ___ contribution to the field.", "options": ["valuable", "good", "nice", "great"], "answer": 0},
      {"q": "We need to ___ the problem immediately.", "options": ["address", "solve", "handle", "deal"], "answer": 0},
      {"q": "The study ___ many important questions.", "options": ["raises", "shows", "proves", "gives"], "answer": 0},
      {"q": "There is a ___ correlation between the variables.", "options": ["strong", "big", "heavy", "hard"], "answer": 0},
      {"q": "The data ___ our initial hypothesis.", "options": ["supports", "proves", "shows", "gives"], "answer": 0}
    ]
  },
  "g_te_t_01": {
    "explain": "TE Style: Sentence Transformation 1. Rewriting sentences using a given word (keyword transformation) to maintain the same meaning.",
    "questions": [
      {"q": "He said he was sorry he was late. (APOLOGIZED) → He ___ late.", "options": ["apologized for being", "apologized to be", "apologized for he was", "apologized that he was"], "answer": 0},
      {"q": "I'm sure he is at home. (MUST) → He ___ at home.", "options": ["must be", "must to be", "must being", "must have been"], "answer": 0},
      {"q": "It was too expensive for us to buy. (ENOUGH) → It wasn't ___ buy.", "options": ["cheap enough to", "cheaper enough to", "cheap enough for", "cheap enough"], "answer": 0},
      {"q": "I haven't seen him for ages. (LAST) → The ___ ages ago.", "options": ["last time I saw him was", "last time I saw him is", "last time I've seen him was", "last time I saw him"], "answer": 0},
      {"q": "They cancelled the match because of the rain. (OFF) → The match ___ of the rain.", "options": ["was called off because", "called off because", "is called off because", "called off"], "answer": 0},
      {"q": "I'd prefer to stay at home. (RATHER) → I ___ at home.", "options": ["would rather stay", "would rather to stay", "would rather staying", "rather"], "answer": 0},
      {"q": "Someone is repairing my car. (REPAIRED) → I am ___ my car.", "options": ["having / repaired", "getting / repair", "having / repair", "repaired"], "answer": 0},
      {"q": "I advise you to see a doctor. (SHOULD) → You ___ a doctor.", "options": ["should see", "should to see", "should seeing", "should have seen"], "answer": 0},
      {"q": "She is more intelligent than her brother. (AS) → Her brother isn't ___ she is.", "options": ["as intelligent as", "as intelligent than", "so intelligent as", "so intelligent"], "answer": 0},
      {"q": "We went out although it was raining. (SPITE) → We went out ___ rain.", "options": ["in spite of the", "despite the", "spite of the", "in spite"], "answer": 0}
    ]
  },
  "g_te_t_02": {
    "explain": "TE Style: Sentence Transformation 2. Focused on passive, reported speech, and conditional transformations.",
    "questions": [
      {"q": "'Where is the nearest bank?' he asked. (KNEW) → He asked ___ nearest bank was.", "options": ["if I knew where the", "where the", "where is the", "where was the"], "answer": 0},
      {"q": "They are building a new school. (BUILT) → A new school ___.", "options": ["is being built", "is built", "built", "has been built"], "answer": 0},
      {"q": "I didn't go because I was tired. (IF) → ___ tired, I would have gone.", "options": ["If I hadn't been", "If I wasn't", "If I'm not", "If I weren't"], "answer": 0},
      {"q": "She was so happy that she cried. (SUCH) → She had ___ that she cried.", "options": ["such happiness", "such a happy", "such happy", "so happy"], "answer": 0},
      {"q": "He is too young to vote. (OLD) → He isn't ___ to vote.", "options": ["old enough", "enough old", "older enough", "so old"], "answer": 0},
      {"q": "I'm sorry I didn't call you. (WISH) → I ___ called you.", "options": ["wish I had", "wish I", "wish I haven't", "wish I've"], "answer": 0},
      {"q": "It is said that he is very rich. (BE) → He is said ___ very rich.", "options": ["to be", "being", "is", "be"], "answer": 0},
      {"q": "I'll help you if you like. (WANT) → Do you ___ help you?", "options": ["want me to", "want that I", "want I", "want my"], "answer": 0},
      {"q": "The news surprised me. (BY) → I ___ the news.", "options": ["was surprised by", "surprised by", "am surprised by", "got surprised"], "answer": 0},
      {"q": "The film was so boring. (BORED) → I ___ the film.", "options": ["was bored by", "bored by", "am bored by", "got bored"], "answer": 0}
    ]
  },
  "g_te_e_01": {
    "explain": "TE Style: Error Correction (Grammar). Identifying syntactical or morphological errors in sentence structures.",
    "questions": [
      {"q": "Identify the error: 'He has less friends than he used to have.'", "options": ["has", "less", "than", "used to"], "answer": 1},
      {"q": "Identify the error: 'Each of the participants have been notified.'", "options": ["Each", "of", "have", "notified"], "answer": 2},
      {"q": "Identify the error: 'If I was you, I would take the job.'", "options": ["If", "was", "would", "take"], "answer": 1},
      {"q": "Identify the error: 'I look forward to hear from you soon.'", "options": ["look", "forward", "to", "hear"], "answer": 3},
      {"q": "Identify the error: 'The data is being analyzed by the team.'", "options": ["data", "is", "being", "analyzed"], "answer": 0},
      {"q": "Identify the error: 'Despite of the rain, we went for a walk.'", "options": ["Despite", "of", "the", "went"], "answer": 1},
      {"q": "Identify the error: 'Neither of the students are absent today.'", "options": ["Neither", "of", "are", "absent"], "answer": 2},
      {"q": "Identify the error: 'She is more cleverer than her sister.'", "options": ["is", "more", "cleverer", "than"], "answer": 1},
      {"q": "Identify the error: 'He enjoys listening the music.'", "options": ["enjoys", "listening", "the", "music"], "answer": 1},
      {"q": "Identify the error: 'I have finished my work since two hours.'", "options": ["have", "finished", "since", "two hours"], "answer": 2}
    ]
  },
  "g_te_e_02": {
    "explain": "TE Style: Error Correction (Vocab). Identifying semantic or word-choice errors in context.",
    "questions": [
      {"q": "Identify the error: 'Can you borrow me your pen for a second?'", "options": ["Can", "borrow", "me", "pen"], "answer": 1},
      {"q": "Identify the error: 'He did a lot of mistakes in the test.'", "options": ["did", "lot of", "mistakes", "test"], "answer": 0},
      {"q": "Identify the error: 'We have to win him in the next game.'", "options": ["have to", "win", "him", "next game"], "answer": 1},
      {"q": "Identify the error: 'I haven't got any homeworks today.'", "options": ["haven't", "any", "homeworks", "today"], "answer": 2},
      {"q": "Identify the error: 'She gave me a very good advice.'", "options": ["gave", "me", "a", "good advice"], "answer": 2},
      {"q": "Identify the error: 'The film was very interesting, I liked it very much.'", "options": ["film", "interesting", "liked", "very much"], "answer": 3},
      {"q": "Identify the error: 'He is a very sensible person, he cries easily.'", "options": ["sensible", "person", "cries", "easily"], "answer": 0},
      {"q": "Identify the error: 'I am sorry, I can't come, I have a strong headache.'", "options": ["sorry", "come", "strong", "headache"], "answer": 2},
      {"q": "Identify the error: 'We had a very good weather on our holiday.'", "options": ["had", "a", "good weather", "holiday"], "answer": 1},
      {"q": "Identify the error: 'Please remember to close the door when you leave.'", "options": ["remember", "to close", "door", "leave"], "answer": 0}
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

print(f"Replaced {replaced} TE modules (Part 2) with real content. Total modules: {len(data)}")
