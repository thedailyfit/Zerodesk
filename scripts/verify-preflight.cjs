const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const moduleObject = { exports: {} };
const processObject = { env: {}, exitCode: 0 };
const offlineRequire = name => { if (['http', 'https'].includes(name)) return {}; throw new Error('Unexpected network dependency'); };
vm.runInNewContext(fs.readFileSync(require.resolve('./preflight-check.js'), 'utf8'), { require: offlineRequire, module: moduleObject, process: processObject, URL, console: { log() {}, table() {}, error() {} } });
moduleObject.exports.runPreflight().then(() => {
  assert.equal(processObject.exitCode, 1, 'Missing production configuration must fail preflight');
  console.log('PASS: missing configuration cannot produce a successful release gate');
});
