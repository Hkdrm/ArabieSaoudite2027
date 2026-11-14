/* Lecture d'un billet / e-mail de confirmation : extrait les vols (numéro, date, aéroports, heures, terminal).
   100 % local : le texte (collé ou lu par OCR sur une capture) n'est envoyé nulle part.
   Heuristique tolérante (FR / EN) : le résultat est TOUJOURS montré en aperçu avant d'être appliqué. */
(() => {
  const AIRLINE_CODES = new Set(('SV XY F3 LX AF KL TK QR EK EY MS AT TU AH LH ET PC U2 G9 BA EW WY GF KU RJ ME IB AZ TP SN OS LO SK AY DY FR W6 VY HV TO UX AC AA UA DL AI PK SQ MH TG CX JL NH KE OZ QF EI LS BY MT RB TB 3O JU A3 OU RO FB OK BT PS CA MU CZ HU 5W 6E IX SG J2 W5 IR QZ KQ SA WB ET NP UL BG G3 NK B6 WN VS I2 LY KC 7C RK HY OD 8M S7 SU TK XQ TX BF').split(/\s+/));
  const IATA = new Set(('CDG ORY LYS MRS NCE TLS BOD NTE LIL BSL MLH BRU CRL GVA ZRH BSL LUX AMS RTM EIN LHR LGW STN LTN LCY MAN BHX EDI GLA DUB CPH ARN OSL HEL FRA MUC DUS TXL BER HAM STR CGN VIE SZG INN PRG WAW KRK BUD OTP SOF ATH SKG IST SAW ESB AYT ADB LIS OPO MAD BCN AGP VLC PMI IBZ ALC SVQ BIO FCO CIA MXP LIN BGY VCE NAP PSA TRN BLQ CTA PMO CAI HRG SSH ALY CMN RAK TNG AGA ORN ALG TUN DJE NBE JED MED RUH DMM TIF ULH AHB TUU YNB GIZ ELQ EAM HOF AJF DOH DXB AUH SHJ KWI BAH MCT SLL AMM AQJ BEY TLV BGW EBL DAM IKA THR SHI MHD AMD BOM DEL BLR MAA HYD CCU KHI LHE ISB DAC CMB MLE KTM BKK HKT DMK SIN KUL CGK DPS MNL HKG PEK PVG CAN NRT HND KIX ICN SYD MEL BNE AKL JNB CPT NBO ADD LOS ACC DSS ABJ DKR JFK EWR LGA BOS IAD DCA ORD ATL MIA LAX SFO SEA YYZ YUL YVR GRU EZE BOG LIM MEX CUN').split(/\s+/));
  const MONTHS = { jan: 1, janv: 1, janvier: 1, january: 1, feb: 2, fev: 2, fevr: 2, fevrier: 2, febr: 2, february: 2, mar: 3, mars: 3, march: 3, apr: 4, avr: 4, avril: 4, april: 4, may: 5, mai: 5,
    jun: 6, juin: 6, june: 6, jul: 7, juil: 7, juillet: 7, july: 7, aug: 8, aou: 8, aout: 8, august: 8, sep: 9, sept: 9, septembre: 9, september: 9, oct: 10, octobre: 10, october: 10,
    nov: 11, novembre: 11, november: 11, dec: 12, decembre: 12, december: 12 };
  const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ /g, ' ');
  const pad = n => String(n).padStart(2, '0');
  const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const valid = (y, m, d) => { const x = new Date(y, m - 1, d); return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d; };
  const fullYear = y => (y < 100 ? 2000 + y : y);
  /** Année manquante : on prend la prochaine occurrence à venir (tolérance : 45 jours dans le passé). */
  const inferYear = (m, d) => { const t0 = today(); for (const y of [t0.getFullYear(), t0.getFullYear() + 1]) if (valid(y, m, d) && new Date(y, m - 1, d) >= new Date(t0.getTime() - 45 * 864e5)) return y; return t0.getFullYear(); };

  /** Toutes les dates d'une ligne, en AAAA-MM-JJ. */
  function datesIn(line) {
    const s = strip(line).toLowerCase(), out = [];
    const push = (y, m, d) => { if (m >= 1 && m <= 12 && valid(y, m, d)) out.push(`${y}-${pad(m)}-${pad(d)}`); };
    let m;
    const iso = /\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/g; while ((m = iso.exec(s))) push(+m[1], +m[2], +m[3]);
    const num = /\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](20\d{2}|\d{2})\b/g;
    while ((m = num.exec(s))) { let a = +m[1], b = +m[2]; if (b > 12 && a <= 12) [a, b] = [b, a]; push(fullYear(+m[3]), b, a); }
    const compact = /\b(\d{1,2})([a-z]{3})(\d{4}|\d{2})\b/g; while ((m = compact.exec(s))) if (MONTHS[m[2]]) push(fullYear(+m[3]), MONTHS[m[2]], +m[1]);
    const dmy = /\b(\d{1,2})(?:er)?\s*(?:de\s+)?([a-z]{3,9})\.?,?\s*(20\d{2}|\d{2})?(?![\d:h])/g;
    while ((m = dmy.exec(s))) { const mo = MONTHS[m[2]]; if (!mo) continue; const d = +m[1]; push(m[3] ? fullYear(+m[3]) : inferYear(mo, d), mo, d); }
    const mdy = /\b([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(20\d{2})?(?![\d:h])/g;
    while ((m = mdy.exec(s))) { const mo = MONTHS[m[1]]; if (!mo) continue; const d = +m[2]; push(m[3] ? +m[3] : inferYear(mo, d), mo, d); }
    return [...new Set(out)];
  }
  function timesIn(line) {
    const out = [], re = /(?<![\d:])([01]?\d|2[0-3])\s?[:hH]\s?([0-5]\d)\s?(am|pm|AM|PM)?(?!\d)/g; let m;
    while ((m = re.exec(line))) { let h = +m[1]; const ap = (m[3] || '').toLowerCase(); if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0; out.push(`${pad(h)}:${m[2]}`); }
    return out;
  }
  function airportsIn(line) { const out = [], re = /\b([A-Z]{3})\b/g; let m; while ((m = re.exec(line))) if (IATA.has(m[1])) out.push(m[1]); return out; }
  function flightsIn(line) {
    const out = [], re = /\b([A-Z][A-Z0-9]|[0-9][A-Z])\s?(\d{1,4})([A-Z])?\b/g; let m;
    while ((m = re.exec(line))) if (AIRLINE_CODES.has(m[1]) && !/^20[2-3]\d$/.test(m[2])) out.push(`${m[1]} ${m[2]}`);      // on écarte les « années » (SV 2027)
    return out;
  }
  const terminalIn = line => { const m = /\b(?:terminal|term\.?)\s*[:\-]?\s*([A-Z0-9]{1,3})\b/i.exec(line); return m ? m[1].toUpperCase() : ''; };

  /** Terminal de DÉPART : sur la ligne de l'aéroport d'origine, ou sur la ligne suivante si elle ne parle pas d'un autre aéroport. */
  function depTerminal(win, origin) {
    if (!origin) return '';
    const k = win.findIndex(l => airportsIn(l).includes(origin));
    if (k < 0) return '';
    return terminalIn(win[k]) || (win[k + 1] && !airportsIn(win[k + 1]).length ? terminalIn(win[k + 1]) : '');
  }

  /** Texte → liste de vols [{no,date,from,to,dep,arr,term}] triés par date/heure. */
  function parse(text) {
    const lines = String(text || '').split(/\r?\n+/).map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const flights = lines.map(flightsIn), dates = lines.map(datesIn);
    const isHeader = lines.map((l, k) => dates[k].length > 0 && !flights[k].length && !timesIn(l).length && !airportsIn(l).length);      // ligne qui ne contient QUE une date
    const segs = [];
    lines.forEach((ln, i) => {
      flights[i].forEach(no => {
        let end = lines.length;
        for (let j = i + 1; j < lines.length; j++) if (flights[j].length) { end = j; break; }
        end = Math.min(end, i + 10);
        const win = lines.slice(i, end);
        // date : (1) sur la même ligne ; (2) ligne de détail qui suit (contient heures/aéroports) ; (3) dernier EN-TÊTE de date avant le vol ; (4) n'importe quelle date qui suit
        let date = dates[i][0] || '';
        if (!date) { for (let j = i + 1; j < end; j++) if (dates[j].length && !isHeader[j]) { date = dates[j][0]; break; } }
        if (!date) { for (let j = i - 1; j >= 0; j--) if (dates[j].length && isHeader[j]) { date = dates[j][0]; break; } }
        if (!date) { for (let j = i + 1; j < end; j++) if (dates[j].length) { date = dates[j][0]; break; } }
        const wTimes = win.flatMap(timesIn), wAir = [...new Set(win.flatMap(airportsIn))];
        segs.push({ no, date, from: wAir[0] || '', to: wAir[1] || '', dep: wTimes[0] || '', arr: wTimes[1] || '', term: depTerminal(win, wAir[0]) });
      });
    });
    const seen = new Set();
    return segs.filter(s => { const k = s.no + '|' + s.date; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => (a.date + (a.dep || '')).localeCompare(b.date + (b.dep || '')));
  }

  /** OCR d'une capture (Tesseract.js chargé à la demande, exécuté sur l'appareil). */
  let tessP = null;
  const loadTess = () => tessP || (tessP = new Promise((res, rej) => {
    if (window.Tesseract) return res(window.Tesseract);
    const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    s.onload = () => res(window.Tesseract); s.onerror = () => { tessP = null; rej(new Error('ocr-load')); }; document.head.appendChild(s);
  }));
  async function ocr(file, onProgress) {
    const T = await loadTess();
    const worker = await T.createWorker('eng+fra', 1, { logger: m => { if (onProgress && m.progress != null) onProgress(m.status, m.progress); } });
    try { const r = await worker.recognize(file); return r.data.text || ''; } finally { await worker.terminate(); }
  }

  const api = { parse, datesIn, timesIn, airportsIn, flightsIn, ocr };
  if (typeof window !== 'undefined') { window.Omra = window.Omra || {}; window.Omra.ticket = api; }
  if (typeof module !== 'undefined') module.exports = api;
})();
