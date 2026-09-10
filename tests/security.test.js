import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const read = p=>readFileSync(p,'utf8');
function dom(html='<body></body>',url='https://reincarnatedai.com/') {
  const d=new JSDOM(html,{url,runScripts:'outside-only'});d.window.eval(read('assets/safe.js'));return d;
}
test('search escaping and highlighting treat markup as text',()=>{
  const d=dom();const safe=d.window.RaiSafe;
  for(const text of ['<img src=x onerror=alert(1)>','<b>marker</b>','" onclick="bad','A & B']){
    d.window.document.body.innerHTML=safe.highlight(text,'marker');
    assert.equal(d.window.document.body.textContent,text);
    assert.equal(d.window.document.querySelectorAll('img,script,b').length,0);
  }
  assert.equal(safe.highlight('a+b and A+B','a+b'),'<mark>a+b</mark> and <mark>A+B</mark>');d.window.close();
});
test('bookmark identities preserve distinct case IDs and reject foreign/executable URLs',()=>{
  const d=dom(),s=d.window.RaiSafe;
  assert.equal(s.pageUrl('/case?id=pam-reynolds&utm_source=x'),'/case/pam-reynolds');
  assert.notEqual(s.pageUrl('/case?id=pam-reynolds'),s.pageUrl('/case?id=james-leininger'));
  for(const url of ['javascript:alert(1)','https://evil.example/x','//evil.example'])assert.equal(s.pageUrl(url),null);
  assert.equal(s.bookmarks([{url:'javascript:alert(1)',title:'bad'},{url:'/case?id=pam-reynolds',title:'Pam'},{url:'/case/pam-reynolds',title:'duplicate'}]).length,1);d.window.close();
});
test('mobile icon click stays open; Escape and outside click close the menu',async()=>{
  const d=dom('<nav><div class="links"><a href="/cases">Cases</a></div></nav><main>Outside</main>');
  await new Promise(resolve=>d.window.addEventListener('load',resolve,{once:true}));
  d.window.eval(read('assets/ui.js'));d.window.document.dispatchEvent(new d.window.Event('DOMContentLoaded'));
  const button=d.window.document.querySelector('.nav-hamburger'),nav=d.window.document.querySelector('nav');
  button.querySelector('line').dispatchEvent(new d.window.MouseEvent('click',{bubbles:true}));
  assert.equal(button.getAttribute('aria-expanded'),'true');assert.ok(nav.classList.contains('nav-open'));
  d.window.document.dispatchEvent(new d.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(button.getAttribute('aria-expanded'),'false');
  button.click();d.window.document.querySelector('main').click();assert.equal(button.getAttribute('aria-expanded'),'false');d.window.close();
});
test('journal saves literal markup, preserves it on reload, and supports undo',()=>{
  const d=dom(read('journal.html'));const w=d.window;w.eval(read('assets/journal.js'));
  w.document.getElementById('title').value='<img src=x onerror=bad()>';
  w.document.getElementById('body').value='<b>Private note</b>\nSecond line';
  w.document.getElementById('form').dispatchEvent(new w.Event('submit',{cancelable:true}));
  assert.equal(w.document.querySelector('#entries h3').textContent,'<img src=x onerror=bad()>');
  assert.equal(w.document.querySelector('#entries img, #entries b'),null);
  const saved=w.localStorage.getItem('rai-experience-journal');
  w.document.querySelector('#entries button').click();assert.equal(JSON.parse(w.localStorage.getItem('rai-experience-journal')).length,0);
  w.document.getElementById('undoDelete').click();assert.equal(w.localStorage.getItem('rai-experience-journal'),saved);
  const reloaded=dom(read('journal.html'));reloaded.window.localStorage.setItem('rai-experience-journal',saved);reloaded.window.eval(read('assets/journal.js'));
  assert.equal(reloaded.window.document.querySelector('#entries p').textContent,'<b>Private note</b>\nSecond line');d.window.close();reloaded.window.close();
});
test('journal does not overwrite corrupt storage',()=>{
  const d=dom(read('journal.html'));const w=d.window;w.localStorage.setItem('rai-experience-journal','broken-json');w.eval(read('assets/journal.js'));
  w.document.getElementById('body').value='New entry';w.document.getElementById('form').dispatchEvent(new w.Event('submit',{cancelable:true}));
  assert.equal(w.localStorage.getItem('rai-experience-journal'),'broken-json');assert.match(w.document.getElementById('journalStatus').textContent,/Export a backup/);d.window.close();
});
test('bookmark script initialization is idempotent',()=>{
  const d=dom('<nav></nav>');d.window.eval(read('assets/bookmarks.js'));assert.doesNotThrow(()=>d.window.eval(read('assets/bookmarks.js')));d.window.close();
});
