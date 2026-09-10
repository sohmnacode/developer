import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import {readBody,createLimiter} from '../lib/request.js';
import research,{researchPayload} from '../api/research.js';
import contact,{contactPayload} from '../api/contact.js';
import submit from '../api/submit.js';
import submissions from '../api/submissions.js';
function res(){const r=new EventEmitter();return Object.assign(r,{code:200,headers:{},output:'',status(n){this.code=n;return this},setHeader(k,v){this.headers[k]=v},json(v){this.body=v;return this},write(v){this.output+=v},end(){this.ended=true}})}
const req=body=>({method:'POST',headers:{'content-type':'application/json',origin:'https://reincarnatedai.com'},socket:{remoteAddress:'127.0.0.1'},body});
test('retired archive routes never invoke external storage or authorize absent secrets',async()=>{
  const old=global.fetch;global.fetch=()=>{throw Error('Unexpected external request')};
  try{for(const handler of [submit,submissions]){const r=res();await handler({method:'GET',query:{}},r);assert.equal(r.code,410)}}finally{global.fetch=old}
});
test('body and research schema reject malformed input before upstream calls',()=>{
  for(const body of [null,[],{},'{bad'])assert.throws(()=>researchPayload(readBody(req(body))));
  for(const messages of [[],[{}],[{role:'system',content:'x'}],[{role:'user',content:7}],[{role:'user',content:'x'.repeat(6001)}]])assert.throws(()=>researchPayload({messages}));
  assert.throws(()=>researchPayload({mode:'__proto__',messages:[{role:'user',content:'Hi'}]}));
  assert.equal(researchPayload({messages:[{role:'user',content:' Hi '}]}).messages[0].content,'Hi');
  assert.throws(()=>readBody(req('x'.repeat(100001))),{status:413});
});
test('form schemas reject invalid types, missing consent and email',()=>{
  assert.throws(()=>contactPayload({name:7,email:'a@b.com',message:'Hi'}));
  assert.throws(()=>contactPayload({name:'A',email:'invalid',message:'Hi'}));
  assert.throws(()=>contactPayload({kind:'experience',type:'NDE',description:{invalid:true}}));
  assert.throws(()=>contactPayload({kind:'digest',email:'a@b.com'}));
  const payload=contactPayload({kind:'experience',type:'NDE',description:'x'.repeat(40),consent:true,consentVersion:'2026-09-10',openToContact:false});
  assert.match(payload.message,/Version 2026-09-10/);assert.match(payload.message,/Open to contact: No/);
});
test('rate limit rejects excess requests with retry and recovers after window',()=>{
  const limit=createLimiter({limit:2,windowMs:1000});let r=res();assert.equal(limit(req({}),r,1000),true);assert.equal(limit(req({}),r,1100),true);assert.equal(limit(req({}),r,1200),false);assert.equal(r.code,429);assert.ok(r.headers['Retry-After']);assert.equal(limit(req({}),res(),2000),true);
});
test('cross-site requests and incorrect methods are rejected without provider calls',async()=>{
  for(const handler of [research,contact]){let r=res();await handler({...req({}),headers:{origin:'https://evil.example'}},r);assert.equal(r.code,403);r=res();await handler({method:'GET'},r);assert.equal(r.code,405)}
});
test('research forwards bounded output, handles stream completion and upstream errors',async()=>{
  const oldFetch=global.fetch,oldKey=process.env.ANTHROPIC_API_KEY;process.env.ANTHROPIC_API_KEY='test-only';
  try{
    let forwarded;
    global.fetch=async(url,options)=>{forwarded=JSON.parse(options.body);return new Response('data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Ready"}}\n\ndata: {"type":"message_stop"}\n\n')};
    let r=res();await research(req({messages:[{role:'user',content:'Test'}]}),r);assert.equal(forwarded.max_tokens,4096);assert.match(r.output,/\[DONE\]/);assert.match(r.output,/Ready/);
    global.fetch=async()=>new Response('data: {"type":"error","error":{"message":"provider secret details"}}\n\n');
    r=res();await research(req({messages:[{role:'user',content:'Test'}]}),r);assert.match(r.output,/interrupted/);assert.doesNotMatch(r.output,/provider secret|\[DONE\]/);
    global.fetch=async()=>new Response('data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Partial"}}\n\n');
    r=res();await research(req({messages:[{role:'user',content:'Test'}]}),r);assert.match(r.output,/interrupted/);assert.doesNotMatch(r.output,/\[DONE\]/);
    global.fetch=async()=>new Response('upstream private error',{status:401});r=res();await research(req({messages:[{role:'user',content:'Test'}]}),r);assert.equal(r.code,502);assert.doesNotMatch(JSON.stringify(r.body),/private/);
  }finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.ANTHROPIC_API_KEY;else process.env.ANTHROPIC_API_KEY=oldKey}
});
test('contact provider failures are controlled and do not reveal provider response',async()=>{
  const old=global.fetch;global.fetch=async()=>new Response(JSON.stringify({success:false,message:'private upstream details'}),{status:400});
  try{const r=res();await contact(req({name:'Test',email:'test@example.com',message:'A test'}),r);assert.equal(r.code,502);assert.doesNotMatch(JSON.stringify(r.body),/private upstream/)}finally{global.fetch=old}
});
