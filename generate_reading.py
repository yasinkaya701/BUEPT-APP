import json

reading_tasks = [
  {
    "id": "READ_BUEPT_01",
    "title": "The Fallacy of Meritocratic Ideals in Modern Education",
    "level": "C1",
    "time": "15 min",
    "text": "The contemporary educational landscape is frequently lauded as the ultimate engine of social mobility, fundamentally structured around meritocratic principles. Proponents argue that academic institutions reward intellectual capability and assiduous effort, thereby leveling the socio-economic playing field. However, progressive sociologists contend that this paradigm is a pervasive fallacy. Rather than dismantling systemic inequalities, the education system often exacerbates them by validating pre-existing socio-economic privileges under the guise of objective assessment.\n\nStandardized testing, for instance, is routinely criticized as a culturally biased metric that correlates more robustly with a student’s zip code than with their innate aptitude. Access to supplementary tutoring, enriching extracurricular activities, and a stable home environment are commodities unevenly distributed across the socio-economic spectrum. Furthermore, the 'hidden curriculum'—the unwritten, unofficial, and often unintended lessons, values, and perspectives that students learn in school—disproportionately benefits those from affluent backgrounds whose cultural capital aligns seamlessly with institutional expectations. Consequently, the meritocratic narrative serves primarily to legitimize societal stratification, obfuscating the structural impediments that preclude genuine egalitarianism.",
    "ideal_clusters": [
      ["meritocracy", "meritocratic", "myth", "fallacy", "illusion", "false"],
      ["inequality", "stratification", "socio-economic", "privilege", "wealth"],
      ["standardized", "testing", "bias", "assessment", "metrics"],
      ["curriculum", "hidden", "cultural capital", "background", "home environment"]
    ],
    "questions": [
      {
        "type": "multiple-choice",
        "q": "What is the primary function of the 'meritocratic narrative' according to the passage?",
        "options": [
          "To dismantle systemic educational inequalities.",
          "To provide objective assessments of innate aptitude.",
          "To legitimize pre-existing societal stratification.",
          "To align cultural capital with institutional expectations."
        ],
        "answer": 2,
        "skill": "main_idea",
        "explain": "The text states: 'the meritocratic narrative serves primarily to legitimize societal stratification'."
      },
      {
        "type": "cloze",
        "q": "Critics argue that standardized testing is an inherently ______ metric that favors the affluent.",
        "options": [
          "objective",
          "biased",
          "egalitarian",
          "assiduous"
        ],
        "answer": 1,
        "skill": "vocabulary_in_context",
        "explain": "The text calls standardized testing a 'culturally biased metric'."
      }
    ]
  },
  {
    "id": "READ_BUEPT_02",
    "title": "Epigenetic Inheritance and the Paradigm of Adaptation",
    "level": "C1",
    "time": "12 min",
    "text": "For decades, the central dogma of molecular biology maintained that genetic information flows unidirectionally from DNA to RNA to proteins, rendering acquired phenotypic traits strictly non-heritable. This Neo-Darwinian perspective posited that evolutionary adaptation is exclusively the product of random genetic mutations subjected to natural selection. However, the burgeoning field of epigenetics has catalyzed a paradigm shift by demonstrating that environmental factors can induce heritable alterations in gene expression without altering the underlying nucleotide sequence.\n\nEpigenetic mechanisms, such as DNA methylation and histone modification, serve as dynamic regulatory systems that respond to external stimuli—ranging from nutritional constraints to psychological trauma. Crucially, studies on transgenerational epigenetic inheritance have revealed that these environmentally induced molecular 'tags' can be transmitted to subsequent generations. This phenomenon implies a Lamarckian dimension to adaptation, suggesting that an organism’s experiences can directly influence the developmental trajectory of its progeny, thereby accelerating adaptive responses to fluctuating environments.",
    "ideal_clusters": [
      ["epigenetics", "epigenetic", "methylation", "histone", "tags"],
      ["heritability", "inheritance", "transmit", "progeny", "offspring"],
      ["environment", "stimuli", "trauma", "nutrition", "external"],
      ["evolution", "adaptation", "Darwinian", "Lamarckian", "phenotype"]
    ],
    "questions": [
      {
        "type": "multiple-choice",
        "q": "How does epigenetics challenge the neo-Darwinian perspective?",
        "options": [
          "By proving that mutations are not random.",
          "By showing that acquired traits can be inherited.",
          "By demonstrating DNA flows backward from proteins.",
          "By accelerating nucleotide sequence changes."
        ],
        "answer": 1,
        "skill": "detail_inference",
        "explain": "Epigenetics catalyzed a shift by demonstrating that environmental factors can induce heritable alterations, showing acquired traits can be passed down."
      },
      {
        "type": "multiple-choice",
        "q": "The mention of a 'Lamarckian dimension' serves to highlight:",
        "options": [
          "That organisms can consciously alter their own DNA.",
          "That external stimuli definitively alter the nucleotide sequence.",
          "That an organism’s lifetime experiences can influence its offspring.",
          "That natural selection is entirely invalid."
        ],
        "answer": 2,
        "skill": "author_purpose",
        "explain": "Lamarckian evolution relies on the inheritance of acquired characteristics—meaning an organism's experiences (like stretching a neck) influence progeny."
      }
    ]
  }
]

with open('data/reading_tasks.json', 'w', encoding='utf-8') as f:
    json.dump(reading_tasks, f, indent=4)
print("Generated high-quality BUEPT reading tasks.")
