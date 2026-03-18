import json
import os

filepath = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/speaking_prompts.json'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_items = [
    {
        "id": "sp_p1_05",
        "level": "P1",
        "category": "Travel",
        "title": "A Memorable Journey",
        "prompt": "Describe a memorable journey you have taken. Where did you go and what made it special?",
        "type": "description",
        "time": "1 min",
        "tips": [
            "Use past simple and continuous tenses",
            "Mention transportation and companions",
            "Describe feelings and scenery"
        ],
        "vocab": [
            "destination",
            "scenery",
            "unforgettable",
            "journey",
            "explore"
        ],
        "model_answer": "Last summer, I took a memorable journey to Cappadocia with my family. We traveled by bus, which took about ten hours. The journey was special because it was my first time seeing the famous fairy chimneys and flying in a hot air balloon. The landscape looked like another planet, and watching the sunrise from the sky was truly unforgettable.",
        "follow_up": [
            "Do you prefer traveling alone or with others? Why?",
            "What is your dream destination?"
        ]
    },
    {
        "id": "sp_p1_06",
        "level": "P1",
        "category": "Hobbies",
        "title": "Free Time Activities",
        "prompt": "Talk about a hobby you enjoy doing in your free time. How did you start doing it?",
        "type": "description",
        "time": "1 min",
        "tips": [
            "Explain when and why you started",
            "Use adverbs of frequency (usually, often)",
            "Mention the benefits of this hobby"
        ],
        "vocab": [
            "relaxing",
            "creative",
            "passion",
            "weekend",
            "practice"
        ],
        "model_answer": "In my free time, I really enjoy photography. I started this hobby about two years ago when my father gave me his old camera. I usually go out on weekends to take pictures of nature and old streets in my city. It is a very relaxing activity for me, and it helps me notice the beautiful details in everyday life.",
        "follow_up": [
            "Do you think having a hobby is important? Why?",
            "Is there a new hobby you would like to try in the future?"
        ]
    },
    {
        "id": "sp_p2_05",
        "level": "P2",
        "category": "Health",
        "title": "Healthy Diet vs Fast Food",
        "prompt": "Compare eating a healthy diet at home with eating fast food. What are the pros and cons?",
        "type": "comparison",
        "time": "90 sec",
        "tips": [
            "Use comparative language like 'while', 'whereas', 'on the other hand'",
            "Include considerations of time, cost, and health",
            "Provide a balanced conclusion"
        ],
        "vocab": [
            "nutritious",
            "convenient",
            "home-cooked",
            "lifestyle",
            "obesity"
        ],
        "model_answer": "Eating a healthy, home-cooked diet provides essential nutrients and is generally better for long-term health, whereas fast food is often high in calories and unhealthy fats. On the other hand, fast food is incredibly convenient and saves time for busy people. While cooking at home requires more effort and planning, it is usually cheaper and reduces the risk of obesity. Overall, while fast food is acceptable occasionally, a home-cooked diet is far superior for maintaining a healthy lifestyle.",
        "follow_up": [
            "Why is fast food so popular despite the health risks?",
            "What can schools do to encourage healthy eating?"
        ]
    },
    {
        "id": "sp_p2_06",
        "level": "P2",
        "category": "Work",
        "title": "Remote Work",
        "prompt": "Discuss the advantages and disadvantages of working from home. Would you prefer it?",
        "type": "discussion",
        "time": "90 sec",
        "tips": [
            "List both pros and cons before giving your preference",
            "Mention productivity and social aspects",
            "Use phrases like 'The main benefit is...', 'However, a drawback is...'"
        ],
        "vocab": [
            "commute",
            "isolation",
            "flexibility",
            "distraction",
            "work-life balance"
        ],
        "model_answer": "Working from home has become very common. The main benefit is the flexibility it offers, allowing people to save time and money by avoiding a daily commute. This can improve work-life balance significantly. However, a major drawback is social isolation and the lack of face-to-face communication with colleagues. Also, there can be many distractions at home. Personally, I would prefer a hybrid model where I can work from home a few days a week and go to the office on other days to stay connected.",
        "follow_up": [
            "Do you think remote work is suitable for all professions?",
            "How does remote work affect team spirit?"
        ]
    },
    {
        "id": "sp_p3_05",
        "level": "P3",
        "category": "Technology",
        "title": "Data Privacy",
        "prompt": "To what extent should individuals be concerned about their data privacy online? Give examples to support your view.",
        "type": "argument",
        "time": "2 min",
        "tips": [
            "State your position clearly using hedging language",
            "Give examples of data collection (social media, targeted ads)",
            "Suggest how people or governments should respond"
        ],
        "vocab": [
            "surveillance",
            "algorithm",
            "consent",
            "breach",
            "vulnerable"
        ],
        "model_answer": "Individuals should be highly concerned about their online data privacy, though a degree of data sharing is inevitable in modern digital life. Tech companies constantly collect personal data through social media and search engines to feed algorithms and serve targeted advertisements. While this can provide personalized experiences, it makes users vulnerable to data breaches and identity theft. Furthermore, the lack of transparent consent means many users are unaware of how much they are monitored. Therefore, while we cannot completely avoid data collection, we must advocate for stricter government regulations and practice better personal digital hygiene.",
        "follow_up": [
            "Should governments have the right to access citizens' online data for security reasons?",
            "How can individuals protect their online privacy?"
        ]
    },
    {
        "id": "sp_p3_06",
        "level": "P3",
        "category": "Environment",
        "title": "Urbanization",
        "prompt": "Urbanization is increasing globally. What are the main causes and consequences of this rapid growth of cities?",
        "type": "cause-effect",
        "time": "2 min",
        "tips": [
            "Identify push and pull factors for the causes",
            "Discuss both positive and negative consequences",
            "Use cause-effect transitions smoothly"
        ],
        "vocab": [
            "migration",
            "infrastructure",
            "overcrowding",
            "economic opportunity",
            "pollution"
        ],
        "model_answer": "The rapid urbanization we are witnessing today is primarily driven by economic factors. People migrate from rural areas to cities seeking better employment opportunities, higher education, and improved healthcare services. As a consequence, cities experience significant economic growth and cultural exchange. However, this massive influx of people leads to severe challenges, including overcrowding, inadequate infrastructure, and increased pollution. As housing becomes unaffordable, inequality often rises. Consequently, governments must invest heavily in sustainable urban planning and public transport to mitigate the negative impacts of this inevitable trend.",
        "follow_up": [
            "How can cities be made more sustainable for the future?",
            "Do you think the trend of urbanization will ever reverse?"
        ]
    },
    {
        "id": "sp_p4_05",
        "level": "P4",
        "category": "Ethics",
        "title": "Animal Testing",
        "prompt": "Critically evaluate the ethical arguments for and against the use of animals in scientific and medical research.",
        "type": "critical",
        "time": "2 min",
        "tips": [
            "Examine utilitarian vs. rights-based ethical frameworks",
            "Consider the distinction between medical and cosmetic testing",
            "Draw a well-reasoned, nuanced conclusion"
        ],
        "vocab": [
            "utilitarian",
            "welfare",
            "alternatives",
            "sentient",
            "justifiable"
        ],
        "model_answer": "The debate over animal testing centers on the tension between scientific advancement and animal welfare. The primary argument in favor is utilitarian: testing on animals has historically been crucial in developing life-saving treatments, vaccines, and surgical techniques for humans. Proponents argue that if significant human suffering can be prevented, the use of animals is scientifically justifiable. Conversely, animal rights advocates argue from a moral standpoint that sentient beings should not be subjected to pain and exploitation without consent. The ethical unacceptability is particularly clear in cosmetic testing. Ultimately, while animal testing may currently be an unfortunate necessity in vital medical research, extreme efforts must be made to enforce the substitution of animal models with cruelty-free alternatives like computer simulations and lab-grown tissues.",
        "follow_up": [
            "Is there a moral difference between testing on a mouse versus a primate?",
            "Should governments ban all non-medical animal testing immediately?"
        ]
    },
    {
        "id": "sp_p4_06",
        "level": "P4",
        "category": "Politics",
        "title": "Universal Basic Income",
        "prompt": "To what extent could Universal Basic Income (UBI) solve modern economic inequalities? Discuss critically.",
        "type": "critical",
        "time": "2 min",
        "tips": [
            "Define UBI and its primary goals",
            "Evaluate potential benefits (poverty reduction) and drawbacks (inflation, disincentives)",
            "Conclude with a nuanced assessment of its feasibility"
        ],
        "vocab": [
            "welfare",
            "automation",
            "inflation",
            "safety net",
            "redistribution"
        ],
        "model_answer": "Universal Basic Income, a system where all citizens receive a regular, unconditional sum of money from the state, is increasingly proposed as a radical solution to modern economic inequality, particularly in the face of job displacement by automation. Advocates argue that UBI provides an essential safety net, eradicates absolute poverty, and empowers workers to reject exploitative jobs. However, critically assessing its feasibility reveals significant challenges. Detractors point out the massive fiscal burden it represents, requiring substantial taxation which could stifle economic growth. Furthermore, it might lead to inflation or disincentivize labor participation. While UBI addresses the symptoms of poverty effectively, it is unlikely to solve underlying structural inequalities without concurrent investments in public services like education and healthcare. Therefore, it should be viewed as a complementary tool rather than a comprehensive panacea.",
        "follow_up": [
            "Who should fund a Universal Basic Income program?",
            "How might UBI alter the fundamental relationship between a citizen and the state?"
        ]
    }
]

# prevent duplicates
existing_ids = {item['id'] for item in data}
for item in new_items:
    if item['id'] not in existing_ids:
        data.append(item)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f"Added new speaking prompts. Total is now {len(data)}.")
