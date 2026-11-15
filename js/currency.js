/* Indicative offline currency conversion. CHF is the accounting currency.
   Rates are assumptions (CHF per 1 unit), not market quotes. */
(() => {
  'use strict';
  const DEFAULTS = Object.freeze({CHF:1,USD:0.80,SAR:0.21,EUR:0.93,GBP:1.06,CAD:0.58});
  const INPUT_CURRENCIES = Object.freeze(['CHF','USD','SAR']);
  const LEGACY_CURRENCIES = Object.freeze(['EUR','GBP','CAD']);
  const validRate = value => Number.isFinite(Number(value)) && Number(value)>0 && Number(value)<100;
  function rates(value) {
    const out={...DEFAULTS};
    if(value && typeof value==='object' && !Array.isArray(value)) {
      for(const code of Object.keys(DEFAULTS)) {
        if(code!=='CHF' && validRate(value[code])) out[code]=Number(value[code]);
      }
    }
    return out;
  }
  function toCHF(value, currency, rateMap) {
    const number=Number(value);
    if(!Number.isFinite(number) || number<0) return NaN;
    const map=rates(rateMap);
    if(!Object.hasOwn(map,currency)) return NaN;
    return Math.round((number * map[currency] + Number.EPSILON) * 100) / 100;
  }
  const fromCHF=(chf,currency,rateMap)=>{
    const map=rates(rateMap);
    return Object.hasOwn(map,currency) ? Number(chf)/map[currency] : NaN;
  };
  const format=(value,currency='CHF',locale='fr-CH')=>{
    if(!Number.isFinite(Number(value))) return '—';
    return new Intl.NumberFormat(locale,{style:'currency',currency,maximumFractionDigits:2}).format(Number(value));
  };
  function legacyBudgetCHF(oldBudget,legacyRate,legacyCurrency,customRates) {
    const amount=Number(oldBudget);
    if(!Number.isFinite(amount)||amount<=0) return 0;
    // Previously budget was always in SAR; old 'rate' was SAR->selected currency.
    if(legacyCurrency==='CHF' && validRate(legacyRate)) return amount*Number(legacyRate);
    return toCHF(amount,'SAR',customRates);
  }
  window.OmraCurrency={DEFAULTS,INPUT_CURRENCIES,LEGACY_CURRENCIES,rates,toCHF,fromCHF,format,legacyBudgetCHF,validRate};
})();