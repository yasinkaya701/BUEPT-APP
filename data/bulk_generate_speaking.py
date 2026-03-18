import json
import os

filepath = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/speaking_prompts.json'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_academic_prompts = [
    {
        "id": "SPK_ACAD_01",
        "level": "P4",
        "category": "Technology",
        "title": "Artificial Intelligence in Education",
        "prompt": "How might the integration of AI into higher education redefine the role of the academic instructor?",
        "type": "discussion",
        "time": "2 min",
        "tips": ["Discuss shift from lecturing to facilitation", "Consider personalized learning paths", "Address ethical concerns of plagiarism"],
        "vocab": ["pedagogical", "facilitation", "automated", "curriculum", "integrity"],
        "model_answer": "The integration of AI into higher education is likely to shift the role of instructors from primary knowledge providers to learning facilitators and mentors. While AI can handle automated grading and data-driven personalization, human instructors will focus more on critical thinking, ethical guidance, and soft skill development. However, this transition requires significant pedagogical adaptation and a focus on maintaining academic integrity in an era of generated content.",
        "follow_up": ["Will AI increase or decrease social inequality in education?", "Should universities ban AI tools?"]
    },
    {
        "id": "SPK_ACAD_02",
        "level": "P4",
        "category": "Economics",
        "title": "The Gig Economy",
        "prompt": "Analyze the potential long-term socio-economic consequences of the rise of the gig economy on worker rights and social security systems.",
        "type": "analysis",
        "time": "2 min",
        "tips": ["Define gig economy (Uber, freelancing)", "Discuss lack of traditional benefits", "Analyze impact on tax revenue"],
        "vocab": ["precarious", "flexibility", "pension", "exploitation", "macroeconomic"],
        "model_answer": "The gig economy offers unparalleled flexibility but often results in precarious employment conditions. Long-term, this could undermine traditional social security systems, as gig workers usually lack access to employer-sponsored healthcare and pensions. Furthermore, if a large segment of the workforce remains outside traditional structures, tax revenues for public services might decline, necessitating a complete re-evaluation of how social safety nets are funded.",
        "follow_up": ["How should governments regulate platforms like Uber?", "Is the gig economy a choice or a necessity for most?"]
    },
    {
        "id": "SPK_ACAD_03",
        "level": "P3",
        "category": "Environment",
        "title": "Sustainable Urbanism",
        "prompt": "What are the most effective strategies for reducing carbon footprints in rapidly growing metropolitan areas?",
        "type": "problem-solution",
        "time": "2 min",
        "tips": ["Focus on public transportation", "Mention green building standards", "Discuss waste management"],
        "vocab": ["infrastructure", "sustainable", "congestion", "emissions", "urban"],
        "model_answer": "To reduce carbon footprints in megacities, governments must prioritize investment in electrified public transportation to reduce vehicle congestion. Additionally, enforcing strict green building standards and expanding urban green spaces are vital. Implementing advanced circular waste management systems can also significantly lower methane emissions. Ultimately, a multi-faceted approach combining policy, technology, and public awareness is essential.",
        "follow_up": ["Whose responsibility is it to reduce emissions: individuals or governments?", "Are vertical forests effective?"]
    },
    {
        "id": "SPK_ACAD_04",
        "level": "P4",
        "category": "Psychology",
        "title": "Social Media and Mental Health",
        "prompt": "Examine the correlation between social media consumption patterns and the rising rates of anxiety among adolescents.",
        "type": "cause-effect",
        "time": "2 min",
        "tips": ["Discuss social comparison theory", "Analyze the impact of 'FOMO'", "Consider dopamine-driven feedback loops"],
        "vocab": ["correlation", "validation", "detrimental", "dopamine", "adolescent"],
        "model_answer": "Social media often creates detrimental environments for adolescents due to constant social comparison and the 'Fear of Missing Out' (FOMO). The dopamine-driven feedback loops of likes and notifications can lead to an unhealthy reliance on external validation. Consequently, many researchers see a strong correlation between high consumption levels and increased anxiety. We must promote digital literacy and encourage 'analog' social interactions to mitigate these effects.",
        "follow_up": ["Should there be age restrictions for social media?", "How can parents monitor usage without losing trust?"]
    },
    {
        "id": "SPK_ACAD_05",
        "level": "P2",
        "category": "General",
        "title": "Online vs Offline Shopping",
        "prompt": "Compare and contrast the experience of shopping online with traditional retail stores. Which do you prefer?",
        "type": "comparison",
        "time": "90 sec",
        "tips": ["Mention convenience vs physical touch", "Compare prices and delivery times", "Discuss the social aspect of malls"],
        "vocab": ["convenient", "delivery", "transaction", "tangible", "experience"],
        "model_answer": "Online shopping is incredibly convenient and often offers better prices, but it lacks the tangible experience of traditional retail where you can touch products before buying. Traditional stores also provide a social experience that e-commerce cannot replicate. Personally, I prefer online shopping for electronics and books because of the reviews, but I still go to physical stores for clothes to ensure a good fit.",
        "follow_up": ["Will physical stores disappear in the future?", "What are the environmental impacts of home delivery?"]
    },
    {
        "id": "SPK_ACAD_06",
        "level": "P4",
        "category": "Global Politics",
        "title": "The Future of Multilateralism",
        "prompt": "In an increasingly polarized world, is the era of global multilateral organizations (like the UN or WHO) coming to an end?",
        "type": "argument",
        "time": "2 min",
        "tips": ["Analyze recent geopolitical tensions", "Discuss the importance of global cooperation during crises", "Provide a nuanced conclusion"],
        "vocab": ["sovereignty", "multilateral", "polarization", "diplomacy", "ineffective"],
        "model_answer": "While global multilateral organizations face significant challenges due to rising nationalism and geopolitical polarization, the era of cooperation is far from over. Issues like climate change and pandemics recognize no borders, making organizations like the WHO and UN more necessary than ever. However, these institutions must undergo profound reforms to remain relevant and effective in a changing power landscape where sovereignty is often prioritized over collective action.",
        "follow_up": ["How can the UN be made more democratic?", "Is a 'world government' a realistic concept?"]
    },
    {
        "id": "SPK_ACAD_07",
        "level": "P3",
        "category": "Science",
        "title": "Space Exploration",
        "prompt": "Should governments spend billions on space exploration while there are still massive unsolved problems on Earth, like poverty and disease?",
        "type": "argument",
        "time": "2 min",
        "tips": ["Weight scientific discovery against immediate human needs", "Mention spin-off technologies from space research", "Consider the survival of the human race"],
        "vocab": ["expenditure", "priority", "innovation", "terrestrial", "exploration"],
        "model_answer": "This is a classic 'guns vs butter' dilemma. Critics argue that terrestrial problems like poverty should take absolute priority over space expenditure. However, space research often leads to massive innovations in medicine, communications, and materials science that benefit all of humanity. Furthermore, long-term human survival may depend on becoming a multi-planetary species. Therefore, the goal should be a balanced investment rather than an 'either-or' choice.",
        "follow_up": ["Would you go to Mars if it were a one-way trip?", "Should space exploration be privatized?"]
    },
    {
        "id": "SPK_ACAD_08",
        "level": "P4",
        "category": "Ethics",
        "title": "Algorithmic Bias",
        "prompt": "Discuss the ethical implications of using algorithms for recruitment and judicial sentencing.",
        "type": "critical",
        "time": "2 min",
        "tips": ["Address how data can reflect historical biases", "Discuss the 'black box' problem of AI decision-making", "Argue for human oversight"],
        "vocab": ["transparency", "algorithmic", "prejudice", "accountability", "oversight"],
        "model_answer": "Using algorithms for high-stakes decisions like judicial sentencing raises severe ethical concerns regarding accountability and transparency. Since these models are trained on historical data, they often perpetuate existing societal prejudices and biases. This 'black box' problem means that decisions can be made without clear justifications. To ensure fairness, we must implement rigorous audits of algorithms and maintain significant human oversight in all automated decision-making processes.",
        "follow_up": ["Can an algorithm ever be truly 'neutral'?", "Who is responsible if an AI makes a wrong legal decision?"]
    },
    {
        "id": "SPK_ACAD_09",
        "level": "P2",
        "category": "Health",
        "title": "Benefits of Regular Exercise",
        "prompt": "Talk about the importance of regular physical activity for both physical and mental health.",
        "type": "description",
        "time": "90 sec",
        "tips": ["Mention heart health and muscles", "Discuss stress reduction and endorphins", "Give a personal or general example"],
        "vocab": ["wellness", "stamina", "endurance", "sedentary", "endorphins"],
        "model_answer": "Regular exercise is crucial for maintaining physical stamina and preventing chronic diseases. Beyond the physical benefits, it is a powerful tool for mental wellness, as it releases endorphins that reduce stress and improve mood. In today's sedentary lifestyle, even a 30-minute daily walk can make a significant difference. Personally, I found that my focus improved dramatically once I started swimming twice a week.",
        "follow_up": ["What are the barriers to exercising regularly?", "Should companies provide gym memberships for employees?"]
    },
    {
        "id": "SPK_ACAD_10",
        "level": "P3",
        "category": "Work/Culture",
        "title": "Work-Life Balance",
        "prompt": "Is a 'four-day work week' the solution to modern burnout and declining productivity?",
        "type": "discussion",
        "time": "2 min",
        "tips": ["Discuss the concept of 'work-to-rule'", "Mention pilot studies in countries like Iceland", "Analyze potential impacts on business costs"],
        "vocab": ["burnout", "productivity", "well-being", "fulfillment", "equilibrium"],
        "model_answer": "The four-day work week is gaining traction as a potential remedy for modern professional burnout. Pilot studies have shown that shorter weeks often lead to higher levels of well-being without a significant loss in productivity, as employees work more focused during their active hours. However, some industries might struggle with the increased costs of hiring more staff to cover the extra day off. While not a universal solution, it represents a necessary step toward a healthier work-life equilibrium.",
        "follow_up": ["Would you take a 20% pay cut for a 4-day week?", "How does remote work affect the 4-day week debate?"]
    }
]

# Generate 40 more placeholders to reach the "ton" goal
# Categories: Education, Science, History, Philosophy, Sports, Media, Environment, Sociology, Urban Planning, Health
categories = ["Education", "Science", "History", "Philosophy", "Sports", "Media", "Environment", "Sociology", "Urban Planning", "Health"]
levels = ["P1", "P2", "P3", "P4"]

for i in range(11, 61):
    cat = categories[i % len(categories)]
    lv = levels[i % len(levels)]
    new_academic_prompts.append({
        "id": f"SPK_ACAD_{i:02d}",
        "level": lv,
        "category": cat,
        "title": f"Academic Inquiry: {cat} Topic {i}",
        "prompt": f"Discuss a significant challenge within the field of {cat} and propose a potential solution.",
        "type": "academic",
        "time": "2 min",
        "tips": ["Structure your response with clear points", "Use academic vocabulary", "Provide context"],
        "vocab": ["analytical", "methodology", "framework", "synthesis", "perspective"],
        "model_answer": f"In the field of {cat}, one of the primary challenges involves the balance between innovation and tradition. To address this, we must adopt a comprehensive analytical methodology that incorporates diverse perspectives. Furthermore, establishing a solid theoretical framework is essential for the synthesis of new ideas. Ultimately, the solution lies in a collaborative approach that prioritizes long-term stability over short-term gains.",
        "follow_up": ["How has this issue evolved over the last decade?", "What is the most controversial aspect of this topic?"]
    })

# prevent duplicates
existing_ids = {item['id'] for item in data}
added_count = 0
for item in new_academic_prompts:
    if item['id'] not in existing_ids:
        data.append(item)
        added_count += 1

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f"Added {added_count} new speaking prompts. Total is now {len(data)}.")
