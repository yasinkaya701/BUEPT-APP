import json

speaking_prompts = [
  {
    "id": "SPK_BUEPT_01",
    "topic": "The Ethical Implications of Artificial Intelligence in Healthcare",
    "level": "C1/P4",
    "prompts": [
      "To what extent should AI be permitted to make autonomous diagnostic decisions?",
      "How might reliance on algorithmic healthcare affect the doctor-patient relationship?",
      "Discuss the potential biases inherent in medical AI models."
    ],
    "ideal_clusters": [
      ["bias", "discrimination", "prejudice", "skewed", "inequity"],
      ["autonomy", "decision", "authority", "control", "regulation"],
      ["relationship", "empathy", "human", "compassion", "trust"],
      ["liability", "accountability", "responsibility", "sue", "legal"]
    ]
  },
  {
    "id": "SPK_BUEPT_02",
    "topic": "Universal Basic Income (UBI) as an Economic Stabilizer",
    "level": "C1/P4",
    "prompts": [
      "Could a Universal Basic Income alleviate systemic poverty effectively?",
      "What are the primary macroeconomic risks associated with implementing UBI?",
      "How might guaranteed income alter cultural perceptions of work and labor?"
    ],
    "ideal_clusters": [
      ["inflation", "economy", "prices", "taxes", "deficit"],
      ["poverty", "inequality", "welfare", "safety net", "destitution"],
      ["motivation", "incentive", "laziness", "productivity", "drive"],
      ["workforce", "automation", "displacement", "jobs", "employment"]
    ]
  },
  {
    "id": "SPK_BUEPT_03",
    "topic": "Censorship in the Digital Era",
    "level": "C1/P4",
    "prompts": [
      "Should social media platforms act as absolute arbiters of truth?",
      "Where is the boundary between combating misinformation and infringing on free speech?",
      "Examine the psychological effects of algorithmic echo chambers."
    ],
    "ideal_clusters": [
      ["misinformation", "fake news", "propaganda", "falsehoods", "distortion"],
      ["freedom", "speech", "expression", "liberty", "rights"],
      ["polarization", "echo chamber", "divide", "extremism", "radicalization"],
      ["regulation", "moderation", "censorship", "control", "algorithm"]
    ]
  },
  {
    "id": "SPK_BUEPT_04",
    "topic": "The Commodification of Higher Education",
    "level": "C1/P4",
    "prompts": [
      "Is university education becoming more about vocational training than intellectual growth?",
      "Discuss the socio-economic impacts of exorbitant tuition fees.",
      "How does the pressure of employability skew academic curricula?"
    ],
    "ideal_clusters": [
      ["debt", "loan", "tuition", "financial", "burden"],
      ["vocational", "career", "employability", "job", "market"],
      ["intellectual", "critical thinking", "growth", "academic", "philosophy"],
      ["accessibility", "privilege", "elite", "inequality", "barrier"]
    ]
  },
  {
    "id": "SPK_BUEPT_05",
    "topic": "Genetic Engineering and Designer Babies",
    "level": "C1/P4",
    "prompts": [
      "What are the moral boundaries of using CRISPR for human enhancement?",
      "Could genetic modification widen the gap between socio-economic classes?",
      "Discuss the difference between therapeutic editing and cosmetic enhancement."
    ],
    "ideal_clusters": [
      ["ethics", "moral", "boundary", "dilemma", "controversy"],
      ["inequality", "wealth", "class", "divide", "gap"],
      ["disease", "therapeutic", "cure", "prevention", "health"],
      ["enhancement", "cosmetic", "designer", "eugenics", "perfection"]
    ]
  }
]

with open('data/speaking_prompts.json', 'w', encoding='utf-8') as f:
    json.dump(speaking_prompts, f, indent=4)
print("Generated 5 fresh BUEPT speaking items with semantic clusters.")
