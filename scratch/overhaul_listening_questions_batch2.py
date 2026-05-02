import json

def overhaul_listening_batch_2():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/listening_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    # --- Task 4: Economics of Renewable Subsidies (id: l_acad_p2) ---
    # Finding by title if ID is non-sequential
    task4 = next((t for t in tasks if t.get("title") == "Panel Discussion: The Economics of Renewable Subsidies"), None)
    if task4:
        task4["questions"] = [
            {
                "type": "short_answer",
                "q": "What is the common neoclassical critique of government subsidies for renewable energy?",
                "answer": ["They distort free markets"],
                "skill": "detail",
                "explain": "The moderator mentions that neoclassical models argue subsidies distort free markets."
            },
            {
                "type": "short_answer",
                "q": "What hidden subsidies have fossil fuels historically enjoyed according to Dr. Aris?",
                "answer": ["Unpriced negative externalities", "Carbon emissions, health impacts, and environmental degradation"],
                "skill": "detail",
                "explain": "Dr. Aris argues fossil fuels enjoy subsidies through unpriced negative externalities."
            },
            {
                "type": "short_answer",
                "q": "What happens to the cost of pollution from a coal plant in the current market failure?",
                "answer": ["Society pays the price, not the company"],
                "skill": "inference",
                "explain": "Dr. Aris points out that society bears the cost of the negative externality."
            },
            {
                "type": "short_answer",
                "q": "What is Dr. Chen's primary concern regarding aggressive feed-in tariffs in Europe?",
                "answer": ["They guarantee profits regardless of technological innovation"],
                "skill": "detail",
                "explain": "Dr. Chen notes that open-ended subsidies create a lack of incentive for innovation."
            },
            {
                "type": "short_answer",
                "q": "Define the 'moral hazard' mentioned by Dr. Chen in the energy sector.",
                "answer": ["Companies become reliant on subsidies rather than striving to lower costs"],
                "skill": "vocabulary_context",
                "explain": "The moral hazard is the lack of incentive to improve efficiency due to guaranteed profits."
            },
            {
                "type": "short_answer",
                "q": "What does LCOE stand for in energy economics?",
                "answer": ["Levelized Cost of Energy"],
                "skill": "detail",
                "explain": "Dr. Chen mentions LCOE as the target for cost reduction through R&D."
            },
            {
                "type": "short_answer",
                "q": "What action usually forces companies to compete and drop their cost curves?",
                "answer": ["Tapering subsidies", "Tapering of subsidies"],
                "skill": "inference",
                "explain": "Dr. Chen states that costs drop when subsidies are tapered, forcing competition."
            },
            {
                "type": "cloze",
                "q": "The group in the pilot study that received recap segments scored ______ higher on delayed recall.",
                "options": ["5%", "10%", "15%", "25%"],
                "answer": 2,
                "skill": "detail",
                "explain": "The pilot showed a 15% improvement."
            },
            {
                "type": "short_answer",
                "q": "According to the pilot, what was the 'key factor' behind the higher recall scores?",
                "answer": ["Timing", "Timing of the recap"],
                "skill": "detail",
                "explain": "The speaker clarifies that timing, not length, was the key factor."
            }
        ]

    # --- Task 5: Campus Policy Brief: Attendance and Learning (id: l_p3_h01) ---
    task5 = next((t for t in tasks if t.get("title") == "Campus Policy Brief: Attendance and Learning"), None)
    if task5:
        task5["questions"] = [
            {
                "type": "short_answer",
                "q": "How is the relationship between attendance and performance described by the committee?",
                "answer": ["It correlates but is not perfectly linear"],
                "skill": "detail",
                "explain": "The speaker says the relationship is not perfectly linear."
            },
            {
                "type": "short_answer",
                "q": "At what attendance percentage do the academic gains typically level off?",
                "answer": ["Past eighty percent", "80%"],
                "skill": "detail",
                "explain": "Gains tend to level off past the eighty percent threshold."
            },
            {
                "type": "short_answer",
                "q": "What is the first recommended change regarding the course syllabus?",
                "answer": ["Publish attendance expectations clearly in the syllabus"],
                "skill": "detail",
                "explain": "The first recommendation is for clear syllabus expectations."
            },
            {
                "type": "short_answer",
                "q": "What is the purpose of the proposed weekly 'checkpoints'?",
                "answer": ["To keep students engaged"],
                "skill": "inference",
                "explain": "Checkpoints like quizzes are meant to maintain student engagement."
            },
            {
                "type": "short_answer",
                "q": "Which students are specifically highlighted as needing expanded scheduling support?",
                "answer": ["Those with part-time jobs or caregiving responsibilities"],
                "skill": "detail",
                "explain": "The brief mentions students with jobs or caregiving duties."
            },
            {
                "type": "short_answer",
                "q": "How does the brief propose to address faculty concerns about fairness?",
                "answer": ["Encouraging flexible make-up options and explaining the rationale"],
                "skill": "detail",
                "explain": "The brief suggests flexible options and pedagogical rationale to ensure fairness."
            },
            {
                "type": "short_answer",
                "q": "What is the committee's stance on making attendance mandatory for every class?",
                "answer": ["They are not proposing mandatory attendance for every class"],
                "skill": "inference",
                "explain": "The speaker explicitly states they are not proposing universal mandates."
            },
            {
                "type": "cloze",
                "q": "The committee emphasizes transparency, consistent expectations, and ______ when students disengage.",
                "options": ["financial penalties", "early intervention", "automated warnings", "grade reduction"],
                "answer": 1,
                "skill": "vocabulary",
                "explain": "The transcript mentions 'early intervention'."
            },
            {
                "type": "short_answer",
                "q": "By what percentage did explicit signposting reduce listener confusion in the comparative run?",
                "answer": ["18%", "Eighteen percent"],
                "skill": "detail",
                "explain": "The second observation showed an 18% reduction."
            }
        ]

    # --- Task 6: Memory, Sleep, and Learning (id: l_p4_h02) ---
    task6 = next((t for t in tasks if t.get("title") == "Research Talk: Memory, Sleep, and Learning"), None)
    if task6:
        task6["questions"] = [
            {
                "type": "short_answer",
                "q": "Describe the activity the 'wake group' performed to ensure they did not engage in new learning.",
                "answer": ["Watched calm documentaries"],
                "skill": "detail",
                "explain": "The wake group watched calm documentaries to avoid new learning."
            },
            {
                "type": "short_answer",
                "q": "What was the average difference in recall between the sleep group and the wake group?",
                "answer": ["Twenty percent more pairs", "20%"],
                "skill": "detail",
                "explain": "The sleep group recalled about twenty percent more pairs."
            },
            {
                "type": "short_answer",
                "q": "Which subgroup of participants showed the greatest improvement after sleep?",
                "answer": ["Those with weaker initial performance"],
                "skill": "inference",
                "explain": "Those with weaker initial performance improved the most."
            },
            {
                "type": "short_answer",
                "q": "What does the researcher conclude sleep does for memories?",
                "answer": ["Helps stabilize fragile memories"],
                "skill": "main_idea",
                "explain": "The speaker interprets the results as evidence for stabilizing fragile memories."
            },
            {
                "type": "short_answer",
                "q": "What was the result when sleep occurred three hours after learning instead of immediately?",
                "answer": ["The benefit was weaker"],
                "skill": "detail",
                "explain": "Immediate sleep provided a stronger benefit than delayed sleep."
            },
            {
                "type": "short_answer",
                "q": "Mention one limitation of the study stated by the speaker.",
                "answer": ["Small sample size / Only one type of learning task / Did not measure brain activity"],
                "skill": "detail",
                "explain": "The speaker lists several limitations including sample size and task type."
            },
            {
                "type": "cloze",
                "q": "The lack of direct brain activity measurement means the study cannot make strong claims about ______.",
                "options": ["correlations", "mechanisms", "variability", "significance"],
                "answer": 1,
                "skill": "vocabulary",
                "explain": "The speaker says they cannot claim brain mechanisms directly."
            },
            {
                "type": "short_answer",
                "q": "At what listening pace does accuracy drop sharply according to the final caution?",
                "answer": ["Above 170 words per minute", "170 wpm"],
                "skill": "detail",
                "explain": "Accuracy drops sharply above 170 wpm."
            }
        ]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Successfully overhauled batch 2 (Tasks 4-6).")

if __name__ == "__main__":
    overhaul_listening_batch_2()
