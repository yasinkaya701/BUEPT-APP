/**
 * offlineMocksOdtu.js — static, LLM-free METU EPE/İYS mock bank
 *
 * Follows the official METU SFL "Test Content and Scoring" (Oct 2025,
 * verified against dil.metu.edu.tr):
 *   - While Listening (~25 min • 24 pts) — 16 MC items, 1.5 pts each
 *   - Careful Reading (60 min • 32 pts) — 4 texts, 20 comprehension
 *     (1.5 pts) + 4 vocabulary (0.5 pts)
 *   - Note-Taking (~15 min • 9 pts) — lecture once (~8 min) → 6 MC,
 *     1.5 pts each
 *   - Independent Writing (35 min • 20 pts) — ONE essay, ~220 words
 *   - Speaking (Day 2 • 15 pts • ~8 min) — 4 unprepared + 1 prepared Q
 *   - TOTAL 100 pts; pass 60; 85+ exempts later English courses
 *
 * Offline mocks use representative item counts (not the full 52 items)
 * but the meta records the official weights so scoring screens can map
 * results to the 100-point scale. The shape reuses the same item types
 * consumed by AIMockExamScreen, so the universal extractor renders
 * METU mocks without new UI code.
 */

/** Official 100-point METU EPE/İYS weight map (Oct 2025 scoring). */
export const ODTU_SCORING = {
  listening: 24,
  reading: 32,
  noteTaking: 9,
  writing: 20,
  speaking: 15,
  total: 100,
  pass: 60,
  exempt: 85,
};

function shortAnswer(id, q, answer, options = null) {
  return { id, type: 'short_answer', q, answer: Array.isArray(answer) ? answer : [answer], options };
}
function multipleChoice(id, q, options, correct) {
  return { id, type: 'multiple_choice', q, options, correct };
}

/** Build one flat-section METU mock (sections map 1:1 to official blocks). */
function buildOdtuMock({ id, name, level, listening, reading, noteTaking, writing, speaking }) {
  return {
    generatedAt: Date.now(),
    meta: {
      id,
      name,
      level,
      source: 'offline-odtu',
      description: `${name} — ${level} METU-format mock (offline bank)`,
      official: true,
      university: 'odtu',
      scoring: ODTU_SCORING,
      officialOrder: ['listening', 'reading', 'note-taking', 'writing', 'speaking'],
    },
    // Flat section list so the universal extractor picks them in order.
    listening: {
      selective: { title: 'Listening', transcript: listening.transcript, questions: listening.questions },
    },
    reading: {
      search: { title: 'Reading', article: reading.article, questions: reading.questions },
    },
    noteTaking: {
      lecture: { title: 'Note-Taking', transcript: noteTaking.transcript, questions: noteTaking.questions },
    },
    writing: {
      essays: [
        {
          id: writing.id,
          topic: writing.topic,
          wordTarget: writing.wordTarget,
          helperIdeas: writing.helpers,
          promptText: writing.prompt,
        },
      ],
    },
    bonusPractice: {
      speaking: {
        title: 'Speaking (face-to-face block — ~8 minutes)',
        questions: speaking.questions,
      },
    },
  };
}

/* ────────────────────────────── Level 1 — B1 ─────────────────────────── */

const l1Listening = {
  transcript:
    'Announcer: Welcome to the campus radio orientation hour. Today we talk about student life at Middle East Technical University. First, a short talk from the library office. METU Central Library opens at 8 a.m. on weekdays and closes at 10 p.m. Students can borrow up to five books for two weeks. The second floor is the silent study floor; talking is not allowed there. Now a dialogue between two students. — Hi Kemal, did you join a club this year? — Yes, I joined the robotics club. We meet every Thursday at the sports hall. It is free and you do not need experience. — Nice! I want to join the drama club, but I heard they hold auditions next week. — That is true. Auditions are on Tuesday and Wednesday afternoons. Good luck!',
  questions: [
    multipleChoice('q1', 'When does the METU Central Library close on weekdays?', ['8 p.m.', '9 p.m.', '10 p.m.', '11 p.m.'], 2),
    multipleChoice('q2', 'How many books can a student borrow at one time?', ['Three', 'Four', 'Five', 'Six'], 2),
    multipleChoice('q3', 'What rule applies to the second floor of the library?', ['No phones allowed', 'Talking is not allowed', 'No laptops allowed', 'No food allowed'], 1),
    multipleChoice('q4', 'When does the robotics club meet?', ['Every Monday', 'Every Wednesday', 'Every Thursday', 'Every Friday'], 2),
    multipleChoice('q5', 'When are the drama club auditions?', ['Monday and Tuesday', 'Tuesday and Wednesday', 'Wednesday and Thursday', 'Thursday and Friday'], 1),
  ],
};

const l1Reading = {
  article:
    'Sleep and the Teenage Brain\n\nTeenagers often stay up late and struggle to wake up early. Scientists say this is not simply laziness. During adolescence, the biological clock shifts forward by about two hours. A thirteen-year-old who used to fall asleep at nine p.m. may now feel wide awake until eleven. This shift is driven by melatonin, a hormone the brain releases at night. In teens, melatonin starts rising later than in children or adults, so the feeling of sleepiness arrives later too.\n\nThe consequences are serious for school performance. When a student sleeps less than eight hours, attention drops the next day. Memory suffers as well, because sleep is when the brain organises what was learned. Studies comparing classes that started at seven thirty a.m. with classes that started at eight thirty a.m. found that the later start time improved grades and reduced absences.\n\nSome schools have responded by moving the first bell later. The results are promising: tardiness fell, students reported feeling less anxious, and teachers noticed more participation. Critics argue that later starts disturb family schedules and after-school activities. Nevertheless, most sleep researchers now agree that early start times fight against teenage biology, and a one-hour delay is a cheap and effective solution.\n\nGraph note (as would appear in the real exam): a bar chart shows average test scores rising from 62% at a 7:30 start to 71% at an 8:30 start.',
  questions: [
    multipleChoice('q1', 'According to the text, why do teenagers fall asleep later?', ['They drink too much coffee', 'Melatonin starts rising later in their brains', 'They use their phones at night', 'Their biological clock shifts two hours backward'], 1),
    multipleChoice('q2', 'What does the text say happens when a student sleeps less than eight hours?', ['They learn faster', 'Attention and memory drop', 'They feel more energetic', 'Nothing changes'], 1),
    multipleChoice('q3', 'What did the study of different start times find?', ['Earlier starts improved grades', 'Later starts improved grades and reduced absences', 'Start time had no effect', 'Only math grades improved'], 1),
    multipleChoice('q4', 'According to the graph note, how much did average test scores rise when the start time moved from 7:30 to 8:30?', ['Nine percentage points (from 62% to 71%)', 'Five percentage points', 'Fifteen percentage points', 'No change'], 0),
    multipleChoice('q5', 'What is the critics\' main concern about later school starts?', ['They are too expensive', 'They disturb family schedules and after-school activities', 'They make students lazy', 'Teachers dislike them'], 1),
  ],
};

const l1NoteTaking = {
  transcript:
    'Today I will talk about renewable energy, and you should take notes because you will answer questions afterwards. There are three main renewable sources I want to cover. First, solar energy. Solar panels turn sunlight directly into electricity. The biggest advantage is that sunlight is free and unlimited; the biggest problem is that panels produce nothing at night and less on cloudy days. Second, wind energy. Wind turbines are cheap to run once they are built, and one large turbine can power about six hundred homes. Their disadvantage is visual and noise impact, and they need steady wind. Third, hydroelectric power. Water dams produce stable electricity around the clock, which is their great strength. However, building a dam can destroy river ecosystems and force local communities to move. Remember: solar is unlimited but intermittent, wind is cheap but site-dependent, hydro is stable but environmentally costly. Questions will follow about these three sources.',
  questions: [
    multipleChoice('q1', 'What is the main advantage of solar energy mentioned in the lecture?', ["sunlight is free and unlimited", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q2', 'How many homes can one large wind turbine power?', ["about six hundred homes", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q3', 'What is a disadvantage of hydroelectric dams?', ['They are expensive to run', 'They can destroy river ecosystems and force communities to move', 'They only work in summer', 'They produce unstable electricity'], 1),
    multipleChoice('q4', 'Why is wind energy described as "site-dependent"?', ['Turbines need steady wind', 'They are too tall', 'They need sunlight', 'They need water nearby'], 0),
    multipleChoice('q5', 'Which energy source is described as stable but environmentally costly?', ["hydroelectric", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
  ],
};

const l1Writing = {
  id: 'w1',
  topic: 'University students should attend classes in person rather than online.',
  wordTarget: 200,
  helpers: ['social interaction with classmates', 'direct feedback from instructors', 'distractions at home'],
  prompt: 'Write an essay of about 180-250 words arguing for or against this statement. You may use the guidelines or your own ideas.',
};

const l1Speaking = {
  questions: [
    { id: 'sp1', type: 'speaking', q: 'Introduce yourself. Tell us about your hometown and your family.', prepared: false },
    { id: 'sp2', type: 'speaking', q: 'Why did you choose this university and your department?', prepared: false },
    { id: 'sp3', type: 'speaking', q: 'What are your hobbies, and how do they help you relax after studying?', prepared: false },
    { id: 'sp4', type: 'speaking', q: 'Describe a memorable school experience from the past year.', prepared: false },
    { id: 'sp_prepared_l1', type: 'speaking', q: 'In your opinion, what is the biggest challenge facing universities today, and how would you address it?', prepared: true },
  ],
};

const odtu1 = buildOdtuMock({
  id: 'offline-odtu-l1-1',
  name: 'ODTÜ-EPE Offline Mock — Level 1',
  level: 'L1',
  listening: l1Listening,
  reading: l1Reading,
  noteTaking: l1NoteTaking,
  writing: l1Writing,
  speaking: l1Speaking,
});

/* ───────────────────── Level 2 — B1+/B2 (original set + sets 2B, 2C) ──── */

const l2bListening = {
  transcript:
    'Announcer: This is the METU Science and Technology Week podcast. Our first speaker is Dr Ayşe Yıldız from the Department of Environmental Engineering, talking about urban heat islands. Dr Yıldız: Thank you. An urban heat island is a city that is significantly warmer than its surrounding countryside. In summer afternoons, Ankara can be four to six degrees warmer than the fields around it. Three factors cause this. First, concrete and asphalt absorb sunlight during the day and release it slowly at night. Second, tall buildings block the wind that would otherwise cool the streets. Third, cars and air conditioners pump extra heat into the air. What can universities do? Our own campus has planted more than two thousand trees along its main avenue since 2018, and measurements show the avenue is now about two degrees cooler in August. Students can help by using the bus instead of personal cars and by joining the campus greening club, which meets every Monday at 5 p.m. in the cafeteria. Next, we turn to space research at METU…',
  questions: [
    multipleChoice('q1', 'What is an urban heat island, according to the speaker?', ['A city warmer than its surrounding countryside', 'A park inside a city', 'An island with high temperatures', 'A greenhouse district'], 0),
    multipleChoice('q2', 'How much warmer can Ankara be than the countryside in summer afternoons?', ['One degree', 'Four to six degrees', 'Ten degrees', 'It is not mentioned'], 1),
    multipleChoice('q3', 'Why does asphalt make cities warmer?', ['It reflects sunlight into space', 'It absorbs sunlight and releases heat slowly at night', 'It produces heat on its own', 'It blocks rain'], 1),
    multipleChoice('q4', 'What has METU campus done since 2018?', ['Banned cars', 'Planted more than two thousand trees along its main avenue', 'Built air conditioners', 'Closed the cafeteria'], 1),
    multipleChoice('q5', 'When does the campus greening club meet?', ['Every Monday at 5 p.m. in the cafeteria', 'Every Friday at noon', 'Every Monday at 8 a.m.', 'It does not meet'], 0),
  ],
};

const l2bReading = {
  article:
    'The Hidden Cost of Fast Fashion\n\nA t-shirt that costs five euros cannot be cheap to make. Somewhere in its supply chain, someone else is paying the difference. Researchers at several European universities have traced fast fashion items back to textile workers in South Asia who earn less than two euros a day. Their working weeks often exceed sixty hours, and factory buildings in some regions still lack basic fire exits.\n\nThe environmental bill is equally heavy. Producing a single cotton t-shirt uses about 2,700 litres of water — enough for one person to drink for two and a half years. Synthetic fabrics such as polyester shed microplastic fibres in every wash, and wastewater treatment plants cannot fully filter them out. These fibres have now been found in fish, tap water, and even human blood.\n\nConsumers are beginning to respond. Second-hand clothing platforms have grown every year since 2019, and a survey of Turkish university students found that 41% now check a garment\'s origin label before buying. Some brands have introduced rental and repair programmes, arguing that a garment\'s value should be measured by how long it is worn rather than how often it is replaced. Policy makers are not waiting: the European Union has proposed a rule requiring brands to publish the carbon footprint of each item, and several countries have already taxed unsold clothing.\n\nTable note (as in the real exam): one column shows that production cost of a €5 t-shirt is roughly €1.20 for labour, €0.60 for fabric, and €0.40 for transport.',
  questions: [
    multipleChoice('q1', 'What does the text suggest about a €5 t-shirt?', ['It is genuinely cheap to make', 'Someone in the supply chain pays the difference', 'It costs €5 to produce', 'Its price is fair'], 1),
    multipleChoice('q2', 'How much water does a cotton t-shirt require, according to the text?', ['About 270 litres', 'About 2,700 litres', 'About 27,000 litres', 'About 27 litres'], 1),
    multipleChoice('q3', 'Where have microplastic fibres from synthetic fabrics been found?', ['Only in oceans', 'In fish, tap water, and human blood', 'Only in factory wastewater', 'Nowhere so far'], 1),
    multipleChoice('q4', 'According to the table note, what is the largest listed component of the €5 t-shirt\'s production cost?', ['Labour (€1.20)', 'Fabric (€0.60)', 'Transport (€0.40)', 'Marketing'], 0),
    multipleChoice('q5', 'What is one brand response mentioned in the text?', ['Lowering prices further', 'Rental and repair programmes that extend a garment\'s life', 'Stopping cotton use entirely', 'Selling only online'], 1),
  ],
};

const l2bNoteTaking = {
  transcript:
    'Good morning. Today\'s lecture is about the psychology of habits, and you will answer questions from your notes afterwards. Habits form through a three-step loop. Step one is the cue: a trigger in the environment, such as putting on running shoes or opening a laptop at the same desk. Step two is the routine: the behaviour itself, like a thirty-minute run or a study session. Step three is the reward: the feeling of accomplishment, which makes the brain want to repeat the loop. Research from University College London shows that a new habit takes, on average, sixty-six days to become automatic — not the twenty-one days that popular books claim. Two practical findings matter for students. First, changing the cue changes the habit: students who studied in the library instead of their dormitory reported stronger study habits within one month, even though their routines did not change. Second, stacking habits works: attaching a new habit to an existing one, such as reviewing flashcards right after breakfast, increases the chance of keeping it. Remember the loop — cue, routine, reward — and the two strategies: change the cue, and stack the habit.',
  questions: [
    multipleChoice('q1', 'What is the first step of the habit loop described in the lecture?', ['The cue', 'The routine', 'The reward', 'The outcome'], 0),
    multipleChoice('q2', 'According to the UCL research, how long does a new habit take on average?', ['Twenty-one days', 'Sixty-six days', 'One hundred days', 'Fourteen days'], 1),
    multipleChoice('q3', 'What did students who changed their study location report?', ['Weaker habits', 'Stronger study habits within one month', 'No change', 'More stress'], 1),
    multipleChoice('q4', 'What does habit stacking mean, according to the lecturer?', ['Repeating a habit many times daily', 'Attaching a new habit to an existing one', 'Practising several sports', 'Studying in groups'], 1),
    multipleChoice('q5', 'Which two strategies does the lecturer recommend, in order?', ['Change the cue, stack the habit', 'Stack the habit, remove rewards', 'Remove cues, increase rewards', 'Extend routines, ignore cues'], 0),
  ],
};

const l2bWriting = {
  id: 'w1',
  topic: 'Universities should require students to complete a semester abroad before graduating.',
  wordTarget: 220,
  helpers: ['personal growth and independence', 'language and career advantages', 'financial burden on families'],
  prompt: 'Write an essay of about 180-250 words supporting or opposing this proposal. Use the guidelines or your own arguments.',
};

const l2bSpeaking = {
  questions: [
    { id: 'sp1', type: 'speaking', q: 'Tell us about a subject you studied this year that surprised you. Why was it unexpected?', prepared: false },
    { id: 'sp2', type: 'speaking', q: 'Some students live in dormitories, others commute from home. Which do you think is better for a first-year student?', prepared: false },
    { id: 'sp3', type: 'speaking', q: 'Describe a time you had to work in a group. What did you learn from the experience?', prepared: false },
    { id: 'sp4', type: 'speaking', q: 'Is it better to specialise early in a narrow field or to study a broad range of subjects? Give your view.', prepared: false },
    { id: 'sp_prepared_l2b', type: 'speaking', q: 'In your opinion, what is the biggest challenge facing universities today, and how would you address it?', prepared: true },
  ],
};

const odtu2b = buildOdtuMock({
  id: 'offline-odtu-l2-2',
  name: 'ODTÜ-EPE Offline Mock — Level 2B',
  level: 'L2',
  listening: l2bListening,
  reading: l2bReading,
  noteTaking: l2bNoteTaking,
  writing: l2bWriting,
  speaking: l2bSpeaking,
});

const l2cListening = {
  transcript:
    'Welcome to the second session of the METU Economics of Education lecture series. Today: student loans and long-term earnings. Two facts frame the debate. Fact one: university graduates in Turkey earn, on average, about seventy percent more over their careers than high school graduates who enter the workforce directly. Fact two: students from low-income families are three times less likely to attend university than students from high-income families, even when their entrance exam scores are equal. The gap is not explained by ability — it is explained by financing. Three policy tools attempt to close it. The first is income-contingent loans: graduates repay only when their income passes a threshold, so a graduate who earns little pays little. The second is merit scholarships that cover tuition fully but are awarded by exam rank; they reward high scorers but do not reach students who underperform on exam day. The third is universal grants, funded by taxation, which reach everyone but cost the state heavily. Comparative evidence from Australia and England suggests income-contingent loans increase university attendance among low-income students more than grants of equal cost, because loans remove upfront payment without straining budgets. Questions follow these three tools.',
  questions: [
    multipleChoice('q1', 'How much more do graduates earn over their careers, on average, compared to high school graduates?', ['About thirty percent more', 'About seventy percent more', 'About ten percent more', 'The same'], 1),
    multipleChoice('q2', 'According to the lecturer, why do low-income students attend university less often?', ['Lower ability', 'Financing constraints, not ability', 'Less interest in studying', 'Fewer scholarships available only to them'], 1),
    multipleChoice('q3', 'What is an income-contingent loan?', ['A loan repaid only when income passes a threshold', 'A loan forgiven after ten years', 'A grant that needs no repayment', 'A loan with fixed monthly instalments'], 0),
    multipleChoice('q4', 'What does comparative evidence from Australia and England suggest?', ['Grants outperform loans', 'Income-contingent loans raise low-income attendance more than equal-cost grants', 'Neither policy works', 'Scholarships are the best tool'], 1),
    multipleChoice('q5', 'Which three policy tools does the lecturer compare?', ['Loans, scholarships, universal grants', 'Loans, taxes, subsidies', 'Grants, jobs, apprenticeships', 'Tuition cuts, loans, housing aid'], 0),
  ],
};

const l2cReading = {
  article:
    'Why Sleep Determines Academic Performance\n\nSleep researchers call sleep the brain\'s nightly filing clerk. During deep sleep, the hippocampus transfers the day\'s experiences into long-term storage in the cortex. During REM sleep, the brain links new memories to old ones — which is why a student who studies before sleeping often solves problems more easily the next morning.\n\nThe practical implications are uncomfortable for exam-season students. A controlled study of undergraduates found that those who slept six hours or less for a week performed, on average, eleven percent worse on subsequent tests than those who slept eight hours — even though both groups studied for the same number of hours. All-nighters made it worse: students who pulled an all-nighter before an exam scored no better than peers who had not studied at all.\n\nCaffeine complicates the picture. A moderate dose before a study session improves alertness for roughly four hours, but caffeine consumed after noon extends the time needed to fall asleep by an average of forty minutes, reducing total sleep. The result is a hidden trade-off: the extra evening study hour costs the following morning\'s memory consolidation.\n\nUniversities are acting on the evidence. Several US institutions have banned exams before nine a.m., and METU\'s own counselling office now includes a sleep-hygiene module in its academic skills workshop. Figure note (as in the real exam): test performance drops approximately 4% for every hour of sleep lost below eight.\n\nIn short, sleep is not time lost from studying; it is the mechanism that makes studying stick.',
  questions: [
    multipleChoice('q1', 'What role does deep sleep play, according to the text?', ['It clears the brain of all information', 'The hippocampus transfers experiences into long-term storage', 'It blocks new learning', 'It only helps physical recovery'], 1),
    multipleChoice('q2', 'What did the undergraduate study find?', ['Six-hours-or-less sleepers performed eleven percent worse', 'Sleep had no measurable effect', 'More sleep made students lazy', 'Only REM sleep mattered'], 0),
    multipleChoice('q3', 'What did all-nighters achieve, according to the text?', ['They doubled exam scores', 'They scored no better than peers who had not studied at all', 'They helped only in mathematics', 'They improved alertness all week'], 1),
    multipleChoice('q4', 'According to the figure note, how much does performance drop per hour of sleep lost below eight?', ['About four percent', 'About one percent', 'About eleven percent', 'About twenty percent'], 0),
    multipleChoice('q5', 'What is the text\'s overall conclusion about sleep?', ['Sleep is wasted time for serious students', 'Sleep is the mechanism that makes studying stick', 'Sleep matters only for athletes', 'Caffeine removes the need for sleep'], 1),
  ],
};

const l2cNoteTaking = {
  transcript:
    'This lecture covers three drivers of inflation, and you will answer six questions from your notes. Driver one is demand-pull inflation: when total spending in an economy grows faster than the economy can produce, prices are pulled upward. Think of an auction where ten bidders compete for one house — the price rises with the number of bidders. Driver two is cost-push inflation: when the cost of production rises — for example, oil prices double — firms pass those costs to consumers through higher prices. Driver three is expectations: if workers and firms expect prices to rise next year, workers demand higher wages today and firms raise prices in advance, making the expectation self-fulfilling. Central banks respond mainly with interest rates. Higher rates make borrowing expensive, which cools spending and weakens demand-pull pressure. The trade-off is well known: rates that are too high for too long push the economy into recession and raise unemployment. Remember the three drivers — demand-pull, cost-push, expectations — and the central bank tool: interest rates, used with a recession risk on the other side.',
  questions: [
    multipleChoice('q1', 'What is demand-pull inflation, according to the lecture?', ['Prices fall because demand drops', 'Prices rise when spending grows faster than production', 'Wages rise automatically', 'Oil prices double'], 1),
    multipleChoice('q2', 'Why does the lecturer use an auction analogy?', ['To explain cost-push inflation', 'To show that more bidders competing for limited goods push prices up', 'To describe central bank auctions', 'To criticise housing markets'], 1),
    multipleChoice('q3', 'What is cost-push inflation triggered by?', ['Rising production costs that firms pass to consumers', 'Consumer demand', 'Lower taxes', 'Higher interest rates'], 0),
    multipleChoice('q4', 'How do expectations create inflation, according to the lecturer?', ['Workers demand higher wages and firms raise prices in advance, self-fulfilling the expectation', 'Banks print more money', 'Expectations have no effect', 'Prices fall automatically'], 0),
    multipleChoice('q5', 'What is the main trade-off of raising interest rates too much?', ['Inflation accelerates', 'The economy may slip into recession and unemployment rises', 'Consumers spend more', 'Wages fall'], 1),
  ],
};

const l2cWriting = {
  id: 'w1',
  topic: 'Social media platforms should be legally required to remove content that spreads false scientific or medical information.',
  wordTarget: 220,
  helpers: ['public health protection', 'freedom of expression', 'who decides what is false'],
  prompt: 'Write an essay of about 180-250 words presenting a clear position. Support it with reasons and, where possible, examples.',
};

const l2cSpeaking = {
  questions: [
    { id: 'sp1', type: 'speaking', q: 'Tell us about a goal you set for yourself this year. How far have you progressed?', prepared: false },
    { id: 'sp2', type: 'speaking', q: 'Do you think university education should be entirely free, or should students contribute? Explain.', prepared: false },
    { id: 'sp3', type: 'speaking', q: 'Describe a moment when feedback from a teacher or mentor changed your approach to something.', prepared: false },
    { id: 'sp4', type: 'speaking', q: 'Cities are growing fast. What is the single most important thing city planners should prioritise?', prepared: false },
    { id: 'sp_prepared_l2c', type: 'speaking', q: 'In your opinion, what is the biggest challenge facing universities today, and how would you address it?', prepared: true },
  ],
};

const odtu2c = buildOdtuMock({
  id: 'offline-odtu-l2-3',
  name: 'ODTÜ-EPE Offline Mock — Level 2C',
  level: 'L2',
  listening: l2cListening,
  reading: l2cReading,
  noteTaking: l2cNoteTaking,
  writing: l2cWriting,
  speaking: l2cSpeaking,
});

const l2Listening = {
  transcript:
    'Good morning. Today\'s talk concerns urban transportation and a phenomenon called induced demand. Cities often respond to traffic congestion by adding lanes to highways. Intuitively, more lanes should mean faster commutes. Research from the 1990s onward tells a different story. When a highway gains capacity, driving becomes temporarily easier, so people who previously took public transit, carpooled, or travelled off-peak switch to the now-faster road. Within a few years, the new lanes fill up completely, and congestion returns to its former level. This cycle is induced demand. A second factor is land use: wider roads encourage sprawl, placing homes farther from workplaces, which generates even more vehicle trips. Counterexamples exist. Cities such as Copenhagen invested in bicycle infrastructure instead of new lanes; cycling now accounts for roughly a quarter of all trips there, and congestion grew more slowly than in comparable cities that expanded roads. The policy lesson is that lane expansion treats the symptom, not the cause.',
  questions: [
    multipleChoice('q1', 'What is the name of the phenomenon where new lanes quickly fill with traffic?', ["induced demand", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q2', 'What happens to commuters when a highway gains capacity?', ['They all switch to public transit', 'Some switch from transit and off-peak travel to the faster road', 'They stop driving', 'Nothing changes'], 1),
    multipleChoice('q3', 'What does the text say about wider roads and land use?', ['They reduce the distance between homes and workplaces', 'They encourage sprawl, placing homes farther from workplaces', 'They have no land-use effect', 'They increase public transit use'], 1),
    multipleChoice('q4', 'Roughly what share of trips in Copenhagen is made by bicycle?', ["a quarter", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q5', 'What is the policy lesson stated at the end?', ['Lane expansion treats the symptom, not the cause', 'More lanes always solve congestion', 'Cycling should be banned in cities', 'Sprawl is beneficial'], 0),
  ],
};

const l2Reading = {
  article:
    'The Economics of Free\n\n"Free" is the most powerful word in marketing, yet economists warn that nothing is truly free. When an app costs zero money, the user pays with something else: attention, personal data, or future lock-in. This is the attention economy. Platforms optimise content to maximise the time users spend scrolling, because advertising revenue grows with attention. Studies measuring screen time found that users who switched to ad-free versions of services spent thirty percent less time on them, suggesting that the paid and unpaid versions are, in effect, two different products.\n\nThe data trade is subtler. A service offered free collects usage patterns, location traces and social graphs. Individually these records seem harmless; aggregated across millions of users they become a valuable commercial asset. Regulators in Europe have responded with the General Data Protection Regulation, which requires explicit consent before personal data is collected. Enforcement remains uneven, and critics argue that consent banners have become a formality that users dismiss without reading.\n\nLock-in is the third hidden price. Free tools store your documents, contacts and history inside their ecosystem. Switching costs rise over time, so users tolerate worsening terms rather than leave. The economist\'s conclusion is not that free products are bad, but that their price is simply paid differently. Consumers who understand this make better choices: they compare total costs, not just the price tag.\n\nGraph note (as would appear in the real exam): a line chart shows average weekly screen time falling from 21 to 15 hours after switching to an ad-free service.',
  questions: [
    multipleChoice('q1', 'According to the text, what do users of free apps pay with?', ['Nothing, it is genuinely free', 'Attention, personal data, or future lock-in', 'Higher taxes', 'Credit card fees'], 1),
    multipleChoice('q2', 'What did the screen-time study find about ad-free versions?', ['Users spent thirty percent more time', 'Users spent thirty percent less time', 'Time did not change', 'Users abandoned the services'], 1),
    multipleChoice('q3', 'What does GDPR require before collecting personal data?', ['Explicit consent', 'A phone call confirmation', 'Payment of a fee', 'No requirement exists'], 0),
    multipleChoice('q4', 'According to the graph note, by how many hours did average weekly screen time fall after switching to the ad-free service?', ['Six hours (from 21 to 15)', 'Three hours', 'Ten hours', 'Screen time rose instead'], 0),
    multipleChoice('q5', 'What is the economist\'s conclusion about free products?', ['They are always harmful', 'Their price is simply paid differently', 'They should be banned', 'They benefit only companies'], 1),
  ],
};

const l2NoteTaking = {
  transcript:
    'Listen carefully, because you will answer questions from your notes after this talk. The topic is animal communication, specifically alarm calls. Researchers in the 1980s studied vervet monkeys in East Africa and discovered something remarkable: vervets produce different alarm calls for different predators. An eagle overhead triggers a short cough-like call; the monkeys respond by looking up and running into bushes. A snake on the ground triggers a chutter; the monkeys stand on their hind legs and look down. A leopard triggers a bark; the monkeys climb trees. So the calls are not general panic signals — they carry specific information about the threat type. Later experiments tested whether infants learn the meaning. Young monkeys initially gave the correct call but responded wrongly, for example standing up when they heard the snake call but failing to scan the ground. Their responses became accurate with age, indicating that call meaning is learned, not fully innate. A second finding: some meerkat studies suggest alarm calls may also serve to signal caller location to group members, a possible side benefit the caller gains. Questions follow.',
  questions: [
    multipleChoice('q1', 'What did researchers discover about vervet alarm calls?', ['All predators trigger the same call', 'Different predators trigger different specific calls', 'Vervets do not use alarm calls', 'Calls are random'], 1),
    multipleChoice('q2', 'How do vervets respond when they hear the eagle alarm call?', ["they look up and run into bushes", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q3', 'What did the infant vervet experiments show?', ['Call meaning is fully innate', 'Call meaning is learned with age', 'Infants never learn the calls', 'Infants give no calls'], 1),
    multipleChoice('q4', 'Besides warning others, what possible side benefit do meerkat alarm calls serve, according to the lecture?', ["signal caller location to group members", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q5', 'What does the passage suggest about vervet alarm calls in general?', ['They are general panic signals', 'They carry specific information about the threat type', 'They are decorative', 'Only adults hear them'], 1),
  ],
};

const l2Writing = {
  id: 'w1',
  topic: 'Social media platforms should be required to remove false information.',
  wordTarget: 220,
  helpers: ['freedom of expression concerns', 'harm caused by misinformation', 'who decides what is false'],
  prompt: 'Write an essay of about 180-250 words discussing this issue. Use the guidelines or your own ideas.',
};

const l2Speaking = {
  questions: [
    { id: 'sp1', type: 'speaking', q: 'Tell us about yourself and the academic path that led you here.', prepared: false },
    { id: 'sp2', type: 'speaking', q: 'What is the most important problem facing young people in your country today?', prepared: false },
    { id: 'sp3', type: 'speaking', q: 'Some people prefer working in teams; others prefer working alone. What is your preference and why?', prepared: false },
    { id: 'sp4', type: 'speaking', q: 'Describe a book, film, or project that changed the way you think about something.', prepared: false },
    { id: 'sp_prepared_l2', type: 'speaking', q: 'In your opinion, what is the biggest challenge facing universities today, and how would you address it?', prepared: true },
  ],
};

const odtu2 = buildOdtuMock({
  id: 'offline-odtu-l2-1',
  name: 'ODTÜ-EPE Offline Mock — Level 2',
  level: 'L2',
  listening: l2Listening,
  reading: l2Reading,
  noteTaking: l2NoteTaking,
  writing: l2Writing,
  speaking: l2Speaking,
});

/* ───────────────────── Level 3 — B2 (original set + sets 3C, 3D) ──────── */

const l3cListening = {
  transcript:
    'Welcome to the third session of the METU Economics of Education lecture series. Today: labour markets and automation. Three claims circulate in public debate, and we will assess each. Claim one: automation destroys jobs permanently. The historical record complicates this. When automated teller machines were introduced, bank teller employment did not collapse; it plateaued, because branches multiplied and tellers shifted to customer service roles. Claim two: this time is different because artificial intelligence replaces cognitive work, not just manual work. Here the evidence is genuinely newer: in a study of a large software company, developers using AI coding assistants completed tasks forty percent faster, and managers reported hiring fewer junior programmers for routine work. Claim three: wages will fall for middle-skill workers while rising for both the lowest and highest skills — the so-called hollowing out of the labour market. Data from the OECD broadly supports this: employment shares have grown at both tails of the skill distribution since 2000. Two policy responses dominate the discussion. Retraining programmes, such as Germany\'s vocational conversion subsidies, and wage insurance, which tops up the pay of displaced workers who re-enter at lower wages. Questions follow.',
  questions: [
    multipleChoice('q1', 'What happened to bank teller employment after automated teller machines were introduced?', ['It collapsed immediately', 'It plateaued, as tellers shifted to customer service', 'It doubled', 'It is not mentioned'], 1),
    multipleChoice('q2', 'What did the software company study find about AI coding assistants?', ['Developers completed tasks forty percent faster', 'Productivity fell', 'No change was measured', 'Senior developers were replaced'], 0),
    multipleChoice('q3', 'What does hollowing out of the labour market mean, according to the lecturer?', ['All jobs disappear', 'Employment grows at both skill tails while middle-skill wages fall', 'Only low-skill jobs remain', 'Only high-skill jobs remain'], 1),
    multipleChoice('q4', 'Since when has employment grown at both tails of the skill distribution, according to the OECD data?', ['Since 2000', 'Since 2010', 'Since 2020', 'Since 1990'], 0),
    multipleChoice('q5', 'Which two policy responses dominate the discussion?', ['Retraining programmes and wage insurance', 'Universal basic income and job bans', 'Tax cuts and immigration limits', 'Minimum wages and automation taxes'], 0),
  ],
};

const l3cReading = {
  article:
    'The Architecture of Attention\n\nAttention is often described as a spotlight, but a better metaphor is a currency. Every notification, headline, and autoplaying video spends it, and the spender is rarely you. In 2004, the average smartphone user checked their device a handful of times a day; today, research consortia report averages above ninety daily interactions, with a substantial share occurring within five minutes of waking.\n\nThe economic logic behind this is deliberate. Platforms maximise a metric called time-on-device, and the interface techniques that achieve it are now well documented. Infinite scroll removes the natural stopping cue that a page bottom once provided. Variable-ratio rewards — the unpredictable refresh of a feed — exploit the same psychological mechanism as a slot machine. Push notifications hijack the orienting reflex, the ancient attentional system that evolved to notice sudden changes in the environment.\n\nIndividual defences exist, but they fight an asymmetric battle. App timers are voluntary; the platform\'s engineering is not. Studies of digital-wellbeing tools report modest average effects: screen time falls by roughly thirty minutes daily in the first month, then regresses. Structural remedies are comparatively effective. France has banned work email outside office hours, and several schools have adopted phone-free classrooms; early evaluations link these policies to measurable improvements in self-reported concentration.\n\nThe deeper question is normative: if attention is a currency, who owns the mint? Regulators are beginning to treat interface design choices as consumer-protection issues, and the European Digital Services Act already requires large platforms to disclose their recommender logic. Table note (as in the real exam): daily interactions rose from about 10 in 2004 to about 96 in 2024.',
  questions: [
    multipleChoice('q1', 'Why does the author prefer the currency metaphor over the spotlight metaphor for attention?', ['Attention is bright', 'Every notification and headline spends attention, and the spender is rarely the user', 'Spotlights are outdated', 'The metaphor is decorative'], 1),
    multipleChoice('q2', 'According to the table note, how did daily device interactions change from 2004 to 2024?', ['They halved', 'They rose from about 10 to about 96', 'They stayed the same', 'They tripled to about 30'], 1),
    multipleChoice('q3', 'What psychological mechanism does variable-ratio reward exploit?', ['Classical conditioning only', 'The same mechanism as a slot machine', 'Language acquisition', 'Visual memory'], 1),
    multipleChoice('q4', 'What do studies of digital-wellbeing tools report?', ['Screen time falls about thirty minutes daily in the first month, then regresses', 'Permanent halving of screen time', 'No effect at all', 'Doubled productivity'], 0),
    multipleChoice('q5', 'What does the European Digital Services Act require of large platforms?', ['Deleting all recommenders', 'Disclosing their recommender logic', 'Banning notifications', 'Charging for attention'], 1),
  ],
};

const l3cNoteTaking = {
  transcript:
    'This lecture addresses memory consolidation during sleep, and your notes will be tested afterwards. Three systems cooperate. System one: slow-wave sleep in the first half of the night strengthens declarative memories — facts, dates, vocabulary — by replaying hippocampal activity to the cortex. System two: REM sleep in the second half favours procedural and emotional memories — skills, faces, the tone of an argument. This is why a schedule with both early and late study matters differently: vocabulary learned in the evening pairs with slow-wave consolidation that night, whereas a motor skill practised late pairs with the richer REM that follows. System three: synaptic downscaling. Overnight, the brain weakens connections that were not activated, which is why a day without new learning followed by a full night\'s sleep can improve retention of what was learned the day before. Two applied findings for students. Naps of twenty to thirty minutes boost alertness without deep sleep inertia; longer naps enter slow-wave sleep and leave you groggy. And crammed information decays faster than spaced repetitions: the forgetting curve drops roughly half the material within a day unless retrieval practice interrupts it. Remember the three systems — slow-wave declarative, REM procedural, synaptic downscaling — and the two applications: short naps, spaced retrieval.',
  questions: [
    multipleChoice('q1', 'Which sleep stage strengthens declarative memories such as vocabulary?', ['REM sleep', 'Slow-wave sleep in the first half of the night', 'Light sleep only', 'Napping'], 1),
    multipleChoice('q2', 'Why does the lecturer say evening vocabulary study is well timed?', ['Vocabulary pairs with slow-wave consolidation that night', 'It does not matter', 'Evening study prevents sleep', 'REM stores vocabulary'], 0),
    multipleChoice('q3', 'What is synaptic downscaling, according to the lecture?', ['Growing all connections', 'Weakening connections that were not activated overnight', 'Destroying memories entirely', 'A disease'], 1),
    multipleChoice('q4', 'Why do naps longer than thirty minutes leave students groggy?', ['They enter slow-wave sleep, causing sleep inertia', 'They are too short', 'They contain too much caffeine', 'The lecturer does not say'], 0),
    multipleChoice('q5', 'What does the forgetting curve finding suggest?', ['Cramming is optimal', 'Without retrieval practice, about half the material is lost within a day', 'Memory is permanent', 'Only athletes forget'], 1),
  ],
};

const l3cWriting = {
  id: 'w1',
  topic: 'Artificial intelligence tools should be permitted in university examinations, with appropriate safeguards.',
  wordTarget: 240,
  helpers: ['assessment of understanding vs. tool fluency', 'workplace readiness', 'academic integrity and cheating'],
  prompt: 'Write an essay of about 180-250 words arguing for or against this proposal. Use the guidelines or your own ideas, and state your position clearly.',
};

const l3cSpeaking = {
  questions: [
    { id: 'sp1', type: 'speaking', q: 'Describe a decision you made recently that you later reconsidered. What would you do differently?', prepared: false },
    { id: 'sp2', type: 'speaking', q: 'Some say remote work is the future; others say offices will return fully. Where do you stand?', prepared: false },
    { id: 'sp3', type: 'speaking', q: 'What role should universities play in preparing students for an AI-driven workplace?', prepared: false },
    { id: 'sp4', type: 'speaking', q: 'Describe a cultural tradition from your region that you think outsiders misunderstand. Explain it.', prepared: false },
    { id: 'sp_prepared_l3c', type: 'speaking', q: 'In your opinion, what is the biggest challenge facing universities today, and how would you address it?', prepared: true },
  ],
};

const odtu3c = buildOdtuMock({
  id: 'offline-odtu-l3-3',
  name: 'ODTÜ-EPE Offline Mock — Level 3C',
  level: 'L3',
  listening: l3cListening,
  reading: l3cReading,
  noteTaking: l3cNoteTaking,
  writing: l3cWriting,
  speaking: l3cSpeaking,
});

const l3dListening = {
  transcript:
    'Good afternoon. This lecture concerns public health communication, and you will answer questions from your notes. Three principles make health campaigns work, and three common mistakes make them fail. Principle one: specificity. A message such as walk thirty minutes a day, five days a week, outperforms exercise is good for you, because it tells the receiver exactly what to do and when. Principle two: messenger credibility. Community health workers delivering the message inside the target group outperform celebrity spokespeople for long-term behaviour change, because trust transfers from messenger to message. Principle three: loss framing in the right context. Research shows loss-framed messages, such as missing five screenings raises your risk, work better for detection behaviours like screening, whereas gain-framed messages, such as sunscreen keeps your skin healthy, work better for prevention behaviours like vaccination. Mistake one: fear appeals without efficacy. Telling people a danger is serious without telling them what to do produces anxiety, not action. Mistake two: information overload; more facts than people can process reduce recall of all of them. Mistake three: one-size-fits-all campaigns that ignore the audience\'s starting knowledge. Questions follow these six points.',
  questions: [
    multipleChoice('q1', 'Why does the lecturer prefer the specific message over the general one?', ['It is shorter', 'It tells the receiver exactly what to do and when', 'It is cheaper', 'It is scarier'], 1),
    multipleChoice('q2', 'Who outperforms celebrity spokespeople for long-term behaviour change?', ['Community health workers trusted within the target group', 'Politicians', 'Advertisers', 'No one outperforms them'], 0),
    multipleChoice('q3', 'Which framing works better for detection behaviours such as screening?', ['Loss-framed messages', 'Gain-framed messages', 'Humour', 'No framing matters'], 0),
    multipleChoice('q4', 'What does a fear appeal without efficacy produce, according to the lecturer?', ['Immediate action', 'Anxiety, not action', 'Vaccination', 'Nothing'], 1),
    multipleChoice('q5', 'Which three mistakes does the lecturer list?', ['Fear without efficacy, information overload, one-size-fits-all campaigns', 'Too little fear, too few facts, local targeting', 'Celebrity endorsements, specificity, framing', 'Trust, clarity, repetition'], 0),
  ],
};

const l3dReading = {
  article:
    'The Economics of Language\n\nDoes speaking English raise wages? Economists have studied this question for three decades, and the answer is yes — with important caveats. In a large survey of Turkish professionals, those who report working in English earn, on average, 20 to 30 percent more than similar colleagues who do not, after controlling for education, sector, and experience. The premium is not a reward for the language itself; it is a marker of exposure to international firms, management roles, and knowledge-intensive tasks where English is the working medium.\n\nThe caveats matter. First, self-reporting inflates the premium: people who say their English is fluent are more confident in salary negotiations, and confidence has an independent wage effect. Second, the premium is largest in services and smallest in agriculture and manufacturing, where production is local. Third, the benefit is asymmetric — the English speaker gains more than the counterpart loses, so national debates about English-medium instruction often conflate distribution with total productivity.\n\nPolicy follows the evidence unevenly. Universities that require English proficiency for graduation produce graduates with the premium; critics reply that the requirement excludes talented students from rural schools with weak English instruction, converting a productivity tool into a selection barrier. Some institutions have responded with bridge-year programmes that teach academic English intensively before the degree begins, and early data suggest these programmes recover much of the gap without lowering completion rates.\n\nGraph note (as in the real exam): the wage premium curve rises steeply from intermediate to advanced proficiency and flattens beyond it — the difference between B2 and C1 pays more than the difference between C1 and C2.',
  questions: [
    multipleChoice('q1', 'What is the reported wage premium for professionals working in English, after controls?', ['5 to 10 percent', '20 to 30 percent', '50 percent', 'No premium exists'], 1),
    multipleChoice('q2', 'According to the text, what does the premium actually mark?', ['A reward for the language itself', 'Exposure to international firms and knowledge-intensive tasks', 'Native-speaker status', 'Younger age'], 1),
    multipleChoice('q3', 'In which sectors is the premium smallest, according to the text?', ['Services and finance', 'Agriculture and manufacturing', 'Technology', 'Healthcare'], 1),
    multipleChoice('q4', 'According to the graph note, where does the wage curve rise most steeply?', ['Between A1 and A2', 'Between intermediate and advanced proficiency (B2 to C1)', 'Beyond C2', 'It is flat everywhere'], 1),
    multipleChoice('q5', 'What concern do critics raise about English proficiency requirements?', ['They are too cheap to enforce', 'They exclude talented rural students and become a selection barrier', 'They lower wages', 'They are unconstitutional'], 1),
  ],
};

const l3dNoteTaking = {
  transcript:
    'Today\'s lecture is about cognitive load theory and instructional design, and your notes will be graded in questions afterwards. The theory holds that working memory can hold only a few items at once — roughly four — while long-term memory is effectively unlimited. Three kinds of load compete for those four slots. Intrinsic load comes from the material itself: solving a differential equation is inherently heavier than reading a definition. Extraneous load comes from poor presentation: a diagram split across two pages forces the learner to hold one half in memory while reading the other, wasting capacity. Germane load is the productive kind: the effort spent actually building schemas, the organised knowledge structures that experts retrieve as single units. Two design rules follow. Rule one: integrate, do not separate — place labels inside diagrams rather than in a distant legend, eliminating split-attention. Rule two: remove redundancy — narrating a diagram while the identical text appears on screen doubles processing without adding information. The worked-example effect completes the picture: novices learn faster from step-by-step solved examples than from unsolved problems, because examples direct germane load toward schema construction. Experts, by contrast, benefit from problem solving, since examples become redundant for them. Remember the three loads — intrinsic, extraneous, germane — and the two rules: integrate, remove redundancy.',
  questions: [
    multipleChoice('q1', 'According to the lecturer, how many items can working memory hold at once?', ['About four', 'About forty', 'Unlimited', 'Exactly one'], 0),
    multipleChoice('q2', 'What creates extraneous load, in the lecturer\'s example?', ['Difficult mathematics', 'A diagram split across two pages', 'Schemas', 'Expertise'], 1),
    multipleChoice('q3', 'What is germane load, according to the theory?', ['Wasted effort', 'The productive effort spent building schemas', 'Intrinsic difficulty', 'Distraction'], 1),
    multipleChoice('q4', 'What does the worked-example effect show?', ['Novices learn faster from step-by-step solved examples than unsolved problems', 'Examples hinder all learners', 'Only experts learn from examples', 'Problems are always better'], 0),
    multipleChoice('q5', 'Which two design rules does the lecturer give, in order?', ['Integrate instead of separating, remove redundancy', 'Separate elements, add narration', 'Remove diagrams, add text', 'Increase load, repeat testing'], 0),
  ],
};

const l3dWriting = {
  id: 'w1',
  topic: 'The traditional university degree is losing relevance in a world of online certificates and skills-based hiring.',
  wordTarget: 240,
  helpers: ['signalling value of degrees', 'flexibility of online certificates', 'employer hiring practices'],
  prompt: 'Write an essay of about 180-250 words evaluating this claim. Present both sides before stating your own conclusion.',
};

const l3dSpeaking = {
  questions: [
    { id: 'sp1', type: 'speaking', q: 'Tell us about a skill you learned outside the classroom that has proven valuable.', prepared: false },
    { id: 'sp2', type: 'speaking', q: 'Should voting be compulsory? Present arguments from both sides before your conclusion.', prepared: false },
    { id: 'sp3', type: 'speaking', q: 'Describe a policy you would implement if you ran your university for one year.', prepared: false },
    { id: 'sp4', type: 'speaking', q: 'How do you think the concept of a career will change for your generation compared to your parents\'?', prepared: false },
    { id: 'sp_prepared_l3d', type: 'speaking', q: 'In your opinion, what is the biggest challenge facing universities today, and how would you address it?', prepared: true },
  ],
};

const odtu3d = buildOdtuMock({
  id: 'offline-odtu-l3-4',
  name: 'ODTÜ-EPE Offline Mock — Level 3D',
  level: 'L3',
  listening: l3dListening,
  reading: l3dReading,
  noteTaking: l3dNoteTaking,
  writing: l3dWriting,
  speaking: l3dSpeaking,
});

/* ────────────────────────────── Level 3 — B2 ─────────────────────────── */

const l3Listening = {
  transcript:
    'Welcome to this lecture on behavioural economics. Classical economics assumes people are rational maximisers of utility. Behavioural research repeatedly shows this assumption fails in predictable ways. Consider loss aversion: losses feel roughly twice as painful as equivalent gains feel pleasant. A person who loses one hundred lira experiences more emotional impact than the pleasure of gaining one hundred lira. This asymmetry explains phenomena such as the endowment effect — people demand more money to give up an object they own than they would pay to acquire the same object. A second principle is anchoring. When people estimate unknown quantities, their first piece of information, even if irrelevant, pulls the estimate toward it. In one famous experiment, participants who spun a rigged wheel landing on a high number subsequently gave higher estimates of the share of African nations in the UN than those whose wheel landed low. The third principle is present bias: people overweight immediate rewards. This is why retirement savings remain low even when workers know saving is rational. Understanding these three biases — loss aversion, anchoring and present bias — lets policymakers design better defaults, such as automatic enrollment in pension plans.',
  questions: [
    multipleChoice('q1', 'Losses feel roughly how many times as painful as equivalent gains feel pleasant?', ["twice", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q2', 'What is the name of the effect where owners demand more to give up an object than they would pay to buy it?', ["endowment effect", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q3', 'In the anchoring experiment, what did the rigged wheel influence participants to estimate?', ["the share of African nations in the UN", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q4', 'What is present bias?', ['Overweighting immediate rewards', 'Preferring long-term goals', 'Avoiding all risks', 'Ignoring money entirely'], 0),
    multipleChoice('q5', 'What policy design does the lecturer suggest against present bias?', ['Banning pensions', 'Automatic enrollment in pension plans', 'Higher taxes', 'Removing defaults'], 1),
  ],
};

const l3Reading = {
  article:
    'Cognitive Offloading and the Extended Mind\n\nWhen you set a phone reminder instead of memorising an appointment, you are performing cognitive offloading — transferring a mental operation to an external device. Philosophers Andy Clark and David Chalmers argued in 1998 that such tools are not mere aids but literal parts of the cognitive system, a position called the extended mind thesis. Their thought experiment compares Otto, a man with memory impairment who consults a notebook containing an address, with Inga, who recalls the same address from biological memory. If Inga\'s memory constitutes knowing, they argued, Otto\'s notebook plays the identical functional role and should be granted the same status.\n\nThe thesis remains controversial. Critics raise the coupling-constitution objection: just because a tool is tightly coupled to cognition does not mean it constitutes cognition. A calculator coupled to my arithmetic does not make the calculator part of my mind. Defenders reply that the notebook case survives this objection because the resource is reliably available, automatically endorsed and easily accessible — the three conditions of the parity principle.\n\nEmpirical work adds nuance. Studies of "save to remember" effects show that people recall less of information they believe will be stored externally, suggesting offloading reshapes memory priorities rather than simply weakening memory. Heavy reliance on navigation apps, meanwhile, correlates with reduced ability to form cognitive maps of cities. The practical upshot is that offloading is a trade-off: it frees capacity for higher-level thinking while quietly outsourcing the foundations that thinking stands on. Whether smartphones have crossed from aid to constitutive part of the mind is less a scientific question than a definitional one — but the trade-off is measurable, and worth managing deliberately.',
  questions: [
    multipleChoice('q1', 'What is the extended mind thesis?', ['Smartphones damage memory', 'External tools can be literal parts of the cognitive system', 'Memory is only biological', 'Notebooks replace brains'], 1),
    multipleChoice('q2', 'What is the coupling-constitution objection?', ['Tools cannot be coupled to cognition', 'Tight coupling to cognition does not mean the tool constitutes cognition', 'Offloading is impossible', 'Otto cannot use a notebook'], 1),
    multipleChoice('q3', 'What does the "save to remember" effect show?', ['People remember more when saving externally', 'People recall less of information they believe will be stored externally', 'External storage improves memory', 'Saving has no effect'], 1),
    multipleChoice('q4', 'What practical trade-off does the author identify about cognitive offloading?', ['It frees capacity for higher-level thinking while outsourcing the foundations of thinking', 'It makes memory permanently stronger', 'It eliminates the need for learning', 'It only helps children, not adults'], 0),
    multipleChoice('q5', 'According to the text, is the smartphone-as-mind question ultimately scientific or definitional?', ['Purely scientific', 'Definitional', 'Mathematical', 'Irrelevant'], 1),
  ],
};

const l3NoteTaking = {
  transcript:
    'This talk covers sleep and memory consolidation, and you will be tested on your notes afterwards. During sleep, the brain replays waking experiences. Two stages matter most. Slow-wave sleep, concentrated in the first half of the night, transfers new memories from the hippocampus to the neocortex, a process called systems consolidation. REM sleep, concentrated in the second half, is associated with integrating new memories with existing knowledge — creative recombination. An important consequence: napping mostly in the early afternoon after a night of poor sleep restores alertness but contributes little to consolidation, because the nap contains light sleep. A second key point concerns timing of learning. Studying difficult material in the evening, followed by a full night\'s sleep, produces better retention than studying the same material in the morning and staying awake all day, because the evening study enjoys consolidation during the coming night while the morning study suffers interference from the day. Finally, alcohol before bed suppresses REM sleep disproportionately; a person may sleep eight hours yet wake with weaker emotional memory processing. Note these three points: stage-specific roles, timing of learning relative to sleep, and alcohol\'s selective suppression of REM.',
  questions: [
    multipleChoice('q1', 'What is the process called when slow-wave sleep transfers memories from the hippocampus to the neocortex?', ["systems consolidation", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q2', 'What is REM sleep associated with, according to the lecture?', ['Transferring memories to the neocortex', 'Integrating new memories with existing knowledge', 'Physical recovery only', 'None of these'], 1),
    multipleChoice('q3', 'Why does the lecturer say evening study of difficult material beats morning study followed by a full day awake?', ['Evening study enjoys consolidation during the coming night', 'Morning study is illegal', 'Evening study is shorter', 'It does not matter'], 0),
    multipleChoice('q4', 'Which sleep stage does alcohol before bed suppress disproportionately?', ["REM sleep", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q5', 'What is said about early-afternoon naps after poor sleep?', ['They fully restore memory', 'They restore alertness but contribute little to consolidation', 'They harm memory', 'They replace night sleep'], 1),
  ],
};

const l3Writing = {
  id: 'w1',
  topic: 'Governments should prioritise investment in public transportation over private car infrastructure.',
  wordTarget: 250,
  helpers: ['environmental impact of cars', 'equity and access for low-income citizens', 'economic efficiency of mass transit'],
  prompt: 'Write an essay of about 180-250 words. Argue your position with reasons and examples. You may use the guidelines or your own.',
};

const l3Speaking = {
  questions: [
    { id: 'sp1', type: 'speaking', q: 'Introduce yourself briefly and explain what you hope to achieve at university.', prepared: false },
    { id: 'sp2', type: 'speaking', q: 'Do you think technology has made people more connected or more isolated? Support your view.', prepared: false },
    { id: 'sp3', type: 'speaking', q: 'If you could change one thing about the education system in your country, what would it be and why?', prepared: false },
    { id: 'sp4', type: 'speaking', q: 'Describe a time when you had to persuade someone. How did you approach it?', prepared: false },
    { id: 'sp_prepared_l3', type: 'speaking', q: 'In your opinion, what is the biggest challenge facing universities today, and how would you address it?', prepared: true },
  ],
};

const odtu3 = buildOdtuMock({
  id: 'offline-odtu-l3-1',
  name: 'ODTÜ-EPE Offline Mock — Level 3',
  level: 'L3',
  listening: l3Listening,
  reading: l3Reading,
  noteTaking: l3NoteTaking,
  writing: l3Writing,
  speaking: l3Speaking,
});

/* ────────────────────────────── Level 4 — C1 ─────────────────────────── */

const l4Listening = {
  transcript:
    'Today I address epistemic uncertainty in climate modelling, and I stress that uncertainty is not ignorance — it is a quantified feature of the models. Three categories deserve attention. First, scenario uncertainty: models project futures conditional on emissions pathways, and no model can know which pathway society will choose. This is why results are reported as scenario ensembles rather than single predictions. Second, structural uncertainty: models disagree about how to represent clouds, ocean mixing and ice-sheet dynamics. Even when fed identical forcings, models yield a spread of outcomes; this spread is informative — it bounds what we can confidently claim. Third, internal variability: the climate system fluctuates on decadal scales independent of forcing, so a ten-year plateau in warming does not falsify a centennial trend. The misreading of this third category produced the so-called hiatus debate. Two policy implications follow. One: decision frameworks under deep uncertainty, such as robust decision-making, prioritise strategies that perform acceptably across scenarios rather than optimally under one forecast. Two: communicating uncertainty honestly builds rather than erodes trust; the public can distinguish "we do not know the exact path" from "we know nothing." Remember the three categories — scenario, structural, internal variability — and the two policy implications.',
  questions: [
    multipleChoice('q1', 'According to the lecturer, what is uncertainty in climate modelling?', ["a quantified feature of the models", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q2', 'Why are model results reported as scenario ensembles?', ["no model can know which emissions pathway society will choose", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q3', 'What climate-system feature causes a ten-year plateau not to falsify a centennial trend?', ["internal variability", "None of the above", "It is not mentioned in the text", "The text states the opposite"], 0),
    multipleChoice('q4', 'What does robust decision-making prioritise?', ['Optimal performance under one forecast', 'Strategies performing acceptably across scenarios', 'Ignoring uncertainty', 'Single predictions'], 1),
    multipleChoice('q5', 'What does the lecturer claim about communicating uncertainty honestly?', ['It erodes trust', 'It builds rather than erodes trust', 'It confuses the public', 'It should be avoided'], 1),
  ],
};

const l4Reading = {
  article:
    'The Paradox of Tolerance\n\nKarl Popper articulated the paradox of tolerance in 1945: a society that is tolerant without limit will eventually see its tolerance seized or destroyed by the intolerant. Hence, he argued, a tolerant society must claim the right not to tolerate intolerance — not as a preference but as self-preservation. The argument is frequently misunderstood as a license to silence disagreeable views; Popper himself insisted that suppression is justified only when intolerance turns from speech into advocacy of violence and the undermining of democratic institutions.\n\nContemporary legal systems encode this line differently. European jurisdictions, remembering the mid-century collapse of democracy, criminalise hate speech and deny platform to organisations seeking to abolish the democratic order — Germany\'s militant democracy doctrine is the clearest example. The United States, by contrast, protects even virulent speech under the First Amendment, restricting only incitement to imminent lawless action. The divergence is not merely doctrinal; it reflects distinct historical priors about where democratic failure originates. Europeans emphasise organised anti-democratic movements; Americans emphasise state overreach against expression.\n\nPhilosophical objections to Popper abound. Some argue the paradox is verbal rather than real: tolerance, properly defined, is always conditional, so no paradox arises. Others contend that in pluralistic societies the greater danger is not organised intolerance but the gradual corrosion of epistemic standards by polarised discourse — a threat that suppression worsens rather than resolves. The debate, then, is less about whether limits exist than about where the threshold sits: advocacy of violence, institutional subversion, or mere offence. Each placement carries a different risk profile for the society that adopts it, and no empirical study can settle the normative question of where that line ought to be drawn.',
  questions: [
    multipleChoice('q1', 'What is Popper\'s core claim in the paradox of tolerance?', ['All views must be tolerated', 'A tolerant society must not tolerate intolerance as self-preservation', 'Tolerance is impossible', 'Intolerance should be rewarded'], 1),
    multipleChoice('q2', 'When did Popper say suppression is justified?', ['Against any disagreeable view', 'When intolerance turns into advocacy of violence and undermining democratic institutions', 'Never', 'Against all political speech'], 1),
    multipleChoice('q3', 'What distinguishes the German approach?', ['Absolute free speech', 'Militant democracy that denies platforms to anti-democratic organisations', 'No restrictions at all', 'Only religious limits'], 1),
    multipleChoice('q4', 'According to the text, what do Americans emphasise as the source of democratic failure?', ['Government overreach on speech', 'Too little government regulation', 'Corporate media control', 'Foreign interference'], 0),
    multipleChoice('q5', 'What is one philosophical objection to Popper mentioned in the text?', ['The paradox is verbal rather than real because tolerance is always conditional', 'Popper was wrong about violence', 'Tolerance does not exist', 'Speech cannot harm'], 0),
  ],
};

const l4NoteTaking = {
  transcript:
    'Final lecture segment: the replication crisis in psychology, tested through your notes. Three forces produced the crisis. One: publication bias — journals preferentially publish statistically significant findings, so the published literature overstates effect sizes; this is the file-drawer problem. Two: p-hacking — researchers, often innocently, try multiple analyses and report the one crossing the significance threshold, inflating false positives. Three: low statistical power — many studies used samples too small to detect the effects they claimed, making positive findings noisy and non-replicable. The corrective movement, registered reports, inverts the incentive: researchers submit hypotheses and methods for peer review BEFORE data collection, and journals commit to publishing regardless of outcome, removing the payoff for p-hacking and publication bias. A related lesson concerns pre-registration of analysis plans. Meta-analytic evidence after corrections typically shrinks effect sizes to a fraction of the original reports — not zero, but smaller. So the takeaway is threefold: the three forces (publication bias, p-hacking, low power), the structural fix (registered reports), and the empirical pattern (effect sizes shrink but rarely vanish after correction). Questions follow.',
  questions: [
    multipleChoice('q1', 'What is the name of the problem where journals preferentially publish significant findings?', ['Publication bias', 'Peer-review bias', 'Funding bias', 'Sampling bias'], 0),
    multipleChoice('q2', 'What practice involves trying multiple analyses and reporting the one that crosses the significance threshold?', ['P-hacking', 'Blinding', 'Randomisation', 'Power analysis'], 0),
    multipleChoice('q3', 'How do registered reports change researcher incentives?', ['They reward larger samples only', 'Journals commit to publishing regardless of outcome, removing the payoff for p-hacking', 'They ban null results', 'They require expensive equipment'], 1),
    multipleChoice('q4', 'What does meta-analytic evidence show about corrected effect sizes?', ['They vanish completely', 'They shrink to a fraction but rarely vanish', 'They grow larger', 'They double'], 1),
    multipleChoice('q5', 'Which three forces produced the replication crisis, in the lecturer\'s order?', ['Publication bias, p-hacking, low statistical power', 'Low statistical power, publication bias, p-hacking', 'P-hacking, fraud, publication bias', 'Fraud, low statistical power, media hype'], 0),
  ],
};

const l4Writing = {
  id: 'w1',
  topic: 'Academic freedom should permit researchers to investigate any question, regardless of potential social consequences.',
  wordTarget: 250,
  helpers: ['self-correcting nature of science', 'dual-use research risks', 'institutional review and societal trust'],
  prompt: 'Write an essay of about 180-250 words presenting a reasoned position. You may draw on the guidelines or introduce your own arguments.',
};

const l4Speaking = {
  questions: [
    { id: 'sp1', type: 'speaking', q: 'Introduce yourself and summarise the academic contribution you most hope to make.', prepared: false },
    { id: 'sp2', type: 'speaking', q: 'Some argue that higher education should be free; others say students should pay. What is your position?', prepared: false },
    { id: 'sp3', type: 'speaking', q: 'How should societies balance freedom of expression with the need to protect vulnerable groups?', prepared: false },
    { id: 'sp4', type: 'speaking', q: 'Describe a complex problem you solved. Walk us through your reasoning process.', prepared: false },
    { id: 'sp_prepared_l4', type: 'speaking', q: 'In your opinion, what is the biggest challenge facing universities today, and how would you address it?', prepared: true },
  ],
};

const odtu4 = buildOdtuMock({
  id: 'offline-odtu-l4-1',
  name: 'ODTÜ-EPE Offline Mock — Level 4',
  level: 'L4',
  listening: l4Listening,
  reading: l4Reading,
  noteTaking: l4NoteTaking,
  writing: l4Writing,
  speaking: l4Speaking,
});

/** The complete ODTÜ offline mock bank — expanded to multiple mocks at L2/L3. */
export const ODTU_OFFLINE_MOCKS = [odtu1, odtu2, odtu2b, odtu2c, odtu3, odtu3c, odtu3d, odtu4];
export function getOdtuMocks(level) {
  if (!level) return ODTU_OFFLINE_MOCKS;
  return ODTU_OFFLINE_MOCKS.filter((m) => m.meta.level === level);
}
