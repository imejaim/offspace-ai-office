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

test('business studio links the four public sites without linking Toss-only apps', async () => {
  const {areas} = await import(path.href);
  const projects = areas.find(a=>a.id==='business').projects;
  assert.deepEqual(Object.fromEntries(projects.filter(p=>p.url).map(p=>[p.name,p.url])), {
    '숨은정원':'https://hidden-garden-review.pages.dev/',
    '운명':'https://un-myeong.pages.dev/',
    '인터셉트':'https://interceptnews.app/',
    '오늘의 골프':'https://todays-golf.pages.dev/'
  });
  assert.ok(projects.filter(p=>['오늘의 짝꿍','1분 두뇌체조'].includes(p.name)).every(p=>!p.url));
});
