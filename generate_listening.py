import json

listening_tasks = [
  {
    "id": "LIST_BUEPT_01",
    "title": "Lexical Attrition and L2 Acquisition",
    "level": "C1",
    "time": "18 min",
    "audio": "lecture_buept_lexical_attrition.mp3",
    "category": "Linguistics",
    "transcript": "Welcome to today's seminar on psycholinguistics. Today we turn our attention to a phenomenon often overshadowed by acquisition studies: lexical attrition in the second language, or L2. Attrition refers to the non-pathological decline of previously acquired linguistic skills, primarily occurring when a speaker relies heavily on their native tongue (L1) at the expense of their L2. Our focus is specifically on the lexical domain, which is notoriously the most vulnerable linguistic subsystem to sheer disuse.\n\nSeveral cognitive models attempt to explain this erosion. The most prominent is the Activation Threshold Hypothesis, proposed by Michel Paradis. This hypothesis posits that every lexical item has an activation threshold. Each time a word is retrieved, its threshold is lowered, making it easier to access in the future. Conversely, if a word is not retrieved for an extended period, its activation threshold inexorably rises, requiring greater neural effort to access. Eventually, the threshold may become so high that the item cannot be retrieved at all, resulting in apparent semantic loss.\n\nHowever, it's crucial to distinguish between mere retrieval failure and definitive neural erasure. Research utilizing neuro-imaging protocols, specifically fMRI, frequently demonstrates that 'attrited' vocabulary often retains latent neural representations. When subjects are re-exposed to the forgotten lexical items, the neural networks exhibit rapid reactivation, a process sometimes termed 're-learning savings.' This starkly implies that the storage mechanism itself remains largely intact; the deficit lies essentially within the retrieval pathways.",
    "ideal_clusters": [
      ["attrition", "decline", "erosion", "loss", "forgetting"],
      ["activation", "threshold", "retrieval", "access", "pathway"],
      ["latent", "neural", "representation", "storage", "erasure"],
      ["relearning", "savings", "reactivation", "exposure", "recovery"]
    ],
    "questions": [
      {
        "type": "multiple-choice",
        "q": "What is the core premise of the Activation Threshold Hypothesis?",
        "options": [
          "Lexical items are permanently erased from memory if unused.",
          "The ease of retrieving a word depends on the frequency of its past use.",
          "L1 grammar inherently suppresses L2 vocabulary acquisition.",
          "Neural pathways for language are established strictly during childhood."
        ],
        "answer": 1,
        "skill": "detail_inference",
        "timestamp": 45,
        "explain": "The hypothesis posits that each time a word is retrieved, its threshold lowers (making it easier), and if unused, it rises (making it harder)."
      },
      {
        "type": "cloze",
        "q": "fMRI research indicates that forgotten words are not definitively erased but rather suffer from a failure in ______ pathways.",
        "options": [
          "pathological",
          "semantic",
          "retrieval",
          "acquisition"
        ],
        "answer": 2,
        "skill": "vocabulary_in_context",
        "timestamp": 85,
        "explain": "The lecturer states: 'the storage mechanism itself remains largely intact; the deficit lies essentially within the retrieval pathways.'"
      }
    ]
  },
  {
    "id": "LIST_BUEPT_02",
    "title": "Sustainable Urbanism and the Heat Island Effect",
    "level": "C1",
    "time": "20 min",
    "audio": "lecture_buept_urbanism.mp3",
    "category": "Urban Planning",
    "transcript": "Good morning. In this module on Sustainable Urbanism, we confront the Urban Heat Island, or UHI, effect. UHI is characterized by urban sectors experiencing significantly higher temperatures than their surrounding rural peripheries. The etiology of this thermal anomaly is multifactorial, but we can distill it into two primary anthropogenic drivers: the ubiquitous deployment of impermeable, low-albedo construction materials, and the precipitous decline of urban vegetative cover.\n\nStandard asphalt and concrete, which dominate modern cityscapes, possess exceptionally high thermal admittance. They absorb short-wave solar radiation during the day and re-emit it as long-wave thermal radiation at night, effectively inhibiting diurnal cooling. Concurrently, the eradication of trees eliminates the mitigating effects of evaporative cooling and shading. This is not merely an issue of aggregate thermal discomfort; the UHI paradigm severely exacerbates respiratory pathologies during heatwaves and dramatically inflates energy consumption requirements for aggressive climatization.\n\nMitigation strategies must be equally comprehensive. The implementation of 'cool roofs' utilizing high-albedo coatings reflects insolation back into the atmosphere. More profoundly, the integration of green infrastructure—such as bioswales and strategic canopy restoration—can drastically alter the urban microclimate. By transforming the urban surface energy balance, metabolic city temperatures can be stabilized, curtailing the vicious cycle of increased ambient heat demanding increased anthropogenic energy.",
    "ideal_clusters": [
      ["island", "UHI", "temperature", "heat", "thermal"],
      ["albedo", "reflect", "insolation", "radiation", "admittance"],
      ["vegetative", "green", "canopy", "evaporative", "plant"],
      ["mitigation", "strategy", "cool", "infrastructure", "surface"]
    ],
    "questions": [
      {
        "type": "multiple-choice",
        "q": "What two mechanisms do asphalt and concrete use to contribute to the UHI effect?",
        "options": [
          "Deflection of solar radiation and high evaporative cooling.",
          "Absorption of short-wave radiation and re-emission of long-wave radiation.",
          "Reduction of anthropogenic energy and stabilization of microclimates.",
          "Inhibition of long-wave radiation and emission of short-wave radiation."
        ],
        "answer": 1,
        "skill": "detail_inference",
        "timestamp": 35,
        "explain": "The transcript explicitly states these materials 'absorb short-wave solar radiation during the day and re-emit it as long-wave thermal radiation'."
      },
      {
        "type": "multiple-choice",
        "q": "How does green infrastructure, such as canopy restoration, alleviate the UHI effect?",
        "options": [
          "By increasing the urban surface energy balance.",
          "By utilizing high-albedo coatings on street levels.",
          "By providing shading and evaporative cooling.",
          "By absorbing long-wave thermal radiation at night."
        ],
        "answer": 2,
        "skill": "main_idea",
        "timestamp": 75,
        "explain": "The professor mentions that eradicating trees eliminates 'evaporative cooling and shading', implying restoring them provides these benefits."
      }
    ]
  }
]

with open('data/listening_tasks.json', 'w', encoding='utf-8') as f:
    json.dump(listening_tasks, f, indent=4)
print("Generated high-quality BUEPT listening tasks.")
