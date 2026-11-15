const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function init(){
  const sandbox={window:{}, Intl,Number,Object,Array,Date};
  vm.runInNewContext(fs.readFileSync('js/currency.js','utf8'),sandbox,{filename:'js/currency.js'});
  return sandbox.window.OmraCurrency;
}
test('CHF is primary and defaults match indicative requested rates',()=>{
 const c=init();assert.deepEqual(Array.from(c.INPUT_CURRENCIES),['CHF','USD','SAR']);
 assert.equal(c.toCHF(1,'CHF'),1);
 assert.equal(c.toCHF(100,'USD'),80);
 assert.equal(c.toCHF(1500,'SAR'),315);
});
test('different currencies convert consistently',()=>{
 const c=init();
 const rates=c.rates({USD:0.82,SAR:0.22});
 assert.equal(c.toCHF(100,'USD',rates),82);
 assert.equal(c.toCHF(1500,'SAR',rates),330);
 assert.equal(c.fromCHF(330,'SAR',rates),1500);
});
test('rates are editable, invalid overrides rejected, unknown currencies rejected',()=>{
 const c=init();
 assert.equal(c.rates({SAR:-1,USD:0})['SAR'],0.21);
 assert.equal(c.rates({USD:0})['USD'],0.8);
 assert.equal(Number.isNaN(c.toCHF(10,'XYZ')),true);
 assert.equal(Number.isNaN(c.toCHF(-30,'SAR')),true);
});
test('legacy SAR budget is preserved via conservative CHF migration',()=>{
 const c=init();
 assert.equal(c.legacyBudgetCHF(1000,0.23,'EUR'),210);
 assert.equal(c.legacyBudgetCHF(1000,0.22,'CHF'),220);
 assert.equal(c.legacyBudgetCHF(0,0.23,'EUR'),0);
});
test('historical legacy expenses remain convertible for display',()=>{
 const c=init();
 assert.equal(c.toCHF(100,'EUR'),93);
 assert.equal(c.toCHF(100,'GBP'),106);
 assert.equal(c.toCHF(100,'CAD'),58);
});
