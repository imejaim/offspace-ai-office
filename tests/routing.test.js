import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('existing root and bookmarked v3 route visitors to the new campus',()=>{
 const root=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const old=readFileSync(new URL('../prototype/index-v3.html',import.meta.url),'utf8');
 assert.match(root,/url=prototype\/index-v4\.html/);
 assert.match(old,/url=index-v4\.html/);
 const legacy=readFileSync(new URL('../prototype/index-v3-legacy.html',import.meta.url),'utf8');
 assert.match(legacy,/Offspace AI Office v3/);
});
