import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/grammar_tasks_hard.json'

REAL_CONTENT = {
  "g_b2_mix_01": {
    "explain": "Mixed Conditionals combine past and present. Pattern 1: If + Past Perfect, would + base verb (Past action → Present result). Pattern 2: If + Past Simple, would have + V3 (Present state → Past result). Example: 'If I hadn't missed the bus, I would be here now.'",
    "questions": [
      {"q": "If I ___ so much last night, I wouldn't feel so sick now.", "options": ["didn't eat", "hadn't eaten", "won't eat", "haven't eaten"], "answer": 1},
      {"q": "If he ___ more organized, he would have finished the project on time.", "options": ["is", "was", "were", "been"], "answer": 2},
      {"q": "If she ___ the map, we wouldn't be lost in the forest now.", "options": ["didn't lose", "hadn't lost", "hasn't lost", "doesn't lose"], "answer": 1},
      {"q": "We ___ in this mess if you had listened to my advice.", "options": ["aren't", "won't be", "wouldn't be", "wouldn't have been"], "answer": 2},
      {"q": "If I ___ you, I would have accepted that job offer in London.", "options": ["am", "was", "were", "be"], "answer": 2},
      {"q": "If they ___ enough money, they would have stayed in a better hotel.", "options": ["have", "had", "will have", "would have"], "answer": 1},
      {"q": "If I had taken that opportunity, my life ___ very different today.", "options": ["is", "will be", "would be", "would have been"], "answer": 2},
      {"q": "If she ___ speak French, she would have translated the document for us.", "options": ["can", "could", "is able to", "will be able to"], "answer": 1},
      {"q": "If you ___ the tickets yesterday, we would be going to the concert now.", "options": ["bought", "had bought", "buy", "have bought"], "answer": 1},
      {"q": "I ___ so tired now if I had gone to bed earlier last night.", "options": ["am not", "won't be", "wouldn't be", "wouldn't have been"], "answer": 2}
    ]
  },
  "g_b2_mod_01": {
    "explain": "Past Modals of Deduction (modal + have + V3): 'Must have' (90% sure it happened). 'Can't have' (90% sure it didn't). 'Might/Could have' (50% sure it was possible). 'Should have' (regret/unmet expectation).",
    "questions": [
      {"q": "She looks upset. She ___ some bad news.", "options": ["must have heard", "can't have heard", "should have heard", "might hear"], "answer": 0},
      {"q": "I'm not sure where my keys are. I ___ them at the office.", "options": ["must have left", "could have left", "should have left", "can't have left"], "answer": 1},
      {"q": "He ___ the exam! He didn't study at all.", "options": ["must have passed", "can't have passed", "should have passed", "might have passed"], "answer": 1},
      {"q": "You ___ so much money on that shirt. It's not even nice.", "options": ["shouldn't have spent", "couldn't have spent", "mustn't have spent", "might not have spent"], "answer": 0},
      {"q": "The streets are wet. It ___ during the night.", "options": ["must have rained", "can't have rained", "should have rained", "might rain"], "answer": 0},
      {"q": "I ___ more for the final. I only got a C.", "options": ["must have studied", "should have studied", "could have studied", "might have studied"], "answer": 1},
      {"q": "They ___ her. She was waiting for over an hour.", "options": ["must have forgotten", "can't have forgotten", "should have forgotten", "might forget"], "answer": 0},
      {"q": "He ___ the message yet. I only sent it a minute ago.", "options": ["must have seen", "can't have seen", "should have seen", "might have seen"], "answer": 1},
      {"q": "She ___ the car. She doesn't have a license.", "options": ["must have driven", "can't have driven", "should have driven", "might have driven"], "answer": 1},
      {"q": "I failed the test. I ___ my notes more carefully.", "options": ["must have reviewed", "should have reviewed", "could have reviewed", "might have reviewed"], "answer": 1}
    ]
  },
  "g_c1_inv_01": {
    "explain": "Inversion after negative or restrictive adverbials (Never, Seldom, Hardly, No sooner, Not only) requires the auxiliary verb to come before the subject. Example: 'Never have I seen such a beautiful view.' 'Not only did he arrive late, but he also forgot his books.'",
    "questions": [
      {"q": "Never ___ such a magnificent performance in my life.", "options": ["I have seen", "have I seen", "I saw", "did I see"], "answer": 1},
      {"q": "Seldon ___ the professor arrived late for a lecture.", "options": ["has", "did", "was", "is"], "answer": 0},
      {"q": "Not only ___ the exam, but he also got the highest mark.", "options": ["he passed", "did he pass", "he was passing", "has he passed"], "answer": 1},
      {"q": "Hardly ___ started our dinner when the phone rang.", "options": ["we had", "had we", "we have", "have we"], "answer": 1},
      {"q": "Only in this way ___ we solve the problem effectively.", "options": ["we can", "can we", "we will", "shall we"], "answer": 1},
      {"q": "Under no circumstances ___ the door be left unlocked.", "options": ["the door should", "should the door", "the door must", "must the door"], "answer": 1},
      {"q": "No sooner ___ the house than it started to pour with rain.", "options": ["I left", "had I left", "I had left", "did I leave"], "answer": 1},
      {"q": "Little ___ he know that his life was about to change forever.", "options": ["he did", "did he", "he knew", "knowing"], "answer": 1},
      {"q": "At no time ___ me of the potential risks involved.", "options": ["they warned", "did they warn", "they were warning", "have they warned"], "answer": 1},
      {"q": "Not until the next day ___ the full extent of the damage.", "options": ["we realized", "did we realize", "we had realized", "have we realized"], "answer": 1}
    ]
  },
  "g_c1_cleft_01": {
    "explain": "Cleft sentences (It-clefts and Wh-clefts) focus on specific information for emphasis. It-cleft: 'It was the manager who made the decision.' Wh-cleft: 'What we need is more investment.' Pseudo-clefts often use 'The thing that...' or 'All I want is...'.",
    "questions": [
      {"q": "___ I need right now is a long holiday.", "options": ["What", "That", "Which", "It"], "answer": 0},
      {"q": "It was my sister ___ encouraged me to apply for the job.", "options": ["which", "who", "that", "where"], "answer": 1},
      {"q": "___ it really matters to us is your honesty.", "options": ["What", "That", "It", "Which"], "answer": 0},
      {"q": "It is in this small village ___ the famous author was born.", "options": ["which", "that", "where", "who"], "answer": 1},
      {"q": "___ I love about living here is the peaceful atmosphere.", "options": ["What", "That", "It", "Which"], "answer": 0},
      {"q": "All ___ did was ask a simple question.", "options": ["he", "what he", "that he", "which he"], "answer": 0},
      {"q": "It was only recently ___ I realized the importance of health.", "options": ["when", "that", "which", "where"], "answer": 1},
      {"q": "___ he is trying to say is that he disagrees with the plan.", "options": ["What", "That", "It", "Which"], "answer": 0},
      {"q": "It was because of the rain ___ the flight was delayed.", "options": ["which", "that", "where", "why"], "answer": 1},
      {"q": "The thing ___ annoyed me most was his arrogant attitude.", "options": ["what", "that", "which", "where"], "answer": 1}
    ]
  },
  "g_c1_sub_01": {
    "explain": "The Subjunctive Mood is used in formal English after certain verbs (suggest, recommend, demand, insist) or adjectives (essential, important, vital). It uses the base form of the verb for all subjects: 'It is vital that he be informed immediately.' 'I suggest she study harder.'",
    "questions": [
      {"q": "The committee recommended that he ___ for the promotion.", "options": ["applies", "apply", "applying", "applied"], "answer": 1},
      {"q": "It is essential that every student ___ the rules.", "options": ["knows", "know", "knowing", "known"], "answer": 1},
      {"q": "She insisted that he ___ the money immediately.", "options": ["returns", "return", "returning", "returned"], "answer": 1},
      {"q": "I suggest that she ___ a lawyer before signing the contract.", "options": ["consults", "consult", "consulting", "consulted"], "answer": 1},
      {"q": "It is vital that the patient ___ absolute rest.", "options": ["has", "have", "having", "had"], "answer": 1},
      {"q": "He demanded that the manager ___ for the mistake.", "options": ["apologizes", "apologize", "apologizing", "apologized"], "answer": 1},
      {"q": "The doctor suggested that she ___ less sugar.", "options": ["eats", "eat", "eating", "ate"], "answer": 1},
      {"q": "It is important that everyone ___ on time for the meeting.", "options": ["is", "be", "being", "been"], "answer": 1},
      {"q": "She proposed that we ___ the project until next year.", "options": ["postpone", "postpones", "postponing", "postponed"], "answer": 0},
      {"q": "It is necessary that he ___ a decision by tomorrow morning.", "options": ["makes", "make", "making", "made"], "answer": 1}
    ]
  },
  "g_c1_part_01": {
    "explain": "Participle Clauses (Ending in -ing or -ed) reduce relative clauses or show reason/time. Present participle (-ing): active (Feeling tired, I went to bed). Past participle (-ed): passive (Shocked by the news, she cried). They must share the same subject as the main clause.",
    "questions": [
      {"q": "___ tired from the long walk, I decided to take a nap.", "options": ["Feeling", "Feel", "Felt", "Having feel"], "answer": 0},
      {"q": "___ in 1950, this building is a great example of modernism.", "options": ["Building", "Built", "Build", "Having built"], "answer": 1},
      {"q": "___ his homework, he went out to play with his friends.", "options": ["Finishing", "Finished", "Having finished", "Finish"], "answer": 2},
      {"q": "___ for the bus, I met an old school friend.", "options": ["Waiting", "Waited", "Wait", "Having waited"], "answer": 0},
      {"q": "___ by the professor's praise, the student worked even harder.", "options": ["Encouraging", "Encouraged", "Encourage", "Having encouraged"], "answer": 1},
      {"q": "___ the news on TV, she immediately called her parents.", "options": ["Hearing", "Heard", "Hear", "Having heard"], "answer": 0},
      {"q": "___ by millions of people, the movie was a huge success.", "options": ["Watching", "Watched", "Watch", "Having watched"], "answer": 1},
      {"q": "___ a mistake, the student corrected it quickly.", "options": ["Realizing", "Realized", "Realize", "Having realized"], "answer": 0},
      {"q": "___ near the bridge, the house has a beautiful view.", "options": ["Siting", "Situated", "Situate", "Sits"], "answer": 1},
      {"q": "___ my lunch, I wasn't hungry at all.", "options": ["Eating", "Eaten", "Having eaten", "Eat"], "answer": 2}
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

print(f"Replaced {replaced} C1/C2 modules with real content. Total modules: {len(data)}")
