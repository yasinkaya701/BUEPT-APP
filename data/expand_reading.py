import json
import os

filepath = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/reading_tasks.json'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_items = [
    {
        "id": "r_p1_03",
        "level": "P1",
        "title": "The Importance of Sleep for Students",
        "time": "20 min",
        "text": "Sleep is very important for university students. During sleep, the brain processes information from the day. It organizes memories and helps you remember what you studied. Without enough sleep, students feel tired and have a hard time paying attention in class. Furthermore, lack of sleep can make people feel stressed or sad.\n\nExperts say that young adults need about 7 to 9 hours of sleep each night. However, many students get only 5 or 6 hours. They stay up late to finish homework or talk with friends. To improve sleep habits, students should try to go to bed at the same time every night. They should also avoid drinking coffee late in the afternoon. Keeping the bedroom dark and quiet can also help the body relax and prepare for a good night of rest.",
        "questions": [
            {
                "q": "What is the main idea of the passage?",
                "options": ["Coffee is bad for students", "Sleep is essential for students' memory and health", "University students sleep 9 hours a day", "Homework causes stress"],
                "answer": 1,
                "skill": "main_idea",
                "explain": "The text focuses on why sleep is important and how students can get better sleep."
            },
            {
                "q": "According to the text, what does the brain do during sleep?",
                "options": ["It forgets old memories", "It processes and organizes information", "It produces coffee", "It stops working"],
                "answer": 1,
                "skill": "detail",
                "explain": "The text states: 'During sleep, the brain processes information from the day. It organizes memories...'"
            },
            {
                "q": "How many hours of sleep do experts recommend for young adults?",
                "options": ["5 or 6 hours", "Less than 7 hours", "7 to 9 hours", "10 to 12 hours"],
                "answer": 2,
                "skill": "detail",
                "explain": "The text says 'Experts say that young adults need about 7 to 9 hours of sleep'."
            },
            {
                "q": "What is one way to improve sleep habits mentioned in the passage?",
                "options": ["Going to bed at the same time every night", "Drinking coffee before bed", "Studying late at night", "Listening to loud music"],
                "answer": 0,
                "skill": "detail",
                "explain": "The text suggests students 'should try to go to bed at the same time every night.'"
            },
            {
                "q": "What can lack of sleep do to a student's mood?",
                "options": ["Make them feel happy", "Make them feel energetic", "Make them feel stressed or sad", "Improve their focus"],
                "answer": 2,
                "skill": "detail",
                "explain": "The text states 'lack of sleep can make people feel stressed or sad.'"
            }
        ]
    },
    {
        "id": "r_p2_03",
        "level": "P2",
        "title": "The Impact of Fast Fashion",
        "time": "24 min",
        "text": "Fast fashion refers to the mass production of cheap, trendy clothing. This industry relies on rapidly turning runway trends into affordable garments for consumers. While fast fashion allows people to buy stylish clothes at low prices, it has significant negative effects on the environment and society.\n\nEnvironmentally, the fast fashion industry is a major polluter. The production of cheap textiles requires massive amounts of water and toxic chemicals, which pollute rivers and oceans. Additionally, because fast fashion items are cheap, they are often discarded quickly, contributing to a massive global waste problem. Millions of tons of clothing end up in landfills every year.\n\nSocially, fast fashion relies on cheap labor, predominantly in developing countries. Garment workers often face poor working conditions, long hours, and low wages. Safety standards in these factories are frequently inadequate. In response to these issues, a growing movement promotes 'sustainable fashion,' encouraging consumers to buy higher-quality garments, repair old clothes, or shop at second-hand stores to reduce their environmental footprint.",
        "questions": [
            {
                "q": "What defines 'fast fashion' according to the passage?",
                "options": ["High-quality, expensive clothing made slowly", "The mass production of cheap, trendy clothing", "Clothing made exclusively in developed countries", "A movement to protect the environment"],
                "answer": 1,
                "skill": "main_idea",
                "explain": "The first sentence defines fast fashion as the mass production of cheap, trendy clothing."
            },
            {
                "q": "How does fast fashion impact water resources?",
                "options": ["It conserves water", "It purifies rivers", "It uses massive amounts of water and pollutes rivers with chemicals", "It has no impact on water"],
                "answer": 2,
                "skill": "detail",
                "explain": "The text notes that textile production 'requires massive amounts of water and toxic chemicals, which pollute rivers...'"
            },
            {
                "q": "Why do millions of tons of clothing end up in landfills?",
                "options": ["Because they are too expensive", "Because they are discarded quickly due to being cheap", "Because sustainable fashion is popular", "Because garment workers throw them away"],
                "answer": 1,
                "skill": "inference",
                "explain": "The text explains that because items are cheap, they are discarded quickly, leading to waste."
            },
            {
                "q": "What are the common working conditions in fast fashion factories?",
                "options": ["High wages and short hours", "Excellent safety standards", "Poor working conditions, long hours, and low wages", "Flexible and comfortable environments"],
                "answer": 2,
                "skill": "detail",
                "explain": "The text explicitly states: 'Garment workers often face poor working conditions, long hours, and low wages.'"
            },
            {
                "q": "What is the goal of the 'sustainable fashion' movement?",
                "options": ["To produce clothes faster", "To encourage buying high-quality, long-lasting clothes", "To decrease the minimum wage of workers", "To promote trendy, cheap garments"],
                "answer": 1,
                "skill": "detail",
                "explain": "The movement encourages buying higher-quality garments, repairing clothes, and second-hand shopping."
            }
        ]
    },
    {
        "id": "r_p3_03",
        "level": "P3",
        "title": "The Psychology of Procrastination",
        "time": "26 min",
        "text": "Almost everyone procrastinates occasionally, but chronic procrastination can severely impact academic and professional success. Procrastination is often misunderstood as simple laziness or a failure of time management. However, psychologists define it primarily as an emotional regulation problem. When individuals encounter a task that provokes anxiety, boredom, or feelings of incompetence, they defer the task to avoid those negative emotions in the short term.\n\nThis avoidance yields immediate relief but inevitably generates long-term stress. The 'procrastination cycle' begins with apprehension regarding a task, leading to delay. As the deadline approaches, anxiety intensifies, reducing the quality of work when the individual finally begins. Consequently, the individual associates the task with stress, reinforcing the desire to avoid similar tasks in the future.\n\nTo combat procrastination, psychologists recommend strategies that address underlying emotions. Breaking a daunting project into manageable micro-tasks can reduce feelings of being overwhelmed. Furthermore, practicing self-compassion rather than harsh self-criticism after procrastinating has been shown to decrease future delays. Recognizing that procrastination is an emotional response rather than an intellectual failure is the first step toward developing healthier productivity habits.",
        "questions": [
            {
                "q": "How do psychologists primarily define procrastination?",
                "options": ["As a strict time management failure", "As an emotional regulation problem", "As simple laziness", "As a lack of intellectual capability"],
                "answer": 1,
                "skill": "detail",
                "explain": "The text states: 'psychologists define it primarily as an emotional regulation problem.'"
            },
            {
                "q": "Why do individuals initially delay a task according to the passage?",
                "options": ["To carefully plan their approach", "Because they have too much time", "To avoid negative emotions associated with the task", "Because they lack the resources necessary"],
                "answer": 2,
                "skill": "detail",
                "explain": "They defer tasks 'to avoid those negative emotions in the short term.'"
            },
            {
                "q": "What happens as the deadline approaches in the 'procrastination cycle'?",
                "options": ["Anxiety decreases", "The work quality improves", "Anxiety intensifies, and work quality may decrease", "The individual feels confident"],
                "answer": 2,
                "skill": "inference",
                "explain": "The text notes that 'anxiety intensifies, reducing the quality of work...'"
            },
            {
                "q": "Which strategy is recommended to reduce the feeling of being overwhelmed?",
                "options": ["Harsh self-criticism", "Ignoring the deadline completely", "Breaking the project into manageable micro-tasks", "Delaying until the last minute"],
                "answer": 2,
                "skill": "detail",
                "explain": "The text mentions 'Breaking a daunting project into manageable micro-tasks' as a strategy."
            },
            {
                "q": "What role does self-compassion play in combating procrastination?",
                "options": ["It encourages laziness", "It decreases the likelihood of future delays", "It has no effect on productivity", "It increases anxiety levels"],
                "answer": 1,
                "skill": "detail",
                "explain": "The passage states that self-compassion 'has been shown to decrease future delays.'"
            }
        ]
    },
    {
        "id": "r_p4_03",
        "level": "P4",
        "title": "The Economic Implications of Automation",
        "time": "30 min",
        "text": "The advent of advanced robotics and artificial intelligence has precipitated a seismic shift in global labor markets, an epoch frequently termed the Fourth Industrial Revolution. While automation historically relegated routine manual tasks to machines, contemporary AI algorithms are increasingly capable of executing complex cognitive functions. Proponents argue that automation catalyzes unprecedented economic productivity, reducing operational costs and lowering commodity prices for consumers. This paradigm, they contend, will engender new economic sectors requiring highly skilled labor to design and maintain these autonomous systems.\n\nConversely, skeptics warn of structural unemployment and the exacerbation of socioeconomic disparities. Unlike preceding industrial shifts, which created as many jobs as they rendered obsolete, the current trajectory may disproportionately displace cognitive labor faster than workforce retraining can occur. This rapid displacement threatens to hollow out middle-class occupations, polarizing the workforce into low-paying service roles and high-paying technological positions. Consequently, the share of wealth accruing to capital owners continues to rise relative to labor, precipitating intense debates surrounding wealth redistribution mechanisms such as Universal Basic Income (UBI).\n\nAddressing this transition requires robust policy interventions. Educational institutions must pivot from rote memorization paradigms to fostering adaptability, critical thinking, and advanced digital literacy. Additionally, robust social safety nets and lifelong learning initiatives are imperative to support displaced workers. Ultimately, navigating the automation epoch demands a delicate equilibrium between harnessing technological innovation and mitigating its disruptive socio-economic externalities.",
        "questions": [
            {
                "q": "What distinguishes the current wave of automation from historical examples?",
                "options": ["It focuses entirely on agricultural labor.", "It creates more jobs than it renders obsolete.", "It replaces routine manual tasks exclusively.", "It is capable of executing complex cognitive functions."],
                "answer": 3,
                "skill": "main_idea",
                "explain": "The text states that 'contemporary AI algorithms are increasingly capable of executing complex cognitive functions.'"
            },
            {
                "q": "What is a primary argument made by proponents of automation?",
                "options": ["It guarantees job security for middle-class workers.", "It catalyzes economic productivity and lowers prices for consumers.", "It eliminates the need for any human labor.", "It immediately solves wealth redistribution problems."],
                "answer": 1,
                "skill": "detail",
                "explain": "Proponents argue it 'catalyzes unprecedented economic productivity, reducing operational costs and lowering commodity prices...'"
            },
            {
                "q": "According to skeptics, how might the workforce become polarized?",
                "options": ["Between agricultural and industrial sectors.", "Between low-paying service roles and high-paying technological positions.", "Between government employees and private sector workers.", "Between domestic and international laborers."],
                "answer": 1,
                "skill": "detail",
                "explain": "The text notes a concern about 'polarizing the workforce into low-paying service roles and high-paying technological positions.'"
            },
            {
                "q": "What is posited as a necessary response from educational institutions?",
                "options": ["Increasing focus on rote memorization.", "Reducing the length of degree programs.", "Fostering adaptability, critical thinking, and digital literacy.", "Eliminating technical vocational training."],
                "answer": 2,
                "skill": "inference",
                "explain": "Educational institutions must pivot to 'fostering adaptability, critical thinking, and advanced digital literacy.'"
            },
            {
                "q": "What is the author's overall stance regarding the automation epoch?",
                "options": ["It should be halted entirely to protect jobs.", "It is an unmitigated disaster for global economies.", "It requires a balance between technological innovation and mitigating socio-economic disruption.", "It is a utopian shift that requires no government intervention."],
                "answer": 2,
                "skill": "tone",
                "explain": "The concluding sentence emphasizes demanding 'a delicate equilibrium between harnessing technological innovation and mitigating its disruptive socio-economic externalities.'"
            }
        ]
    }
]

existing_ids = {item.get('id') for item in data if item.get('id') is not None}
for item in new_items:
    if item.get('id') not in existing_ids:
        data.append(item)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f"Added new reading tasks. Total is now {len(data)}.")
