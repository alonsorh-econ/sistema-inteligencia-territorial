/* La voz de la sala en la lámina de las palancas.
   Lee las voces de la zona de experiencia («La voz de la Junta», Apps Script) y las cuenta por palanca.
   Tecla J: pegar la clave del panel una vez; queda solo en este navegador (localStorage 'voz_clave').
   Sin clave o sin red, la lámina se queda con sus guiones y no muestra ningún error. */
(function () {
  const leer = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const FUENTE_POR_DEFECTO = 'https://script.google.com/macros/s/AKfycbyGne7zqC6WsRhywjNrPFvM1GsaRNVbkY_5feZUfxIo1v6_zJseTKpN5iVygE64d7zJ/exec';
  const VACIAS = new Set('para como sobre entre desde hasta porque cuando donde todos todas cada este esta estos estas pero tambien también más mas muy nuestra nuestro nuestros nuestras bolivar bolívar cartagena región region'.split(' '));
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let timer = null;

  async function cargar() {
    const clave = leer('voz_clave'); if (!clave) return;
    const fuente = leer('voz_fuente') || FUENTE_POR_DEFECTO;
    let j;
    try { j = await (await fetch(fuente + '?accion=datos&token=' + encodeURIComponent(clave))).json(); } catch (e) { return; }
    if (!j || !j.ok || !Array.isArray(j.voces)) return;
    const voces = j.voces.filter(v => v.palanca);
    const cuenta = {}; voces.forEach(v => { cuenta[v.palanca] = (cuenta[v.palanca] || 0) + 1; });
    const max = Math.max(1, ...Object.values(cuenta));
    document.querySelectorAll('[data-voz]').forEach(b => { const k = b.dataset.voz; b.textContent = cuenta[k] || 0; });
    document.querySelectorAll('[data-barra]').forEach(i => { const k = i.dataset.barra; i.style.width = ((cuenta[k] || 0) / max * 100) + '%'; });
    const orgs = new Set(j.voces.map(v => (v.organizacion || '').trim().toLowerCase()).filter(Boolean));
    const tv = document.getElementById('salaVoces'), to = document.getElementById('salaOrgs');
    if (tv) tv.textContent = j.voces.length; if (to) to.textContent = orgs.size;
    const frec = {};
    voces.forEach(v => (v.palabras || []).forEach(p => { const w = String(p).trim().toLowerCase(); if (w.length >= 4 && !VACIAS.has(w)) frec[w] = (frec[w] || 0) + 1; }));
    const top = Object.entries(frec).sort((a, b) => b[1] - a[1]).slice(0, 14);
    const pal = document.getElementById('salaPalabras');
    if (pal && top.length) { const m = top[0][1];
      pal.innerHTML = top.map(([w, c], n) => `<span style="font-size:${Math.round(18 + 22 * c / m)}px;color:${n % 3 === 0 ? '#E0650F' : n % 3 === 1 ? '#0F3B4C' : '#1A7F92'}">${esc(w)}</span>`).join(''); }
    const cita = voces.filter(v => v.resumen && String(v.resumen).length < 150).slice(-1)[0];
    const el = document.getElementById('salaCita');
    if (el && cita) el.innerHTML = `«${esc(cita.resumen)}»${cita.organizacion ? ' · ' + esc(cita.organizacion) : ''}`;
  }
  function vigilar() {
    const sala = document.querySelector('.sala-v'); if (!sala) return;
    const visible = sala.closest('.l') && sala.closest('.l').classList.contains('on');
    if (visible && !timer) { cargar(); timer = setInterval(cargar, 15000); }
    if (!visible && timer) { clearInterval(timer); timer = null; }
  }
  setInterval(vigilar, 1000);

  // Tecla J: clave del panel de la zona de experiencia.
  const f = document.createElement('form'); f.id = 'vzk'; f.hidden = true;
  f.innerHTML = `<label for="vzk-in">Clave del panel de la zona de experiencia (se guarda solo en este navegador)</label><input id="vzk-in" type="password" autocomplete="off"><button type="submit">Guardar</button><span id="vzk-ok"></span>`;
  const st = document.createElement('style');
  st.textContent = `#vzk{position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:2147483002;background:#fff;color:#122;border-radius:12px;padding:14px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font:14px system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.4)}#vzk[hidden]{display:none!important}#vzk input{padding:6px 8px;min-width:240px}#vzk button{padding:6px 12px}`;
  document.head.appendChild(st); document.body.appendChild(f);
  f.addEventListener('submit', ev => { ev.preventDefault(); const v = f.querySelector('input').value.trim();
    try { localStorage.setItem('voz_clave', v); f.querySelector('#vzk-ok').textContent = v ? 'Guardada' : 'Borrada'; } catch (e) { f.querySelector('#vzk-ok').textContent = 'Este navegador no deja guardarla'; }
    f.querySelector('input').value = ''; setTimeout(() => { f.hidden = true; if (timer) { clearInterval(timer); timer = null; } vigilar(); }, 900); });
  document.addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'j' || e.key === 'J') { f.hidden = !f.hidden; if (!f.hidden) setTimeout(() => f.querySelector('input').focus(), 30); }
  });
})();
