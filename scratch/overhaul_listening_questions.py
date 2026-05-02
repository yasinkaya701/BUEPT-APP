import json

def overhaul_listening():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/listening_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    # --- Task 1: Lexical Attrition ---
    tasks[0]["questions"] = [
        {
            "type": "short_answer",
            "q": "What is the specific definition of 'attrition' in the context of this seminar?",
            "answer": ["The non-pathological decline of previously acquired linguistic skills"],
            "skill": "detail",
            "explain": "The lecturer defines it as the non-pathological decline when a speaker relies heavily on L1."
        },
        {
            "type": "short_answer",
            "q": "Which linguistic subsystem is identified as the most vulnerable to disuse?",
            "answer": ["The lexical domain", "Vocabulary"],
            "skill": "detail",
            "explain": "The transcript states the lexical domain is notoriously the most vulnerable."
        },
        {
            "type": "short_answer",
            "q": "What happens to a word's activation threshold when it is frequently retrieved?",
            "answer": ["It is lowered", "It becomes lower"],
            "skill": "detail_inference",
            "explain": "Each time a word is retrieved, its threshold is lowered, making it easier to access."
        },
        {
            "type": "cloze",
            "q": "If a word is not retrieved for a long time, the Activation Threshold Hypothesis suggests its threshold will ______.",
            "options": ["stabilize", "fluctuate", "rise", "erupt"],
            "answer": 2,
            "skill": "inference",
            "explain": "The threshold 'inexorably rises' when not used."
        },
        {
            "type": "short_answer",
            "q": "What evidence do fMRI studies provide regarding 'attrited' vocabulary?",
            "answer": ["They retain latent neural representations", "Neural networks reactivate quickly"],
            "skill": "detail",
            "explain": "Neuro-imaging shows that vocabulary often retains latent representations."
        },
        {
            "type": "short_answer",
            "q": "Where does the primary deficit lie in lexical attrition: storage or retrieval?",
            "answer": ["Retrieval", "Retrieval pathways"],
            "skill": "detail",
            "explain": "The lecturer says the deficit lies essentially within the retrieval pathways."
        },
        {
            "type": "short_answer",
            "q": "What term is used to describe the rapid reactivation of forgotten items upon re-exposure?",
            "answer": ["re-learning savings"],
            "skill": "vocabulary",
            "explain": "This is the specific term mentioned for the process of reactivation."
        },
        {
            "type": "short_answer",
            "q": "According to the pilot study, what percentage increase was observed in delayed recall?",
            "answer": ["15%", "Fifteen percent"],
            "skill": "detail",
            "explain": "The pilot showed a 15% higher score on delayed recall."
        },
        {
            "type": "short_answer",
            "q": "What was the critical factor in the success of the recap segments?",
            "answer": ["Timing", "Its timing"],
            "skill": "detail",
            "explain": "The key factor was the timing, not the length of the recap."
        },
        {
            "type": "short_answer",
            "q": "When exactly should the recap segments be delivered for maximum effect?",
            "answer": ["Immediately after a complex section"],
            "skill": "detail",
            "explain": "The pilot found timing immediately after a complex section was key."
        }
    ]

    # --- Task 2: Sustainable Urbanism ---
    tasks[1]["questions"] = [
        {
            "type": "short_answer",
            "q": "What is the defining characteristic of the Urban Heat Island (UHI) effect?",
            "answer": ["Urban sectors have significantly higher temperatures than rural areas"],
            "skill": "detail",
            "explain": "UHI is characterized by urban sectors experiencing significantly higher temperatures than rural peripheries."
        },
        {
            "type": "short_answer",
            "q": "Name the two primary anthropogenic drivers of the UHI effect.",
            "answer": ["Low-albedo construction materials and decline of urban vegetative cover"],
            "skill": "detail",
            "explain": "Asphalt/concrete (low-albedo) and lack of trees are the two drivers."
        },
        {
            "type": "short_answer",
            "q": "Why do asphalt and concrete inhibit diurnal cooling?",
            "answer": ["They absorb short-wave radiation and re-emit it as long-wave thermal radiation at night"],
            "skill": "mechanism",
            "explain": "The transcript explains the absorption and re-emission process."
        },
        {
            "type": "cloze",
            "q": "Standard construction materials like asphalt possess exceptionally high ______.",
            "options": ["thermal admittance", "solar albedo", "hydraulic capacity", "metabolic rate"],
            "answer": 0,
            "skill": "vocabulary",
            "explain": "The lecturer uses the term 'thermal admittance'."
        },
        {
            "type": "short_answer",
            "q": "What two benefits of trees are lost when they are eradicated from cities?",
            "answer": ["Evaporative cooling and shading"],
            "skill": "detail",
            "explain": "Trees provide evaporative cooling and shading."
        },
        {
            "type": "short_answer",
            "q": "What health problem is exacerbated by the UHI paradigm during heatwaves?",
            "answer": ["Respiratory pathologies", "Breathing problems"],
            "skill": "detail",
            "explain": "UHI exacerbates respiratory pathologies during heatwaves."
        },
        {
            "type": "short_answer",
            "q": "How do 'cool roofs' work to mitigate heat?",
            "answer": ["Utilizing high-albedo coatings to reflect insolation"],
            "skill": "detail",
            "explain": "Cool roofs reflect insolation back into the atmosphere."
        },
        {
            "type": "short_answer",
            "q": "What specific example of green infrastructure is mentioned besides canopy restoration?",
            "answer": ["Bioswales"],
            "skill": "detail",
            "explain": "Bioswales are mentioned as part of green infrastructure."
        },
        {
            "type": "short_answer",
            "q": "By what percentage did explicit signposting reduce listener confusion in the comparative run?",
            "answer": ["18%", "Eighteen percent"],
            "skill": "detail",
            "explain": "The second observation showed an 18% reduction."
        },
        {
            "type": "short_answer",
            "q": "What is the lecturer's conclusion about the role of organization in speech?",
            "answer": ["It is not cosmetic; it directly shapes comprehension"],
            "skill": "main_idea",
            "explain": "The last sentence states that organization shapes comprehension."
        }
    ]

    # --- Task 3: Cognitive Load Theory ---
    tasks[2]["questions"] = [
        {
            "type": "short_answer",
            "q": "Who is credited with developing Cognitive Load Theory in the late 1980s?",
            "answer": ["John Sweller"],
            "skill": "detail",
            "explain": "The transcript mentions John Sweller as the developer."
        },
        {
            "type": "short_answer",
            "q": "What is the typical capacity of working memory for novel information?",
            "answer": ["Four to seven chunks", "4-7 chunks"],
            "skill": "detail",
            "explain": "Working memory holds about four to seven 'chunks'."
        },
        {
            "type": "short_answer",
            "q": "Which type of cognitive load refers to the inherent difficulty of the material?",
            "answer": ["Intrinsic cognitive load"],
            "skill": "detail",
            "explain": "Intrinsic load is the inherent difficulty of the material itself."
        },
        {
            "type": "short_answer",
            "q": "What determines the level of intrinsic cognitive load?",
            "answer": ["Element interactivity"],
            "skill": "detail",
            "explain": "It depends on how many concepts must be processed simultaneously (element interactivity)."
        },
        {
            "type": "short_answer",
            "q": "Define 'extraneous cognitive load' in your own words.",
            "answer": ["Mental effort required to process poorly designed instruction"],
            "skill": "detail",
            "explain": "It refers to effort spent on poorly designed teaching materials."
        },
        {
            "type": "short_answer",
            "q": "What is the 'split-attention effect'?",
            "answer": ["Having to hold an image in memory while reading text on a different page/slide"],
            "skill": "inference",
            "explain": "The example of a diagram and text on separate slides illustrates this."
        },
        {
            "type": "short_answer",
            "q": "What is the 'good' type of mental effort that leads to learning?",
            "answer": ["Germane cognitive load"],
            "skill": "detail",
            "explain": "Germane load leads to actual learning through schema construction."
        },
        {
            "type": "cloze",
            "q": "By reducing extraneous load, educators allow learners to redirect their working memory toward ______ load.",
            "options": ["intrinsic", "germane", "biological", "bottleneck"],
            "answer": 1,
            "skill": "inference",
            "explain": "Capacity is freed up for germane load."
        },
        {
            "type": "short_answer",
            "q": "At what listening pace does accuracy begin to drop sharply?",
            "answer": ["Above 170 words per minute", "170 wpm"],
            "skill": "detail",
            "explain": "Accuracy drops sharply when the pace exceeds 170 wpm."
        },
        {
            "type": "short_answer",
            "q": "What is the speaker's advice regarding the pace of delivery?",
            "answer": ["Pace control is a practical constraint, not just a stylistic choice"],
            "skill": "summary",
            "explain": "The last sentence emphasizes pace control for comprehension."
        }
    ]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Successfully overhauled questions for the first 3 tasks.")

if __name__ == "__main__":
    overhaul_listening()
