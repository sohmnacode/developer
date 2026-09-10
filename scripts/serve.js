import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import research from '../api/research.js';
import contact from '../api/contact.js';
import retired from '../api/submit.js';
const root = path.resolve('public');
const config = JSON.parse(fs.readFileSync('vercel.json','utf8'));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.webmanifest':'application/manifest+json','.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon'};
const server = http.createServer(async (req,res)=>{
  for(const header of config.headers[0].headers) res.setHeader(header.key,header.value);
  res.status = n => {res.statusCode=n;return res;};
  res.json = body => {res.setHeader('Content-Type','application/json');res.end(JSON.stringify(body));return res;};
  try {
    const url = new URL(req.url,'http://localhost');
    if(url.pathname.startsWith('/api/')) {
      const chunks=[];let bytes=0;
      for await(const chunk of req) {bytes+=chunk.length;if(bytes>100000)return res.status(413).json({error:'Request is too large.'});chunks.push(chunk);}
      req.body=Buffer.concat(chunks).toString();
      if(process.argv.includes('--mock-ai') && url.pathname==='/api/research') {
        res.setHeader('Content-Type','text/event-stream');
        const body=JSON.parse(req.body || '{}');
        if(body.messages?.at(-1)?.content==='__DIAGNOSTIC_ERROR__') res.end('data: {"error":"Diagnostic service interruption. Please retry."}\n\n');
        else res.end('data: {"text":"Local diagnostic response."}\n\ndata: [DONE]\n\n');
        return;
      }
      const handler={'/api/research':research,'/api/contact':contact,'/api/submit':retired,'/api/submissions':retired}[url.pathname];
      return handler ? await handler(req,res) : res.status(404).json({error:'Not found.'});
    }
    const route=decodeURIComponent(url.pathname);
    let file=path.resolve(root,'.'+route);
    if(!file.startsWith(root+path.sep)&&file!==root) {res.statusCode=404;return res.end('Not found');}
    if(route==='/')file=path.join(root,'index.html');
    if(!fs.existsSync(file) && fs.existsSync(file+'.html'))file+='.html';
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end('Not found');}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    if(req.method==='HEAD')return res.end();
    fs.createReadStream(file).pipe(res);
  }catch {if(!res.headersSent)res.statusCode=500;res.end('Request failed');}
});
server.listen(4173,'127.0.0.1',()=>console.log('Local verification site: http://127.0.0.1:4173'));
