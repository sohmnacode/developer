import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
function client(){const d=new JSDOM('',{runScripts:'outside-only'});d.window.TextDecoder=TextDecoder;d.window.AbortController=AbortController;d.window.eval(readFileSync('assets/chat-client.js','utf8'));return d;}
const stream=(text,chunkSize=3)=>new Response(new ReadableStream({start(c){const bytes=new TextEncoder().encode(text);for(let i=0;i<bytes.length;i+=chunkSize)c.enqueue(bytes.slice(i,i+chunkSize));c.close()}}),{headers:{'Content-Type':'text/event-stream'}});
test('shared chat parser handles split UTF-8, split frames, and explicit completion',async()=>{
  const d=client();let last='';const text=await d.window.RaiChat.consume(stream('data: {"text":"Hello ✦"}\n\ndata: {"text":" world"}\n\ndata: [DONE]\n\n'),t=>last=t);assert.equal(text,'Hello ✦ world');assert.equal(last,text);d.window.close();
});
test('shared chat parser rejects error events, empty responses, malformed frames, early EOF, and non-200',async()=>{
  const d=client();for(const text of ['data: {"error":"Try again"}\n\ndata: [DONE]\n\n','data: [DONE]\n\n','data: broken\n\n','data: {"text":"Partial"}\n\n'])await assert.rejects(d.window.RaiChat.consume(stream(text),()=>{}));
  await assert.rejects(d.window.RaiChat.consume(new Response('{"error":"Rate limited"}',{status:429}),()=>{}),/Rate limited/);d.window.close();
});
test('chat trims complete context turns without losing the latest question',()=>{
  const d=client();const history=Array.from({length:51},(_,i)=>({role:i%2?'assistant':'user',content:'x'.repeat(1800)}));history.at(-1).content='Latest question';const bounded=d.window.RaiChat.context(history);assert.ok(bounded.length<=23);assert.ok(bounded.reduce((n,m)=>n+m.content.length,0)<=24000);assert.equal(bounded[0].role,'user');assert.equal(bounded.at(-1).content,'Latest question');assert.throws(()=>d.window.RaiChat.context([{role:'user',content:'x'.repeat(6001)}]));d.window.close();
});
