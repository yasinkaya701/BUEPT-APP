function cleanTopic(raw = '') {
  return String(raw || '')
    .replace(/^BUEPT:\s*/i, '')
    .replace(/^[A-C]\d\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const RULE_BANK = [
  {
    test: /\b(to be|am\/is\/are)\b/i,
    overview: 'Use the verb "be" to describe identity, job, location, age, and adjective-based states.',
    form: ['Affirmative: I am / you are / he-she-it is / we-they are', 'Negative: am not / is not / are not', 'Question: Am I ...? / Is she ...? / Are they ...?'],
    uses: ['after subjects before adjectives: She is ready', 'before noun complements: He is a student', 'for location/time information: We are in class'],
    traps: ['dropping the verb before an adjective or noun', 'using do/does with the verb be'],
    examples: [
      { wrong: 'She happy today.', correct: 'She is happy today.', note: 'Use "be" before an adjective.' },
      { wrong: 'Do he late?', correct: 'Is he late?', note: 'Questions with "be" invert the subject and verb.' },
    ],
    videoQuery: 'verb to be am is are grammar lesson',
  },
  {
    test: /\bpresent simple\b/i,
    overview: 'Present simple is used for routines, facts, habits, and scheduled events.',
    form: ['Base verb with I/you/we/they', 'Add -s/-es with he/she/it', 'Use do/does for questions and negatives'],
    uses: ['daily routines and repeated actions', 'facts and permanent situations', 'fixed timetables or schedules'],
    traps: ['forgetting the third-person singular -s', 'using present continuous for routines', 'wrong do/does support'],
    examples: [
      { wrong: 'She go to campus every day.', correct: 'She goes to campus every day.', note: 'Third-person singular needs -s.' },
      { wrong: 'He does studies hard.', correct: 'He studies hard.', note: 'Do/does is not used in affirmative statements.' },
    ],
    videoQuery: 'present simple grammar lesson',
  },
  {
    test: /\bpast simple\b/i,
    overview: 'Past simple reports completed actions at a definite time in the past.',
    form: ['Regular verbs take -ed', 'Irregular verbs change form: go -> went', 'Use did/did not for questions and negatives'],
    uses: ['finished actions yesterday/last week/in 2024', 'narrative sequence in stories and reports', 'specific completed past events'],
    traps: ['using past form after did', 'mixing present and past without a time reason'],
    examples: [
      { wrong: 'Did she went home?', correct: 'Did she go home?', note: 'Use base verb after did.' },
      { wrong: 'Last year he studies abroad.', correct: 'Last year he studied abroad.', note: 'Finished past action needs past simple.' },
    ],
    videoQuery: 'past simple grammar lesson',
  },
  {
    test: /\bpresent continuous\b/i,
    overview: 'Present continuous highlights actions happening now or temporary situations around now.',
    form: ['be + verb-ing', 'Negative: am/is/are not + verb-ing', 'Question: invert be and subject'],
    uses: ['actions in progress now', 'temporary projects or changing situations', 'planned near-future arrangements'],
    traps: ['forgetting the auxiliary be', 'using stative verbs unnecessarily in progressive form'],
    examples: [
      { wrong: 'They studying now.', correct: 'They are studying now.', note: 'Present continuous needs the auxiliary be.' },
      { wrong: 'I am knowing the answer.', correct: 'I know the answer.', note: 'Many stative verbs are not normally progressive.' },
    ],
    videoQuery: 'present continuous grammar lesson',
  },
  {
    test: /\bpresent perfect\b/i,
    overview: 'Present perfect connects a past action to the present result or experience.',
    form: ['have/has + past participle', 'Use "have" with I/you/we/they and "has" with he/she/it', 'Use ever, never, already, yet, just carefully'],
    uses: ['life experience', 'unfinished time periods', 'recent results relevant now'],
    traps: ['using a finished past time marker with present perfect', 'confusing past simple and present perfect'],
    examples: [
      { wrong: 'I have seen him yesterday.', correct: 'I saw him yesterday.', note: 'Finished time markers normally require past simple.' },
      { wrong: 'She has went home.', correct: 'She has gone home.', note: 'Use the past participle after have/has.' },
    ],
    videoQuery: 'present perfect grammar lesson',
  },
  {
    test: /\b(article|articles)\b/i,
    overview: 'Articles signal whether a noun is general, specific, countable, or already known.',
    form: ['a/an for singular countable nouns mentioned generally', 'the for specific/shared-reference nouns', 'zero article for many plural or uncountable general meanings'],
    uses: ['first mention vs known reference', 'generic academic nouns and institutions', 'countable vs uncountable noun control'],
    traps: ['missing article before singular count nouns', 'overusing "the" with general plural nouns'],
    examples: [
      { wrong: 'She bought book.', correct: 'She bought a book.', note: 'Singular countable nouns usually need an article.' },
      { wrong: 'The students need creativity.', correct: 'Students need creativity.', note: 'Use zero article for general plural reference.' },
    ],
    videoQuery: 'english articles a an the grammar lesson',
  },
  {
    test: /\b(preposition|prepositions|collocation|combination)\b/i,
    overview: 'Prepositions and collocations are tested as fixed patterns, not just individual meanings.',
    form: ['learn verb + preposition patterns', 'learn adjective + preposition patterns', 'learn noun + preposition patterns'],
    uses: ['fixed academic phrases', 'cause/effect and reason structures', 'time, place, and abstract relation signals'],
    traps: ['translating directly from Turkish', 'choosing a logical but non-native preposition'],
    examples: [
      { wrong: 'depend to technology', correct: 'depend on technology', note: 'Many verbs take fixed prepositions.' },
      { wrong: 'interested about science', correct: 'interested in science', note: 'Adjective-preposition combinations must be memorized as chunks.' },
    ],
    videoQuery: 'preposition combinations english grammar lesson',
  },
  {
    test: /\b(passive|passive voice)\b/i,
    overview: 'Passive voice moves attention from the doer to the action or result, which is common in academic English.',
    form: ['be + past participle', 'the tense is shown by the auxiliary be', 'agent is optional and often introduced with by'],
    uses: ['formal process descriptions', 'research or procedure writing', 'when the agent is unknown or less important'],
    traps: ['using active word order with passive meaning', 'forgetting to change the auxiliary for tense'],
    examples: [
      { wrong: 'The samples collected yesterday.', correct: 'The samples were collected yesterday.', note: 'Passive needs an auxiliary + past participle.' },
      { wrong: 'The report was wrote in class.', correct: 'The report was written in class.', note: 'Use the past participle, not the past simple form.' },
    ],
    videoQuery: 'passive voice grammar lesson',
  },
  {
    test: /\b(relative clause|relative clauses)\b/i,
    overview: 'Relative clauses add extra information about a noun and help compress ideas in academic writing.',
    form: ['use who/which/that/where/whose depending on the noun and function', 'defining clauses are essential; non-defining clauses need commas', 'reduced relative clauses omit the relative pronoun or be when possible'],
    uses: ['combining two related ideas into one sentence', 'adding precise noun information', 'writing dense academic descriptions'],
    traps: ['wrong relative pronoun choice', 'missing commas in non-defining clauses', 'reducing a clause when reduction is not possible'],
    examples: [
      { wrong: 'The student which won the prize is absent.', correct: 'The student who won the prize is absent.', note: 'Use who for people.' },
      { wrong: 'The data collected by the team was useful.', correct: 'The data collected by the team were useful.', note: 'Check agreement after clause reduction as well.' },
    ],
    videoQuery: 'relative clauses grammar lesson',
  },
  {
    test: /\b(conditionals|conditional|mixed conditionals)\b/i,
    overview: 'Conditionals link a condition to a result and are tested through tense relationships and meaning.',
    form: ['zero: present + present', 'first: present + will/base future result', 'second: past form + would', 'third/mixed: past perfect + would have / mixed time relationship'],
    uses: ['real vs unreal conditions', 'present hypotheses', 'regret, criticism, and consequence analysis'],
    traps: ['using will in the if-clause unnecessarily', 'mixing unreal and real tense logic'],
    examples: [
      { wrong: 'If she will study, she will pass.', correct: 'If she studies, she will pass.', note: 'First conditionals usually use present simple after if.' },
      { wrong: 'If I knew, I would have told you yesterday.', correct: 'If I had known, I would have told you yesterday.', note: 'Past unreal meaning needs past perfect in third conditional.' },
    ],
    videoQuery: 'mixed conditionals grammar lesson',
  },
  {
    test: /\b(modal|modals)\b/i,
    overview: 'Modals express ability, advice, possibility, deduction, obligation, and speculation.',
    form: ['modal + base verb', 'perfect modals: modal + have + past participle', 'no third-person -s after a modal'],
    uses: ['obligation and permission', 'possibility and probability', 'past criticism or speculation with perfect modals'],
    traps: ['adding to after central modals', 'using inflected verbs after modals', 'confusing certainty levels'],
    examples: [
      { wrong: 'She can to solve it.', correct: 'She can solve it.', note: 'Use the base verb after a modal.' },
      { wrong: 'They must have went early.', correct: 'They must have gone early.', note: 'Perfect modals take a past participle.' },
    ],
    videoQuery: 'advanced modals grammar lesson',
  },
  {
    test: /\b(gerund|infinitive)\b/i,
    overview: 'Gerund and infinitive patterns are tested as verb-complement choices and meaning differences.',
    form: ['verb + gerund', 'verb + infinitive', 'preposition + gerund'],
    uses: ['fixed verb patterns', 'purpose expressions with infinitives', 'nominal uses of verbs as subjects/objects'],
    traps: ['using infinitive after a preposition', 'changing meaning by choosing the wrong complement pattern'],
    examples: [
      { wrong: 'She is interested to learn more.', correct: 'She is interested in learning more.', note: 'Prepositions are followed by gerunds.' },
      { wrong: 'He suggested to leave early.', correct: 'He suggested leaving early.', note: 'Suggest is commonly followed by a gerund or a that-clause.' },
    ],
    videoQuery: 'gerund and infinitive grammar lesson',
  },
  {
    test: /\b(reported speech|reporting verbs)\b/i,
    overview: 'Reported speech requires accurate backshifting, pronoun change, and reporting-verb patterns.',
    form: ['reporting verb + clause/infinitive/gerund depending on the verb', 'shift tense when the reporting point moves to the past', 'adjust pronouns, time, and place words'],
    uses: ['summaries, interviews, and source integration', 'academic source reporting', 'formal paraphrase of statements and instructions'],
    traps: ['keeping the original tense without reason', 'using the wrong complement after a reporting verb'],
    examples: [
      { wrong: 'She said me that she was tired.', correct: 'She told me that she was tired.', note: 'Tell needs an object; say normally does not.' },
      { wrong: 'He suggested to study more.', correct: 'He suggested studying more.', note: 'Suggest is not usually followed by to-infinitive.' },
    ],
    videoQuery: 'reported speech grammar lesson',
  },
  {
    test: /\b(inversion|negative adverbials)\b/i,
    overview: 'Inversion creates emphasis and is common in formal written English, especially after negative or limiting expressions.',
    form: ['negative adverbial + auxiliary + subject + main verb', 'conditional inversion omits if: Had I known...', 'use do-support if no auxiliary is present'],
    uses: ['formal emphasis', 'advanced argumentative writing', 'high-level sentence variety'],
    traps: ['keeping normal word order after a negative fronted phrase', 'forgetting auxiliary support'],
    examples: [
      { wrong: 'Never I have seen such a result.', correct: 'Never have I seen such a result.', note: 'Invert the auxiliary and subject after negative adverbials.' },
      { wrong: 'Had I knew, I would act.', correct: 'Had I known, I would have acted.', note: 'Conditional inversion still requires the correct participle form.' },
    ],
    videoQuery: 'inversion negative adverbials grammar lesson',
  },
  {
    test: /\b(subjunctive)\b/i,
    overview: 'The subjunctive is used in formal recommendations, demands, and necessity structures.',
    form: ['that + subject + base verb', 'common triggers: recommend, suggest, insist, essential, important'],
    uses: ['formal institutional writing', 'recommendations and policy language', 'academic argumentation'],
    traps: ['adding -s or past tense after a subjunctive trigger', 'confusing subjunctive with normal indicative clauses'],
    examples: [
      { wrong: 'The professor suggested that he studies more.', correct: 'The professor suggested that he study more.', note: 'Subjunctive clauses use the base verb.' },
      { wrong: 'It is essential that every student is present.', correct: 'It is essential that every student be present.', note: 'Formal subjunctive uses base form "be".' },
    ],
    videoQuery: 'subjunctive mood grammar lesson',
  },
  {
    test: /\b(cleft|emphasis)\b/i,
    overview: 'Cleft and emphasis structures help writers foreground the most important part of a sentence.',
    form: ['It is/was + focus + that/who clause', 'What-clause + be + focus element', 'do/does/did can emphasize a main verb'],
    uses: ['argument emphasis', 'contrastive focus', 'more controlled formal expression'],
    traps: ['using a cleft sentence without real focus', 'creating an unbalanced sentence after the focus element'],
    examples: [
      { wrong: 'It was because of pressure that students fail.', correct: 'It is because of pressure that some students fail.', note: 'Keep tense and focus meaning consistent.' },
      { wrong: 'What students need are study regularly.', correct: 'What students need is regular study.', note: 'The focus element must match the structure.' },
    ],
    videoQuery: 'cleft sentences grammar lesson',
  },
  {
    test: /\b(noun clause|noun clauses|nominalization)\b/i,
    overview: 'Noun clauses and nominalization allow more compact academic writing by packaging ideas as noun units.',
    form: ['that-/whether-/wh-word clauses can function as subjects or objects', 'nominalization turns verbs/adjectives into nouns', 'keep agreement with the grammatical head of the sentence'],
    uses: ['formal summary writing', 'research reports and argument compression', 'impersonal academic tone'],
    traps: ['unclear clause boundaries', 'awkward over-nominalization', 'agreement problems with long subjects'],
    examples: [
      { wrong: 'What students need are more support.', correct: 'What students need is more support.', note: 'The whole clause acts as a singular subject.' },
      { wrong: 'The analyze of data was careful.', correct: 'The analysis of the data was careful.', note: 'Choose the correct noun form in nominalization.' },
    ],
    videoQuery: 'noun clauses and nominalization grammar lesson',
  },
  {
    test: /\b(transition|flow)\b/i,
    overview: 'Academic transitions guide the reader through contrast, addition, result, exemplification, and conclusion.',
    form: ['match each connector to its logic', 'punctuate sentence adverbs correctly', 'avoid repeating one connector too often'],
    uses: ['building coherence between sentences and paragraphs', 'signalling argument structure', 'guiding the reader through complex ideas'],
    traps: ['using a connector with the wrong logic', 'overusing however/therefore', 'missing punctuation after sentence adverbs'],
    examples: [
      { wrong: 'However, students need support because the system is strict. Therefore, many still succeed.', correct: 'However, students need support because the system is strict. Nevertheless, many still succeed.', note: 'Choose the connector that matches the logic.' },
      { wrong: 'For example many students struggle.', correct: 'For example, many students struggle.', note: 'Sentence adverbs often need a comma.' },
    ],
    videoQuery: 'academic transitions coherence grammar lesson',
  },
];

function getRuleConfig(topic = '') {
  const match = RULE_BANK.find((item) => item.test.test(topic));
  if (match) return match;
  return {
    overview: `This grammar topic targets "${topic}" and checks whether you can select the correct form from context, grammar clues, and meaning.`,
    form: ['identify the grammatical trigger around the gap', 'check tense, agreement, article, or preposition clues', 'eliminate options that are formally impossible'],
    uses: ['answer based on sentence function, not guesswork', 'connect the rule to discourse meaning', 'watch academic register and fixed patterns'],
    traps: ['choosing an option because it "sounds" right without checking form', 'ignoring nearby clue words such as time markers or prepositions'],
    examples: [
      { wrong: `Use a guessy answer for ${topic}.`, correct: `Use the option that matches the exact grammar pattern in ${topic}.`, note: 'BUEPT items reward rule-based elimination.' },
    ],
    videoQuery: `${topic} english grammar lesson`,
  };
}

export function buildGrammarLessonPack(task = {}) {
  const title = String(task?.title || '').trim();
  const level = String(task?.level || '').trim() || 'P2';
  const topic = cleanTopic(title) || 'Grammar Focus';
  const rawExplanation = String(task?.explanation || task?.explain || '').trim();
  const rule = getRuleConfig(topic);

  const overview = rawExplanation || rule.overview;
  const segments = [
    `Topic Focus: ${topic}`,
    'Overview',
    overview,
    'Key Form',
    ...rule.form.map((item) => `- ${item}`),
    'When It Is Used',
    ...rule.uses.map((item) => `- ${item}`),
    'Common Exam Traps',
    ...rule.traps.map((item) => `- ${item}`),
    'BUEPT Move',
    `At ${level} level, first identify the grammar family, then check the exact clue word or structure before choosing an option.`,
  ];

  const flashcards = [...rule.form, ...rule.uses, ...rule.traps]
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 6);

  return {
    topic,
    rawExplanation: overview,
    segments,
    flashcards,
    examples: Array.isArray(task?.examples) && task.examples.length ? task.examples : rule.examples,
    videoTitle: `${topic} video lesson`,
    videoUrl: task.videoUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic} english grammar lesson`)}`,
  };
}
