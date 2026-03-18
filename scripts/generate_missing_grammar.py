import json

missing_items = [
    {
        "id": "g_p3_04",
        "level": "P3",
        "title": "Advanced Clause Structures & Emphasis",
        "time": "12 min",
        "difficulty": "hard",
        "explain": "Focuses on emphasis techniques like cleft sentences ('It is... that...'), reduced relative clauses, and absolute constructions which add sophistication to academic writing.",
        "questions": [
            {"q": "It was her groundbreaking research ___ won her the Nobel Prize.", "options": ["who", "that", "which", "what"], "answer": 1},
            {"q": "___ the data, the scientists began the next phase of the experiment.", "options": ["Finishing", "Having finished", "Finish", "To finish"], "answer": 1},
            {"q": "The solution, ___ several years ago, is still in use today.", "options": ["developing", "developed", "was developed", "being developed"], "answer": 1},
            {"q": "___ the weather being so unpredictable, we decided to postpone the field trip.", "options": ["With", "Because", "Since", "As"], "answer": 0},
            {"q": "Hardly ___ the meeting started when the fire alarm rang.", "options": ["was", "had", "did", "has"], "answer": 1},
            {"q": "What he needs ___ more time to complete the project.", "options": ["is", "are", "be", "was"], "answer": 0},
            {"q": "___ by his success, he decided to start a second company.", "options": ["Encouraged", "Encouraging", "To encourage", "Have encouraged"], "answer": 0},
            {"q": "It is not the money ___ matters, but the experience.", "options": ["what", "that", "which", "who"], "answer": 1},
            {"q": "The work ___, the team went home for the weekend.", "options": ["completed", "completing", "was completed", "to complete"], "answer": 0},
            {"q": "___ I enjoy his writing, I found his latest book a bit slow.", "options": ["Much as", "However", "Despite", "In spite of"], "answer": 0}
        ]
    },
    {
        "id": "g_p3_05",
        "level": "P3",
        "title": "Advanced Verb Patterns & Modality",
        "time": "10 min",
        "difficulty": "hard",
        "explain": "Master complex verb complementation (infinitive vs gerund) and the nuanced use of modal perfects (should have / could have).",
        "questions": [
            {"q": "I really regret ___ so much time on social media yesterday.", "options": ["to waste", "wasting", "waste", "have wasted"], "answer": 1},
            {"q": "The company failed ___ its targets for the third quarter.", "options": ["reaching", "to reach", "reach", "in reaching"], "answer": 1},
            {"q": "You should ___ me about the change in plans; I was waiting for hours.", "options": ["tell", "have told", "be telling", "told"], "answer": 1},
            {"q": "He stopped ___ a coffee on his way to work.", "options": ["get", "to get", "getting", "for getting"], "answer": 1},
            {"q": "I can't imagine ___ in such a cold climate.", "options": ["to live", "living", "live", "have lived"], "answer": 1},
            {"q": "The mystery ___ solved if the police had acted faster.", "options": ["might be", "might have been", "could be", "should be"], "answer": 1},
            {"q": "We managed ___ the project despite the tight deadline.", "options": ["finishing", "to finish", "finish", "in finishing"], "answer": 1},
            {"q": "She suggested ___ the meeting until next week.", "options": ["to postpone", "postponing", "postpone", "should postpone"], "answer": 1},
            {"q": "I clearly remember ___ the letter, so I don't know why it didn't arrive.", "options": ["posting", "to post", "post", "have posted"], "answer": 0},
            {"q": "He could ___ the race if he hadn't tripped.", "options": ["win", "have won", "be winning", "won"], "answer": 1}
        ]
    },
    {
        "id": "g_p3_06",
        "level": "P3",
        "title": "Discourse & Cohesion",
        "time": "12 min",
        "difficulty": "medium+",
        "explain": "Learn how to link ideas effectively using reference words, substitution, and ellipsis to create a coherent text.",
        "questions": [
            {"q": "The results were positive. ___ outcome was unexpected.", "options": ["This", "That", "Such", "The"], "answer": 0},
            {"q": "Many students prefer studying in the morning, but some ___ in the evening.", "options": ["do", "do so", "are", "prefer"], "answer": 1},
            {"q": "I think the project will be a success, and we all hope ___.", "options": ["so", "it", "that", "this"], "answer": 0},
            {"q": "He can speak three languages, and ___ his sister.", "options": ["so can", "also", "too", "can"], "answer": 0},
            {"q": "The first theory is more popular. ___, the second one is more accurate.", "options": ["However", "Therefore", "Moreover", "Consequently"], "answer": 0},
            {"q": "Most employees were happy with the new policy, but ___ were not.", "options": ["few", "a few", "any", "some"], "answer": 1},
            {"q": "She didn't want to go, and ___ did I.", "options": ["so", "neither", "either", "not"], "answer": 1},
            {"q": "The experiment failed once, but we won't let it do ___ again.", "options": ["so", "that", "it", "this"], "answer": 0},
            {"q": "Climate change is a global issue. ___, it requires a global solution.", "options": ["As a result", "On the other hand", "In contrast", "Overall"], "answer": 0},
            {"q": "I have two brothers; ___ of them is a doctor.", "options": ["both", "each", "every", "all"], "answer": 1}
        ]
    },
    {
        "id": "g_p3_07",
        "level": "P3",
        "title": "Complex Noun Phrases & Modifiers",
        "time": "10 min",
        "difficulty": "medium+",
        "explain": "Master the order of adjectives and the use of pre/post-modifiers to build sophisticated noun phrases common in academic writing.",
        "questions": [
            {"q": "She bought a ___ vase at the auction.", "options": ["beautiful blue Chinese", "Chinese beautiful blue", "blue beautiful Chinese", "beautiful Chinese blue"], "answer": 0},
            {"q": "The ___ results were published in a major journal.", "options": ["recently published", "published recently", "recent publishing", "recently publishing"], "answer": 0},
            {"q": "He is a ___ student who always gets top marks.", "options": ["hard-working", "working-hard", "hardly-working", "work-hard"], "answer": 0},
            {"q": "The house ___ the corner is the oldest in the city.", "options": ["in", "on", "at", "by"], "answer": 1},
            {"q": "We need a ___ solution to this problem.", "options": ["long-term", "long-time", "lengthy", "longly"], "answer": 0},
            {"q": "She is the only person ___ knows the truth.", "options": ["who", "which", "whose", "whom"], "answer": 0},
            {"q": "We were impressed by the ___ of the presentation.", "options": ["clarity", "clear", "clearly", "clearness"], "answer": 0},
            {"q": "It was a ___ decision that affected everyone.", "options": ["life-changing", "changing-life", "life-changed", "changed-life"], "answer": 0},
            {"q": "The ___ report was 200 pages long.", "options": ["above mentioned", "above-mentioned", "mentioned above", "mentioning above"], "answer": 1},
            {"q": "They found several ___ artifacts during the dig.", "options": ["prehistoric unique metal", "unique prehistoric metal", "metal unique prehistoric", "unique metal prehistoric"], "answer": 1}
        ]
    },
    {
        "id": "g_p3_08",
        "level": "P3",
        "title": "Editing & Multi-Error Practice",
        "time": "15 min",
        "difficulty": "hard",
        "explain": "Practice identifying and correcting multiple error types within a paragraph, including tense, articles, and prepositions.",
        "questions": [
            {"q": "Working late into the night, the results surprised us. (Correction?)", "options": ["Working late, we were surprised by the results.", "Worked late, the results surprised us.", "Working late, the results were surprising.", "To work late, the results surprised us."], "answer": 0},
            {"q": "She works real hard to achieve her goals. (Error?)", "options": ["works", "real", "hard", "achieve"], "answer": 1},
            {"q": "In 1990, researchers study the effects of pollution. (Error?)", "options": ["researchers", "study", "effects", "pollution"], "answer": 1},
            {"q": "The data shows that there is many problems. (Correct?)", "options": ["The data show that there are many problems.", "The data shows that there are many problems.", "The data show that there is many problems.", "The data shows that there is many problem."], "answer": 0},
            {"q": "The research, that was conducted in 2020, was thorough. (Error?)", "options": ["research", "that", "conducted", "was"], "answer": 1},
            {"q": "She provided an useful analysis. (Error?)", "options": ["provided", "an", "useful", "analysis"], "answer": 1},
            {"q": "The experiment was a success. This was surprising. (Improve?)", "options": ["This outcome was surprising.", "Which was surprising.", "It was surprising.", "That was surprising."], "answer": 0},
            {"q": "John told Mark that he had failed. He was angry. (Issue?)", "options": ["Ambiguous pronoun", "Wrong tense", "Subject-verb agreement", "Word order"], "answer": 0},
            {"q": "The committee should looked into this matter. (Correction?)", "options": ["should have looked", "should look", "should looking", "should have look"], "answer": 0},
            {"q": "Not only the participants were confused, but also the researchers. (Correction?)", "options": ["Not only were the participants confused", "Not only participants were confused", "Only not the participants were confused", "Not only had the participants been confused"], "answer": 0}
        ]
    }
]

# Append to grammar_tasks.json
filepath = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/grammar_tasks.json'
with open(filepath, 'r') as f:
    data = json.load(f)

existing_ids = {item['id'] for item in data}
for item in missing_items:
    if item['id'] not in existing_ids:
        data.append(item)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f"Added {len(missing_items)} missing modules to {filepath}.")
