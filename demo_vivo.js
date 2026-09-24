/* Ventana flotante del sistema para presentaciones en vivo.
   Se incluye en cualquier mazo HTML con: <script src="demo_vivo.js" data-pregunta="…"></script>
   Teclas: L lanza la pregunta · P muestra u oculta la ventana · R abre la respuesta · Esc la cierra · K guarda la llave una vez.
   La llave del sistema la pone el presentador en su navegador (localStorage 'sit_llave'); este archivo no la trae.
   Si no hay red o el sistema falla, la respuesta que se abre es la del ensayo, y lo dice. */
(function () {
  const yo = document.currentScript;
  const PREGUNTA = (yo && yo.dataset.pregunta) || '¿Qué puede hacer el Plan Nacional de Desarrollo para bajar la tarifa de energía del Caribe, y qué no puede hacer?';
  const leer = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const BASE = leer('sit_base') || 'https://192-81-211-68.sslip.io';
  const PASOS = [
    ['entender', 'Entiende la pregunta'], ['norma', 'Revisa la norma'], ['dato', 'Busca los datos'],
    ['referentes', 'Mira qué hicieron otros'], ['voz', 'Escucha las voces de los actores'], ['nivel2', 'Cruza y busca contradicciones'],
    ['nivel3', 'Decide la puerta del Plan'], ['cierre', 'Redacta la agenda'], ['auditoria', 'Audita cada afirmación']];
  const css = `
  #dv{--dv-acento:var(--demo-acento,#EF7C11);--dv-fondo:var(--demo-fondo,rgba(16,26,48,.94));--dv-texto:var(--demo-texto,#F3F5FA);--dv-suave:var(--demo-suave,#A9B4CC);
    position:fixed;right:24px;bottom:24px;width:min(420px,calc(100vw - 32px));z-index:2147483000;font-family:var(--demo-fuente,inherit);
    background:var(--dv-fondo);color:var(--dv-texto);border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.35);padding:16px 18px;
    transition:transform .35s ease,opacity .35s ease;backdrop-filter:blur(6px)}
  #dv[hidden]{display:none!important}
  #dv .dv-cab{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
  #dv .dv-tit{font-weight:700;font-size:15px;letter-spacing:.01em}
  #dv .dv-reloj{font:600 13px ui-monospace,Menlo,monospace;color:var(--dv-suave)}
  #dv .dv-q{font-size:13px;color:var(--dv-suave);margin:6px 0 10px;line-height:1.4}
  #dv ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
  #dv li{display:grid;grid-template-columns:18px 1fr;gap:2px 8px;font-size:13.5px;line-height:1.35;opacity:.45}
  #dv li.en,#dv li.ok{opacity:1}
  #dv li i{width:10px;height:10px;border-radius:50%;margin-top:4px;border:2px solid var(--dv-suave)}
  #dv li.en i{border-color:var(--dv-acento);animation:dvpulso 1.1s ease-in-out infinite}
  #dv li.ok i{background:var(--dv-acento);border-color:var(--dv-acento)}
  #dv li small{grid-column:2;color:var(--dv-suave);font-size:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  #dv .dv-pie{margin-top:10px;font-size:12px;color:var(--dv-suave)}
  #dv.min{width:auto;padding:10px 16px;cursor:pointer}
  #dv.min ol,#dv.min .dv-q,#dv.min .dv-pie{display:none}
  #dv.min .dv-tit::before{content:"✓ ";color:var(--dv-acento)}
  @keyframes dvpulso{50%{transform:scale(1.35)}}
  @media (prefers-reduced-motion:reduce){#dv li.en i{animation:none}}
  #dvr{position:fixed;inset:0;z-index:2147483001;background:var(--demo-fondo-resp,#0E1526);color:var(--demo-texto,#F3F5FA);overflow:auto;padding:5vh 7vw;font-family:var(--demo-fuente,inherit)}
  #dvr[hidden]{display:none!important}
  #dvr .dvr-eti{font:600 13px ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--demo-acento,#EF7C11)}
  #dvr h2{font-size:clamp(24px,3vw,38px);margin:.3em 0 .6em;line-height:1.2}
  #dvr h3{font-size:clamp(18px,2vw,24px);margin:1.2em 0 .4em;color:var(--demo-acento,#EF7C11)}
  #dvr p,#dvr li{font-size:clamp(16px,1.6vw,21px);line-height:1.5;max-width:70ch}
  #dvr ul{padding-left:1.2em}
  #dvr .dvr-pie{margin-top:2em;font-size:15px;color:var(--demo-suave,#A9B4CC)}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const caja = document.createElement('div'); caja.id = 'dv'; caja.hidden = true; caja.setAttribute('role', 'status'); caja.setAttribute('aria-live', 'polite');
  caja.innerHTML = `<div class="dv-cab"><span class="dv-tit">El sistema está trabajando</span><span class="dv-reloj">0:00</span></div>
    <div class="dv-q"></div><ol>${PASOS.map(([k, n]) => `<li data-k="${k}"><i></i><span>${n}</span><small></small></li>`).join('')}</ol>
    <div class="dv-pie">Pregunta en vivo · cada paso se revisa con documentos verificados</div>`;
  const resp = document.createElement('div'); resp.id = 'dvr'; resp.hidden = true; resp.tabIndex = -1;
  document.body.appendChild(caja); document.body.appendChild(resp);
  caja.querySelector('.dv-q').textContent = PREGUNTA;
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let job = null, t0 = 0, reloj = null, sondeo = null, resultado = null, deEnsayo = false, falla = '';
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const ESTADOS = [[/SIN DOLIENTE/, 'Nadie responde hoy por este tema'], [/CON DOLIENTE SIN SEGUIMIENTO/, 'Tiene responsable, pero sin seguimiento visible'],
    [/CONTRADICHA/, 'Hay fuentes que se contradicen: se aclara'], [/CONFIRMADA/, 'Confirmada por varias fuentes'], [/HU[ÉE]RFANA/, 'Sin respaldo suficiente todavía'],
    [/SIN MEDIR/, 'Falta el dato: hay que medirlo'], [/EL PND LO CAMBIA/, 'El Plan puede cambiarlo'], [/EL PND LO ORDENA/, 'El Plan puede ordenarlo'],
    [/NO ES DEL PND/, 'Va por otra vía, no por el Plan'], [/PRIMERO SE MIDE/, 'Primero hay que medirlo']];
  function limpiar(t) {
    t = String(t || '').replace(/\*\*/g, '').replace(/^#+\s*/, '').replace(/\s*\[\d+(?:\]\[\d+)*\]/g, '');
    t = t.replace(/^\(?[a-z]\)\s*/i, '').replace(/^S[ií]ntesis( de esta capa)?\s*[:—–-]?\s*/i, '').replace(/^\(?[a-z]\)\s*/i, '').replace(/^Respuesta directa\s*/i, '');
    for (const [re, txt] of ESTADOS) if (re.test(t) && t === t.toUpperCase()) return txt;
    return t.replace(/\[VERIFICAR\]/g, 'por confirmar').replace(/\bDIE\b/g, 'Departamento').replace(/\bdoliente\b/gi, 'responsable');
  }
  function pintar(etapas) {
    (etapas || []).forEach(e => {
      const li = caja.querySelector(`li[data-k="${e.nombre}"]`); if (!li) return;
      li.className = e.estado === 'listo' ? 'ok' : e.estado === 'en curso' ? 'en' : '';
      if (e.linea) li.querySelector('small').textContent = limpiar(e.linea);
    });
  }
  function terminar(texto) {
    clearInterval(sondeo); clearInterval(reloj);
    caja.querySelector('.dv-tit').textContent = texto; caja.classList.add('min');
  }
  async function ensayo() {
    deEnsayo = true;
    try { const r = await fetch(BASE + '/api/asesor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pregunta: PREGUNTA }) });
      const j = await r.json(); if (j.resultado) { resultado = j.resultado; return; }
      if (j.id) { const rr = await fetch(BASE + '/api/resultado/' + j.id); resultado = await rr.json(); return; } } catch (e) { }
    if (window.DEMO_ENSAYO) resultado = window.DEMO_ENSAYO;
  }
  async function lanzar() {
    if (job) return;
    caja.hidden = false; caja.classList.remove('min'); t0 = Date.now();
    reloj = setInterval(() => { caja.querySelector('.dv-reloj').textContent = mmss((Date.now() - t0) / 1000); }, 1000);
    try {
      const r = await fetch(BASE + '/api/asesor', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Llave': leer('sit_llave') }, body: JSON.stringify({ pregunta: PREGUNTA, sin_cache: true }) });
      const j = await r.json(); if (!r.ok || !j.id) throw new Error(j.error || ('respuesta ' + r.status));
      seguir(j.id);
    } catch (e) { falla = String(e.message || e); await ensayo(); terminar('Respuesta lista (ensayo)'); }
  }
  function seguir(id) {
    job = id; caja.hidden = false; if (!t0) t0 = Date.now();
    if (!reloj) reloj = setInterval(() => { caja.querySelector('.dv-reloj').textContent = mmss((Date.now() - t0) / 1000); }, 1000);
    sondeo = setInterval(async () => {
      try {
        const e = await (await fetch(BASE + '/api/estado/' + job)).json(); pintar(e.etapas);
        if (e.error) { falla = e.error; clearInterval(sondeo); await ensayo(); terminar('Respuesta lista (ensayo)'); return; }
        if (e.listo) { resultado = await (await fetch(BASE + '/api/resultado/' + job)).json(); terminar('Respuesta lista · ' + mmss((Date.now() - t0) / 1000)); }
      } catch (err) { /* un sondeo perdido no detiene nada: se reintenta en 3 s */ }
    }, 3000);
  }
  function seccion(md, titulo) { const m = md.match(new RegExp('^##\\s*' + titulo + '[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))', 'm')); return m ? m[1].trim() : ''; }
  function html(md) {
    return md.split(/\n{2,}/).map(b => {
      b = esc(b).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\s*\[\d+(?:\]\[\d+)*\]/g, '');
      if (/^###\s/.test(b)) return '<h3>' + b.replace(/^###\s*/, '') + '</h3>';
      if (/^\s*[-*]\s/m.test(b)) return '<ul>' + b.split('\n').filter(l => l.trim()).map(l => '<li>' + l.replace(/^\s*[-*]\s*/, '') + '</li>').join('') + '</ul>';
      return '<p>' + b.replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }
  function revelar() {
    if (!resultado) { caja.hidden = false; caja.querySelector('.dv-tit').textContent = job ? 'Todavía trabajando…' : 'Aún no se ha lanzado (tecla L)'; return; }
    const md = resultado.cierre || '';
    const directa = seccion(md, 'Respuesta directa');
    const props = seccion(md, 'Las propuestas para llevar').split(/\n(?=\*\*\d+\.)/).slice(0, 2).join('\n\n');
    const aud = (md.match(/Auditoría:[^\n*]*/) || [''])[0];
    resp.innerHTML = `<div class="dvr-eti">${deEnsayo ? 'Respuesta del ensayo del 24 de septiembre' : 'Lo que respondió el sistema mientras hablábamos'}</div>
      <h2>${esc(PREGUNTA)}</h2>${directa ? '<h3>Respuesta directa</h3>' + html(directa) : ''}${props ? '<h3>Dos de las propuestas</h3>' + html(props) : ''}
      <div class="dvr-pie">${esc(aud)}${resultado.fuentes ? ' · ' + resultado.fuentes.length + ' documentos consultados' : ''}${deEnsayo && falla ? ' · la corrida en vivo no respondió' : ''}</div>`;
    resp.hidden = false; resp.focus();
  }
  // Tecla K: el presentador pega su llave una vez; queda solo en este navegador.
  const panelLlave = document.createElement('form'); panelLlave.id = 'dvk'; panelLlave.hidden = true;
  panelLlave.innerHTML = `<label for="dvk-in">Llave del sistema (se guarda solo en este navegador)</label><input id="dvk-in" type="password" autocomplete="off"><button type="submit">Guardar</button><span id="dvk-ok"></span>`;
  const stk = document.createElement('style');
  stk.textContent = `#dvk{position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:2147483002;background:#fff;color:#122;border-radius:12px;padding:14px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font:14px system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.4)}#dvk[hidden]{display:none!important}#dvk input{padding:6px 8px;min-width:240px}#dvk button{padding:6px 12px}`;
  document.head.appendChild(stk); document.body.appendChild(panelLlave);
  panelLlave.addEventListener('submit', ev => { ev.preventDefault(); const v = panelLlave.querySelector('input').value.trim();
    try { localStorage.setItem('sit_llave', v); panelLlave.querySelector('#dvk-ok').textContent = v ? 'Guardada' : 'Borrada'; } catch (e) { panelLlave.querySelector('#dvk-ok').textContent = 'Este navegador no deja guardarla'; }
    panelLlave.querySelector('input').value = ''; setTimeout(() => { panelLlave.hidden = true; }, 900); });
  document.addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (k === 'l') { lanzar(); }
    else if (k === 'p') { caja.hidden = !caja.hidden; }
    else if (k === 'r') { revelar(); }
    else if (k === 'escape') { resp.hidden = true; panelLlave.hidden = true; }
    else if (k === 'k') { panelLlave.hidden = !panelLlave.hidden; if (!panelLlave.hidden) setTimeout(() => panelLlave.querySelector('input').focus(), 30); }
  }, true);
  caja.addEventListener('click', () => { if (caja.classList.contains('min')) revelar(); });
  window.demoVivo = { lanzar, seguir, revelar, estado: () => ({ job, listo: !!resultado, deEnsayo, falla }) };
})();
