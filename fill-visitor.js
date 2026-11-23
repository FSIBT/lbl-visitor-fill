// LBNL Site Access (Veoci) visitor form: fill in your default host values.
// Readable source. Run `node build.js` to regenerate the bookmarklet.
// Never submits anything; you review and click Submit yourself.
// NOTE: use semicolons everywhere and only full-line // comments (build joins lines).
(async () => {
  // Filled in by build.js from config.js.
  const CONFIG = __CONFIG__;

  // ---------- status box ----------
  const old = document.getElementById('__visitorFillStatus');
  if (old) old.remove();
  const box = document.createElement('div');
  box.id = '__visitorFillStatus';
  box.style.cssText = 'position:fixed;top:10px;right:10px;z-index:2147483647;background:#fff;color:#000;border:2px solid #333;border-radius:6px;padding:8px 12px;font:13px/1.4 sans-serif;max-width:380px;box-shadow:0 2px 10px rgba(0,0,0,.3);cursor:pointer;';
  box.title = 'click to close';
  box.onclick = () => box.remove();
  box.innerHTML = '<b>Visitor defaults</b><br>';
  document.body.appendChild(box);
  const log = (ok, msg) => {
    const d = document.createElement('div');
    d.textContent = (ok === null ? '… ' : ok ? '✓ ' : '✗ ') + msg;
    d.style.color = ok === false ? '#b00' : ok ? '#060' : '#555';
    box.appendChild(d);
    console.log('[visitor-fill]', msg);
  };

  // ---------- helpers ----------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const visible = (el) => !!(el && el.getClientRects().length);
  const waitFor = async (fn, timeout = 8000, step = 150) => {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      try { const v = fn(); if (v) return v; } catch (e) { }
      await sleep(step);
    }
    return null;
  };
  const realClick = (el) => {
    for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup']) {
      el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
    }
    el.click();
  };
  const setValue = (el, text) => {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    el.focus();
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  // Field wrapper whose own header title matches the regex.
  const section = (re) => [...document.querySelectorAll('.sectionField, .field-wrapper')]
    .filter(visible)
    .find((w) => { const t = w.querySelector('.fieldLabel__title'); return t && re.test(t.textContent.trim()); });
  const menuOptions = () => [...document.querySelectorAll('.v-overlay--active .v-list-item, .v-overlay--active [role=option]')].filter(visible);
  const optText = (o) => (o.querySelector('.v-list-item-title') || o).textContent.trim();

  // Veoci reference dropdown ("Click to Load Entries" + Vuetify autocomplete).
  const pickRef = async (labelRe, name, { search, option }) => {
    const sec = await waitFor(() => section(labelRe), 6000);
    if (!sec) return log(false, name + ': field not found');
    const current = sec.querySelector('.v-autocomplete__selection, .v-select__selection, .v-chip');
    if (current && option.test(current.textContent.trim())) return log(true, name + ': already set');
    const trigger = sec.querySelector('.loading-trigger');
    if (trigger && visible(trigger)) { realClick(trigger); await sleep(400); }
    const field = await waitFor(() => { const f = sec.querySelector('.v-field[role=combobox], .v-field'); return visible(f) && f; });
    if (!field) return log(false, name + ': dropdown not found');
    const input = field.querySelector('input');
    realClick(field);
    if (input) input.focus();
    let opt = await waitFor(() => menuOptions().find((o) => option.test(optText(o))), 2500);
    if (!opt && input) {
      setValue(input, search);
      opt = await waitFor(() => menuOptions().find((o) => option.test(optText(o))), 8000);
    }
    if (!opt) {
      const seen = menuOptions().slice(0, 5).map(optText).join(' | ');
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return log(false, name + ': option not found' + (seen ? ' (saw: ' + seen + ')' : ''));
    }
    realClick(opt);
    await sleep(500);
    log(true, name + ': ' + optText(opt));
  };

  // ---------- 1. Host via List view ----------
  const doHost = async () => {
    const hostNameSet = () => { const s = section(/^\*?\s*Host Name/); return s && s.textContent.includes(CONFIG.hostName) && s; };
    if (hostNameSet()) return log(true, 'Host: already set');
    const sec = section(/^Select the LBNL Host/);
    if (!sec) return log(false, 'Host: "Select the LBNL Host" section not found');
    const listBtn = sec.querySelector('button[value="list"]');
    if (!listBtn) return log(false, 'Host: List button not found');
    const before = new Set(document.querySelectorAll('input'));
    realClick(listBtn);
    const textInputs = () => [...document.querySelectorAll('input[type=text], input:not([type])')]
      .filter((x) => visible(x) && !x.readOnly && !x.disabled);
    const labelOf = (x) => (x.placeholder || '') + ' ' + (x.getAttribute('aria-label') || '');
    // Prefer a NEW box labelled "Filter..."; fall back to any new text box.
    const filter = await waitFor(() => {
      const fresh = textInputs().filter((x) => !before.has(x));
      return fresh.find((x) => /filter/i.test(labelOf(x))) || fresh.find((x) => /search/i.test(labelOf(x)));
    }, 8000) || textInputs().filter((x) => !before.has(x))[0];
    if (!filter) return log(false, 'Host: filter box in List view not found');
    await sleep(500);
    // Type like a keyboard: some filters only react to key events.
    filter.focus();
    realClick(filter);
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(filter, '');
    for (const ch of CONFIG.hostName) {
      filter.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
      filter.dispatchEvent(new KeyboardEvent('keypress', { key: ch, bubbles: true }));
      setter.call(filter, filter.value + ch);
      filter.dispatchEvent(new InputEvent('input', { data: ch, inputType: 'insertText', bubbles: true }));
      filter.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }));
      await sleep(30);
    }
    filter.dispatchEvent(new Event('change', { bubbles: true }));
    filter.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    filter.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    log(null, 'Host: filtered list for "' + CONFIG.hostName + '"');
    const [first, last] = CONFIG.hostName.split(/\s+/);
    const nameRe = new RegExp('\\b' + first + '\\s+' + last + '\\b|\\b' + last + ',\\s*' + first + '\\b', 'i');
    // A short text element showing the name, located after the filter box (skips the Request Preparer chip above).
    const cell = await waitFor(() => [...document.querySelectorAll('td, [role=cell], .v-list-item-title, .v-list-item, span, div, a')]
      .find((e) => visible(e) && e !== filter && !e.contains(filter)
        && (filter.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING)
        && e.textContent.trim().length < 80 && nameRe.test(e.textContent)
        && ![...e.children].some((c) => nameRe.test(c.textContent))), 12000);
    if (!cell) return log(false, 'Host: "' + CONFIG.hostName + '" not found in filtered list');
    const row = cell.closest('tr, [role=row], .v-list-item, .entryCard, .v-card') || cell;
    realClick(row);
    await sleep(800);
    if (!section(/^\*?\s*Host Name/)) {
      const fieldsBtn = sec.querySelector('button[value="fields"]');
      if (fieldsBtn) { realClick(fieldsBtn); await sleep(600); }
    }
    if (await waitFor(hostNameSet, 5000)) log(true, 'Host: ' + CONFIG.hostName);
    else log(false, 'Host: clicked the row, but Host Name does not show it, please check');
  };

  // ---------- run ----------
  log(null, 'working…');
  try { await doHost(); } catch (e) { log(false, 'Host: error ' + e); }
  try {
    const tel = (section(/Host Phone Number/i) || document).querySelector('input[type=tel]');
    const digits = (s) => s.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
    if (!tel) log(false, 'Phone field not found');
    else if (digits(tel.value) === digits(CONFIG.hostPhone)) log(true, 'Phone: already set');
    else { setValue(tel, CONFIG.hostPhone); tel.dispatchEvent(new Event('blur')); log(true, 'Phone: ' + tel.value); }
  } catch (e) { log(false, 'Phone: error ' + e); }
  try { await pickRef(/^\*?\s*Host Country of Citizenship/i, 'Citizenship', CONFIG.hostCitizenship); } catch (e) { log(false, 'Citizenship: error ' + e); }
  try { await pickRef(/Country of Birth/i, 'Country of birth', CONFIG.hostBirth); } catch (e) { log(false, 'Country of birth: error ' + e); }
  try { await pickRef(/Host Division/i, 'Division', CONFIG.division); } catch (e) { log(false, 'Division: error ' + e); }

  const bld = document.querySelector('input[aria-label="Primary Visiting Building or Location"]');
  if (bld) { setValue(bld, CONFIG.building); log(true, 'Building: ' + CONFIG.building); }
  else log(false, 'Building field not found');

  if (CONFIG.tickCertifications) {
    const boxes = [...document.querySelectorAll('input[type=checkbox]')].filter((c) => /^I certify/.test(c.value));
    let n = 0;
    for (const c of boxes) { if (!c.checked) { c.click(); await sleep(150); } if (c.checked) n++; }
    log(n === boxes.length && n > 0, 'Certifications ticked: ' + n + '/' + boxes.length);
  }

  // Real ID section appears at the end (structure guessed: checkbox(es) or a Yes radio).
  if (CONFIG.tickRealId) {
    const isRealId = (el) => /real\s*id/i.test(el.value || '') || /real\s*id/i.test((el.closest('.v-selection-control, .v-input, label') || el).textContent);
    const realSec = await waitFor(() => section(/real\s*id/i) || [...document.querySelectorAll('input[type=checkbox], input[type=radio]')].find((c) => visible(c.closest('.v-input') || c) && isRealId(c)), 5000);
    if (!realSec) log(false, 'Real ID section did not show up');
    else {
      const scope = realSec.tagName === 'INPUT' ? (realSec.closest('.sectionField, .field-wrapper') || realSec.parentElement) : realSec;
      const cbs = [...scope.querySelectorAll('input[type=checkbox]')];
      const yes = [...scope.querySelectorAll('input[type=radio]')].find((r) => /^yes/i.test(r.value));
      let did = 0;
      for (const c of cbs) { if (!c.checked) { c.click(); await sleep(150); } if (c.checked) did++; }
      if (yes && !yes.checked) { yes.click(); await sleep(150); }
      if (yes && yes.checked) did++;
      log(did > 0, 'Real ID: ' + (did ? 'selected (' + did + ')' : 'nothing to tick found, please check'));
    }
  }
  log(null, 'done, please review and submit yourself (click this box to close)');
})();
