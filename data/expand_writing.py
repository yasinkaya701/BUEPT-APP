import json
import os

filepath = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/writing_prompts.json'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_items = [
    {
        "id": "WP_NEW_01",
        "task": "paragraph",
        "type": "opinion",
        "level": "P1",
        "topic": "hobbies",
        "prompt": "Do you think everyone should have a hobby? Give two reasons to support your opinion.",
        "keywords": ["interests", "stress", "free time"]
    },
    {
        "id": "WP_NEW_02",
        "task": "paragraph",
        "type": "cause_effect",
        "level": "P1",
        "topic": "health",
        "prompt": "Explain one main cause of poor health among university students.",
        "keywords": ["diet", "exercise", "lifestyle"]
    },
    {
        "id": "WP_NEW_03",
        "task": "paragraph",
        "type": "problem_solution",
        "level": "P2",
        "topic": "technology addiction",
        "prompt": "Many young adults spend too much time on their smartphones. Describe the problem and suggest one effective solution.",
        "keywords": ["screen time", "addiction", "digital detox"]
    },
    {
        "id": "WP_NEW_04",
        "task": "paragraph",
        "type": "compare_contrast",
        "level": "P2",
        "topic": "living arrangements",
        "prompt": "Compare living with roommates to living alone. What are the main differences?",
        "keywords": ["privacy", "expenses", "socializing"]
    },
    {
        "id": "WP_NEW_05",
        "task": "paragraph",
        "type": "opinion",
        "level": "P2",
        "topic": "financial literacy",
        "prompt": "Should personal finance be a mandatory subject in high schools? Give two reasons.",
        "keywords": ["money management", "budgeting", "education"]
    },
    {
        "id": "WP_NEW_06",
        "task": "paragraph",
        "type": "cause_effect",
        "level": "P3",
        "topic": "climate anxiety",
        "prompt": "Explain how climate change news affects the mental health of young people.",
        "keywords": ["anxiety", "environment", "future"]
    },
    {
        "id": "WP_NEW_07",
        "task": "paragraph",
        "type": "reaction",
        "level": "P3",
        "topic": "remote work",
        "prompt": "Read a short article stating that remote work decreases team innovation. Write your reaction and give one example.",
        "keywords": ["collaboration", "innovation", "workspace"]
    },
    {
        "id": "WP_NEW_08",
        "task": "essay",
        "type": "argumentative",
        "level": "P4",
        "topic": "artificial intelligence",
        "prompt": "Some argue that AI will eventually replace most white-collar jobs. To what extent do you agree or disagree?",
        "keywords": ["automation", "employment", "technology"]
    },
    {
        "id": "WP_NEW_09",
        "task": "essay",
        "type": "problem_solution",
        "level": "P4",
        "topic": "global inequality",
        "prompt": "The wealth gap between developed and developing nations continues to widen. Discuss the main causes of this issue and propose viable solutions.",
        "keywords": ["economy", "globalization", "distribution of wealth"]
    },
    {
        "id": "WP_NEW_10",
        "task": "essay",
        "type": "discursive",
        "level": "P4",
        "topic": "space exploration",
        "prompt": "Governments spend billions on space exploration while terrestrial problems remain unsolved. Discuss both sides of this funding debate and give your own opinion.",
        "keywords": ["budget", "priority", "scientific advancement"]
    }
]

existing_ids = {item.get('id') for item in data if item.get('id') is not None}
for item in new_items:
    if item['id'] not in existing_ids:
        data.append(item)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f"Added new writing prompts. Total is now {len(data)}.")
