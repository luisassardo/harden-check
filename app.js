/*
 * HardenCheck · personalized device-hardening checklist (C-LAB, Tier A)
 *
 * Asks the operator a short profile (OS, who manages it, risk level, travel /
 * sharing / sensitive-source flags), filters tasks.js against that profile,
 * and renders a grouped, checkable, exportable checklist. Progress and profile
 * persist in localStorage only; nothing ever leaves the browser (CSP
 * connect-src 'none'). Trilingual EN/ES/DE. No em dashes in copy.
 */
(function () {
  'use strict';

  // ------------------------------ UI strings ------------------------------
  const S = {
    en: {
      chrome: {
        rail_mode: 'CHECKLIST · LOCAL',
        eyebrow: 'C-LAB · Tool · Device hardening',
        role: 'ACCOUNTS · UPDATES · ENCRYPTION · NETWORK · MESSAGING · TARGETED',
        tagline: 'Tell it about your device. Get a checklist made for it.',
        lead: 'HardenCheck asks a few questions about your device and threat level, then builds a personalized, plain-language security checklist you can work through and tick off. It runs entirely in your browser. Your answers never leave your device: no server, no telemetry, and it works offline.',
        cta_about: 'About C-LAB', cta_contact: 'Contact',
        privacy: 'Runs 100% in your browser · 0 requests',
        feat1_t: 'Personalized', feat1_d: 'The checklist reflects your OS, your role and your real risk, not a generic list.',
        feat2_t: 'On-device', feat2_d: 'Every answer stays in your browser; nothing is sent anywhere.',
        feat3_t: 'Plain steps', feat3_d: 'Each task says why it matters and exactly how to do it on your system.',
        feat4_t: 'Track & export', feat4_d: 'Tick items off, save progress, and export your checklist to keep working.',
        ops_label: 'Device security checklist',
      },
      form: {
        intro: 'Answer a few questions about the device you want to harden. There are no wrong answers and nothing is sent anywhere.',
        q_os: 'What device is this?',
        q_managed: 'Who manages this device?',
        managed_personal: 'It is mine / personal', managed_org: 'My organization manages it',
        q_risk: 'How exposed are you?',
        risk_standard: 'Standard', risk_standard_d: 'General good hygiene. No specific reason to think you are targeted.',
        risk_elevated: 'Elevated', risk_elevated_d: 'You do sensitive work and could plausibly draw attention.',
        risk_high: 'High / targeted', risk_high_d: 'You have reason to believe a capable adversary may target you specifically.',
        q_context: 'Anything else true for this device? (optional)',
        ctx_travel: 'It crosses borders or travels to risky places',
        ctx_shared: 'It is shared with other people',
        ctx_sources: 'It holds sensitive sources or material',
        generate: 'Build my checklist',
        hint: 'You can change your answers and rebuild any time.',
      },
      rep: {
        title: 'Your checklist', for: 'For',
        progress: 'done', items: 'items',
        edit: 'Edit profile', md: 'Export Markdown', json: 'Export JSON', print: 'Print / PDF', reset: 'Reset progress',
        wipe: 'Clear & wipe',
        why: 'Why it matters', how: 'How to do it', refs: 'Learn more',
        prio: { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' },
        alldone: 'Every item is checked off. Re-run periodically, and after any device or account change.',
        disclaimer: 'This is a guidance checklist based on what you reported. It does not scan your device or verify anything for you. For active checks, see the C-LAB device tools.',
        confirm_reset: 'Clear all checkmarks for this checklist?',
        confirm_wipe: 'Clear the saved profile and all progress from this browser? This leaves no trace of which device you were working on.',
        empty: 'No tasks matched. Try editing your profile.',
      },
    },
    es: {
      chrome: {
        rail_mode: 'LISTA · LOCAL',
        eyebrow: 'C-LAB · Herramienta · Endurecer dispositivo',
        role: 'CUENTAS · ACTUALIZACIONES · CIFRADO · RED · MENSAJERÍA · DIRIGIDO',
        tagline: 'Cuéntale sobre tu dispositivo. Recibe una lista hecha para él.',
        lead: 'HardenCheck te hace unas preguntas sobre tu dispositivo y tu nivel de riesgo, y arma una lista de seguridad personalizada, en lenguaje claro, que puedes ir cumpliendo y marcando. Funciona enteramente en tu navegador. Tus respuestas nunca salen de tu dispositivo: sin servidor, sin telemetría, y funciona sin conexión.',
        cta_about: 'Sobre C-LAB', cta_contact: 'Contacto',
        privacy: 'Funciona 100% en tu navegador · 0 peticiones',
        feat1_t: 'Personalizada', feat1_d: 'La lista refleja tu SO, tu rol y tu riesgo real, no una lista genérica.',
        feat2_t: 'En el dispositivo', feat2_d: 'Cada respuesta se queda en tu navegador; nada se envía a ningún lado.',
        feat3_t: 'Pasos claros', feat3_d: 'Cada tarea dice por qué importa y exactamente cómo hacerla en tu sistema.',
        feat4_t: 'Marca y exporta', feat4_d: 'Marca tareas, guarda el avance y exporta tu lista para seguir.',
        ops_label: 'Lista de seguridad del dispositivo',
      },
      form: {
        intro: 'Responde unas preguntas sobre el dispositivo que quieres endurecer. No hay respuestas incorrectas y nada se envía a ningún lado.',
        q_os: '¿Qué dispositivo es?',
        q_managed: '¿Quién administra este dispositivo?',
        managed_personal: 'Es mío / personal', managed_org: 'Lo administra mi organización',
        q_risk: '¿Qué tan expuesto estás?',
        risk_standard: 'Estándar', risk_standard_d: 'Buena higiene general. Sin motivo específico para creerte un blanco.',
        risk_elevated: 'Elevado', risk_elevated_d: 'Haces trabajo sensible y podrías llamar la atención.',
        risk_high: 'Alto / dirigido', risk_high_d: 'Tienes motivos para creer que un adversario capaz podría atacarte a ti en concreto.',
        q_context: '¿Algo más cierto sobre este dispositivo? (opcional)',
        ctx_travel: 'Cruza fronteras o viaja a lugares de riesgo',
        ctx_shared: 'Lo comparten varias personas',
        ctx_sources: 'Guarda fuentes o material sensible',
        generate: 'Armar mi lista',
        hint: 'Puedes cambiar tus respuestas y rearmarla cuando quieras.',
      },
      rep: {
        title: 'Tu lista', for: 'Para',
        progress: 'hechas', items: 'tareas',
        edit: 'Editar perfil', md: 'Exportar Markdown', json: 'Exportar JSON', print: 'Imprimir / PDF', reset: 'Reiniciar avance',
        wipe: 'Borrar todo',
        why: 'Por qué importa', how: 'Cómo hacerlo', refs: 'Aprender más',
        prio: { critical: 'Crítico', high: 'Alto', medium: 'Medio', low: 'Bajo' },
        alldone: 'Todas las tareas están marcadas. Repite periódicamente, y tras cualquier cambio de dispositivo o cuenta.',
        disclaimer: 'Esta es una lista de orientación basada en lo que reportaste. No escanea tu dispositivo ni verifica nada por ti. Para comprobaciones activas, usa las herramientas de dispositivo de C-LAB.',
        confirm_reset: '¿Borrar todas las marcas de esta lista?',
        confirm_wipe: '¿Borrar el perfil guardado y todo el avance de este navegador? No queda ningún rastro del dispositivo en el que estabas trabajando.',
        empty: 'Ninguna tarea coincidió. Prueba a editar tu perfil.',
      },
    },
    de: {
      chrome: {
        rail_mode: 'CHECKLISTE · LOKAL',
        eyebrow: 'C-LAB · Werkzeug · Gerät härten',
        role: 'KONTEN · UPDATES · VERSCHLÜSSELUNG · NETZWERK · MESSAGING · GEZIELT',
        tagline: 'Erzähl ihm von deinem Gerät. Bekomm eine Liste, die dazu passt.',
        lead: 'HardenCheck stellt ein paar Fragen zu deinem Gerät und deinem Risiko und erstellt dann eine personalisierte Sicherheits-Checkliste in klarer Sprache, die du abarbeiten und abhaken kannst. Es läuft komplett in deinem Browser. Deine Antworten verlassen dein Gerät nie: kein Server, keine Telemetrie, und es funktioniert offline.',
        cta_about: 'Über C-LAB', cta_contact: 'Kontakt',
        privacy: 'Läuft 100% im Browser · 0 Anfragen',
        feat1_t: 'Personalisiert', feat1_d: 'Die Liste richtet sich nach deinem OS, deiner Rolle und deinem echten Risiko, keine Standardliste.',
        feat2_t: 'Auf dem Gerät', feat2_d: 'Jede Antwort bleibt im Browser; nichts wird irgendwohin gesendet.',
        feat3_t: 'Klare Schritte', feat3_d: 'Jede Aufgabe sagt, warum sie zählt und genau, wie du sie auf deinem System erledigst.',
        feat4_t: 'Verfolgen & exportieren', feat4_d: 'Punkte abhaken, Fortschritt sichern und Liste exportieren, um weiterzuarbeiten.',
        ops_label: 'Geräte-Sicherheits-Checkliste',
      },
      form: {
        intro: 'Beantworte ein paar Fragen zum Gerät, das du härten willst. Es gibt keine falschen Antworten und nichts wird irgendwohin gesendet.',
        q_os: 'Welches Gerät ist das?',
        q_managed: 'Wer verwaltet dieses Gerät?',
        managed_personal: 'Es ist meins / privat', managed_org: 'Meine Organisation verwaltet es',
        q_risk: 'Wie exponiert bist du?',
        risk_standard: 'Standard', risk_standard_d: 'Allgemeine gute Hygiene. Kein konkreter Grund, dich für ein Ziel zu halten.',
        risk_elevated: 'Erhöht', risk_elevated_d: 'Du machst sensible Arbeit und könntest Aufmerksamkeit erregen.',
        risk_high: 'Hoch / gezielt', risk_high_d: 'Du hast Grund zu glauben, dass ein fähiger Gegner gezielt dich angreifen könnte.',
        q_context: 'Trifft sonst etwas auf dieses Gerät zu? (optional)',
        ctx_travel: 'Es überquert Grenzen oder reist an riskante Orte',
        ctx_shared: 'Es wird mit anderen geteilt',
        ctx_sources: 'Es enthält sensible Quellen oder Material',
        generate: 'Meine Checkliste erstellen',
        hint: 'Du kannst deine Antworten ändern und jederzeit neu erstellen.',
      },
      rep: {
        title: 'Deine Checkliste', for: 'Für',
        progress: 'erledigt', items: 'Aufgaben',
        edit: 'Profil bearbeiten', md: 'Markdown exportieren', json: 'JSON exportieren', print: 'Drucken / PDF', reset: 'Fortschritt zurücksetzen',
        wipe: 'Alles löschen',
        why: 'Warum es wichtig ist', how: 'So geht es', refs: 'Mehr erfahren',
        prio: { critical: 'Kritisch', high: 'Hoch', medium: 'Mittel', low: 'Niedrig' },
        alldone: 'Alle Punkte sind abgehakt. Wiederhole das regelmäßig und nach jeder Geräte- oder Kontoänderung.',
        disclaimer: 'Dies ist eine Orientierungs-Checkliste auf Basis deiner Angaben. Sie scannt dein Gerät nicht und verifiziert nichts für dich. Für aktive Prüfungen nutze die C-LAB-Gerätewerkzeuge.',
        confirm_reset: 'Alle Häkchen dieser Checkliste löschen?',
        confirm_wipe: 'Das gespeicherte Profil und den gesamten Fortschritt aus diesem Browser löschen? Es bleibt keine Spur davon, an welchem Gerät du gearbeitet hast.',
        empty: 'Keine Aufgaben passten. Bearbeite dein Profil.',
      },
    },
  };

  const OS_OPTS = [
    { v: 'macos',   label: 'macOS' },
    { v: 'windows', label: 'Windows' },
    { v: 'linux',   label: 'Linux' },
    { v: 'ios',     label: { en: 'iPhone / iPad', es: 'iPhone / iPad', de: 'iPhone / iPad' } },
    { v: 'android', label: 'Android' },
  ];
  const PRIO_ORDER = ['critical', 'high', 'medium', 'low'];
  const CAT_ORDER = ['A', 'O', 'F', 'M', 'N', 'W', 'E', 'C', 'H'];

  const loc = (o, l) => (o == null ? '' : (typeof o === 'string' ? o : (o[l] || o.en || '')));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ------------------------------ state ------------------------------
  const LS = { profile: 'hc.profile', done: 'hc.done', lang: 'hc.lang' };
  const opsBody = document.getElementById('ops-body');
  let lang = 'en';
  let profile = loadProfile();
  let done = loadDone();
  let draft = {};   // in-progress form answers before generate

  function loadProfile() { try { return JSON.parse(localStorage.getItem(LS.profile)) || null; } catch (e) { return null; } }
  function saveProfile(p) { try { localStorage.setItem(LS.profile, JSON.stringify(p)); } catch (e) {} }
  function loadDone() { try { return new Set(JSON.parse(localStorage.getItem(LS.done)) || []); } catch (e) { return new Set(); } }
  function saveDone() { try { localStorage.setItem(LS.done, JSON.stringify(Array.from(done))); } catch (e) {} }

  // Wipe every trace of what device was worked on: the saved profile and all
  // progress leave the browser, and the UI returns to a blank form. Language
  // preference is kept (not device-identifying). Confirmed first.
  function wipe() {
    if (!window.confirm(S[lang].rep.confirm_wipe)) return;
    try { localStorage.removeItem(LS.profile); localStorage.removeItem(LS.done); } catch (e) {}
    profile = null; done = new Set(); draft = {};
    renderForm();
    opsBody.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hasSavedData() {
    try { return !!(localStorage.getItem(LS.profile) || localStorage.getItem(LS.done)); } catch (e) { return false; }
  }

  function deriveProfile(p) {
    const mobile = (p.os === 'ios' || p.os === 'android');
    return Object.assign({}, p, {
      form: mobile ? 'mobile' : 'computer',
      apple: (p.os === 'macos' || p.os === 'ios'),
    });
  }

  // ------------------------------ chrome / i18n ------------------------------
  function applyChrome() {
    const t = S[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (t.chrome[key] !== undefined) el.textContent = t.chrome[key];
    });
    document.querySelectorAll('.lang-switch button').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    document.title = 'HardenCheck · ' + t.chrome.tagline.replace(/\.$/, '');
  }

  function setLang(l) {
    lang = S[l] ? l : 'en';
    try { localStorage.setItem(LS.lang, lang); } catch (e) {}
    applyChrome();
    if (profile) renderChecklist(); else renderForm();
  }

  // ------------------------------ form ------------------------------
  function renderForm() {
    const t = S[lang].form;
    const d = draft = Object.assign({ os: '', managed: '', risk: '', travel: false, shared: false, sources: false }, profile || {});

    const osBtns = OS_OPTS.map((o) => `
      <button type="button" class="seg ${d.os === o.v ? 'on' : ''}" data-os="${esc(o.v)}">${esc(loc(o.label, lang))}</button>`).join('');

    const riskOpts = [
      ['standard', t.risk_standard, t.risk_standard_d],
      ['elevated', t.risk_elevated, t.risk_elevated_d],
      ['high', t.risk_high, t.risk_high_d],
    ].map(([v, label, desc]) => `
      <label class="opt opt-rich">
        <input type="radio" name="risk" value="${v}" ${d.risk === v ? 'checked' : ''}>
        <span class="opt-rich-body"><span class="opt-label">${esc(label)}</span><span class="opt-sub">${esc(desc)}</span></span>
      </label>`).join('');

    const ctx = [
      ['travel', t.ctx_travel], ['shared', t.ctx_shared], ['sources', t.ctx_sources],
    ].map(([k, label]) => `
      <label class="opt opt-check">
        <input type="checkbox" name="ctx" value="${k}" ${d[k] ? 'checked' : ''}>
        <span class="opt-label">${esc(label)}</span>
      </label>`).join('');

    opsBody.innerHTML = `
      <p class="form-intro">${esc(t.intro)}</p>
      <fieldset class="cat">
        <legend>${esc(t.q_os)}</legend>
        <div class="seg-row">${osBtns}</div>
      </fieldset>
      <fieldset class="cat">
        <legend>${esc(t.q_managed)}</legend>
        <div class="opts">
          <label class="opt opt-check"><input type="radio" name="managed" value="personal" ${d.managed === 'personal' ? 'checked' : ''}><span class="opt-label">${esc(t.managed_personal)}</span></label>
          <label class="opt opt-check"><input type="radio" name="managed" value="org" ${d.managed === 'org' ? 'checked' : ''}><span class="opt-label">${esc(t.managed_org)}</span></label>
        </div>
      </fieldset>
      <fieldset class="cat">
        <legend>${esc(t.q_risk)}</legend>
        <div class="opts">${riskOpts}</div>
      </fieldset>
      <fieldset class="cat">
        <legend>${esc(t.q_context)}</legend>
        <div class="opts">${ctx}</div>
      </fieldset>
      <div class="form-actions">
        <button class="btn primary btn-block" id="gen-btn" ${d.os && d.risk ? '' : 'disabled'}><span data-ico="shield"></span> ${esc(t.generate)}</button>
        <p class="form-hint">${esc(t.hint)}</p>
        ${hasSavedData() ? `<button class="btn bare btn-wipe btn-block" id="wipe-btn"><span data-ico="cloudOff"></span> ${esc(S[lang].rep.wipe)}</button>` : ''}
      </div>`;

    if (window.ArgusIcons) window.ArgusIcons.hydrate(opsBody);

    opsBody.querySelectorAll('.seg[data-os]').forEach((b) => b.addEventListener('click', () => {
      draft.os = b.dataset.os;
      opsBody.querySelectorAll('.seg[data-os]').forEach((x) => x.classList.toggle('on', x === b));
      refreshGen();
    }));
    opsBody.addEventListener('change', (e) => {
      const el = e.target;
      if (el.name === 'risk') draft.risk = el.value;
      if (el.name === 'managed') draft.managed = el.value;
      if (el.name === 'ctx') draft[el.value] = el.checked;
      refreshGen();
    });
    opsBody.querySelector('#gen-btn').addEventListener('click', generate);
    const wipeBtn = opsBody.querySelector('#wipe-btn');
    if (wipeBtn) wipeBtn.addEventListener('click', wipe);
  }

  function refreshGen() {
    const btn = opsBody.querySelector('#gen-btn');
    if (btn) btn.disabled = !(draft.os && draft.risk);
  }

  function generate() {
    if (!(draft.os && draft.risk)) return;
    const prev = profile;
    profile = deriveProfile({
      os: draft.os, managed: draft.managed || 'personal', risk: draft.risk,
      travel: !!draft.travel, shared: !!draft.shared, sources: !!draft.sources,
    });
    // Changing the device wipes progress; tweaking flags keeps it.
    if (prev && prev.os !== profile.os) { done = new Set(); saveDone(); }
    saveProfile(profile);
    renderChecklist();
    opsBody.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ------------------------------ checklist ------------------------------
  function selectedTasks() {
    return (window.HC_TASKS || []).filter((task) => {
      try { return task.applies(profile); } catch (e) { return false; }
    });
  }

  function groupTasks(tasks) {
    const by = {};
    tasks.forEach((t) => { (by[t.cat] = by[t.cat] || []).push(t); });
    Object.keys(by).forEach((c) => by[c].sort((a, b) => PRIO_ORDER.indexOf(a.prio) - PRIO_ORDER.indexOf(b.prio)));
    return by;
  }

  function howFor(task) {
    const h = task.how || {};
    const v = h[profile.os] || h.all || (h.macos && profile.apple ? h.macos : null);
    return loc(v, lang);
  }

  function renderChecklist() {
    const t = S[lang].rep;
    const CATS = window.HC_CATEGORIES || {};
    const tasks = selectedTasks();

    if (!tasks.length) {
      opsBody.innerHTML = `<p class="form-intro">${esc(t.empty)}</p>
        <div class="form-actions"><button class="btn bare btn-block" id="edit-btn"><span data-ico="refresh"></span> ${esc(t.edit)}</button></div>`;
      if (window.ArgusIcons) window.ArgusIcons.hydrate(opsBody);
      opsBody.querySelector('#edit-btn').addEventListener('click', renderForm);
      return;
    }

    const total = tasks.length;
    const doneCount = tasks.filter((x) => done.has(x.id)).length;
    const pct = Math.round((doneCount / total) * 100);
    const by = groupTasks(tasks);

    const osLabel = (window.HC_OS_LABEL || {})[profile.os] || profile.os;
    const flags = [
      profile.risk === 'high' ? S[lang].form.risk_high : profile.risk === 'elevated' ? S[lang].form.risk_elevated : S[lang].form.risk_standard,
      profile.travel ? S[lang].form.ctx_travel : null,
      profile.sources ? S[lang].form.ctx_sources : null,
      profile.shared ? S[lang].form.ctx_shared : null,
    ].filter(Boolean);

    let html = `
      <div class="rep-head">
        <div class="rep-ring ${pct === 100 ? 'ring-done' : ''}" style="--p:${pct}">
          <span class="rep-ring-n" id="ring-n">${pct}<small>%</small></span>
        </div>
        <div class="rep-head-meta">
          <h3 class="rep-title">${esc(t.title)}</h3>
          <p class="rep-sub">${esc(t.for)} ${esc(osLabel)} · <span id="prog-text">${doneCount}/${total} ${esc(t.progress)}</span></p>
          <div class="rep-flags">${flags.map((f) => `<span class="flag">${esc(f)}</span>`).join('')}</div>
        </div>
      </div>
      <div class="rep-bar"><i id="prog-bar" style="transform:scaleX(${total ? doneCount / total : 0})"></i></div>
      <div class="rep-actions">
        <button class="btn bare" id="edit-btn"><span data-ico="refresh"></span> ${esc(t.edit)}</button>
        <button class="btn bare" id="md-btn"><span data-ico="download"></span> ${esc(t.md)}</button>
        <button class="btn bare" id="json-btn"><span data-ico="download"></span> ${esc(t.json)}</button>
        <button class="btn bare" id="print-btn"><span data-ico="document"></span> ${esc(t.print)}</button>
        <button class="btn bare" id="reset-btn"><span data-ico="crosshair"></span> ${esc(t.reset)}</button>
        <button class="btn bare btn-wipe" id="wipe-btn"><span data-ico="cloudOff"></span> ${esc(t.wipe)}</button>
      </div>
      <p class="rep-alldone ${pct === 100 ? '' : 'hidden'}" id="alldone">${esc(t.alldone)}</p>`;

    CAT_ORDER.filter((c) => by[c]).forEach((c) => {
      const cat = CATS[c] || { name: c, ico: 'shield' };
      html += `<section class="rep-group">
        <h4 class="rep-group-h"><span class="gi" data-ico="${esc(cat.ico)}"></span> ${esc(loc(cat.name, lang))} <span class="gcount">${by[c].length}</span></h4>`;
      by[c].forEach((task) => { html += renderTask(task, t); });
      html += `</section>`;
    });

    html += `<p class="rep-disclaimer">${esc(t.disclaimer)}</p>`;

    opsBody.innerHTML = html;
    if (window.ArgusIcons) window.ArgusIcons.hydrate(opsBody);
    wireChecklist(tasks, t);
  }

  function renderTask(task, t) {
    const checked = done.has(task.id);
    const how = howFor(task);
    const refs = (task.refs || []).map((r) =>
      `<a class="ref-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.label)}</a>`).join('');
    return `
      <div class="task ${checked ? 'task-done' : ''} prio-${esc(task.prio)}" data-id="${esc(task.id)}">
        <label class="task-top">
          <input type="checkbox" class="task-check" ${checked ? 'checked' : ''} data-id="${esc(task.id)}">
          <span class="task-title">${esc(loc(task.title, lang))}</span>
          <span class="task-prio prio-tag-${esc(task.prio)}">${esc(t.prio[task.prio] || task.prio)}</span>
        </label>
        <details class="task-detail">
          <summary>${esc(t.how)}</summary>
          <div class="task-body">
            <div class="t-block"><span class="t-k">${esc(t.why)}</span><p>${esc(loc(task.why, lang))}</p></div>
            <div class="t-block t-how"><span class="t-k">${esc(t.how)}</span><p>${esc(how)}</p></div>
            ${refs ? `<div class="t-refs"><span class="t-k">${esc(t.refs)}</span> ${refs}</div>` : ''}
          </div>
        </details>
      </div>`;
  }

  function wireChecklist(tasks, t) {
    opsBody.querySelectorAll('.task-check').forEach((cb) => {
      cb.addEventListener('change', () => {
        const id = cb.dataset.id;
        if (cb.checked) done.add(id); else done.delete(id);
        saveDone();
        cb.closest('.task').classList.toggle('task-done', cb.checked);
        updateProgress(tasks, t);
      });
    });
    opsBody.querySelector('#edit-btn').addEventListener('click', renderForm);
    opsBody.querySelector('#md-btn').addEventListener('click', () => exportFile('md', tasks));
    opsBody.querySelector('#json-btn').addEventListener('click', () => exportFile('json', tasks));
    opsBody.querySelector('#print-btn').addEventListener('click', () => {
      opsBody.querySelectorAll('.task-detail').forEach((d) => d.open = true);
      window.print();
    });
    opsBody.querySelector('#reset-btn').addEventListener('click', () => {
      if (!window.confirm(t.confirm_reset)) return;
      tasks.forEach((x) => done.delete(x.id)); saveDone(); renderChecklist();
    });
    opsBody.querySelector('#wipe-btn').addEventListener('click', wipe);
  }

  function updateProgress(tasks, t) {
    const total = tasks.length;
    const doneCount = tasks.filter((x) => done.has(x.id)).length;
    const pct = Math.round((doneCount / total) * 100);
    const ringN = document.getElementById('ring-n');
    const bar = document.getElementById('prog-bar');
    const txt = document.getElementById('prog-text');
    const ring = opsBody.querySelector('.rep-ring');
    const allDone = document.getElementById('alldone');
    if (ringN) ringN.innerHTML = pct + '<small>%</small>';
    if (ring) ring.style.setProperty('--p', pct);
    if (bar) bar.style.transform = `scaleX(${total ? doneCount / total : 0})`;
    if (txt) txt.textContent = `${doneCount}/${total} ${t.progress}`;
    if (ring) ring.classList.toggle('ring-done', pct === 100);
    if (allDone) allDone.classList.toggle('hidden', pct !== 100);
  }

  // ------------------------------ export ------------------------------
  function profileLine() {
    const osLabel = (window.HC_OS_LABEL || {})[profile.os] || profile.os;
    const bits = [osLabel, 'risk: ' + profile.risk, 'managed: ' + profile.managed];
    if (profile.travel) bits.push('travels');
    if (profile.shared) bits.push('shared');
    if (profile.sources) bits.push('sensitive sources');
    return bits.join(' · ');
  }

  function exportFile(kind, tasks) {
    const date = new Date().toISOString().slice(0, 10);
    let blob, name;
    if (kind === 'json') {
      const payload = {
        tool: 'hardencheck', version: 1, generated_at: new Date().toISOString(), lang,
        profile: { os: profile.os, form: profile.form, risk: profile.risk, managed: profile.managed,
                   travel: profile.travel, shared: profile.shared, sources: profile.sources },
        tasks: tasks.map((x) => ({ id: x.id, category: x.cat, priority: x.prio,
          title: loc(x.title, lang), done: done.has(x.id) })),
      };
      blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      name = `hardencheck_${profile.os}_${date}.json`;
    } else {
      const CATS = window.HC_CATEGORIES || {};
      const t = S[lang].rep;
      const by = groupTasks(tasks);
      const doneCount = tasks.filter((x) => done.has(x.id)).length;
      let md = `# HardenCheck\n\n**${t.for}:** ${profileLine()}  \n**${t.progress}:** ${doneCount}/${tasks.length}  \n**${date}**\n`;
      CAT_ORDER.filter((c) => by[c]).forEach((c) => {
        const cat = CATS[c] || { name: c };
        md += `\n## ${loc(cat.name, lang)}\n\n`;
        by[c].forEach((x) => {
          md += `- [${done.has(x.id) ? 'x' : ' '}] **${loc(x.title, lang)}** _(${t.prio[x.prio] || x.prio})_\n`;
          md += `  - ${t.why}: ${loc(x.why, lang)}\n`;
          md += `  - ${t.how}: ${howFor(x).replace(/\n+/g, ' ')}\n`;
          (x.refs || []).forEach((r) => { md += `  - ${r.label}: ${r.url}\n`; });
        });
      });
      md += `\n---\n_${t.disclaimer}_\n`;
      blob = new Blob([md], { type: 'text/markdown' });
      name = `hardencheck_${profile.os}_${date}.md`;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ------------------------------ init ------------------------------
  document.querySelectorAll('.lang-switch button').forEach((b) => {
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });
  let initLang = null;
  try { initLang = localStorage.getItem(LS.lang); } catch (e) {}
  if (!initLang) {
    const bl = (navigator.language || 'en').toLowerCase().slice(0, 2);
    initLang = (bl === 'es' || bl === 'de') ? bl : 'en';
  }
  lang = S[initLang] ? initLang : 'en';
  applyChrome();
  if (profile) renderChecklist(); else renderForm();
})();
