/* Calcul des horaires de prière et de la Qibla — 100 % hors ligne.
   Algorithme astronomique classique (type PrayTimes). Précision ≈ 1 minute. */
const Prayer = (() => {
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };
  const KAABA = { lat: 21.4225, lng: 39.8262 };

  const METHODS = {
    ummalqura: { name: 'Umm al-Qura (Makkah)', fajr: 18.5, isha: 90, ishaMin: true },
    mwl:       { name: 'Muslim World League', fajr: 18, isha: 17 },
    uoif:      { name: 'UOIF (France)', fajr: 12, isha: 12 },
    isna:      { name: 'ISNA', fajr: 15, isha: 15 },
    egypt:     { name: 'Egyptian General Authority', fajr: 19.5, isha: 17.5 },
  };

  function julian(y, m, d) {
    if (m <= 2) { y--; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  function sun(jd) {
    const D = jd - 2451545.0;
    const g = fix(357.529 + 0.98560028 * D, 360);
    const q = fix(280.459 + 0.98564736 * D, 360);
    const L = fix(q + 1.915 * Math.sin(rad(g)) + 0.020 * Math.sin(rad(2 * g)), 360);
    const e = 23.439 - 0.00000036 * D;
    const RA = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15;
    let eqt = q / 15 - fix(RA, 24);
    if (eqt > 12) eqt -= 24; if (eqt < -12) eqt += 24;
    return { decl: deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L)))), eqt };
  }

  /** Heures locales (nombres décimaux) pour une date {y,m,d}. tz = décalage UTC en heures. */
  function times(y, m, d, lat, lng, tz, methodId = 'ummalqura', ramadan = false) {
    const M = METHODS[methodId] || METHODS.ummalqura;
    const jd = julian(y, m, d) - lng / 360;
    const s = sun(jd + 0.5);
    const noon = fix(12 + tz - lng / 15 - s.eqt, 24);
    const T = a => {
      const c = (-Math.sin(rad(a)) - Math.sin(rad(s.decl)) * Math.sin(rad(lat))) /
                (Math.cos(rad(s.decl)) * Math.cos(rad(lat)));
      return (c > 1 || c < -1) ? NaN : deg(Math.acos(c)) / 15;
    };
    const asrAngle = -deg(Math.atan(1 / (1 + Math.tan(rad(Math.abs(lat - s.decl))))));
    const sunrise = noon - T(0.833), maghrib = noon + T(0.833);
    return {
      fajr: noon - T(M.fajr),
      sunrise,
      dhuhr: noon + 1 / 60,            // +1 min de précaution
      asr: noon + T(asrAngle),
      maghrib,
      isha: M.ishaMin ? maghrib + (ramadan ? 120 : M.isha) / 60 : noon + T(M.isha),
    };
  }

  function fmt(h) {
    if (!isFinite(h)) return '--:--';
    h = fix(h + 0.5 / 60, 24);
    const H = Math.floor(h), Mi = Math.floor((h - H) * 60);
    return String(H).padStart(2, '0') + ':' + String(Mi).padStart(2, '0');
  }

  function qibla(lat, lng) {
    const p1 = rad(lat), p2 = rad(KAABA.lat), dl = rad(KAABA.lng - lng);
    return fix(deg(Math.atan2(Math.sin(dl), Math.cos(p1) * Math.tan(p2) - Math.sin(p1) * Math.cos(dl))), 360);
  }
  function distanceKm(lat, lng) {
    const R = 6371, dp = rad(KAABA.lat - lat), dl = rad(KAABA.lng - lng);
    const a = Math.sin(dp / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(KAABA.lat)) * Math.sin(dl / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  /** Décalage UTC (heures) d'un fuseau IANA à une date donnée (gère l'heure d'été). */
  function tzOffset(tzName, fallback = 3, date = new Date()) {
    try {
      const v = new Intl.DateTimeFormat('en', { timeZone: tzName, timeZoneName: 'longOffset' })
        .formatToParts(date).find(x => x.type === 'timeZoneName').value;
      const m = v.match(/GMT([+-])(\d{2}):?(\d{2})?/);
      return m ? (m[1] === '-' ? -1 : 1) * (+m[2] + (+(m[3] || 0)) / 60) : 0;
    } catch { return fallback; }
  }

  const ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  /** Prochaine prière à l'heure locale de la ville. Retourne {key, minutes}. */
  function next(lat, lng, tzName, tzFallback, methodId) {
    const tz = tzOffset(tzName, tzFallback);
    const c = new Date(Date.now() + tz * 3600000);
    const y = c.getUTCFullYear(), m = c.getUTCMonth() + 1, d = c.getUTCDate();
    const nowH = c.getUTCHours() + c.getUTCMinutes() / 60 + c.getUTCSeconds() / 3600;
    const t = times(y, m, d, lat, lng, tz, methodId);
    for (const k of ORDER) if (t[k] > nowH) return { key: k, minutes: (t[k] - nowH) * 60 };
    const t2 = times(y, m, d + 1, lat, lng, tz, methodId);
    return { key: 'fajr', minutes: (t2.fajr + 24 - nowH) * 60 };
  }

  return { METHODS, ORDER, KAABA, times, fmt, qibla, distanceKm, tzOffset, next };
})();
