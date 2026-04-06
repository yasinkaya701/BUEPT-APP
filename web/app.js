const state = {
  reading: null,
  grammar: null,
  writing: null,
  chatHistory: []
};

function qs(id) {
  return document.getElementById(id);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
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

// ==============
// ORIGINAL LOGIC
// ==============

function renderSummary(summary) {
  const root = qs('summaryCards');
  const note = qs('summaryNote');
  const cards = [
    ['Reading Tasks', summary.readingCount],
    ['Grammar Tasks', summary.grammarCount],
    ['Writing Prompts', summary.writingCount],
    ['Listening Pods', summary.listeningCount],
    ['Dictionary Words', summary.dictionaryCount],
    ['Departments', summary.departmentCount]
  ];
  root.innerHTML = cards
    .map(([label, value]) => `<div class="summary-card"><div class="value">${value}</div><div class="label">${escapeHtml(label)}</div></div>`)
    .join('');
  note.textContent = 'Data loaded from your local BUEPT dataset.';
}

async function loadSummary() {
  try {
    const data = await api('/api/summary');
    renderSummary(data.summary || {});
  } catch (e) { qs('summaryNote').textContent = `Summary load failed: ${e.message}`; }
}

function renderWordEntry(entry) {
  if (!entry) return '<p class="muted">No entry found.</p>';
  const syn = (entry.synonyms || []).slice(0, 8).map((s) => `<span class="pill">${escapeHtml(s)}</span>`).join('');
  const ex = (entry.examples || []).slice(0, 2).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  return `
    <h3>${escapeHtml(entry.word)} <span class="muted">${escapeHtml(entry.level || '')} ${escapeHtml(entry.wordType || '')}</span></h3>
    <p>${escapeHtml(entry.definition || '-')}</p>
    <div>${syn || '<span class="muted">No synonyms.</span>'}</div>
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
    if (!first) { qs('vocabResult').innerHTML = '<p class="warn">Word not found. Try another spelling.</p>'; return; }
    const rest = (data.hits || []).slice(1, 8).map((x) => `<span class="pill">${escapeHtml(x.word)}</span>`).join('');
    qs('vocabResult').innerHTML = renderWordEntry(first) + (rest ? `<p class="muted">Related: ${rest}</p>` : '');
  } catch (e) { qs('vocabResult').innerHTML = `<p class="bad">Search failed: ${escapeHtml(e.message)}</p>`; }
}

async function randomVocab() {
  qs('vocabResult').innerHTML = '<p class="muted">Loading random word...</p>';
  try {
    const data = await api('/api/vocab/random');
    qs('vocabResult').innerHTML = renderWordEntry(data.item);
  } catch (e) { qs('vocabResult').innerHTML = `<p class="bad">Failed: ${escapeHtml(e.message)}</p>`; }
}

async function loadDepartments() {
  const select = qs('departmentSelect');
  try {
    const data = await api('/api/vocab/departments');
    const rows = data.departments || [];
    select.innerHTML = '<option value="">Select Department</option>' +
      rows.map((r) => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.department)} (${r.wordCount})</option>`).join('');
  } catch (e) { select.innerHTML = '<option value="">Departments unavailable</option>'; }
}

async function loadDepartmentWords() {
  const dep = qs('departmentSelect').value;
  if (!dep) return;
  qs('vocabResult').innerHTML = '<p class="muted">Loading department vocabulary...</p>';
  try {
    const data = await api(`/api/vocab/department?department=${encodeURIComponent(dep)}&limit=60`);
    const words = (data.words || []).slice(0, 20)
      .map((w) => `<li><b>${escapeHtml(w.word)}</b>: ${escapeHtml(w.definition || '-')}</li>`).join('');
    qs('vocabResult').innerHTML = `<h3>${escapeHtml(data.department)}</h3><p class="muted">Top 20 useful terms</p><ul>${words}</ul>`;
  } catch (e) { qs('vocabResult').innerHTML = `<p class="bad">Failed: ${escapeHtml(e.message)}</p>`; }
}

function renderQuestion(task, type) {
  if (!task || !task.question) return '<p class="muted">No question.</p>';
  const q = task.question;
  const opts = (q.options || []).map((opt, idx) => {
    return `<label class="opt"><input type="radio" name="${type}Opt" value="${idx}" /> ${escapeHtml(opt)}</label>`;
  }).join('');

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
  const selected = document.querySelector(`input[name=\"${type}Opt\"]:checked`);
  if (!selected) { qs(`${type}Feedback`).innerHTML = '<span class="warn">Select an option first.</span>'; return; }
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
  } catch (e) { qs('readingResult').innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`; }
}

async function loadGrammar() {
  const level = qs('grammarLevel').value;
  qs('grammarResult').innerHTML = '<p class="muted">Loading grammar task...</p>';
  try {
    const data = await api(`/api/grammar/random${level ? `?level=${encodeURIComponent(level)}` : ''}`);
    state.grammar = data.task;
    qs('grammarResult').innerHTML = renderQuestion(state.grammar, 'grammar');
  } catch (e) { qs('grammarResult').innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`; }
}

async function loadWritingPrompt() {
  const level = qs('writingLevel').value;
  qs('writingPrompt').innerHTML = '<p class="muted">Loading prompt...</p>';
  try {
    const data = await api(`/api/writing/random${level ? `?level=${encodeURIComponent(level)}` : ''}`);
    state.writing = data.prompt;
    qs('writingPrompt').innerHTML = `
      <h3>${escapeHtml(data.prompt.topic || 'Writing Prompt')} <span class="pill">${escapeHtml(data.prompt.level || '')}</span></h3>
      <p>${escapeHtml(data.prompt.prompt || '')}</p>
      <p class="muted">Type: ${escapeHtml(data.prompt.type || '')} | Task: ${escapeHtml(data.prompt.task || '')}</p>
      <div>${(data.prompt.keywords || []).map((k) => `<span class="pill">${escapeHtml(k)}</span>`).join('')}</div>
    `;
  } catch (e) { qs('writingPrompt').innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`; }
}

async function loadPodcasts() {
  const root = qs('podcasts');
  root.innerHTML = '<p class="muted">Loading podcasts...</p>';
  try {
    const data = await api('/api/listening/podcasts');
    const items = (data.podcasts || []).map((p) => `
      <div class="calendar-item">
        <b>${escapeHtml(p.title)}</b> <span class="pill">${escapeHtml(p.level || '')}</span> <span class="pill">${escapeHtml(p.category || '')}</span>
        <div class="muted">${escapeHtml(p.source || '')} • ${escapeHtml(p.duration || '')}</div>
        <div>${escapeHtml(p.focus || '')}</div>
        <a href="${escapeHtml(p.url || '#')}" target="_blank" rel="noreferrer">Open podcast</a>
      </div>
    `).join('');
    root.innerHTML = `<div class="calendar-list">${items}</div>`;
  } catch (e) { root.innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`; }
}

async function loadCalendar() {
  const root = qs('calendar');
  root.innerHTML = '<p class="muted">Loading calendar...</p>';
  try {
    const data = await api('/api/calendar');
    const c = data.calendar || {};
    const meta = c.meta || {};
    const holidays = (c.holidays || []).slice(0, 12).map((h) => {
      if (typeof h === 'string') return `<div class="calendar-item">${escapeHtml(h)}</div>`;
      const date = h.date || h.startDate || h.day || '-';
      const label = h.name || h.title || h.label || JSON.stringify(h);
      return `<div class="calendar-item"><b>${escapeHtml(date)}</b> — ${escapeHtml(label)}</div>`;
    }).join('');

    root.innerHTML = `
      <p><b>Term:</b> ${escapeHtml(meta.term || meta.name || 'BUEPT 2025-2026')} </p>
      <p class="muted">Holiday snapshot + schedule data loaded</p>
      <div class="calendar-list">${holidays || '<div class="calendar-item">No holiday list</div>'}</div>
    `;
  } catch (e) { root.innerHTML = `<p class="bad">${escapeHtml(e.message)}</p>`; }
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
      body: JSON.stringify({ message })
    });
    appendChat('bot', data.reply || 'No reply.');
    if (Array.isArray(data.suggestions) && data.suggestions.length) {
      appendChat('bot', `Suggestions: ${data.suggestions.join(' | ')}`);
    }
  } catch (e) { appendChat('bot', `Error: ${e.message}`); }
}

// ----------------------------------------------------
// NEW MOBILE MODULES LOGIC
// ----------------------------------------------------
async function submitMockModule() {
  const btn = qs('submitMockModule');
  const fb = qs('mockFeedback');
  const level = qs('mockLevel').value;
  btn.disabled = true; fb.style.display = 'block'; fb.innerHTML = '<p class="muted">Generating Mock Exam...</p>';
  try {
    const data = await api('/api/module', {
      method: 'POST', body: JSON.stringify({ kind: 'proficiency_mock', count: 5, level: level })
    });
    const questions = (data.questions || []).map((q, i) => `
      <div style="margin-bottom:12px; border-bottom:1px solid #d9e1ef; padding-bottom:8px">
        <p style="margin:0 0 6px"><b>Q${i+1}.</b> ${escapeHtml(q.text)}</p>
        <p class="muted" style="margin:0;">${(q.options||[]).map(o=>`[ ] ${escapeHtml(o)}`).join('<br/>')}</p>
      </div>
    `).join('');
    fb.innerHTML = `<h3>Mock Ready (${data.level})</h3>${questions}`;
  } catch(e) { fb.innerHTML = `<p class="bad">Failed: ${e.message}</p>`; }
  finally { btn.disabled = false; }
}

async function submitTemplateModule() {
  const btn = qs('submitTemplateModule');
  const fb = qs('templateFeedback');
  const topic = qs('templateTopic').value.trim();
  if(!topic) return;
  btn.disabled = true; fb.style.display = 'block'; fb.innerHTML = '<p class="muted">Drafting Template...</p>';
  try {
    const data = await api('/api/module', {
      method: 'POST', body: JSON.stringify({ kind: 'academic_writing_template', topic: topic, level:'C1' })
    });
    fb.innerHTML = `<h3>Academic Template</h3><p style="white-space:pre-wrap; background:#f5f8ff; padding:10px; border-radius:8px">${escapeHtml(data.template)}</p>`;
  } catch(e) { fb.innerHTML = `<p class="bad">Failed: ${e.message}</p>`; }
  finally { btn.disabled = false; }
}

async function submitWeakPointModule() {
  const btn = qs('submitWeakPointModule');
  const fb = qs('weakpointFeedback');
  btn.disabled = true; fb.style.display = 'block'; fb.innerHTML = '<p class="muted">Analyzing local device history...</p>';
  try {
    const data = await api('/api/module', {
      method: 'POST', body: JSON.stringify({ kind: 'weak_point_analysis', tasks: [] })
    });
    fb.innerHTML = `<h3>Analysis Complete</h3><p><b>Weakest Area:</b> ${escapeHtml(data.weakestArea || 'Unknown')}</p><p class="muted">${escapeHtml(data.recommendation)}</p>`;
  } catch(e) { fb.innerHTML = `<p class="bad">Failed: ${e.message}</p>`; }
  finally { btn.disabled = false; }
}

async function submitPhotoModule() {
  const text = qs('photoVocabText').value.trim();
  if (!text) return;
  const btn = qs('submitPhotoModule');
  const fb = qs('photoFeedback');
  btn.disabled = true; fb.style.display = 'block'; fb.innerHTML = '<p class="muted">Extracting Target Vocabulary...</p>';
  try {
    const data = await api('/api/module', {
      method: 'POST', body: JSON.stringify({ kind: 'photo_vocab_extract', text: text, limit: 6 })
    });
    const words = (data.words || []).map(w => `<span class="pill">${escapeHtml(w.word)}</span>`).join('');
    fb.innerHTML = `<h3>Key Extractions</h3><div>${words || '<p class="muted">No advanced words found.</p>'}</div>`;
  } catch(e) { fb.innerHTML = `<p class="bad">Failed: ${e.message}</p>`; }
  finally { btn.disabled = false; }
}

async function submitSpeakingAi() {
  const text = qs('speakingInput').value.trim();
  if (!text) return;
  const btn = qs('submitSpeakingAi'); const fb = qs('speakingFeedback');
  btn.disabled = true; fb.style.display = 'block'; fb.innerHTML = '<p class="muted">Processing Speech...</p>';
  try {
    const data = await api('/api/speaking', {
      method: 'POST', body: JSON.stringify({ text, history: state.chatHistory })
    });
    const reply = data.text || data.reply || '';
    state.chatHistory.push({ role: 'user', content: text }, { role: 'assistant', content: reply });
    fb.innerHTML = `<p style="background:#f5f8ff; padding:10px; border-radius:8px"><b>AI Coach:</b> ${escapeHtml(reply)}</p>`;
  } catch(e) { fb.innerHTML = `<p class="bad">Failed: ${escapeHtml(e.message)}</p>`; }
  finally { btn.disabled = false; qs('speakingInput').value = ''; }
}

async function submitPresAi() {
  const topic = qs('mediaTopic').value.trim();
  if (!topic) return;
  const btn = qs('submitPresAi'); const fb = qs('mediaFeedback');
  btn.disabled = true; fb.style.display = 'block'; fb.innerHTML = '<p class="muted">Synthesizing slides...</p>';
  try {
    const data = await api('/api/presentation', {
      method: 'POST', body: JSON.stringify({ topic, level: 'B2', durationMin: 10 })
    });
    const slides = (data.slides || []).map((s, i) => `
      <div style="background:#fdfefe; border: 1px solid #d8dfeb; padding:10px; border-radius:8px; margin-bottom:10px;">
        <h4 style="margin:0 0 5px;">Slide ${i+1}: ${escapeHtml(s.title)}</h4>
        <ul style="margin:5px 0 10px; padding-left:15px;">${(s.points||[]).map(p=>`<li>${escapeHtml(p)}</li>`).join('')}</ul>
      </div>
    `).join('');
    fb.innerHTML = `<h3>${escapeHtml(data.title)}</h3>${slides}`;
  } catch(e) { fb.innerHTML = `<p class="bad">Failed: ${escapeHtml(e.message)}</p>`; }
  finally { btn.disabled = false; }
}

async function submitVideoAi() {
  const topic = qs('mediaTopic').value.trim();
  if (!topic) return;
  const btn = qs('submitVideoAi'); const fb = qs('mediaFeedback');
  btn.disabled = true; fb.style.display = 'block'; fb.innerHTML = '<p class="muted">Storyboarding video lesson...</p>';
  try {
    const data = await api('/api/video-lesson', {
      method: 'POST', body: JSON.stringify({ topic, level: 'B2' })
    });
    const scenes = (data.scenes || data.storyboard || []).map((s, i) => `
      <div style="border-bottom:1px dashed #d9e1ef; padding-bottom:8px; margin-bottom:8px">
        <b>Scene ${i+1}:</b> ${escapeHtml(s.visual || s.text || JSON.stringify(s))}
      </div>
    `).join('');
    fb.innerHTML = `<h3>${escapeHtml(data.title || topic + ' Lesson')}</h3>${scenes}`;
  } catch(e) { fb.innerHTML = `<p class="bad">Failed: ${escapeHtml(e.message)}</p>`; }
  finally { btn.disabled = false; }
}

async function submitWritingAi() {
  const text = qs('writingInput').value;
  if (countWords(text) < 5) return;
  const btn = qs('submitWritingAi');
  btn.disabled = true; qs('writingFeedback').style.display = 'block'; qs('writingFeedback').innerHTML = '<p class="muted">Evaluating Essay...</p>';
  try {
    const data = await api('/api/writing-revision', {
      method: 'POST', body: JSON.stringify({ text, prompt: state.writing ? state.writing.prompt : '', level: 'C1' })
    });
    qs('writingFeedback').innerHTML = `<p><b>Score: <span class="good">${data.score || '-'}</span></b></p>
      <p><b>Strengths:</b> ${(data.strengths||[]).join(', ')}</p>
      <p><b>Areas to Improve:</b> ${(data.weaknesses||[]).join(', ')}</p>`;
  } catch(e) { qs('writingFeedback').innerHTML = `<p class="bad">Failed: ${escapeHtml(e.message)}</p>`; }
  finally { btn.disabled = false; }
}

// ----------------------------------------------------
// BIND EVENTS
// ----------------------------------------------------
function bind() {
  qs('refreshSummary').addEventListener('click', loadSummary);
  qs('searchVocab').addEventListener('click', searchVocab);
  qs('randomVocab').addEventListener('click', randomVocab);
  qs('loadDepartmentWords').addEventListener('click', loadDepartmentWords);

  qs('nextReading').addEventListener('click', loadReading);
  qs('nextGrammar').addEventListener('click', loadGrammar);
  qs('nextWriting').addEventListener('click', loadWritingPrompt);

  qs('writingInput').addEventListener('input', () => { qs('wordCount').textContent = `${countWords(qs('writingInput').value)} words`; });
  qs('submitWritingAi').addEventListener('click', submitWritingAi);

  qs('chatSend').addEventListener('click', sendChat);
  qs('chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChat(); });

  // NEW MODULES
  qs('submitMockModule').addEventListener('click', submitMockModule);
  qs('submitTemplateModule').addEventListener('click', submitTemplateModule);
  qs('submitWeakPointModule').addEventListener('click', submitWeakPointModule);
  qs('submitPhotoModule').addEventListener('click', submitPhotoModule);
  qs('submitSpeakingAi').addEventListener('click', submitSpeakingAi);
  qs('submitPresAi').addEventListener('click', submitPresAi);
  qs('submitVideoAi').addEventListener('click', submitVideoAi);
}

async function init() {
  bind();
  appendChat('bot', 'Coach is ready. Ask for a strategy, random task, or vocabulary definition.');

  await Promise.allSettled([
    loadSummary(),
    loadDepartments(),
    randomVocab(),
    loadReading(),
    loadGrammar(),
    loadWritingPrompt(),
    loadPodcasts(),
    loadCalendar()
  ]);
}

init();
