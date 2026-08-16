/**
 * offlineMocks.js — static, LLM-free official-format BUSEPT mock bank
 *
 * Every mock follows the official YADYOK exam order: Selective Listening
 * → Careful Listening → Reading I (Search) → Reading II (Careful) →
 * Writing (2 essays) → Speaking (4 interview questions). Questions use the
 * same shape consumed by AIMockExamScreen (short_answer, multiple_choice,
 * matching, essay, speaking). Levels P1–P4 map to the BUSEPT P-levels.
 *
 * These mocks run without a Gemini API key, so every visitor gets at least
 * one full official-format experience on first load.
 */

function shortAnswer(id, q, answer, options = null) {
  return { id, type: 'short_answer', q, answer: Array.isArray(answer) ? answer : [answer], options };
}

function multipleChoice(id, q, options, correct) {
  return { id, type: 'multiple_choice', q, options, correct };
}

function matching(id, q, options, correct) {
  return { id, type: 'matching', q, options, correct };
}

function essay(id, topic, wordTarget, helperIdeas, promptText) {
  return {
    id,
    topic,
    wordTarget,
    helperIdeas,
    promptText,
  };
}

function buildMock({ id, name, level, lecture, listeningCareful, searchArticle, carefulArticle }) {
  return {
    generatedAt: Date.now(),
    meta: {
      id,
      name,
      level,
      source: 'offline',
      description: `${name} — ${level} official-format mock (offline bank)`,
      official: true,
    },
    listening: {
      selective: {
        title: 'Selective Listening',
        transcript: lecture.transcript,
        questions: lecture.questions,
      },
      careful: {
        title: 'Careful Listening',
        transcript: listeningCareful.transcript,
        questions: listeningCareful.questions,
      },
    },
    reading: {
      search: { title: 'Reading I (Search)', article: searchArticle.article, questions: searchArticle.questions },
      careful: { title: 'Reading II (Careful)', article: carefulArticle.article, questions: carefulArticle.questions },
    },
    writing: {
      essays: [
        essay('e1', carefulArticle.essayTopic1.topic, 250, carefulArticle.essayTopic1.helpers, carefulArticle.essayTopic1.prompt),
        essay('e2', carefulArticle.essayTopic2.topic, 250, carefulArticle.essayTopic2.helpers, carefulArticle.essayTopic2.prompt),
      ],
    },
    speaking: {
      title: 'Speaking (Mock Interview)',
      questions: carefulArticle.speakingQuestions,
    },
  };
}

/* ────────────────────────────── P1 — B1 Elementary ─────────────────────── */

const p1Lecture = {
  transcript:
    'Good morning, everyone. Today I want to talk about water and how we use it at home. Most families use about three hundred litres of water every day. About thirty percent of that water is used for washing clothes. Twenty-five percent is used for cooking and cleaning dishes. The largest part, about thirty percent, is used in the bathroom, for showers and toilets. The rest goes to the garden and cleaning the house. There are easy ways to save water. One way is to turn off the tap while brushing your teeth. This can save ten litres every day. Another way is to take shorter showers. If you cut your shower by two minutes, you save about forty litres each time. Also, fixing a leaking tap is important. A slow drip can waste up to fifteen litres a day. Families that use a water-saving shower head can save nearly one hundred litres a week. Thank you, and please think about your water use at home tonight.',
  questions: [
    shortAnswer('s1', 'About how many litres of water do most families use every day?', ['300 litres', 'three hundred litres']),
    shortAnswer('s2', 'Which part of the house uses the largest share of water?', ['bathroom', 'the bathroom', 'showers and toilets']),
    shortAnswer('s3', 'How many litres can you save each day by turning off the tap while brushing teeth?', ['10 litres', 'ten litres']),
    shortAnswer('s4', 'How much water can a leaking tap waste per day?', ['15 litres', 'fifteen litres']),
    shortAnswer('s5', 'How much water can a water-saving shower head save per week?', ['about 100 litres', '100 litres', 'nearly 100 litres']),
  ],
};

const p1Careful = {
  transcript:
    'Hello, students. This lecture is about sleep and learning. I will explain three ideas today. First, sleep helps your brain move new information into long-term memory. While you sleep, the brain repeats what you learned during the day. Second, the time of day matters. Students who study in the morning remember more than students who study late at night. My research shows a difference of about fifteen percent. Third, short naps can also help. A nap of twenty minutes after studying improves test scores for many students. But long naps of more than one hour can make you feel tired after waking up. So the best plan is: study in the morning, review before bed, and take a short nap in the afternoon. Sleep is not wasted time. It is part of learning. Thank you for listening.',
  questions: [
    multipleChoice('c1', 'According to the lecture, what happens to new information while you sleep?', ['It is forgotten', 'The brain repeats it and stores it', 'It changes form', 'Nothing happens'], 1),
    multipleChoice('c2', 'How much better do morning students remember compared to late-night students?', ['Five percent', 'Ten percent', 'Fifteen percent', 'Twenty percent'], 2),
    multipleChoice('c3', 'How long should a helpful nap be?', ['10 minutes', '20 minutes', '60 minutes', '2 hours'], 1),
    multipleChoice('c4', 'What can happen after a nap longer than one hour?', ['You study better', 'You remember more', 'You feel tired after waking', 'You fall asleep again'], 2),
    multipleChoice('c5', 'What is the best study plan suggested by the lecturer?', ['Study late at night only', 'Study in the morning, review before bed, short nap', 'Nap before every class', 'Skip sleep before exams'], 1),
    matching('c6', 'Match each idea to its result: (1) Sleep (2) Morning study (3) Short naps (4) Long naps', ['Remember more than late study', 'Feel tired after waking', 'Brain stores new information', 'Improve test scores'], 0),
  ],
};

const p1Search = {
  article:
    'The Honey Bee Colony\n\nA honey bee colony has three kinds of bees. The queen is the largest bee. She can lay up to two thousand eggs per day. She is the mother of all bees in the hive. Worker bees are females too. They do all the work: they find food, clean the hive, feed the babies, and guard the door. Drones are the male bees. Their only job is to mate with a new queen. Worker bees live about six weeks in summer. In winter they live longer, up to five months. A strong colony can have up to sixty thousand bees. Bees communicate by dancing. The waggle dance tells other bees where food is, how far away it is, and in which direction. The more bees dance, the better the colony finds food.',
  questions: [
    shortAnswer('r1', 'How many eggs can the queen lay per day?', ['2,000', '2000', 'two thousand']),
    shortAnswer('r2', 'Which bees are male?', ['drones', 'the drones']),
    shortAnswer('r3', 'How long do worker bees live in summer?', ['about six weeks', '6 weeks', 'six weeks']),
    shortAnswer('r4', 'What do bees use to tell each other where food is?', ['dancing', 'the waggle dance', 'dance']),
    shortAnswer('r5', 'How many bees can a strong colony have?', ['60,000', '60000', 'sixty thousand']),
  ],
};

const p1CarefulReading = {
  article:
    'Why Do Cats Purr?\n\nMany people believe that cats purr only when they are happy. Science tells a more interesting story. Cats purr when they are happy, yes, but they also purr when they are scared, hurt, or sick. A purr is a sound made by fast-moving muscles in the throat. It vibrates between 25 and 150 times per second. Some scientists think this vibration can help the body heal. Strong bones need small pressure to stay healthy, and the purr gives gentle pressure to bones and muscles. This may explain why injured cats purr, and why cats have fewer bone problems than many other animals. There is also a social side. Mother cats purr to help their kittens find them, because kittens are born blind and deaf. So the purr is not just a happy sound. It is a tool for healing, comfort, and communication.',
  questions: [
    multipleChoice('c7', 'When do cats purr, according to the article?', ['Only when happy', 'When happy, scared, hurt, or sick', 'Only when sleeping', 'Only when eating'], 1),
    multipleChoice('c8', 'How fast does a purr vibrate?', ['5 to 10 times per second', '25 to 150 times per second', '100 to 500 times per second', '1,000 times per second'], 1),
    multipleChoice('c9', 'Why might purring help the body heal?', ['It relaxes the stomach', 'It gives gentle pressure to bones and muscles', 'It stops pain signals', 'It makes the cat sleep'], 1),
    multipleChoice('c10', 'Why do mother cats purr for kittens?', ['To feed them', 'To help blind and deaf kittens find them', 'To scare other cats', 'To teach them to hunt'], 1),
    matching('c11', 'Match each purr situation to its purpose: (1) Happy cat (2) Injured cat (3) Mother with kittens (4) Sick cat', ['Healing pressure', 'Communication', 'Comfort', 'Happiness'], 0),
  ],
};

const p1Meta = {
  essayTopic1: {
    topic: 'Is it better to live in the city or in the countryside?',
    helpers: ['jobs and services', 'nature and quiet', 'your own experience'],
    promptText: 'Write an essay giving your opinion. Give at least two reasons and examples from your life.',
  },
  essayTopic2: {
    topic: 'Should children use mobile phones at school?',
    helpers: ['learning tools', 'distraction in class', 'rules you suggest'],
    promptText: 'Write an essay with your opinion and at least two supporting reasons.',
  },
  speakingQuestions: [
    { id: 'sp1', type: 'speaking', q: 'Tell me about your hometown. What do you like about it?' },
    { id: 'sp2', type: 'speaking', q: 'What is your favorite food? Why do you like it?' },
    { id: 'sp3', type: 'speaking', q: 'Describe your typical weekend. What do you usually do?' },
    { id: 'sp4', type: 'speaking', q: 'Do you prefer studying alone or with friends? Explain your choice.' },
  ],
};

const p1 = buildMock({
  id: 'offline-p1-1',
  name: 'BUSEPT Offline Mock — P1',
  level: 'P1',
  lecture: p1Lecture,
  listeningCareful: p1Careful,
  searchArticle: p1Search,
  carefulArticle: { article: p1CarefulReading.article, questions: p1CarefulReading.questions, ...p1Meta },
});

/* ────────────────────────────── P2 — B1+ Pre-Intermediate ─────────────── */

const p2Lecture = {
  transcript:
    'Welcome back. Today we are discussing the history of coffee, one of the most consumed drinks in the world. Coffee was first discovered in Ethiopia, around the 9th century, according to legend a goat herder noticed his goats became energetic after eating certain berries. From Ethiopia, coffee traveled to Yemen, where it was first grown commercially in the 15th century. By the 17th century, coffee houses were common in London, Paris, and Vienna. People called them "penny universities" because, for the price of a penny, you could listen to educated conversation. Coffee played an important role in the economy of many countries. For example, Brazil became the world leader in coffee production in the 19th century, and today it still produces about one third of the world supply. Two facts worth remembering: first, a coffee plant takes about five years to produce its first harvest; second, the drink contains caffeine, a natural stimulant that improves alertness for roughly four hours. That is all for today. Next week, we will look at tea cultures around the world.',
  questions: [
    shortAnswer('s1', 'In which country was coffee first discovered?', ['Ethiopia', 'ethiopia']),
    shortAnswer('s2', 'What century did coffee reach Yemen for commercial growing?', ['15th century', 'the 15th century', '15th']),
    shortAnswer('s3', 'What were London coffee houses called?', ['penny universities']),
    shortAnswer('s4', 'How many years does a coffee plant need before its first harvest?', ['about five years', '5 years', 'five years']),
    shortAnswer('s5', 'About how long does caffeine improve alertness?', ['roughly four hours', '4 hours', 'four hours']),
  ],
};

const p2Careful = {
  transcript:
    'Good afternoon. Today I will talk about how cities plan public transport, and why some systems work better than others. There are three models I want you to understand. The first is the radial model: all lines meet at the city centre. This works well in historic European cities, but it forces every passenger through the centre, even when they travel between suburbs. The second is the grid model: lines cross the city in straight rows, like in Manhattan. Transfers are easy, but journeys between diagonal points take longer. The third is the hybrid model, which combines both. Most modern cities, such as Berlin and Tokyo, use this approach. Here is the key point from recent studies: the average commuter spends about 52 minutes per day travelling. Cities that added express lines saw this drop to around 38 minutes. Another finding: passengers value reliability more than speed. A train that is always five minutes late feels worse than one that is sometimes ten minutes late, because people cannot plan around it. So the message for city planners is clear: build predictable systems, not just fast ones. Any questions? No? Then enjoy your weekend.',
  questions: [
    multipleChoice('c1', 'What is the main weakness of the radial model?', ['It is expensive', 'All passengers must pass through the centre', 'It has no transfers', 'It only works in Asia'], 1),
    multipleChoice('c2', 'Which city is given as an example of the grid model?', ['Berlin', 'Tokyo', 'Manhattan', 'Paris'], 2),
    multipleChoice('c3', 'What did express lines reduce daily commute time to?', ['52 minutes', '38 minutes', '25 minutes', '60 minutes'], 1),
    multipleChoice('c4', 'What do passengers value more than speed, according to the lecture?', ['Lower price', 'Reliability', 'More lines', 'Free transfers'], 1),
    multipleChoice('c5', 'What is the main message for city planners?', ['Build the fastest trains', 'Build predictable systems', 'Copy Manhattan exactly', 'Remove all transfers'], 1),
    matching('c6', 'Match each transport model to its description: (1) Radial (2) Grid (3) Hybrid', ['All lines meet at the centre', 'Lines cross in straight rows', 'Combines both approaches'], 0),
  ],
};

const p2Search = {
  article:
    'The Science of Habits\n\nPsychologists have studied how habits form for more than a century. The classic answer comes from a 1911 experiment: when people repeat an action in the same context, the behaviour gradually becomes automatic. Researchers at University College London found that forming a new habit takes an average of 66 days, though the range was wide: from 18 to 254 days depending on the person and the behaviour. Drinking a glass of water after waking up was one of the easiest habits to form; doing fifty sit-ups before breakfast was one of the hardest. Three factors make habits stick. The first is a clear cue, such as always placing your running shoes next to the bed. The second is a small start: two minutes of exercise is easier to begin than a full gym session. The third is immediate reward, even a small one, because the brain links the action with pleasure. Interestingly, missing one day does not break a habit. The UCL study found that a single missed day had no meaningful effect on long-term habit formation. What breaks habits is context change: moving to a new city, or changing your morning routine entirely.',
  questions: [
    shortAnswer('r1', 'On average, how many days does forming a new habit take?', ['66 days', '66']),
    shortAnswer('r2', 'What was the shortest time recorded for forming a habit?', ['18 days', '18']),
    shortAnswer('r3', 'What was one of the hardest habits to form in the study?', ['doing fifty sit-ups before breakfast', 'fifty sit-ups']),
    shortAnswer('r4', 'Give one of the three factors that make habits stick.', ['a clear cue', 'a small start', 'immediate reward']),
    shortAnswer('r5', 'What breaks habits more than missing one day?', ['context change', 'changing your context', 'moving to a new city']),
  ],
};

const p2CarefulReading = {
  article:
    'Fake News and the Brain\n\nWhy do false stories spread faster than true ones? A 2018 study of 126,000 stories on a major social network found that false news spreads six times faster than true news. The reason is partly emotional: false stories are usually more surprising or shocking, and surprise makes people share. There is also a structural reason. True news tends to be boring, while false news is designed to catch attention. Our brains add a third problem: the illusion-of-truth effect. When people see a statement repeatedly, they start to believe it is true, even if it was labelled false at first. Fact-checkers can help, but they arrive late; by the time a correction is published, the false story has often reached ten times more people. What works better is "pre-bunking": warning people about manipulation techniques before they encounter them, similar to a vaccine for the mind. In controlled experiments, pre-bunking reduced belief in false stories by up to 30 percent. The practical lesson is that education matters more than correction. Teaching people how false stories are built is more effective than chasing each false story after it spreads.',
  questions: [
    multipleChoice('c7', 'How much faster does false news spread than true news, according to the study?', ['Two times', 'Four times', 'Six times', 'Ten times'], 2),
    multipleChoice('c8', 'What is the "illusion-of-truth effect"?', ['Believing stories you wrote', 'Believing repeated statements more', 'Ignoring all news', 'Forgetting headlines'], 1),
    multipleChoice('c9', 'What is "pre-bunking"?', ['Deleting false posts', 'Warning people about manipulation before they see it', 'Fact-checking quickly', 'Blocking social media'], 1),
    multipleChoice('c10', 'By how much did pre-bunking reduce belief in false stories in experiments?', ['10 percent', '20 percent', '30 percent', '50 percent'], 2),
    matching('c11', 'Match each factor to its role in spreading false news: (1) Emotional (2) Structural (3) Brain effect', ['Stories are surprising', 'Stories are designed to catch attention', 'Repeated statements feel true'], 0),
  ],
};

const p2Meta = {
  essayTopic1: {
    topic: 'Some people think university education should be free for everyone. Do you agree?',
    helpers: ['government budgets', 'equal opportunity', 'your country\'s situation'],
    promptText: 'Discuss both sides and give your own opinion with examples.',
  },
  essayTopic2: {
    topic: 'Is social media making people more lonely?',
    helpers: ['online connections', 'face-to-face time', 'research you know'],
    promptText: 'Write an essay presenting your view with at least two supporting arguments.',
  },
  speakingQuestions: [
    { id: 'sp1', type: 'speaking', q: 'Describe a place you visited recently. What did you do there?' },
    { id: 'sp2', type: 'speaking', q: 'What kind of films do you enjoy, and why?' },
    { id: 'sp3', type: 'speaking', q: 'Do you think technology has improved education? Give reasons.' },
    { id: 'sp4', type: 'speaking', q: 'Tell me about a goal you have for the next five years.' },
  ],
};

const p2 = buildMock({
  id: 'offline-p2-1',
  name: 'BUSEPT Offline Mock — P2',
  level: 'P2',
  lecture: p2Lecture,
  listeningCareful: p2Careful,
  searchArticle: p2Search,
  carefulArticle: { article: p2CarefulReading.article, questions: p2CarefulReading.questions, ...p2Meta },
});

/* ────────────────────────────── P3 — B2 Intermediate ──────────────────── */

const p3Lecture = {
  transcript:
    'Good morning. This lecture examines a phenomenon economists call the paradox of productivity: why do workers in some countries produce more value per hour while working fewer hours? Consider the comparison between Germany and the United States. German workers average roughly 1,370 working hours per year and generate high output per hour, while American workers put in about 1,790 hours but with lower hourly productivity. Three explanations are worth your attention. The first concerns capital intensity: German firms invest more in machinery and automation per worker, so each worker is equipped with better tools. The second concerns training: the German dual-education system combines classroom learning with paid apprenticeships, which produces workers who are job-ready from day one. The third concerns management culture: longer hours often signal commitment, but commitment is not the same as effectiveness. Research from Stanford shows productivity declines sharply beyond 50 hours per week; after 55 hours, additional output is close to zero. The policy implication is subtle. Simply cutting hours does not raise productivity. You must invest in the tools, training, and management practices that make fewer hours more valuable. Let me finish with a caveat: these averages hide significant variation across industries. Manufacturing shows the clearest pattern, while creative industries are far less predictable. Thank you.',
  questions: [
    shortAnswer('s1', 'Approximately how many hours per year do German workers average?', ['1,370', '1370', 'about 1,370']),
    shortAnswer('s2', 'Approximately how many hours do American workers put in per year?', ['1,790', '1790']),
    shortAnswer('s3', 'What does the German dual-education system combine?', ['classroom learning with paid apprenticeships', 'apprenticeships', 'classroom learning and apprenticeships']),
    shortAnswer('s4', 'Beyond how many hours per week does productivity decline sharply?', ['50 hours', '50']),
    shortAnswer('s5', 'After how many hours per week is additional output close to zero?', ['55 hours', '55']),
  ],
};

const p3Careful = {
  transcript:
    'Today I will discuss what makes some cities more innovative than others, drawing on research from urban economists. The central concept is what Jane Jacobs called "diversity generates ideas": cities where different industries, cultures, and skill levels mix tend to produce more innovation than specialised mono-industry towns. Let me walk you through the evidence. First, a study of U.S. patents found that inventors who live in large, diverse metros file about forty percent more patents than comparable inventors in small specialised towns, even controlling for education and income. Second, the mechanism matters. It is not that diverse cities attract smarter people, though they do; it is that accidental encounters, what researchers call "unplanned collisions", spark ideas that no planned meeting would produce. A biologist meeting an architect at a coffee shop is more likely to generate a novel concept than either would alone. Third, there is a threshold effect: diversity only boosts innovation once a city reaches a minimum size, roughly one million residents. Below that threshold, the collision rate is simply too low. Now, the counterargument deserves mention. Some scholars argue that remote work will reduce the advantage of big cities, since digital tools substitute for physical collisions. The early evidence is mixed: patents from remote-heavy cities have not declined, but growth has slowed. My own reading is that physical proximity still matters for the earliest, messiest stages of idea formation. We will return to this debate after the break.',
  questions: [
    multipleChoice('c1', 'What is Jane Jacobs\' central concept about cities?', ['Specialisation drives growth', 'Diversity generates ideas', 'Smaller cities innovate more', 'Planning creates innovation'], 1),
    multipleChoice('c2', 'How much more do inventors in large diverse metros file compared to small specialised towns?', ['20 percent more', '30 percent more', '40 percent more', '60 percent more'], 2),
    multipleChoice('c3', 'What are "unplanned collisions"?', ['Traffic accidents', 'Accidental encounters that spark ideas', 'Business failures', 'Sudden meetings with managers'], 1),
    multipleChoice('c4', 'Below what population does diversity stop boosting innovation?', ['100,000 residents', '500,000 residents', '1 million residents', '5 million residents'], 2),
    multipleChoice('c5', 'What is the speaker\'s reading of the remote work evidence?', ['Remote work destroys city innovation entirely', 'Physical proximity still matters for early idea formation', 'Remote work has no effect at all', 'Digital tools fully substitute collisions'], 1),
    matching('c6', 'Match each finding to its significance: (1) 40 percent more patents (2) Unplanned collisions (3) One million threshold', ['Diverse metros outperform specialised towns', 'Minimum size needed for diversity benefits', 'Mechanism behind the advantage'], 0),
  ],
};

const p3Search = {
  article:
    'The Gut Microbiome and Mental Health\n\nFor decades, the trillions of microbes living in the human gut were considered mere passengers. Recent research suggests they are active participants in mental health. The gut-brain axis is a two-way communication channel: the gut sends signals to the brain through the vagus nerve, through immune molecules, and through metabolites such as short-chain fatty acids. A landmark 2019 study published in Nature Microbiology examined the faecal samples of more than 1,000 Belgians and found that two groups of bacteria, Coprococcus and Dialister, were consistently depleted in people with depression, regardless of medication use. Causation, however, remains unproven. When researchers transplanted gut bacteria from depressed humans into germ-free mice, the mice displayed depression-like behaviour, which suggests a causal role but is not definitive for humans. Intervention trials are more cautious. Probiotic supplements have shown small improvements in anxiety scores, with effect sizes around 0.3 on standard scales, but results across studies are inconsistent. The most promising interventions are dietary: high-fibre, plant-rich diets increase microbial diversity within weeks, and diversity is associated with better mood outcomes in observational studies. One practical recommendation emerging from the literature: aim for thirty different plant types per week, a target associated with measurably richer microbiomes in the American Gut Project, which sampled more than 11,000 participants.',
  questions: [
    shortAnswer('r1', 'Through which nerve does the gut communicate with the brain?', ['vagus nerve', 'the vagus nerve']),
    shortAnswer('r2', 'How many Belgians were examined in the 2019 Nature Microbiology study?', ['more than 1,000', '1,000', '1000']),
    shortAnswer('r3', 'Name one of the two bacterial groups depleted in people with depression.', ['Coprococcus', 'Dialister']),
    shortAnswer('r4', 'What effect size have probiotics shown on anxiety scores?', ['around 0.3', '0.3']),
    shortAnswer('r5', 'How many different plant types per week does the literature recommend?', ['30', 'thirty', '30 different plant types']),
  ],
};

const p3CarefulReading = {
  article:
    'The Economics of Attention\n\nEvery app on your phone competes for the same scarce resource: your attention. Nobel laureate Herbert Simon predicted this in 1971: "a wealth of information creates a poverty of attention." Today the prediction looks prophetic. The average person checks their phone 96 times per day, and social media platforms employ thousands of engineers whose sole job is to maximise "engagement time". The business model is straightforward: attention is sold to advertisers, and every additional second of attention is additional revenue. This creates a structural conflict of interest. The product is not the app; the product is you, and your attention is the commodity being traded. Behavioural research shows why this is so effective. Variable-ratio reinforcement, the same mechanism that makes slot machines addictive, is embedded in the pull-to-refresh gesture: you never know what the next scroll will bring, so you keep scrolling. Researchers call this the "slot machine in your pocket" effect. The societal costs are becoming measurable. Studies link heavy social media use in adolescents to increased anxiety and sleep disruption, though causation runs in both directions. What can individuals do? The evidence favours structural changes over willpower. Deleting apps from the phone, using grayscale mode, or setting physical distance from the device all outperform intention-based strategies, because they remove the cue rather than relying on resistance.',
  questions: [
    multipleChoice('c7', 'What did Herbert Simon predict in 1971?', ['Phones would replace books', 'A wealth of information creates a poverty of attention', 'Advertising would disappear', 'People would read more'], 1),
    multipleChoice('c8', 'How often does the average person check their phone per day?', ['45 times', '72 times', '96 times', '120 times'], 2),
    multipleChoice('c9', 'What mechanism makes pull-to-refresh addictive?', ['Fixed-ratio reinforcement', 'Variable-ratio reinforcement', 'Punishment schedules', 'Classical conditioning'], 1),
    multipleChoice('c10', 'Which individual strategy does evidence favour most?', ['Trying harder to resist', 'Setting daily goals', 'Structural changes like deleting apps or grayscale mode', 'Reading about addiction'], 2),
    matching('c11', 'Match each concept to its description: (1) Engagement time (2) Commodity being traded', ['Seconds maximised by platform engineers', 'Your attention, sold to advertisers'], 0),
  ],
};

const p3Meta = {
  essayTopic1: {
    topic: 'Remote work has changed how companies operate. Discuss the advantages and disadvantages for both employers and employees.',
    helpers: ['productivity evidence', 'work-life boundaries', 'collaboration and culture'],
    promptText: 'Discuss both sides and present a balanced conclusion with examples.',
  },
  essayTopic2: {
    topic: 'Some argue that higher education should focus more on practical skills than theoretical knowledge. To what extent do you agree?',
    helpers: ['employability', 'critical thinking', 'changing job markets'],
    promptText: 'Write a well-structured essay with your position clearly stated.',
  },
  speakingQuestions: [
    { id: 'sp1', type: 'speaking', q: 'Describe a decision you made that changed your direction in life. What factors influenced you?' },
    { id: 'sp2', type: 'speaking', q: 'Do you think universities should teach more practical skills? Why or why not?' },
    { id: 'sp3', type: 'speaking', q: 'How has your use of technology changed in the last five years? Is it for better or worse?' },
    { id: 'sp4', type: 'speaking', q: 'If you could solve one problem in your community, what would it be and how would you approach it?' },
  ],
};

const p3 = buildMock({
  id: 'offline-p3-1',
  name: 'BUSEPT Offline Mock — P3',
  level: 'P3',
  lecture: p3Lecture,
  listeningCareful: p3Careful,
  searchArticle: p3Search,
  carefulArticle: { article: p3CarefulReading.article, questions: p3CarefulReading.questions, ...p3Meta },
});

/* ────────────────────────────── P4 — C1 Advanced ──────────────────────── */

const p4Lecture = {
  transcript:
    'Welcome to this advanced seminar on monetary policy transmission. I want to challenge a comfortable assumption: that central bank rate cuts automatically stimulate the economy. The transmission mechanism is far more fragile than textbook models suggest, and it breaks down precisely when you need it most. Consider the liquidity trap, a concept Keynes articulated in the 1930s and which policymakers confronted again after 2008. When interest rates approach zero, cutting them further has little marginal effect, because rates cannot go meaningfully below zero without causing capital flight into cash. The Bank of Japan provides the canonical case: decades of near-zero rates failed to end deflationary pressures, in part because when households expect prices to keep falling, they postpone consumption regardless of borrowing costs. A second, less discussed channel is the bank lending channel. Rate cuts are supposed to encourage banks to lend more. But if banks are repairing their balance sheets, as they were after 2008, they tighten credit standards even as the policy rate falls. Monetary easing then reaches the economy as a trickle rather than a flood. A third consideration is expectations. Modern central banking rests heavily on forward guidance, the promise that rates will stay low for an extended period. This works only if the central bank is credible. When credibility erodes, as it did in Turkey during the late 2010s, forward guidance becomes worthless, and the central bank loses its most powerful conventional tool. The implication for emerging markets is sobering: monetary policy effectiveness depends less on the policy rate itself and more on institutional credibility, financial system health, and household expectations. Rate cuts without these preconditions are, in the blunt formulation of one former Fed chair, pushing on a string. I will take questions after the break.',
  questions: [
    shortAnswer('s1', 'What did Keynes articulate in the 1930s that reappeared after 2008?', ['the liquidity trap', 'liquidity trap']),
    shortAnswer('s2', 'Why can rates not go meaningfully below zero, according to the lecture?', ['capital flight into cash', 'because of capital flight']),
    shortAnswer('s3', 'Which central bank provides the canonical case of the liquidity trap?', ['Bank of Japan', 'the Bank of Japan']),
    shortAnswer('s4', 'What do banks do to credit standards while repairing balance sheets?', ['tighten them', 'tighten credit standards']),
    shortAnswer('s5', 'What does forward guidance depend on to be effective?', ['credibility', 'central bank credibility', 'the central bank being credible']),
  ],
};

const p4Careful = {
  transcript:
    'Today I will argue that the dominant framing of artificial intelligence, as a technology that will either save or destroy humanity, is analytically inadequate, and I will propose a more useful framing based on institutional adaptation. Let me first establish why the dominant framing fails. The utopian narrative, in which AI solves scarcity, assumes that productivity gains translate automatically into welfare gains. History provides a corrective: the industrial revolution raised aggregate output enormously, yet the benefits accrued disproportionately to capital owners for nearly a century before workers saw real wage growth. The dystopian narrative, conversely, assumes a smooth trajectory toward superintelligence, ignoring that current systems remain narrow, brittle, and dependent on enormous data infrastructure. Both narratives share a flaw: they treat technology as the independent variable and society as the passive recipient. My proposed framing inverts this. The decisive variable is not the technology but the rate of institutional adaptation: how quickly legal frameworks, labour markets, educational systems, and social safety nets can restructure themselves around new capabilities. Consider three historical analogues. The printing press disrupted information monopolies, but its transformative effects required centuries of institutional change: copyright law, mass literacy programmes, the modern university. Electrification promised immediate transformation in the 1890s, yet factory productivity only surged after managers redesigned workflows around the new technology, a process that took roughly three decades. The internet similarly took twenty years to produce its major economic effects. If this pattern holds, the AI transition will be governed less by model capabilities than by the speed of institutional response. The policy corollary is uncomfortable: the countries best positioned are not those with the most advanced models, but those with the most adaptable institutions. I will elaborate on measurement in the next session.',
  questions: [
    multipleChoice('c1', 'What flaw do utopian and dystopian AI narratives share?', ['They ignore data infrastructure', 'They treat technology as the independent variable and society as passive', 'They are too pessimistic', 'They rely on historical analogues'], 1),
    multipleChoice('c2', 'According to the lecturer, how long before workers saw real wage growth after the industrial revolution?', ['Immediately', 'About a decade', 'Nearly a century', 'It never happened'], 2),
    multipleChoice('c3', 'Why did factory productivity surge only after electrification was introduced?', ['Electricity became cheaper', 'Managers redesigned workflows around the technology', 'New machines were invented', 'Workers demanded higher output'], 1),
    multipleChoice('c4', 'What is the decisive variable in the lecturer\'s proposed framing?', ['Model capabilities', 'Data availability', 'The rate of institutional adaptation', 'Government spending'], 2),
    multipleChoice('c5', 'Which countries does the lecturer claim are best positioned for the AI transition?', ['Those with the most advanced models', 'Those with the most adaptable institutions', 'Those with the largest populations', 'Those with the most capital'], 1),
    matching('c6', 'Match each historical analogue to the time it took to produce major effects: (1) Printing press (2) Electrification (3) Internet', ['Roughly three decades', 'Centuries of institutional change', 'About twenty years'], 0),
  ],
};

const p4Search = {
  article:
    'Quantum Error Correction and the Threshold Theorem\n\nQuantum computers promise exponential speedups for specific problems, but their qubits are extraordinarily fragile. Decoherence, the process by which qubits lose their quantum state through interaction with the environment, occurs on timescales of microseconds in current superconducting devices. Without intervention, a computation of any non-trivial length is impossible. The theoretical breakthrough came in the mid-1990s with the threshold theorem: if the physical error rate per gate operation falls below a critical threshold, estimated between 10^-3 and 10^-4 depending on the error model, then arbitrarily long quantum computations become possible through concatenated error correction codes. The mechanism is counterintuitive. Error correction codes encode one logical qubit into many physical qubits, typically around 1,000 physical qubits per logical qubit in surface code architectures, and continuously measure syndromes, indirect indicators of errors, without collapsing the encoded information. Each correction cycle must itself be faster than the decoherence timescale, which imposes severe demands on classical control electronics. Current state-of-the-art devices operate with physical error rates around 10^-3, perilously close to the threshold, which is why practical fault-tolerant quantum computation remains elusive despite rapid hardware progress. A subsidiary but important result concerns the overhead: the number of physical qubits required scales polylogarithmically with computation length, meaning that doubling the computation depth requires only a modest increase in qubit count, provided the threshold condition holds. This favourable scaling is what makes large-scale quantum algorithms, such as Shor\'s factoring algorithm requiring millions of logical operations, theoretically achievable, albeit with device sizes far beyond current capabilities.',
  questions: [
    shortAnswer('r1', 'On what timescale does decoherence occur in current superconducting qubits?', ['microseconds', 'microsecond timescales']),
    shortAnswer('r2', 'Between which values is the critical error threshold estimated?', ['10^-3 and 10^-4', '10^-3 to 10^-4']),
    shortAnswer('r3', 'Roughly how many physical qubits encode one logical qubit in surface code architectures?', ['about 1,000', '1,000', '1000']),
    shortAnswer('r4', 'What are indirectly measured to detect errors without collapsing the encoded information?', ['syndromes']),
    shortAnswer('r5', 'How does the required physical qubit count scale with computation length?', ['polylogarithmically', 'polylogarithmic']),
  ],
};

const p4CarefulReading = {
  article:
    'The Replication Crisis and Its Epistemological Consequences\n\nSince 2011, a succession of high-profile failures to replicate landmark findings has shaken the empirical sciences. Bem\'s precognition study, which reported evidence for backward time influence in controlled experiments, was published in a top journal and subsequently failed replication across nine laboratories. The Open Science Collaboration\'s 2015 effort, replicating 100 psychology studies, found that only 39 percent reproduced at original effect sizes, and the average effect size shrank by roughly half. The diagnoses converge on three mechanisms. Publication bias rewards novel, positive results and buries null findings, distorting the published literature into an unrepresentative sample. P-hacking, the practice of trying multiple analyses until significance is achieved, inflates false-positive rates well above the nominal five percent. And low statistical power, endemic in small-sample studies, means that even genuine effects are detected inconsistently, and detected effects are systematically exaggerated, a phenomenon known as the winner\'s curse. The reforms underway are structural rather than rhetorical. Pre-registration binds researchers to analysis plans before data collection, eliminating post-hoc flexibility. Registered reports have journals commit to publication based on methodology alone, decoupling acceptance from results. And the adoption of larger significance thresholds, some propose 0.005 for new claims, directly attacks the false-positive problem. The deeper lesson is epistemological: science self-corrects, but the correction mechanism has latency, and during that latency, textbooks, media, and policy incorporate findings that will later be withdrawn. The prudent stance is neither cynicism nor credulity, but calibrated confidence proportional to the robustness of the evidence base.',
  questions: [
    multipleChoice('c7', 'What did the Open Science Collaboration find about the 100 replicated psychology studies?', ['90 percent reproduced', '61 percent reproduced at original effect sizes', '39 percent reproduced at original effect sizes', 'None reproduced'], 2),
    multipleChoice('c8', 'What is p-hacking?', ['Publishing negative results', 'Trying multiple analyses until significance is achieved', 'Using large samples', 'Pre-registering studies'], 1),
    multipleChoice('c9', 'What is the "winner\'s curse" in low-power studies?', ['False studies winning awards', 'Detected effects being systematically exaggerated', 'Researchers winning grants unfairly', 'Journals favouring winners'], 1),
    multipleChoice('c10', 'How do registered reports decouple acceptance from results?', ['They hide results from reviewers', 'Journals commit to publication based on methodology alone', 'They only publish replications', 'They require larger samples'], 1),
    multipleChoice('c11', 'What is the "prudent stance" the author recommends?', ['Cynicism about all findings', 'Credulity toward new research', 'Calibrated confidence proportional to evidence robustness', 'Rejecting social science entirely'], 2),
  ],
};

const p4Meta = {
  essayTopic1: {
    topic: '"The most dangerous phrase in the language is \'we\'ve always done it this way.\'" Discuss this claim with reference to institutional change in one domain you know well.',
    helpers: ['technological disruption', 'regulatory inertia', 'historical precedent vs innovation'],
    promptText: 'Construct a sustained argument with nuanced counter-argumentation.',
  },
  essayTopic2: {
    topic: 'To what extent should governments regulate artificial intelligence development? Consider economic, ethical, and geopolitical dimensions.',
    helpers: ['innovation vs safety trade-off', 'international coordination problems', 'precedents from other technologies'],
    promptText: 'Present a sophisticated, well-evidenced position acknowledging legitimate counter-views.',
  },
  speakingQuestions: [
    { id: 'sp1', type: 'speaking', q: 'Evaluate the claim that technological progress always benefits society in the long run. Where would you draw the line?' },
    { id: 'sp2', type: 'speaking', q: 'How should universities balance producing employable graduates with cultivating critical thinkers? Defend your position.' },
    { id: 'sp3', type: 'speaking', q: 'Consider the trade-off between individual privacy and collective security. Under what conditions, if any, is surveillance justified?' },
    { id: 'sp4', type: 'speaking', q: 'If you were advising a government on AI policy, what would be your top priority and why?' },
  ],
};

const p4 = buildMock({
  id: 'offline-p4-1',
  name: 'BUSEPT Offline Mock — P4',
  level: 'P4',
  lecture: p4Lecture,
  listeningCareful: p4Careful,
  searchArticle: p4Search,
  carefulArticle: { article: p4CarefulReading.article, questions: p4CarefulReading.questions, ...p4Meta },
});

/** The complete offline mock bank, one full official-format mock per level. */
export const OFFLINE_MOCKS = [p1, p2, p3, p4];

export function getOfflineMocks(level) {
  if (!level) return OFFLINE_MOCKS;
  return OFFLINE_MOCKS.filter((m) => m.meta.level === level);
}
