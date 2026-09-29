import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const path = new URL('../prototype/v4/office-data.js', import.meta.url);
test('public office directory exposes six real work areas, not simulated activity', async () => {
  assert.ok(existsSync(path), 'new public work directory is not implemented yet');
  const {areas,characters,meta} = await import(path.href);
  assert.equal(areas.length,6);
  assert.deepEqual(areas.map(x=>x.id),['business','investment','work','research','public','life']);
  assert.equal(new Set(areas.map(x=>x.folder)).size,6);
  assert.equal(characters.length,4);
  assert.equal(meta.live,false);
  assert.ok(areas.every(a=>a.name && a.description && a.folder && a.projects.length));
  const encoded=JSON.stringify({areas,characters,meta});
  assert.doesNotMatch(encoded,/\/Users\/|apiKey|access_token|010-3179|1984-12|잔고[\s:₩]*\d[\d,]{5}/);
  assert.ok(areas.flatMap(x=>x.projects).every(p=>!p.url || /^https:\/\//.test(p.url)));
});
