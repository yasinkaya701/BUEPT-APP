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

/* ────────────────────────────── Level 2 — B1+ ─────────────────────────── */

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

/** The complete ODTÜ offline mock bank, one METU-format mock per level. */
export const ODTU_OFFLINE_MOCKS = [odtu1, odtu2, odtu3, odtu4];
export function getOdtuMocks(level) {
  if (!level) return ODTU_OFFLINE_MOCKS;
  return ODTU_OFFLINE_MOCKS.filter((m) => m.meta.level === level);
}
