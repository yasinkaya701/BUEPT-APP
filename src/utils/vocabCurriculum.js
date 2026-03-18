import { getWordEntry } from './dictionary';

const LEVEL_RANK = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

function shuffleWithSeed(list = [], seed = 1) {
  const out = Array.isArray(list) ? [...list] : [];
  let state = Math.max(1, Number(seed) || 1);
  for (let i = out.length - 1; i > 0; i -= 1) {
    state = (state * 1103515245 + 12345) % 2147483647;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function uniq(list = []) {
  return Array.from(new Set((Array.isArray(list) ? list : []).filter(Boolean)));
}

function getLevelRank(level = '') {
  return LEVEL_RANK[String(level || '').toUpperCase()] || 0;
}

function getLevelDistance(a = '', b = '') {
  return Math.abs(getLevelRank(a) - getLevelRank(b));
}

function splitPromptFrame(prompt = '') {
  const source = String(prompt || '').replace(/\s+/g, ' ').trim();
  if (!source) return { before: '', after: '' };
  const parts = source.split('_____');
  if (parts.length < 2) return { before: source, after: '' };
  return {
    before: String(parts[0] || '').trim(),
    after: String(parts.slice(1).join('_____') || '').trim(),
  };
}

function inferAnswerForm(answer = '', familyOptions = []) {
  const value = String(answer || '').trim().toLowerCase();
  if (!value) return 'word form';
  const family = Array.isArray(familyOptions) ? familyOptions.map((item) => String(item || '').trim().toLowerCase()) : [];
  if (value.endsWith('ly')) return 'adverb';
  if (value.endsWith('tion') || value.endsWith('sion') || value.endsWith('ment') || value.endsWith('ness') || value.endsWith('ity')) return 'noun';
  if (value.endsWith('ive') || value.endsWith('al') || value.endsWith('ous') || value.endsWith('able') || value.endsWith('ible') || value.endsWith('ed')) return 'adjective';
  if (family.includes(value) && family.some((item) => item !== value && item.startsWith(value))) return 'base form';
  if (value.endsWith('ize') || value.endsWith('ise') || value.endsWith('fy') || value.endsWith('en')) return 'verb';
  return 'word form';
}

function buildFormationQuestion(item, seed = 1) {
  const frame = splitPromptFrame(item.formationPrompt);
  return {
    id: `${item.id}-formation-${seed}`,
    type: 'Word Formation',
    skill: 'word_formation',
    format: 'input',
    target: item.word,
    level: item.level,
    prompt: `${item.formationPrompt}\nBase word: ${item.word}`,
    answer: item.formationAnswer,
    acceptedAnswers: uniq([item.formationAnswer]),
    placeholder: 'Type the correct form',
    helper: `Use the base word "${item.word}" in the correct form.`,
    instruction: 'Complete the sentence with the correct form of the base word.',
    promptFrame: frame,
    cueLabel: 'Base word',
    cueValue: item.word,
    secondaryCueLabel: 'Meaning',
    secondaryCueValue: item.definition,
    answerForm: inferAnswerForm(item.formationAnswer, item.familyOptions),
    explanation: item.formationHint,
    notebook: {
      word: item.word,
      definition: item.definition,
      level: item.level,
      family: item.familyOptions,
      collocation: item.collocationPhrase,
    },
  };
}

function buildCollocationQuestion(item, seed = 1) {
  const frame = splitPromptFrame(item.collocationPrompt);
  return {
    id: `${item.id}-collocation-${seed}`,
    type: 'Collocation Completion',
    skill: 'collocation',
    format: 'input',
    target: item.word,
    level: item.level,
    prompt: item.collocationPrompt,
    answer: item.collocationAnswer,
    acceptedAnswers: uniq([item.collocationAnswer]),
    placeholder: 'Type the missing collocation',
    helper: `Fixed phrase target: ${item.word}`,
    instruction: 'Complete the sentence with the exact missing collocation.',
    promptFrame: frame,
    cueLabel: 'Anchor word',
    cueValue: item.word,
    secondaryCueLabel: 'Phrase pattern',
    secondaryCueValue: item.collocationPhrase.replace(item.collocationAnswer, '_____'),
    explanation: `Strong collocation: ${item.collocationPhrase}.`,
    notebook: {
      word: item.word,
      definition: item.definition,
      level: item.level,
      family: item.familyOptions,
      collocation: item.collocationPhrase,
    },
  };
}

const BASE_WORD_BANK = [
  {
    id: 'help',
    word: 'help',
    level: 'A1',
    definition: 'support that makes a task easier',
    example: 'The teacher gave extra help before the quiz.',
    familyOptions: ['help', 'helpful', 'helpless', 'helpfully'],
    formationAnswer: 'help',
    formationPrompt: 'Students can ask for extra _____ after class.',
    formationHint: 'After "extra" we need the noun form: help.',
    collocationAnswer: 'ask for',
    collocationOptions: ['ask for', 'draw', 'raise', 'deliver'],
    collocationPrompt: 'If you do not understand the task, you should _____ help.',
    collocationPhrase: 'ask for help',
  },
  {
    id: 'care',
    word: 'care',
    level: 'A1',
    definition: 'attention and effort to do something well',
    example: 'She completed the assignment with great care.',
    familyOptions: ['care', 'careful', 'careless', 'carefully'],
    formationAnswer: 'care',
    formationPrompt: 'Good writing needs time and _____.',
    formationHint: 'The sentence needs a noun after "and": care.',
    collocationAnswer: 'take',
    collocationOptions: ['take', 'make', 'build', 'carry'],
    collocationPrompt: 'Please _____ care when you copy the answers.',
    collocationPhrase: 'take care',
  },
  {
    id: 'success',
    word: 'success',
    level: 'A1',
    definition: 'a good result after effort',
    example: 'Daily revision often leads to success in exams.',
    familyOptions: ['succeed', 'success', 'successful', 'successfully'],
    formationAnswer: 'success',
    formationPrompt: 'Regular practice is the key to exam _____.',
    formationHint: 'After "to" in this phrase, the noun form is needed: success.',
    collocationAnswer: 'achieve',
    collocationOptions: ['achieve', 'collect', 'follow', 'raise'],
    collocationPrompt: 'Students can _____ success with a clear study plan.',
    collocationPhrase: 'achieve success',
  },
  {
    id: 'difference',
    word: 'difference',
    level: 'A1',
    definition: 'a way in which two things are not the same',
    example: 'The tutor explained the difference between summary and opinion.',
    familyOptions: ['differ', 'difference', 'different', 'differently'],
    formationAnswer: 'difference',
    formationPrompt: 'Can you explain the main _____ between these two ideas?',
    formationHint: 'The noun form fits after "main": difference.',
    collocationAnswer: 'make',
    collocationOptions: ['make', 'draw', 'pay', 'fix'],
    collocationPrompt: 'One strong paragraph can _____ a big difference.',
    collocationPhrase: 'make a difference',
  },
  {
    id: 'interest',
    word: 'interest',
    level: 'A1',
    definition: 'a feeling of wanting to know more about something',
    example: 'Her interest in English podcasts grew this term.',
    familyOptions: ['interest', 'interested', 'interesting', 'interestingly'],
    formationAnswer: 'interest',
    formationPrompt: 'The course increased my _____ in academic reading.',
    formationHint: 'After "my" we need the noun form: interest.',
    collocationAnswer: 'show',
    collocationOptions: ['show', 'catch', 'draw', 'set'],
    collocationPrompt: 'During the interview, students should _____ interest in the topic.',
    collocationPhrase: 'show interest',
  },
  {
    id: 'prepare',
    word: 'prepare',
    level: 'A1',
    definition: 'to get ready for a task or event',
    example: 'Students should prepare their notes before class.',
    familyOptions: ['prepare', 'preparation', 'prepared', 'unprepared'],
    formationAnswer: 'preparation',
    formationPrompt: 'Good _____ reduces stress before an exam.',
    formationHint: 'The sentence needs a noun subject: preparation.',
    collocationAnswer: 'prepare',
    collocationOptions: ['prepare', 'borrow', 'invent', 'delay'],
    collocationPrompt: 'Try to _____ notes before the lecture starts.',
    collocationPhrase: 'prepare notes',
  },
  {
    id: 'decide',
    word: 'decide',
    level: 'A2',
    definition: 'to choose after thinking carefully',
    example: 'We must decide on a topic by Friday.',
    familyOptions: ['decide', 'decision', 'decisive', 'decisively'],
    formationAnswer: 'decision',
    formationPrompt: 'The final _____ will be announced tomorrow.',
    formationHint: 'After "final" we need the noun form: decision.',
    collocationAnswer: 'make',
    collocationOptions: ['make', 'do', 'bring', 'hold'],
    collocationPrompt: 'The group must _____ a decision before the deadline.',
    collocationPhrase: 'make a decision',
  },
  {
    id: 'explain',
    word: 'explain',
    level: 'A2',
    definition: 'to make an idea clear',
    example: 'Can you explain the graph in one short sentence?',
    familyOptions: ['explain', 'explanation', 'explanatory', 'unexplained'],
    formationAnswer: 'explanation',
    formationPrompt: 'The teacher asked for a short _____ of the chart.',
    formationHint: 'After "a short" we need the noun form: explanation.',
    collocationAnswer: 'give',
    collocationOptions: ['give', 'draw', 'collect', 'place'],
    collocationPrompt: 'Please _____ an explanation for your answer.',
    collocationPhrase: 'give an explanation',
  },
  {
    id: 'compare',
    word: 'compare',
    level: 'A2',
    definition: 'to examine how two things are similar or different',
    example: 'The essay compares online study with classroom learning.',
    familyOptions: ['compare', 'comparison', 'comparative', 'comparatively'],
    formationAnswer: 'comparison',
    formationPrompt: 'A clear _____ helps readers see key similarities.',
    formationHint: 'The noun form is needed after the article: comparison.',
    collocationAnswer: 'make',
    collocationOptions: ['make', 'draw', 'take', 'carry'],
    collocationPrompt: 'It is easier to _____ a comparison with a table.',
    collocationPhrase: 'make a comparison',
  },
  {
    id: 'improve',
    word: 'improve',
    level: 'A2',
    definition: 'to become better or make something better',
    example: 'Weekly speaking practice can improve fluency.',
    familyOptions: ['improve', 'improvement', 'improved', 'improving'],
    formationAnswer: 'improvement',
    formationPrompt: 'There was a clear _____ in her writing score.',
    formationHint: 'After "a clear" we need the noun form: improvement.',
    collocationAnswer: 'show',
    collocationOptions: ['show', 'catch', 'raise', 'submit'],
    collocationPrompt: 'The report should _____ improvement over time.',
    collocationPhrase: 'show improvement',
  },
  {
    id: 'respond',
    word: 'respond',
    level: 'A2',
    definition: 'to answer or react to something',
    example: 'Good candidates respond calmly to difficult questions.',
    familyOptions: ['respond', 'response', 'responsive', 'unresponsive'],
    formationAnswer: 'response',
    formationPrompt: 'Please write a short _____ to the email.',
    formationHint: 'A noun is needed after "short": response.',
    collocationAnswer: 'give',
    collocationOptions: ['give', 'make', 'hold', 'play'],
    collocationPrompt: 'Students should _____ a clear response to the prompt.',
    collocationPhrase: 'give a response',
  },
  {
    id: 'discuss',
    word: 'discuss',
    level: 'A2',
    definition: 'to talk about something in detail',
    example: 'The class discussed the advantages of group work.',
    familyOptions: ['discuss', 'discussion', 'discussed', 'undiscussed'],
    formationAnswer: 'discussion',
    formationPrompt: 'The article starts with a brief _____ of the issue.',
    formationHint: 'After "a brief" we need the noun form: discussion.',
    collocationAnswer: 'hold',
    collocationOptions: ['hold', 'make', 'draw', 'collect'],
    collocationPrompt: 'The tutor will _____ a discussion after the reading task.',
    collocationPhrase: 'hold a discussion',
  },
  {
    id: 'reason',
    word: 'reason',
    level: 'B1',
    definition: 'the cause that explains why something happens',
    example: 'There is a clear reason for the low score.',
    familyOptions: ['reason', 'reasonable', 'unreasonable', 'reasonably'],
    formationAnswer: 'reasonable',
    formationPrompt: 'The student gave a _____ answer supported by examples.',
    formationHint: 'We need an adjective before "answer": reasonable.',
    collocationAnswer: 'give',
    collocationOptions: ['give', 'build', 'spend', 'protect'],
    collocationPrompt: 'Writers should _____ a reason for each claim.',
    collocationPhrase: 'give a reason',
  },
  {
    id: 'effect',
    word: 'effect',
    level: 'B1',
    definition: 'a result that is produced by a cause',
    example: 'Sleep has a strong effect on concentration.',
    familyOptions: ['effect', 'effective', 'ineffective', 'effectively'],
    formationAnswer: 'effective',
    formationPrompt: 'The most _____ study routine is also the simplest one.',
    formationHint: 'An adjective is needed before "study routine": effective.',
    collocationAnswer: 'have',
    collocationOptions: ['have', 'do', 'set', 'take'],
    collocationPrompt: 'Lack of sleep can _____ a negative effect on memory.',
    collocationPhrase: 'have an effect on',
  },
  {
    id: 'solution',
    word: 'solution',
    level: 'B1',
    definition: 'an answer to a problem',
    example: 'The team found a practical solution to the timetable problem.',
    familyOptions: ['solve', 'solution', 'solvable', 'unsolved'],
    formationAnswer: 'solution',
    formationPrompt: 'We need a realistic _____ before the meeting ends.',
    formationHint: 'A noun is required after "realistic": solution.',
    collocationAnswer: 'find',
    collocationOptions: ['find', 'build', 'grow', 'keep'],
    collocationPrompt: 'The group should _____ a solution to the problem.',
    collocationPhrase: 'find a solution',
  },
  {
    id: 'evidence',
    word: 'evidence',
    level: 'B1',
    definition: 'facts or examples that support an idea',
    example: 'The writer used evidence from two sources.',
    familyOptions: ['evidence', 'evident', 'evidently', 'unevidenced'],
    formationAnswer: 'evident',
    formationPrompt: 'It became _____ that the first answer was wrong.',
    formationHint: 'After "became" we need an adjective: evident.',
    collocationAnswer: 'provide',
    collocationOptions: ['provide', 'paint', 'receive', 'hide'],
    collocationPrompt: 'Good examples can _____ evidence for the main point.',
    collocationPhrase: 'provide evidence',
  },
  {
    id: 'focus',
    word: 'focus',
    level: 'B1',
    definition: 'special attention given to one main point',
    example: 'The report keeps a strong focus on student needs.',
    familyOptions: ['focus', 'focused', 'unfocused', 'focusing'],
    formationAnswer: 'focused',
    formationPrompt: 'A _____ paragraph is easier to follow.',
    formationHint: 'An adjective is needed before "paragraph": focused.',
    collocationAnswer: 'keep',
    collocationOptions: ['keep', 'draw', 'borrow', 'list'],
    collocationPrompt: 'Try to _____ your focus on the main argument.',
    collocationPhrase: 'keep focus',
  },
  {
    id: 'summary',
    word: 'summary',
    level: 'B1',
    definition: 'a short version of the main ideas',
    example: 'His summary of the lecture was accurate and clear.',
    familyOptions: ['summarize', 'summary', 'summarized', 'summarizing'],
    formationAnswer: 'summary',
    formationPrompt: 'Write a short _____ of the article in two sentences.',
    formationHint: 'The noun form fits after "a short": summary.',
    collocationAnswer: 'write',
    collocationOptions: ['write', 'take', 'show', 'hold'],
    collocationPrompt: 'Students should _____ a summary after each reading task.',
    collocationPhrase: 'write a summary',
  },
  {
    id: 'argue',
    word: 'argue',
    level: 'B1',
    definition: 'to present reasons that support a claim',
    example: 'The essay argues that attendance should be mandatory.',
    familyOptions: ['argue', 'argument', 'argumentative', 'arguably'],
    formationAnswer: 'argument',
    formationPrompt: 'The second paragraph presents the main _____.',
    formationHint: 'A noun is needed after "main": argument.',
    collocationAnswer: 'support',
    collocationOptions: ['support', 'raise', 'join', 'hold'],
    collocationPrompt: 'Each example should _____ the central argument.',
    collocationPhrase: 'support an argument',
  },
  {
    id: 'target',
    word: 'target',
    level: 'B1',
    definition: 'a goal that you want to reach',
    example: 'The student set a weekly target for reading practice.',
    familyOptions: ['target', 'targeted', 'untargeted', 'targeting'],
    formationAnswer: 'target',
    formationPrompt: 'Set one realistic study _____ for this week.',
    formationHint: 'The blank needs a noun after "study": target.',
    collocationAnswer: 'set',
    collocationOptions: ['set', 'draw', 'carry', 'predict'],
    collocationPrompt: 'Learners should _____ a target before starting revision.',
    collocationPhrase: 'set a target',
  },
  {
    id: 'analyze',
    word: 'analyze',
    level: 'B2',
    definition: 'to examine something carefully and in detail',
    example: 'Researchers analyze the results before drawing conclusions.',
    familyOptions: ['analyze', 'analysis', 'analytical', 'analytically'],
    formationAnswer: 'analysis',
    formationPrompt: 'The report begins with a careful _____ of the data.',
    formationHint: 'After "a careful" we need the noun form: analysis.',
    collocationAnswer: 'conduct',
    collocationOptions: ['conduct', 'take', 'draw', 'lift'],
    collocationPrompt: 'Students must _____ an analysis of the graph.',
    collocationPhrase: 'conduct an analysis',
  },
  {
    id: 'assess',
    word: 'assess',
    level: 'B2',
    definition: 'to evaluate the quality or importance of something',
    example: 'The committee assessed each proposal carefully.',
    familyOptions: ['assess', 'assessment', 'reassess', 'assessed'],
    formationAnswer: 'assessment',
    formationPrompt: 'The speaking test includes a formal _____ stage.',
    formationHint: 'The blank needs the noun form: assessment.',
    collocationAnswer: 'carry out',
    collocationOptions: ['carry out', 'make up', 'look after', 'turn over'],
    collocationPrompt: 'Teachers _____ an assessment at the end of the unit.',
    collocationPhrase: 'carry out an assessment',
  },
  {
    id: 'method',
    word: 'method',
    level: 'B2',
    definition: 'a system or way of doing something',
    example: 'This method saves time during note-taking.',
    familyOptions: ['method', 'methodical', 'methodically', 'unmethodical'],
    formationAnswer: 'methodical',
    formationPrompt: 'A _____ learner usually keeps clear records.',
    formationHint: 'An adjective is needed before "learner": methodical.',
    collocationAnswer: 'use',
    collocationOptions: ['use', 'draw', 'solve', 'arrive'],
    collocationPrompt: 'Good students _____ a method that matches the task.',
    collocationPhrase: 'use a method',
  },
  {
    id: 'research',
    word: 'research',
    level: 'B2',
    definition: 'careful study done to discover new information',
    example: 'The article summarizes recent research on language learning.',
    familyOptions: ['research', 'researcher', 'researched', 'research-based'],
    formationAnswer: 'research',
    formationPrompt: 'Reliable _____ improves the quality of an academic essay.',
    formationHint: 'The noun form works as the subject here: research.',
    collocationAnswer: 'conduct',
    collocationOptions: ['conduct', 'draw', 'grow', 'close'],
    collocationPrompt: 'Universities often _____ research on student performance.',
    collocationPhrase: 'conduct research',
  },
  {
    id: 'significant',
    word: 'significant',
    level: 'B2',
    definition: 'important enough to deserve attention',
    example: 'There was a significant rise in attendance this term.',
    familyOptions: ['signify', 'significance', 'significant', 'significantly'],
    formationAnswer: 'significantly',
    formationPrompt: 'The score increased _____ after regular practice.',
    formationHint: 'We need an adverb to modify "increased": significantly.',
    collocationAnswer: 'play',
    collocationOptions: ['play', 'draw', 'pay', 'catch'],
    collocationPrompt: 'Sleep can _____ a significant role in learning.',
    collocationPhrase: 'play a significant role',
  },
  {
    id: 'approach',
    word: 'approach',
    level: 'B2',
    definition: 'a way of thinking about or dealing with something',
    example: 'Her approach to revision is simple but effective.',
    familyOptions: ['approach', 'approachable', 'unapproachable', 'approaching'],
    formationAnswer: 'approach',
    formationPrompt: 'Choose the best _____ for this writing task.',
    formationHint: 'The noun form fits after "best": approach.',
    collocationAnswer: 'adopt',
    collocationOptions: ['adopt', 'borrow', 'argue', 'arrive'],
    collocationPrompt: 'Strong writers usually _____ a clear approach from the start.',
    collocationPhrase: 'adopt an approach',
  },
  {
    id: 'factor',
    word: 'factor',
    level: 'B2',
    definition: 'one element that influences a result',
    example: 'Motivation is an important factor in exam success.',
    familyOptions: ['factor', 'factual', 'factually', 'refactor'],
    formationAnswer: 'factor',
    formationPrompt: 'Time pressure is a major _____ in timed exams.',
    formationHint: 'The blank needs the noun form: factor.',
    collocationAnswer: 'identify',
    collocationOptions: ['identify', 'grow', 'deliver', 'load'],
    collocationPrompt: 'The report should _____ the main factors behind the change.',
    collocationPhrase: 'identify a factor',
  },
  {
    id: 'policy',
    word: 'policy',
    level: 'B2',
    definition: 'an official plan or rule used by an institution',
    example: 'The new policy affects attendance requirements.',
    familyOptions: ['policy', 'policymaker', 'policy-based', 'apolitical'],
    formationAnswer: 'policy',
    formationPrompt: 'The university announced a new language _____ yesterday.',
    formationHint: 'A noun is needed after "language": policy.',
    collocationAnswer: 'introduce',
    collocationOptions: ['introduce', 'listen', 'repair', 'borrow'],
    collocationPrompt: 'The school may _____ a policy on mobile phone use.',
    collocationPhrase: 'introduce a policy',
  },
  {
    id: 'evaluate',
    word: 'evaluate',
    level: 'C1',
    definition: 'to judge value, quality, or effectiveness carefully',
    example: 'Students must evaluate both sides before writing a conclusion.',
    familyOptions: ['evaluate', 'evaluation', 'evaluative', 'reevaluate'],
    formationAnswer: 'evaluation',
    formationPrompt: 'A critical _____ of the source is required here.',
    formationHint: 'The noun form fits after the article: evaluation.',
    collocationAnswer: 'make',
    collocationOptions: ['make', 'draw', 'hold', 'carry'],
    collocationPrompt: 'Before choosing a source, _____ an evaluation of its reliability.',
    collocationPhrase: 'make an evaluation',
  },
  {
    id: 'interpret',
    word: 'interpret',
    level: 'C1',
    definition: 'to explain the meaning of something',
    example: 'Candidates must interpret the chart before they summarize it.',
    familyOptions: ['interpret', 'interpretation', 'interpretive', 'misinterpret'],
    formationAnswer: 'interpretation',
    formationPrompt: 'The examiner looks for a clear _____ of the data.',
    formationHint: 'The noun form is needed after "clear": interpretation.',
    collocationAnswer: 'offer',
    collocationOptions: ['offer', 'catch', 'grow', 'leave'],
    collocationPrompt: 'A strong essay should _____ an interpretation, not just list facts.',
    collocationPhrase: 'offer an interpretation',
  },
  {
    id: 'infer',
    word: 'infer',
    level: 'C1',
    definition: 'to reach a conclusion from evidence rather than direct statement',
    example: 'Readers can infer the writer\'s attitude from tone and word choice.',
    familyOptions: ['infer', 'inference', 'inferential', 'uninferred'],
    formationAnswer: 'inference',
    formationPrompt: 'A careful reader can make a strong _____ from the final paragraph.',
    formationHint: 'After "a strong" we need the noun form: inference.',
    collocationAnswer: 'draw',
    collocationOptions: ['draw', 'pay', 'keep', 'repair'],
    collocationPrompt: 'Good readers _____ an inference from context clues.',
    collocationPhrase: 'draw an inference',
  },
  {
    id: 'coherent',
    word: 'coherent',
    level: 'C1',
    definition: 'logically connected and easy to follow',
    example: 'A coherent essay moves smoothly from one point to the next.',
    familyOptions: ['cohere', 'coherence', 'coherent', 'coherently'],
    formationAnswer: 'coherence',
    formationPrompt: 'Linking words improve the _____ of an essay.',
    formationHint: 'The noun form fits after "the": coherence.',
    collocationAnswer: 'maintain',
    collocationOptions: ['maintain', 'borrow', 'avoid', 'invent'],
    collocationPrompt: 'Writers should _____ coherence across all body paragraphs.',
    collocationPhrase: 'maintain coherence',
  },
  {
    id: 'valid',
    word: 'valid',
    level: 'C1',
    definition: 'well supported and logically acceptable',
    example: 'The conclusion is valid because the evidence is relevant.',
    familyOptions: ['validate', 'validity', 'valid', 'invalid'],
    formationAnswer: 'validity',
    formationPrompt: 'Researchers questioned the _____ of the final claim.',
    formationHint: 'The noun form is required after "the": validity.',
    collocationAnswer: 'question',
    collocationOptions: ['question', 'draw', 'repair', 'approach'],
    collocationPrompt: 'A reviewer may _____ the validity of weak evidence.',
    collocationPhrase: 'question validity',
  },
  {
    id: 'precise',
    word: 'precise',
    level: 'C1',
    definition: 'very exact and carefully chosen',
    example: 'Precise vocabulary improves the quality of formal writing.',
    familyOptions: ['precision', 'precise', 'precisely', 'imprecise'],
    formationAnswer: 'precision',
    formationPrompt: 'Academic writing requires clarity and _____.',
    formationHint: 'The noun form is needed after "and": precision.',
    collocationAnswer: 'use',
    collocationOptions: ['use', 'take', 'pay', 'close'],
    collocationPrompt: 'Strong candidates _____ precise language in summaries.',
    collocationPhrase: 'use precise language',
  },
  {
    id: 'imply',
    word: 'imply',
    level: 'C1',
    definition: 'to suggest something indirectly',
    example: 'The speaker implied that the first method was outdated.',
    familyOptions: ['imply', 'implication', 'implicit', 'implicitly'],
    formationAnswer: 'implication',
    formationPrompt: 'One _____ of the policy is higher workload for teachers.',
    formationHint: 'The blank needs the noun form: implication.',
    collocationAnswer: 'have',
    collocationOptions: ['have', 'draw', 'make up', 'slow down'],
    collocationPrompt: 'The proposal may _____ serious implications for students.',
    collocationPhrase: 'have implications',
  },
  {
    id: 'justify',
    word: 'justify',
    level: 'C1',
    definition: 'to give good reasons for a choice or claim',
    example: 'Candidates should justify each opinion with examples.',
    familyOptions: ['justify', 'justification', 'justifiable', 'unjustified'],
    formationAnswer: 'justification',
    formationPrompt: 'The essay needs stronger _____ for its main claim.',
    formationHint: 'A noun is needed after "stronger": justification.',
    collocationAnswer: 'provide',
    collocationOptions: ['provide', 'close', 'borrow', 'collect'],
    collocationPrompt: 'Writers must _____ justification for each conclusion.',
    collocationPhrase: 'provide justification',
  },
  {
    id: 'synthesize',
    word: 'synthesize',
    level: 'C1',
    definition: 'to combine ideas from different sources into one clear whole',
    example: 'Strong academic writers synthesize evidence from multiple texts.',
    familyOptions: ['synthesize', 'synthesis', 'synthetic', 'synthetically'],
    formationAnswer: 'synthesis',
    formationPrompt: 'The final paragraph should offer a brief _____ of the sources.',
    formationHint: 'The sentence needs the noun form: synthesis.',
    collocationAnswer: 'produce',
    collocationOptions: ['produce', 'arrive', 'borrow', 'delay'],
    collocationPrompt: 'A top essay can _____ a clear synthesis of several ideas.',
    collocationPhrase: 'produce a synthesis',
  },
  {
    id: 'perspective',
    word: 'perspective',
    level: 'C1',
    definition: 'a particular way of thinking about an issue',
    example: 'The article presents a global perspective on education reform.',
    familyOptions: ['perspective', 'perspectival', 'prospective', 'retrospective'],
    formationAnswer: 'perspective',
    formationPrompt: 'Try to include a wider _____ in your response.',
    formationHint: 'The noun form is required after "wider": perspective.',
    collocationAnswer: 'offer',
    collocationOptions: ['offer', 'solve', 'invent', 'take apart'],
    collocationPrompt: 'The second source can _____ a new perspective on the topic.',
    collocationPhrase: 'offer a perspective',
  },
  {
    id: 'mechanism',
    word: 'mechanism',
    level: 'C1',
    definition: 'the process or system by which something works',
    example: 'The lecture explained the mechanism behind language memory.',
    familyOptions: ['mechanism', 'mechanical', 'mechanically', 'mechanistic'],
    formationAnswer: 'mechanism',
    formationPrompt: 'The report describes the _____ behind the change.',
    formationHint: 'The blank needs a noun: mechanism.',
    collocationAnswer: 'explain',
    collocationOptions: ['explain', 'paint', 'hide', 'drop'],
    collocationPrompt: 'Good speakers should _____ the mechanism clearly.',
    collocationPhrase: 'explain a mechanism',
  },
];

const WORD_FORMATION_SET_1 = [
  {
    id: 'wf_combine_income',
    word: 'combine',
    level: 'B1',
    definition: 'to join things together',
    familyOptions: ['combination', 'combine', 'combined'],
    formationAnswer: 'combined',
    formationPrompt: 'My husband and I have a _____ income of 35,000 per year.',
    formationHint: 'Use the adjective form: combined.',
  },
  {
    id: 'wf_combine_account',
    word: 'combine',
    level: 'B1',
    definition: 'to join things together',
    familyOptions: ['combination', 'combine', 'combined'],
    formationAnswer: 'combine',
    formationPrompt: 'We _____ our money in one account.',
    formationHint: 'Use the verb form: combine.',
  },
  {
    id: 'wf_combination_rice',
    word: 'combine',
    level: 'B1',
    definition: 'to join things together',
    familyOptions: ['combination', 'combine', 'combined'],
    formationAnswer: 'combination',
    formationPrompt: 'Do you like the _____ of rice and beans?',
    formationHint: 'Use the noun form: combination.',
  },
  {
    id: 'wf_activate_engine',
    word: 'activate',
    level: 'B1',
    definition: 'to make something start working',
    familyOptions: ['activity', 'inactivity', 'activate', 'active', 'inactive', 'actively'],
    formationAnswer: 'activate',
    formationPrompt: 'When you push that button, you will _____ the engine.',
    formationHint: 'Use the verb form: activate.',
  },
  {
    id: 'wf_activity_sleep',
    word: 'activity',
    level: 'B1',
    definition: 'a thing you do for interest',
    familyOptions: ['activity', 'inactivity', 'activate', 'active', 'inactive', 'actively'],
    formationAnswer: 'activity',
    formationPrompt: 'My favorite _____ is sleeping.',
    formationHint: 'Use the noun form: activity.',
  },
  {
    id: 'wf_active_life',
    word: 'active',
    level: 'B1',
    definition: 'busy or energetic',
    familyOptions: ['activity', 'inactivity', 'activate', 'active', 'inactive', 'actively'],
    formationAnswer: 'active',
    formationPrompt: 'John leads an _____ life, so he is always busy.',
    formationHint: 'Use the adjective form: active.',
  },
  {
    id: 'wf_actively_coach',
    word: 'active',
    level: 'B1',
    definition: 'busy or energetic',
    familyOptions: ['activity', 'inactivity', 'activate', 'active', 'inactive', 'actively'],
    formationAnswer: 'actively',
    formationPrompt: 'Peter is a sports coach at school, and he works _____ all day.',
    formationHint: 'Use the adverb form: actively.',
  },
  {
    id: 'wf_inactivity_obesity',
    word: 'inactive',
    level: 'B1',
    definition: 'not active',
    familyOptions: ['activity', 'inactivity', 'activate', 'active', 'inactive', 'actively'],
    formationAnswer: 'inactivity',
    formationPrompt: 'Overeating and _____ are two principal reasons for obesity.',
    formationHint: 'Use the noun form: inactivity.',
  },
  {
    id: 'wf_irresponsibly_act',
    word: 'responsible',
    level: 'B1',
    definition: 'having a duty to deal with something',
    familyOptions: ['responsibility', 'responsible', 'irresponsible', 'responsibly', 'irresponsibly'],
    formationAnswer: 'irresponsibly',
    formationPrompt: 'Why do you have to act so _____ ?',
    formationHint: 'Use the adverb form: irresponsibly.',
  },
  {
    id: 'wf_responsible_decisions',
    word: 'responsible',
    level: 'B1',
    definition: 'having a duty to deal with something',
    familyOptions: ['responsibility', 'responsible', 'irresponsible', 'responsibly', 'irresponsibly'],
    formationAnswer: 'responsible',
    formationPrompt: 'Who is _____ for making the final decisions in your Department?',
    formationHint: 'Use the adjective form: responsible.',
  },
  {
    id: 'wf_responsibly_drive',
    word: 'responsible',
    level: 'B1',
    definition: 'having a duty to deal with something',
    familyOptions: ['responsibility', 'responsible', 'irresponsible', 'responsibly', 'irresponsibly'],
    formationAnswer: 'responsibly',
    formationPrompt: 'Unless you drive _____, your license will be taken away.',
    formationHint: 'Use the adverb form: responsibly.',
  },
  {
    id: 'wf_irresponsible_tom',
    word: 'responsible',
    level: 'B1',
    definition: 'having a duty to deal with something',
    familyOptions: ['responsibility', 'responsible', 'irresponsible', 'responsibly', 'irresponsibly'],
    formationAnswer: 'irresponsible',
    formationPrompt: 'Tom is so _____ that you’d better not count on him.',
    formationHint: 'Use the adjective form: irresponsible.',
  },
  {
    id: 'wf_responsibility_job',
    word: 'responsibility',
    level: 'B1',
    definition: 'duty or obligation',
    familyOptions: ['responsibility', 'responsible', 'irresponsible', 'responsibly', 'irresponsibly'],
    formationAnswer: 'responsibility',
    formationPrompt: 'How much _____ does your job have?',
    formationHint: 'Use the noun form: responsibility.',
  },
  {
    id: 'wf_frequently_stay_out',
    word: 'frequent',
    level: 'B1',
    definition: 'happening often',
    familyOptions: ['frequency', 'frequent', 'infrequent', 'frequently'],
    formationAnswer: 'frequently',
    formationPrompt: 'I _____ stay out until 2 a.m. on Friday nights.',
    formationHint: 'Use the adverb form: frequently.',
  },
  {
    id: 'wf_frequent_letters',
    word: 'frequent',
    level: 'B1',
    definition: 'happening often',
    familyOptions: ['frequency', 'frequent', 'infrequent', 'frequently'],
    formationAnswer: 'frequent',
    formationPrompt: 'I receive _____ letters from my cousin in Venezuela.',
    formationHint: 'Use the adjective form: frequent.',
  },
  {
    id: 'wf_frequency_flights',
    word: 'frequency',
    level: 'B1',
    definition: 'how often something happens',
    familyOptions: ['frequency', 'frequent', 'infrequent', 'frequently'],
    formationAnswer: 'frequency',
    formationPrompt: 'What is the _____ of flights from New York to Istanbul?',
    formationHint: 'Use the noun form: frequency.',
  },
  {
    id: 'wf_central_idea',
    word: 'center',
    level: 'B1',
    definition: 'the middle of something',
    familyOptions: ['center', 'centralization', 'decentralization', 'centralize', 'decentralize', 'central', 'centrally', 'centralized'],
    formationAnswer: 'central',
    formationPrompt: 'What is the _____ idea of the prime minister’s latest speech?',
    formationHint: 'Use the adjective form: central.',
  },
  {
    id: 'wf_center_town',
    word: 'center',
    level: 'B1',
    definition: 'the middle of something',
    familyOptions: ['center', 'centralization', 'decentralization', 'centralize', 'decentralize', 'central', 'centrally', 'centralized'],
    formationAnswer: 'center',
    formationPrompt: 'The doctor’s office is easy to find because it is in the _____ of town.',
    formationHint: 'Use the noun form: center.',
  },
  {
    id: 'wf_decentralization',
    word: 'decentralize',
    level: 'B2',
    definition: 'to reduce central control',
    familyOptions: ['center', 'centralization', 'decentralization', 'centralize', 'decentralize', 'central', 'centrally', 'centralized'],
    formationAnswer: 'decentralization',
    formationPrompt: 'For large countries, _____ of governmental authority is essential.',
    formationHint: 'Use the noun form: decentralization.',
  },
  {
    id: 'wf_centrally_located',
    word: 'central',
    level: 'B1',
    definition: 'in or near the center',
    familyOptions: ['center', 'centralization', 'decentralization', 'centralize', 'decentralize', 'central', 'centrally', 'centralized'],
    formationAnswer: 'centrally',
    formationPrompt: 'The theatre is easy to get to, for it is _____ located.',
    formationHint: 'Use the adverb form: centrally.',
  },
  {
    id: 'wf_centralized_records',
    word: 'centralize',
    level: 'B2',
    definition: 'to move control to the center',
    familyOptions: ['center', 'centralization', 'decentralization', 'centralize', 'decentralize', 'central', 'centrally', 'centralized'],
    formationAnswer: 'centralized',
    formationPrompt: 'Last year, that company _____ all of its financial records into one location.',
    formationHint: 'Use the past form: centralized.',
  },
  {
    id: 'wf_support_committee',
    word: 'support',
    level: 'B1',
    definition: 'help or approval',
    familyOptions: ['support', 'supporter', 'supporting', 'supported'],
    formationAnswer: 'support',
    formationPrompt: 'The chairman received the _____ of most of the committee members.',
    formationHint: 'Use the noun form: support.',
  },
  {
    id: 'wf_supporting_evidence',
    word: 'support',
    level: 'B1',
    definition: 'help or approval',
    familyOptions: ['support', 'supporter', 'supporting', 'supported'],
    formationAnswer: 'supporting',
    formationPrompt: 'The _____ evidence proves that cigarettes are harmful.',
    formationHint: 'Use the adjective form: supporting.',
  },
  {
    id: 'wf_supported_family',
    word: 'support',
    level: 'B1',
    definition: 'help or approval',
    familyOptions: ['support', 'supporter', 'supporting', 'supported'],
    formationAnswer: 'supported',
    formationPrompt: 'Mr. Peterson _____ his family by working in a bank.',
    formationHint: 'Use the past form: supported.',
  },
  {
    id: 'wf_supporters_team',
    word: 'support',
    level: 'B1',
    definition: 'help or approval',
    familyOptions: ['support', 'supporter', 'supporting', 'supported'],
    formationAnswer: 'supporters',
    formationPrompt: 'The _____ of the baseball team cheered loudly during the game.',
    formationHint: 'Use the plural noun: supporters.',
  },
  {
    id: 'wf_simple_language',
    word: 'simple',
    level: 'B1',
    definition: 'easy to understand',
    familyOptions: ['simplicity', 'simplification', 'simplify', 'simple', 'simply'],
    formationAnswer: 'simple',
    formationPrompt: 'Please write the instructions in _____ language.',
    formationHint: 'Use the adjective form: simple.',
  },
  {
    id: 'wf_simply_say',
    word: 'simple',
    level: 'B1',
    definition: 'easy to understand',
    familyOptions: ['simplicity', 'simplification', 'simplify', 'simple', 'simply'],
    formationAnswer: 'simply',
    formationPrompt: 'Say it _____ so that everyone will be able to understand you.',
    formationHint: 'Use the adverb form: simply.',
  },
  {
    id: 'wf_simplify_instructions',
    word: 'simplify',
    level: 'B1',
    definition: 'to make something simpler',
    familyOptions: ['simplicity', 'simplification', 'simplify', 'simple', 'simply'],
    formationAnswer: 'simplify',
    formationPrompt: 'His instructions were too difficult to understand, so he had to _____ them.',
    formationHint: 'Use the verb form: simplify.',
  },
  {
    id: 'wf_simplicity_einstein',
    word: 'simplicity',
    level: 'B1',
    definition: 'being simple',
    familyOptions: ['simplicity', 'simplification', 'simplify', 'simple', 'simply'],
    formationAnswer: 'simplicity',
    formationPrompt: 'Einstein was able to describe his brilliant ideas with great _____.',
    formationHint: 'Use the noun form: simplicity.',
  },
  {
    id: 'wf_living_creatures',
    word: 'live',
    level: 'B1',
    definition: 'to be alive',
    familyOptions: ['life', 'live', 'alive', 'living', 'lively', 'lives'],
    formationAnswer: 'living',
    formationPrompt: 'All _____ creatures need food to survive, grow, and stay healthy.',
    formationHint: 'Use the adjective form: living.',
  },
  {
    id: 'wf_alive_bug',
    word: 'alive',
    level: 'B1',
    definition: 'not dead',
    familyOptions: ['life', 'live', 'alive', 'living', 'lively', 'lives'],
    formationAnswer: 'alive',
    formationPrompt: 'I’m not so sure whether the bug on your desk is _____ or dead.',
    formationHint: 'Use the adjective form: alive.',
  },
  {
    id: 'wf_live_feed',
    word: 'live',
    level: 'B1',
    definition: 'happening now',
    familyOptions: ['life', 'live', 'alive', 'living', 'lively', 'lives'],
    formationAnswer: 'live',
    formationPrompt: 'The television news will have a/an _____ feed of the important meeting in Paris.',
    formationHint: 'Use the adjective form: live.',
  },
  {
    id: 'wf_lively_energy',
    word: 'lively',
    level: 'B1',
    definition: 'full of life and energy',
    familyOptions: ['life', 'live', 'alive', 'living', 'lively', 'lives'],
    formationAnswer: 'lively',
    formationPrompt: 'Ms. White is so _____ and full of energy that it’s a pleasure to meet her.',
    formationHint: 'Use the adjective form: lively.',
  },
  {
    id: 'wf_lives_house',
    word: 'live',
    level: 'B1',
    definition: 'to be alive or to reside',
    familyOptions: ['life', 'live', 'alive', 'living', 'lively', 'lives'],
    formationAnswer: 'lives',
    formationPrompt: 'The Watson family _____ in a small house.',
    formationHint: 'Use the verb form: lives.',
  },
  {
    id: 'wf_life_figure',
    word: 'life',
    level: 'B1',
    definition: 'the existence of a person',
    familyOptions: ['life', 'live', 'alive', 'living', 'lively', 'lives'],
    formationAnswer: 'life',
    formationPrompt: 'I always find it interesting to read about the _____ of a historic figure.',
    formationHint: 'Use the noun form: life.',
  },
  {
    id: 'wf_favorable_impression',
    word: 'favor',
    level: 'B2',
    definition: 'approval or support',
    familyOptions: ['favor', 'favorite', 'favorable', 'unfavorable', 'favorably', 'unfavorably'],
    formationAnswer: 'favorable',
    formationPrompt: 'It is essential that you make a/an _____ impression at a job interview.',
    formationHint: 'Use the adjective form: favorable.',
  },
  {
    id: 'wf_favor_do',
    word: 'favor',
    level: 'B1',
    definition: 'an act of kindness',
    familyOptions: ['favor', 'favorite', 'favorable', 'unfavorable', 'favorably', 'unfavorably'],
    formationAnswer: 'favor',
    formationPrompt: 'Could you do me a/an _____ and stop talking about football?',
    formationHint: 'Use the noun form: favor.',
  },
  {
    id: 'wf_favorite_singer',
    word: 'favorite',
    level: 'B1',
    definition: 'most liked',
    familyOptions: ['favor', 'favorite', 'favorable', 'unfavorable', 'favorably', 'unfavorably'],
    formationAnswer: 'favorite',
    formationPrompt: 'Many people enjoy different kinds of music, but who is your _____ singer?',
    formationHint: 'Use the adjective form: favorite.',
  },
  {
    id: 'wf_unfavorably_react',
    word: 'unfavorable',
    level: 'B2',
    definition: 'not favorable',
    familyOptions: ['favor', 'favorite', 'favorable', 'unfavorable', 'favorably', 'unfavorably'],
    formationAnswer: 'unfavorably',
    formationPrompt: 'I hope they won’t react _____ to our latest proposal.',
    formationHint: 'Use the adverb form: unfavorably.',
  },
  {
    id: 'wf_favor_dark_suits',
    word: 'favor',
    level: 'B1',
    definition: 'to prefer',
    familyOptions: ['favor', 'favorite', 'favorable', 'unfavorable', 'favorably', 'unfavorably'],
    formationAnswer: 'favor',
    formationPrompt: 'Most businessmen _____ dark blue suits.',
    formationHint: 'Use the verb form: favor.',
  },
  {
    id: 'wf_unfavorable_conditions',
    word: 'unfavorable',
    level: 'B2',
    definition: 'not favorable',
    familyOptions: ['favor', 'favorite', 'favorable', 'unfavorable', 'favorably', 'unfavorably'],
    formationAnswer: 'unfavorable',
    formationPrompt: 'The workers went on strike owing to _____ working conditions.',
    formationHint: 'Use the adjective form: unfavorable.',
  },
  {
    id: 'wf_favorably_talked',
    word: 'favorably',
    level: 'B2',
    definition: 'in a favorable way',
    familyOptions: ['favor', 'favorite', 'favorable', 'unfavorable', 'favorably', 'unfavorably'],
    formationAnswer: 'favorably',
    formationPrompt: 'Despite his negative attitude, the chairman talked to us _____.',
    formationHint: 'Use the adverb form: favorably.',
  },
];

const WORD_BUILDING_SET_1 = [
  {
    id: 'wb_repetitive_tasks',
    word: 'repeat',
    level: 'B2',
    definition: 'to do again',
    familyOptions: ['repeat', 'repeated', 'repetitive', 'repetition'],
    formationAnswer: 'repetitive',
    formationPrompt: 'Most of the _____ tasks are done by robots or similar devices.',
    formationHint: 'Use the adjective form: repetitive.',
  },
  {
    id: 'wb_emphasis_growth',
    word: 'emphasize',
    level: 'B2',
    definition: 'to give special importance',
    familyOptions: ['emphasize', 'emphasis', 'emphatic', 'emphatically'],
    formationAnswer: 'emphasis',
    formationPrompt: 'Schools put more _____ on children’s intellectual growth.',
    formationHint: 'Use the noun form: emphasis.',
  },
  {
    id: 'wb_intellectual_growth',
    word: 'intellect',
    level: 'B2',
    definition: 'ability to think and reason',
    familyOptions: ['intellect', 'intellectual', 'intellectually'],
    formationAnswer: 'intellectual',
    formationPrompt: 'Schools put more emphasis on children’s _____ growth.',
    formationHint: 'Use the adjective form: intellectual.',
  },
  {
    id: 'wb_acknowledgement_crisis',
    word: 'acknowledge',
    level: 'B2',
    definition: 'to accept that something is true',
    familyOptions: ['acknowledge', 'acknowledgement', 'acknowledgment'],
    formationAnswer: 'acknowledgement',
    formationPrompt: 'People wanted a governmental _____ of the existence of the crisis.',
    formationHint: 'Use the noun form: acknowledgement.',
  },
  {
    id: 'wb_economic_crisis',
    word: 'economize',
    level: 'B2',
    definition: 'to save money',
    familyOptions: ['economize', 'economy', 'economic', 'economical'],
    formationAnswer: 'economic',
    formationPrompt: 'People wanted a governmental acknowledgement of the existence of the _____ crisis.',
    formationHint: 'Use the adjective form: economic.',
  },
  {
    id: 'wb_description_results',
    word: 'describe',
    level: 'B2',
    definition: 'to explain in words',
    familyOptions: ['describe', 'description', 'descriptive', 'descriptively'],
    formationAnswer: 'description',
    formationPrompt: 'They wrote a detailed _____ of what happened.',
    formationHint: 'Use the noun form: description.',
  },
  {
    id: 'wb_foundation_state',
    word: 'found',
    level: 'B2',
    definition: 'to establish',
    familyOptions: ['found', 'foundation', 'founder'],
    formationAnswer: 'foundation',
    formationPrompt: 'These reforms formed the _____ of a modern democratic state.',
    formationHint: 'Use the noun form: foundation.',
  },
  {
    id: 'wb_democratic_state',
    word: 'democracy',
    level: 'B2',
    definition: 'system of government by the people',
    familyOptions: ['democracy', 'democratic', 'democrat'],
    formationAnswer: 'democratic',
    formationPrompt: 'These reforms formed the foundation of a modern _____ state.',
    formationHint: 'Use the adjective form: democratic.',
  },
  {
    id: 'wb_remarkably_wide',
    word: 'remark',
    level: 'B2',
    definition: 'to comment',
    familyOptions: ['remark', 'remarkable', 'remarkably'],
    formationAnswer: 'remarkably',
    formationPrompt: 'They have a _____ wide selection of imported products.',
    formationHint: 'Use the adverb form: remarkably.',
  },
  {
    id: 'wb_selection_products',
    word: 'select',
    level: 'B2',
    definition: 'to choose',
    familyOptions: ['select', 'selection', 'selective'],
    formationAnswer: 'selection',
    formationPrompt: 'They have a remarkably wide _____ of imported products.',
    formationHint: 'Use the noun form: selection.',
  },
  {
    id: 'wb_developed_vaccine',
    word: 'develop',
    level: 'B2',
    definition: 'to grow or create',
    familyOptions: ['develop', 'developed', 'development', 'developing'],
    formationAnswer: 'developed',
    formationPrompt: 'The _____ vaccine is expected to protect people for many years.',
    formationHint: 'Use the adjective form: developed.',
  },
  {
    id: 'wb_immunity_protect',
    word: 'immune',
    level: 'B2',
    definition: 'protected against disease',
    familyOptions: ['immune', 'immunity'],
    formationAnswer: 'immunity',
    formationPrompt: 'The vaccine is expected to give lifelong _____ against serious infection.',
    formationHint: 'Use the noun form: immunity.',
  },
  {
    id: 'wb_infection_against',
    word: 'infect',
    level: 'B2',
    definition: 'to make someone ill',
    familyOptions: ['infect', 'infection', 'infectious'],
    formationAnswer: 'infection',
    formationPrompt: 'The vaccine is expected to give lifelong immunity against serious viral _____.',
    formationHint: 'Use the noun form: infection.',
  },
  {
    id: 'wb_national_network',
    word: 'nation',
    level: 'B2',
    definition: 'a country',
    familyOptions: ['nation', 'national', 'nationally'],
    formationAnswer: 'national',
    formationPrompt: 'Thanks to this _____ network and its fast distribution system, newspapers arrive early.',
    formationHint: 'Use the adjective form: national.',
  },
  {
    id: 'wb_distribution_system',
    word: 'distribute',
    level: 'B2',
    definition: 'to deliver to different places',
    familyOptions: ['distribute', 'distribution', 'distributor'],
    formationAnswer: 'distribution',
    formationPrompt: 'Thanks to this national network and its fast _____ system, newspapers arrive early.',
    formationHint: 'Use the noun form: distribution.',
  },
  {
    id: 'wb_daily_newspapers',
    word: 'day',
    level: 'B2',
    definition: 'a period of 24 hours',
    familyOptions: ['day', 'daily'],
    formationAnswer: 'daily',
    formationPrompt: 'Most _____ newspapers reach towns before people wake up.',
    formationHint: 'Use the adjective form: daily.',
  },
  {
    id: 'wb_politicians_interviews',
    word: 'politics',
    level: 'B2',
    definition: 'activities related to government',
    familyOptions: ['politics', 'politician', 'political'],
    formationAnswer: 'politicians',
    formationPrompt: 'In TV debates, most _____ still fail to recognise the clear correlation.',
    formationHint: 'Use the plural noun: politicians.',
  },
  {
    id: 'wb_correlation_between',
    word: 'correlate',
    level: 'B2',
    definition: 'to be connected',
    familyOptions: ['correlate', 'correlation', 'correlative'],
    formationAnswer: 'correlation',
    formationPrompt: 'Most politicians still fail to recognise the clear _____ between crime and unemployment.',
    formationHint: 'Use the noun form: correlation.',
  },
  {
    id: 'wb_unemployment_high',
    word: 'employ',
    level: 'B2',
    definition: 'to give someone a job',
    familyOptions: ['employ', 'employment', 'unemployment'],
    formationAnswer: 'unemployment',
    formationPrompt: 'Most politicians still fail to recognise the clear correlation between crime and high _____.',
    formationHint: 'Use the noun form: unemployment.',
  },
  {
    id: 'wb_voluntarily_helped',
    word: 'volunteer',
    level: 'B2',
    definition: 'to work without pay',
    familyOptions: ['volunteer', 'voluntary', 'voluntarily'],
    formationAnswer: 'voluntarily',
    formationPrompt: 'He did all this _____ although nobody had asked him.',
    formationHint: 'Use the adverb form: voluntarily.',
  },
  {
    id: 'wf_succeeded_in_exam',
    word: 'succeed',
    level: 'B1',
    definition: 'to achieve a result',
    familyOptions: ['succeed', 'succeeded', 'success'],
    formationAnswer: 'succeeded',
    formationPrompt: 'She finally _____ in passing the entrance exam after months of study.',
    formationHint: 'Use the past tense form: succeeded.',
  },
  {
    id: 'wf_resulted_in_loss',
    word: 'result',
    level: 'B1',
    definition: 'to cause something',
    familyOptions: ['result', 'results', 'resulted'],
    formationAnswer: 'resulted',
    formationPrompt: 'The project _____ in a big financial loss.',
    formationHint: 'Use the past tense form: resulted.',
  },
  {
    id: 'wf_focus_on_task',
    word: 'focus',
    level: 'B1',
    definition: 'to concentrate',
    familyOptions: ['focus', 'focused', 'focuses', 'focusing'],
    formationAnswer: 'focus',
    formationPrompt: 'Please _____ on the task and stop checking your phone.',
    formationHint: 'Use the base form: focus.',
  },
  {
    id: 'wf_insisted_on_paying',
    word: 'insist',
    level: 'B1',
    definition: 'to demand firmly',
    familyOptions: ['insist', 'insisted', 'insistent'],
    formationAnswer: 'insisted',
    formationPrompt: 'They _____ on paying for the meal, even though it was my birthday.',
    formationHint: 'Use the past tense form: insisted.',
  },
  {
    id: 'wf_rely_on_teacher',
    word: 'rely',
    level: 'B1',
    definition: 'to depend on',
    familyOptions: ['rely', 'relied', 'reliable'],
    formationAnswer: 'rely',
    formationPrompt: 'We can always _____ on our teacher for helpful advice.',
    formationHint: 'Use the base form: rely.',
  },
  {
    id: 'wf_laughed_at_clown',
    word: 'laugh',
    level: 'B1',
    definition: 'to laugh',
    familyOptions: ['laugh', 'laughed', 'laughing'],
    formationAnswer: 'laughed',
    formationPrompt: 'The kids _____ at the clown with joy during the birthday party.',
    formationHint: 'Use the past tense form: laughed.',
  },
  {
    id: 'wf_participate_in_festival',
    word: 'participate',
    level: 'B1',
    definition: 'to take part',
    familyOptions: ['participate', 'participated', 'participation'],
    formationAnswer: 'participate',
    formationPrompt: 'The children were excited to _____ in the school festival.',
    formationHint: 'Use the base form: participate.',
  },
  {
    id: 'wf_persisted_in_questions',
    word: 'persist',
    level: 'B1',
    definition: 'to continue firmly',
    familyOptions: ['persist', 'persisted', 'persistent'],
    formationAnswer: 'persisted',
    formationPrompt: 'She _____ in asking questions even when others were silent.',
    formationHint: 'Use the past tense form: persisted.',
  },
  {
    id: 'wf_arrive_in_berlin',
    word: 'arrive',
    level: 'A2',
    definition: 'to reach a place',
    familyOptions: ['arrive', 'arrived', 'arrival'],
    formationAnswer: 'arrive',
    formationPrompt: 'What time will the train _____ in Berlin?',
    formationHint: 'Use the base form: arrive.',
  },
];

const WORD_BANK = [...BASE_WORD_BANK, ...WORD_FORMATION_SET_1, ...WORD_BUILDING_SET_1];

const BASE_PREPOSITION_BANK = [
  { id: 'good_at', keyword: 'good', level: 'A1', phrase: 'good at', prompt: 'She is very good ___ vocabulary quizzes.', answer: 'at', options: ['at', 'in', 'on', 'for'], note: 'good at + noun/verb-ing' },
  { id: 'interested_in', keyword: 'interested', level: 'A1', phrase: 'interested in', prompt: 'Many students are interested ___ study-abroad programs.', answer: 'in', options: ['in', 'on', 'for', 'to'], note: 'interested in + noun/verb-ing' },
  { id: 'ready_for', keyword: 'ready', level: 'A1', phrase: 'ready for', prompt: 'Are you ready ___ tomorrow\'s quiz?', answer: 'for', options: ['for', 'to', 'at', 'with'], note: 'ready for + noun' },
  { id: 'different_from', keyword: 'different', level: 'A1', phrase: 'different from', prompt: 'Online learning is different ___ classroom learning.', answer: 'from', options: ['from', 'than', 'with', 'to'], note: 'different from + noun' },
  { id: 'listen_to', keyword: 'listen', level: 'A1', phrase: 'listen to', prompt: 'Please listen ___ the instructions carefully.', answer: 'to', options: ['to', 'at', 'for', 'on'], note: 'listen to + object' },
  { id: 'worry_about', keyword: 'worry', level: 'A2', phrase: 'worry about', prompt: 'Do not worry ___ one small mistake.', answer: 'about', options: ['about', 'for', 'with', 'at'], note: 'worry about + noun' },
  { id: 'depend_on', keyword: 'depend', level: 'A2', phrase: 'depend on', prompt: 'The final score may depend ___ your speaking task.', answer: 'on', options: ['on', 'at', 'for', 'to'], note: 'depend on + noun' },
  { id: 'similar_to', keyword: 'similar', level: 'A2', phrase: 'similar to', prompt: 'The second question is similar ___ the first one.', answer: 'to', options: ['to', 'with', 'for', 'on'], note: 'similar to + noun' },
  { id: 'pay_for', keyword: 'pay', level: 'A2', phrase: 'pay for', prompt: 'Students should not pay ___ a service they do not need.', answer: 'for', options: ['for', 'to', 'with', 'on'], note: 'pay for + thing' },
  { id: 'responsible_for', keyword: 'responsible', level: 'B1', phrase: 'responsible for', prompt: 'Each group member is responsible ___ one section.', answer: 'for', options: ['for', 'with', 'on', 'at'], note: 'responsible for + noun' },
  { id: 'reason_for', keyword: 'reason', level: 'B1', phrase: 'reason for', prompt: 'What is the main reason ___ the low attendance?', answer: 'for', options: ['for', 'of', 'in', 'with'], note: 'reason for + noun' },
  { id: 'effect_on', keyword: 'effect', level: 'B1', phrase: 'effect on', prompt: 'Sleep has a direct effect ___ concentration.', answer: 'on', options: ['on', 'to', 'for', 'from'], note: 'effect on + noun' },
  { id: 'solution_to', keyword: 'solution', level: 'B1', phrase: 'solution to', prompt: 'The team found a solution ___ the scheduling problem.', answer: 'to', options: ['to', 'for', 'with', 'at'], note: 'solution to + problem' },
  { id: 'focus_on', keyword: 'focus', level: 'B1', phrase: 'focus on', prompt: 'Try to focus ___ the key argument first.', answer: 'on', options: ['on', 'in', 'at', 'by'], note: 'focus on + noun' },
  { id: 'involved_in', keyword: 'involved', level: 'B1', phrase: 'involved in', prompt: 'She is involved ___ the student research project.', answer: 'in', options: ['in', 'on', 'for', 'to'], note: 'involved in + activity' },
  { id: 'compared_with', keyword: 'compared', level: 'B2', phrase: 'compared with', prompt: 'Attendance improved when compared ___ last semester.', answer: 'with', options: ['with', 'to', 'for', 'by'], note: 'compare with / compare to' },
  { id: 'based_on', keyword: 'based', level: 'B2', phrase: 'based on', prompt: 'Your conclusion should be based ___ clear evidence.', answer: 'on', options: ['on', 'at', 'of', 'with'], note: 'based on + evidence' },
  { id: 'related_to', keyword: 'related', level: 'B2', phrase: 'related to', prompt: 'The article discusses issues related ___ language policy.', answer: 'to', options: ['to', 'with', 'for', 'in'], note: 'related to + noun' },
  { id: 'result_in', keyword: 'result', level: 'B2', phrase: 'result in', prompt: 'Poor planning may result ___ weaker performance.', answer: 'in', options: ['in', 'from', 'to', 'with'], note: 'result in + outcome' },
  { id: 'result_from', keyword: 'result', level: 'B2', phrase: 'result from', prompt: 'The confusion may result ___ unclear instructions.', answer: 'from', options: ['from', 'in', 'of', 'with'], note: 'result from + cause' },
  { id: 'aware_of', keyword: 'aware', level: 'B2', phrase: 'aware of', prompt: 'Writers must be aware ___ register and tone.', answer: 'of', options: ['of', 'for', 'by', 'to'], note: 'aware of + noun' },
  { id: 'relevant_to', keyword: 'relevant', level: 'C1', phrase: 'relevant to', prompt: 'Only keep evidence that is relevant ___ the prompt.', answer: 'to', options: ['to', 'for', 'on', 'with'], note: 'relevant to + topic' },
  { id: 'attribute_to', keyword: 'attribute', level: 'C1', phrase: 'attribute to', prompt: 'Some researchers attribute the change ___ social pressure.', answer: 'to', options: ['to', 'with', 'for', 'from'], note: 'attribute A to B' },
  { id: 'derive_from', keyword: 'derive', level: 'C1', phrase: 'derive from', prompt: 'Most examples in the paragraph derive ___ classroom experience.', answer: 'from', options: ['from', 'to', 'on', 'with'], note: 'derive from + source' },
  { id: 'comply_with', keyword: 'comply', level: 'C1', phrase: 'comply with', prompt: 'All candidates must comply ___ the exam rules.', answer: 'with', options: ['with', 'to', 'for', 'on'], note: 'comply with + rules' },
  { id: 'align_with', keyword: 'align', level: 'C1', phrase: 'align with', prompt: 'Your examples should align ___ your main claim.', answer: 'with', options: ['with', 'to', 'for', 'on'], note: 'align with + objective' },
  { id: 'stem_from', keyword: 'stem', level: 'C1', phrase: 'stem from', prompt: 'The misunderstanding may stem ___ vague wording.', answer: 'from', options: ['from', 'with', 'of', 'to'], note: 'stem from + cause' },
  { id: 'contribute_to', keyword: 'contribute', level: 'C1', phrase: 'contribute to', prompt: 'Regular feedback can contribute ___ faster progress.', answer: 'to', options: ['to', 'for', 'with', 'from'], note: 'contribute to + result' },
  { id: 'consistent_with', keyword: 'consistent', level: 'C1', phrase: 'consistent with', prompt: 'Your interpretation should be consistent ___ the data.', answer: 'with', options: ['with', 'to', 'for', 'on'], note: 'consistent with + evidence' },
];

const PREPOSITION_VERB_SET_1 = [
  { id: 'prep_arrive_in', keyword: 'arrive', level: 'A2', phrase: 'arrive in', prompt: 'We arrived _____ Istanbul late at night.', answer: 'in', options: ['in', 'on', 'at'], note: 'arrive in + city/country' },
  { id: 'prep_believe_in', keyword: 'believe', level: 'A2', phrase: 'believe in', prompt: 'Do you believe _____ ghosts?', answer: 'in', options: ['in', 'on', 'at'], note: 'believe in + noun' },
  { id: 'prep_participate_in', keyword: 'participate', level: 'A2', phrase: 'participate in', prompt: 'The students participated _____ a charity run.', answer: 'in', options: ['in', 'on', 'at'], note: 'participate in + activity' },
  { id: 'prep_persist_in', keyword: 'persist', level: 'B1', phrase: 'persist in', prompt: 'She persisted _____ trying to solve the problem.', answer: 'in', options: ['in', 'on', 'at'], note: 'persist in + verb-ing' },
  { id: 'prep_result_in', keyword: 'result', level: 'B1', phrase: 'result in', prompt: 'Lack of sleep can result _____ health problems.', answer: 'in', options: ['in', 'on', 'at'], note: 'result in + outcome' },
  { id: 'prep_succeed_in', keyword: 'succeed', level: 'B1', phrase: 'succeed in', prompt: 'She worked hard and succeeded _____ finding a new job.', answer: 'in', options: ['in', 'on', 'at'], note: 'succeed in + verb-ing' },
  { id: 'prep_insist_on', keyword: 'insist', level: 'B1', phrase: 'insist on', prompt: 'My dad always insists _____ doing everything by himself.', answer: 'on', options: ['in', 'on', 'at'], note: 'insist on + verb-ing' },
  { id: 'prep_rely_on', keyword: 'rely', level: 'B1', phrase: 'rely on', prompt: 'She relies _____ her parents for support.', answer: 'on', options: ['in', 'on', 'at'], note: 'rely on + noun' },
  { id: 'prep_bet_on', keyword: 'bet', level: 'B1', phrase: 'bet on', prompt: 'She bet _____ the horse with the white tail.', answer: 'on', options: ['in', 'on', 'at'], note: 'bet on + noun' },
  { id: 'prep_decide_on', keyword: 'decide', level: 'B1', phrase: 'decide on', prompt: 'Have you decided _____ a date for the meeting?', answer: 'on', options: ['in', 'on', 'at'], note: 'decide on + noun' },
  { id: 'prep_focus_on_set', keyword: 'focus', level: 'B1', phrase: 'focus on', prompt: 'Please focus _____ your work.', answer: 'on', options: ['in', 'on', 'at'], note: 'focus on + noun' },
  { id: 'prep_work_on', keyword: 'work', level: 'B1', phrase: 'work on', prompt: 'She worked _____ her presentation all night.', answer: 'on', options: ['in', 'on', 'at'], note: 'work on + task' },
  { id: 'prep_arrive_at', keyword: 'arrive', level: 'A2', phrase: 'arrive at', prompt: 'She arrived _____ school late this morning.', answer: 'at', options: ['in', 'on', 'at'], note: 'arrive at + place' },
  { id: 'prep_laugh_at', keyword: 'laugh', level: 'A2', phrase: 'laugh at', prompt: 'Don’t laugh _____ your friend’s mistake.', answer: 'at', options: ['in', 'on', 'at'], note: 'laugh at + person/thing' },
  { id: 'prep_look_at', keyword: 'look', level: 'A2', phrase: 'look at', prompt: 'He looked _____ his watch and left quickly.', answer: 'at', options: ['in', 'on', 'at'], note: 'look at + object' },
  { id: 'prep_point_at', keyword: 'point', level: 'A2', phrase: 'point at', prompt: 'Don’t point _____ people — it’s rude.', answer: 'at', options: ['in', 'on', 'at'], note: 'point at + person' },
  { id: 'prep_smile_at', keyword: 'smile', level: 'A2', phrase: 'smile at', prompt: 'I felt extremely happy when she finally smiled _____ me.', answer: 'at', options: ['in', 'on', 'at'], note: 'smile at + person' },
  { id: 'prep_stare_at', keyword: 'stare', level: 'A2', phrase: 'stare at', prompt: 'The baby stared _____ the bright lights.', answer: 'at', options: ['in', 'on', 'at'], note: 'stare at + object' },
];

const PREPOSITION_EXERCISE_SET_1 = [
  { id: 'prep_ex1_succeeded', keyword: 'succeed', level: 'A2', phrase: 'succeed in', prompt: 'She succeeded _____ passing the driving test on her second attempt.', answer: 'in', options: ['in', 'on', 'at'], note: 'succeed in + verb-ing' },
  { id: 'prep_ex1_staring', keyword: 'stare', level: 'A2', phrase: 'stare at', prompt: 'Why are you staring _____ me like that?', answer: 'at', options: ['in', 'on', 'at'], note: 'stare at + person' },
  { id: 'prep_ex1_insisted', keyword: 'insist', level: 'B1', phrase: 'insist on', prompt: 'They insisted _____ paying for the tickets.', answer: 'on', options: ['in', 'on', 'at'], note: 'insist on + verb-ing' },
  { id: 'prep_ex1_focus', keyword: 'focus', level: 'B1', phrase: 'focus on', prompt: 'The conference will focus _____ climate change this year.', answer: 'on', options: ['in', 'on', 'at'], note: 'focus on + noun' },
  { id: 'prep_ex1_believe', keyword: 'believe', level: 'A2', phrase: 'believe in', prompt: 'He believes _____ life after death.', answer: 'in', options: ['in', 'on', 'at'], note: 'believe in + noun' },
  { id: 'prep_ex1_laughed', keyword: 'laugh', level: 'A2', phrase: 'laugh at', prompt: 'She laughed _____ his strange hat.', answer: 'at', options: ['in', 'on', 'at'], note: 'laugh at + person/thing' },
  { id: 'prep_ex1_decided', keyword: 'decide', level: 'B1', phrase: 'decide on', prompt: 'The company decided _____ a new marketing strategy.', answer: 'on', options: ['in', 'on', 'at'], note: 'decide on + noun' },
  { id: 'prep_ex1_resulted', keyword: 'result', level: 'B1', phrase: 'result in', prompt: 'The heavy snow resulted _____ several flight delays.', answer: 'in', options: ['in', 'on', 'at'], note: 'result in + outcome' },
  { id: 'prep_ex1_participated', keyword: 'participate', level: 'A2', phrase: 'participate in', prompt: 'The children participated _____ the school play.', answer: 'in', options: ['in', 'on', 'at'], note: 'participate in + activity' },
  { id: 'prep_ex1_smiled', keyword: 'smile', level: 'A2', phrase: 'smile at', prompt: 'She smiled _____ the little boy.', answer: 'at', options: ['in', 'on', 'at'], note: 'smile at + person' },
];

const PREPOSITION_EXERCISE_SET_3 = [
  { id: 'prep_ex3_arrived', keyword: 'arrive', level: 'A2', phrase: 'arrive in', prompt: 'Last summer, I arrived _____ a small town in Italy.', answer: 'in', options: ['in', 'on', 'at'], note: 'arrive in + city/country' },
  { id: 'prep_ex3_participate', keyword: 'participate', level: 'A2', phrase: 'participate in', prompt: 'I arrived in a small town to participate _____ a language course.', answer: 'in', options: ['in', 'on', 'at'], note: 'participate in + activity' },
  { id: 'prep_ex3_believe', keyword: 'believe', level: 'A2', phrase: 'believe in', prompt: 'At first, I didn’t believe _____ myself.', answer: 'in', options: ['in', 'on', 'at'], note: 'believe in + noun' },
  { id: 'prep_ex3_focus', keyword: 'focus', level: 'B1', phrase: 'focus on', prompt: 'I decided to focus _____ my goals.', answer: 'on', options: ['in', 'on', 'at'], note: 'focus on + noun' },
  { id: 'prep_ex3_insisted', keyword: 'insist', level: 'B1', phrase: 'insist on', prompt: 'I insisted _____ speaking only Italian during class.', answer: 'on', options: ['in', 'on', 'at'], note: 'insist on + verb-ing' },
  { id: 'prep_ex3_resulted', keyword: 'result', level: 'B1', phrase: 'result in', prompt: 'Sometimes my mistakes resulted _____ embarrassing moments.', answer: 'in', options: ['in', 'on', 'at'], note: 'result in + outcome' },
  { id: 'prep_ex3_laughed', keyword: 'laugh', level: 'A2', phrase: 'laugh at', prompt: 'My classmates laughed _____ me, but I didn’t give up.', answer: 'at', options: ['in', 'on', 'at'], note: 'laugh at + person' },
  { id: 'prep_ex3_persisted', keyword: 'persist', level: 'B1', phrase: 'persist in', prompt: 'I persisted _____ practicing every day.', answer: 'in', options: ['in', 'on', 'at'], note: 'persist in + verb-ing' },
  { id: 'prep_ex3_succeeded', keyword: 'succeed', level: 'B1', phrase: 'succeed in', prompt: 'By the end of the course, I succeeded _____ improving my speaking skills.', answer: 'in', options: ['in', 'on', 'at'], note: 'succeed in + verb-ing' },
  { id: 'prep_ex3_smiled', keyword: 'smile', level: 'A2', phrase: 'smile at', prompt: 'My teacher smiled _____ me proudly.', answer: 'at', options: ['in', 'on', 'at'], note: 'smile at + person' },
];

const PREPOSITION_BANK = [
  ...BASE_PREPOSITION_BANK,
  ...PREPOSITION_VERB_SET_1,
  ...PREPOSITION_EXERCISE_SET_1,
  ...PREPOSITION_EXERCISE_SET_3,
];

const WEEK_BLUEPRINTS = [
  { week: 1, level: 'A1', title: 'Campus Basics', goal: 'Core survival vocabulary for simple classroom interaction.', words: ['help', 'care', 'success', 'difference', 'interest', 'prepare'], preps: ['good_at', 'interested_in', 'listen_to'] },
  { week: 2, level: 'A1', title: 'Study Habits', goal: 'Simple routines for class, homework, and revision.', words: ['prepare', 'help', 'interest', 'difference', 'care', 'success'], preps: ['ready_for', 'good_at', 'different_from'] },
  { week: 3, level: 'A1', title: 'Task Language', goal: 'Exam words for understanding instructions and simple results.', words: ['help', 'prepare', 'explain', 'improve', 'success', 'difference'], preps: ['listen_to', 'interested_in', 'ready_for'] },
  { week: 4, level: 'A1', title: 'First Exam Week', goal: 'Build confidence with easy word families and fixed combinations.', words: ['care', 'interest', 'prepare', 'decide', 'explain', 'improve'], preps: ['different_from', 'good_at', 'listen_to'] },
  { week: 5, level: 'A2', title: 'Choices and Planning', goal: 'Handle planning, choices, and short explanations.', words: ['decide', 'explain', 'compare', 'improve', 'prepare', 'respond'], preps: ['depend_on', 'similar_to', 'worry_about'] },
  { week: 6, level: 'A2', title: 'Opinions and Answers', goal: 'Give short reasons and clearer responses in class.', words: ['respond', 'discuss', 'reason', 'explain', 'interest', 'compare'], preps: ['pay_for', 'depend_on', 'similar_to'] },
  { week: 7, level: 'A2', title: 'Study Problems', goal: 'Talk about simple problems, causes, and support.', words: ['solution', 'effect', 'improve', 'help', 'focus', 'prepare'], preps: ['worry_about', 'ready_for', 'different_from'] },
  { week: 8, level: 'A2', title: 'Short Reports', goal: 'Summarize what happened and respond more accurately.', words: ['summary', 'respond', 'reason', 'compare', 'decide', 'explain'], preps: ['depend_on', 'similar_to', 'pay_for'] },
  { week: 9, level: 'B1', title: 'Cause and Effect', goal: 'Connect reasons, results, and solutions in academic tasks.', words: ['reason', 'effect', 'solution', 'evidence', 'focus', 'target'], preps: ['reason_for', 'effect_on', 'solution_to'] },
  { week: 10, level: 'B1', title: 'Discussion Skills', goal: 'Support opinions and manage simple argument structure.', words: ['discuss', 'argue', 'summary', 'evidence', 'respond', 'reason'], preps: ['focus_on', 'responsible_for', 'involved_in'] },
  { week: 11, level: 'B1', title: 'Change and Progress', goal: 'Describe movement, growth, and academic improvement.', words: ['improve', 'compare', 'target', 'effect', 'success', 'difference'], preps: ['effect_on', 'solution_to', 'focus_on'] },
  { week: 12, level: 'B1', title: 'Support and Proof', goal: 'Use examples and evidence instead of vague opinion.', words: ['argue', 'evidence', 'summary', 'solution', 'respond', 'explain'], preps: ['reason_for', 'responsible_for', 'involved_in'] },
  { week: 13, level: 'B1', title: 'Task Control', goal: 'Stay focused, organized, and accurate in timed tasks.', words: ['focus', 'target', 'reason', 'compare', 'discuss', 'prepare'], preps: ['focus_on', 'different_from', 'solution_to'] },
  { week: 14, level: 'B2', title: 'Research Basics', goal: 'Enter academic language for method, data, and evidence.', words: ['analyze', 'research', 'method', 'evidence', 'assess', 'approach'], preps: ['based_on', 'related_to', 'compared_with'] },
  { week: 15, level: 'B2', title: 'Evaluation Language', goal: 'Judge importance, quality, and academic value more precisely.', words: ['evaluate', 'assess', 'significant', 'factor', 'argue', 'interpret'], preps: ['aware_of', 'related_to', 'result_in'] },
  { week: 16, level: 'B2', title: 'Policy and Process', goal: 'Describe systems, causes, and institutional choices.', words: ['policy', 'approach', 'factor', 'solution', 'target', 'research'], preps: ['result_from', 'based_on', 'responsible_for'] },
  { week: 17, level: 'B2', title: 'Data Commentary', goal: 'Comment on data and explain what changes mean.', words: ['analyze', 'interpret', 'significant', 'compare', 'effect', 'evidence'], preps: ['effect_on', 'compared_with', 'aware_of'] },
  { week: 18, level: 'B2', title: 'Formal Response', goal: 'Respond with stronger evaluation and better task control.', words: ['respond', 'justify', 'evaluate', 'summary', 'argument', 'policy'].map((word) => (word === 'argument' ? 'argue' : word)), preps: ['result_in', 'related_to', 'based_on'] },
  { week: 19, level: 'C1', title: 'Precision and Validity', goal: 'Use exact, defensible language in academic answers.', words: ['precise', 'valid', 'coherent', 'infer', 'justify', 'imply'], preps: ['relevant_to', 'consistent_with', 'align_with'] },
  { week: 20, level: 'C1', title: 'Synthesis', goal: 'Combine sources, viewpoints, and implications into one line of thought.', words: ['synthesize', 'perspective', 'imply', 'interpret', 'coherent', 'evidence'], preps: ['attribute_to', 'derive_from', 'contribute_to'] },
  { week: 21, level: 'C1', title: 'Critical Evaluation', goal: 'Question claims, mechanisms, and hidden assumptions.', words: ['evaluate', 'valid', 'precise', 'mechanism', 'factor', 'imply'], preps: ['consistent_with', 'stem_from', 'relevant_to'] },
  { week: 22, level: 'C1', title: 'Advanced Argument', goal: 'Make complex arguments with logic, nuance, and justification.', words: ['justify', 'argue', 'coherent', 'perspective', 'synthesize', 'infer'], preps: ['align_with', 'attribute_to', 'comply_with'] },
  { week: 23, level: 'C1', title: 'Research Writing', goal: 'Read, interpret, and explain advanced academic content.', words: ['analyze', 'mechanism', 'imply', 'valid', 'approach', 'policy'], preps: ['derive_from', 'consistent_with', 'relevant_to'] },
  { week: 24, level: 'C1', title: 'Exam Mastery', goal: 'Finish the cycle with formal, high-precision academic vocabulary.', words: ['synthesize', 'precise', 'coherent', 'justify', 'interpret', 'imply'], preps: ['contribute_to', 'align_with', 'comply_with'] },
];

const WORD_MAP = new Map(WORD_BANK.map((item) => [item.id, item]));
const PREP_MAP = new Map(PREPOSITION_BANK.map((item) => [item.id, item]));

function resolveWordItem(id) {
  const item = WORD_MAP.get(id);
  if (!item) return null;
  const dict = getWordEntry(item.word);
  return {
    ...item,
    synonyms: dict?.synonyms || [],
    examples: dict?.examples || [item.example],
    collocations: dict?.collocations || [item.collocationPhrase],
  };
}

function resolvePrepItem(id) {
  const item = PREP_MAP.get(id) || null;
  if (!item) return null;
  return { ...item, kind: 'prep' };
}

function expandPoolIds(baseIds = [], bank = [], week = {}, targetCount = 12, allowNeighbors = true) {
  const base = uniq(baseIds);
  const baseSet = new Set(base);
  const distances = allowNeighbors ? [0, 1, 2, 3, 4] : [0];
  const byDistance = distances.flatMap((distance) => {
    const matches = bank.filter((item) => {
      if (!item || baseSet.has(item.id)) return false;
      return getLevelDistance(item.level, week.level) === distance;
    });
    return shuffleWithSeed(matches, week.week * 97 + distance * 17).map((item) => item.id);
  });
  return uniq([...base, ...byDistance]).slice(0, targetCount);
}

function getExpandedWordIds(week) {
  return expandPoolIds(week?.words, WORD_BANK, week, 30, false);
}

function getExpandedPrepIds(week) {
  return expandPoolIds(week?.preps, PREPOSITION_BANK, week, 30, false);
}

function getNeighborWordIds(week) {
  return expandPoolIds(week?.words, WORD_BANK, week, 60, true);
}

function getNeighborPrepIds(week) {
  return expandPoolIds(week?.preps, PREPOSITION_BANK, week, 60, true);
}

function getItemKey(item) {
  return String(item?.id || item?.keyword || item?.word || '').trim();
}

function buildUniquePool(primary = [], fallback = [], target = 20, seed = 1) {
  const out = [];
  const seen = new Set();
  const pushUnique = (list) => {
    list.forEach((item) => {
      const key = getItemKey(item);
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(item);
    });
  };
  pushUnique(primary);
  if (out.length < target) {
    pushUnique(fallback);
  }
  return shuffleWithSeed(out, seed).slice(0, target);
}

function buildPrepositionQuestion(item, seed = 1) {
  const frame = splitPromptFrame(item.prompt);
  return {
    id: `${item.id}-prep-${seed}`,
    type: 'Collocation Completion',
    skill: 'preposition',
    format: 'input',
    target: item.keyword,
    level: item.level,
    prompt: item.prompt,
    answer: item.answer,
    acceptedAnswers: uniq([item.answer]),
    placeholder: 'Type the preposition',
    helper: item.note || `Use the correct preposition for "${item.keyword}".`,
    instruction: 'Complete the sentence with the correct preposition.',
    promptFrame: frame,
    cueLabel: 'Verb',
    cueValue: item.keyword,
    secondaryCueLabel: 'Phrase',
    secondaryCueValue: item.phrase,
    explanation: item.note || `Common pattern: ${item.phrase}.`,
    notebook: {
      word: item.keyword,
      definition: item.note || '',
      level: item.level,
      collocation: item.phrase,
    },
  };
}

function buildDayQuestions(week, dayNumber = 1, seed = 1) {
  const wordItems = Array.isArray(week?.bankWords) && week.bankWords.length
    ? week.bankWords
    : getExpandedWordIds(week).map(resolveWordItem).filter(Boolean);
  const prepItems = Array.isArray(week?.bankPrepositions) && week.bankPrepositions.length
    ? week.bankPrepositions.map((item) => ({ ...item, kind: 'prep' }))
    : getExpandedPrepIds(week).map(resolvePrepItem).filter(Boolean);
  const daySeed = seed + week.week * 5000 + Number(dayNumber || 1) * 431;
  const day = Number(dayNumber || 1);
  const isFormationDay = day >= 1 && day <= 5;
  const formationPool = wordItems.filter((item) => item?.formationPrompt && item?.formationAnswer);
  const formationFallback = getNeighborWordIds(week)
    .map(resolveWordItem)
    .filter((item) => item?.formationPrompt && item?.formationAnswer);
  const collocationPool = [
    ...prepItems,
    ...wordItems.filter((item) => item?.collocationPrompt && item?.collocationAnswer),
  ];
  const collocationFallback = [
    ...getNeighborPrepIds(week).map(resolvePrepItem).filter(Boolean),
    ...getNeighborWordIds(week)
      .map(resolveWordItem)
      .filter((item) => item?.collocationPrompt && item?.collocationAnswer),
  ];
  const pool = isFormationDay
    ? buildUniquePool(formationPool, formationFallback, 20, daySeed)
    : buildUniquePool(collocationPool, collocationFallback, 20, daySeed);
  const questions = pool.slice(0, 20).map((item, index) => {
    if (!isFormationDay && item?.kind === 'prep') {
      return buildPrepositionQuestion(item, daySeed + index + week.week * 20);
    }
    return isFormationDay
      ? buildFormationQuestion(item, daySeed + index + week.week * 10)
      : buildCollocationQuestion(item, daySeed + index + week.week * 20);
  });
  return shuffleWithSeed(questions, daySeed + week.week * 9000).slice(0, 20);
}

export function getVocabCurriculum() {
  return WEEK_BLUEPRINTS.map((week) => {
    const focusWords = uniq(week.words).map(resolveWordItem).filter(Boolean);
    const focusPrepositions = uniq(week.preps).map(resolvePrepItem).filter(Boolean);
    const bankWords = getExpandedWordIds(week).map(resolveWordItem).filter(Boolean);
    const bankPrepositions = getExpandedPrepIds(week).map(resolvePrepItem).filter(Boolean);
    return {
      ...week,
      questionMix: {
        total: 20,
        daysPerWeek: 7,
        formationDays: 5,
        collocationDays: 2,
      },
      focusWords,
      focusPrepositions,
      bankWords,
      bankPrepositions,
      questionBankSize: (bankWords.length * 2) + bankPrepositions.length,
    };
  });
}

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'];

export function getLevelRoadmap() {
  return LEVEL_ORDER.map((level) => {
    const weeks = WEEK_BLUEPRINTS.filter((week) => week.level === level);
    if (!weeks.length) return null;
    const wordIds = uniq(weeks.flatMap((week) => week.words));
    const prepIds = uniq(weeks.flatMap((week) => week.preps));
    return {
      level,
      weeks: weeks.map((week) => week.week),
      weekRange: `${weeks[0].week}-${weeks[weeks.length - 1].week}`,
      wordCount: wordIds.length,
      prepositionCount: prepIds.length,
      words: wordIds.map(resolveWordItem).filter(Boolean),
      prepositions: prepIds.map(resolvePrepItem).filter(Boolean),
    };
  }).filter(Boolean);
}

export function getDailyQuiz(weekNumber, dayNumber = 1, seed = 1) {
  const week = getVocabCurriculum().find((item) => item.week === Number(weekNumber));
  if (!week) return null;
  const day = Number(dayNumber) || 1;
  const stableSeed = Number.isFinite(seed)
    ? Number(seed)
    : (Number(week.week) * 1000 + Number(day) * 37);
  return {
    ...week,
    day,
    dayMode: day >= 1 && day <= 5 ? 'formation' : 'collocation',
    questions: buildDayQuestions(week, day, stableSeed) || [],
  };
}

export function getWeeklyQuiz(weekNumber, seed = 1) {
  return getDailyQuiz(weekNumber, 1, seed);
}

export function getRecommendedWeek(vocabStats = {}) {
  const curriculum = getVocabCurriculum();
  for (const week of curriculum) {
    const mastery = getWeekMastery(week, vocabStats);
    if (mastery < 70) return week.week;
  }
  return curriculum[curriculum.length - 1]?.week || 1;
}

export function getWeekMastery(week, vocabStats = {}) {
  const words = uniq(week?.words || []);
  if (!words.length) return 0;
  let total = 0;
  words.forEach((word) => {
    const key = String(word || '').toLowerCase();
    const stat = vocabStats[key] || {};
    const known = Number(stat.known || 0);
    const unknown = Number(stat.unknown || 0);
    if (!known && !unknown) return;
    const ratio = Math.round((known / Math.max(1, known + unknown)) * 100);
    total += ratio;
  });
  const tracked = words.filter((word) => {
    const key = String(word || '').toLowerCase();
    const stat = vocabStats[key] || {};
    return Number(stat.known || 0) + Number(stat.unknown || 0) > 0;
  }).length;
  if (!tracked) return 0;
  return Math.round(total / tracked);
}

export function buildErrorNotebook({ errorWords = {}, vocabStats = {}, limit = 12 } = {}) {
  const candidates = new Set([
    ...Object.keys(errorWords || {}),
    ...Object.keys(vocabStats || {}),
    ...WORD_BANK.map((item) => item.word.toLowerCase()),
  ]);
  const notebook = Array.from(candidates)
    .map((key) => {
      const word = String(key || '').toLowerCase();
      const bankItem = WORD_BANK.find((item) => item.word.toLowerCase() === word);
      const dict = getWordEntry(word);
      const stats = vocabStats[word] || {};
      const errors = Number(errorWords[word] || 0);
      const known = Number(stats.known || 0);
      const unknown = Number(stats.unknown || 0);
      const weakness = errors * 4 + unknown * 2 - known;
      if (weakness <= 0) return null;
      const weeks = WEEK_BLUEPRINTS.filter((week) => week.words.includes(bankItem?.id || word)).map((week) => week.week);
      return {
        word: bankItem?.word || dict?.word || word,
        definition: bankItem?.definition || dict?.simple_definition || 'Review this word in context.',
        level: bankItem?.level || dict?.level || '',
        family: uniq(bankItem?.familyOptions || []),
        collocation: bankItem?.collocationPhrase || dict?.collocations?.[0] || '',
        preposition: PREPOSITION_BANK.find((item) => item.keyword === word)?.phrase || '',
        errors,
        known,
        unknown,
        weakness,
        weeks,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.weakness - a.weakness || a.word.localeCompare(b.word))
    .slice(0, limit);
  return notebook;
}

function buildTypedMistakeList(map = {}, type = 'collocation', limit = 8) {
  return Object.entries(map || {})
    .map(([key, item]) => {
      const word = String(item?.word || '').trim().toLowerCase();
      const bankItem = WORD_BANK.find((entry) => entry.word.toLowerCase() === word);
      const dict = getWordEntry(word || item?.label || key);
      const label = String(item?.label || key || '').trim();
      const count = Number(item?.count || 0);
      if (!label || count <= 0) return null;
      return {
        key,
        kind: type,
        label,
        word: bankItem?.word || dict?.word || word || label,
        count,
        level: item?.level || bankItem?.level || dict?.level || '',
        weeks: uniq(item?.weeks || []).sort((a, b) => a - b),
        definition:
          item?.definition ||
          bankItem?.definition ||
          dict?.simple_definition ||
          'Review this combination in context.',
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function buildTopMistakenCollocations(progress = {}, limit = 8) {
  return buildTypedMistakeList(progress?.mistakes?.collocations, 'collocation', limit);
}

export function buildTopMistakenPrepositions(progress = {}, limit = 8) {
  return buildTypedMistakeList(progress?.mistakes?.prepositions, 'preposition', limit);
}

export function getCurriculumWord(word = '') {
  const raw = String(word || '').trim().toLowerCase();
  if (!raw) return null;
  return WORD_BANK.find((item) => item.word.toLowerCase() === raw) || null;
}

export function getLevelRangeSummary(level = '') {
  const value = String(level || '').toUpperCase();
  if (!LEVEL_RANK[value]) return 'Mixed';
  return `${value} band`;
}
