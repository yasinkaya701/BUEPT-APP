const state = {
  reading: null,
  grammar: null,
  writing: null,
  runtimeMode: 'auto',
  local: {
    coreLoaded: false,
    dictionaryLoaded: false,
    core: {},
    dictionaryIndex: null,
    dictionaryByWord: null,
  },
};

const LOCAL_DICTIONARY_COUNT_HINT = 26795;

function qs(id) {
  return document.getElementById(id);
}

function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function uniq(list) {
  const seen = new Set();
  const out = [];
  for (const item of list || []) {
    const text = String(item || '').trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

function resolveAssetPath(relPath) {
  return new URL(relPath, window.location.href).toString();
}

async function loadJsonAsset(name) {
  const res = await fetch(resolveAssetPath(`./data/${name}`));
  if (!res.ok) {
    throw new Error(`LOCAL_DATA_MISSING: ${name}`);
  }
  return res.json();
}

async function ensureLocalCoreLoaded() {
  if (state.local.coreLoaded) return;

  const [
    readingTasks,
    grammarTasks,
    grammarTasksHard,
    testEnglishGrammarTasks,
    writingPrompts,
    listeningPodcasts,
    universitySchedule,
    departmentVocab,
  ] = await Promise.all([
    loadJsonAsset('reading_tasks.json'),
    loadJsonAsset('grammar_tasks.json'),
    loadJsonAsset('grammar_tasks_hard.json'),
    loadJsonAsset('test_english_grammar_tasks.json'),
    loadJsonAsset('writing_prompts.json'),
    loadJsonAsset('listening_podcasts.json'),
    loadJsonAsset('university_schedule_2025_fall.json'),
    loadJsonAsset('bogazici_department_vocab.json'),
  ]);

  state.local.core = {
    readingTasks: Array.isArray(readingTasks) ? readingTasks : [],
    grammarTasks: [
      ...(Array.isArray(grammarTasks) ? grammarTasks : []),
      ...(Array.isArray(grammarTasksHard) ? grammarTasksHard : []),
      ...(Array.isArray(testEnglishGrammarTasks) ? testEnglishGrammarTasks : []),
    ],
    writingPrompts: Array.isArray(writingPrompts) ? writingPrompts : [],
    listeningPodcasts: Array.isArray(listeningPodcasts) ? listeningPodcasts : [],
    universitySchedule: universitySchedule || {},
    departmentVocab: Array.isArray(departmentVocab) ? departmentVocab : [],
  };

  state.local.coreLoaded = true;
}

function normalizeDictionaryEntry(item, source = 'dict', rank = 1) {
  const word = String(item?.word || '').trim();
  if (!word) return null;

  const definition = String(item?.simple_definition || item?.definition || '').trim();
  const synonyms = uniq(item?.synonyms || []);
  const antonyms = uniq(item?.antonyms || []);
  const collocations = uniq(item?.collocations || []);
  const derivatives = uniq(item?.derivatives || []);
  const examples = uniq(item?.examples || (item?.example ? [item.example] : []));

  return {
    word,
    level: String(item?.level || 'B2').trim() || 'B2',
    wordType: String(item?.word_type || item?.wordType || '').trim(),
    definition,
    synonyms,
    antonyms,
    collocations,
    derivatives,
    examples,
    source,
    rank,
  };
}

async function ensureLocalDictionaryLoaded() {
  if (state.local.dictionaryLoaded) return;

  const [dictionarySubset, academicWordList, academicVerbs, testEnglishVocabItems] = await Promise.all([
    loadJsonAsset('dictionary_subset.json'),
    loadJsonAsset('academic_wordlist.json'),
    loadJsonAsset('academic_verbs.json'),
    loadJsonAsset('test_english_vocab_items.json'),
  ]);

  const merged = [];

  for (const row of Array.isArray(testEnglishVocabItems) ? testEnglishVocabItems : []) {
    const entry = normalizeDictionaryEntry(row, 'test-english', 90);
    if (entry) merged.push(entry);
  }

  for (const row of Array.isArray(academicWordList) ? academicWordList : []) {
    const entry = normalizeDictionaryEntry(
      {
        word: row?.word,
        simple_definition: row?.definition,
        level: row?.level || 'B2',
        collocations: row?.collocations || [],
        examples: row?.example ? [row.example] : [],
      },
      'academic',
      80,
    );
    if (entry) merged.push(entry);
  }

  for (const row of Array.isArray(academicVerbs) ? academicVerbs : []) {
    const entry = normalizeDictionaryEntry(
      {
        word: row?.word,
        simple_definition: row?.definition,
        level: row?.level || 'B2',
        word_type: 'verb',
        examples: row?.example ? [row.example] : [],
      },
      'academic-verbs',
      85,
    );
    if (entry) merged.push(entry);
  }

  for (const row of Array.isArray(dictionarySubset) ? dictionarySubset : []) {
    const entry = normalizeDictionaryEntry(row, 'subset', 60);
    if (entry) merged.push(entry);
  }

  const byWord = new Map();
  for (const item of merged) {
    const key = item.word.toLowerCase();
    const prev = byWord.get(key);
    if (!prev) {
      byWord.set(key, item);
      continue;
    }
    const mergedItem = {
      ...prev,
      definition: prev.rank >= item.rank ? prev.definition : item.definition,
      level: prev.rank >= item.rank ? prev.level : item.level,
      wordType: prev.wordType || item.wordType,
      synonyms: uniq([...prev.synonyms, ...item.synonyms]).slice(0, 12),
      antonyms: uniq([...prev.antonyms, ...item.antonyms]).slice(0, 8),
      collocations: uniq([...prev.collocations, ...item.collocations]).slice(0, 10),
      derivatives: uniq([...prev.derivatives, ...item.derivatives]).slice(0, 10),
      examples: uniq([...prev.examples, ...item.examples]).slice(0, 5),
      rank: Math.max(prev.rank, item.rank),
      source: prev.rank >= item.rank ? prev.source : item.source,
    };
    byWord.set(key, mergedItem);
  }

  const list = Array.from(byWord.values()).sort((a, b) => {
    const rankDiff = Number(b.rank || 0) - Number(a.rank || 0);
    if (rankDiff !== 0) return rankDiff;
    return String(a.word).localeCompare(String(b.word));
  });

  state.local.dictionaryIndex = list;
  state.local.dictionaryByWord = byWord;
  state.local.dictionaryLoaded = true;
}

function normalizeQuestion(q) {
  if (!q) return null;
  const options = Array.isArray(q.options) ? q.options.map((x) => String(x)) : [];
  const answer = Number.isInteger(q.answer) ? q.answer : Number(q.answer);
  return {
    q: String(q.q || q.question || '').trim(),
    options,
    answer: Number.isFinite(answer) ? answer : null,
    explain: String(q.explain || '').trim(),
    skill: String(q.skill || '').trim(),
  };
}

function filterByLevel(list, level) {
  if (!level) return list;
  const target = String(level).trim().toUpperCase();
  return (list || []).filter((item) => String(item?.level || '').toUpperCase() === target);
}

function localCoachReply(message) {
  const m = String(message || '').toLowerCase();

  if (!m.trim()) {
    return {
      reply: 'Please share your question in English and I will coach you.',
      suggestions: ['Ask a vocabulary question', 'Ask for writing strategy', 'Ask for BUEPT tips'],
    };
  }

  if (m.includes('vocab') || m.includes('word') || m.includes('synonym')) {
    return {
      reply: 'For vocabulary growth: learn word family + collocation + one original sentence. Review after 1 day, 3 days, and 7 days.',
      suggestions: ['Search a target word', 'Open department vocabulary', 'Practice collocations'],
    };
  }

  if (m.includes('writing') || m.includes('essay')) {
    return {
      reply: 'For writing: first make a 4-part skeleton (thesis, argument 1, argument 2, conclusion), then write with clear connectors and one concrete example per body paragraph.',
      suggestions: ['Generate a new writing prompt', 'Write 120+ words', 'Check quick feedback'],
    };
  }

  if (m.includes('reading')) {
    return {
      reply: 'For reading speed: do preview (title + first sentence), then scan keywords in each paragraph, then answer questions using evidence lines.',
      suggestions: ['Load new reading task', 'Focus on inference questions', 'Track unknown words'],
    };
  }

  return {
    reply: 'Good question. I recommend one focused 25-minute session: 10 min grammar, 10 min reading/listening, 5 min vocabulary review.',
    suggestions: ['Ask for a weekly study plan', 'Ask for grammar strategy', 'Ask for speaking tips'],
  };
}

async function localApi(path, options = {}) {
  await ensureLocalCoreLoaded();

  const method = String(options.method || 'GET').toUpperCase();
  const parsed = new URL(path, window.location.origin);
  const pathname = parsed.pathname;

  if (pathname === '/api/status' || pathname === '/api/health') {
    return {
      ok: true,
      service: 'buept-local-web-mode',
      now: new Date().toISOString(),
      roots: {
        projectRoot: 'github-pages',
        appRoot: 'web',
        dataRoot: 'web/data',
      },
    };
  }

  if (pathname === '/api/summary') {
    return {
      ok: true,
      summary: {
        readingCount: state.local.core.readingTasks.length,
        grammarCount: state.local.core.grammarTasks.length,
        writingCount: state.local.core.writingPrompts.length,
        listeningCount: state.local.core.listeningPodcasts.length,
        dictionaryCount: state.local.dictionaryLoaded ? state.local.dictionaryIndex.length : LOCAL_DICTIONARY_COUNT_HINT,
        departmentCount: state.local.core.departmentVocab.length,
      },
    };
  }

  if (pathname === '/api/vocab/random') {
    await ensureLocalDictionaryLoaded();
    return {
      ok: true,
      item: pickRandom(state.local.dictionaryIndex),
    };
  }

  if (pathname === '/api/vocab/search') {
    await ensureLocalDictionaryLoaded();
    const query = String(parsed.searchParams.get('q') || '').trim().toLowerCase();
    if (!query) return { ok: true, query: '', hits: [], total: 0 };

    const exact = state.local.dictionaryByWord.get(query);
    const starts = [];
    const contains = [];

    for (const entry of state.local.dictionaryIndex) {
      const word = String(entry.word || '').toLowerCase();
      if (word === query) continue;
      if (word.startsWith(query)) starts.push(entry);
      else if (word.includes(query)) contains.push(entry);
      if (starts.length >= 20 && contains.length >= 20) break;
    }

    const hits = exact ? [exact, ...starts, ...contains] : [...starts, ...contains];
    return {
      ok: true,
      query,
      hits: hits.slice(0, 25),
      total: hits.length,
    };
  }

  if (pathname === '/api/vocab/departments') {
    const departments = state.local.core.departmentVocab.map((row) => ({
      id: row.id,
      department: row.department,
      wordCount: Array.isArray(row.words) ? row.words.length : 0,
    }));
    return { ok: true, departments };
  }

  if (pathname === '/api/vocab/department') {
    const dep = String(parsed.searchParams.get('department') || parsed.searchParams.get('id') || '').trim().toLowerCase();
    const limit = Math.max(1, Math.min(200, Number(parsed.searchParams.get('limit') || 40)));
    const found = state.local.core.departmentVocab.find((row) => {
      const id = String(row?.id || '').toLowerCase();
      const name = String(row?.department || '').toLowerCase();
      return dep === id || dep === name;
    });

    if (!found) {
      return { ok: false, error: 'DEPARTMENT_NOT_FOUND' };
    }

    return {
      ok: true,
      department: found.department,
      id: found.id,
      words: Array.isArray(found.words) ? found.words.slice(0, limit) : [],
    };
  }

  if (pathname === '/api/reading/random') {
    const level = String(parsed.searchParams.get('level') || '').trim();
    const scoped = filterByLevel(state.local.core.readingTasks, level);
    const task = pickRandom(scoped.length ? scoped : state.local.core.readingTasks);
    return {
      ok: true,
      task: task
        ? {
            id: task.id,
            level: task.level,
            title: task.title,
            time: task.time,
            text: task.text,
            question: normalizeQuestion(pickRandom(task.questions || [])),
          }
        : null,
    };
  }

  if (pathname === '/api/grammar/random') {
    const level = String(parsed.searchParams.get('level') || '').trim();
    const scoped = filterByLevel(state.local.core.grammarTasks, level);
    const task = pickRandom(scoped.length ? scoped : state.local.core.grammarTasks);
    return {
      ok: true,
      task: task
        ? {
            id: task.id,
            level: task.level,
            title: task.title,
            time: task.time,
            explain: task.explain,
            question: normalizeQuestion(pickRandom(task.questions || [])),
          }
        : null,
    };
  }

  if (pathname === '/api/writing/random') {
    const level = String(parsed.searchParams.get('level') || '').trim();
    const scoped = filterByLevel(state.local.core.writingPrompts, level);
    return {
      ok: true,
      prompt: pickRandom(scoped.length ? scoped : state.local.core.writingPrompts),
    };
  }

  if (pathname === '/api/listening/podcasts') {
    return {
      ok: true,
      podcasts: state.local.core.listeningPodcasts,
    };
  }

  if (pathname === '/api/calendar') {
    const schedule = state.local.core.universitySchedule || {};
    return {
      ok: true,
      calendar: {
        meta: schedule.meta || {},
        holidays: Array.isArray(schedule.holidays) ? schedule.holidays.slice(0, 30) : [],
        academicEvents: Array.isArray(schedule.academicEvents) ? schedule.academicEvents.slice(0, 30) : [],
      },
    };
  }

  if (pathname === '/api/chat' && method === 'POST') {
    const body = options?.body ? JSON.parse(options.body) : {};
    const out = localCoachReply(body.message || '');
    return {
      ok: true,
      reply: out.reply,
      suggestions: out.suggestions,
    };
  }

  return { ok: false, error: `LOCAL_ROUTE_NOT_FOUND: ${pathname}` };
}

async function remoteApi(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const text = await res.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { ok: false, error: 'INVALID_JSON_RESPONSE', raw: text };
  }

  if (!res.ok || data.ok === false) {
    const err = data.error || `${res.status} ${res.statusText}`;
    throw new Error(err);
  }

  return data;
}

async function api(path, options = {}) {
  if (state.runtimeMode === 'local') {
    const local = await localApi(path, options);
    if (local.ok === false) throw new Error(local.error || 'LOCAL_API_ERROR');
    return local;
  }

  try {
    const data = await remoteApi(path, options);
    state.runtimeMode = 'server';
    return data;
  } catch (err) {
    state.runtimeMode = 'local';
    const local = await localApi(path, options);
    if (local.ok === false) throw new Error(local.error || String(err.message || err));
    return local;
  }
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function countWords(text = '') {
  return (String(text).trim().match(/\b[\w'-]+\b/g) || []).length;
}

function renderSummary(summary) {
  const root = qs('summaryCards');
  const note = qs('summaryNote');
  const cards = [
    ['Reading Tasks', summary.readingCount],
    ['Grammar Tasks', summary.grammarCount],
    ['Writing Prompts', summary.writingCount],
    ['Listening Pods', summary.listeningCount],
    ['Dictionary Words', summary.dictionaryCount],
    ['Departments', summary.departmentCount],
  ];

  root.innerHTML = cards
    .map(
      ([label, value]) =>
        `<div class="summary-card"><div class="value">${value}</div><div class="label">${escapeHtml(label)}</div></div>`,
    )
    .join('');

  const modeLabel = state.runtimeMode === 'server' ? 'Live API mode' : 'Git static mode';
  note.textContent = `${modeLabel} • BUEPT dataset loaded`;
}

async function loadSummary() {
  try {
    const data = await api('/api/summary');
    renderSummary(data.summary || {});
  } catch (e) {
    qs('summaryNote').textContent = `Summary load failed: ${e.message}`;
  }
}

function renderWordEntry(entry) {
  if (!entry) return '<p class="muted">No entry found.</p>';
  const syn = (entry.synonyms || []).slice(0, 8).map((s) => `<span class="pill">${escapeHtml(s)}</span>`).join('');
  const ant = (entry.antonyms || []).slice(0, 6).map((s) => `<span class="pill">${escapeHtml(s)}</span>`).join('');
  const col = (entry.collocations || []).slice(0, 6).map((s) => `<span class="pill">${escapeHtml(s)}</span>`).join('');
  const ex = (entry.examples || []).slice(0, 2).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const fam = (entry.derivatives || []).slice(0, 6).map((x) => `<span class="pill">${escapeHtml(x)}</span>`).join('');

  return `
    <h3>${escapeHtml(entry.word)} <span class="muted">${escapeHtml(entry.level || '')} ${escapeHtml(entry.wordType || '')}</span></h3>
    <p>${escapeHtml(entry.definition || '-')}</p>
    <p><b>Synonyms:</b> ${syn || '<span class="muted">No synonyms.</span>'}</p>
    <p><b>Antonyms:</b> ${ant || '<span class="muted">No antonyms.</span>'}</p>
    <p><b>Collocations:</b> ${col || '<span class="muted">No collocations.</span>'}</p>
    <p><b>Word Family:</b> ${fam || '<span class="muted">No derivatives.</span>'}</p>
    ${ex ? `<ul>${ex}</ul>` : '<p class="muted">No example sentence.</p>'}
  `;
}

async function searchVocab() {
  const q = qs('vocabQuery').value.trim();
  if (!q) return;

  qs('vocabResult').innerHTML = '<p class="muted">Searching...</p>';
  try {
    const data = await api(`/api/vocab/search?q=${encodeURIComponent(q)}`);
    const first = (data.hits || [])[0];

    if (!first) {
      qs('vocabResult').innerHTML = '<p class="warn">Word not found. Try another spelling.</p>';
      return;
    }

    const rest = (data.hits || []).slice(1, 8).map((x) => `<span class="pill">${escapeHtml(x.word)}</span>`).join('');
    qs('vocabResult').innerHTML = renderWordEntry(first) + (rest ? `<p class="muted">Related: ${rest}</p>` : '');
  } catch (e) {
    qs('vocabResult').innerHTML = `<p class="bad">Search failed: ${escapeHtml(e.message)}</p>`;
  }
}

async function randomVocab() {
  qs('vocabResult').innerHTML = '<p class="muted">Loading random word...</p>';
  try {
    const data = await api('/api/vocab/random');
    qs('vocabResult').innerHTML = renderWordEntry(data.item);
  } catch (e) {
    qs('vocabResult').innerHTML = `<p class="bad">Failed: ${escapeHtml(e.message)}</p>`;
  }
}

async function loadDepartments() {
  const select = qs('departmentSelect');
  try {
    const data = await api('/api/vocab/departments');
    const rows = data.departments || [];
    select.innerHTML =
      '<option value="">Select Department</option>' +
      rows.map((r) => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.department)} (${r.wordCount})</option>`).join('');
  } catch (_e) {
    select.innerHTML = '<option value="">Departments unavailable</option>';
  }
}

async function loadDepartmentWords() {
  const dep = qs('departmentSelect').value;
  if (!dep) return;

  qs('vocabResult').innerHTML = '<p class="muted">Loading department vocabulary...</p>';
  try {
    const data = await api(`/api/vocab/department?department=${encodeURIComponent(dep)}&limit=60`);
    const words = (data.words || [])
      .slice(0, 20)
      .map((w) => `<li><b>${escapeHtml(w.word)}</b>: ${escapeHtml(w.definition || '-')}</li>`)
      .join('');

    qs('vocabResult').innerHTML = `
      <h3>${escapeHtml(data.department)}</h3>
      <p class="muted">Top 20 useful terms</p>
      <ul>${words}</ul>
    `;
  } catch (e) {
    qs('vocabResult').innerHTML = `<p class="bad">Failed: ${escapeHtml(e.message)}</p>`;
  }
}

function renderQuestion(task, type) {
  if (!task || !task.question) return '<p class="muted">No question.</p>';
  const q = task.question;

  const opts = (q.options || [])
    .map((opt, idx) => `<label class="opt"><input type="radio" name="${type}Opt" value="${idx}" /> ${escapeHtml(opt)}</label>`)
    .join('');

  return `
    <h3>${escapeHtml(task.title || '')} <span class="pill">${escapeHtml(task.level || '')}</span></h3>
    ${task.text ? `<p>${escapeHtml(task.text).slice(0, 2600).replace(/\n/g, '<br/>')}</p>` : ''}
    ${task.explain ? `<p class="muted">${escapeHtml(task.explain).slice(0, 800)}</p>` : ''}
    <div class="question">
      <p><b>${escapeHtml(q.q || '')}</b></p>
      ${opts}
      <button class="btn ghost" onclick="checkAnswer('${type}')">Check Answer</button>
      <div id="${type}Feedback" class="muted"></div>
    </div>
  `;
}

window.checkAnswer = function checkAnswer(type) {
  const task = state[type];
  if (!task || !task.question) return;

  const selected = document.querySelector(`input[name="${type}Opt"]:checked`);
  if (!selected) {
    qs(`${type}Feedback`).innerHTML = '<span class="warn">Select an option first.</span>';
    return;
  }

  const selectedIndex = Number(selected.value);
  const correct = task.question.answer;

  if (selectedIndex === correct) {
    qs(`${type}Feedback`).innerHTML = `<span class="good">Correct.</span> ${escapeHtml(task.question.explain || '')}`;
  } else {
    const answerText = (task.question.options || [])[correct] || `Option ${correct + 1}`;
    qs(`${type}Feedback`).innerHTML = `<span class="bad">Not correct.</span> Correct: <b>${escapeHtml(answerText)}</b>. ${escapeHtml(task.question.explain || '')}`;
  }
};

async function loadReading() {
  const level = qs('readingLevel').value;
  qs('readingResult').innerHTML = '<p class="muted">Loading reading task...</p>';

  try {
    const data = await api(`/api/reading/random${level ? `?level=${encodeURIComponent(level)}` : ''}`);
    state.reading = data.task;
    qs('readingResult').innerHTML = renderQuestion(state.reading, 'reading');
  } catch (e) {
    qs('readingResult').innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`;
  }
}

async function loadGrammar() {
  const level = qs('grammarLevel').value;
  qs('grammarResult').innerHTML = '<p class="muted">Loading grammar task...</p>';

  try {
    const data = await api(`/api/grammar/random${level ? `?level=${encodeURIComponent(level)}` : ''}`);
    state.grammar = data.task;
    qs('grammarResult').innerHTML = renderQuestion(state.grammar, 'grammar');
  } catch (e) {
    qs('grammarResult').innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`;
  }
}

async function loadWritingPrompt() {
  const level = qs('writingLevel').value;
  qs('writingPrompt').innerHTML = '<p class="muted">Loading prompt...</p>';

  try {
    const data = await api(`/api/writing/random${level ? `?level=${encodeURIComponent(level)}` : ''}`);
    state.writing = data.prompt;

    qs('writingPrompt').innerHTML = `
      <h3>${escapeHtml(data.prompt?.topic || 'Writing Prompt')} <span class="pill">${escapeHtml(data.prompt?.level || '')}</span></h3>
      <p>${escapeHtml(data.prompt?.prompt || '')}</p>
      <p class="muted">Type: ${escapeHtml(data.prompt?.type || '')} | Task: ${escapeHtml(data.prompt?.task || '')}</p>
      <div>${(data.prompt?.keywords || []).map((k) => `<span class="pill">${escapeHtml(k)}</span>`).join('')}</div>
    `;
  } catch (e) {
    qs('writingPrompt').innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`;
  }
}

function writingFeedback() {
  const text = qs('writingInput').value;
  const wc = countWords(text);
  qs('wordCount').textContent = `${wc} words`;

  if (!text.trim()) {
    qs('writingFeedback').innerHTML = '<p class="muted">Write first, then check feedback.</p>';
    return;
  }

  const sentences = text.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean).length;
  const avg = sentences ? Math.round((wc / sentences) * 10) / 10 : wc;
  const connectors = ['however', 'therefore', 'moreover', 'in addition', 'for example', 'on the other hand'];
  const connectorHits = connectors.filter((c) => text.toLowerCase().includes(c)).length;

  let score = 50;
  if (wc >= 120) score += 15;
  if (sentences >= 5) score += 10;
  if (avg >= 10) score += 8;
  if (connectorHits >= 2) score += 10;
  score = Math.min(95, score);

  const tips = [];
  if (wc < 120) tips.push('Increase length to at least 120 words for stronger development.');
  if (sentences < 5) tips.push('Use more complete sentences to structure your argument.');
  if (connectorHits < 2) tips.push('Add transition signals (however, therefore, in addition).');
  if (!tips.length) tips.push('Good baseline. Next step: strengthen precision with topic-specific vocabulary.');

  qs('writingFeedback').innerHTML = `
    <p><b>Quick Score:</b> <span class="good">${score}/100</span></p>
    <p class="muted">Sentences: ${sentences} | Avg words/sentence: ${avg} | Connectors used: ${connectorHits}</p>
    <ul>${tips.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
  `;
}

async function loadPodcasts() {
  const root = qs('podcasts');
  root.innerHTML = '<p class="muted">Loading podcasts...</p>';

  try {
    const data = await api('/api/listening/podcasts');
    const items = (data.podcasts || [])
      .map(
        (p) => `
      <div class="calendar-item">
        <b>${escapeHtml(p.title)}</b> <span class="pill">${escapeHtml(p.level || '')}</span> <span class="pill">${escapeHtml(p.category || '')}</span>
        <div class="muted">${escapeHtml(p.source || '')} • ${escapeHtml(p.duration || '')}</div>
        <div>${escapeHtml(p.focus || '')}</div>
        <a href="${escapeHtml(p.url || '#')}" target="_blank" rel="noreferrer">Open podcast</a>
      </div>
    `,
      )
      .join('');

    root.innerHTML = `<div class="calendar-list">${items}</div>`;
  } catch (e) {
    root.innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`;
  }
}

async function loadCalendar() {
  const root = qs('calendar');
  root.innerHTML = '<p class="muted">Loading calendar...</p>';

  try {
    const data = await api('/api/calendar');
    const c = data.calendar || {};
    const meta = c.meta || {};

    const holidays = (c.holidays || [])
      .slice(0, 12)
      .map((h) => {
        if (typeof h === 'string') return `<div class="calendar-item">${escapeHtml(h)}</div>`;
        const date = h.date || h.startDate || h.day || '-';
        const label = h.name || h.title || h.label || JSON.stringify(h);
        return `<div class="calendar-item"><b>${escapeHtml(date)}</b> — ${escapeHtml(label)}</div>`;
      })
      .join('');

    root.innerHTML = `
      <p><b>Term:</b> ${escapeHtml(meta.term || meta.name || 'BUEPT 2025-2026')}</p>
      <p class="muted">Holiday snapshot + schedule data loaded</p>
      <div class="calendar-list">${holidays || '<div class="calendar-item">No holiday list</div>'}</div>
    `;
  } catch (e) {
    root.innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`;
  }
}

function appendChat(role, text) {
  const log = qs('chatLog');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = escapeHtml(text).replace(/\n/g, '<br/>');
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

async function sendChat() {
  const input = qs('chatInput');
  const message = input.value.trim();
  if (!message) return;

  appendChat('user', message);
  input.value = '';

  try {
    const data = await api('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    appendChat('bot', data.reply || 'No reply.');
    if (Array.isArray(data.suggestions) && data.suggestions.length) {
      appendChat('bot', `Suggestions: ${data.suggestions.join(' | ')}`);
    }
  } catch (e) {
    appendChat('bot', `Error: ${e.message}`);
  }
}

function bind() {
  qs('refreshSummary').addEventListener('click', loadSummary);
  qs('apiStatus').addEventListener('click', async () => {
    try {
      const status = await api('/api/status');
      alert(`Mode: ${state.runtimeMode}\nService: ${status.service}\nTime: ${status.now}`);
    } catch (e) {
      alert(`Status check failed: ${e.message}`);
    }
  });
  qs('searchVocab').addEventListener('click', searchVocab);
  qs('randomVocab').addEventListener('click', randomVocab);
  qs('loadDepartmentWords').addEventListener('click', loadDepartmentWords);

  qs('nextReading').addEventListener('click', loadReading);
  qs('nextGrammar').addEventListener('click', loadGrammar);
  qs('nextWriting').addEventListener('click', loadWritingPrompt);

  qs('writingInput').addEventListener('input', () => {
    qs('wordCount').textContent = `${countWords(qs('writingInput').value)} words`;
  });

  qs('quickWritingFeedback').addEventListener('click', writingFeedback);
  qs('chatSend').addEventListener('click', sendChat);
  qs('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChat();
  });
}

async function init() {
  bind();
  appendChat('bot', 'Coach is ready. Ask in English for strategy, vocabulary, grammar, or writing help.');

  await Promise.allSettled([
    loadSummary(),
    loadDepartments(),
    randomVocab(),
    loadReading(),
    loadGrammar(),
    loadWritingPrompt(),
    loadPodcasts(),
    loadCalendar(),
  ]);
}

init();
