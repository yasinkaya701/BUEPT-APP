import json
import os

filepath = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/grammar_tasks.json'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_items = [
    {
        "id": "g_p1_03",
        "level": "P1",
        "title": "Present Simple vs Present Continuous",
        "time": "7 min",
        "explain": "Use the Present Simple for routines, habits, and general facts (e.g., Water boils at 100 degrees. I study every day). Use the Present Continuous (am/is/are + verb-ing) for actions happening right now, or temporary situations (e.g., I am studying for an exam right now). Important note: State verbs (e.g., know, like, want, believe, understand) are generally not used in the continuous form. Common error: Using present continuous for routines (e.g., 'I am waking up early every day' should be 'I wake up early every day').\n\nKey rules:\n- Habits/Facts → Present Simple (always, usually, often)\n- Happening now/Temporary → Present Continuous (right now, currently, at the moment)\n- State verbs → Present Simple",
        "questions": [
            {
                "q": "I ___ (study) English every morning.",
                "options": ["study", "am studying", "studies", "studying"],
                "answer": 0
            },
            {
                "q": "Look! The bus ___ (come).",
                "options": ["comes", "is coming", "coming", "come"],
                "answer": 1
            },
            {
                "q": "She ___ (not / like) eating meat.",
                "options": ["isn't liking", "doesn't likes", "doesn't like", "don't like"],
                "answer": 2
            },
            {
                "q": "What ___ you ___ (do) right now?",
                "options": ["do / do", "are / doing", "are / do", "do / doing"],
                "answer": 1
            },
            {
                "q": "Water ___ (freeze) at 0 degrees Celsius.",
                "options": ["freezes", "is freezing", "freeze", "has frozen"],
                "answer": 0
            },
            {
                "q": "I ___ (understand) the lesson completely now.",
                "options": ["am understanding", "understands", "understand", "have understood"],
                "answer": 2
            },
            {
                "q": "They ___ (live) in a hotel until they find a house.",
                "options": ["lives", "live", "are living", "lived"],
                "answer": 2
            },
            {
                "q": "How often ___ he ___ (visit) his grandparents?",
                "options": ["does / visit", "is / visiting", "do / visit", "does / visits"],
                "answer": 0
            },
            {
                "q": "Be quiet! The baby ___ (sleep).",
                "options": ["sleeps", "is sleeping", "sleep", "has slept"],
                "answer": 1
            },
            {
                "q": "We ___ (need) more information before we make a decision.",
                "options": ["are needing", "needs", "need", "have needed"],
                "answer": 2
            }
        ],
        "difficulty": "easy"
    },
    {
        "id": "g_p2_03",
        "level": "P2",
        "title": "Passive Voice",
        "time": "8 min",
        "explain": "The passive voice is used when the focus is on the action or the object experiencing the action, rather than who or what is performing it. It is very common in academic writing to maintain an objective tone. Structure: subject + form of 'be' + past participle. Example: 'The researcher conducted the experiment' (Active) → 'The experiment was conducted by the researcher' (Passive). If the agent (doer) is unimportant or unknown, omit 'by...'.\n\nKey rules:\n- Present Simple Passive: am/is/are + V3\n- Past Simple Passive: was/were + V3\n- Present Perfect Passive: has/have been + V3\n- Modals: modal + be + V3 (can be done, must be finished)",
        "questions": [
            {
                "q": "The novel ___ (write) by a famous author in 1920.",
                "options": ["was writing", "wrote", "was written", "writes"],
                "answer": 2
            },
            {
                "q": "Millions of emails ___ (send) every single day.",
                "options": ["are sent", "are sending", "send", "were sent"],
                "answer": 0
            },
            {
                "q": "The results of the survey ___ (publish) next month.",
                "options": ["will publish", "published", "are published", "will be published"],
                "answer": 3
            },
            {
                "q": "This problem must ___ (solve) immediately.",
                "options": ["solve", "be solved", "is solved", "have solved"],
                "answer": 1
            },
            {
                "q": "A new hospital ___ (build) in our city recently.",
                "options": ["has been built", "has built", "was building", "is built"],
                "answer": 0
            },
            {
                "q": "Coffee ___ (grow) in Brazil and Colombia.",
                "options": ["grows", "is growing", "is grown", "has grown"],
                "answer": 2
            },
            {
                "q": "My car ___ (repair) at the moment.",
                "options": ["is repaired", "is being repaired", "repairs", "has been repaired"],
                "answer": 1
            },
            {
                "q": "The thief ___ (catch) by the police yesterday.",
                "options": ["caught", "was caught", "has been caught", "is caught"],
                "answer": 1
            },
            {
                "q": "The data ___ (analyze) carefully before the conclusion was drawn.",
                "options": ["had analyzed", "had been analyzed", "was analyzing", "has been analyzed"],
                "answer": 1
            },
            {
                "q": "Students ___ (expect) to submit their assignments on Friday.",
                "options": ["expect", "are expected", "expected", "are expecting"],
                "answer": 1
            }
        ],
        "difficulty": "medium"
    },
    {
        "id": "g_p3_03",
        "level": "P3",
        "title": "Reported Speech",
        "time": "10 min",
        "explain": "Reported speech is used to communicate what someone else said without using their exact words. When the reporting verb is in the past (e.g., 'He said', 'She told me'), the verbs in the reported sentence shift back one tense. Pronouns and time/place expressions also change. Example: 'I am reading now' → He said that he was reading then. Present Simple → Past Simple, Present Continuous → Past Continuous, Past Simple → Past Perfect, Present Perfect → Past Perfect, will → would, can → could. Note: General truths or scientific facts do not necessarily shift tense.",
        "questions": [
            {
                "q": "John said, 'I work in a bank.' -> John said that he ___ in a bank.",
                "options": ["works", "worked", "is working", "had worked"],
                "answer": 1
            },
            {
                "q": "Mary said, 'I am studying for my exams.' -> Mary said that she ___ for her exams.",
                "options": ["is studying", "studied", "was studying", "had been studying"],
                "answer": 2
            },
            {
                "q": "The teacher told us, 'Water boils at 100 degrees.' -> The teacher told us that water ___ at 100 degrees.",
                "options": ["boiled", "boils", "had boiled", "would boil"],
                "answer": 1
            },
            {
                "q": "He said, 'I have finished my homework.' -> He said that he ___ his homework.",
                "options": ["has finished", "finished", "had finished", "would finish"],
                "answer": 2
            },
            {
                "q": "She asked me, 'Where do you live?' -> She asked me where ___.",
                "options": ["did I live", "I lived", "do I live", "I live"],
                "answer": 1
            },
            {
                "q": "They said, 'We will arrive tomorrow.' -> They said that they ___ the next day.",
                "options": ["will arrive", "arrived", "would arrive", "had arrived"],
                "answer": 2
            },
            {
                "q": "He asked her, 'Can you help me?' -> He asked her if she ___ help him.",
                "options": ["can", "could", "will", "would"],
                "answer": 1
            },
            {
                "q": "She said, 'I saw that movie last week.' -> She said that she ___ that movie the previous week.",
                "options": ["saw", "has seen", "had seen", "was seeing"],
                "answer": 2
            },
            {
                "q": "The scientist explained that the earth ___ around the sun.",
                "options": ["revolves", "revolved", "had revolved", "would revolve"],
                "answer": 0
            },
            {
                "q": "I told him, 'Don't be late!' -> I told him ___ late.",
                "options": ["don't be", "not to be", "to not be", "didn't be"],
                "answer": 1
            }
        ],
        "difficulty": "medium+"
    },
    {
        "id": "g_p4_03",
        "level": "P4",
        "title": "Modal Verbs of Deduction & Speculation",
        "time": "10 min",
        "explain": "Modals of deduction express how certain we are about something. For the present/future: use 'must' for strong certainty (he must be tired), 'can\\'t' for impossibility (it can\\'t be true), and 'might/may/could' for possibility (it might rain). For the PAST, use modal + have + V3. Example: 'He must have left early' (I am certain he left early). 'She can\\'t have forgotten' (It is impossible she forgot). 'They might have missed the bus' (It is possible). Common academic error: confusing 'could have' (possibility) with 'should have' (advice/regret).",
        "questions": [
            {
                "q": "The ground is very wet. It ___ heavily last night.",
                "options": ["must rain", "must have rained", "should have rained", "can't have rained"],
                "answer": 1
            },
            {
                "q": "She passed the exam without studying at all. The exam ___ very difficult.",
                "options": ["must have been", "could have been", "can't have been", "should have been"],
                "answer": 2
            },
            {
                "q": "I can't find my keys. I ___ them in the car.",
                "options": ["must leave", "might have left", "should leave", "can't leave"],
                "answer": 1
            },
            {
                "q": "You ___ tired after working a 12-hour shift! Sit down.",
                "options": ["can't be", "might be", "must be", "should be"],
                "answer": 2
            },
            {
                "q": "He ___ the meeting because he was in the hospital.",
                "options": ["must have attended", "couldn't have attended", "should have attended", "might attend"],
                "answer": 1
            },
            {
                "q": "The researchers are not sure, but the anomaly ___ caused by a sensor glitch.",
                "options": ["must be", "can't be", "may have been", "should have been"],
                "answer": 2
            },
            {
                "q": "If you wanted to pass the course, you ___ harder during the semester.",
                "options": ["must have studied", "could have studied", "should have studied", "may have studied"],
                "answer": 2
            },
            {
                "q": "The artifact is over 2,000 years old. It ___ to a wealthy individual.",
                "options": ["must have belonged", "ought to belong", "can't belong", "should have belonged"],
                "answer": 0
            },
            {
                "q": "It ___ that cold in London yesterday; my brother was wearing a t-shirt in his photo.",
                "options": ["must have been", "can't have been", "should have been", "might have been"],
                "answer": 1
            },
            {
                "q": "I'm not sure where Sarah is. She ___ to the library.",
                "options": ["must go", "should have gone", "can't have gone", "could have gone"],
                "answer": 3
            }
        ],
        "difficulty": "hard"
    }
]

existing_ids = {item.get('id') for item in data if item.get('id') is not None}
for item in new_items:
    if item.get('id') not in existing_ids:
        data.append(item)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f"Added new grammar tasks. Total is now {len(data)}.")
