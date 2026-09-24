/* Ventana flotante del sistema para presentaciones en vivo (VÍA · Sistema de Inteligencia Territorial).
   Se incluye en cualquier mazo HTML con: <script src="demo_vivo.js" data-pregunta="…"></script>
   Teclas: L lanza la pregunta · P muestra u oculta la ventana · R abre la respuesta · E abre la del ensayo
   · dentro de la respuesta, → y ← pasan de página · Esc la cierra · K guarda la llave una vez.
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
    ['nivel3', 'Decide la puerta del Plan'], ['cierre', 'Redacta la propuesta'], ['auditoria', 'Valida cada afirmación']];
  const VIA = `<svg class="dv-via" viewBox="0 0 250 110" role="img" aria-label="VÍA"><text x="0" y="98" font-family="Montserrat,Arial,sans-serif" font-weight="900" font-size="104" fill="currentColor" letter-spacing="-2">V</text><text x="78" y="98" font-family="Montserrat,Arial,sans-serif" font-weight="900" font-size="104" fill="currentColor">I</text><text x="118" y="98" font-family="Montserrat,Arial,sans-serif" font-weight="900" font-size="104" fill="currentColor">A</text><path d="M84 20 C94 14 102 8 114 2" stroke="#F0801A" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M104 0 L117 1 L112 13" stroke="#F0801A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
  const css = `
  #dv{--dv-acento:var(--demo-acento,#F0801A);--dv-fondo:var(--demo-fondo,#FFFFFF);--dv-texto:var(--demo-texto,#0F3B4C);--dv-suave:var(--demo-suave,#5C6B73);--dv-linea:var(--demo-linea,#DCE3E7);
    position:fixed;right:24px;bottom:84px;width:min(420px,calc(100vw - 32px));z-index:2147483000;font-family:var(--demo-fuente,inherit);
    background:var(--dv-fondo);color:var(--dv-texto);border:1px solid var(--dv-linea);border-top:5px solid var(--dv-acento);border-radius:14px;box-shadow:0 18px 50px rgba(15,59,76,.22);padding:14px 18px 16px;
    transition:transform .35s ease,opacity .35s ease}
  #dv[hidden]{display:none!important}
  #dv .dv-cab{display:flex;justify-content:space-between;align-items:center;gap:10px}
  #dv .dv-marca{display:flex;align-items:center;gap:10px}
  #dv .dv-via{height:22px;width:auto;color:var(--dv-texto)}
  #dv .dv-tit{font-weight:800;font-size:15px;letter-spacing:.01em}
  #dv .dv-reloj{font:700 13px ui-monospace,Menlo,monospace;color:var(--dv-suave)}
  #dv .dv-q{font-size:13px;color:var(--dv-suave);margin:8px 0 10px;line-height:1.4}
  #dv ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
  #dv li{display:grid;grid-template-columns:18px 1fr;gap:2px 8px;font-size:13.5px;font-weight:600;line-height:1.35;opacity:.4}
  #dv li.en,#dv li.ok{opacity:1}
  #dv li i{width:10px;height:10px;border-radius:50%;margin-top:4px;border:2px solid var(--dv-suave)}
  #dv li.en i{border-color:var(--dv-acento);animation:dvpulso 1.1s ease-in-out infinite}
  #dv li.ok i{background:var(--dv-acento);border-color:var(--dv-acento)}
  #dv li small{grid-column:2;color:var(--dv-suave);font-size:12px;font-weight:500;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  #dv .dv-pie{margin-top:10px;font-size:12px;color:var(--dv-suave)}
  #dv.min{width:auto;padding:10px 16px;cursor:pointer}
  #dv.min ol,#dv.min .dv-q,#dv.min .dv-pie{display:none}
  #dv.min .dv-tit::before{content:"✓ ";color:var(--dv-acento)}
  @keyframes dvpulso{50%{transform:scale(1.35)}}
  @media (prefers-reduced-motion:reduce){#dv li.en i{animation:none}}
  #dvr{--r-azul:var(--demo-texto,#0F3B4C);--r-acento:var(--demo-acento,#F0801A);--r-suave:var(--demo-suave,#5C6B73);--r-linea:var(--demo-linea,#DCE3E7);--r-tenue:#EEF2F4;
    position:fixed;inset:0;z-index:2147483001;background:var(--demo-fondo-resp,#FFFFFF);color:#1D2B33;font-family:var(--demo-fuente,inherit);display:flex;flex-direction:column}
  #dvr[hidden]{display:none!important}
  #dvr .r-cab{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:2.6vh 5vw 1.6vh;border-bottom:1px solid var(--r-linea)}
  #dvr .r-marca{display:flex;align-items:center;gap:18px;color:var(--r-azul)}
  #dvr .r-marca .dv-via{height:5.2vh;width:auto}
  #dvr .r-marca span{display:flex;flex-direction:column;border-left:3px solid var(--r-acento);padding-left:14px;font-size:clamp(12px,1.25vw,18px);font-weight:600;color:var(--r-suave);line-height:1.3}
  #dvr .r-marca span b{color:var(--r-azul);font-weight:800}
  #dvr .r-eti{font-size:clamp(12px,1.1vw,16px);font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:var(--r-acento);border-radius:999px;padding:.45em 1.1em;white-space:nowrap}
  #dvr .r-eti.ensayo{background:var(--r-tenue);color:var(--r-suave)}
  #dvr .r-cuerpo{flex:1;overflow:auto;padding:3.2vh 5vw 2vh}
  #dvr .r-q{font-size:clamp(15px,1.45vw,22px);font-weight:700;color:var(--r-suave);max-width:70ch;margin:0 0 2.2vh}
  #dvr .r-k{font-size:clamp(12px,1.05vw,16px);font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--r-acento);margin:0 0 1.2vh}
  #dvr .r-lead{font-size:clamp(24px,2.7vw,42px);font-weight:800;line-height:1.22;color:var(--r-azul);max-width:34ch;margin:0 0 2.4vh;text-wrap:balance}
  #dvr .r-resto{font-size:clamp(15px,1.45vw,22px);line-height:1.45;max-width:66ch;margin:0 0 1.3vh;color:#1D2B33;padding-left:18px;border-left:3px solid var(--r-linea)}
  #dvr .r-resto b{color:var(--r-azul)}
  #dvr .r-props{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:2.4vw}
  #dvr .r-prop{border:2px solid var(--r-linea);border-top:6px solid var(--r-acento);border-radius:18px;padding:2.4vh 1.8vw;display:flex;flex-direction:column;gap:1.4vh}
  #dvr .r-prop h3{margin:0;font-size:clamp(18px,1.9vw,30px);font-weight:900;line-height:1.2;color:var(--r-azul)}
  #dvr .r-via{align-self:flex-start;font-size:clamp(11px,1vw,15px);font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-radius:8px;padding:.35em .8em;background:#FDF1E4;color:#B4520A}
  #dvr .r-via.otra{background:#E2F1F3;color:#136C7C}
  #dvr .r-prop p{margin:0;font-size:clamp(14px,1.35vw,21px);line-height:1.45}
  #dvr .r-prop p b{color:var(--r-azul)}
  #dvr .r-prop .r-prec{font-size:clamp(12px,1.1vw,17px);color:var(--r-suave)}
  #dvr .r-pie{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:1.6vh 5vw 2.2vh;border-top:1px solid var(--r-linea);font-size:clamp(12px,1.1vw,16px);color:var(--r-suave)}
  #dvr .r-pag{display:flex;gap:8px;align-items:center;font-weight:700}
  #dvr .r-pag i{width:10px;height:10px;border-radius:50%;background:var(--r-linea)}
  #dvr .r-pag i.on{background:var(--r-acento)}
  #dvr [data-p]{display:none}
  #dvr [data-p].on{display:block;animation:rsube .5s cubic-bezier(.2,.7,.2,1) both}
  @keyframes rsube{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){#dvr [data-p].on{animation:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const caja = document.createElement('div'); caja.id = 'dv'; caja.hidden = true; caja.setAttribute('role', 'status'); caja.setAttribute('aria-live', 'polite');
  caja.innerHTML = `<div class="dv-cab"><span class="dv-marca">${VIA}<span class="dv-tit">El sistema está trabajando</span></span><span class="dv-reloj">0:00</span></div>
    <div class="dv-q"></div><ol>${PASOS.map(([k, n]) => `<li data-k="${k}"><i></i><span>${n}</span><small></small></li>`).join('')}</ol>
    <div class="dv-pie">Pregunta en vivo · cada paso se apoya en documentos verificados</div>`;
  const resp = document.createElement('div'); resp.id = 'dvr'; resp.hidden = true; resp.tabIndex = -1;
  resp.setAttribute('role', 'dialog'); resp.setAttribute('aria-label', 'Respuesta del sistema');
  document.body.appendChild(caja); document.body.appendChild(resp);
  caja.querySelector('.dv-q').textContent = PREGUNTA;
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let job = null, t0 = 0, reloj = null, sondeo = null, resultado = null, deEnsayo = false, falla = '', segundos = 0, pagina = 0;
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const ESTADOS = [[/SIN DOLIENTE/, 'Nadie responde hoy por este tema'], [/CON DOLIENTE SIN SEGUIMIENTO/, 'Tiene responsable, pero sin seguimiento visible'],
    [/CONTRADICHA/, 'Hay fuentes que se contradicen: se aclara'], [/CONFIRMADA/, 'Confirmada por varias fuentes'], [/HU[ÉE]RFANA/, 'Sin respaldo suficiente todavía'],
    [/SIN MEDIR/, 'Falta el dato: hay que medirlo'], [/EL PND LO CAMBIA/, 'El Plan puede cambiarlo'], [/EL PND LO ORDENA/, 'El Plan puede ordenarlo'],
    [/NO ES DEL PND/, 'Va por otra vía, no por el Plan'], [/PRIMERO SE MIDE/, 'Primero hay que medirlo']];
  const voz = t => String(t || '').replace(/\[VERIFICAR\]/g, 'por confirmar').replace(/⚠️\s*sin fuente verificada/g, '(por confirmar)')
    .replace(/\bDIE\b/g, 'Departamento').replace(/\bdoliente\b/gi, 'responsable').replace(/\b([Aa])udit(orías|oría|ó|a)\b/g, (m, A, x) => (A === 'A' ? 'V' : 'v') + ({ 'orías': 'alidaciones', 'oría': 'alidación', 'ó': 'alidó', 'a': 'alida' })[x]);
  function limpiar(t) {
    t = String(t || '').replace(/\*\*/g, '').replace(/^#+\s*/, '').replace(/\s*\[\d+(?:\]\[\d+)*\]/g, '');
    t = t.replace(/^\(?[a-z]\)\s*/i, '').replace(/^S[ií]ntesis( de esta capa)?\s*[:—–-]?\s*/i, '').replace(/^\(?[a-z]\)\s*/i, '').replace(/^Respuesta directa\s*/i, '');
    for (const [re, txt] of ESTADOS) if (re.test(t) && t === t.toUpperCase()) return txt;
    return voz(t);
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
        if (e.listo) { resultado = await (await fetch(BASE + '/api/resultado/' + job)).json(); segundos = (Date.now() - t0) / 1000; terminar('Respuesta lista · ' + mmss(segundos)); }
      } catch (err) { /* un sondeo perdido no detiene nada: se reintenta en 3 s */ }
    }, 3000);
  }
  function seccion(md, titulo) { const m = md.match(new RegExp('^##\\s*' + titulo + '[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))', 'm')); return m ? m[1].trim() : ''; }
  const sinCitas = t => String(t || '').replace(/\s*\[\d+(?:\]\[\d+)*\]/g, '').replace(/\s*⚠️\s*(\(por confirmar\))?/g, ' (por confirmar)').replace(/\s+\./g, '.').trim();
  const negritas = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*\*/g, '');
  // Parte la respuesta directa en frase principal y el resto, sin cortar dentro de paréntesis ni de abreviaturas de norma.
  function partir(txt) {
    const t = sinCitas(voz(txt)).replace(/\n+/g, ' ');
    let prof = 0;
    for (let i = 0; i < t.length; i++) {
      const c = t[i]; if (c === '(') prof++; else if (c === ')') prof = Math.max(0, prof - 1);
      if (prof === 0 && (c === '.' || c === ';' || c === ':') && t[i + 1] === ' ' && i > 60 && !/\b(art|núm|lit|No|inc|par)$/i.test(t.slice(Math.max(0, i - 4), i)))
        return [t.slice(0, i + (c === '.' ? 1 : 0)).trim(), t.slice(i + 1).trim()];
    }
    return [t, ''];
  }
  // Frases completas, sin cortar dentro de paréntesis ni en abreviaturas de norma.
  function frasesDe(t) {
    const out = []; let prof = 0, ini = 0;
    for (let i = 0; i < t.length; i++) {
      const c = t[i]; if (c === '(') prof++; else if (c === ')') prof = Math.max(0, prof - 1);
      if (prof === 0 && (c === '.' || c === ';') && t[i + 1] === ' ' && i - ini > 40 && !/\b(art|arts|núm|lit|lits|No|inc|par|C)$/i.test(t.slice(Math.max(ini, i - 5), i))) {
        out.push(t.slice(ini, i + (c === '.' ? 1 : 0)).trim()); ini = i + 1; }
    }
    const fin = t.slice(ini).trim(); if (fin) out.push(fin);
    return out.filter(Boolean);
  }
  function campo(bloque, nombre) {
    const re = new RegExp('\\*{0,2}' + nombre + '\\*{0,2}\\s*:?\\*{0,2}\\s*([\\s\\S]*?)(?=\\n\\s*[-*]?\\s*\\*{0,2}(?:Qué pedir|Argumento|Vehículo|Precedente|Evidencia)\\b|$(?![\\s\\S]))', 'i');
    const m = bloque.match(re); if (!m) return '';
    return sinCitas(voz(m[1].replace(/^\s*[-*]\s*/gm, '').replace(/\n+/g, ' ')));
  }
  function propuestas(md) {
    return seccion(md, 'Las propuestas para llevar').split(/\n(?=\*\*\d+\.)/).filter(b => /^\*\*\d+\./.test(b.trim())).slice(0, 2).map(b => {
      const titulo = (b.match(/^\*\*\d+\.\s*([^*\n]+)\*\*/) || ['', ''])[1].trim();
      const pedir = campo(b, 'Qué pedir'), vehiculo = campo(b, 'Vehículo'), precedente = campo(b, 'Precedente');
      const primera = pedir.split(/(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÑ¿])/)[0] || pedir;
      return { titulo: voz(titulo), pedir: primera.length > 320 ? primera.slice(0, 300).replace(/\s+\S*$/, '') + '…' : primera, vehiculo, precedente };
    });
  }
  function irA(n) {
    const ps = resp.querySelectorAll('[data-p]'); if (!ps.length) return;
    pagina = Math.max(0, Math.min(ps.length - 1, n));
    ps.forEach((p, i) => p.classList.toggle('on', i === pagina));
    resp.querySelectorAll('.r-pag i').forEach((d, i) => d.classList.toggle('on', i === pagina));
  }
  async function revelar(forzarEnsayo) {
    if (forzarEnsayo && !resultado) { await ensayo(); }
    if (!resultado && job) { caja.hidden = false; caja.querySelector('.dv-tit').textContent = 'Todavía trabajando · E abre la del ensayo'; return; }
    if (!resultado) { await ensayo(); }
    if (!resultado) { caja.hidden = false; caja.querySelector('.dv-tit').textContent = 'Sin conexión y sin ensayo guardado'; return; }
    const md = resultado.cierre || '';
    const [lead, resto] = partir(seccion(md, 'Respuesta directa'));
    const props = propuestas(md);
    const nf = (resultado.fuentes || []).length;
    const frases = frasesDe(resto).map(fr => { fr = fr.charAt(0).toUpperCase() + fr.slice(1);
      const m = fr.match(/^([^:()]{3,34}):\s+(.*)$/); return m ? `<b>${esc(m[1])}:</b> ${negritas(m[2])}` : negritas(fr); });
    const pag1 = `<section data-p><p class="r-q">${esc(PREGUNTA)}</p><p class="r-k">Respuesta directa</p>
      <p class="r-lead">${negritas(lead.replace(/[:;]$/, '.'))}</p>${frases.map(fr => `<p class="r-resto">${fr}</p>`).join('')}</section>`;
    const pag2 = props.length ? `<section data-p><p class="r-k">Lo que se puede pedir, y por dónde</p><div class="r-props">${props.map(p => {
      const otra = /otra v[ií]a|ley propia|decreto|CREG/i.test(p.vehiculo) && !/^PLAN/i.test(p.vehiculo);
      return `<article class="r-prop"><h3>${esc(p.titulo)}</h3>${p.vehiculo ? `<span class="r-via${otra ? ' otra' : ''}">${negritas(p.vehiculo.split(/\s[—–-]\s/)[0])}</span>` : ''}
        <p><b>Qué pedir:</b> ${negritas(p.pedir)}</p>${p.precedente ? `<p class="r-prec"><b>Precedente:</b> ${negritas(p.precedente.length > 220 ? p.precedente.slice(0, 200).replace(/\s+\S*$/, '') + '…' : p.precedente)}</p>` : ''}</article>`; }).join('')}</div></section>` : '';
    const n = pag2 ? 2 : 1;
    const eti = deEnsayo ? 'Respuesta del ensayo · 24 de septiembre' : ('En vivo' + (segundos ? ' · ' + mmss(segundos) : ''));
    resp.innerHTML = `<header class="r-cab"><div class="r-marca">${VIA}<span><b>Ventanilla de Incidencia Asistida</b>Sistema de Inteligencia Territorial</span></div><span class="r-eti${deEnsayo ? ' ensayo' : ''}">${esc(eti)}</span></header>
      <div class="r-cuerpo">${pag1}${pag2}</div>
      <footer class="r-pie"><span>${nf ? nf + ' documentos consultados · ' : ''}cada afirmación con su fuente · validado por el equipo técnico del Departamento${deEnsayo && falla ? ' · la corrida en vivo no respondió' : ''}</span>
      <span class="r-pag">${Array.from({ length: n }, () => '<i></i>').join('')}${n > 1 ? '<span style="margin-left:10px">→ siguiente</span>' : ''}</span></footer>`;
    resp.hidden = false; resp.focus(); irA(0);
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
    if (!resp.hidden && ['arrowright', 'arrowleft', ' ', 'pagedown', 'pageup', 'arrowdown', 'arrowup'].includes(k)) {
      e.preventDefault(); e.stopImmediatePropagation();
      irA(pagina + (['arrowleft', 'pageup', 'arrowup'].includes(k) ? -1 : 1)); return;
    }
    if (k === 'l') { lanzar(); }
    else if (k === 'p') { caja.hidden = !caja.hidden; }
    else if (k === 'r') { revelar(false); }
    else if (k === 'e') { if (!resultado) revelar(true); else revelar(false); }
    else if (k === 'escape') { resp.hidden = true; panelLlave.hidden = true; }
    else if (k === 'k') { panelLlave.hidden = !panelLlave.hidden; if (!panelLlave.hidden) setTimeout(() => panelLlave.querySelector('input').focus(), 30); }
    else return;
    if (!resp.hidden || k === 'r' || k === 'e') e.stopImmediatePropagation();
  }, true);
  caja.addEventListener('click', () => { if (caja.classList.contains('min')) revelar(false); });
  resp.addEventListener('click', e => { if (!e.target.closest('a')) irA(pagina + 1); });
  window.demoVivo = { lanzar, seguir, revelar, estado: () => ({ job, listo: !!resultado, deEnsayo, falla }) };
})();
