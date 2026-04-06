import json

PATH = 'data/mock_exams.json'

MOCK_EXAMS = [
    {
        "id": "mock_1",
        "title": "BUEPT Mock Exam 1 (Standard)",
        "duration": "120 mins",
        "description": "A full-length BUEPT simulation covering Academic Reading and Listening Note-taking.",
        "reading_section": ["r_1", "r_2", "r_3", "r_81", "r_100"],
        "listening_section": ["l_1", "l_2", "l_41", "l_60"]
    },
    {
        "id": "mock_2",
        "title": "BUEPT Mock Exam 2 (Advanced)",
        "duration": "120 mins",
        "description": "Focuses on higher-level C1/C2 topics for ambitious students.",
        "reading_section": ["r_62", "r_67", "r_77", "r_85", "r_96"],
        "listening_section": ["l_46", "l_52", "l_58", "l_60"]
    },
    {
        "id": "mock_3",
        "title": "BUEPT Mock Exam 3 (Social Sciences)",
        "duration": "120 mins",
        "description": "Themed exam focusing on Psychology, Sociology, and Economics.",
        "reading_section": ["r_61", "r_64", "r_69", "r_70", "r_93"],
        "listening_section": ["l_43", "l_44", "l_50", "l_56"]
    },
    {
        "id": "mock_4",
        "title": "BUEPT Mock Exam 4 (Natural Sciences)",
        "duration": "120 mins",
        "description": "Themed exam focusing on Physics, Biology, and Astronomy.",
        "reading_section": ["r_62", "r_63", "r_72", "r_75", "r_90"],
        "listening_section": ["l_42", "l_46", "l_47", "l_57"]
    },
    {
        "id": "mock_5",
        "title": "BUEPT Mock Exam 5 (Final Mastery)",
        "duration": "120 mins",
        "description": "The ultimate challenge combining the most complex units from all sections.",
        "reading_section": ["r_67", "r_85", "r_86", "r_91", "r_96"],
        "listening_section": ["l_52", "l_58", "l_60"]
    }
]

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(MOCK_EXAMS, f, indent=2, ensure_ascii=False)

print(f"Created {len(MOCK_EXAMS)} Full BUEPT Mock Exams.")
