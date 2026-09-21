const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { JSDOM } = require('jsdom');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public');
const write = (name, content) => { const target = path.join(OUT,name); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,content); };
const copy = name => write(name,fs.readFileSync(path.join(ROOT,name)));
function emitPage(source, outputName, metadata) {
  const dom = new JSDOM(source), doc = dom.window.document;
  if (metadata) {
    doc.title = metadata.title;
    doc.querySelector('h1').textContent = metadata.name;
    doc.querySelector('meta[name="description"]').content = metadata.description;
    doc.querySelector('link[rel="canonical"]').href = metadata.url;
    doc.querySelector('meta[name="robots"]')?.remove();
    for (const [key,value] of [['og:title',metadata.title],['og:description',metadata.description],['og:url',metadata.url]]) doc.querySelector(`meta[property="${key}"]`).content=value;
    for (const [key,value] of [['twitter:title',metadata.title],['twitter:description',metadata.description]]) doc.querySelector(`meta[name="${key}"]`).content=value;
  }
  // Extract inline code so deployed pages can disallow inline scripts and handlers.
  for (const script of doc.querySelectorAll('script:not([src])')) {
    if (script.type && !['module','text/javascript','application/javascript'].includes(script.type)) continue;
    if (!script.textContent.trim()) { script.remove(); continue; }
    const code=script.textContent;
    const digest=crypto.createHash('sha256').update(code).digest('hex').slice(0,20);
    const name=`assets/generated/${digest}.js`;
    write(name,code);script.src='/'+name;script.textContent='';
  }
  const handlers=[];
  for (const element of doc.querySelectorAll('*')) {
    for (const attr of [...element.attributes]) {
      if (!/^on[a-z]+$/.test(attr.name)) continue;
      const id=`event-${handlers.length}`;
      element.setAttribute(`data-${id}`,'');
      handlers.push(`document.querySelector('[data-${id}]').addEventListener(${JSON.stringify(attr.name.slice(2))}, function(event) { const result = (function(event) { ${attr.value}\n }).call(this,event); if (result === false) event.preventDefault(); });`);
      element.removeAttribute(attr.name);
    }
  }
  if (handlers.length) {
    const code=handlers.join('\n');const digest=crypto.createHash('sha256').update(code).digest('hex').slice(0,20);
    const name=`assets/generated/${digest}.js`;write(name,code);
    const script=doc.createElement('script');script.src='/'+name;script.defer=true;doc.body.append(script);
  }
  // Label input controls consistently, including compact filter interfaces.
  for (const control of doc.querySelectorAll('input:not([type=hidden]),select,textarea')) {
    if (!control.getAttribute('aria-label') && !control.labels?.length) control.setAttribute('aria-label',control.getAttribute('placeholder') || control.options?.[0]?.textContent || control.id || 'Input');
  }
  for (const frame of doc.querySelectorAll('iframe:not([title])')) frame.title='Media viewer';
  write(outputName,dom.serialize());dom.window.close();
}
(async()=>{
  fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
  // Explicit public types and directories: never copy source documents, secrets, or review outputs.
  for (const name of ['face.jpg','favicon.ico','apple-touch-icon.png','og-image.jpg','reincarnatedai-app-icon.png','site.webmanifest','robots.txt']) copy(name);
  for (const name of fs.readdirSync(path.join(ROOT,'assets'))) if (/\.(js|css)$/.test(name)) copy('assets/'+name);
  for (const name of fs.readdirSync(path.join(ROOT,'assets/icons'))) if (/\.png$/.test(name)) copy('assets/icons/'+name);
  for (const name of fs.readdirSync(path.join(ROOT,'assets/researcher-portraits'))) if (/\.(jpg|png)$/i.test(name)) copy('assets/researcher-portraits/'+name);
  for (const name of ['9998-screenplay-READER-COPY.pdf','9998-studio-submission-package.pdf']) copy('assets/9998/'+name);
  for (const name of ['research-data.js','book-publications.js','cases-detail-data.js','extended-research-data.js','phenomena-data.js','researchers-data.js','researcher-photos.js','theories-data.js']) copy('data/'+name);
  const pages=fs.readdirSync(ROOT).filter(name=>name.endsWith('.html'));
  for (const name of pages) emitPage(fs.readFileSync(path.join(ROOT,name),'utf8'),name);
  const {caseDetails}=await import('../data/cases-detail-data.js');
  const {extendedResearch,extendedCases}=await import('../data/extended-research-data.js');
  write('data/extended-research.json',JSON.stringify({research:extendedResearch,cases:extendedCases},null,2));
  const template=fs.readFileSync(path.join(ROOT,'case.html'),'utf8');
  for (const c of caseDetails) emitPage(template,`case/${c.id}.html`,{name:c.name,title:`${c.name} — ReincarnatedAI`,description:c.summary.slice(0,180),url:`https://reincarnatedai.com/case/${c.id}`});
  const {researchers}=await import('../data/researchers-data.js');
  const {researcherPhotos}=await import('../data/researcher-photos.js');
  const {libraryItems}=await import('../data/research-data.js');
  const {bookLinks,bookAuthors}=await import('../data/book-publications.js');
  const books=libraryItems.filter(item=>item.kind==='Book');
  const {renderResearcherProfile}=require('./researcher-profile.cjs');
  for (const r of researchers) write(`researcher/${r.id}.html`,renderResearcherProfile(r,researcherPhotos[r.id],books.filter(book=>bookAuthors(book.author).some(author=>author.name===r.name)),bookLinks));
  const urls=pages.filter(p=>!['case.html','bookmarks.html','search.html','journal.html'].includes(p)).map(p=>'https://reincarnatedai.com/'+(p==='index.html'?'':p.slice(0,-5)));
  urls.push(...caseDetails.map(c=>`https://reincarnatedai.com/case/${c.id}`));
  urls.push(...researchers.map(r=>`https://reincarnatedai.com/researcher/${r.id}`));
  const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>`  <url><loc>${url}</loc></url>`).join('\n')+'\n</urlset>\n';
  write('sitemap.xml',sitemap);
  console.log(`Built ${pages.length + caseDetails.length + researchers.length} pages. Public output contains no DOCX files or internal folders.`);
})();
