import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/grammar_tasks_hard.json'

REAL_CONTENT = {
  "g_c2_nom_01": {
    "explain": "Nominalization (turning verbs/adjectives into nouns) is a hallmark of academic writing to increase lexical density. Example: 'He discovered the cure.' → 'The discovery of the cure.' It enables more abstract and objective reporting of facts. Over-nominalization can make text dense, so use it strategically.",
    "questions": [
      {"q": "The ___ of the new policy led to widespread protests.", "options": ["implement", "implementation", "implementing", "implemented"], "answer": 1},
      {"q": "Their ___ to reach a compromise was disappointing.", "options": ["fail", "failure", "failing", "failed"], "answer": 1},
      {"q": "___ of natural resources is a major global concern.", "options": ["Deplete", "Depletion", "Depleting", "Depleted"], "answer": 1},
      {"q": "The ___ of the experiment was questioned by many.", "options": ["valid", "validity", "validate", "validating"], "answer": 1},
      {"q": "A thorough ___ of the data revealed several errors.", "options": ["analyze", "analysis", "analyzing", "analyzed"], "answer": 1},
      {"q": "The ___ of the disease depends on early detection.", "options": ["prevent", "prevention", "preventing", "prevented"], "answer": 1},
      {"q": "Rapid ___ changed the demographic of the region.", "options": ["urbanize", "urbanization", "urbanizing", "urbanized"], "answer": 1},
      {"q": "The ___ of the project was due to lack of funding.", "options": ["terminate", "termination", "terminating", "terminated"], "answer": 1},
      {"q": "___ of fossil fuels contributes to global warming.", "options": ["Consume", "Consumption", "Consuming", "Consumed"], "answer": 1},
      {"q": "The ___ of the theory was later confirmed by tests.", "options": ["accurate", "accuracy", "accurately", "accurateness"], "answer": 1}
    ]
  },
  "g_c2_inv_02": {
    "explain": "Advanced Conditional Inversion removes 'if' and starts with the auxiliary. Type 1: Should you need (If you should need). Type 2: Were I you (If I were you). Type 3: Had I known (If I had known). This is highly formal and common in academic or legal contexts.",
    "questions": [
      {"q": "___ I known about the changes, I would have acted differently.", "options": ["If", "Had", "Did", "Should"], "answer": 1},
      {"q": "___ you require any further assistance, please contact me.", "options": ["Should", "Had", "Were", "Did"], "answer": 0},
      {"q": "___ I in your position, I would definitely accept the offer.", "options": ["Was", "Were", "Had", "Should"], "answer": 1},
      {"q": "___ the project to fail, it would be a disaster for us.", "options": ["Should", "Were", "Had", "If"], "answer": 1},
      {"q": "Never ___ seen such a brilliant display of skill.", "options": ["I had", "had I", "I have", "have I"], "answer": 1},
      {"q": "___ he arrived on time, we would have started earlier.", "options": ["Had", "Should", "Were", "Did"], "answer": 0},
      {"q": "___ you need more information, let us know immediately.", "options": ["Should", "Were", "Had", "If"], "answer": 0},
      {"q": "___ it not for your help, I wouldn't have succeeded.", "options": ["Was", "Were", "Had", "Should"], "answer": 1},
      {"q": "___ you change your mind, we are here for you.", "options": ["Should", "Were", "Had", "If"], "answer": 0},
      {"q": "___ the weather to improve, we could go for a hike.", "options": ["Should", "Were", "Had", "If"], "answer": 1}
    ]
  },
  "g_c2_mod_01": {
    "explain": "Epistemic Modality Mastery: Using modals to express degrees of certainty about the past, present, or future. 'Must' (certainty). 'Could/Might' (possibility). 'May' (formal possibility). 'Should' (expectation). This is crucial for hedging and nuance in academic arguments.",
    "questions": [
      {"q": "The results ___ point to a larger trend in urban design.", "options": ["must", "may", "should", "ought"], "answer": 1},
      {"q": "He ___ have known about the decision; he wasn't at the meeting.", "options": ["can't", "mustn't", "shouldn't", "might not"], "answer": 0},
      {"q": "These findings ___ be interpreted with caution.", "options": ["must", "should", "could", "may"], "answer": 1},
      {"q": "By now, the data ___ have been processed.", "options": ["must", "should", "could", "may"], "answer": 1},
      {"q": "It ___ be that the initial hypothesis was incorrect.", "options": ["must", "could", "should", "ought"], "answer": 1},
      {"q": "The evidence ___ have been tampered with before we arrived.", "options": ["could", "must", "should", "can"], "answer": 0},
      {"q": "This theory ___ explain the phenomenon adequately.", "options": ["may not", "must not", "should not", "can not"], "answer": 0},
      {"q": "A change in temperature ___ affect the outcome.", "options": ["might", "must", "should", "can"], "answer": 0},
      {"q": "The implications ___ be far-reaching for the industry.", "options": ["could", "must", "should", "can"], "answer": 0},
      {"q": "One ___ conclude that the economy is recovering.", "options": ["might", "must", "should", "can"], "answer": 0}
    ]
  },
  "g_c2_edit_01": {
    "explain": "P4 Mastery focuses on meticulous error correction in academic texts. Common issues: subject-verb agreement in complex sentences, dangling modifiers, misuse of transition words, and punctuation errors. It requires a deep understanding of lexical and grammatical precision.",
    "questions": [
      {"q": "Identify the error: 'The criteria for the research was not clearly defined.'", "options": ["criteria", "for", "was", "defined"], "answer": 2},
      {"q": "Identify the error: 'He is one of those students who always studies hard.'", "options": ["those", "who", "studies", "hard"], "answer": 2},
      {"q": "Identify the error: 'Neither of the options are suitable for our needs.'", "options": ["Neither", "of", "are", "suitable"], "answer": 2},
      {"q": "Identify the error: 'Despite of his efforts, he failed the exam.'", "options": ["Despite", "of", "his", "failed"], "answer": 1},
      {"q": "Identify the error: 'The reason why he left is because he was bored.'", "options": ["why", "left", "is", "because"], "answer": 3},
      {"q": "Identify the error: 'Each of the participants have been notified.'", "options": ["Each", "of", "have", "notified"], "answer": 2},
      {"q": "Identify the error: 'I look forward to meet you next week.'", "options": ["look", "forward", "to", "meet"], "answer": 3},
      {"q": "Identify the error: 'The data is being analyzed currently.'", "options": ["data", "is", "being", "currently"], "answer": 0},
      {"q": "Identify the error: 'He has less friends than he used to have.'", "options": ["has", "less", "than", "used to"], "answer": 1},
      {"q": "Identify the error: 'Smoking is not allowed in anywhere in the building.'", "options": ["is", "not", "in anywhere", "building"], "answer": 2}
    ]
  },
  "g_c2_sty_01": {
    "explain": "Stylistic Fronting & Inversion: Moving parts of speech (adjectives, particles, verbs) to the front of a sentence for dramatic effect. Adjective fronting: 'Great was his joy.' Particle fronting: 'Away flew the birds.' Verb fronting: 'Standing in the corner was a tall man.'",
    "questions": [
      {"q": "___ was the noise that we couldn't hear each other.", "options": ["Such", "So", "Thus", "Very"], "answer": 0},
      {"q": "___ came the rain, and the fields turned green.", "options": ["Down", "Downwards", "Downly", "Downing"], "answer": 0},
      {"q": "___ but true is the story of his life.", "options": ["Strange", "Strangely", "Stranger", "Strangest"], "answer": 0},
      {"q": "___ atop the mountain stood a lonely cabin.", "options": ["High", "Highly", "Higher", "Highest"], "answer": 0},
      {"q": "___ were his words that many people cried.", "options": ["So", "Such", "Very", "Too"], "answer": 1},
      {"q": "___ the sun, and we all felt warmer.", "options": ["Up rose", "Up rising", "Up raised", "Up rose the sun"], "answer": 0},
      {"q": "___ in the corner of the room sat an old man.", "options": ["Huddled", "Huddling", "Huddle", "Huddledly"], "answer": 0},
      {"q": "___ was the news that they were stunned.", "options": ["So", "Such", "Very", "Too"], "answer": 1},
      {"q": "___ away the birds, startled by the noise.", "options": ["Flew", "Fly", "Flying", "Flown"], "answer": 0},
      {"q": "___ is the importance of this task that we cannot wait.", "options": ["Such", "So", "Thus", "Very"], "answer": 0}
    ]
  },
  "g_c2_hedge_01": {
    "explain": "Hedging & Speculation: Using language to show caution or uncertainty (e.g., 'suggests', 'tends to', 'appears to'). This is essential in academic writing to avoid overgeneralization. Use modals (could, might), adverbs (probably, possibly), or verbs (seem, appear).",
    "questions": [
      {"q": "The evidence ___ that the trends are changing.", "options": ["proves", "shows", "suggests", "confirms"], "answer": 2},
      {"q": "It ___ that the initial findings were slightly biased.", "options": ["is", "appears", "seems", "feels"], "answer": 1},
      {"q": "These results ___ be seen as representative of the whole population.", "options": ["cannot", "should not", "might not", "must not"], "answer": 2},
      {"q": "The outcome is ___ to be affected by the new policy.", "options": ["likely", "possible", "certain", "sure"], "answer": 0},
      {"q": "One ___ argument is that the data is incomplete.", "options": ["potential", "certain", "proved", "verified"], "answer": 0},
      {"q": "The findings ___ to point to a different conclusion.", "options": ["seem", "are", "must", "show"], "answer": 0},
      {"q": "It is ___ that the process will take longer than expected.", "options": ["certain", "proved", "possible", "clear"], "answer": 2},
      {"q": "The study ___ some interesting questions about the topic.", "options": ["raises", "proves", "confirms", "shows"], "answer": 0},
      {"q": "These conclusions are ___ speculative at this stage.", "options": ["highly", "very", "too", "so"], "answer": 0},
      {"q": "The data ___ support the current hypothesis.", "options": ["appears to", "proves to", "confirms to", "shows to"], "answer": 0}
    ]
  },
  "g_c2_meta_01": {
    "explain": "Metadiscourse Patterns: Using language to guide the reader through the text (e.g., 'In conclusion', 'Furthermore', 'On the other hand'). Interactive metadiscourse (connectives, frame markers) vs interactional metadiscourse (boosters, hedges, self-mention).",
    "questions": [
      {"q": "___, the study found no significant correlation.", "options": ["Furthermore", "In contrast", "Overall", "Specifically"], "answer": 1},
      {"q": "___, we will discuss the implications of the findings.", "options": ["Secondly", "Next", "Then", "After"], "answer": 1},
      {"q": "___ to the previous study, this one uses a larger sample.", "options": ["In addition", "Contrary", "Furthermore", "Specifically"], "answer": 1},
      {"q": "___ can be seen in figure 1, the trends are upward.", "options": ["As", "Like", "How", "When"], "answer": 0},
      {"q": "___, the results are consistent with the hypothesis.", "options": ["Briefly", "To summarize", "Clearly", "Specifically"], "answer": 1},
      {"q": "___ mentioned earlier, the process is quite complex.", "options": ["As", "Like", "How", "When"], "answer": 0},
      {"q": "___, let us consider the alternative viewpoint.", "options": ["Now", "Then", "Next", "After"], "answer": 0},
      {"q": "___, the project was a success despite the challenges.", "options": ["Specifically", "Overall", "In contrast", "Furthermore"], "answer": 1},
      {"q": "___, I will argue that the policy needs changing.", "options": ["Furthermore", "In this essay", "Specifically", "Clearly"], "answer": 1},
      {"q": "___ to say, the results were quite surprising.", "options": ["Needless", "Clearly", "Specifically", "Overall"], "answer": 0}
    ]
  },
  "g_c2_beast_01": {
    "explain": "Absolute Beast Mode: Synthesis of all advanced grammatical structures in complex academic discourse. It tests your ability to handle multiple transformations, inversions, and semantic nuances simultaneously in a single context.",
    "questions": [
      {"q": "Only after the data had been processed ___ realized the mistake.", "options": ["did they", "they did", "have they", "they were"], "answer": 0},
      {"q": "Had they ___ more careful, the accident wouldn't have happened.", "options": ["been", "were", "are", "be"], "answer": 0},
      {"q": "Such ___ the importance of the project that we worked all night.", "options": ["is", "was", "were", "are"], "answer": 1},
      {"q": "The thing ___ matters most is your dedication to the task.", "options": ["what", "that", "which", "where"], "answer": 1},
      {"q": "Little ___ know that the boss was watching him.", "options": ["he did", "did he", "he knew", "knowing"], "answer": 1},
      {"q": "___ it not for your support, I wouldn't be here today.", "options": ["Were", "Had", "Was", "Should"], "answer": 0},
      {"q": "Not only ___ he late, but he also forgot his notes.", "options": ["was", "did", "were", "been"], "answer": 0},
      {"q": "___ she to apologize, I would forgive her.", "options": ["Were", "Should", "Had", "If"], "answer": 1},
      {"q": "___ the sun, and we all felt much better.", "options": ["Up rose", "Up rising", "Up raised", "Up rose the sun"], "answer": 0},
      {"q": "It was her determination ___ led to her success.", "options": ["which", "that", "who", "where"], "answer": 1}
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

print(f"Replaced {replaced} C2 modules with real content. Total modules: {len(data)}")
