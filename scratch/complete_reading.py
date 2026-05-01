import json
import os

filepath = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/reading_tasks.json'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

final_tasks = [
    {
        "id": "READ_R2_05",
        "level": "C1",
        "title": "Climate Change and Global Food Security",
        "sub_type": "careful_reading",
        "is_pro_book_style": True,
        "time": "55 min",
        "text": "[Paragraph 1] Climate change is no longer a distant threat; it is a current reality with profound implications for global food security. As global temperatures rise, the frequency and intensity of extreme weather events, such as droughts, floods, and heatwaves, are increasing. These events disrupt agricultural production, leading to crop failures and reduced yields in many parts of the world. For regions already struggling with food insecurity, the impact of climate change can be catastrophic, pushing millions more people into hunger and malnutrition.\n\n[Paragraph 2] One of the primary ways climate change affects food security is through the alteration of precipitation patterns. Many agricultural regions rely on predictable rainfall for crop growth. However, shifting weather patterns are leading to prolonged dry spells in some areas and excessive rainfall in others. These changes not only affect the quantity of food produced but also its quality. For example, increased atmospheric CO2 levels can reduce the nutritional value of certain crops, such as wheat and rice, by lowering their protein and mineral content.\n\n[Paragraph 3] Furthermore, rising sea levels and ocean acidification are threatening marine food sources. Coastal agricultural land is being lost to saltwater intrusion, while warming oceans are affecting fish populations and coral reefs. For many coastal communities, particularly in developing nations, fish is a primary source of protein and livelihood. The loss of these resources can lead to economic instability and increased vulnerability to food shortages.\n\n[Paragraph 4] The economic impact of climate change on food security is also significant. Reduced yields and disrupted supply chains lead to increased food prices, making nutritious food less affordable for low-income populations. This can result in 'hidden hunger,' where individuals have access to enough calories but lack essential micronutrients. Additionally, the instability caused by food shortages can lead to social unrest and migration, further complicating global efforts to achieve food security.\n\n[Paragraph 5] Addressing the link between climate change and food security requires a multi-faceted approach. This includes investing in 'climate-smart' agriculture, which promotes resilient crop varieties and sustainable farming practices. Additionally, improving food storage and distribution systems can reduce waste and ensure that food reaches those who need it most. Ultimately, mitigating the effects of climate change through global carbon reduction efforts is essential to ensuring a stable and secure food future for all.",
        "questions": [
            {
                "type": "short_answer",
                "q": "How do extreme weather events impact agricultural production?",
                "answer": ["Extreme weather events like droughts and floods disrupt production, leading to crop failures and reduced yields."],
                "skill": "detail"
            },
            {
                "type": "short_answer",
                "q": "What is 'hidden hunger' and how is it related to climate change?",
                "answer": ["Hidden hunger is when people have enough calories but lack micronutrients. It's related to climate change because rising food prices make nutritious food less affordable."],
                "skill": "inference"
            },
            {
                "type": "short_answer",
                "q": "What is one way CO2 levels affect the quality of crops?",
                "answer": ["Increased CO2 levels can reduce the nutritional value of crops like wheat and rice by lowering protein and mineral content."],
                "skill": "detail"
            },
            {
                "type": "short_answer",
                "q": "Why are marine food sources threatened by climate change?",
                "answer": ["They are threatened by rising sea levels (saltwater intrusion) and ocean acidification/warming affecting fish populations."],
                "skill": "detail"
            },
            {
                "type": "short_answer",
                "q": "What is 'climate-smart' agriculture?",
                "answer": ["Climate-smart agriculture refers to investing in resilient crop varieties and sustainable farming practices to adapt to climate change."],
                "skill": "detail"
            }
        ]
    },
    {
        "id": "READ_R2_06",
        "level": "C1",
        "title": "The Ethics of AI in Healthcare",
        "sub_type": "careful_reading",
        "is_pro_book_style": True,
        "time": "55 min",
        "text": "[Paragraph 1] The integration of Artificial Intelligence (AI) into healthcare promises to revolutionize medicine, from improving diagnostic accuracy to personalizing treatment plans. AI algorithms can analyze vast amounts of medical data far more quickly and accurately than human doctors, identifying patterns that might otherwise go unnoticed. However, the use of AI in clinical settings also raises significant ethical concerns, particularly regarding transparency, bias, and the potential for reduced human agency in medical decision-making.\n\n[Paragraph 2] Transparency, or the 'black box' problem, is a major ethical challenge. Many AI algorithms, particularly deep learning models, are highly complex, making it difficult for even their creators to understand how they arrive at a particular diagnosis or recommendation. This lack of transparency can undermine trust between patients and doctors, as patients may be hesitant to follow a treatment plan generated by a system they do not understand. Furthermore, if an AI system makes a mistake, it can be difficult to determine where the error occurred and who should be held accountable.\n\n[Paragraph 3] Bias in AI algorithms is another critical concern. AI systems are trained on historical medical data, which may contain biases reflecting existing inequalities in healthcare. If these biases are not identified and corrected, AI systems can perpetuate or even exacerbate health disparities. For example, an algorithm trained primarily on data from one demographic group may be less accurate when applied to individuals from other backgrounds. Ensuring that AI systems are trained on diverse and representative datasets is essential for achieving equitable healthcare outcomes.\n\n[Paragraph 4] Furthermore, the use of AI in medical decision-making raises questions about the role of human agency. While AI can provide valuable insights, it should not replace the clinical judgment and empathy of human doctors. There is a risk that doctors may become over-reliant on AI recommendations, leading to a 'deskilling' of the medical profession. Maintaining the 'human in the loop' is crucial to ensure that medical decisions are not only based on data but also consider the unique values, preferences, and circumstances of each patient.\n\n[Paragraph 5] In conclusion, the ethical integration of AI in healthcare requires a careful balance between innovation and responsibility. This involves developing 'explainable AI' that provides clear justifications for its recommendations, as well as establishing robust regulatory frameworks to ensure safety and accountability. Ultimately, AI should be seen as a tool to augment, rather than replace, human expertise, with the goal of improving health outcomes while upholding the core ethical principles of medicine: beneficence, non-maleficence, and respect for patient autonomy.",
        "questions": [
            {
                "type": "short_answer",
                "q": "What is the 'black box' problem in healthcare AI?",
                "answer": ["The 'black box' problem refers to the complexity of AI algorithms that makes it difficult to understand how they arrive at specific diagnoses or recommendations."],
                "skill": "inference"
            },
            {
                "type": "short_answer",
                "q": "How can AI perpetuate health disparities?",
                "answer": ["AI can perpetuate disparities if it's trained on biased historical data that reflects existing inequalities, leading to less accurate results for marginalized groups."],
                "skill": "detail"
            },
            {
                "type": "short_answer",
                "q": "What is the risk of 'deskilling' in the medical profession?",
                "answer": ["Deskilling is the risk that doctors may become over-reliant on AI, losing their own clinical judgment and expertise over time."],
                "skill": "inference"
            },
            {
                "type": "short_answer",
                "q": "What does 'human in the loop' mean in this context?",
                "answer": ["It means ensuring that human doctors remain central to the decision-making process, combining AI insights with their own empathy and patient-specific values."],
                "skill": "detail"
            },
            {
                "type": "short_answer",
                "q": "What is 'explainable AI' and why is it important?",
                "answer": ["Explainable AI provides clear justifications for its results. It's important for building trust and ensuring accountability in medical decisions."],
                "skill": "detail"
            }
        ]
    }
]

existing_ids = {item.get('id') for item in data if item.get('id') is not None}
for item in final_tasks:
    if item.get('id') not in existing_ids:
        data.append(item)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f"Final Count Reached: Added remaining R2 tasks. Total is now {len(data)}.")
