(() => {
  'use strict';

  const SAVE_KEY = 'memento-engine-save-v1';
  const $ = (id) => document.getElementById(id);
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const pct = (n) => `${Math.round(clamp(n) * 100)}%`;
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const PAIRS = {
    fear: 'bravery', bravery: 'fear',
    curiosity: 'avoidance', avoidance: 'curiosity',
    trust: 'suspicion', suspicion: 'trust',
    attachment: 'detachment', detachment: 'attachment',
    caution: 'impulse', impulse: 'caution',
    hope: 'despair', despair: 'hope'
  };
  const LABELS = {
    fear: 'Fear', bravery: 'Bravery', curiosity: 'Curiosity', avoidance: 'Avoidance',
    trust: 'Trust', suspicion: 'Suspicion', attachment: 'Attachment', detachment: 'Detachment',
    caution: 'Caution', impulse: 'Impulse', hope: 'Hope', despair: 'Despair'
  };
  const VISIBLE_ASSOCIATIONS = ['fear', 'bravery', 'curiosity', 'trust', 'caution', 'attachment'];

  const MEMORY_SEED = [
    {
      id: 'red', title: 'The Red Corridor', code: 'FRAGMENT 00A', icon: '▥', type: 'FEAR / DANGER',
      quote: '“The alarms turned red, and no one came back.”',
      tags: ['red', 'alarm', 'corridor', 'danger', 'light'], trace: 0.76,
      associations: { fear: .76, bravery: .24, curiosity: .31, avoidance: .61, trust: .23, suspicion: .58, attachment: .15, detachment: .62, caution: .68, impulse: .18, hope: .14, despair: .51 }
    },
    {
      id: 'voice', title: 'The Voice on the Line', code: 'FRAGMENT 01C', icon: '⌁', type: 'TRUST / ATTACHMENT',
      quote: '“Wait here. I will come back for you. I promise.”',
      tags: ['voice', 'signal', 'promise', 'human', 'echo'], trace: 0.68,
      associations: { fear: .22, bravery: .40, curiosity: .43, avoidance: .17, trust: .67, suspicion: .28, attachment: .78, detachment: .12, caution: .29, impulse: .28, hope: .73, despair: .16 }
    },
    {
      id: 'water', title: 'Cool Water', code: 'FRAGMENT 02B', icon: '≈', type: 'CURIOSITY / RELIEF',
      quote: '“The water was cold. For one second, everything was quiet.”',
      tags: ['water', 'resource', 'flood', 'dark', 'relief'], trace: 0.59,
      associations: { fear: .27, bravery: .45, curiosity: .69, avoidance: .21, trust: .43, suspicion: .19, attachment: .35, detachment: .18, caution: .52, impulse: .29, hope: .49, despair: .16 }
    },
    {
      id: 'crest', title: 'The White Crest', code: 'FRAGMENT 03D', icon: '◇', type: 'CURIOSITY / ACCESS',
      quote: '“The crest opened every door. No one asked who I was.”',
      tags: ['security', 'door', 'access', 'medical', 'light'], trace: 0.63,
      associations: { fear: .21, bravery: .48, curiosity: .66, avoidance: .16, trust: .38, suspicion: .31, attachment: .28, detachment: .20, caution: .44, impulse: .35, hope: .55, despair: .15 }
    },
    {
      id: 'heat', title: 'A Necessary Heat', code: 'FRAGMENT 04F', icon: '△', type: 'CAUTION / SACRIFICE',
      quote: '“Heat can clear a path. It always takes something with it.”',
      tags: ['danger', 'reactor', 'heat', 'red', 'sacrifice'], trace: 0.54,
      associations: { fear: .55, bravery: .39, curiosity: .39, avoidance: .41, trust: .31, suspicion: .34, attachment: .43, detachment: .24, caution: .78, impulse: .12, hope: .32, despair: .33 }
    }
  ];

  const ROOMS = [
    {
      code: 'SECTOR 01-A', title: 'The Red Corridor', subtitle: 'Emergency lighting · Access route compromised', coords: 'X: 04.18 / Y: 11.02',
      environment: 'UNSTABLE', weather: 'ATMOSPHERE: LOW OXYGEN', caption: 'A light flickers beyond the sealed door.', focusTags: ['red', 'alarm', 'corridor', 'danger'], theme: 'red',
      thought: [
        'The red light means something. I just can’t reach the memory.',
        'I have been here before. Or someone made me believe I have.',
        'There is a door. There is always a door. The question is what waits behind it.'
      ],
      actions: [
        { id: 'cross', name: 'Cross the lit passage', desc: 'Move through the emergency lights toward the sealed transit door.', icon: '01', progress: true,
          score: (t) => .34 + t.resolve * .38 + (1 - t.fear) * .16 - t.caution * .06 + t.curiosity * .08 },
        { id: 'detour', name: 'Search for another route', desc: 'Inspect the maintenance seams for a way around the danger.', icon: '02', progress: true,
          score: (t) => .30 + t.curiosity * .29 + t.caution * .23 + t.fear * .08 },
        { id: 'wait', name: 'Wait for a signal', desc: 'Stay still and listen for the voice hidden beneath the alarm.', icon: '03', progress: false,
          // Waiting can be a smart first move, but repeated waiting loses utility.
          score: (t, s) => .30 + t.trust * .25 + t.attachment * .18 + t.fear * .11 + t.hope * .11 - Math.min(s.waited || 0, 3) * .26 }
      ]
    },
    {
      code: 'SECTOR 02-B', title: 'The Flooded Atrium', subtitle: 'Water ingress · Power grid partially active', coords: 'X: 09.31 / Y: 06.44',
      environment: 'FLOODED', weather: 'ATMOSPHERE: 91% HUMIDITY', caption: 'A broken speaker whispers from beneath the water.', focusTags: ['water', 'echo', 'resource', 'dark', 'voice'], theme: 'water',
      thought: [
        'The water feels familiar. I don’t know whether that should comfort me.',
        'Someone is speaking through the static. I need to decide if I trust the voice.',
        'There could be supplies beneath the surface. There could be anything.'
      ],
      actions: [
        { id: 'wade', name: 'Wade through the atrium', desc: 'Take the direct route while the water level is still dropping.', icon: '01', progress: true,
          score: (t) => .27 + t.resolve * .39 + t.caution * .07 + (1 - t.fear) * .19 },
        { id: 'salvage', name: 'Salvage medical supplies', desc: 'Search a half-submerged emergency cabinet for stabilizers.', icon: '02', progress: false,
          score: (t, s) => s.salvaged ? .08 : .25 + t.curiosity * .27 + t.caution * .22 + t.resolve * .06 },
        { id: 'voice', name: 'Follow the distant voice', desc: 'Trust the signal and trace it to the maintenance bridge.', icon: '03', progress: true,
          score: (t) => .22 + t.trust * .32 + t.attachment * .20 + t.hope * .12 + t.curiosity * .06 },
        { id: 'dryroute', name: 'Trace the dry route', desc: 'Study the reflected lights to map a safer way across.', icon: '04', progress: true,
          score: (t) => .29 + t.curiosity * .23 + t.caution * .28 + t.fear * .08 }
      ]
    },
    {
      code: 'SECTOR 03-C', title: 'The Medical Bay', subtitle: 'Automated triage · Patient records corrupted', coords: 'X: 12.07 / Y: 02.82',
      environment: 'LOW POWER', weather: 'ATMOSPHERE: FILTERED', caption: 'A patient monitor is still tracking a heartbeat.', focusTags: ['medical', 'voice', 'light', 'memory', 'human', 'door'], theme: 'medical',
      thought: [
        'My hands know where the stabilizers are. My memory does not.',
        'This room remembers me better than I remember myself.',
        'A heartbeat. Mine? Someone else’s? I need to find the core.'
      ],
      actions: [
        { id: 'restore', name: 'Restore vital systems', desc: 'Use the med station to stabilize the body before proceeding.', icon: '01', progress: false,
          score: (t, s) => s.restored ? .08 : .27 + t.caution * .25 + (1 - t.fear) * .10 + (1 - t.resolve) * .08 },
        { id: 'log', name: 'Recover the voice log', desc: 'Pull the intact audio cache from a damaged patient terminal.', icon: '02', progress: false,
          score: (t, s) => s.logRecovered ? .08 : .25 + t.curiosity * .25 + t.attachment * .20 + t.trust * .12 },
        { id: 'door', name: 'Open the sealed transit door', desc: 'Use the White Crest access protocol and enter the core chamber.', icon: '03', progress: true,
          score: (t) => .29 + t.curiosity * .27 + t.resolve * .27 + t.bravery * .11 }
      ]
    },
    {
      code: 'SECTOR 04-Ω', title: 'The Memory Core', subtitle: 'Central intelligence · Identity boundary failing', coords: 'X: 00.00 / Y: 00.01',
      environment: 'CRITICAL', weather: 'ATMOSPHERE: SIMULATED', caption: 'The Architect is waiting inside the shape of a memory.', focusTags: ['security', 'red', 'voice', 'truth', 'reactor', 'human'], theme: 'core',
      thought: [
        'I can hear the voice clearly now. It sounds like me.',
        'If I leave this place, what parts of me will leave with me?',
        'The thing in the center knows every version of my name.'
      ],
      actions: [
        { id: 'confront', name: 'Confront the Architect', desc: 'Ask the intelligence to explain why your memories were altered.', icon: '01', progress: true,
          score: (t) => .22 + t.curiosity * .34 + t.resolve * .22 + t.trust * .12 - t.fear * .06 },
        { id: 'sever', name: 'Sever the memory network', desc: 'Destroy the link before the system can write another version of you.', icon: '02', progress: true,
          score: (t) => .25 + t.fear * .18 + t.resolve * .28 + t.caution * .20 - t.attachment * .11 },
        { id: 'merge', name: 'Merge the damaged fragment', desc: 'Accept the unfinished memory and let the core finish the story.', icon: '03', progress: true,
          score: (t) => .19 + t.trust * .25 + t.attachment * .28 + t.curiosity * .15 + t.hope * .09 }
      ]
    }
  ];

  const initialState = () => ({
    started: false, ended: false, roomIndex: 0, turn: 1, integrity: 92, load: 18, signals: 6,
    memories: JSON.parse(JSON.stringify(MEMORY_SEED)), selectedMemoryId: 'red', selectedAssociation: 'fear',
    log: [{ time: '00:00', kind: 'system', tag: 'SYS', text: 'Cognitive interface initialized. Awaiting subject link.' }],
    actionsTaken: 0, edits: 0, reframes: 0, roomsCleared: 0, salvaged: false, restored: false,
    logRecovered: false, hasPromise: false, waited: 0, waded: false, finalOutcome: null,
    startedAt: Date.now(), seed: Math.floor(Math.random() * 9999), lastThought: '', lastActionName: '',
  });

  let state = initialState();
  let isResolving = false;
  let canvasCtx = null;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let animationFrame = 0;
  let toastTimer = 0;
  let logExpanded = false;

  const sceneCanvas = $('scene-canvas');
  if (sceneCanvas) canvasCtx = sceneCanvas.getContext('2d');

  function room() { return ROOMS[state.roomIndex]; }
  function selectedMemory() { return state.memories.find(m => m.id === state.selectedMemoryId) || state.memories[0]; }
  function getActivation(memory, tags) {
    const overlap = memory.tags.filter(tag => tags.includes(tag)).length;
    return overlap ? Math.min(1, .68 + overlap * .12) : .20;
  }
  function deriveTraits() {
    const r = room();
    const sums = { fear: 0, bravery: 0, curiosity: 0, avoidance: 0, trust: 0, suspicion: 0, attachment: 0, detachment: 0, caution: 0, impulse: 0, hope: 0, despair: 0 };
    let denom = 0;
    for (const m of state.memories) {
      const weight = getActivation(m, r.focusTags) * (.45 + m.trace * .55);
      denom += weight;
      for (const key of Object.keys(sums)) sums[key] += (m.associations[key] ?? .3) * weight;
    }
    for (const key of Object.keys(sums)) sums[key] = denom ? sums[key] / denom : .35;
    const ratio = (a, b) => sums[a] / (sums[a] + sums[b] + .001);
    return {
      fear: clamp(.20 + ratio('fear', 'bravery') * .66, .08, .92),
      bravery: clamp(.18 + ratio('bravery', 'fear') * .64, .08, .92),
      curiosity: clamp(.20 + ratio('curiosity', 'avoidance') * .66, .08, .92),
      trust: clamp(.18 + ratio('trust', 'suspicion') * .66, .08, .92),
      attachment: clamp(.16 + ratio('attachment', 'detachment') * .68, .08, .92),
      caution: clamp(.18 + ratio('caution', 'impulse') * .66, .08, .92),
      hope: clamp(.16 + ratio('hope', 'despair') * .68, .08, .92),
      resolve: clamp(.27 + ratio('bravery', 'fear') * .43 + ratio('hope', 'despair') * .2, .08, .92),
      suspicion: clamp(ratio('suspicion', 'trust'), .05, .95)
    };
  }
  function currentActions() {
    const traits = deriveTraits();
    return room().actions.map(action => ({ ...action, utility: clamp(action.score(traits, state), .04, .98) }))
      .sort((a, b) => b.utility - a.utility);
  }
  function actionById(id) { return room().actions.find(a => a.id === id); }
  function fmtTime() {
    const seconds = Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
  }
  function addLog(kind, tag, text) {
    state.log.unshift({ time: fmtTime(), kind, tag, text });
    if (state.log.length > 45) state.log.length = 45;
    renderLog();
  }
  function saveState() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      $('save-indicator').textContent = 'AUTOSAVED';
      $('save-indicator').style.color = '#79a69b';
    } catch (err) {
      $('save-indicator').textContent = 'SESSION ONLY';
      $('save-indicator').style.color = '#d0a777';
    }
  }
  function loadSavedState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      if (!saved || !Array.isArray(saved.memories) || !Number.isInteger(saved.roomIndex)) return null;
      if (saved.roomIndex < 0 || saved.roomIndex > 3) return null;
      const merged = { ...initialState(), ...saved };
      merged.memories = saved.memories;
      return merged;
    } catch (_) { return null; }
  }
  function showToast(message) {
    const el = $('toast'); el.textContent = message; el.classList.add('show');
    window.clearTimeout(toastTimer); toastTimer = window.setTimeout(() => el.classList.remove('show'), 2300);
  }
  function setSaveLabel(text, color = '#79a69b') {
    $('save-indicator').textContent = text;
    $('save-indicator').style.color = color;
  }

  function renderAll() {
    renderHeader(); renderSubject(); renderRoom(); renderCandidates(); renderMemoryList(); renderSelectedMemory(); renderLog();
    $('run-decision').disabled = state.ended || isResolving;
  }
  function renderHeader() {
    $('session-id').textContent = `ME-${String(state.seed).padStart(4,'0')}`;
    $('sector-number').innerHTML = `${String(state.roomIndex + 1).padStart(2,'0')} <span class="slash">/</span> 04`;
    $('mission-label').textContent = state.ended ? 'SIMULATION COMPLETE' : `MEMORY FIELD ${String(state.roomIndex + 1).padStart(2,'0')} / LINK ACTIVE`;
    $('system-status').textContent = state.ended ? 'LINK TERMINATED' : (state.load > 78 ? 'COGNITIVE LOAD HIGH' : 'SYSTEM STABLE');
    $('turn-counter').textContent = `TURN ${String(state.turn).padStart(2,'0')}`;
  }
  function renderSubject() {
    const t = deriveTraits();
    $('integrity-value').textContent = `${Math.round(state.integrity)}%`;
    $('integrity-bar').style.width = `${clamp(state.integrity / 100) * 100}%`;
    $('integrity-bar').style.background = state.integrity < 36 ? 'linear-gradient(90deg,#8d4748,#e68d8c)' : '';
    $('load-value').textContent = `${Math.round(state.load)}%`;
    $('load-bar').style.width = `${clamp(state.load / 100) * 100}%`;
    $('signal-value').textContent = String(state.signals).padStart(2,'0');
    const pips = $('signal-pips'); pips.innerHTML = '';
    for (let i = 0; i < 8; i++) { const pip = document.createElement('i'); if (i < state.signals) pip.className = 'filled'; pips.appendChild(pip); }
    [['fear',t.fear],['curiosity',t.curiosity],['trust',t.trust],['resolve',t.resolve]].forEach(([key,val]) => {
      $(`trait-${key}`).style.width = `${Math.round(val * 100)}%`;
      $(`trait-${key}-value`).textContent = String(Math.round(val * 100)).padStart(2,'0');
    });
    const quotes = [
      '“I can almost remember the way out.”',
      '“The water feels familiar. I don’t know why.”',
      '“My hands know what to do. My memory doesn’t.”',
      '“If I leave, what parts of me will leave too?”'
    ];
    $('subject-quote').textContent = quotes[state.roomIndex];
  }
  function renderRoom() {
    const r = room();
    $('room-code').textContent = r.code; $('room-title').textContent = r.title; $('room-subtitle').textContent = r.subtitle;
    $('room-coords').textContent = r.coords; $('environment-status').textContent = r.environment; $('scene-weather').textContent = r.weather;
    $('scene-caption-text').textContent = r.caption;
    $('perception-state').textContent = state.load > 66 ? 'DISTORTED' : 'MEMORY-TINTED';
    const danger = state.integrity < 35 || state.load > 82 ? 'SEVERE' : (state.roomIndex === 3 || state.integrity < 60 ? 'ELEVATED' : 'MODERATE');
    $('threat-value').textContent = danger;
    $('threat-value').className = danger === 'SEVERE' ? '' : (danger === 'ELEVATED' ? 'threat-medium' : '');
    $('threat-value').style.color = danger === 'SEVERE' ? '#e68d8c' : '';
    $('room-title').style.color = state.roomIndex === 0 ? '#f0dfdc' : '';
  }
  function renderCandidates() {
    const actions = currentActions();
    const el = $('candidate-list'); el.innerHTML = '';
    actions.slice(0, 3).forEach((action, index) => {
      const card = document.createElement('div'); card.className = `candidate ${index === 0 ? 'best' : ''}`;
      const meter = Math.round(action.utility * 100);
      card.innerHTML = `<span class="candidate-index">${action.icon}</span><div><div class="candidate-title">${escapeHtml(action.name)}</div><div class="candidate-description">${escapeHtml(action.desc)}</div></div><div class="candidate-score">${meter}%<small>${index === 0 ? 'LEADING' : 'UTILITY'}</small></div><span class="candidate-meter" style="width:${meter}%"></span>`;
      el.appendChild(card);
    });
    if (state.ended) el.innerHTML = '<div class="candidate-description" style="padding:10px">No further actions. The subject has exited the active simulation.</div>';
  }
  function renderMemoryList() {
    const root = $('memory-list'); root.innerHTML = '';
    state.memories.forEach(memory => {
      const strongest = VISIBLE_ASSOCIATIONS.reduce((best, key) => (memory.associations[key] > memory.associations[best] ? key : best), VISIBLE_ASSOCIATIONS[0]);
      const trace = Math.round(memory.trace * 100);
      const btn = document.createElement('button'); btn.className = `memory-card ${memory.id === state.selectedMemoryId ? 'selected' : ''}`;
      btn.type = 'button'; btn.setAttribute('aria-pressed', String(memory.id === state.selectedMemoryId));
      btn.innerHTML = `<span class="memory-icon">${memory.icon}</span><span><span class="memory-card-title">${escapeHtml(memory.title)}</span><span class="memory-card-sub">${escapeHtml(memory.code)}</span></span><span class="memory-card-value">${trace}<small>TRACE</small></span>`;
      btn.addEventListener('click', () => { state.selectedMemoryId = memory.id; state.selectedAssociation = strongest; renderMemoryList(); renderSelectedMemory(); });
      root.appendChild(btn);
    });
    $('memory-count').textContent = `${String(state.memories.length).padStart(2,'0')} FRAGMENTS`;
  }
  function renderSelectedMemory() {
    const memory = selectedMemory();
    if (!memory) return;
    $('selected-type').textContent = memory.type;
    $('selected-title').textContent = memory.title;
    $('selected-quote').textContent = memory.quote;
    const strongest = VISIBLE_ASSOCIATIONS.reduce((best, key) => memory.associations[key] > memory.associations[best] ? key : best, VISIBLE_ASSOCIATIONS[0]);
    const trace = Math.round(memory.trace * 100);
    $('selected-strength').textContent = `${trace}%`;
    $('selected-strength-bar').style.width = `${trace}%`;
    $('selected-stability').textContent = memory.trace > .68 ? 'FRAGILE' : (memory.trace < .35 ? 'ALTERED' : 'STABLE');
    const list = $('association-list'); list.innerHTML = '';
    VISIBLE_ASSOCIATIONS.forEach(key => {
      const value = clamp(memory.associations[key] ?? .2); const row = document.createElement('div');
      row.className = `association-row ${state.selectedAssociation === key ? 'active' : ''}`; row.tabIndex = 0;
      row.setAttribute('role', 'button'); row.setAttribute('aria-label', `Select ${LABELS[key]} association`);
      row.innerHTML = `<span class="association-name">${LABELS[key]}</span><span class="assoc-bar"><i style="width:${Math.round(value*100)}%"></i></span><span class="association-value">${Math.round(value*100)}</span>`;
      const choose = () => { state.selectedAssociation = key; renderSelectedMemory(); };
      row.addEventListener('click', choose); row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
      list.appendChild(row);
    });
    $('selected-association-label').textContent = LABELS[state.selectedAssociation] || 'FEAR';
    $('dampen-btn').disabled = state.signals < 1 || state.ended;
    $('amplify-btn').disabled = state.signals < 1 || state.ended;
    $('reframe-btn').disabled = state.signals < 2 || state.ended;
    $('reframe-btn').style.opacity = state.signals < 2 || state.ended ? '.45' : '1';
    if (state.ended) setSaveLabel('READ ONLY', '#7b9296');
  }
  function renderLog() {
    const root = $('log-list'); if (!root) return;
    root.innerHTML = '';
    state.log.slice(0, logExpanded ? 35 : 7).forEach(entry => {
      const row = document.createElement('div'); row.className = 'log-entry';
      row.innerHTML = `<span class="log-time">${escapeHtml(entry.time)}</span><span class="log-kind ${escapeHtml(entry.kind)}">${escapeHtml(entry.tag)}</span><span class="log-text">${escapeHtml(entry.text)}</span>`;
      root.appendChild(row);
    });
    $('toggle-log').textContent = logExpanded ? 'COLLAPSE LOG −' : 'EXPAND LOG +';
    $('toggle-log').setAttribute('aria-expanded', String(logExpanded));
  }
  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
  }

  function addPromiseMemory() {
    if (state.hasPromise) return;
    state.hasPromise = true;
    state.memories.push({
      id: 'promise', title: 'A Promise in Static', code: 'RECOVERED 05E', icon: '⌁', type: 'HOPE / IDENTITY',
      quote: '“I will come back for you. I heard myself say it.”', tags: ['voice','promise','attachment','signal','human'], trace: .49,
      associations: { fear:.28, bravery:.53, curiosity:.51, avoidance:.16, trust:.64, suspicion:.24, attachment:.71, detachment:.11, caution:.31, impulse:.32, hope:.76, despair:.09 }
    });
    state.selectedMemoryId = 'promise'; state.selectedAssociation = 'trust';
    addLog('memory','MEM','Recovered a hidden voice fragment. A promise may have been made by the subject himself.');
  }

  function editAssociation(direction) {
    if (state.ended || isResolving) return;
    if (state.signals < 1) { showToast('NO INTERVENTION SIGNALS — observe or progress to earn more.'); return; }
    const memory = selectedMemory(); const key = state.selectedAssociation;
    if (!memory || !(key in memory.associations)) return;
    const before = memory.associations[key]; memory.associations[key] = clamp(before + direction * .13, .03, .97);
    if (Math.abs(memory.associations[key] - before) < .001) { showToast('ASSOCIATION ALREADY AT ITS LIMIT.'); return; }
    state.signals -= 1; state.edits += 1; state.load = clamp(state.load + 2.5, 0, 100); state.integrity = clamp(state.integrity - .5, 0, 100);
    memory.trace = clamp(memory.trace + .025, .15, .98);
    const actionWord = direction > 0 ? 'Amplified' : 'Dampened';
    addLog('memory','EDIT',`${actionWord} ${LABELS[key].toLowerCase()} association in “${memory.title}” (${Math.round(before*100)} → ${Math.round(memory.associations[key]*100)}).`);
    $('last-outcome').innerHTML = `<span class="outcome-icon">◇</span><span>${actionWord} the ${LABELS[key].toLowerCase()} association in <b>${escapeHtml(memory.title)}</b>. The subject’s action priorities are recalculating.</span>`;
    renderAll(); saveState(); showToast(`${actionWord.toUpperCase()} ${LABELS[key].toUpperCase()} · 1 SIGNAL USED`);
  }
  function reframeAssociation() {
    if (state.ended || isResolving) return;
    if (state.signals < 2) { showToast('TWO INTERVENTION SIGNALS REQUIRED.'); return; }
    const memory = selectedMemory(); const key = state.selectedAssociation; const opposite = PAIRS[key];
    if (!memory || !opposite) return;
    const oldA = memory.associations[key] ?? .3; const oldB = memory.associations[opposite] ?? (1 - oldA);
    memory.associations[key] = oldB; memory.associations[opposite] = oldA;
    state.signals -= 2; state.reframes += 1; state.edits += 1; state.load = clamp(state.load + 7, 0, 100); state.integrity = clamp(state.integrity - 2, 0, 100);
    memory.trace = clamp(memory.trace + .07, .15, .99);
    addLog('memory','REFRAME',`Reframed “${memory.title}”: ${LABELS[key].toLowerCase()} ↔ ${LABELS[opposite].toLowerCase()}. Identity drift increased.`);
    $('last-outcome').innerHTML = `<span class="outcome-icon">↗</span><span>Reframed <b>${escapeHtml(LABELS[key])}</b> as <b>${escapeHtml(LABELS[opposite])}</b> in “${escapeHtml(memory.title)}”. The memory remains, but its emotional meaning has changed.</span>`;
    renderAll(); saveState(); showToast(`ASSOCIATION REFRAMED · ${LABELS[key].toUpperCase()} ↔ ${LABELS[opposite].toUpperCase()}`);
  }

  function chooseThought() {
    const actions = currentActions();
    const chosen = actions[0];
    const traits = deriveTraits();
    if (!chosen) return;
    isResolving = true;
    $('run-decision').disabled = true;
    state.actionsTaken += 1;
    state.lastActionName = chosen.name;
    state.lastThought = room().thought[(state.turn - 1) % room().thought.length];
    $('internal-thought').textContent = `“${state.lastThought}”`;
    $('last-outcome').innerHTML = `<span class="outcome-icon">◈</span><span><b>Decision selected: ${escapeHtml(chosen.name)}.</b> The utility model selected the highest-scoring action from the subject’s current needs, memories, and environment.</span>`;
    addLog('action','ACT',`Subject selected “${chosen.name}” with ${Math.round(chosen.utility*100)}% predicted utility.`);
    resolveAction(chosen, traits);
    state.turn += 1;
    renderAll(); saveState();
    if (!state.ended) {
      window.setTimeout(() => {
        isResolving = false;
        $('run-decision').disabled = false;
        renderCandidates();
      }, 650);
    }
  }

  function resolveAction(action, traits) {
    const idx = state.roomIndex;
    if (idx === 0) {
      if (action.id === 'cross') {
        const damage = Math.round(5 + traits.fear * 8 + (state.load > 65 ? 4 : 0));
        state.integrity = clamp(state.integrity - damage, 0, 100); state.load = clamp(state.load + 8, 0, 100);
        $('last-outcome').innerHTML = `<span class="outcome-icon">↗</span><span><b>He crosses the corridor.</b> The red lights trigger a stress response. Neural integrity −${damage}%. He reaches the transit lift before it seals.</span>`;
        addLog('system','SYS',`Crossed the emergency corridor. Neural integrity reduced by ${damage}%.`);
        advanceRoom('He chose the direct route. The memory of danger followed him through the door.');
      } else if (action.id === 'detour') {
        state.load = clamp(state.load + 4, 0, 100); state.signals = Math.min(8, state.signals + 2);
        $('last-outcome').innerHTML = '<span class="outcome-icon">◇</span><span><b>He discovers a maintenance route.</b> It costs time, not blood. Two intervention signals are recovered from the abandoned panel.</span>';
        addLog('system','SYS','Found a maintenance route and recovered 2 intervention signals.');
        advanceRoom('A maintenance hatch opens. The next sector is lower than the habitat plans claim.');
      } else {
        state.waited += 1; state.load = clamp(state.load - 3, 0, 100);
        const benefit = traits.trust > .53 || traits.attachment > .58;
        if (benefit && state.waited === 1) { state.signals = Math.min(8, state.signals + 1); state.integrity = clamp(state.integrity + 3, 0, 100); }
        $('last-outcome').innerHTML = `<span class="outcome-icon">⌁</span><span><b>He waits.</b> ${benefit ? 'A fragment of a human voice surfaces through the alarm. The pause steadies him.' : 'No one answers. The pause lowers cognitive load but does not move him forward.'}</span>`;
        addLog('system','SYS',benefit ? 'A voiceprint surfaced beneath the alarm. Subject showed reduced stress.' : 'No signal found. Subject paused to reduce cognitive load.');
        $('scene-caption-text').textContent = benefit ? 'A voice emerges from the static: “I promised.”' : 'The alarm continues. The corridor does not answer.';
      }
    } else if (idx === 1) {
      if (action.id === 'salvage') {
        if (!state.salvaged) {
          state.salvaged = true; state.integrity = clamp(state.integrity + 18, 0, 100); state.signals = Math.min(8, state.signals + 1); state.load = clamp(state.load - 4, 0, 100);
          $('last-outcome').innerHTML = '<span class="outcome-icon">＋</span><span><b>Supplies recovered.</b> A field stabilizer restores 18% integrity and provides one intervention signal. The cabinet contains a faded photograph, face torn away.</span>';
          addLog('system','SYS','Recovered a field stabilizer (+18 integrity) and 1 intervention signal.');
        } else {
          state.load = clamp(state.load + 3, 0, 100);
          $('last-outcome').innerHTML = '<span class="outcome-icon">◇</span><span><b>The cabinet is empty.</b> He searches it again, but the only remaining contents are rust and old water.</span>';
          addLog('system','SYS','Repeated search returned no useful supplies.');
        }
      } else if (action.id === 'voice') {
        state.load = clamp(state.load + (traits.trust < .38 ? 13 : 4), 0, 100);
        if (traits.trust < .38) { state.integrity = clamp(state.integrity - 10, 0, 100); }
        addPromiseMemory();
        $('last-outcome').innerHTML = `<span class="outcome-icon">⌁</span><span><b>He follows the voice.</b> ${traits.trust < .38 ? 'The signal leads him through a broken bridge. He catches the railing, but the fall shakes his neural link.' : 'A damaged speaker repeats a phrase he cannot place. The signal reveals a maintenance bridge.'} A forgotten promise has been recovered.</span>`;
        addLog('system','SYS',traits.trust < .38 ? 'Voice route caused a near-fall. Memory integrity compromised.' : 'Voice route revealed a maintenance bridge.');
        advanceRoom('The speaker belongs to an older evacuation system. Its voiceprint matches the subject.');
      } else if (action.id === 'wade') {
        const damage = Math.round(4 + traits.fear * 7 + traits.caution * 3);
        state.integrity = clamp(state.integrity - damage, 0, 100); state.load = clamp(state.load + 8, 0, 100); state.waded = true;
        $('last-outcome').innerHTML = `<span class="outcome-icon">↗</span><span><b>He wades straight through.</b> Electrical discharge travels through the water. Integrity −${damage}%. Something beneath the surface moves with him.</span>`;
        addLog('system','SYS',`Crossed the flooded atrium. Electrical damage: ${damage}%.`);
        advanceRoom('He reaches the far platform. A speaker clicks on and repeats his name.');
      } else {
        state.load = clamp(state.load + 2, 0, 100); state.signals = Math.min(8, state.signals + 1);
        $('last-outcome').innerHTML = '<span class="outcome-icon">◇</span><span><b>He maps a dry route.</b> Reflected lights reveal an old maintenance bridge. One intervention signal is found beside the ladder.</span>';
        addLog('system','SYS','Mapped a safer path across the atrium and found 1 signal.');
        advanceRoom('The dry route leads to the medical bay. A door opens before he touches it.');
      }
    } else if (idx === 2) {
      if (action.id === 'restore') {
        if (!state.restored) {
          state.restored = true; state.integrity = clamp(state.integrity + 20, 0, 100); state.load = clamp(state.load - 9, 0, 100);
          $('last-outcome').innerHTML = '<span class="outcome-icon">＋</span><span><b>Vitals stabilized.</b> The med station restores 20% integrity and lowers cognitive load. The screen greets him by a name he does not recognize.</span>';
          addLog('system','SYS','Medical station stabilized neural integrity (+20%) and reduced load.');
        } else {
          state.load = clamp(state.load - 2, 0, 100);
          $('last-outcome').innerHTML = '<span class="outcome-icon">◇</span><span><b>The med station has nothing left to give.</b> He follows its empty progress bar until it shuts itself down.</span>';
          addLog('system','SYS','Second triage attempt provided no additional treatment.');
        }
      } else if (action.id === 'log') {
        if (!state.logRecovered) {
          state.logRecovered = true; addPromiseMemory(); state.signals = Math.min(8, state.signals + 1); state.load = clamp(state.load + 4, 0, 100);
          $('last-outcome').innerHTML = '<span class="outcome-icon">⌁</span><span><b>Audio fragment restored.</b> The voice on the line is Elian’s own voice. He was asking someone else to wait. One intervention signal recovered.</span>';
          addLog('system','SYS','Voice log identifies the speaker as Elian Voss. One signal recovered.');
        } else {
          state.load = clamp(state.load + 2, 0, 100);
          $('last-outcome').innerHTML = '<span class="outcome-icon">◇</span><span><b>The log is complete.</b> It contains no more answers, only the same promise replayed until the file ends.</span>';
          addLog('system','SYS','Repeated audio recovery returned no new information.');
        }
      } else {
        state.load = clamp(state.load + 3, 0, 100); state.signals = Math.min(8, state.signals + 1);
        $('last-outcome').innerHTML = '<span class="outcome-icon">↗</span><span><b>The White Crest responds.</b> The sealed transit door accepts his credentials. One signal is harvested from the access relay as the core chamber opens.</span>';
        addLog('system','SYS','Transit door opened. Access credentials confirmed; 1 signal recovered.');
        advanceRoom('The access protocol recognizes Elian. The core recognizes something older.');
      }
    } else {
      finishSimulation(action, traits);
    }

    if (state.integrity <= 0 && !state.ended) {
      finishWithFailure();
    }
    state.load = clamp(state.load, 0, 100);
    state.integrity = clamp(state.integrity, 0, 100);
    state.signals = Math.max(0, Math.min(8, state.signals));
  }

  function advanceRoom(narrative) {
    if (state.roomIndex >= ROOMS.length - 1) return;
    const oldIndex = state.roomIndex;
    state.roomsCleared = Math.max(state.roomsCleared, oldIndex + 1);
    state.roomIndex += 1; state.load = clamp(state.load + 5, 0, 100); state.signals = Math.min(8, state.signals + 1);
    const next = room();
    addLog('system','SYS',`Sector transition: ${next.title}. ${narrative}`);
    $('internal-thought').textContent = `“${next.thought[(state.turn - 1) % next.thought.length]}”`;
    $('last-outcome').innerHTML = `<span class="outcome-icon">↗</span><span><b>Sector transition: ${escapeHtml(next.title)}.</b> ${escapeHtml(narrative)} One intervention signal recovered during transition.</span>`;
    $('scene-caption-text').textContent = next.caption;
    renderAll();
  }

  function finishSimulation(action, traits) {
    const endings = {
      confront: {
        title: traits.trust > .53 ? 'The Voice Was Yours' : 'The Last Question', symbol: '⌁', code: 'OUTCOME 01',
        copy: traits.trust > .53
          ? 'The Architect answers in Elian’s own voice. The system was built to preserve the last evacuation message he recorded. He leaves with the memories restored unevenly — but at last, they belong to him.'
          : 'Elian asks why his memories were altered. The Architect returns a list of probabilities, not an apology. He leaves knowing the truth, but not whether knowing it will make him whole.'
      },
      sever: {
        title: traits.attachment > .58 ? 'The Memory That Stayed' : 'Quiet Machine', symbol: '⊘', code: 'OUTCOME 02',
        copy: traits.attachment > .58
          ? 'Elian severs the network, but one promise survives outside its reach. He cannot recall the face attached to it. He chooses to carry the feeling anyway.'
          : 'The core goes dark. Without the system, the fear loses its source — and so do several memories that once gave Elian direction. He walks into a future he cannot name.'
      },
      merge: {
        title: traits.hope > .53 ? 'A Future Remembered' : 'Someone New', symbol: '◈', code: 'OUTCOME 03',
        copy: traits.hope > .53
          ? 'Elian accepts the unfinished fragment. The Architect dissolves into a memory he can finally revisit without obeying it. He leaves not cured, but no longer divided from his own past.'
          : 'The merge succeeds, technically. Elian emerges with the Architect’s knowledge and a quieter sense of self. Whether that is healing or replacement remains an open question.'
      }
    };
    const ending = endings[action.id] || endings.confront;
    state.ended = true; state.finalOutcome = action.id; state.roomsCleared = 4;
    state.load = clamp(state.load + 10, 0, 100);
    addLog('system','END',`Simulation concluded: ${ending.title}. Final choice: ${action.name}.`);
    $('last-outcome').innerHTML = `<span class="outcome-icon">◈</span><span><b>Simulation complete.</b> Elian’s autonomous decision ended the run with “${escapeHtml(ending.title)}”.</span>`;
    renderAll(); saveState(); showEnding(ending, action);
  }
  function finishWithFailure() {
    state.ended = true; state.finalOutcome = 'collapse';
    const ending = { title: 'The Mind Went Quiet', symbol: '∅', code: 'OUTCOME 00', copy: 'The accumulated stress overwhelms the neural link. Elian survives as a body, but the simulation can no longer reliably resolve his decisions. The memory archive remains intact. The person behind it is unreachable.' };
    addLog('system','END','Neural integrity reached zero. Cognitive link terminated.');
    renderAll(); saveState(); showEnding(ending, null);
  }
  function showEnding(ending, action) {
    $('ending-title').textContent = ending.title; $('ending-copy').textContent = ending.copy;
    $('ending-symbol').textContent = ending.symbol; $('ending-code').textContent = ending.code;
    $('ending-stats').innerHTML = `
      <div class="ending-stat"><b>${Math.round(state.integrity)}%</b><span>INTEGRITY</span></div>
      <div class="ending-stat"><b>${state.edits}</b><span>INTERVENTIONS</span></div>
      <div class="ending-stat"><b>${state.memories.length}</b><span>MEMORIES FOUND</span></div>`;
    $('ending-screen').classList.remove('hidden'); $('game-layout').classList.add('ended');
    $('run-decision').disabled = true;
  }

  function startNewRun() {
    state = initialState(); state.started = true; isResolving = false; logExpanded = false;
    $('ending-screen').classList.add('hidden'); $('intro-screen').classList.add('is-hidden'); $('game-layout').classList.remove('is-locked');
    $('internal-thought').textContent = `“${room().thought[0]}”`;
    addLog('system','SYS','Cognitive link established. Subject is autonomous. Intervention window open.');
    renderAll(); saveState();
  }
  function continueRun(saved) {
    state = saved; state.started = true; isResolving = false; logExpanded = false;
    $('intro-screen').classList.add('is-hidden'); $('game-layout').classList.remove('is-locked');
    if (state.ended) showEnding({ title:'Simulation already completed', symbol:'◈', code:'SAVED INSTANCE', copy:'This saved instance has already concluded. Begin a new instance to make different interventions and observe a different outcome.' }, null);
    renderAll();
  }
  function resetRun() {
    if (!state.started) { startNewRun(); return; }
    const confirmed = window.confirm('Restart this simulation? Your current memory edits and progress will be erased.');
    if (!confirmed) return;
    try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
    $('ending-screen').classList.add('hidden'); $('game-layout').classList.remove('ended');
    startNewRun(); showToast('NEW INSTANCE INITIALIZED.');
  }

  // Canvas environment renderer: deliberately self-contained and asset-free.
  let lastCanvasTime = 0;
  function resizeCanvas() {
    if (!sceneCanvas || !canvasCtx) return;
    const rect = sceneCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(rect.width * dpr); const h = Math.floor(rect.height * dpr);
    if (sceneCanvas.width !== w || sceneCanvas.height !== h) { sceneCanvas.width = w; sceneCanvas.height = h; }
    canvasWidth = rect.width; canvasHeight = rect.height;
    canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function drawScene(timestamp) {
    if (!canvasCtx || !sceneCanvas) return;
    resizeCanvas();
    const ctx = canvasCtx; const w = canvasWidth; const h = canvasHeight;
    if (!w || !h) return;
    lastCanvasTime = timestamp;
    const t = timestamp * .001;
    const r = ROOMS[state.roomIndex] || ROOMS[0];
    const traits = deriveTraits();
    const accent = r.theme === 'red' ? [196, 83, 77] : r.theme === 'water' ? [80, 167, 184] : r.theme === 'medical' ? [123, 200, 172] : [180, 152, 222];
    const darkness = state.load / 100;
    ctx.clearRect(0,0,w,h);
    const bg = ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0, `rgb(${Math.round(10+accent[0]*.035)},${Math.round(20+accent[1]*.08)},${Math.round(27+accent[2]*.08)})`);
    bg.addColorStop(.55, '#14222a'); bg.addColorStop(1, '#091116');
    ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);
    // distant aperture and atmospheric bloom
    const horizon = h * (.36 + Math.sin(t*.45)*.006);
    const glow = ctx.createRadialGradient(w*.51,horizon,2,w*.51,horizon,w*.48);
    glow.addColorStop(0,`rgba(${accent.join(',')},${.17 + darkness*.06})`); glow.addColorStop(1,'rgba(10,16,21,0)');
    ctx.fillStyle = glow; ctx.fillRect(0,0,w,h);
    // walls, with perspective lines converging on the access point
    ctx.fillStyle = 'rgba(20,34,42,.88)';
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w*.39,horizon); ctx.lineTo(w*.39,h*.79); ctx.lineTo(0,h*.55); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w,0); ctx.lineTo(w*.61,horizon); ctx.lineTo(w*.61,h*.79); ctx.lineTo(w,h*.55); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(${accent.join(',')},${.18 + Math.sin(t*1.1)*.04})`; ctx.lineWidth = 1;
    for (let i=0;i<8;i++) {
      const a = i/8;
      ctx.beginPath(); ctx.moveTo(w*.39,horizon); ctx.lineTo(w*(a),h*(.56 + a*.10)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w*.61,horizon); ctx.lineTo(w*(1-a),h*(.56 + a*.10)); ctx.stroke();
    }
    // structural ribs
    for (let side of [-1,1]) {
      for (let i=0;i<5;i++) {
        const depth = .2 + i*.17;
        const x = w*.5 + side * w*(.12 + i*.082);
        const topX = w*.5 + side*w*(.105 + i*.076);
        ctx.strokeStyle = `rgba(103,145,151,${.18 - i*.023})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(topX,horizon-depth*26); ctx.lineTo(x,h*(.57+i*.045)); ctx.stroke();
      }
    }
    // room-specific feature
    if (r.theme === 'red') {
      // red emergency panels
      for (let side of [-1,1]) {
        for (let i=0;i<3;i++) {
          const x = side < 0 ? w*(.08+i*.065) : w*(.92-i*.065);
          const y = h*(.18+i*.105);
          ctx.fillStyle = `rgba(222,${45+Math.round(Math.sin(t*2+i)*7)},${49+Math.round(Math.sin(t*2+i)*5)},${.28+Math.max(0,Math.sin(t*2.4+i))*.3})`;
          ctx.fillRect(x,y,Math.max(2,w*.006),h*.075);
          ctx.fillStyle = 'rgba(218,94,84,.12)'; ctx.fillRect(x-w*.009,y,w*.025,h*.095);
        }
      }
    } else if (r.theme === 'water') {
      ctx.fillStyle = 'rgba(45,105,121,.28)'; ctx.fillRect(0,h*.65,w,h*.35);
      for (let i=0;i<22;i++) {
        const y=h*(.67 + i*.014); const phase=t*(.7+i*.025)+i;
        ctx.beginPath();
        for (let x=0;x<=w;x+=12) { const yy=y+Math.sin(x*.02+phase)*(.8+i*.045); if(x===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy); }
        ctx.strokeStyle=`rgba(113,200,214,${.12-i*.0035})`; ctx.lineWidth=1; ctx.stroke();
      }
      for (let i=0;i<6;i++) { const x=w*(.12+i*.15); const y=h*(.25+Math.sin(t*.45+i)*.025); ctx.strokeStyle='rgba(115,190,198,.22)';ctx.strokeRect(x,y,w*.052,h*.068);ctx.fillStyle='rgba(127,205,213,.14)';ctx.fillRect(x+4,y+4,w*.052-8,h*.068-8); }
    } else if (r.theme === 'medical') {
      for(let i=0;i<7;i++) { const x=w*(.09+i*.13); const y=h*(.18+(i%2)*.06); ctx.strokeStyle='rgba(150,216,196,.22)';ctx.strokeRect(x,y,w*.075,h*.12);ctx.fillStyle=`rgba(153,225,200,${.07+Math.sin(t+i)*.025})`;ctx.fillRect(x+4,y+4,w*.075-8,h*.12-8); }
      // heart monitor trace
      ctx.strokeStyle='rgba(116,219,185,.55)';ctx.lineWidth=1.4;ctx.beginPath();
      for(let x=w*.08;x<w*.31;x+=3){const y=h*.29+Math.sin(x*.06+t*3)*2+(Math.sin(x*.09+t*1.4)> .985?-9:0);if(x===w*.08)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
    } else {
      // core rings
      for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse(w*.5,h*.38,w*(.08+i*.044),h*(.065+i*.027),t*.035*(i%2?1:-1),0,Math.PI*2);ctx.strokeStyle=`rgba(179,151,228,${.23-i*.023})`;ctx.lineWidth=1;ctx.stroke();}
      const coreGlow=ctx.createRadialGradient(w*.5,h*.38,2,w*.5,h*.38,w*.13);coreGlow.addColorStop(0,'rgba(214,205,255,.7)');coreGlow.addColorStop(.16,'rgba(166,144,220,.22)');coreGlow.addColorStop(1,'rgba(166,144,220,0)');ctx.fillStyle=coreGlow;ctx.fillRect(w*.35,h*.15,w*.3,h*.5);
    }
    // floor plane and perspective grid
    ctx.fillStyle='rgba(5,11,15,.40)';ctx.beginPath();ctx.moveTo(w*.39,h*.59);ctx.lineTo(w*.61,h*.59);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(102,156,158,.15)';ctx.lineWidth=1;
    for(let i=0;i<13;i++) { const f=i/13; const y=h*(.59+f*f*.42); ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke(); }
    for(let i=-10;i<=10;i++){ctx.beginPath();ctx.moveTo(w*.5+i*w*.011,h*.59);ctx.lineTo(w*.5+i*w*.09,h);ctx.stroke();}
    // far door
    const doorW=w*(r.theme==='core'?.14:.12),doorH=h*(r.theme==='core'?.34:.40),doorX=w*.5-doorW/2,doorY=horizon-doorH*.52;
    ctx.fillStyle='rgba(5,12,16,.85)';ctx.fillRect(doorX-doorW*.14,doorY-doorH*.06,doorW*1.28,doorH*1.15);
    ctx.strokeStyle=`rgba(${accent.join(',')},${.44+Math.sin(t*1.3)*.12})`;ctx.lineWidth=1.5;ctx.strokeRect(doorX,doorY,doorW,doorH);
    ctx.fillStyle=`rgba(${accent.join(',')},${.08+Math.sin(t*2)*.03})`;ctx.fillRect(doorX+3,doorY+3,doorW-6,doorH-6);
    ctx.beginPath();ctx.moveTo(doorX+doorW*.5,doorY+5);ctx.lineTo(doorX+doorW*.5,doorY+doorH-5);ctx.strokeStyle=`rgba(${accent.join(',')},.34)`;ctx.stroke();
    // subject silhouette, breathing subtly
    const sx=w*(.47 + Math.sin(t*.4)*.003), sy=h*.70 + Math.sin(t*1.5)*1.2, sc=Math.min(w/620,h/250);
    ctx.save();ctx.translate(sx,sy);ctx.scale(sc,sc);
    ctx.fillStyle='rgba(2,7,10,.88)';ctx.strokeStyle='rgba(119,175,170,.4)';ctx.lineWidth=1.1;
    ctx.beginPath();ctx.ellipse(0,-53,10,14,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-8,-41);ctx.lineTo(-18,-13);ctx.lineTo(-17,11);ctx.lineTo(-9,12);ctx.lineTo(-5,-5);ctx.lineTo(0,0);ctx.lineTo(5,-5);ctx.lineTo(9,12);ctx.lineTo(17,11);ctx.lineTo(18,-13);ctx.lineTo(8,-41);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-15,-33);ctx.lineTo(-27,-3);ctx.lineTo(-23,7);ctx.moveTo(15,-33);ctx.lineTo(27,-3);ctx.lineTo(23,7);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-8,12);ctx.lineTo(-12,42);ctx.lineTo(-7,59);ctx.moveTo(8,12);ctx.lineTo(12,42);ctx.lineTo(7,59);ctx.stroke();
    ctx.strokeStyle=`rgba(${accent.join(',')},${.6+Math.sin(t*2)*.15})`;ctx.beginPath();ctx.moveTo(-1,-39);ctx.lineTo(0,-19);ctx.stroke();ctx.restore();
    // floating memory traces / dust
    for(let i=0;i<37;i++) {
      const seed=(i*91.37+state.seed*2.5); const x=(Math.sin(seed)*.5+.5)*w; const baseY=(Math.cos(seed*.7)*.5+.5)*h;
      const y=(baseY + t*(7+(i%4)*2))%(h*.95); const radius=(i%5===0?1.5:.7);
      ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fillStyle=`rgba(${i%3===0?'192,220,207':'136,171,178'},${.12+(.08* Math.sin(t+i))})`;ctx.fill();
    }
    // mental distortion bands based on cognitive load
    if (darkness>.48) {
      const count=Math.floor(darkness*8);
      for(let i=0;i<count;i++){const y=(Math.sin(t*1.6+i*3.1)*.5+.5)*h;ctx.fillStyle=`rgba(${accent.join(',')},${.025+darkness*.025})`;ctx.fillRect(0,y,w*(.2+Math.abs(Math.sin(i*3))* .75),1+darkness*2);}
    }
    // low-opacity HUD coordinates
    ctx.font='8px monospace';ctx.fillStyle='rgba(145,180,180,.48)';ctx.fillText(`SUBJECT POS // ${String(4+state.roomIndex*3).padStart(2,'0')}.${String(18+state.turn*2).padStart(2,'0')}`,w-177,h-18);
    animationFrame = window.requestAnimationFrame(drawScene);
  }

  $('start-btn').addEventListener('click', startNewRun);
  $('continue-btn').addEventListener('click', () => { const saved = loadSavedState(); if (saved) continueRun(saved); });
  $('restart-btn').addEventListener('click', resetRun);
  $('run-decision').addEventListener('click', chooseThought);
  $('dampen-btn').addEventListener('click', () => editAssociation(-1));
  $('amplify-btn').addEventListener('click', () => editAssociation(1));
  $('reframe-btn').addEventListener('click', reframeAssociation);
  $('toggle-log').addEventListener('click', () => { logExpanded = !logExpanded; renderLog(); });
  $('play-again-btn').addEventListener('click', () => {
    try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
    $('ending-screen').classList.add('hidden'); $('game-layout').classList.remove('ended'); startNewRun();
  });
  document.addEventListener('keydown', e => {
    // Let focused buttons handle their native keyboard activation (including Continue).
    if (e.key === 'Enter' && document.activeElement === document.body && !$('intro-screen').classList.contains('is-hidden')) { e.preventDefault(); startNewRun(); }
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === $('run-decision')) { e.preventDefault(); chooseThought(); }
    if (e.key === 'Escape' && !$('ending-screen').classList.contains('hidden')) $('ending-screen').classList.add('hidden');
  });
  window.addEventListener('resize', resizeCanvas);

  const savedAtBoot = loadSavedState();
  if (savedAtBoot && savedAtBoot.started && !savedAtBoot.ended) $('continue-btn').classList.remove('hidden');
  if (savedAtBoot && savedAtBoot.started && !savedAtBoot.ended) $('continue-btn').textContent = `CONTINUE SAVED SESSION · SECTOR ${String(savedAtBoot.roomIndex + 1).padStart(2,'0')} ↗`;
  if (savedAtBoot && savedAtBoot.started && savedAtBoot.ended) {
    $('continue-btn').classList.remove('hidden'); $('continue-btn').textContent = 'VIEW COMPLETED SESSION ↗';
  }
  renderAll();
  animationFrame = window.requestAnimationFrame(drawScene);
})();
