import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('./scene.js', import.meta.url), 'utf8').catch(() => '');

const IDS = ['business', 'investment', 'work', 'research', 'public', 'life'];

test('exports the required campus API and all stable zone ids', () => {
  assert.match(source, /export\s+const\s+ZONES\s*=/);
  assert.match(source, /export\s+async\s+function\s+createCampus\s*\(/);
  for (const id of IDS) assert.match(source, new RegExp(`\\b${id}:\\s*Object\\.freeze`));
  for (const method of ['focus', 'home', 'setMotion', 'setExploration', 'destroy', 'getDiagnostics']) {
    assert.match(source, new RegExp(`\\b${method}\\s*\\(`));
  }
});

test('uses only local character artwork with the required module-relative paths', () => {
  for (const name of ['Heo-sajang', 'Ko-bujang', 'Oh-gwajang', 'Jem-daeri']) {
    assert.match(source, new RegExp(`new URL\\('\\.\\.\\/\\.\\.\\/assets/characters/transparent/${name}\\.svg',\\s*import\\.meta\\.url\\)`));
  }
  assert.doesNotMatch(source, /https?:\/\//);
});

test('contains performance, lifecycle, accessibility, and WebGL fail-fast safeguards', () => {
  assert.match(source, /const\s+dprCap\s*=\s*mobile\s*\?\s*1\.25\s*:\s*1\.5/);
  assert.match(source, /setPixelRatio\(Math\.min\([^;]*devicePixelRatio[^;]*dprCap/);
  assert.match(source, /document\.hidden/);
  assert.match(source, /webglcontextlost/);
  assert.match(source, /INPUT\|TEXTAREA\|BUTTON\|A/);
  assert.match(source, /renderer\.dispose\(\)/);
  assert.match(source, /controls\.dispose\(\)/);
  assert.match(source, /throw new Error\([^)]*WebGL/i);
});

test('does not create fixed HTML labels or mutate page markup', () => {
  assert.doesNotMatch(source, /createElement\s*\(\s*['"](?:div|span|label|button)/);
  assert.doesNotMatch(source, /innerHTML|insertAdjacentHTML/);
});
