import json
import os

ROOT_DIR = "/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp"
DATA_DIR = os.path.join(ROOT_DIR, "data")

NEW_READING = [
    {
        "id": "READ_BUEPT_21",
        "title": "The Socratic Method and its Modern Pedagogical Utility",
        "level": "C2",
        "time": "20 min",
        "text": "The Socratic Method, characterized by a cooperative argumentative dialogue, remains an exceedingly potent tool for fostering critical inquiry in contemporary education. By utilizing a series of tactical questions, the educator facilitates the student’s discovery of their own cognitive inconsistencies and latent assumptions. Unlike didactic instruction, which prioritizes the passive absorption of information, the Socratic approach necessitates an active engagement with complex philosophical concepts. However, implementing this method in large-scale tertiary environments remains challenging, as it requires a high degree of personalized interaction and intellectual agility from both parties. Nevertheless, its capacity to cultivate independent, dialectical thought remains unparalleled in the landscape of modern pedagogy.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "What is the hallmark of the Socratic Method according to the passage?",
                "options": [
                    "Passive absorption of information from a didactic lecturer.",
                    "Cooperative argumentative dialogue through tactical questioning.",
                    "The elimination of critical inquiry in favor of rote memorization.",
                    "A focus on large-scale environments where interaction is minimized."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "The text states it is 'characterized by a cooperative argumentative dialogue... utilizing a series of tactical questions'."
            }
        ]
    },
    {
        "id": "READ_BUEPT_22",
        "title": "Thermodynamics and the Ontological Finality of Heat Death",
        "level": "C2",
        "time": "25 min",
        "text": "The Second Law of Thermodynamics posits that the entropy of an isolated system constitutes a value that invariably increases over time. This principle leads to the cosmological hypothesis of 'Heat Death'—a state in which the universe has reached maximum entropy and thermodynamic equilibrium. In this exceedingly bleak scenario, all energy gradients have been dissipated, rendering the universe incapable of supporting life or mechanical work. The transition toward this ontological finality remains irreversible, as the statistical probability of a macroscopic system spontaneously reverting to a lower-entropy state is infinitesimally small. Thus, the arrow of time, as elucidated by thermodynamics, points toward a state of cosmic stasis and total energetic exhaustion.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "What is the primary characteristic of 'Heat Death' described in the passage?",
                "options": [
                    "A state of high energy gradients and low entropy.",
                    "Maximum entropy and the absence of energy gradients for life or work.",
                    "A spontaneous reversion to a youthful, low-entropy universe.",
                    "The creation of new stars and galaxies through thermodynamic equilibrium."
                ],
                "answer": 1,
                "skill": "main_idea",
                "explain": "The text describes it as a state of 'maximum entropy and thermodynamic equilibrium' where 'all energy gradients have been dissipated'."
            }
        ]
    },
    {
        "id": "READ_BUEPT_23",
        "title": "Existentialism and the Burden of Radical Freedom",
        "level": "C2",
        "time": "22 min",
        "text": "The existentialist paradigm, as developed by Jean-Paul Sartre and Albert Camus, elucidates the inherent 'absurdity' of a universe devoid of pre-determined meaning. Sartre’s famous declaration that 'existence precedes essence' necessitates that individuals constitute their own identities through radical freedom and personal choice. However, this absolute autonomy facilitates a profound sense of 'existential angst'—the realization that one remains solely responsible for the meaning (or lack thereof) in their life. While some hypothesize that this burden leads to social alienation, others argue that it empowers the subject to transcend inherited societal structures and define their own values. Consequently, the existentialist project remains a testament to the resilience of human agency in the face of ontological nihilism.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "What does Sartre's phrase 'existence precedes essence' imply?",
                "options": [
                    "That humans are born with a fixed purpose and destiny.",
                    "That the physical universe was created before any biological life.",
                    "That individuals must create their own identity and meaning because they are not born with one.",
                    "That society is responsible for determining the value of an individual's life."
                ],
                "answer": 2,
                "skill": "inference",
                "explain": "It means humans exist first and then 'constitute their own identities through radical freedom'."
            }
        ]
    },
    {
        "id": "READ_BUEPT_24",
        "title": "Universal Basic Income: A Macro-Economic Re-Evaluation",
        "level": "C1",
        "time": "21 min",
        "text": "The conceptual framework of Universal Basic Income (UBI)—the periodic, unconditional provision of cash to all citizens—has gained precipitous momentum in response to the looming specter of automation. Proponents hypothesize that UBI facilitates economic security and collective bargaining power while mitigating the deleterious impacts of labor market volatility. However, critics elucidate significant fiscal concerns, arguing that the astronomical expenditure necessitated by such a program would necessitate unsustainable levels of taxation or public debt. Furthermore, the potential for 'labor supply distortion' remains a focal point of debate, with detractors suggesting that unconditional payments might diminish the incentive for vocational exertion. Nonetheless, UBI continues to be viewed by many as a necessary systemic response to the decoupling of labor and productivity in the technological age.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "What is a primary criticism of UBI mentioned in the passage?",
                "options": [
                    "It is too cheap and does not provide enough support to citizens.",
                    "It would lead to unsustainable fiscal costs and potentially reduce work incentives.",
                    "It would force all citizens to work in the automation sector.",
                    "It is only effective in small, agrarian societies with no labor market."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "The text mentions 'significant fiscal concerns' and 'labor supply distortion' as criticisms."
            }
        ]
    },
    {
        "id": "READ_BUEPT_25",
        "title": "Transhumanism: The Convergence of Biotechnology and Human Evolution",
        "level": "C2",
        "time": "24 min",
        "text": "Transhumanism constitutes an intellectual and cultural movement that advocates for the utilization of converging technologies—such as biotechnology, nanotechnology, and AI—to transcend the biological limitations of the human condition. While the prospects of cognitive enhancement and radical life extension elucidate a future of post-human potential, they also catalyze profound socio-ethical anxieties. Critics hypothesize that such advancements risk the emergence of a 'technological aristocracy,' where the benefits of enhancement are restricted to those with capital, thereby exacerbating existing systemic inequities. Furthermore, the ontological implications of merging the organic with the synthetic necessitate a total philosophical re-evaluation of human identity. Hence, the transhumanist trajectory remains a precarious balance between the promise of evolutionary transcendence and the peril of dehumanization.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "What is a major concern regarding the 'technological aristocracy' mentioned in the text?",
                "options": [
                    "That biotechnology will become 100% free for everyone.",
                    "That enhancement technologies will only be available to the wealthy, increasing inequality.",
                    "That synthetic materials will be used to build houses instead of enhancing humans.",
                    "That AI will stop working once it reaches a certain level of intelligence."
                ],
                "answer": 1,
                "skill": "inference",
                "explain": "The text warns of a divide where benefits are 'restricted to those with capital'."
            }
        ]
    }
]

NEW_LISTENING = [
    {
        "id": "LIST_BUEPT_16",
        "title": "The Psychology of Flow: Optimal Experience in Daily Life",
        "level": "C1",
        "time": "19 min",
        "transcript": "Good morning. Today we discuss 'Flow'—a concept elucidated by Mihaly Csikszentmihalyi. Flow constitutes a state of optimal experience where an individual remains completely immersed in an activity, losing all sense of time and self-consciousness. This phenomenon typically occurs when the challenge of the task perfectly aligns with the individual's skill level. If the task is too simple, it necessitates boredom; if it is too difficult, it facilitates anxiety. However, in the 'flow channel,' the individual achieves a state of exceedingly heightened focus and intrinsic gratification. This mental state is not merely limited to artistic or athletic exertion; it remains achievable in scholarly pursuits and professional environments, provided that the feedback loop is clear and the goals remain well-defined. Thus, cultivating flow constitutes a paramount strategy for enhancing both productivity and subjective well-being.",
        "questions": [
            {
                "q": "When does 'flow' typically occur according to the speaker?",
                "options": [
                    "When a task is so simple that it requires no focus.",
                    "When the difficulty of a task perfectly matches a person's skills.",
                    "When an individual is under extreme stress due to a lack of feedback.",
                    "When a task is impossible to complete."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "The speaker says it 'occurs when the challenge of the task perfectly aligns with the individual's skill level'."
            }
        ]
    },
    {
        "id": "LIST_BUEPT_17",
        "title": "Decentralized Finance (DeFi) and the Future of Banking",
        "level": "C2",
        "time": "21 min",
        "transcript": "Welcome. In this lecture, we examine the emergence of Decentralized Finance, or DeFi. DeFi constitutes an ecosystem of financial applications built on blockchain technology that facilitates peer-to-peer transactions without the necessity of traditional intermediaries like banks. By utilizing 'smart contracts'—self-executing agreements with the terms directly codified—DeFi enables individuals to lend, borrow, and trade assets with absolute transparency. While proponents hypothesize that this paradigm facilitates financial inclusion and eliminates the inefficiencies of centralized institutions, critics elucidate significant risks. The absence of regulatory oversight and the potential for systemic technical vulnerabilities necessitate a cautious approach. Nevertheless, the trans-border connectivity and algorithmic objectivity of DeFi continue to catalyze a radical reconstruction of the global financial architecture.",
        "questions": [
            {
                "q": "What is a 'smart contract' in the context of DeFi?",
                "options": [
                    "A physical contract signed by a bank manager.",
                    "A self-executing agreement with terms written directly into code.",
                    "A rule that prevents individuals from trading assets.",
                    "A type of insurance policy for centralized institutions."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "The speaker defines them as 'self-executing agreements with the terms directly codified'."
            }
        ]
    },
    {
        "id": "LIST_BUEPT_18",
        "title": "The Fermi Paradox: Where is Everyone?",
        "level": "C2",
        "time": "22 min",
        "transcript": "Good afternoon. We close today's seminar by addressing the Fermi Paradox—the apparent contradiction between the high probability of extra-terrestrial civilizations and the total lack of contact. Given the billions of stars in our galaxy and the ubiquity of habitable planets, we hypothesize that at least one advanced civilization should have already reached our solar system. So, where is everyone? Possible explanations range from the 'Great Filter' hypothesis—which posits that some exceedingly difficult evolutionary hurdle prevents civilizations from surviving—to the 'Zoo Hypothesis,' which suggests we remain deliberately isolated for observation. Some critics argue that the logic of communication remains exceedingly anthropocentric, as advanced intelligences might utilize technologies that transcend our current capacity to detect. Regardless, the Fermi Paradox necessitates a humbling re-evaluation of our place in the cosmic hierarchy.",
        "questions": [
            {
                "q": "What is the primary contradiction mentioned in the Fermi Paradox?",
                "options": [
                    "The high probability of ET life vs. the complete lack of evidence.",
                    "The fact that the universe is small but we are many.",
                    "The idea that galaxies rotate faster than they should.",
                    "The conflict between baryonic and dark matter."
                ],
                "answer": 0,
                "skill": "main_idea",
                "explain": "The speaker describes it as the 'apparent contradiction between the high probability of extra-terrestrial civilizations and the total lack of contact'."
            }
        ]
    }
]

def expand():
    # Reading
    read_path = os.path.join(DATA_DIR, "reading_tasks.json")
    with open(read_path, "r", encoding="utf-8") as f:
        read_data = json.load(f)
    
    existing_ids = {t["id"] for t in read_data}
    added_read = 0
    for task in NEW_READING:
        if task["id"] not in existing_ids:
            read_data.append(task)
            added_read += 1
            
    with open(read_path, "w", encoding="utf-8") as f:
        json.dump(read_data, f, indent=2, ensure_ascii=False)
    
    # Listening
    list_path = os.path.join(DATA_DIR, "listening_tasks.json")
    with open(list_path, "r", encoding="utf-8") as f:
        list_data = json.load(f)
    
    existing_ids = {t["id"] for t in list_data}
    added_list = 0
    for task in NEW_LISTENING:
        if task["id"] not in existing_ids:
            list_data.append(task)
            added_list += 1
            
    with open(list_path, "w", encoding="utf-8") as f:
        json.dump(list_data, f, indent=2, ensure_ascii=False)
        
    print(f"Added {added_read} Reading tasks and {added_list} Listening tasks.")

if __name__ == "__main__":
    expand()
