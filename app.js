// ── Landing page & wizard glue ──
var _wizardStep = 1;
var _wizardHighest = 1;

function updateNavActive(active) {
  document.querySelectorAll('.nav-links .nav-link').forEach(function(l) { l.classList.remove('active'); });
  var el = document.getElementById(active);
  if (el) el.classList.add('active');
}
function showLanding() {
  document.getElementById('view-landing').classList.add('active');
  document.getElementById('view-wizard').classList.remove('active');
  document.getElementById('app-container').classList.remove('active');
  updateNavActive('nav-home');
}
function startPlanning() {
  document.getElementById('view-landing').classList.remove('active');
  document.getElementById('view-wizard').classList.add('active');
  document.getElementById('app-container').classList.remove('active');
  wizardShowStep(1);
  updateNavActive('nav-planner');
}
function showExamplePlan() {
  // Load a realistic example plan
  state.role = 'master';
  state.bpStart = CONFIG.blockPeriods[1] ? CONFIG.blockPeriods[1].start : CONFIG.blockPeriods[0].start;
  state.bpWeeks = CONFIG.blockPeriods[1] ? CONFIG.blockPeriods[1].weeks : 8;
  state.name = 'Alex';
  state.studyTitle = 'The Effect of AI Recommendations on Consumer Trust';
  state.collectionDays = 5;
  state.analysisWeeks = 1;
  // Data collection in week 5 of the block period
  const bpStart = parseDate(state.bpStart);
  state.weekStart = formatDateISO(addDays(bpStart, 4 * 7));
  state.thesisDeadline = formatDateISO(addDays(bpStart, (state.bpWeeks + 2) * 7));
  state.quickEstimate = { conditions: 2, design: 'between', nPerCondition: 50, sessionMin: 30, showupRate: 0.5 };
  // Mark a few milestones as done for realism
  state.checkedItems = ['power_analysis', 'supervisor_checkin', 'equipment_book', 'inform_team'];
  _milestoneCacheKey = null;
  renderPlan();
  showPlanView();
  updateNavActive('nav-planner');
}
function showPlanView() {
  document.getElementById('view-landing').classList.remove('active');
  document.getElementById('view-wizard').classList.remove('active');
  document.getElementById('app-container').classList.add('active');
  // Mark plan screen as active for existing JS compatibility
  document.querySelectorAll('#app-container .screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('screen-plan').classList.add('active');
  updateNavActive('nav-planner');
}

function wizardShowStep(n) {
  _wizardStep = n;
  if (n > _wizardHighest) _wizardHighest = n;
  // Show/hide step content
  for (var i = 1; i <= 4; i++) {
    var el = document.getElementById('wizard-step-' + i);
    if (el) { el.classList.toggle('active', i === n); }
  }
  // Update step indicators
  var steps = document.querySelectorAll('#wizard-steps .step');
  steps.forEach(function(s) {
    var si = parseInt(s.getAttribute('data-step'));
    s.classList.remove('active', 'done');
    if (si === n) s.classList.add('active');
    else if (si < n) s.classList.add('done');
  });
  // Update footer buttons
  var backBtn = document.getElementById('wizard-back-btn');
  var nextBtn = document.getElementById('wizard-next-btn');
  backBtn.style.visibility = (n === 1) ? 'hidden' : '';
  if (n === 4) {
    nextBtn.textContent = 'Generate My Plan \u2192';
    nextBtn.className = 'btn btn-primary';
    nextBtn.style.background = 'var(--accent)';
    nextBtn.style.borderColor = 'var(--accent)';
    nextBtn.style.color = '#fff';
    // Build summary
    wizardBuildSummary();
  } else {
    nextBtn.textContent = 'Continue \u2192';
    nextBtn.className = 'btn btn-primary';
    nextBtn.style.background = '';
    nextBtn.style.borderColor = '';
    nextBtn.style.color = '';
  }
  // Scroll to top of wizard
  document.getElementById('view-wizard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function wizardNext() {
  if (_wizardStep === 1) {
    // Validate: role must be selected
    if (typeof state !== 'undefined' && !state.role) {
      alert('Please select a role to continue.');
      return;
    }
    wizardShowStep(2);
  } else if (_wizardStep === 2) {
    // Validate: date must be selected
    if (typeof state !== 'undefined' && !state.weekStart) {
      alert('Please select a date or block period to continue.');
      return;
    }
    // Show confirmation card if date is set
    var cc = document.getElementById('wizard-confirm-card');
    if (cc) cc.classList.remove('hidden');
    // Prepare step 3 fields
    if (typeof state !== 'undefined') {
      document.getElementById('name-input').value = state.name || '';
      document.getElementById('title-input').value = state.studyTitle || '';
      document.getElementById('supervisor-email-input').value = state.supervisorEmail || '';
      var thesisCard = document.getElementById('thesis-deadline-card');
      if (thesisCard) thesisCard.style.display = state.role === 'master' ? 'block' : 'none';
      if (state.thesisDeadline) document.getElementById('thesis-deadline-input').value = state.thesisDeadline;
      document.getElementById('collection-days-input').value = state.collectionDays || 5;
      document.getElementById('analysis-weeks-input').value = state.analysisWeeks || 1;
      document.getElementById('quick-estimate-section').open = true;
      if (typeof updateQuickEstimate === 'function') updateQuickEstimate();
    }
    wizardShowStep(3);
  } else if (_wizardStep === 3) {
    // Save details before advancing
    if (typeof state !== 'undefined') {
      state.name = document.getElementById('name-input').value.trim();
      state.studyTitle = document.getElementById('title-input').value.trim();
      state.supervisorEmail = document.getElementById('supervisor-email-input').value.trim();
      var td = document.getElementById('thesis-deadline-input');
      if (td && td.value) state.thesisDeadline = td.value;
      state.collectionDays = parseInt(document.getElementById('collection-days-input').value) || 5;
      state.analysisWeeks = parseInt(document.getElementById('analysis-weeks-input').value) || 1;
      if (typeof saveState === 'function') saveState();
    }
    wizardShowStep(4);
  } else if (_wizardStep === 4) {
    // Generate plan
    if (typeof state !== 'undefined') {
      state.name = document.getElementById('name-input').value.trim();
      state.studyTitle = document.getElementById('title-input').value.trim();
      state.supervisorEmail = document.getElementById('supervisor-email-input').value.trim();
      var td2 = document.getElementById('thesis-deadline-input');
      if (td2 && td2.value) state.thesisDeadline = td2.value;
      state.collectionDays = parseInt(document.getElementById('collection-days-input').value) || 5;
      state.analysisWeeks = parseInt(document.getElementById('analysis-weeks-input').value) || 1;
    }
    if (typeof generatePlan === 'function') generatePlan();
    showPlanView();
  }
}

function wizardBack() {
  if (_wizardStep > 1) wizardShowStep(_wizardStep - 1);
}

function wizardGoToStep(n) {
  // Can only go to steps already reached
  if (n <= _wizardHighest) wizardShowStep(n);
}

function wizardBuildSummary() {
  var el = document.getElementById('wizard-summary');
  if (!el || typeof state === 'undefined') return;
  var lines = [];
  if (state.role) lines.push('<strong>Role:</strong> ' + (state.role === 'master' ? 'Master Student' : 'PhD Researcher'));
  if (state.weekStart) lines.push('<strong>Data collection starts:</strong> ' + state.weekStart);
  if (state.bpWeeks) lines.push('<strong>Period length:</strong> ' + state.bpWeeks + ' weeks');
  if (state.name) lines.push('<strong>Name:</strong> ' + escapeHTML(state.name));
  if (state.studyTitle) lines.push('<strong>Study:</strong> ' + escapeHTML(state.studyTitle));
  el.innerHTML = lines.length > 0 ? '<div class="data-grid" style="gap:0.5rem 1rem;">' + lines.map(function(l) { return '<div>' + l + '</div>'; }).join('') + '</div>' : '<p class="form-hint">No details entered yet.</p>';
}

// Note: page load routing is handled by the init() function at the bottom of the script

// ============================================================
// ANNUAL CONFIG — UPDATE ONCE PER ACADEMIC YEAR
// All dates are ISO strings: "YYYY-MM-DD"
// BP = Block Period (SBE/MSCM teaching period)
// ============================================================
const CONFIG = {

  // Block periods available for selection.
  // Add/remove rows each year. 'weeks' is total period length including exam week.
  // BP5 is typically 9 weeks due to spring holidays; all others are 8.
  blockPeriods: [
    { label: "BP4 \u2014 2025/26", start: "2026-02-09", weeks: 8 },
    { label: "BP5 \u2014 2025/26", start: "2026-04-13", weeks: 9 },
    { label: "BP1 \u2014 2026/27", start: "2026-09-07", weeks: 8 },
    { label: "BP2 \u2014 2026/27", start: "2026-11-02", weeks: 8 },
    // FILL IN: add more block periods as the academic calendar is published
  ],

  // Dutch national public holidays (fixed-date only).
  // Easter-relative holidays are computed automatically — do NOT list them here.
  // Only list: fixed holidays + UM-specific closures.
  fixedHolidays: [
    // ── 2025/26 ──
    { date: "2025-12-25", label: "Christmas Day" },
    { date: "2025-12-26", label: "Second Christmas Day" },
    { date: "2026-01-01", label: "New Year's Day" },
    { date: "2026-02-16", label: "Carnival (UM closure)" },
    { date: "2026-02-17", label: "Carnival (UM closure)" },
    { date: "2026-04-27", label: "King's Day" },
    { date: "2026-05-05", label: "Liberation Day" },
    // ── 2026/27 — fill in when academic calendar is published ──
    // { date: "2026-12-25", label: "Christmas Day" },
    // { date: "2026-12-26", label: "Second Christmas Day" },
    // { date: "2027-01-01", label: "New Year's Day" },
  ],

  // Bridge days (brugdagen) — UM-specific, not national holidays.
  bridgeDays: [
    { date: "2026-05-04", label: "Bridge Day (UM)" },
    { date: "2026-05-15", label: "Bridge Day \u2014 Ascension (UM)" },
  ],
};
// ============================================================
// END OF ANNUAL CONFIG — DO NOT EDIT BELOW THIS LINE
// unless you are changing app logic
// ============================================================

// ── XSS Protection ──
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ── Easter Algorithm (Meeus/Jones/Butcher) ──
function getEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getEasterHolidays(year) {
  const easter = getEaster(year);
  const add = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  return [
    { date: add(easter, -2), label: "Good Friday" },
    { date: add(easter, 1), label: "Easter Monday" },
    { date: add(easter, 39), label: "Ascension Day" },
    { date: add(easter, 49), label: "Whit Monday" },
  ];
}

function getAllHolidays(startYear, endYear) {
  const holidays = [];
  CONFIG.fixedHolidays.forEach(h => holidays.push({ date: parseDate(h.date), label: h.label }));
  CONFIG.bridgeDays.forEach(h => holidays.push({ date: parseDate(h.date), label: h.label }));
  for (let y = startYear; y <= endYear; y++) {
    getEasterHolidays(y).forEach(h => holidays.push(h));
  }
  return holidays;
}

function getHolidaysInRange(startDate, endDate) {
  const years = new Set();
  for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) years.add(y);
  const all = getAllHolidays(Math.min(...years), Math.max(...years));
  return all.filter(h => h.date >= startDate && h.date <= endDate);
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

function nextWorkingDay(date, holidaySet) {
  let d = new Date(date);
  while (d.getDay() === 0 || d.getDay() === 6 || holidaySet.has(d.toDateString())) {
    d = addDays(d, 1);
  }
  return d;
}

function prevWorkingDay(date, holidaySet) {
  let d = new Date(date);
  while (d.getDay() === 0 || d.getDay() === 6 || holidaySet.has(d.toDateString())) {
    d = addDays(d, -1);
  }
  return d;
}

function buildHolidaySet(startDate, endDate) {
  const holidays = getHolidaysInRange(addDays(startDate, -60), addDays(endDate, 30));
  return new Set(holidays.map(h => h.date.toDateString()));
}

function formatDateISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatDate(d) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateShort(d) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

function formatDuration(min) {
  if (!min || min <= 0) return '';
  if (min < 60) return `~${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `~${h}h` : `~${h}h ${m}m`;
}

// ISO Monday of the week containing d
function isoWeekStart(d) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  const day = (x.getDay() + 6) % 7; // Mon=0..Sun=6
  x.setDate(x.getDate() - day);
  return x;
}

// Compute milestone dates for current state
function computeMilestones() {
  const bpStart = parseDate(state.bpStart);
  const weekStart = parseDate(state.weekStart || state.bpStart);
  const bpEnd = addDays(bpStart, state.bpWeeks * 7 - 1);
  const thesisDate = state.thesisDeadline ? parseDate(state.thesisDeadline) : null;
  const rangeEnd = (thesisDate && thesisDate > bpEnd) ? thesisDate : bpEnd;
  const holidaySet = buildHolidaySet(addDays(bpStart, -60), rangeEnd);
  // Collection is measured in lab (working) days. Step through working days
  // from weekStart to find the final collection day.
  const collectionDays = Math.max(1, state.collectionDays || 5);
  let lastCollectionDay = nextWorkingDay(weekStart, holidaySet);
  {
    let d = new Date(lastCollectionDay);
    for (let i = 1; i < collectionDays; i++) {
      d = nextWorkingDay(addDays(d, 1), holidaySet);
    }
    lastCollectionDay = d;
  }
  const collectionEndDate = lastCollectionDay;
  // Analysis can only start one day after the last day of data collection.
  const analysisWeeks = Math.max(1, state.analysisWeeks || 1);
  const analysisStartDate = nextWorkingDay(addDays(collectionEndDate, 1), holidaySet);
  const analysisEndDate = addDays(analysisStartDate, analysisWeeks * 7 - 1);

  const roleMilestones = MILESTONES.filter(m => {
    if (!m.roles.includes(state.role)) return false;
    if (m.relativeTo === 'thesis' && !thesisDate) return false;
    return true;
  });
  const result = roleMilestones.map(m => {
    const anchor = m.relativeTo === 'thesis' ? thesisDate : (m.relativeTo === 'collectionEnd') ? collectionEndDate : (m.relativeTo === 'bp') ? bpStart : weekStart;
    let date = addDays(anchor, m.offsetDays);
    if (m.id === 'equipment_prep') {
      // Must be at least 1 working day before data collection
      date = prevWorkingDay(addDays(weekStart, -1), holidaySet);
    } else if (m.id === 'data_cleaning') {
      date = analysisStartDate;
    } else if (m.id !== 'data_collection') {
      date = nextWorkingDay(date, holidaySet);
    }
    // Enrich data_collection label with collection period
    if (m.id === 'data_collection') {
      const endDate = new Date(collectionEndDate);
      const cd = collectionDays;
      const extraLabel = `${cd} lab day${cd !== 1 ? 's' : ''}`;
      return { ...m, date, label: `Data collection: ${formatDateShort(date)} \u2192 ${formatDateShort(endDate)} (${extraLabel})`, endDate };
    }
    const label = (state.role === 'master' && m.masterLabel) ? m.masterLabel : m.label;
    return { ...m, date, label };
  });

  // ── Enforce strict sequential ordering for milestone chains ──
  // Milestones in a chain must appear in order. When the timeline is tight,
  // they get proportionally compressed into the available window.
  // startDate = first possible date, deadlineDate = hard end boundary.
  function enforceChainOrder(chainIds, startDate, deadlineDate) {
    const chainMs = chainIds.map(id => result.find(m => m.id === id)).filter(Boolean);
    if (chainMs.length < 2) return;

    // Check if any milestone is out of order or past the deadline
    let needsFix = false;
    for (let i = 1; i < chainMs.length; i++) {
      if (chainMs[i].date <= chainMs[i - 1].date) { needsFix = true; break; }
    }
    if (!needsFix) {
      needsFix = chainMs.some(m => m.date >= deadlineDate) || chainMs[0].date <= startDate;
    }
    if (!needsFix) return;

    const totalDaysAvailable = Math.max(chainMs.length + 1, Math.round((deadlineDate - startDate) / (1000 * 60 * 60 * 24)));

    // Assign weights based on ideal gaps between milestones
    const idealGaps = [];
    for (let i = 0; i < chainMs.length; i++) {
      if (i === 0) {
        idealGaps.push(1);
      } else {
        const prevIdeal = MILESTONES.find(m => m.id === chainIds[i - 1]);
        const currIdeal = MILESTONES.find(m => m.id === chainIds[i]);
        if (prevIdeal && currIdeal && prevIdeal.relativeTo === currIdeal.relativeTo) {
          idealGaps.push(Math.max(1, Math.abs(currIdeal.offsetDays - prevIdeal.offsetDays)));
        } else {
          idealGaps.push(7);
        }
      }
    }
    const totalIdealGaps = idealGaps.reduce((s, g) => s + g, 0) + 1;
    const scale = Math.min(1, (totalDaysAvailable - 1) / totalIdealGaps);

    let cursor = new Date(startDate);
    chainMs.forEach((m, i) => {
      const gap = Math.max(1, Math.round(idealGaps[i] * scale));
      cursor = addDays(cursor, gap);
      const remaining = chainMs.length - i - 1;
      const latestAllowed = addDays(deadlineDate, -(remaining + 1));
      if (cursor > latestAllowed) cursor = new Date(latestAllowed);
      m.date = new Date(cursor);
      m.compressed = true;
    });
  }

  // Data collection must stay within BP weeks 2–7
  const bpWeek2Start = addDays(bpStart, 7);   // start of week 2
  const bpWeek7End = addDays(bpStart, 7 * 7); // end of week 7
  const dataCollMs = result.find(m => m.id === 'data_collection');
  if (dataCollMs) {
    if (dataCollMs.date < bpWeek2Start) dataCollMs.date = new Date(bpWeek2Start);
    if (dataCollMs.date > bpWeek7End) { dataCollMs.date = new Date(bpWeek7End); dataCollMs.compressed = true; }
    // Also clamp endDate if it exists
    if (dataCollMs.endDate && dataCollMs.endDate > bpWeek7End) {
      dataCollMs.endDate = new Date(bpWeek7End);
      dataCollMs.compressed = true;
    }
  }

  // Pre-experiment chain: everything before data collection (week-anchored)
  // Order: power_analysis → supervisor_checkin/ethics_check → inform_team →
  //        equipment_book → prereg → stimuli_pretest → prepare_measures →
  //        pilot → qualtrics_final → equipment_prep
  const PRE_EXPERIMENT_CHAIN = [
    'power_analysis', 'ethics_check', 'supervisor_checkin', 'inform_team',
    'equipment_book', 'prereg', 'stimuli_pretest', 'prepare_measures',
    'pilot', 'qualtrics_final', 'equipment_prep'
  ].filter(id => result.some(m => m.id === id));

  // Use the earliest milestone date in the chain as the start boundary
  const preChainMs = PRE_EXPERIMENT_CHAIN.map(id => result.find(m => m.id === id)).filter(Boolean);
  if (preChainMs.length > 1) {
    const earliestDate = new Date(Math.min(...preChainMs.map(m => m.date.getTime())));
    enforceChainOrder(PRE_EXPERIMENT_CHAIN, addDays(earliestDate, -1), weekStart);
  }

  // SONA chain: sona_request → sona_upload → sona_active (anchored to BP)
  enforceChainOrder(['sona_request', 'sona_upload', 'sona_active'], addDays(bpStart, -42), bpStart);

  // Post-experiment chain (master only): data_cleaning →
  // first_draft → supervisor_feedback → revision_complete → final_check
  if (thesisDate && state.role === 'master') {
    enforceChainOrder(
      ['data_cleaning', 'first_draft', 'supervisor_feedback', 'revision_complete', 'final_check'],
      collectionEndDate, thesisDate
    );
  }

  // Add individual experiment day milestones
  const dataCollectionItem = result.find(m => m.id === 'data_collection');
  if (dataCollectionItem) {
    const totalDays = collectionDays;
    if (totalDays > 0) {
      const ppd = (state.labCalc && state.labCalc.participantsPerDay) ? state.labCalc.participantsPerDay : null;
      let d = new Date(dataCollectionItem.date);
      for (let day = 1; day <= totalDays; day++) {
        d = nextWorkingDay(d, holidaySet);
        const ppdLabel = ppd ? ` \u2014 ${ppd} participant${ppd > 1 ? 's' : ''} scheduled` : '';
        result.push({
          id: `lab_day_${day}`,
          label: `Lab day ${day}/${totalDays}${ppdLabel}`,
          date: new Date(d),
          section: 'phase4_go',
          optional: false,
          roles: ['master', 'phd'],
          note: `Experiment day ${day} of ${totalDays}.${ppd ? ` ${ppd} participants scheduled.` : ''} Check equipment, arrive early, follow your protocol.`,
          labDay: true,
        });
        d = addDays(d, 1);
      }
    }
  }

  // User-defined custom milestones
  (state.customMilestones || []).forEach(c => {
    if (!c.id || !c.date) return;
    result.push({
      id: c.id,
      label: c.label || 'Custom milestone',
      date: parseDate(c.date),
      section: c.section || 'phase3_before_experiment',
      optional: !!c.optional,
      roles: ['master','phd'],
      note: c.note || '',
      durationMin: c.durationMin || 0,
      custom: true,
    });
  });

  // Apply per-milestone date overrides (skip lab_day_* since those are regenerated)
  const overrides = state.dateOverrides || {};
  result.forEach(m => {
    if (overrides[m.id]) {
      const newDate = parseDate(overrides[m.id]);
      if (m.id === 'data_collection' && m.endDate) {
        // Shift endDate by the same delta so the range label stays coherent
        const deltaMs = newDate - m.date;
        m.endDate = new Date(m.endDate.getTime() + deltaMs);
        m.label = `Data collection: ${formatDateShort(newDate)} \u2192 ${formatDateShort(m.endDate)}${m.label.includes('(') ? ' (' + m.label.split('(').slice(1).join('(') : ''}`;
      }
      m.date = newDate;
      m.overridden = true;
    }
  });

  // Filter out hidden milestones (never filter auto-generated lab_day_* here;
  // they can be hidden collectively by hiding 'data_collection', but we also
  // allow individual lab-day hiding via the same list).
  const hidden = new Set(state.hiddenMilestones || []);
  const filtered = hidden.size ? result.filter(m => !hidden.has(m.id)) : result;

  filtered.sort((a, b) => a.date - b.date);
  return filtered;
}

// ── Cached Milestones ──
let _milestoneCacheKey = null;
let _milestoneCacheResult = null;

function getCachedMilestones() {
  const labCalcKey = state.labCalc ? `${state.labCalc.totalDays},${state.labCalc.participantsPerDay}` : '';
  const blockedKey = (state.blockedSlots || []).map(b => `${b.dayIndex}:${b.startMin}-${b.endMin}`).join(';');
  const key = `${state.role}|${state.bpStart}|${state.bpWeeks}|${state.weekStart}|${state.thesisDeadline}|${state.collectionDays}|${state.analysisWeeks}|${state.manualLabDays}|${labCalcKey}|${blockedKey}`;
  if (key === _milestoneCacheKey && _milestoneCacheResult) {
    return _milestoneCacheResult;
  }
  _milestoneCacheKey = key;
  _milestoneCacheResult = computeMilestones();
  return _milestoneCacheResult;
}

// ── Overflow Menu ──
function toggleOverflow() {
  var menu = document.getElementById('plan-overflow');
  var btn = menu.querySelector('.overflow-toggle');
  var isOpen = menu.classList.toggle('open');
  btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}
function closeOverflow() {
  var menu = document.getElementById('plan-overflow');
  menu.classList.remove('open');
  menu.querySelector('.overflow-toggle').setAttribute('aria-expanded', 'false');
}
// Close overflow when clicking outside
document.addEventListener('click', function(e) {
  var menu = document.getElementById('plan-overflow');
  if (menu && !menu.contains(e.target)) closeOverflow();
});
// Keyboard: Escape closes overflow
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeOverflow();
});

// Go home — returns to role selection with confirmation if plan exists
function goHome() {
  var planScreen = document.getElementById('screen-plan');
  if (planScreen && planScreen.classList.contains('active')) {
    if (!confirm('Go back to the start? Your saved plan will still be available via your link.')) return;
  }
  editSetup();
}

// Export shortcut — opens .ics download and shows Google Calendar option
function exportCalendar() {
  downloadICS();
  showGoogleCalPanel();
}

// ── Toast ──
// ── Scroll to Lab Timetable ──
function scrollToTimetable() {
  // Switch to Lab tab first
  switchPlanTab('lab');
  var calc = document.getElementById('lab-calc-section');
  if (calc) {
    calc.open = true;
    setTimeout(function() {
      calc.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
  var ttBody = document.getElementById('timetable-body');
  if (ttBody) ttBody.style.display = 'block';
}

// ── Quick Estimate (Screen 4) ──
function updateQuickEstimate() {
  // Read values — use placeholder defaults when fields are blank
  const conditions = parseInt(document.getElementById('qe-conditions').value) || 2;
  const design = document.getElementById('qe-design').value;
  const nPerCondition = parseInt(document.getElementById('qe-n-per-condition').value) || 50;
  const sessionMin = parseInt(document.getElementById('qe-session-duration').value) || 30;
  const showupRate = Math.max(10, Math.min(100, parseInt(document.getElementById('qe-showup').value) || 50)) / 100;
  const perTimeslot = parseInt(document.getElementById('qe-per-timeslot').value) || 1;
  const buffer = parseInt(document.getElementById('qe-buffer').value) || 0;
  const lunch = parseInt(document.getElementById('qe-lunch').value) || 30;

  // Parse lab hours
  const startParts = (document.getElementById('qe-lab-start').value || '09:00').split(':');
  const endParts = (document.getElementById('qe-lab-end').value || '17:00').split(':');
  const lunchStartParts = (document.getElementById('qe-lunch-start').value || '12:00').split(':');
  const labStartMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
  const labEndMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
  const lunchStartMin = parseInt(lunchStartParts[0]) * 60 + parseInt(lunchStartParts[1]);

  // Total participants needed
  let targetN;
  if (design === 'within') {
    targetN = nPerCondition;
  } else {
    targetN = nPerCondition * conditions;
  }
  // Adjust for show-up rate: need more slots to account for no-shows
  const slotsNeeded = Math.ceil(targetN / showupRate);

  // Calculate usable minutes (same logic as full calculator)
  const totalLabMin = labEndMin - labStartMin;
  const usable = Math.max(0, totalLabMin - lunch);
  const slotDuration = sessionMin + buffer;
  const slotsPerDay = slotDuration > 0 ? Math.floor(usable / slotDuration) : 0;
  const participantsPerDay = slotsPerDay * perTimeslot;
  const days = participantsPerDay > 0 ? Math.ceil(slotsNeeded / participantsPerDay) : '?';
  const totalN = targetN; // keep for state/display

  const resultEl = document.getElementById('qe-result');
  resultEl.style.display = 'block';
  if (days === '?') {
    resultEl.innerHTML = '<span style="color:var(--warn);">Session duration exceeds available lab time. Adjust your inputs.</span>';
  } else {
    const showupPct = Math.round(showupRate * 100);
    resultEl.innerHTML = `Estimated: <strong>${days} lab day${days !== 1 ? 's' : ''}</strong> needed <span style="color:var(--ink-3);">(${targetN} participants needed, ${slotsNeeded} slots to open at ${showupPct}% show-up, ${slotsPerDay} slot${slotsPerDay !== 1 ? 's' : ''}/day)</span>`;
  }

  // Autofill collection days from estimate
  if (typeof days === 'number' && days > 0) {
    state.collectionDays = days;
    const cdInput = document.getElementById('collection-days-input');
    if (cdInput) cdInput.value = days;
  }

  // Save quick estimate to state for syncing with full calculator
  state.quickEstimate = { conditions, design, nPerCondition, sessionMin, showupRate, perTimeslot, buffer, labStartMin, labEndMin, lunch, lunchStartMin, totalN, slotsNeeded, days };
}

// ── Lab Timetable Calculator ──
function fmtTime(totalMin) {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function buildDaySlots(startMin, endMin, lunchStartMin, lunchDuration, slotDuration) {
  // Build slots around the lunch break
  const slots = [];
  let cursor = startMin;
  while (cursor + slotDuration <= endMin) {
    const slotEnd = cursor + slotDuration;
    // Does this slot overlap with lunch?
    if (lunchDuration > 0 && cursor < lunchStartMin + lunchDuration && slotEnd > lunchStartMin) {
      // Skip to after lunch
      cursor = lunchStartMin + lunchDuration;
      continue;
    }
    slots.push({ start: cursor, end: cursor + slotDuration });
    cursor = slotEnd;
  }
  return slots;
}

function getEffectiveDaySlots(dayIndex, daySlots, blockedSlots) {
  const blocks = (blockedSlots || []).filter(b => b.dayIndex === dayIndex);
  if (blocks.length === 0) return daySlots;
  return daySlots.filter(slot => {
    return !blocks.some(b => slot.start < b.endMin && slot.end > b.startMin);
  });
}

function updateCalc() {
  const conditions = parseInt(document.getElementById('calc-conditions').value) || 2;
  const design = document.getElementById('calc-design').value;
  const nPerCondition = parseInt(document.getElementById('calc-n-per-condition').value) || 50;
  const sessionMin = parseInt(document.getElementById('calc-session-duration').value) || 30;
  const showupRate = Math.max(10, Math.min(100, parseInt(document.getElementById('calc-showup').value) || 50)) / 100;
  const perTimeslot = parseInt(document.getElementById('calc-per-timeslot').value) || 1;
  const bufferEl = document.getElementById('calc-buffer');
  const buffer = bufferEl.value === '' ? 0 : (parseInt(bufferEl.value) || 0);
  const lunch = parseInt(document.getElementById('calc-lunch').value) || 0;
  const lunchStartVal = document.getElementById('calc-lunch-start').value || '12:00';
  const lunchStartMatch = lunchStartVal.match(/^(\d{1,2}):(\d{2})$/);
  const lunchStartMin = lunchStartMatch ? (parseInt(lunchStartMatch[1]) * 60 + parseInt(lunchStartMatch[2])) : 720;

  // Parse lab hours
  const startVal = document.getElementById('calc-lab-start').value || '09:00';
  const endVal = document.getElementById('calc-lab-end').value || '17:00';
  const startMatch = startVal.match(/^(\d{1,2}):(\d{2})$/);
  const endMatch = endVal.match(/^(\d{1,2}):(\d{2})$/);
  const startMin = startMatch ? (parseInt(startMatch[1]) * 60 + parseInt(startMatch[2])) : 540;
  const endMin = endMatch ? (parseInt(endMatch[1]) * 60 + parseInt(endMatch[2])) : 1020;
  const labMinutes = endMin - startMin;
  if (labMinutes <= 0) {
    document.getElementById('calc-result').style.display = 'block';
    document.getElementById('calc-result').innerHTML = '<p style="color:var(--accent);">Lab end time must be after start time. Use HH:MM format (e.g. 09:00).</p>';
    return;
  }

  // Total participants needed
  let targetN;
  let designLabel;
  if (design === 'within') {
    targetN = nPerCondition;
    designLabel = `Within-subject: each participant completes all ${conditions} conditions`;
  } else if (design === 'mixed') {
    targetN = nPerCondition * conditions;
    designLabel = `Mixed design: ${nPerCondition} participants \u00D7 ${conditions} groups (check your specific design)`;
  } else {
    targetN = nPerCondition * conditions;
    designLabel = `Between-subject: ${nPerCondition} participants \u00D7 ${conditions} conditions`;
  }
  // Adjust for show-up rate: need more slots to account for no-shows
  const totalN = Math.ceil(targetN / showupRate);

  // Build timeslots around lunch break
  const slotDuration = sessionMin + buffer;
  const daySlots = buildDaySlots(startMin, endMin, lunchStartMin, lunch, slotDuration);
  const slotsPerDay = daySlots.length;
  const participantsPerDay = slotsPerDay * perTimeslot;
  const baseTotalDays = participantsPerDay > 0 ? Math.ceil(totalN / participantsPerDay) : 0;
  // Simulate with blocked slots to get actual days needed
  let totalDays;
  if (participantsPerDay <= 0) {
    totalDays = '?';
  } else if ((state.blockedSlots || []).length === 0) {
    totalDays = baseTotalDays;
  } else {
    let simDays = 0;
    let remaining = totalN;
    const maxSim = Math.min(baseTotalDays + (state.blockedSlots || []).length + 365, 730);
    while (remaining > 0 && simDays < maxSim) {
      simDays++;
      const effSlots = getEffectiveDaySlots(simDays, daySlots, state.blockedSlots);
      if (effSlots.length === 0) continue;
      remaining -= effSlots.length * perTimeslot;
    }
    totalDays = remaining > 0 ? '?' : simDays;
  }
  const usableMinutes = labMinutes - lunch;

  // Save to state for plan
  state.labCalc = {
    totalN, targetN, nPerCondition, totalDays, participantsPerDay, slotsPerDay,
    sessionMin, conditions, design, perTimeslot, showupRate, daySlots, buffer,
    startMin, endMin, lunchStartMin, lunch
  };

  // Hide nudge and dot indicator now that full calculator is used
  var nudgeEl = document.getElementById('lab-calc-nudge');
  if (nudgeEl) nudgeEl.style.display = 'none';
  var dotEl = document.getElementById('lab-tab-dot');
  if (dotEl) dotEl.style.display = 'none';

  // Autofill the collection-days field with the calculator's recommended days.
  if (typeof totalDays === 'number' && totalDays > 0) {
    state.collectionDays = totalDays;
    const cdInput = document.getElementById('collection-days-input');
    if (cdInput) cdInput.value = totalDays;
  }

  // Check if timetable is currently open before rebuilding
  const ttBody = document.getElementById('timetable-body');
  const timetableWasOpen = ttBody && ttBody.style.display !== 'none';

  // Build timetable for each lab day
  let timetableHTML = '';
  if (slotsPerDay > 0 && totalDays !== '?' && state.weekStart) {
    const collectionStart = parseDate(state.weekStart);
    const holidaySet = buildHolidaySet(addDays(collectionStart, -7), addDays(collectionStart, totalDays * 3));
    let participantsRemaining = totalN;
    const lunchEnd = lunchStartMin + lunch;
    let dayRows = '';
    let d = new Date(collectionStart);
    for (let day = 1; day <= totalDays && participantsRemaining > 0; day++) {
      d = nextWorkingDay(d, holidaySet);
      const effectiveSlots = getEffectiveDaySlots(day, daySlots, state.blockedSlots);
      const effectiveParticipantsPerDay = effectiveSlots.length * perTimeslot;
      const dayParticipants = Math.min(participantsRemaining, effectiveParticipantsPerDay);
      const daySlotsNeeded = Math.ceil(dayParticipants / perTimeslot);
      // Merge participant slots, lunch break, and blocked slots into a single time-sorted sequence
      const dayBlocks = (state.blockedSlots || []).filter(b => b.dayIndex === day);
      const allItems = [];
      for (let s = 0; s < daySlotsNeeded; s++) {
        const slot = effectiveSlots[s];
        const pInSlot = Math.min(perTimeslot, participantsRemaining - s * perTimeslot);
        allItems.push({ type: 'participant', sortTime: slot.start, html: `<span class="mono slot-chip slot-chip-default">${fmtTime(slot.start)}\u2013${fmtTime(slot.start + sessionMin)}${perTimeslot > 1 ? ' (' + pInSlot + 'p)' : ''}</span>` });
      }
      if (lunch > 0) {
        allItems.push({ type: 'lunch', sortTime: lunchStartMin, html: `<span class="slot-chip slot-chip-lunch">lunch ${fmtTime(lunchStartMin)}\u2013${fmtTime(lunchEnd)}</span>` });
      }
      dayBlocks.forEach(b => {
        allItems.push({ type: 'blocked', sortTime: b.startMin, html: `<span class="slot-chip slot-chip-blocked">\u2715 ${fmtTime(b.startMin)}\u2013${fmtTime(b.endMin)}${b.label ? ' ' + escapeHTML(b.label) : ''}</span>` });
      });
      allItems.sort((a, b) => a.sortTime - b.sortTime);
      const slotLabels = allItems.map(item => item.html).join('');
      const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      dayRows += `<tr><td class="tt-day-cell"><strong>Day ${day}</strong><br><span class="mono form-hint-inline">${weekdays[d.getDay()]}, ${formatDateShort(d)}</span></td><td class="tt-slots-cell">${slotLabels}</td><td class="mono tt-total-cell">${dayParticipants} participant${dayParticipants !== 1 ? 's' : ''}</td></tr>`;
      participantsRemaining -= dayParticipants;
      d = addDays(d, 1);
    }
    const ttOpen = 'block';
    const ttChev = '\u25BC';
    timetableHTML = `
      <div class="mt-4">
        <button class="toggle-btn" onclick="var b=document.getElementById('timetable-body');b.style.display=b.style.display==='none'?'block':'none';this.querySelector('.chev').textContent=b.style.display==='none'?'\u25B6':'\u25BC';">
          <span class="chev">${ttChev}</span> Timetable overview
        </button>
        <div id="timetable-body" class="mt-3" style="display:${ttOpen};overflow-x:auto;">
          <table class="tt-table">
            <thead><tr><th>Day</th><th>Timeslots</th><th>Total</th></tr></thead>
            <tbody>${dayRows}</tbody>
          </table>
          <p class="form-hint mt-3">Weekends and public holidays are skipped.</p>
        </div>
      </div>`;
  }

  const result = document.getElementById('calc-result');
  result.style.display = 'block';
  const showupPct = Math.round(showupRate * 100);
  const totalHours = typeof totalDays === 'number' ? ((usableMinutes * totalDays) / 60).toFixed(1) : '?';
  result.innerHTML = `
    <div class="calc-result">
      <div class="calc-result-title">Calculator results</div>
      <div class="calc-result-grid">
        <div class="calc-result-item"><span class="num">${totalN}</span><span class="lbl">Total participants (${showupPct}% show-up)</span></div>
        <div class="calc-result-item"><span class="num">${totalDays}</span><span class="lbl">Lab days needed</span></div>
        <div class="calc-result-item"><span class="num">${slotsPerDay}</span><span class="lbl">Sessions per day</span></div>
        <div class="calc-result-item"><span class="num">${totalHours}h</span><span class="lbl">Total lab hours</span></div>
      </div>
    </div>
    <p style="font-size:12px;color:var(--ink-3);margin-top:12px;">
      ${designLabel}. ${targetN} target \u00D7 ${showupPct}% show-up = ${totalN} slots across ${totalDays} day${totalDays !== 1 ? 's' : ''}. ${sessionMin} min/session${buffer > 0 ? ` + ${buffer} min buffer` : ''}.
    </p>${totalDays > baseTotalDays ? `<div class="holiday-warning mt-3"><span class="hw-icon">\u26A0\uFE0F</span> Blocked time slots reduce capacity. Without blocks: ${baseTotalDays} days. With blocks: <strong>${totalDays} days</strong>.</div>` : ''}${timetableHTML}`;

  // Show/hide blocked-slots section and populate day dropdown
  const bsSection = document.getElementById('blocked-slots-section');
  if (bsSection) {
    bsSection.style.display = (slotsPerDay > 0 && totalDays !== '?') ? 'block' : 'none';
    const bsDaySel = document.getElementById('bs-day');
    if (bsDaySel) {
      const prevVal = bsDaySel.value;
      bsDaySel.innerHTML = '';
      for (let dd = 1; dd <= totalDays; dd++) {
        bsDaySel.innerHTML += `<option value="${dd}">Day ${dd}</option>`;
      }
      if (prevVal && parseInt(prevVal) <= totalDays) bsDaySel.value = prevVal;
    }
    // Sync recurring groups: add/remove entries so they match current totalDays
    if (typeof totalDays === 'number' && totalDays > 0) {
      const groups = new Map();
      (state.blockedSlots || []).forEach(b => {
        if (b.recurring && b.groupId) {
          if (!groups.has(b.groupId)) groups.set(b.groupId, []);
          groups.get(b.groupId).push(b);
        }
      });
      groups.forEach((items, groupId) => {
        const first = items[0];
        const existingDays = new Set(items.map(b => b.dayIndex));
        // Add missing days
        for (let d = 1; d <= totalDays; d++) {
          if (!existingDays.has(d)) {
            state.blockedSlots.push({
              id: 'blocked_' + Date.now() + '_' + d + '_' + Math.random().toString(36).slice(2,6),
              dayIndex: d, startMin: first.startMin, endMin: first.endMin, label: first.label,
              recurring: true, groupId
            });
          }
        }
        // Remove days beyond totalDays
        state.blockedSlots = state.blockedSlots.filter(b => !(b.groupId === groupId && b.dayIndex > totalDays));
      });
    }
    renderBlockedSlotsList();
  }

  // Auto-apply calculator changes to the plan (only from user interaction)
  if (!_calcSuppressDirty) {
    _milestoneCacheKey = null;
    saveState();
    renderPlan();
  }
}
var _calcSuppressDirty = false;

var _calcDirty = false;

function applyCalcChanges() {
  _calcDirty = false;
  _milestoneCacheKey = null;
  saveState();
  renderPlan();
  var banner = document.getElementById('calc-update-banner');
  if (banner) banner.remove();
}

function discardCalcChanges() {
  _calcDirty = false;
  // Restore calculator fields from last saved labCalc state
  if (state.labCalc) {
    var lc = state.labCalc;
    document.getElementById('calc-conditions').value = lc.conditions || 2;
    document.getElementById('calc-design').value = lc.design || 'between';
    document.getElementById('calc-n-per-condition').value = lc.nPerCondition || Math.round((lc.targetN || 60) / (lc.conditions || 2));
    document.getElementById('calc-session-duration').value = lc.sessionMin || 30;
    document.getElementById('calc-showup').value = lc.showupRate ? Math.round(lc.showupRate * 100) : 50;
    document.getElementById('calc-per-timeslot').value = lc.perTimeslot || 1;
    document.getElementById('calc-buffer').value = lc.buffer || 0;
    if (lc.startMin != null) document.getElementById('calc-lab-start').value = fmtTime(lc.startMin);
    if (lc.endMin != null) document.getElementById('calc-lab-end').value = fmtTime(lc.endMin);
    document.getElementById('calc-lunch').value = lc.lunch || 0;
    if (lc.lunchStartMin != null) document.getElementById('calc-lunch-start').value = fmtTime(lc.lunchStartMin);
    _calcSuppressDirty = true;
    updateCalc(); // re-render with restored values
    _calcSuppressDirty = false;
    _calcDirty = false;
  }
  var banner = document.getElementById('calc-update-banner');
  if (banner) banner.remove();
  showToast('Changes discarded.');
}

function onBsScopeChange() {
  const scope = document.querySelector('input[name="bs-scope"]:checked').value;
  document.getElementById('bs-day-row').style.display = scope === 'single' ? 'block' : 'none';
}

function openBlockedSlotForm() {
  document.getElementById('blocked-slot-form').style.display = 'block';
  document.getElementById('add-block-btn').style.display = 'none';
  // Reset to single-day mode
  const radios = document.querySelectorAll('input[name="bs-scope"]');
  radios.forEach(r => r.checked = r.value === 'single');
  document.getElementById('bs-day-row').style.display = 'block';
}

function closeBlockedSlotForm() {
  document.getElementById('blocked-slot-form').style.display = 'none';
  document.getElementById('add-block-btn').style.display = 'inline-flex';
  document.getElementById('bs-label').value = '';
}

function saveBlockedSlot() {
  const startVal = document.getElementById('bs-start').value;
  const endVal = document.getElementById('bs-end').value;
  const label = escapeHtml(document.getElementById('bs-label').value.trim());
  const startMatch = startVal.match(/^(\d{1,2}):(\d{2})$/);
  const endMatch = endVal.match(/^(\d{1,2}):(\d{2})$/);
  if (!startMatch || !endMatch) return;
  const sMin = parseInt(startMatch[1]) * 60 + parseInt(startMatch[2]);
  const eMin = parseInt(endMatch[1]) * 60 + parseInt(endMatch[2]);
  if (eMin <= sMin) { showToast('End time must be after start time.'); return; }
  if (!state.blockedSlots) state.blockedSlots = [];

  const scope = document.querySelector('input[name="bs-scope"]:checked').value;

  if (scope === 'every') {
    // Create one entry per lab day, linked by groupId
    const totalDays = (state.labCalc && typeof state.labCalc.totalDays === 'number') ? state.labCalc.totalDays : 1;
    const groupId = 'group_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
    for (let d = 1; d <= totalDays; d++) {
      state.blockedSlots.push({
        id: 'blocked_' + Date.now() + '_' + d + '_' + Math.random().toString(36).slice(2,6),
        dayIndex: d, startMin: sMin, endMin: eMin, label,
        recurring: true, groupId
      });
    }
  } else {
    const dayIndex = parseInt(document.getElementById('bs-day').value);
    state.blockedSlots.push({
      id: 'blocked_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
      dayIndex, startMin: sMin, endMin: eMin, label
    });
  }

  closeBlockedSlotForm();
  updateCalc();
  saveState();
}

function removeBlockedSlot(id) {
  state.blockedSlots = (state.blockedSlots || []).filter(b => b.id !== id);
  updateCalc();
  saveState();
}

function removeBlockedGroup(groupId) {
  state.blockedSlots = (state.blockedSlots || []).filter(b => b.groupId !== groupId);
  updateCalc();
  saveState();
}

function renderBlockedSlotsList() {
  const container = document.getElementById('blocked-slots-list');
  if (!container) return;
  const blocks = state.blockedSlots || [];
  if (blocks.length === 0) { container.innerHTML = ''; return; }

  // Separate recurring groups from single blocks
  const groups = new Map();
  const singles = [];
  blocks.forEach(b => {
    if (b.recurring && b.groupId) {
      if (!groups.has(b.groupId)) groups.set(b.groupId, []);
      groups.get(b.groupId).push(b);
    } else {
      singles.push(b);
    }
  });

  let html = '';

  // Render recurring groups as a single row each
  groups.forEach((items, groupId) => {
    const first = items[0];
    const dayCount = items.length;
    html += `<div class="flex-row" style="padding:0.3rem 0;font-size:var(--text-sm);">
      <span class="mono" style="color:var(--warn);font-weight:600;">Every day</span>
      <span style="font-size:var(--text-xs);color:var(--ink-3);">(${dayCount} days)</span>
      <span class="mono">${fmtTime(first.startMin)}\u2013${fmtTime(first.endMin)}</span>
      <span class="form-hint-inline">${escapeHTML(first.label || '')}</span>
      <button type="button" data-group-id="${escapeHTML(groupId)}" onclick="removeBlockedGroup(this.dataset.groupId)" class="remove-btn" aria-label="Remove recurring blocked slots">\u00D7</button>
    </div>`;
  });

  // Render single blocks
  singles.forEach(b => {
    html += `<div class="flex-row" style="padding:0.3rem 0;font-size:var(--text-sm);">
      <span class="mono" style="color:var(--accent);font-weight:600;">Day ${b.dayIndex}</span>
      <span class="mono">${fmtTime(b.startMin)}\u2013${fmtTime(b.endMin)}</span>
      <span class="form-hint-inline">${escapeHTML(b.label || '')}</span>
      <button type="button" data-slot-id="${escapeHTML(b.id)}" onclick="removeBlockedSlot(this.dataset.slotId)" class="remove-btn" aria-label="Remove blocked slot">\u00D7</button>
    </div>`;
  });

  container.innerHTML = html;
}

function showToast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('toast-warning');
  if (type === 'warning') el.classList.add('toast-warning');
  el.classList.add('show');
  setTimeout(() => { el.classList.remove('show'); el.classList.remove('toast-warning'); }, type === 'warning' ? 4000 : 2500);
}

// ── Milestones ──
// relativeTo: "bp" = offset from BP start date, "week" (default) = offset from chosen data collection week
const MILESTONES = [
  // ── Phase 1: Before requesting participants ──
  { id: "ethics_check", label: "Confirm ERCIC ethics approval is in hand", offsetDays: -56, relativeTo: "week", roles: ["phd"], optional: false, section: "phase1_before_sona", note: "ERCIC reviews take months \u2014 you should have submitted well before this point. Check the timeline and requirements at maastrichtuniversity.nl/ethical-review-committee-inner-city-faculties-ercic. If you haven\u2019t submitted yet, do it NOW and inform your supervisor. Do not start data collection without approval.", durationMin: 30 },
  { id: "prereg", label: "Pre-register on OSF or AsPredicted", offsetDays: -21, relativeTo: "week", roles: ["phd"], optional: false, section: "phase3_before_experiment", note: "Pre-register after your power analysis and SONA request, but before data collection starts. Separates confirmatory from exploratory.", durationMin: 120 },
  { id: "supervisor_checkin", label: "Check in with supervisor \u2014 ethics and pre-registration confirmed", offsetDays: -42, relativeTo: "week", roles: ["master"], optional: false, section: "phase1_before_sona", note: "Your supervisor handles formal ethics and pre-registration. Your job is to confirm it is done before you proceed.", durationMin: 30 },
  { id: "power_analysis", label: "Power analysis \u2014 calculate minimum N per condition", offsetDays: -56, relativeTo: "week", roles: ["master","phd"], optional: true, section: "phase1_before_sona", note: "Do this before pre-registration \u2014 your pre-reg should include your target N. If your pool is fixed, report achieved power post-hoc.", durationMin: 180 },
  { id: "equipment_book", label: "Book lab (DEXLab / BEELab) and equipment via Resource Booker", offsetDays: -35, relativeTo: "week", roles: ["master","phd"], optional: false, section: "phase1_before_sona", note: "Book before submitting your SONA request \u2014 you need to know your room and timeslots. Go to resourcebooker.maastrichtuniversity.nl. If you don\u2019t have access, ask your supervisor to book it for you.", durationMin: 30 },
  // ── Phase 2: Requesting participants & SONA setup ──
  { id: "sona_request", label: "Submit SONA participant request form", masterLabel: "Submit SONA participant request form (ask your supervisor to do this)", offsetDays: -38, relativeTo: "bp", roles: ["master","phd"], optional: false, section: "phase2_sona", note: "The SONA coordinator sends a request form ~5\u20136 weeks before the block period. Fill it in with your estimated N per condition and session length. Miss this and you wait an entire period. Exact dates vary per period \u2014 check with the SONA coordinator.", durationMin: 30 },
  { id: "sona_upload", label: "Upload and finalize study on SONA", masterLabel: "Upload and finalize study on SONA (ask your supervisor to do this)", offsetDays: -5, relativeTo: "bp", roles: ["master","phd"], optional: false, section: "phase2_sona", note: "After the matchmaking is shared, upload your study to SONA: set timeslots, participants per slot, and session length. Must be done ~5 days before the period starts. Exact deadline varies \u2014 check the email from the SONA coordinator.", durationMin: 60 },
  { id: "sona_active", label: "SONA study must be active", masterLabel: "SONA study must be active (ask your supervisor to confirm)", offsetDays: 0, relativeTo: "bp", roles: ["master","phd"], optional: false, section: "phase2_sona", keyDate: true, note: "Your study must be live and visible to students when the block period starts. If it is not active on day one, you lose participant slots." },
  // ── Phase 3: Before the experiment ──
  { id: "stimuli_pretest", label: "Pretest stimuli with 3\u20135 people", offsetDays: -14, relativeTo: "week", roles: ["master","phd"], optional: false, section: "phase3_before_experiment", note: "Is your manipulation actually manipulating what you think it is?", durationMin: 120 },
  { id: "pilot", label: "Complete full pilot test (dry run with a friend)", offsetDays: -7, relativeTo: "week", roles: ["master","phd"], optional: false, section: "phase3_before_experiment", note: "Every tech demo fails the first time. Do not let that be with a real participant.", durationMin: 90 },
  { id: "qualtrics_final", label: "Qualtrics survey and manipulations finalized", offsetDays: -3, relativeTo: "week", roles: ["master","phd"], optional: false, section: "phase3_before_experiment", note: "End-to-end test, randomization confirmed, all conditions working.", durationMin: 60 },
  { id: "inform_team", label: "Post planning in Experiment Teams chat", offsetDays: -35, relativeTo: "week", roles: ["master","phd"], optional: false, section: "phase1_before_sona", note: "Share your planned dates, rooms, timeslots, and conditions before requesting SONA participants. This helps align with other researchers on DEXLab booking times and equipment availability.", durationMin: 15 },
  // ── Phase 4: Go time ──
  { id: "equipment_prep", label: "Prepare equipment \u2014 charge devices, check software updates", offsetDays: -1, relativeTo: "week", roles: ["master","phd"], optional: false, section: "phase4_go", note: "The day before data collection: charge all devices (tablets, laptops, eye trackers, etc.), verify that all software is installed and up to date, test your full setup one more time. Do not discover a mandatory update 5 minutes before your first participant.", durationMin: 60 },
  { id: "data_collection", label: "Data collection starts", offsetDays: 0, relativeTo: "week", roles: ["master","phd"], optional: false, section: "phase4_go", keyDate: true, note: "Your chosen data collection week begins. SONA participant slots open earlier (when requested by the SONA coordinator) so students can sign up in advance.", dynamic: true },
  // ── Phase 5: After data collection (master thesis) ──
  { id: "prepare_measures", label: "Prepare variables, scales, and analysis plan", offsetDays: -7, relativeTo: "week", roles: ["master"], optional: false, section: "phase3_before_experiment", note: "Define your dependent and independent variables, finalize measurement scales, plan manipulation checks, and outline your analysis strategy. Having this ready before data collection means you can start analysis immediately once data is in.", durationMin: 180 },
  { id: "data_cleaning", label: "Data analysis (cleaning, preparation, analysis)", offsetDays: 1, relativeTo: "collectionEnd", roles: ["master"], optional: false, section: "phase5_thesis", note: "Analysis starts the day after data collection ends. Export data, check for exclusions, clean variables, prepare your dataset, run your pre-registered analyses and any exploratory analyses. Budget about 1 week for this entire task.", durationMin: 2400 },
  { id: "first_draft", label: "First full draft to supervisor", offsetDays: -21, relativeTo: "thesis", roles: ["master"], optional: false, section: "phase5_thesis", keyDate: true, note: "Submit a complete first draft — intro, method, results, and discussion. It does not need to be perfect, but it needs to be complete. Your supervisor needs enough to give meaningful feedback." },
  { id: "supervisor_feedback", label: "Receive supervisor feedback", offsetDays: -18, relativeTo: "thesis", roles: ["master"], optional: false, section: "phase5_thesis", note: "Expect ~3–5 days for your supervisor to review. Use this time to polish figures, check references, and proofread. If you haven't heard back, send a reminder." },
  { id: "revision_complete", label: "Revisions complete — final draft ready", offsetDays: -7, relativeTo: "thesis", roles: ["master"], optional: false, section: "phase5_thesis", note: "Incorporate all supervisor feedback. This is your last chance to improve content. After this, only formatting and final checks remain." },
  { id: "final_check", label: "Final formatting, references, and plagiarism check", offsetDays: -3, relativeTo: "thesis", roles: ["master"], optional: false, section: "phase5_thesis", note: "Check formatting requirements, run a plagiarism self-check, verify all references are complete, and ensure figures/tables are numbered correctly." },
  { id: "thesis_submission", label: "Thesis submission deadline", offsetDays: 0, relativeTo: "thesis", roles: ["master"], optional: false, section: "phase5_thesis", keyDate: true, note: "Your thesis submission deadline. Make sure you know the exact submission procedure — some programmes require both a digital upload and a physical copy." },
];

const SECTION_LABELS = {
  phase1_before_sona: "Phase 1: Before SONA",
  phase2_sona: "Phase 2: SONA Setup",
  phase3_before_experiment: "Phase 3: Before Experiment",
  phase4_go: "Phase 4: Data Collection",
  phase5_thesis: "Phase 5: Analysis & Writing",
};

// ── App State ──
let state = {
  version: 1,
  role: null,
  name: "",
  studyTitle: "",
  bpStart: null,    // BP start date (period start)
  weekStart: null,   // chosen data collection week start
  bpWeeks: 8,
  thesisDeadline: null,
  supervisorEmail: "",
  manualLabDays: 0,
  collectionDays: 5,
  analysisWeeks: 1,
  customMilestones: [],
  hiddenMilestones: [],
  dateOverrides: {},
  blockedSlots: [],
  checkedItems: [],
  lastUpdated: null,
  calExportedHash: null,
  calSequence: 0,
};

let hasLocalStorage = true;

// ── Shareable URL ──
function encodeState() {
  // Compact dates: strip common "202" prefix → e.g. "2026-05-11" → "6-05-11"
  const compactDate = d => d ? d.replace(/^202/, '') : '';
  const params = new URLSearchParams();
  params.set('r', state.role === 'master' ? 'm' : 'p');
  if (state.name) params.set('n', state.name);
  if (state.studyTitle) params.set('t', state.studyTitle);
  params.set('s', compactDate(state.bpStart));
  if (state.weekStart && state.weekStart !== state.bpStart) params.set('ws', compactDate(state.weekStart));
  if (state.bpWeeks !== 8) params.set('w', state.bpWeeks);
  if (state.thesisDeadline) params.set('td', compactDate(state.thesisDeadline));
  if (state.collectionDays && state.collectionDays !== 5) params.set('cd', state.collectionDays);
  if (state.analysisWeeks && state.analysisWeeks !== 1) params.set('aw', state.analysisWeeks);
  if (state.manualLabDays) params.set('ml', state.manualLabDays);
  if (state.customMilestones && state.customMilestones.length) {
    // Compact: base64 of minimal JSON array
    try {
      const cmPayload = state.customMilestones.map(c => [c.id, c.label || '', c.date || '', c.section || '', c.durationMin || 0, c.note || '']);
      params.set('cm', btoa(unescape(encodeURIComponent(JSON.stringify(cmPayload)))));
    } catch (e) {}
  }
  if (state.hiddenMilestones && state.hiddenMilestones.length) {
    params.set('hm', state.hiddenMilestones.join(','));
  }
  if (state.dateOverrides && Object.keys(state.dateOverrides).length) {
    // id1:YYYY-MM-DD,id2:YYYY-MM-DD
    const parts = Object.entries(state.dateOverrides).map(([id, d]) => `${id}:${d}`);
    params.set('do', parts.join(','));
  }
  if (state.blockedSlots && state.blockedSlots.length) {
    try {
      const bsPayload = state.blockedSlots.map(b => [b.dayIndex, b.startMin, b.endMin, b.label || '', b.recurring ? 1 : 0, b.groupId || '']);
      params.set('bs', btoa(unescape(encodeURIComponent(JSON.stringify(bsPayload)))));
    } catch (e) {}
  }
  // Supervisor email and checked items are personal — saved in localStorage only
  return params.toString();
}

function decodeState(hash) {
  // Expand compact dates: "6-05-11" → "2026-05-11"
  const expandDate = d => d ? (d.match(/^\d{4}/) ? d : '202' + d) : '';

  // Try URL-param format first
  if (hash.includes('r=') && hash.includes('s=')) {
    try {
      const p = new URLSearchParams(hash);
      if (p.get('r') && p.get('s')) {
        const r = p.get('r');
        state.role = (r === 'm' ? 'master' : r === 'p' ? 'phd' : r);
        state.name = escapeHTML(p.get('n') || "");
        state.studyTitle = escapeHTML(p.get('t') || "");
        state.bpStart = expandDate(p.get('s'));
        state.weekStart = expandDate(p.get('ws')) || state.bpStart;
        state.bpWeeks = Math.max(1, Math.min(52, parseInt(p.get('w')) || 8));
        state.thesisDeadline = expandDate(p.get('td')) || null;
        if (p.get('cd')) {
          state.collectionDays = Math.max(1, Math.min(60, parseInt(p.get('cd')) || 5));
        } else if (p.get('cw')) {
          // Legacy: cw was collection weeks. Convert to ~5 working days/week.
          state.collectionDays = Math.max(1, Math.min(60, (parseInt(p.get('cw')) || 1) * 5));
        } else {
          state.collectionDays = 5;
        }
        state.analysisWeeks = Math.max(1, Math.min(12, parseInt(p.get('aw')) || 1));
        state.supervisorEmail = escapeHTML(p.get('se') || "");
        state.manualLabDays = Math.max(0, Math.min(30, parseInt(p.get('ml')) || 0));
        state.customMilestones = [];
        if (p.get('cm')) {
          try {
            const arr = JSON.parse(decodeURIComponent(escape(atob(p.get('cm')))));
            state.customMilestones = arr.map(a => ({
              id: a[0], label: escapeHTML(a[1]), date: a[2], section: a[3], durationMin: parseInt(a[4]) || 0, note: escapeHTML(a[5] || ''),
            }));
          } catch (e) {}
        }
        state.hiddenMilestones = p.get('hm') ? p.get('hm').split(',').filter(Boolean) : [];
        state.dateOverrides = {};
        if (p.get('do')) {
          p.get('do').split(',').forEach(pair => {
            const [id, d] = pair.split(':');
            if (id && d && /^\d{4}-\d{2}-\d{2}$/.test(d)) state.dateOverrides[id] = d;
          });
        }
        state.blockedSlots = [];
        if (p.get('bs')) {
          try {
            const arr = JSON.parse(decodeURIComponent(escape(atob(p.get('bs')))));
            state.blockedSlots = arr.filter(a => {
              const s = Math.max(0, Math.min(1440, parseInt(a[1]) || 0));
              const e = Math.max(0, Math.min(1440, parseInt(a[2]) || 0));
              return e > s;
            }).map((a, i) => ({
              id: 'blocked_' + i + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
              dayIndex: Math.max(1, Math.min(365, parseInt(a[0]) || 1)),
              startMin: Math.max(0, Math.min(1440, parseInt(a[1]) || 0)),
              endMin: Math.max(0, Math.min(1440, parseInt(a[2]) || 0)),
              label: escapeHTML(a[3] || ''),
              recurring: !!(a[4]),
              groupId: escapeHTML(a[5] || ''),
            }));
          } catch (e) {}
        }
        state.checkedItems = p.get('c') ? p.get('c').split(',') : [];
        return true;
      }
    } catch (e) {}
  }
  // Fallback: legacy base64 JSON format
  try {
    const json = atob(hash);
    const p = JSON.parse(json);
    if ((p.v === 1 || p.v === 2 || p.v === 3 || p.v === 4 || p.v === 5) && p.r && p.s) {
      state.role = p.r;
      state.name = escapeHTML(p.n || "");
      state.studyTitle = escapeHTML(p.t || "");
      state.bpStart = p.s;
      state.weekStart = p.ws || p.s;
      state.bpWeeks = Math.max(1, Math.min(52, p.w || 8));
      state.thesisDeadline = p.td || null;
      state.supervisorEmail = escapeHTML(p.se || "");
      state.manualLabDays = Math.max(0, Math.min(30, p.ml || 0));
      state.checkedItems = p.c || [];
      return true;
    }
  } catch (e) {}
  return false;
}

function getShareURL() {
  const base = window.location.href.split('#')[0].split('?')[0];
  return base + '#' + encodeState();
}

function copyShareLink() {
  const url = getShareURL();
  navigator.clipboard.writeText(url).then(() => {
    showToast('Link copied! Bookmark it or share it to return to this plan.');
  }).catch(() => {
    // Fallback
    prompt('Copy this link to save/share your plan:', url);
  });
  // Also update the URL bar silently
  history.replaceState(null, '', '#' + encodeState());
}

function copyProgressSummary() {
  const today = new Date(); today.setHours(0,0,0,0);
  const computed = getCachedMilestones();
  const dc = computed.find(m => m.id === 'data_collection');

  const total = computed.length;
  const done = computed.filter(m => state.checkedItems.includes(m.id)).length;
  const pct = Math.round((done / total) * 100);
  const displayName = state.name || 'Student';
  const titleLine = state.studyTitle ? ` \u2014 ${state.studyTitle}` : '';

  let lines = [];
  lines.push(`DEXLab Experiment Planner \u2014 Progress Update`);
  lines.push(`${displayName}${titleLine}`);
  lines.push(`Role: ${state.role === 'phd' ? 'PhD Researcher' : 'Master Student'}`);
  if (dc) lines.push(`Data collection: ${formatDate(dc.date)} \u2192 ${formatDate(dc.endDate)}`);
  lines.push(`Overall: ${done}/${total} milestones complete (${pct}%)`);
  lines.push('');

  // Group status
  const overdue = computed.filter(m => !state.checkedItems.includes(m.id) && daysBetween(today, m.date) < 0);
  const upcoming = computed.filter(m => !state.checkedItems.includes(m.id) && daysBetween(today, m.date) >= 0 && daysBetween(today, m.date) <= 7);
  const completed = computed.filter(m => state.checkedItems.includes(m.id));

  if (overdue.length > 0) {
    lines.push('OVERDUE:');
    overdue.forEach(m => lines.push(`  \u2717 ${m.label} (was due ${formatDate(m.date)})`));
    lines.push('');
  }
  if (upcoming.length > 0) {
    lines.push('DUE THIS WEEK:');
    upcoming.forEach(m => lines.push(`  \u25CB ${m.label} (${formatDate(m.date)})`));
    lines.push('');
  }
  if (completed.length > 0) {
    lines.push('COMPLETED:');
    completed.forEach(m => lines.push(`  \u2713 ${m.label}`));
    lines.push('');
  }

  lines.push(`Generated: ${formatDate(today)}`);

  const text = lines.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    showToast('Progress summary copied! Paste it into Teams or email.');
  }).catch(() => {
    prompt('Copy this progress summary:', text);
  });
}

// ── Supervisor Update ──
function buildSupervisorBody() {
  const today = new Date(); today.setHours(0,0,0,0);
  const computed = getCachedMilestones();
  const dc = computed.find(m => m.id === 'data_collection');

  const total = computed.length;
  const done = computed.filter(m => state.checkedItems.includes(m.id)).length;
  const pct = Math.round((done / total) * 100);
  const displayName = state.name || 'Student';
  const titleLine = state.studyTitle ? ` \u2014 ${state.studyTitle}` : '';

  const overdue = computed.filter(m => !state.checkedItems.includes(m.id) && daysBetween(today, m.date) < 0);
  const upcoming = computed.filter(m => !state.checkedItems.includes(m.id) && daysBetween(today, m.date) >= 0 && daysBetween(today, m.date) <= 14);

  let lines = [];
  const note = document.getElementById('supervisor-note').value.trim();
  if (note) {
    lines.push(note);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push(`Progress: ${done}/${total} milestones complete (${pct}%)`);
  if (dc) lines.push(`Data collection: ${formatDate(dc.date)} \u2192 ${formatDate(dc.endDate)}`);
  if (state.thesisDeadline) lines.push(`Thesis deadline: ${formatDate(parseDate(state.thesisDeadline))}`);
  lines.push('');

  if (overdue.length > 0) {
    lines.push('OVERDUE:');
    overdue.forEach(m => lines.push(`  \u2717 ${m.label} (was due ${formatDate(m.date)})`));
    lines.push('');
  }
  if (upcoming.length > 0) {
    lines.push('COMING UP (next 2 weeks):');
    upcoming.forEach(m => lines.push(`  \u25CB ${m.label} (${formatDate(m.date)})`));
    lines.push('');
  }

  lines.push(`View full plan: ${getShareURL()}`);
  lines.push('');
  lines.push(`\u2014 Sent via DEXLab Experiment Planner`);

  return { displayName, titleLine, body: lines.join('\n') };
}

function toggleSupervisorUpdate() {
  const panel = document.getElementById('supervisor-panel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function sendSupervisorEmail() {
  const { displayName, titleLine, body } = buildSupervisorBody();
  const subject = `Experiment progress update: ${displayName}${titleLine}`;
  const mailto = `mailto:${encodeURIComponent(state.supervisorEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto, '_blank');
  document.getElementById('supervisor-panel').style.display = 'none';
  showToast('Email draft opened \u2014 review and send.');
}

function copySupervisorUpdate() {
  const { body } = buildSupervisorBody();
  navigator.clipboard.writeText(body).then(() => {
    showToast('Update copied \u2014 paste it into Teams, email, or chat.');
    document.getElementById('supervisor-panel').style.display = 'none';
  }).catch(() => {
    prompt('Copy this update:', body);
  });
}

// ── ICS Calendar Export ──
function downloadICS() {
  // Prompt for name/title if not set
  if (!state.name) {
    const name = prompt('Enter your name (for calendar events):');
    if (name === null) { showToast('Calendar export cancelled.'); return; }
    state.name = name.trim();
    saveState();
  }
  if (!state.studyTitle) {
    const title = prompt('Enter your study title / nickname (for calendar events):');
    if (title === null) { showToast('Calendar export cancelled.'); return; }
    state.studyTitle = title.trim();
    saveState();
  }
  const computed = getCachedMilestones();
  const displayName = state.name || 'Student';
  const studyLabel = state.studyTitle ? ` \u2014 ${state.studyTitle}` : '';
  const now = new Date();
  const stamp = toICSDate(now);

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DEXLab//Experiment Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  const seq = state.calSequence || 0;
  computed.forEach(m => {
    const dateStr = toICSDateOnly(m.date);
    const uid = `${m.id}-${state.bpStart}@dexlab-planner`;
    const description = (m.note || '').replace(/\n/g, '\\n');
    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${uid}`);
    ics.push(`SEQUENCE:${seq}`);
    ics.push(`DTSTAMP:${stamp}`);
    ics.push(`DTSTART;VALUE=DATE:${dateStr}`);
    ics.push(`DTEND;VALUE=DATE:${dateStr}`);
    ics.push(`SUMMARY:[DEXLab] ${m.label}`);
    ics.push(`DESCRIPTION:${description}\\n\\nPlan: ${displayName}${studyLabel}`);
    // Reminder 1 day before
    ics.push('BEGIN:VALARM');
    ics.push('TRIGGER:-P1D');
    ics.push('ACTION:DISPLAY');
    ics.push(`DESCRIPTION:DEXLab reminder: ${m.label}`);
    ics.push('END:VALARM');
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');

  const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dexlab-milestones-${state.bpStart}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Save a hash of exported milestone dates so we can detect changes
  state.calExportedHash = getMilestoneHash(computed);
  state.calSequence = seq + 1;
  saveState();
  _hideCalSyncBanner();
  showToast('Calendar downloaded — open it to update your calendar. Events with the same name will be updated, not duplicated.');
}

function getMilestoneHash(milestones) {
  return milestones.map(m => m.id + ':' + toISO(m.date)).join('|');
}

function checkCalSyncNeeded() {
  if (!state.calExportedHash) return; // never exported
  const computed = getCachedMilestones();
  const currentHash = getMilestoneHash(computed);
  if (currentHash !== state.calExportedHash) {
    _showCalSyncBanner();
  } else {
    _hideCalSyncBanner();
  }
}

function _showCalSyncBanner() {
  if (document.getElementById('cal-sync-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'cal-sync-banner';
  banner.className = 'notice notice-warning mt-3';
  banner.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);';
  banner.innerHTML = '<span><strong>Calendar out of sync</strong> — your plan has changed since you last exported. Re-download to update your calendar events.</span>' +
    '<div class="flex-actions" style="flex-shrink:0;">' +
    '<button class="btn btn-sm btn-orange" onclick="downloadICS()">Re-download .ics</button>' +
    '<button class="btn btn-sm btn-ghost" onclick="this.parentElement.parentElement.remove();">\u2715</button>' +
    '</div>';
  const overview = document.getElementById('panel-overview');
  if (overview) overview.prepend(banner);
}

function _hideCalSyncBanner() {
  const banner = document.getElementById('cal-sync-banner');
  if (banner) banner.remove();
}

function toICSDate(d) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function toICSDateOnly(d) {
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

// ── Google Calendar Export ──
function toGCalDate(d) {
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

function buildGCalURL(milestone) {
  const dateStr = toGCalDate(milestone.date);
  const next = new Date(milestone.date);
  next.setDate(next.getDate() + 1);
  const endStr = toGCalDate(next);
  const title = `[DEXLab] ${milestone.label}`;
  const details = (milestone.note || '') + (state.studyTitle ? `\n\nStudy: ${state.studyTitle}` : '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${dateStr}/${endStr}`,
    details: details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildFullPlanGCalURL(milestones) {
  const all = [...milestones].sort((a, b) => a.date - b.date);
  const first = all[0];
  const last = all[all.length - 1];
  const startStr = toGCalDate(first.date);
  const endDate = new Date(last.date);
  endDate.setDate(endDate.getDate() + 1);
  const endStr = toGCalDate(endDate);
  const studyLabel = state.studyTitle || 'Experiment';
  const title = `[DEXLab] ${studyLabel} — Experiment Plan`;
  const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
  const lines = all.map(m => {
    const prefix = m.keyDate ? '\u2605 ' : '  ';
    return `${prefix}${fmt.format(m.date)} — ${m.label}`;
  });
  const details = `Experiment plan milestones:\n\n${lines.join('\n')}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details: details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function showGoogleCalPanel() {
  const panel = document.getElementById('gcal-panel');
  const list = document.getElementById('gcal-list');
  const computed = getCachedMilestones();

  if (computed.length === 0) {
    showToast('No milestones to export yet.');
    return;
  }

  // Build full plan link
  document.getElementById('gcal-all-link').href = buildFullPlanGCalURL([...computed]);

  // Sort: key dates first, then by date
  const sorted = [...computed].sort((a, b) => {
    if (a.keyDate && !b.keyDate) return -1;
    if (!a.keyDate && b.keyDate) return 1;
    return a.date - b.date;
  });

  const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  list.innerHTML = sorted.map(m => {
    const url = buildGCalURL(m);
    const cls = m.keyDate ? 'gcal-item key' : 'gcal-item';
    return `<div class="${cls}">
      <span class="gcal-item-date">${fmt.format(m.date)}</span>
      <span class="gcal-item-label">${escapeHTML(m.label)}</span>
      <a href="${url}" target="_blank" rel="noopener">+ Add</a>
    </div>`;
  }).join('');

  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── localStorage ──
function loadState() {
  try {
    const raw = localStorage.getItem("dexlab_planner_state");
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && saved.version) {
        Object.assign(state, saved);
        return true;
      }
    }
  } catch (e) {
    hasLocalStorage = false;
    document.getElementById('ls-notice').style.display = 'block';
  }
  return false;
}

function saveState() {
  try {
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem("dexlab_planner_state", JSON.stringify(state));
  } catch (e) { /* private browsing */ }
  // Also update hash silently when on plan screen
  if (document.getElementById('screen-plan').classList.contains('active')) {
    history.replaceState(null, '', '#' + encodeState());
  }
}

// Arrow key navigation between plan tabs
document.addEventListener('keydown', function(e) {
  var tablist = document.querySelector('.plan-tabs');
  if (!tablist || !tablist.contains(document.activeElement)) return;
  var tabNames = ['overview', 'milestones', 'checklist', 'lab'];
  var current = tabNames.indexOf(document.activeElement.id.replace('tab-', ''));
  if (current < 0) return;
  var next = -1;
  if (e.key === 'ArrowRight') next = (current + 1) % tabNames.length;
  else if (e.key === 'ArrowLeft') next = (current - 1 + tabNames.length) % tabNames.length;
  if (next >= 0) {
    e.preventDefault();
    switchPlanTab(tabNames[next]);
    document.getElementById('tab-' + tabNames[next]).focus();
  }
});

// ── Tab switching ──
function switchPlanTab(name) {
  _switchPlanTabDirect(name);
}

function _switchPlanTabDirect(name) {
  document.querySelectorAll('.plan-tab').forEach(function(t) {
    var isActive = t.id === 'tab-' + name;
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    t.setAttribute('tabindex', isActive ? '0' : '-1');
  });
  document.querySelectorAll('.plan-tabpanel').forEach(function(p) {
    p.classList.toggle('active', p.id === 'panel-' + name);
  });
}

// ── Screen Management ──
// ── Step indicator ──
const STEP_MAP = [
  { btn: 'step-btn-role', screen: 'screen-role' },
  { btn: 'step-btn-date', screen: 'screen-date' },
  { btn: 'step-btn-name', screen: 'screen-name' },
  { btn: 'step-btn-plan', screen: 'screen-plan' },
];
var _highestReachedStep = 0;

function updateStepIndicator(screenId) {
  const indicator = document.getElementById('step-indicator');
  if (!indicator) return;
  // Hide on plan screen
  indicator.style.display = (screenId === 'screen-plan') ? 'none' : '';
  // Find which step this screen belongs to (screen-confirm maps to step 1 / Schedule)
  let activeIdx = STEP_MAP.findIndex(s => s.screen === screenId);
  if (screenId === 'screen-confirm') activeIdx = 1; // confirm is part of Schedule step
  if (activeIdx < 0) return;
  if (activeIdx > _highestReachedStep) _highestReachedStep = activeIdx;
  STEP_MAP.forEach((step, i) => {
    const btn = document.getElementById(step.btn);
    if (!btn) return;
    btn.removeAttribute('aria-current');
    btn.classList.remove('completed');
    btn.disabled = (i > _highestReachedStep);
    if (i === activeIdx) btn.setAttribute('aria-current', 'step');
    else if (i < activeIdx) btn.classList.add('completed');
  });
}

function navigateToStep(screenId) {
  const idx = STEP_MAP.findIndex(s => s.screen === screenId);
  if (idx > _highestReachedStep) return; // can't skip ahead
  if (screenId === 'screen-plan') {
    // Plan screen needs generatePlan, can't just show it
    return;
  }
  showScreensUpTo(screenId);
}

function showScreen(id) {
  if (id === 'screen-plan') {
    showPlanView();
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  updateStepIndicator(id);
  if (typeof advanceTourForScreen === 'function') advanceTourForScreen(id);
}

function showScreensUpTo(id) {
  const order = ['screen-role','screen-date','screen-confirm','screen-name','screen-plan'];
  const idx = order.indexOf(id);
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  for (let i = 0; i <= idx; i++) {
    document.getElementById(order[i]).classList.add('active');
  }
  updateStepIndicator(id);
  if (typeof advanceTourForScreen === 'function') advanceTourForScreen(id);
}

// ── Screen 1: Role ──
function selectRole(role) {
  state.role = role;
  document.body.className = `role-${role}`;
  document.getElementById('btn-master').className = `role-card${role === 'master' ? ' selected' : ''}`;
  document.getElementById('btn-phd').className = `role-card${role === 'phd' ? ' selected' : ''}`;
  populateBPDropdown();
  // In wizard mode, auto-advance to step 2
  if (document.getElementById('view-wizard').style.display !== 'none') {
    wizardShowStep(2);
  } else {
    showScreensUpTo('screen-date');
  }
  saveState();
}

// ── Screen 2: Date ──
function populateBPDropdown() {
  const sel = document.getElementById('bp-select');
  sel.innerHTML = '<option value="">Choose\u2026</option>';
  CONFIG.blockPeriods.forEach((bp, i) => {
    const d = parseDate(bp.start);
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${bp.label}  (starts ${formatDateShort(d)})`;
    sel.appendChild(opt);
  });
  const custom = document.createElement('option');
  custom.value = 'custom';
  custom.textContent = 'Custom date\u2026';
  sel.appendChild(custom);
}

let selectedBPIndex = null;

function onBPSelect() {
  const sel = document.getElementById('bp-select');
  const val = sel.value;
  const weekRow = document.getElementById('week-select-row');
  if (val === '' || val === 'custom') {
    weekRow.style.display = 'none';
    selectedBPIndex = null;
    document.getElementById('date-input').value = '';
    return;
  }
  selectedBPIndex = parseInt(val);
  const bp = CONFIG.blockPeriods[selectedBPIndex];
  state.bpStart = bp.start;
  state.bpWeeks = bp.weeks;
  const weekSel = document.getElementById('week-select');
  weekSel.innerHTML = '<option value="">Choose a week\u2026</option>';
  for (let w = 1; w <= bp.weeks; w++) {
    const ws = addDays(parseDate(bp.start), (w - 1) * 7);
    const we = addDays(ws, 4);
    const opt = document.createElement('option');
    opt.value = toISO(ws);
    opt.textContent = `Week ${w}: ${formatDateShort(ws)} \u2013 ${formatDateShort(we)}`;
    weekSel.appendChild(opt);
  }
  weekRow.style.display = 'block';
  document.getElementById('date-input').value = '';
}

function onWeekSelect() {
  const val = document.getElementById('week-select').value;
  if (!val) return;
  state.weekStart = val;
  document.getElementById('date-input').value = val;
  showConfirmation();
}

function onDateInput() {
  const val = document.getElementById('date-input').value;
  if (!val) return;
  state.weekStart = val;
  // If no BP selected, treat custom date as both bpStart and weekStart
  if (!state.bpStart) state.bpStart = val;
  const sel = document.getElementById('bp-select');
  let matched = false;
  CONFIG.blockPeriods.forEach((bp, i) => {
    if (bp.start === val) { sel.value = i; state.bpStart = bp.start; state.bpWeeks = bp.weeks; matched = true; }
  });
  if (!matched && selectedBPIndex === null) {
    sel.value = 'custom'; state.bpWeeks = 8; state.bpStart = val;
  }
  document.getElementById('week-select-row').style.display = 'none';
  showConfirmation();
}

// ── Screen 3: Confirmation ──
function showConfirmation() {
  if (!state.bpStart) return;
  const bpStart = parseDate(state.bpStart);
  const bpEnd = addDays(bpStart, state.bpWeeks * 7 - 1);
  const matchedBP = CONFIG.blockPeriods.find(bp => bp.start === state.bpStart);
  const label = matchedBP ? matchedBP.label : 'Custom period';
  let confirmHTML = `<span class="check">\u2713</span> <strong>${label}</strong> runs <strong>${state.bpWeeks} weeks</strong>`;
  if (state.weekStart && state.weekStart !== state.bpStart) {
    const ws = parseDate(state.weekStart);
    confirmHTML += `<br><span style="font-size:var(--text-base);">Your data collection starts: <strong>${formatDate(ws)}</strong></span>`;
  }
  document.getElementById('confirm-text').innerHTML = confirmHTML;
  document.getElementById('confirm-range').textContent = `Block period: ${formatDate(bpStart)}  \u2192  ${formatDate(bpEnd)}`;
  document.getElementById('weeks-display').textContent = state.bpWeeks;

  const holidays = getHolidaysInRange(bpStart, bpEnd);
  const container = document.getElementById('holiday-warning-container');
  if (holidays.length > 0) {
    container.innerHTML = `
      <div class="holiday-warning">
        <span class="hw-icon">\u26A0</span> <strong>${holidays.length} public holiday${holidays.length > 1 ? 's' : ''}</strong> fall${holidays.length === 1 ? 's' : ''} in this window
        <div class="hw-list">\u2192 ${holidays.map(h => h.label).join(', ')}<br>These are highlighted in your timeline.</div>
      </div>`;
  } else {
    container.innerHTML = '';
  }

  // In wizard mode, show the confirm card and stay on step 2
  if (document.getElementById('view-wizard').style.display !== 'none') {
    var cc = document.getElementById('wizard-confirm-card');
    if (cc) cc.classList.remove('hidden');
    saveState();
  } else {
    showScreensUpTo('screen-name');
    document.getElementById('name-input').value = state.name || '';
    document.getElementById('title-input').value = state.studyTitle || '';
    document.getElementById('supervisor-email-input').value = state.supervisorEmail || '';
    const thesisCard = document.getElementById('thesis-deadline-card');
    thesisCard.style.display = state.role === 'master' ? 'block' : 'none';
    if (state.thesisDeadline) document.getElementById('thesis-deadline-input').value = state.thesisDeadline;
    document.getElementById('collection-days-input').value = state.collectionDays || 5;
    document.getElementById('analysis-weeks-input').value = state.analysisWeeks || 1;
    document.getElementById('quick-estimate-section').open = true;
    updateQuickEstimate();
    saveState();
    _calcSuppressDirty = true;
    updateCalc();
    _calcSuppressDirty = false;
    _calcDirty = false;
  }
}

function onCollectionDaysChange() {
  const val = parseInt(document.getElementById('collection-days-input').value) || 1;
  state.collectionDays = Math.max(1, Math.min(60, val));
  saveState();
}

function adjustWeeks(delta) {
  state.bpWeeks = Math.max(6, Math.min(12, state.bpWeeks + delta));
  showConfirmation();
}

// ── Inline Date Editing ──
function toggleDateEdit() {
  const edit = document.getElementById('plan-dates-edit');
  const btn = document.getElementById('edit-dates-btn');
  const isEditing = edit.style.display !== 'none';
  if (isEditing) {
    edit.style.display = 'none';
    btn.textContent = 'Edit dates';
  } else {
    document.getElementById('edit-bp-start').value = state.bpStart || '';
    document.getElementById('edit-week-start').value = state.weekStart || state.bpStart || '';
    document.getElementById('edit-thesis-deadline').value = state.thesisDeadline || '';
    document.getElementById('edit-thesis-row').style.display = state.role === 'master' ? 'block' : 'none';
    edit.style.display = 'block';
    btn.textContent = 'Done';
  }
}

function onDateEditChange() {
  const newBP = document.getElementById('edit-bp-start').value;
  const newWeek = document.getElementById('edit-week-start').value;
  const newThesis = document.getElementById('edit-thesis-deadline').value;
  if (!newBP) return;
  state.bpStart = newBP;
  state.weekStart = newWeek || newBP;
  state.thesisDeadline = newThesis || null;
  saveState();
  renderPlan();
  document.getElementById('dates-changed-banner').style.display = 'block';
}

function renderPlanHead(bpStart, bpEnd) {
  const matchedBP = CONFIG.blockPeriods.find(bp => bp.start === state.bpStart);
  const bpLabel = matchedBP ? matchedBP.label : 'Custom period';
  const roleLabel = state.role === 'master' ? 'Master' : 'PhD';
  document.getElementById('plan-eyebrow').textContent = `Your plan \xB7 ${roleLabel} \xB7 ${bpLabel}`;

  // Meta spans
  const weekStart = parseDate(state.weekStart || state.bpStart);
  const weekNum = Math.ceil((weekStart - bpStart) / (7 * 86400000)) + 1;
  let metaHTML = `<span>Block period \xB7 <strong>${formatDate(bpStart)}</strong></span>`;
  if (state.weekStart && state.weekStart !== state.bpStart) {
    // ISO calendar week
    const cwTmp = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
    cwTmp.setDate(cwTmp.getDate() + 3 - (cwTmp.getDay() + 6) % 7);
    const cw = Math.ceil((((cwTmp - new Date(cwTmp.getFullYear(), 0, 4)) / 86400000) + 1) / 7);
    const bpShort = matchedBP ? matchedBP.label.replace(/\s*\(.*\)/, '') : '';
    metaHTML += `<span>Data collection \xB7 <strong>${bpShort} Wk ${weekNum}</strong> <small>(CW${cw})</small></span>`;
  }
  if (state.thesisDeadline) {
    metaHTML += `<span>Submission \xB7 <strong>${formatDate(parseDate(state.thesisDeadline))}</strong></span>`;
  }
  document.getElementById('plan-meta').innerHTML = metaHTML;
}

function renderSideDates(bpStart, bpEnd) {
  const weekStart = parseDate(state.weekStart || state.bpStart);
  const weekNum = Math.ceil((weekStart - bpStart) / (7 * 86400000)) + 1;
  let html = '';
  html += `<div class="kv-row"><span class="k">Block period start</span><span class="v">${formatDate(bpStart)}</span></div>`;
  if (state.weekStart && state.weekStart !== state.bpStart) {
    const matchedBP = CONFIG.blockPeriods.find(bp => bp.start === state.bpStart);
    const bpShort = matchedBP ? matchedBP.label.replace(/\s*\(.*\)/, '') : '';
    const cwTmp = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
    cwTmp.setDate(cwTmp.getDate() + 3 - (cwTmp.getDay() + 6) % 7);
    const cw = Math.ceil((((cwTmp - new Date(cwTmp.getFullYear(), 0, 4)) / 86400000) + 1) / 7);
    html += `<div class="kv-row"><span class="k">Data collection week</span><span class="v">${bpShort} Wk ${weekNum} <small>CW${cw} · ${formatDate(weekStart)}</small></span></div>`;
  }
  if (state.thesisDeadline) {
    html += `<div class="kv-row"><span class="k">Thesis submission</span><span class="v">${formatDate(parseDate(state.thesisDeadline))}</span></div>`;
  }
  html += `<div class="kv-row"><span class="k">Block period end</span><span class="v">${formatDate(bpEnd)}</span></div>`;
  document.getElementById('side-dates-kv').innerHTML = html;
}

function renderSideStatus(computed) {
  const total = computed.length;
  const checked = computed.filter(m => state.checkedItems.includes(m.id)).length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  let html = `<div style="font-size:14px;color:var(--ink);font-weight:500;">${checked} / ${total} milestones</div>`;
  html += `<div style="font-size:12px;color:var(--ink-3);margin-top:2px;">${pct}% complete</div>`;
  html += `<div class="status-bar"><div class="status-bar-fill" style="width:${pct}%"></div></div>`;
  document.getElementById('side-status-content').innerHTML = html;
}

function renderSideWorkload(computed) {
  const today = new Date(); today.setHours(0,0,0,0);
  // Show all milestones in workload (not just upcoming — this shows plan distribution)
  const withDuration = computed.filter(m => m.durationMin && m.durationMin > 0);
  const card = document.getElementById('workload-card');
  const bar = document.getElementById('workload-bar');
  const legend = document.getElementById('workload-legend');
  if (withDuration.length === 0) { card.style.display = 'none'; return; }
  card.style.display = 'block';

  // Group by phase
  const phases = [
    { key: 'phase1_before_sona', label: 'Before SONA', color: 'var(--p1)' },
    { key: 'phase2_sona', label: 'SONA Setup', color: 'var(--p2)' },
    { key: 'phase3_before_experiment', label: 'Before Experiment', color: 'var(--p3)' },
    { key: 'phase4_go', label: 'Data Collection', color: 'var(--p4)' },
    { key: 'phase5_thesis', label: 'Analysis & Writing', color: 'var(--p5)' }
  ];
  const totals = {};
  let grandTotal = 0;
  withDuration.forEach(m => {
    const key = m.section || 'phase3_before_experiment';
    totals[key] = (totals[key] || 0) + m.durationMin;
    grandTotal += m.durationMin;
  });

  // Bar segments
  let barHTML = '';
  phases.forEach(p => {
    if (totals[p.key]) {
      const pct = (totals[p.key] / grandTotal * 100).toFixed(1);
      barHTML += `<span style="width:${pct}%;background:${p.color}"></span>`;
    }
  });
  bar.innerHTML = barHTML;

  // Legend rows
  let legendHTML = '';
  phases.forEach(p => {
    if (totals[p.key]) {
      legendHTML += `<div class="workload-legend-row">
        <span class="workload-legend-dot" style="background:${p.color}"></span>
        <span>${p.label}</span>
      </div>`;
    }
  });
  legend.innerHTML = legendHTML;
}

function renderDatesDisplay() {
  const bpStart = parseDate(state.bpStart);
  const bpEnd = addDays(bpStart, state.bpWeeks * 7 - 1);
  const weekStart = parseDate(state.weekStart || state.bpStart);
  const cd = state.collectionDays || 5;
  // Use the milestone engine so the displayed end date matches the timeline.
  const dc = computeMilestones().find(m => m.id === 'data_collection');
  const collEnd = dc && dc.endDate ? dc.endDate : addDays(weekStart, cd - 1);
  let html = `<div class="data-grid">`;
  html += `<span class="form-hint-inline">Block period</span><span class="mono">${formatDate(bpStart)} \u2192 ${formatDate(bpEnd)}</span>`;
  if (state.weekStart && state.weekStart !== state.bpStart) {
    html += `<span class="form-hint-inline">Data collection</span><span class="mono">${formatDate(weekStart)} \u2192 ${formatDate(collEnd)} (${cd} day${cd !== 1 ? 's' : ''})</span>`;
  }
  if (state.thesisDeadline) {
    html += `<span class="form-hint-inline">Thesis deadline</span><span class="mono result-value-highlight">${formatDate(parseDate(state.thesisDeadline))}</span>`;
  }
  html += `</div>`;
  document.getElementById('plan-dates-display').innerHTML = html;
}

function onManualLabDaysChange() {
  const val = parseInt(document.getElementById('manual-lab-days').value) || 0;
  state.manualLabDays = Math.max(0, Math.min(30, val));
  saveState();
  renderPlan();
}

// ── Hide / restore milestones ──
function hideMilestone(id) {
  if (!state.hiddenMilestones) state.hiddenMilestones = [];
  if (state.hiddenMilestones.includes(id)) return;
  state.hiddenMilestones.push(id);
  saveState();
  history.replaceState(null, '', '#' + encodeState());
  renderPlan();
}

function restoreMilestone(id) {
  state.hiddenMilestones = (state.hiddenMilestones || []).filter(x => x !== id);
  saveState();
  history.replaceState(null, '', '#' + encodeState());
  renderPlan();
}

function renderHiddenList() {
  const card = document.getElementById('hidden-milestones-card');
  const list = document.getElementById('hidden-list');
  const ids = state.hiddenMilestones || [];
  if (ids.length === 0) { card.style.display = 'none'; return; }
  card.style.display = 'block';
  // Look up labels from MILESTONES + custom milestones
  const resolve = id => {
    const m = MILESTONES.find(x => x.id === id);
    if (m) return (state.role === 'master' && m.masterLabel) ? m.masterLabel : m.label;
    const c = (state.customMilestones || []).find(x => x.id === id);
    if (c) return c.label + ' (custom)';
    return id;
  };
  list.innerHTML = ids.map(id => `<div class="hidden-item">
    <span>${escapeHtml(resolve(id))}</span>
    <button class="btn btn-sm btn-ghost" onclick="restoreMilestone('${id}')">Restore</button>
  </div>`).join('');
}

// ── Per-milestone date overrides ──
let _editingDateId = null;

function startDateOverride(id) {
  _editingDateId = id;
  renderPlan();
  // Focus the input after render
  setTimeout(() => {
    const el = document.getElementById('date-edit-input-' + id);
    if (el) el.focus();
  }, 0);
}

function cancelDateOverride() {
  _editingDateId = null;
  renderPlan();
}

function saveDateOverride(id) {
  const el = document.getElementById('date-edit-input-' + id);
  if (!el || !el.value || !/^\d{4}-\d{2}-\d{2}$/.test(el.value)) {
    alert('Please enter a valid date.');
    return;
  }
  if (!state.dateOverrides) state.dateOverrides = {};
  // Calculate delta between old and new date
  const milestones = getCachedMilestones();
  const current = milestones.find(m => m.id === id);
  const newDate = parseDate(el.value);
  const oldDate = current ? current.date : newDate;
  const deltaDays = Math.round((newDate - oldDate) / (1000 * 60 * 60 * 24));

  state.dateOverrides[id] = el.value;

  // If the date actually changed, offer to shift related milestones
  if (deltaDays !== 0 && current) {
    const subsequent = milestones.filter(m => m.id !== id && !m.labDay && m.id !== 'thesis_submission' && m.date >= oldDate);
    const preceding = deltaDays < 0 ? milestones.filter(m => m.id !== id && !m.labDay && m.id !== 'thesis_submission' && m.date <= oldDate && m.date >= newDate) : [];
    if (subsequent.length > 0 || preceding.length > 0) {
      _pendingShift = { deltaDays, subsequent, preceding, id };
      _editingDateId = null;
      _milestoneCacheKey = null;
      saveState();
      history.replaceState(null, '', '#' + encodeState());
      renderPlan();
      showShiftModal(deltaDays, subsequent.length, preceding.length);
      return;
    }
  }

  _editingDateId = null;
  _milestoneCacheKey = null;
  saveState();
  history.replaceState(null, '', '#' + encodeState());
  renderPlan();
}

var _pendingShift = null;

function showShiftModal(deltaDays, subsequentCount, precedingCount) {
  var existing = document.getElementById('shift-confirm-overlay');
  if (existing) existing.remove();
  var direction = deltaDays > 0 ? 'later' : 'earlier';
  var absDays = Math.abs(deltaDays);
  var thesisDate = state.thesisDeadline ? parseDate(state.thesisDeadline) : null;

  // Check if shifting would push milestones past thesis deadline
  var wouldCompress = false;
  if (thesisDate && deltaDays > 0 && _pendingShift) {
    wouldCompress = _pendingShift.subsequent.some(function(m) {
      return new Date(m.date.getTime() + deltaDays * 24 * 60 * 60 * 1000) > thesisDate;
    });
  }

  var body = '<p class="form-hint mb-4">You moved this milestone <strong>' + absDays + ' day' + (absDays !== 1 ? 's' : '') + ' ' + direction + '</strong>.</p>';

  if (wouldCompress) {
    body += '<p class="form-hint mb-4" style="color:var(--warn);"><strong>\u26A0 Warning:</strong> Some milestones would land after your thesis deadline. They will be compressed to fit, but tasks will have less time between them.</p>';
  }

  var buttons = '<button class="btn btn-sm btn-ghost" onclick="shiftConfirmSkip()">Only this one</button>';
  if (subsequentCount > 0) {
    buttons += '<button class="btn btn-sm btn-primary" onclick="shiftConfirmApply()">' + (wouldCompress ? 'Shift & compress' : 'Shift') + ' ' + subsequentCount + ' after</button>';
  }
  if (precedingCount > 0 && deltaDays < 0) {
    buttons += '<button class="btn btn-sm btn-outline" onclick="shiftConfirmBackward()">Compress ' + precedingCount + ' before</button>';
  }

  var overlay = document.createElement('div');
  overlay.id = 'shift-confirm-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:5000;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;font-family:var(--font-body);';
  overlay.innerHTML = '<div style="background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-lg);padding:var(--space-6);max-width:420px;width:90%;box-shadow:var(--shadow-lg);">' +
    '<h3 style="margin:0 0 var(--space-2);font-family:var(--font-display);font-size:var(--text-lg);color:var(--ink);">Adjust related milestones?</h3>' +
    body +
    '<div class="flex-actions" style="justify-content:flex-end;flex-wrap:wrap;gap:var(--space-2);">' +
    buttons +
    '</div></div>';
  document.body.appendChild(overlay);
  var primary = overlay.querySelector('.btn-primary');
  if (primary) primary.focus();
  overlay._escHandler = function(e) { if (e.key === 'Escape') shiftConfirmSkip(); };
  document.addEventListener('keydown', overlay._escHandler);
}

function _removeShiftConfirm() {
  var overlay = document.getElementById('shift-confirm-overlay');
  if (overlay) {
    document.removeEventListener('keydown', overlay._escHandler);
    overlay.remove();
  }
}

function shiftConfirmApply() {
  if (_pendingShift) {
    var delta = _pendingShift.deltaDays;
    var thesisDate = state.thesisDeadline ? parseDate(state.thesisDeadline) : null;
    var compressed = [];
    _pendingShift.subsequent.forEach(function(m) {
      var shifted = new Date(m.date.getTime() + delta * 24 * 60 * 60 * 1000);
      // Compression: if milestone would land after thesis deadline, compress it
      if (thesisDate && shifted > thesisDate) {
        // Find the edited milestone's new date as the anchor
        var anchorDate = parseDate(state.dateOverrides[_pendingShift.id]);
        var totalWindow = Math.round((thesisDate - anchorDate) / (1000 * 60 * 60 * 24));
        // Original distance from anchor
        var origDistance = Math.round((m.date.getTime() + delta * 24 * 60 * 60 * 1000 - anchorDate.getTime()) / (1000 * 60 * 60 * 24));
        // Total original span
        var origSpan = Math.round((_pendingShift.subsequent[_pendingShift.subsequent.length - 1].date.getTime() + delta * 24 * 60 * 60 * 1000 - anchorDate.getTime()) / (1000 * 60 * 60 * 24));
        if (origSpan > 0 && totalWindow > 0) {
          // Proportionally compress into available window
          var compressedDay = Math.round((origDistance / origSpan) * totalWindow);
          // Enforce minimum gap based on durationMin (convert min to days, minimum 1 day gap)
          shifted = addDays(anchorDate, Math.min(compressedDay, totalWindow));
        } else {
          shifted = new Date(thesisDate);
        }
        compressed.push(m.id);
      }
      state.dateOverrides[m.id] = toISO(shifted);
    });
    // Enforce minimum gaps based on durationMin
    var sortedIds = _pendingShift.subsequent.map(function(m) { return m.id; });
    enforceMinGaps(sortedIds);
    _milestoneCacheKey = null;
    saveState();
    history.replaceState(null, '', '#' + encodeState());
    renderPlan();
    if (compressed.length > 0) {
      showToast('Shifted ' + _pendingShift.subsequent.length + ' milestone' + (_pendingShift.subsequent.length !== 1 ? 's' : '') + '. ' + compressed.length + ' compressed to fit before thesis deadline.', 'warning');
    } else {
      showToast('Shifted ' + _pendingShift.subsequent.length + ' milestone' + (_pendingShift.subsequent.length !== 1 ? 's' : '') + '.');
    }
  }
  _pendingShift = null;
  _removeShiftConfirm();
}

// Enforce minimum gaps between milestones based on durationMin
function enforceMinGaps(ids) {
  if (!ids || ids.length < 2) return;
  // Build ordered list of dates
  for (var i = 1; i < ids.length; i++) {
    var prevDate = parseDate(state.dateOverrides[ids[i - 1]]);
    var currDate = parseDate(state.dateOverrides[ids[i]]);
    // Find the milestone definition to get durationMin
    var prevMs = MILESTONES.find(function(m) { return m.id === ids[i - 1]; });
    var minGapDays = 1; // minimum 1 day between milestones
    if (prevMs && prevMs.durationMin) {
      // Convert minutes to days (round up), minimum 1
      minGapDays = Math.max(1, Math.ceil(prevMs.durationMin / (8 * 60))); // 8-hour work day
    }
    var actualGap = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
    if (actualGap < minGapDays) {
      // Push this milestone forward to maintain minimum gap
      state.dateOverrides[ids[i]] = toISO(addDays(prevDate, minGapDays));
    }
  }
}

function shiftConfirmBackward() {
  if (_pendingShift && _pendingShift.preceding && _pendingShift.preceding.length > 0) {
    var editedDate = parseDate(state.dateOverrides[_pendingShift.id]);
    // Compress preceding milestones proportionally into the window before the edited milestone
    var preceding = _pendingShift.preceding.slice().sort(function(a, b) { return a.date - b.date; });
    var firstDate = preceding[0].date;
    var lastOrigDate = _pendingShift.preceding[_pendingShift.preceding.length - 1].date;
    var origSpan = Math.round((lastOrigDate - firstDate) / (1000 * 60 * 60 * 24));
    var availableWindow = Math.round((editedDate - firstDate) / (1000 * 60 * 60 * 24));
    if (origSpan > 0 && availableWindow > 0) {
      preceding.forEach(function(m) {
        var origDistance = Math.round((m.date - firstDate) / (1000 * 60 * 60 * 24));
        var compressedDay = Math.round((origDistance / origSpan) * availableWindow);
        state.dateOverrides[m.id] = toISO(addDays(firstDate, Math.min(compressedDay, availableWindow)));
      });
    }
    var ids = preceding.map(function(m) { return m.id; });
    enforceMinGaps(ids);
    _milestoneCacheKey = null;
    saveState();
    history.replaceState(null, '', '#' + encodeState());
    renderPlan();
    showToast('Compressed ' + preceding.length + ' preceding milestone' + (preceding.length !== 1 ? 's' : '') + '.');
  }
  _pendingShift = null;
  _removeShiftConfirm();
}

function shiftConfirmSkip() {
  _pendingShift = null;
  _removeShiftConfirm();
}

function resetDateOverride(id) {
  if (!state.dateOverrides) return;
  delete state.dateOverrides[id];
  saveState();
  history.replaceState(null, '', '#' + encodeState());
  renderPlan();
}

// ── Custom milestones ──
function openCustomForm(prefill) {
  const form = document.getElementById('custom-form');
  form.style.display = 'block';
  document.getElementById('cm-edit-id').value = prefill ? prefill.id : '';
  document.getElementById('cm-label').value = prefill ? (prefill.label || '') : '';
  document.getElementById('cm-date').value = prefill ? (prefill.date || '') : (state.weekStart || state.bpStart || '');
  document.getElementById('cm-section').value = prefill ? (prefill.section || 'phase3_before_experiment') : 'phase3_before_experiment';
  document.getElementById('cm-duration').value = prefill && prefill.durationMin ? prefill.durationMin : '';
  document.getElementById('cm-note').value = prefill ? (prefill.note || '') : '';
  document.getElementById('cm-label').focus();
}

function closeCustomForm() {
  document.getElementById('custom-form').style.display = 'none';
}

function saveCustomMilestone() {
  const label = document.getElementById('cm-label').value.trim();
  const date = document.getElementById('cm-date').value;
  if (!label || !date) { alert('Label and date are required.'); return; }
  const section = document.getElementById('cm-section').value;
  const durationMin = parseInt(document.getElementById('cm-duration').value) || 0;
  const note = document.getElementById('cm-note').value.trim();
  const editId = document.getElementById('cm-edit-id').value;
  const safeLabel = escapeHtml(label);
  const safeNote = escapeHtml(note);
  if (!state.customMilestones) state.customMilestones = [];
  if (editId) {
    const idx = state.customMilestones.findIndex(c => c.id === editId);
    if (idx !== -1) state.customMilestones[idx] = { id: editId, label: safeLabel, date, section, durationMin, note: safeNote };
  } else {
    const id = 'custom_' + Date.now().toString(36);
    state.customMilestones.push({ id, label: safeLabel, date, section, durationMin, note: safeNote });
  }
  saveState();
  history.replaceState(null, '', '#' + encodeState());
  closeCustomForm();
  renderPlan();
}

function editCustomMilestone(id) {
  const c = (state.customMilestones || []).find(x => x.id === id);
  if (!c) return;
  openCustomForm(c);
  document.getElementById('custom-milestones-card').scrollIntoView({ behavior: 'smooth' });
}

function deleteCustomMilestone(id) {
  if (!confirm('Delete this custom milestone?')) return;
  state.customMilestones = (state.customMilestones || []).filter(c => c.id !== id);
  state.checkedItems = (state.checkedItems || []).filter(x => x !== id);
  saveState();
  history.replaceState(null, '', '#' + encodeState());
  renderPlan();
}

function renderCustomList() {
  const list = document.getElementById('custom-list');
  const items = state.customMilestones || [];
  if (items.length === 0) {
    list.innerHTML = '<p class="form-hint" style="margin:0;">No custom milestones yet.</p>';
    return;
  }
  const sorted = [...items].sort((a,b) => (a.date || '').localeCompare(b.date || ''));
  list.innerHTML = sorted.map(c => {
    const dur = formatDuration(c.durationMin);
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.35rem 0;border-bottom:1px solid var(--line-2);">
      <div><strong>${escapeHtml(c.label)}</strong>${dur ? ` <span style="color:var(--ink-3);font-size:var(--text-xs);">\u00B7 ${dur}</span>` : ''}<br>
        <span class="mono" style="font-size:var(--text-xs);color:var(--ink-3);">${formatDate(parseDate(c.date))}</span>
      </div>
      <div style="display:flex;gap:0.25rem;">
        <button class="btn btn-sm btn-ghost" onclick="editCustomMilestone('${c.id}')">Edit</button>
        <button class="btn btn-sm btn-ghost" onclick="deleteCustomMilestone('${c.id}')">Delete</button>
      </div>
    </div>`;
  }).join('');
}

// Alias for consistency — both names used in codebase
var escapeHtml = escapeHTML;

// ── Schedule shift ──
function shiftSchedule() {
  if (!state.weekStart) { alert('Pick a data collection start date first.'); return; }
  const input = prompt('Shift data collection (and everything anchored to it) by how many days? Use a negative number to bring it earlier.', '0');
  if (input === null) return;
  const delta = parseInt(input, 10);
  if (!Number.isFinite(delta) || delta === 0) return;
  const newWeek = addDays(parseDate(state.weekStart), delta);
  state.weekStart = toISO(newWeek);
  // Warn if analysis now runs past thesis deadline
  if (state.thesisDeadline) {
    const computed = computeMilestones();
    const analysisEnd = computed.find(m => m.id === 'data_cleaning');
    const thesis = parseDate(state.thesisDeadline);
    if (analysisEnd && analysisEnd.date > thesis) {
      alert('Heads up: after this shift, your analysis window ends AFTER your thesis deadline. Consider reducing analysis weeks or moving the thesis deadline.');
    }
  }
  saveState();
  history.replaceState(null, '', '#' + encodeState());
  renderPlan();
  document.getElementById('dates-changed-banner').style.display = 'block';
}

// ── Workload rollup ──
function renderWorkload() {
  const computed = computeMilestones();
  const today = new Date(); today.setHours(0,0,0,0);
  const upcoming = computed.filter(m => m.durationMin && m.durationMin > 0 && !state.checkedItems.includes(m.id) && m.date >= today);
  const card = document.getElementById('workload-card');
  const content = document.getElementById('workload-content');
  if (upcoming.length === 0) { card.style.display = 'none'; return; }
  card.style.display = 'block';
  // Group by ISO week
  const buckets = new Map();
  upcoming.forEach(m => {
    const key = toISO(isoWeekStart(m.date));
    if (!buckets.has(key)) buckets.set(key, { start: isoWeekStart(m.date), total: 0, items: [] });
    const b = buckets.get(key);
    b.total += m.durationMin;
    b.items.push(m);
  });
  const weeks = [...buckets.values()].sort((a,b) => a.start - b.start).slice(0, 4);
  const totalAll = upcoming.reduce((s,m) => s + m.durationMin, 0);
  let html = `<p class="form-hint-inline mb-2">Outstanding items with a time estimate: <strong>${formatDuration(totalAll)}</strong> across ${upcoming.length} task${upcoming.length !== 1 ? 's' : ''}.</p>`;
  html += '<div class="data-grid-3">';
  weeks.forEach(w => {
    const endOfWeek = addDays(w.start, 6);
    const labels = w.items.map(i => escapeHtml(i.label)).join(', ');
    html += `<span class="mono form-hint-inline">Week of ${formatDateShort(w.start)}</span>`;
    html += `<span class="form-hint-inline" style="color:var(--ink-2);">${labels}</span>`;
    html += `<span class="mono result-value-highlight">${formatDuration(w.total)}</span>`;
  });
  html += '</div>';
  if (buckets.size > weeks.length) html += `<p class="form-hint-inline mt-3" style="font-size:var(--text-xs);">(+ ${buckets.size - weeks.length} more week${buckets.size - weeks.length !== 1 ? 's' : ''} with estimates)</p>`;
  content.innerHTML = html;
}

// ── Buffer indicator (days remaining before thesis deadline) ──
function renderBufferIndicator(milestones) {
  var el = document.getElementById('buffer-indicator');
  if (!el || !state.thesisDeadline) { if (el) el.style.display = 'none'; return; }
  var thesisDate = parseDate(state.thesisDeadline);
  // Find the last non-thesis milestone
  var nonThesis = milestones.filter(function(m) { return m.id !== 'thesis_submission' && !m.labDay; });
  if (nonThesis.length === 0) { el.style.display = 'none'; return; }
  var lastMilestone = nonThesis[nonThesis.length - 1]; // already sorted by date
  var bufferDays = daysBetween(lastMilestone.date, thesisDate);
  var cls, icon;
  if (bufferDays >= 7) { cls = 'buffer-ok'; icon = '\u2705'; }
  else if (bufferDays >= 1) { cls = 'buffer-tight'; icon = '\u26A0\uFE0F'; }
  else { cls = 'buffer-over'; icon = '\u274C'; }
  el.style.display = 'block';
  el.className = 'buffer-indicator ' + cls;
  if (bufferDays > 0) {
    el.innerHTML = icon + ' <strong>' + bufferDays + ' buffer day' + (bufferDays !== 1 ? 's' : '') + '</strong> between last task and thesis deadline';
  } else if (bufferDays === 0) {
    el.innerHTML = icon + ' <strong>No buffer</strong> \u2014 last task is on your thesis deadline';
  } else {
    el.innerHTML = icon + ' <strong>' + Math.abs(bufferDays) + ' day' + (Math.abs(bufferDays) !== 1 ? 's' : '') + ' past deadline</strong> \u2014 some milestones extend beyond your thesis submission';
  }
}

// ── Conflict detection (milestones too close together) ──
function detectConflicts(milestones) {
  var nonLab = milestones.filter(function(m) { return !m.labDay; });
  for (var i = 1; i < nonLab.length; i++) {
    var prev = nonLab[i - 1];
    var curr = nonLab[i];
    var gap = daysBetween(prev.date, curr.date);
    // Check if gap is less than what the previous task needs (based on durationMin)
    var minGap = 1;
    if (prev.durationMin) {
      minGap = Math.max(1, Math.ceil(prev.durationMin / (8 * 60))); // 8h work day
    }
    // Mark conflict on the current milestone's row
    if (gap < minGap && gap >= 0) {
      // Add conflict badge to milestone table and checklist
      var tableCell = document.querySelector('#milestone-tbody tr:nth-child(' + (milestones.indexOf(curr) + 1) + ') td:first-child');
      if (tableCell && !tableCell.querySelector('.badge-tag-conflict')) {
        tableCell.innerHTML += ' <span class="badge-tag badge-tag-conflict" title="Only ' + gap + ' day' + (gap !== 1 ? 's' : '') + ' after previous task (' + escapeHtml(prev.label) + ') which needs ~' + minGap + ' day' + (minGap !== 1 ? 's' : '') + '">\u26A0 tight</span>';
      }
    }
  }
}

// ── Screen 5: Plan Generation ──
function generatePlan() {
  state.name = document.getElementById('name-input').value.trim();
  state.studyTitle = document.getElementById('title-input').value.trim();
  const thesisInput = document.getElementById('thesis-deadline-input').value;
  state.thesisDeadline = thesisInput || null;
  state.collectionDays = parseInt(document.getElementById('collection-days-input').value) || 5;
  state.analysisWeeks = parseInt(document.getElementById('analysis-weeks-input').value) || 1;
  state.supervisorEmail = document.getElementById('supervisor-email-input').value.trim();
  // Remind user to fill in lab calculator if they haven't
  if (!state.labCalc && (!state.quickEstimate || state.quickEstimate.days === '?')) {
    if (!confirm('You haven\u2019t estimated your lab days yet. You can use the \u201CEstimate lab days\u201D section above, or the full Lab Timetable Calculator on the plan page under Lab & Booking.\n\nGenerate the plan anyway?')) {
      return;
    }
  }
  saveState();
  // Update URL so bookmarking works immediately
  history.replaceState(null, '', '#' + encodeState());
  renderPlan();
  showScreen('screen-plan');
  // Show bookmark reminder
  showBookmarkReminder();
  // Enable leave warning
  window.onbeforeunload = function() { return true; };
  // Onboarding tour for first-time users (after plan renders)
  setTimeout(startTour, 600);
}

function showBookmarkReminder() {
  const existing = document.getElementById('bookmark-reminder');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.id = 'bookmark-reminder';
  div.className = 'bookmark-reminder';
  div.innerHTML = `
    <div class="flex-row" style="align-items:flex-start;">
      <div style="flex:1">
        <strong>Bookmark this page to save your plan</strong>
        <p class="form-hint" style="margin-top:0.2rem;">Press <kbd class="kbd">Ctrl+D</kbd> (or <kbd class="kbd">\u2318+D</kbd> on Mac) to bookmark, or click Copy Link to save the URL elsewhere.</p>
      </div>
      <button class="btn btn-sm btn-primary" onclick="copyShareLink();this.parentElement.parentElement.remove();">Copy Link</button>
      <button class="btn btn-sm btn-ghost" onclick="this.parentElement.parentElement.remove();" style="padding:0.4rem 0.6rem;">\u2715</button>
    </div>`;
  const planScreen = document.getElementById('screen-plan');
  planScreen.insertBefore(div, planScreen.querySelector('.progress-bar-container'));
}

function renderPlan() {
  if (!state.role || !state.bpStart) { startOver(); return; }
  const bpStart = parseDate(state.bpStart);
  const bpEnd = addDays(bpStart, state.bpWeeks * 7 - 1);
  const today = new Date(); today.setHours(0,0,0,0);
  const displayName = state.name || 'Your';
  const title = state.studyTitle || 'Untitled study';
  document.getElementById('plan-title').textContent = title;

  // Plan header meta
  renderPlanHead(bpStart, bpEnd);

  const computed = getCachedMilestones();
  const thesisDate = state.thesisDeadline ? parseDate(state.thesisDeadline) : null;
  const holidayEnd = (thesisDate && thesisDate > bpEnd) ? thesisDate : bpEnd;
  const holidaysInRange = getHolidaysInRange(bpStart, holidayEnd);

  renderDatesDisplay();
  renderSideDates(bpStart, bpEnd);
  renderSideStatus(computed);
  renderSideWorkload(computed);
  // Show supervisor button if email is set
  document.getElementById('supervisor-update-btn').style.display = state.supervisorEmail ? 'inline-flex' : 'none';
  renderTimeline(computed, holidaysInRange, today);
  renderGantt(computed, today, bpStart, bpEnd);
  renderMilestoneTable(computed, today);
  renderChecklist(computed, today);
  renderCustomList();
  renderHiddenList();
  renderWorkload();
  renderBufferIndicator(computed);
  detectConflicts(computed);
  checkCalSyncNeeded();

  // Restore lab calculator fields if data exists (e.g. from shared URL)
  if (state.labCalc) {
    const lc = state.labCalc;
    if (lc.conditions) document.getElementById('calc-conditions').value = lc.conditions;
    if (lc.design) document.getElementById('calc-design').value = lc.design;
    if (lc.sessionMin) document.getElementById('calc-session-duration').value = lc.sessionMin;
    document.getElementById('calc-showup').value = lc.showupRate ? Math.round(lc.showupRate * 100) : 50;
    if (lc.perTimeslot) document.getElementById('calc-per-timeslot').value = lc.perTimeslot;
    document.getElementById('calc-buffer').value = lc.buffer || 0;
    if (lc.startMin != null) document.getElementById('calc-lab-start').value = fmtTime(lc.startMin);
    if (lc.endMin != null) document.getElementById('calc-lab-end').value = fmtTime(lc.endMin);
    if (lc.lunch != null) document.getElementById('calc-lunch').value = lc.lunch;
    if (lc.lunchStartMin != null) document.getElementById('calc-lunch-start').value = fmtTime(lc.lunchStartMin);
    if (lc.nPerCondition) {
      document.getElementById('calc-n-per-condition').value = lc.nPerCondition;
    } else if (lc.totalN && lc.conditions) {
      const npc = (lc.design === 'within') ? lc.totalN : Math.round(lc.targetN / lc.conditions);
      document.getElementById('calc-n-per-condition').value = npc;
    }
    _calcSuppressDirty = true;
    updateCalc();
    _calcSuppressDirty = false;
    _calcDirty = false;
    renderBlockedSlotsList();
  } else if (state.quickEstimate) {
    // Seed full calculator with quick estimate values
    const qe = state.quickEstimate;
    document.getElementById('calc-conditions').value = qe.conditions;
    document.getElementById('calc-design').value = qe.design;
    document.getElementById('calc-n-per-condition').value = qe.nPerCondition;
    document.getElementById('calc-session-duration').value = qe.sessionMin;
    if (qe.showupRate) document.getElementById('calc-showup').value = Math.round(qe.showupRate * 100);
    _calcSuppressDirty = true;
    updateCalc();
    _calcSuppressDirty = false;
  } else {
    // No saved data — run calc with defaults so results are visible
    _calcSuppressDirty = true;
    updateCalc();
    _calcSuppressDirty = false;
  }

  // Nudge on Lab tab if full calculator hasn't been used
  var labNudge = document.getElementById('lab-calc-nudge');
  if (!labNudge) {
    labNudge = document.createElement('div');
    labNudge.id = 'lab-calc-nudge';
    var calcSection = document.getElementById('lab-calc-section');
    if (calcSection) calcSection.parentNode.insertBefore(labNudge, calcSection);
  }
  var labTabDot = document.getElementById('lab-tab-dot');
  if (!state.labCalc) {
    labNudge.className = 'lab-nudge';
    labNudge.innerHTML = state.quickEstimate
      ? 'Your quick estimate suggests <strong>' + state.quickEstimate.days + ' lab day' + (state.quickEstimate.days !== 1 ? 's' : '') + '</strong>. Open the full calculator below to fine-tune with lab hours, lunch breaks, and blocked time slots.'
      : 'Use the Lab Timetable Calculator below to figure out how many days you need. It generates a detailed timetable with timeslots.';
    if (labTabDot) labTabDot.style.display = 'inline';
  } else {
    labNudge.style.display = 'none';
    if (labTabDot) labTabDot.style.display = 'none';
  }

  // Lab summary — show from full calculator OR quick estimate
  const labSummary = document.getElementById('plan-lab-summary');
  const labContent = document.getElementById('plan-lab-content');
  if (state.labCalc && state.labCalc.totalN) {
    const lc = state.labCalc;
    labSummary.style.display = 'block';
    labContent.innerHTML = `
      <div class="form-grid" style="gap:0.4rem 1.5rem;font-size:var(--text-base);">
        <div>Total participants</div><div class="mono"><strong>${lc.totalN}</strong></div>
        <div>Design</div><div class="mono">${lc.design === 'within' ? 'Within-subject' : lc.design === 'mixed' ? 'Mixed' : 'Between-subject'} (${lc.conditions} conditions)</div>
        <div>Participants per day</div><div class="mono">${lc.participantsPerDay}</div>
        <div>Lab days needed</div><div class="mono result-value-highlight">${lc.totalDays} day${lc.totalDays !== 1 ? 's' : ''}</div>
      </div>
      <p class="form-hint mt-3">Book the lab and equipment for at least ${lc.totalDays} day${lc.totalDays !== 1 ? 's' : ''}. Consider adding 1\u20132 extra days for no-shows.</p>`;
  } else if (state.quickEstimate && typeof state.quickEstimate.days === 'number') {
    const qe = state.quickEstimate;
    const designLabel = qe.design === 'within' ? 'Within-subject' : qe.design === 'mixed' ? 'Mixed' : 'Between-subject';
    labSummary.style.display = 'block';
    labContent.innerHTML = `
      <div class="form-grid" style="gap:0.4rem 1.5rem;font-size:var(--text-base);">
        <div>Total participants</div><div class="mono"><strong>${qe.totalN}</strong></div>
        <div>Design</div><div class="mono">${designLabel} (${qe.conditions} conditions)</div>
        <div>Lab days needed</div><div class="mono result-value-highlight">\u2248 ${qe.days} day${qe.days !== 1 ? 's' : ''}</div>
      </div>
      <p class="form-hint mt-3" style="color:var(--warn);">This is a quick estimate. Use the full Lab Timetable Calculator above for a detailed timetable with blocked slots and exact scheduling.</p>`;
  } else {
    labSummary.style.display = 'none';
  }

  // Resource Booker role note
  document.getElementById('resource-booker-master-note').style.display = state.role === 'master' ? 'block' : 'none';
  document.getElementById('resource-booker-phd-note').style.display = state.role === 'phd' ? 'block' : 'none';

  document.getElementById('print-footer').textContent = `Generated by DEXLab Experiment Planner \u00B7 dexlab.nl \u00B7 ${formatDate(today)}`;
}

function renderTimeline(milestones, holidays, today) {
  const list = document.getElementById('timeline-list');
  list.innerHTML = '';
  if (milestones.length === 0) return;

  // Merge milestones and holidays into one sorted list
  const items = [
    ...milestones.map(m => ({ date: m.date, label: m.label, type: 'milestone', id: m.id, checked: state.checkedItems.includes(m.id), keyDate: m.keyDate, labDay: m.labDay })),
    ...holidays.map(h => ({ date: h.date, label: h.label, type: 'holiday' })),
  ].sort((a, b) => a.date - b.date);

  let todayInserted = false;

  items.forEach(item => {
    // Insert today marker before the first future item
    if (!todayInserted && item.date >= today) {
      todayInserted = true;
      const todayLi = document.createElement('li');
      todayLi.className = 'tl-today';
      todayLi.innerHTML = `<span class="tl-today-badge">Today \u2014 ${formatDateShort(today)}</span>`;
      list.appendChild(todayLi);
    }

    const li = document.createElement('li');
    const isPast = item.date < today;
    const isHoliday = item.type === 'holiday';
    const isOverdue = isPast && !isHoliday && !item.checked;
    const isKey = item.keyDate && !isPast;
    const isLabDay = item.labDay;
    li.className = `tl-item${isLabDay ? ' lab-day' : ''}${isKey ? ' key-date' : (isOverdue ? ' overdue' : (isPast ? ' past' : ''))}${isHoliday ? ' holiday-item' : ''}`;
    li.innerHTML = `
      <div class="tl-dot${isOverdue ? '' : (isPast ? ' past' : '')}${isHoliday ? ' holiday' : ''}"></div>
      <span class="tl-date">${formatDateShort(item.date)}</span>
      <span class="tl-label">${item.label}${isOverdue ? ' \u2014 OVERDUE' : ''}${(item.id && (item.id === 'data_collection' || item.id.startsWith('lab_day_'))) ? ' <a href="javascript:scrollToTimetable()" style="font-size:var(--text-xs);color:var(--ink-3);text-decoration:none;" onmouseover="this.style.textDecoration=\'underline\'" onmouseout="this.style.textDecoration=\'none\'">(view timetable)</a>' : ''}</span>`;
    list.appendChild(li);
  });

  // If all items are past, insert today at the end
  if (!todayInserted) {
    const todayLi = document.createElement('li');
    todayLi.className = 'tl-today';
    todayLi.innerHTML = `<span class="tl-today-badge">Today \u2014 ${formatDateShort(today)}</span>`;
    list.appendChild(todayLi);
  }
}

function renderGantt(milestones, today, bpStart, bpEnd) {
  const wrap = document.getElementById('gantt-wrap');
  if (!wrap || milestones.length === 0) return;

  // Determine plan range — extend to include earliest milestone
  const thesisDate = state.thesisDeadline ? parseDate(state.thesisDeadline) : null;
  const planEnd = (thesisDate && thesisDate > bpEnd) ? thesisDate : bpEnd;
  let planStart = new Date(bpStart);
  milestones.forEach(m => {
    const d = m.date instanceof Date ? m.date : parseDate(m.date);
    if (d && d < planStart) planStart = d;
  });
  const totalDays = daysBetween(planStart, planEnd);
  if (totalDays <= 0) return;

  // Week ticks — use ISO calendar weeks
  const numWeeks = Math.ceil(totalDays / 7);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let axisHTML = '';
  for (let w = 0; w < numWeeks; w++) {
    const tickDate = addDays(planStart, w * 7);
    const isMonthStart = tickDate.getDate() <= 7 && w > 0;
    // ISO week number
    const tmp = new Date(tickDate.getFullYear(), tickDate.getMonth(), tickDate.getDate());
    tmp.setDate(tmp.getDate() + 3 - (tmp.getDay() + 6) % 7);
    const cw = Math.ceil((((tmp - new Date(tmp.getFullYear(), 0, 4)) / 86400000) + 1) / 7);
    const label = isMonthStart ? months[tickDate.getMonth()] : `CW${cw}`;
    axisHTML += `<div class="timeline-axis-tick${isMonthStart ? ' month-start' : ''}">${label}</div>`;
  }

  // Sort ALL milestones chronologically — one unified timeline
  const sorted = milestones.slice().sort((a, b) => a.date - b.date);

  // Build chronological milestone rows — each milestone is a small bar segment
  // Group consecutive milestones on the same date into one row
  let rowsHTML = '';
  const phaseOrder = ['phase1_before_sona', 'phase2_sona', 'phase3_before_experiment', 'phase4_go', 'phase5_thesis'];
  const phasesPresent = new Set();

  sorted.forEach((m, i) => {
    const sec = m.section || 'phase3_before_experiment';
    const color = PHASE_COLORS[sec] || 'var(--ink-3)';
    const phaseLabel = PHASE_SHORT[sec] || '';
    phasesPresent.add(sec);
    const checked = state.checkedItems.includes(m.id);

    // Bar spans from this milestone to the next (or a minimum width)
    const mLeft = (daysBetween(planStart, m.date) / totalDays * 100);
    const nextDate = (i < sorted.length - 1) ? sorted[i + 1].date : planEnd;
    const spanDays = Math.max(1, daysBetween(m.date, nextDate));
    const mWidth = Math.max(1.5, (spanDays / totalDays * 100));

    const opacity = checked ? '0.35' : '1';
    const shortDate = formatDateShort(m.date);

    rowsHTML += `<div class="tl-row-gantt">`;
    rowsHTML += `<div class="tl-bar-gantt" style="left:${mLeft.toFixed(2)}%;width:${mWidth.toFixed(2)}%;background:${color};opacity:${opacity}" data-tip="${escapeHTML(m.label)} — ${shortDate}"><span>${escapeHTML(m.label)}</span></div>`;
    rowsHTML += `</div>`;
  });

  // Today line
  let todayHTML = '';
  if (today >= planStart && today <= planEnd) {
    const todayPct = (daysBetween(planStart, today) / totalDays * 100).toFixed(2);
    todayHTML = `<div class="tl-today-line" style="left:${todayPct}%"></div>`;
  }

  // Legend — show all phases present, in canonical order
  let legendHTML = '';
  phaseOrder.forEach(phaseKey => {
    if (!phasesPresent.has(phaseKey)) return;
    const color = PHASE_COLORS[phaseKey] || 'var(--ink-3)';
    const label = PHASE_SHORT[phaseKey] || phaseKey;
    legendHTML += `<span class="timeline-legend-item"><span class="timeline-legend-dot" style="background:${color}"></span>${label}</span>`;
  });

  // Fixed-width timeline: 80px per week, horizontally scrollable
  const weekWidth = 80;
  const gridWidth = numWeeks * weekWidth;

  wrap.innerHTML = `
    <div class="timeline-head">
      <h3>Timeline</h3>
      <div class="timeline-legend">${legendHTML}</div>
    </div>
    <div class="timeline-body" id="timeline-body-scroll">
      <div class="timeline-grid" style="width:${gridWidth}px;">
        <div class="timeline-axis">${axisHTML}</div>
        <div class="timeline-rows" style="--ticks:${numWeeks};">
          ${rowsHTML}
          ${todayHTML}
        </div>
      </div>
    </div>`;

  // Auto-scroll to today (centered in viewport)
  setTimeout(() => {
    const scrollEl = document.getElementById('timeline-body-scroll');
    if (scrollEl && today >= planStart && today <= planEnd) {
      const todayPx = (daysBetween(planStart, today) / totalDays) * gridWidth;
      scrollEl.scrollLeft = Math.max(0, todayPx - scrollEl.clientWidth / 2);
    }
  }, 50);
}

const PHASE_COLORS = {
  phase1_before_sona: 'var(--p1)',
  phase2_sona: 'var(--p2)',
  phase3_before_experiment: 'var(--p3)',
  phase4_go: 'var(--p4)',
  phase5_thesis: 'var(--p5)'
};
const PHASE_SHORT = {
  phase1_before_sona: 'Before SONA',
  phase2_sona: 'SONA Setup',
  phase3_before_experiment: 'Before Experiment',
  phase4_go: 'Data Collection',
  phase5_thesis: 'Analysis & Writing'
};

function renderMilestoneTable(milestones, today) {
  const tbody = document.getElementById('milestone-tbody');
  tbody.innerHTML = '';
  milestones.forEach(m => {
    const tr = document.createElement('tr');
    const diff = daysBetween(today, m.date);
    const checked = state.checkedItems.includes(m.id);
    let chipClass, chipText;
    if (checked || diff < 0) { chipClass = 'done'; chipText = '\u2713 Done'; tr.className = 'past'; }
    else if (diff === 0) { chipClass = 'due'; chipText = '\u25CF Today'; }
    else if (diff <= 7) { chipClass = 'warn'; chipText = `\u26A0 ${diff}d`; }
    else { chipClass = ''; chipText = `${diff}d`; }
    const durLabel = formatDuration(m.durationMin);
    const durSub = durLabel ? `<div class="ms-name-sub">${durLabel}</div>` : '';
    const overrideBadge = m.overridden ? ' <span class="badge-tag badge-tag-warning">edited</span>' : '';
    // Date cell: inline edit or clickable date
    let dateCell;
    const isFixed = m.id === 'thesis_submission';
    if (!isFixed && _editingDateId === m.id) {
      dateCell = `<input type="date" id="date-edit-input-${m.id}" value="${toISO(m.date)}" style="font-size:var(--text-xs);padding:0.1rem 0.3rem;width:auto;">` +
        `<button onclick="saveDateOverride('${m.id}')" class="action-btn action-btn-accent">Save</button>` +
        `<button onclick="cancelDateOverride()" class="action-btn">Cancel</button>` +
        (m.overridden ? `<button onclick="resetDateOverride('${m.id}')" class="action-btn" title="Reset to computed date">Reset</button>` : '');
    } else if (!isFixed) {
      dateCell = `<span class="ms-date" onclick="startDateOverride('${m.id}')" style="cursor:pointer;border-bottom:1px dashed var(--line);" title="Click to edit date">${formatDate(m.date)}</span>${overrideBadge}` +
        `<div class="ms-rel">${diff >= 0 ? 'in ' + diff + ' day' + (diff !== 1 ? 's' : '') : Math.abs(diff) + 'd ago'}</div>` +
        (m.overridden ? ` <button onclick="resetDateOverride('${m.id}')" class="action-btn" title="Reset to computed date" style="font-size:var(--text-xs);">Reset</button>` : '');
    } else {
      dateCell = `<span class="ms-date" title="Fixed by university">${formatDate(m.date)}</span> <span class="badge-tag">fixed</span>`;
    }
    const phaseColor = PHASE_COLORS[m.section] || 'var(--ink-3)';
    const phaseLabel = PHASE_SHORT[m.section] || m.section;
    const timetableLink = (m.id === 'data_collection' || (m.id && m.id.startsWith('lab_day_'))) ? ' <a href="javascript:scrollToTimetable()" style="font-size:var(--text-xs);color:var(--ink-3);text-decoration:none;" onmouseover="this.style.textDecoration=\'underline\'" onmouseout="this.style.textDecoration=\'none\'">(timetable)</a>' : '';
    tr.innerHTML = `
      <td><div class="ms-name">${m.label}${m.optional ? ' <span style="color:var(--ink-3);font-weight:400;">(opt)</span>' : ''}${m.compressed ? ' <span class="badge-tag badge-tag-warning">compressed</span>' : ''}${timetableLink}</div>${durSub}</td>
      <td><span class="ms-phase-pill" style="--phase-color:${phaseColor}">${phaseLabel}</span></td>
      <td>${dateCell}</td>
      <td><span class="ms-status-chip ${chipClass}">${chipText}</span></td>`;
    tbody.appendChild(tr);
  });
}

function renderChecklist(milestones, today) {
  const container = document.getElementById('checklist-container');
  container.innerHTML = '';

  const sectionOrder = ['phase1_before_sona', 'phase2_sona', 'phase3_before_experiment', 'phase4_go', 'phase5_thesis'];
  const sections = {};
  milestones.forEach(m => {
    if (!sections[m.section]) sections[m.section] = [];
    sections[m.section].push(m);
  });

  const totalItems = milestones.length;
  let checkedCount = 0;

  sectionOrder.filter(key => sections[key]).forEach(sectionKey => {
    const items = sections[sectionKey];
    const phaseCard = document.createElement('div');
    phaseCard.className = 'checklist-phase';

    const sectionChecked = items.filter(m => state.checkedItems.includes(m.id)).length;
    checkedCount += sectionChecked;

    const phaseColor = PHASE_COLORS[sectionKey] || 'var(--ink-3)';
    const bodyId = `section-${sectionKey}`;
    phaseCard.innerHTML = `
      <div class="checklist-phase-head">
        <span class="checklist-phase-name" style="--phase-color:${phaseColor}">${SECTION_LABELS[sectionKey] || sectionKey}</span>
        <span class="checklist-phase-count" id="count-${sectionKey}">${sectionChecked}/${items.length}</span>
      </div>
      <div class="checklist-items" id="${bodyId}"></div>`;
    container.appendChild(phaseCard);

    const body = phaseCard.querySelector('.checklist-items');
    items.forEach(m => {
      const checked = state.checkedItems.includes(m.id);
      const item = document.createElement('div');
      item.className = `checklist-item${checked ? ' done' : ''}`;
      item.id = `cl-item-${m.id}`;
      // Build action buttons
      let actions = '';
      const isFixedMs = m.id === 'thesis_submission';
      if (!isFixedMs && _editingDateId === m.id) {
        actions += `<input type="date" id="date-edit-input-${m.id}" value="${toISO(m.date)}" style="font-size:var(--text-xs);padding:0.1rem 0.3rem;" onclick="event.stopPropagation()">`;
        actions += `<button onclick="event.stopPropagation();saveDateOverride('${m.id}')" class="action-btn action-btn-accent">Save</button>`;
        actions += `<button onclick="event.stopPropagation();cancelDateOverride()" class="action-btn">Cancel</button>`;
      } else if (!isFixedMs) {
        actions += `<button onclick="event.stopPropagation();startDateOverride('${m.id}')" class="action-btn" title="Edit date">Edit date</button>`;
        if (m.overridden) actions += `<button onclick="event.stopPropagation();resetDateOverride('${m.id}')" class="action-btn" title="Reset">Reset</button>`;
      }
      if (m.custom) {
        actions += `<button onclick="event.stopPropagation();editCustomMilestone('${m.id}')" class="action-btn">Edit</button><button onclick="event.stopPropagation();deleteCustomMilestone('${m.id}')" class="action-btn">Delete</button>`;
      } else if (!m.labDay) {
        actions += `<button onclick="event.stopPropagation();hideMilestone('${m.id}')" class="action-btn" title="Hide">Hide</button>`;
      }
      const badges = [
        m.custom ? '<span class="badge-tag">custom</span>' : '',
        m.compressed ? '<span class="badge-tag badge-tag-warning">compressed</span>' : '',
        m.overridden ? '<span class="badge-tag badge-tag-warning">edited</span>' : ''
      ].filter(Boolean).join(' ');
      const noteHTML = m.note ? `<div style="font-size:12px;color:var(--ink-3);margin-top:4px;">${m.note}${m.id === 'equipment_book' && state.labCalc && state.labCalc.totalDays ? ` Book for at least <strong>${state.labCalc.totalDays} day${state.labCalc.totalDays > 1 ? 's' : ''}</strong>.` : ''}</div>` : '';
      item.innerHTML = `
        <div class="checklist-cb"></div>
        <div>
          <span class="checklist-text">${m.label}</span>
          ${badges ? `<span style="margin-left:6px;">${badges}</span>` : ''}
          ${noteHTML}
          <div style="margin-top:4px;">${actions}</div>
        </div>
        <span class="checklist-meta">${formatDateShort(m.date)}</span>`;
      // Wire click on the whole row to toggle check
      item.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'A') return;
        toggleCheck(m.id);
      });
      body.appendChild(item);
    });
  });

  updateProgress(checkedCount, totalItems);
}

function toggleCheck(id) {
  const idx = state.checkedItems.indexOf(id);
  const isNowChecked = idx === -1;
  if (isNowChecked) state.checkedItems.push(id);
  else state.checkedItems.splice(idx, 1);
  saveState();

  // Update the checklist item's visual state
  const clItem = document.getElementById('cl-item-' + id);
  if (clItem) {
    if (isNowChecked) clItem.classList.add('done');
    else clItem.classList.remove('done');
  }

  // Update section counts
  const computed = getCachedMilestones();
  const sections = {};
  computed.forEach(m => {
    if (!sections[m.section]) sections[m.section] = [];
    sections[m.section].push(m);
  });
  let totalChecked = 0;
  Object.keys(sections).forEach(sectionKey => {
    const items = sections[sectionKey];
    const sectionChecked = items.filter(m => state.checkedItems.includes(m.id)).length;
    totalChecked += sectionChecked;
    const countEl = document.getElementById('count-' + sectionKey);
    if (countEl) countEl.textContent = `${sectionChecked}/${items.length}`;
  });

  // Update progress bar
  updateProgress(totalChecked, computed.length);
  renderWorkload();
  // Update sidebar status
  renderSideStatus(computed);
}

function updateProgress(checked, total) {
  const pct = total > 0 ? (checked / total) * 100 : 0;
  document.getElementById('progress-bar').style.width = pct + '%';

  // Show completion prompt at 100%
  const prompt = document.getElementById('completion-prompt');
  if (prompt && pct >= 100) {
    try {
      if (!localStorage.getItem('dexlab_feedback_shown')) {
        prompt.style.display = 'block';
      }
    } catch (e) { prompt.style.display = 'block'; }
  } else if (prompt) {
    prompt.style.display = 'none';
  }
}

let feedbackRating = 0;

function getFeedbackContext() {
  const role = state.role || 'unknown';
  const computed = getCachedMilestones();
  const checked = state.checkedItems ? state.checkedItems.length : 0;
  const total = computed.length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  return { role, checked, total, pct };
}

function openFeedback() {
  const ctx = getFeedbackContext();
  const overlay = document.getElementById('feedback-overlay');
  document.getElementById('fb-context').textContent =
    `${ctx.role} \u2022 ${ctx.checked}/${ctx.total} milestones (${ctx.pct}%) \u2022 ${state.studyTitle || 'No study title'}`;
  feedbackRating = 0;
  document.querySelectorAll('#fb-stars button').forEach(b => b.classList.remove('active'));
  document.getElementById('fb-good').value = '';
  document.getElementById('fb-improve').value = '';
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
  _feedbackTrigger = document.activeElement;
  var closeBtn = overlay.querySelector('.fb-close');
  if (closeBtn) closeBtn.focus();
}
var _feedbackTrigger = null;

function closeFeedback() {
  document.getElementById('feedback-overlay').classList.remove('show');
  document.body.style.overflow = '';
  if (_feedbackTrigger) { _feedbackTrigger.focus(); _feedbackTrigger = null; }
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && document.getElementById('feedback-overlay').classList.contains('show')) closeFeedback();
});

function setRating(n) {
  feedbackRating = n;
  document.querySelectorAll('#fb-stars button').forEach((b, i) => {
    b.classList.toggle('active', i < n);
  });
}

function composeFeedbackText() {
  const ctx = getFeedbackContext();
  const stars = feedbackRating > 0 ? '\u2605'.repeat(feedbackRating) + '\u2606'.repeat(5 - feedbackRating) : 'No rating';
  const good = document.getElementById('fb-good').value.trim();
  const improve = document.getElementById('fb-improve').value.trim();
  let text = `DEXLab Planner Feedback\n\nRating: ${stars} (${feedbackRating}/5)\n`;
  if (good) text += `\nWhat went well:\n${good}\n`;
  if (improve) text += `\nWhat could be improved:\n${improve}\n`;
  text += `\n---\nRole: ${ctx.role}\nProgress: ${ctx.checked}/${ctx.total} milestones (${ctx.pct}%)\nBlock period: ${state.bpStart || 'N/A'}\nStudy: ${state.studyTitle || 'N/A'}\n`;
  return text;
}

function sendFeedbackEmail() {
  if (feedbackRating === 0) { showToast('Please select a rating first'); return; }
  const ctx = getFeedbackContext();
  const subject = encodeURIComponent(`DEXLab Planner Feedback (${ctx.role}, ${ctx.pct}% complete)`);
  const body = encodeURIComponent(composeFeedbackText());
  window.location.href = `mailto:j.heller@maastrichtuniversity.nl?subject=${subject}&body=${body}`;
  closeFeedback();
  try { localStorage.setItem('dexlab_feedback_shown', '1'); } catch (e) {}
}

function copyFeedback() {
  if (feedbackRating === 0) { showToast('Please select a rating first'); return; }
  const text = composeFeedbackText();
  navigator.clipboard.writeText(text).then(() => {
    showToast('Feedback copied to clipboard');
    closeFeedback();
    try { localStorage.setItem('dexlab_feedback_shown', '1'); } catch (e) {}
  }).catch(() => {
    showToast('Could not copy — try Send via Email instead');
  });
}

function dismissCompletion() {
  document.getElementById('completion-prompt').style.display = 'none';
  try { localStorage.setItem('dexlab_feedback_shown', '1'); } catch (e) {}
}

// ── Navigation ──
function editSetup() {
  // Go back to wizard, preserving all state
  document.getElementById('view-landing').classList.remove('active');
  document.getElementById('app-container').style.display = 'none';
  document.getElementById('view-wizard').style.display = '';
  // Restore role selection UI
  if (state.role) {
    document.getElementById('btn-master').className = `role-card${state.role === 'master' ? ' selected' : ''}`;
    document.getElementById('btn-phd').className = `role-card${state.role === 'phd' ? ' selected' : ''}`;
    populateBPDropdown();
  }
  // Restore form values
  document.getElementById('name-input').value = state.name || '';
  document.getElementById('title-input').value = state.studyTitle || '';
  document.getElementById('supervisor-email-input').value = state.supervisorEmail || '';
  if (state.thesisDeadline) document.getElementById('thesis-deadline-input').value = state.thesisDeadline;
  document.getElementById('collection-days-input').value = state.collectionDays || 5;
  document.getElementById('analysis-weeks-input').value = state.analysisWeeks || 1;
  // Show thesis card for master
  var thesisCard = document.getElementById('thesis-deadline-card');
  if (thesisCard) thesisCard.style.display = state.role === 'master' ? 'block' : 'none';
  // Restore quick estimate fields if data exists
  if (state.quickEstimate) {
    const qe = state.quickEstimate;
    document.getElementById('qe-conditions').value = qe.conditions;
    document.getElementById('qe-design').value = qe.design;
    document.getElementById('qe-n-per-condition').value = qe.nPerCondition;
    document.getElementById('qe-session-duration').value = qe.sessionMin;
    if (qe.showupRate) document.getElementById('qe-showup').value = Math.round(qe.showupRate * 100);
    document.getElementById('quick-estimate-section').open = true;
    updateQuickEstimate();
  }
  // Show confirmation if date is set
  if (state.bpStart) {
    showConfirmation();
  }
  // Go to step 1 but allow stepping through all reached steps
  _wizardHighest = 4;
  wizardShowStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetState() {
  if (!confirm('This will permanently delete your plan and all checked items. Make sure you\'ve saved your link (Copy Link) if you want to keep it.\n\nReset everything?')) return;
  window.onbeforeunload = null;
  state = { version: 1, role: null, name: "", studyTitle: "", bpStart: null, weekStart: null, bpWeeks: 8, thesisDeadline: null, supervisorEmail: "", manualLabDays: 0, collectionDays: 5, analysisWeeks: 1, customMilestones: [], hiddenMilestones: [], dateOverrides: {}, blockedSlots: [], checkedItems: [], lastUpdated: null, calExportedHash: null, calSequence: 0 };
  try { localStorage.removeItem("dexlab_planner_state"); } catch (e) {}
  history.replaceState(null, '', window.location.pathname);
  document.body.className = '';
  document.getElementById('btn-master').className = 'role-card';
  document.getElementById('btn-phd').className = 'role-card';
  document.getElementById('bp-select').innerHTML = '<option value="">Choose\u2026</option>';
  document.getElementById('date-input').value = '';
  document.getElementById('name-input').value = '';
  document.getElementById('title-input').value = '';
  _wizardStep = 1;
  _wizardHighest = 1;
  showLanding();
}

// ── Init ──
(function init() {
  try {
    // Check localStorage
    try { localStorage.setItem('_test', '1'); localStorage.removeItem('_test'); }
    catch (e) { hasLocalStorage = false; document.getElementById('ls-notice').style.display = 'block'; }

    // Check URL hash first (shared link takes priority)
    const hash = window.location.hash.slice(1);
    if (hash && !decodeState(hash)) {
      showToast("Couldn\u2019t restore plan from this link \u2014 starting fresh.");
      history.replaceState(null, '', window.location.pathname);
    }
    if (hash && state.role && state.bpStart) {
      // Restore from URL hash — go directly to plan
      document.body.className = `role-${state.role}`;
      document.getElementById('btn-master').className = `role-card${state.role === 'master' ? ' selected' : ''}`;
      document.getElementById('btn-phd').className = `role-card${state.role === 'phd' ? ' selected' : ''}`;
      populateBPDropdown();
      document.getElementById('date-input').value = state.bpStart;
      const sel = document.getElementById('bp-select');
      let matched = false;
      CONFIG.blockPeriods.forEach((bp, i) => {
        if (bp.start === state.bpStart) { sel.value = i; matched = true; }
      });
      if (!matched) sel.value = 'custom';
      document.getElementById('name-input').value = state.name || '';
      document.getElementById('title-input').value = state.studyTitle || '';
      saveState();
      renderPlan();
      showPlanView();
      return;
    }

    // Otherwise load from localStorage
    const hadState = loadState();
    if (hadState && state.role && state.bpStart) {
      document.body.className = `role-${state.role}`;
      document.getElementById('btn-master').className = `role-card${state.role === 'master' ? ' selected' : ''}`;
      document.getElementById('btn-phd').className = `role-card${state.role === 'phd' ? ' selected' : ''}`;
      populateBPDropdown();
      document.getElementById('date-input').value = state.bpStart;
      const sel2 = document.getElementById('bp-select');
      let matched2 = false;
      CONFIG.blockPeriods.forEach((bp, i) => {
        if (bp.start === state.bpStart) { sel2.value = i; matched2 = true; }
      });
      if (!matched2) sel2.value = 'custom';
      // Show confirmation card in wizard
      showConfirmation();
      if (state.name || state.studyTitle || state.checkedItems.length > 0) {
        document.getElementById('name-input').value = state.name || '';
        document.getElementById('title-input').value = state.studyTitle || '';
        renderPlan();
        showPlanView();
      }
    } else if (hadState && state.role) {
      // Partial state — show wizard at step 1 with role pre-selected
      document.getElementById('view-landing').classList.remove('active');
      document.getElementById('view-wizard').style.display = '';
      document.body.className = `role-${state.role}`;
      document.getElementById('btn-master').className = `role-card${state.role === 'master' ? ' selected' : ''}`;
      document.getElementById('btn-phd').className = `role-card${state.role === 'phd' ? ' selected' : ''}`;
      populateBPDropdown();
      wizardShowStep(2);
    }
  } catch (err) {
    console.error('Init failed — clearing corrupted state and starting fresh:', err);
    try { localStorage.removeItem('dexlab_planner_state'); } catch (e) {}
    state = { version: 1, role: null, name: "", studyTitle: "", bpStart: null, weekStart: null, bpWeeks: 8, thesisDeadline: null, supervisorEmail: "", manualLabDays: 0, collectionDays: 5, analysisWeeks: 1, customMilestones: [], hiddenMilestones: [], dateOverrides: {}, blockedSlots: [], checkedItems: [], lastUpdated: null, calExportedHash: null, calSequence: 0 };
    showScreen('screen-role');
  }
})();

// ── Onboarding Tour ──
const TOUR_STEPS = [
  { target: '.role-grid', screen: 'screen-role', title: 'Choose Your Role', text: 'Select your role to see relevant milestones — PhD researchers get additional steps for ethics and pre-registration.' },
  { target: '#lab-calc-section', screen: 'screen-plan', title: 'Lab Timetable Calculator', text: 'Use the lab calculator to figure out how many days you need. It generates a full timetable with timeslots.' },
  { target: '#blocked-slots-section', screen: 'screen-plan', title: 'Blocked Time Slots', text: 'Block times when you can\'t run participants — tutorials, appointments, etc. The timetable skips those slots.' },
  { target: '#custom-milestones-card', screen: 'screen-plan', title: 'Custom Milestones', text: 'Add your own milestones to the timeline — extra meetings, supervisor calls, pilot sessions.' },
  { target: '[onclick="shiftSchedule()"]', screen: 'screen-plan', title: 'Shift Schedule', text: 'Shift your entire schedule forward or back — all downstream milestones move with it automatically.' },
];

var _tourActive = false;
var _tourStepIndex = 0;

function isTourDone() {
  try { return !!localStorage.getItem('dexlab_tour_done'); } catch(e) { return true; }
}

function startTour(force, fromIndex) {
  if (!force && isTourDone()) return;
  if (!force && _tourActive) return; // already running or paused
  endTour(true); // clean up any existing tour state without saving
  _tourActive = true;
  _tourStepIndex = fromIndex || 0;
  showTourStep(_tourStepIndex);
}

function replayTour() {
  try { localStorage.removeItem('dexlab_tour_done'); } catch(e) {}
  // Find the first tour step whose screen is currently active
  var startIdx = 0;
  for (var i = 0; i < TOUR_STEPS.length; i++) {
    var scr = document.getElementById(TOUR_STEPS[i].screen);
    if (scr && scr.classList.contains('active')) { startIdx = i; break; }
  }
  startTour(true, startIdx);
}

function cleanupTourUI() {
  document.querySelectorAll('.tour-highlight').forEach(function(el) { el.classList.remove('tour-highlight'); });
  var tooltip = document.getElementById('tour-tooltip');
  if (tooltip) tooltip.remove();
  var banner = document.getElementById('tour-paused-banner');
  if (banner) banner.remove();
}

function showTourPausedBanner() {
  var existing = document.getElementById('tour-paused-banner');
  if (existing) return; // already showing
  var banner = document.createElement('div');
  banner.id = 'tour-paused-banner';
  banner.className = 'tour-banner';
  banner.innerHTML = '<span>Tour paused — continue to the next step to see more tips</span>' +
    '<button onclick="endTour()">Dismiss</button>';
  document.body.appendChild(banner);
}

function showTourStep(index) {
  cleanupTourUI();
  _tourStepIndex = index;

  if (index >= TOUR_STEPS.length) { endTour(); return; }

  var step = TOUR_STEPS[index];
  var el = document.querySelector(step.target);

  // If target not visible or not on an active screen, decide: skip or pause
  if (!el || el.offsetParent === null) {
    var stepScreen = document.getElementById(step.screen);
    var screenActive = stepScreen && stepScreen.classList.contains('active');
    if (screenActive) {
      // Element hidden on the current screen (e.g., blocked slots before calc) — skip it
      showTourStep(index + 1);
      return;
    }
    // Screen not active yet — show a persistent banner so the tour doesn't just vanish
    showTourPausedBanner();
    return;
  }

  // Also skip if the element is scrolled way out of the visible document area
  var rect0 = el.getBoundingClientRect();
  if (rect0.width === 0 && rect0.height === 0) {
    showTourStep(index + 1);
    return;
  }

  // Scroll element into view instantly so getBoundingClientRect is accurate
  el.scrollIntoView({ behavior: 'instant', block: 'center' });

  // Small delay for repaint, then position tooltip using fixed coordinates
  requestAnimationFrame(function() { requestAnimationFrame(function() {
    if (!_tourActive) return;
    el.classList.add('tour-highlight');

    var tooltip = document.createElement('div');
    tooltip.id = 'tour-tooltip';
    tooltip.className = 'tour-tooltip';
    var isLast = index === TOUR_STEPS.length - 1;
    tooltip.innerHTML =
      '<h4>' + step.title + '</h4>' +
      '<p>' + step.text + '</p>' +
      '<div class="tour-actions">' +
        '<button class="tour-btn tour-btn-skip" onclick="endTour()">Skip tour</button>' +
        '<button class="tour-btn tour-btn-next" onclick="showTourStep(' + (index + 1) + ')">' + (isLast ? 'Finish' : 'Next') + '</button>' +
        '<span class="tour-step">' + (index + 1) + ' / ' + TOUR_STEPS.length + '</span>' +
      '</div>';
    document.body.appendChild(tooltip);

    // Position using viewport-relative (fixed) coordinates
    var rect = el.getBoundingClientRect();
    var ttRect = tooltip.getBoundingClientRect();

    // Default: below the element
    var top = rect.bottom + 12;
    var left = rect.left + (rect.width / 2) - (ttRect.width / 2);

    // Clamp horizontally
    left = Math.max(8, Math.min(left, window.innerWidth - ttRect.width - 8));

    // If tooltip goes below viewport, place above the element
    if (top + ttRect.height + 8 > window.innerHeight) {
      top = rect.top - ttRect.height - 12;
    }
    // If still off-screen (above viewport), just pin to bottom
    if (top < 8) {
      top = window.innerHeight - ttRect.height - 8;
    }

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';

    var nextBtn = tooltip.querySelector('.tour-btn-next') || tooltip.querySelector('.tour-btn-skip');
    if (nextBtn) nextBtn.focus();
  }); });
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && _tourActive) endTour();
});

// Called when a new screen becomes active — resumes the paused tour
function advanceTourForScreen() {
  if (!_tourActive) return;
  var step = TOUR_STEPS[_tourStepIndex];
  if (!step) return;
  var stepScreen = document.getElementById(step.screen);
  if (stepScreen && stepScreen.classList.contains('active')) {
    setTimeout(function() { showTourStep(_tourStepIndex); }, 400);
  }
}

function endTour(skipSave) {
  cleanupTourUI();
  _tourActive = false;
  if (!skipSave) {
    try { localStorage.setItem('dexlab_tour_done', '1'); } catch(e) {}
  }
}

// Auto-start tour for first-time visitors
setTimeout(function() { if (!isTourDone()) startTour(); }, 500);


