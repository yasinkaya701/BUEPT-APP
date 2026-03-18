import json

grammar_tasks = [
  {
    "id": "GRAM_BUEPT_01",
    "topic": "Advanced Inversions",
    "level": "C1/P4",
    "question": "Rarely ______ such a catastrophic collapse in the financial markets prior to the implementation of modern regulatory frameworks.",
    "options": [
      "we had witnessed",
      "had we witnessed",
      "did we witnessed",
      "we witnessed"
    ],
    "correctIndex": 1,
    "explanation": "'Rarely' placed at the beginning of a sentence requires subject-auxiliary inversion (had we witnessed).",
    "translation": "Modern düzenleyici çerçevelerin uygulanmasından önce finansal piyasalarda bu kadar felaket bir çöküşe nadiren tanık olmuştuk."
  },
  {
    "id": "GRAM_BUEPT_02",
    "topic": "Mixed Conditionals",
    "level": "C1/P4",
    "question": "If the researchers had not secured the funding during the initial grant phase, the laboratory ______ fully operational today.",
    "options": [
      "would not be",
      "will not be",
      "had not been",
      "would not have been"
    ],
    "correctIndex": 0,
    "explanation": "This is a mixed conditional. Past unreal condition (Type 3) affecting a present unreal result (Type 2).",
    "translation": "Araştırmacılar başlangıç hibe aşamasında finansmanı sağlamamış olsalardı, laboratuvar bugün tam olarak operasyonel olmazdı."
  },
  {
    "id": "GRAM_BUEPT_03",
    "topic": "Participle Clauses",
    "level": "C1/P4",
    "question": "______ by the fierce criticism from her peers, the sociologist decided to completely revise her theoretical framework.",
    "options": [
      "To be deterred",
      "Having been deterred",
      "Deterred",
      "Deterring"
    ],
    "correctIndex": 2,
    "explanation": "A past participle ('Deterred') is used here to show a passive relationship to the subject, functioning as an adverbial clause of reason.",
    "translation": "Akranlarından gelen şiddetli eleştirilerden yılan (cayan) sosyolog, teorik çerçevesini tamamen gözden geçirmeye karar verdi."
  },
  {
    "id": "GRAM_BUEPT_04",
    "topic": "Noun Clauses",
    "level": "C1/P4",
    "question": "The paradox lies in the fact ______ humans seek autonomy, they simultaneously crave societal validation.",
    "options": [
      "that although",
      "despite",
      "whether",
      "what"
    ],
    "correctIndex": 0,
    "explanation": "'The fact that' introduces an appositive noun clause, followed by 'although' to set up the contrast.",
    "translation": "Paradoks, insanların özerklik aramasına rağmen aynı zamanda toplumsal onay hissini arzulamaları gerçeğinde yatmaktadır."
  },
  {
    "id": "GRAM_BUEPT_05",
    "topic": "Subjunctives",
    "level": "C1/P4",
    "question": "The ethics committee mandated that the clinical trial ______ immediately due to the unforeseen adverse side effects.",
    "options": [
      "is halting",
      "be halted",
      "must be halted",
      "halted"
    ],
    "correctIndex": 1,
    "explanation": "Verbs like 'mandate', 'demand', 'insist' take the subjective form (base verb) in the nominal 'that' clause.",
    "translation": "Etik kurul, öngörülmeyen olumsuz yan etkiler nedeniyle klinik deneyin derhal durdurulmasını emretti."
  },
  {
    "id": "GRAM_BUEPT_06",
    "topic": "Advanced Relatives",
    "level": "C1/P4",
    "question": "Oligarchies tend to suppress structural dissent, a phenomenon ______ political scientists often attribute the stagnation of civic liberties.",
    "options": [
      "to which",
      "in which",
      "for whom",
      "whose"
    ],
    "correctIndex": 0,
    "explanation": "The verb 'attribute' is followed by 'to' (attribute X to Y). Therefore, 'to which' is the correct relative structure.",
    "translation": "Oligarşiler, siyaset bilimcilerin sıklıkla sivil özgürlüklerin durgunluğunu atfettiği bir olgu olan yapısal muhalefeti bastırma eğilimindedir."
  },
  {
    "id": "GRAM_BUEPT_07",
    "topic": "Causatives",
    "level": "C1/P4",
    "question": "In order to mitigate the environmental impact, the municipality had the outdated water purification facilities ______ completely.",
    "options": [
      "overhaul",
      "to overhaul",
      "overhauled",
      "overhauling"
    ],
    "correctIndex": 2,
    "explanation": "The passive causative structure is 'have something done' (past participle).",
    "translation": "Çevresel etkiyi hafifletmek için belediye, modası geçmiş su arıtma tesislerini tamamen elden geçirtti."
  },
  {
    "id": "GRAM_BUEPT_08",
    "topic": "Emphasis / Cleft Sentences",
    "level": "C1/P4",
    "question": "It was not until the subsequent publication of her diary ______ the depth of the monarch's despair became public knowledge.",
    "options": [
      "when",
      "that",
      "which",
      "then"
    ],
    "correctIndex": 1,
    "explanation": "The structure 'It was not until X that Y' requires 'that' to introduce the main clause of the cleft sentence.",
    "translation": "Hükümdarın umutsuzluğunun derinliğinin kamuoyunca bilinmesi ancak günlüğünün sonraki yayını ile oldu."
  },
  {
    "id": "GRAM_BUEPT_09",
    "topic": "Modal Verbs of Deduction",
    "level": "C1/P4",
    "question": "Given the sheer complexity of the prehistoric artifacts uncovered, the civilization ______ highly sophisticated engineering techniques.",
    "options": [
      "should utilize",
      "must have utilized",
      "can't utilize",
      "might utilize"
    ],
    "correctIndex": 1,
    "explanation": "'must have + past participle' is used for strong logical deductions about the past based on present evidence.",
    "translation": "Ortaya çıkarılan tarih öncesi eserlerin katıksız karmaşıklığı göz önüne alındığında, medeniyet son derece sofistike mühendislik teknikleri kullanmış olmalı."
  },
  {
    "id": "GRAM_BUEPT_10",
    "topic": "Infinitive Clauses",
    "level": "C1/P4",
    "question": "The macroeconomic policy failed to generate sufficient momentum, ______ exacerbating the national deficit.",
    "options": [
      "only to end up",
      "so as ending up",
      "in order to end",
      "to have ended"
    ],
    "correctIndex": 0,
    "explanation": "'only to' + infinitive is an idiomatic structure used to express a disappointing or unexpected outcome.",
    "translation": "Makroekonomik politika yeterli ivme yaratmada başarısız oldu, sadece ulusal açığı daha da şiddetlendirmekle sonuçlandı."
  }
]

with open('data/grammar_tasks.json', 'w', encoding='utf-8') as f:
    json.dump(grammar_tasks, f, indent=4)
print(f"Generated {len(grammar_tasks)} fresh BUEPT grammar items.")
