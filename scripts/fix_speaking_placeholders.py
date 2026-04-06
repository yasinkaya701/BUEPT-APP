import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/speaking_prompts.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

ANSWERS = [
    "I believe that while AI should play a supportive role in diagnostics, it should not have full autonomy. Human doctors are essential for interpreting results in a personal context, providing empathy, and making ethical judgments that algorithms might overlook due to data biases.",
    "The integration of algorithmic healthcare could potentially undermine the trust between a doctor and patient. If patients feel they are merely data points in a system, the compassionate element of healing—which is psychologically vital—might be lost or significantly diluted.",
    "Bais in medical AI is a critical concern, as models trained on skewed datasets can lead to inequity in care. For instance, if a dataset lacks diversity, the AI may misdiagnose conditions in underrepresented groups, further entrenching existing healthcare disparities.",
    "Genetic engineering offers the miraculous potential to eliminate hereditary diseases, but it also opens a Pandora's box of ethical dilemmas. Specifically, the risk of creating 'designer babies' could lead to a new form of social stratification based on genetic wealth.",
    "Universal Basic Income could provide a necessary safety net in an era of mass automation. By decoupling survival from traditional labor, it would allow individuals to pursue creative and community-oriented endeavors, potentially leading to a more fulfilled society.",
    "The primary challenge in managing global pandemics is the tension between public health and individual liberty. Effective responses require collective action and trust in scientific institutions, which can be difficult to maintain in a polarized political climate.",
    "Urban sprawl significantly degrades ecosystems by encroaching on natural habitats and increasing carbon emissions due to car-dependency. Future city planning must prioritize vertical growth and robust public transit to mitigate these environmental impacts.",
    "Cryptocurrency represents a shift toward decentralization, but its volatility and environmental cost due to mining are major drawbacks. A balance must be struck where blockchain's efficiency is harnessed without compromising global sustainability goals.",
    "Standardized testing provides a metric for academic achievement, but it often fails to capture a student's true potential or creativity. It can also lead to a 'teaching to the test' culture that diminishes the intrinsic value of a broad-based education.",
    "The exploration of space is not a luxury but a necessity for the long-term survival of humanity. By becoming a multi-planetary species, we can safeguard our civilization against planet-wide catastrophes and drive technological innovation that benefits us on Earth."
]

# Replace first 10 placeholders
count = 0
for item in data:
    if item.get('model_answer') == "Sample answer placeholder." and count < len(ANSWERS):
        item['model_answer'] = ANSWERS[count]
        count += 1

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Replaced {count} placeholders with high-quality model answers.")
