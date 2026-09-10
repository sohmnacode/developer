import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {JSDOM} from 'jsdom';
import {caseIndex} from '../data/research-data.js';
import {caseDetails} from '../data/cases-detail-data.js';
const files=fs.readdirSync('public',{recursive:true}).filter(p=>fs.statSync(path.join('public',p)).isFile());
test('public artifact excludes documents, secrets, diagnostic outputs, and server code',()=>{
  assert.ok(files.length>50);assert.equal(files.filter(p=>/\.docx$|(^|\/)(api|lib|tests|tmp|\.codex-review|\.env|node_modules)\b/.test(p)).length,0);
  assert.ok(files.includes('assets/9998/9998-screenplay-READER-COPY.pdf'));assert.ok(fs.existsSync('assets/9998/9998-screenplay.docx'));
});
test('all generated HTML disallows executable inline script and HTML event handlers',()=>{
  for(const file of files.filter(p=>p.endsWith('.html'))){const d=new JSDOM(fs.readFileSync(path.join('public',file),'utf8'));
    assert.equal(d.window.document.querySelectorAll('script:not([src]):not([type="application/ld+json"])').length,0,file);
    for(const e of d.window.document.querySelectorAll('*'))for(const attr of e.attributes)assert.ok(!/^on[a-z]+$/.test(attr.name),`${file}: ${attr.name}`);
    for(const script of d.window.document.querySelectorAll('script[src]'))assert.ok(fs.existsSync(path.join('public',script.getAttribute('src').split('?')[0])),`${file} ${script.src}`);
    d.window.close();
  }
});
test('generated JS syntax is valid as classic scripts or modules',()=>{
  const modules=new Set();for(const file of files.filter(p=>p.endsWith('.html'))){const d=new JSDOM(fs.readFileSync(path.join('public',file),'utf8'));for(const script of d.window.document.querySelectorAll('script[type="module"][src]'))modules.add(script.getAttribute('src').slice(1));d.window.close()}
  for(const file of files.filter(p=>p.endsWith('.js'))){const code=fs.readFileSync(path.join('public',file),'utf8');if(modules.has(file)||file.startsWith('data/'))execFileSync(process.execPath,['--check',path.join('public',file)],{stdio:'pipe'});else assert.doesNotThrow(()=>new vm.Script(code,{filename:file}));}
});
test('case identities and scores are shared, and dossiers have distinct metadata and sitemap URLs',()=>{
  assert.equal(new Set(caseIndex.map(c=>c.id)).size,caseIndex.length);
  const sitemap=fs.readFileSync('public/sitemap.xml','utf8');
  for(const c of caseDetails){const item=caseIndex.find(x=>x.id===c.id);assert.equal(c.strength,item.evidenceScore);const d=new JSDOM(fs.readFileSync(`public/case/${c.id}.html`,'utf8'));assert.equal(d.window.document.querySelector('link[rel=canonical]').href,`https://reincarnatedai.com/case/${c.id}`);assert.match(d.window.document.title,new RegExp(c.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.equal(d.window.document.querySelector('meta[name=robots]'),null);assert.ok(sitemap.includes(`/case/${c.id}`));d.window.close()}
  for(const p of ['compare','death-cultures','implications'])assert.ok(sitemap.includes('/'+p));
});
test('CSP rejects inline scripts, cross-origin connections and object embeds',()=>{
  const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));const csp=config.headers[0].headers.find(h=>h.key==='Content-Security-Policy').value;assert.match(csp,/script-src 'self';/);assert.match(csp,/connect-src 'self';/);assert.match(csp,/object-src 'none'/);assert.equal(config.outputDirectory,'public');
});
