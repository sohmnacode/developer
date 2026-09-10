(() => {
  const key='rai-saved-searches';
  const form=document.querySelector('.filter-strip'); if(!form) return;
  const save=document.createElement('button'); save.type='button'; save.textContent='Save search';
  const list=document.createElement('select'); list.setAttribute('aria-label','Saved searches'); list.innerHTML='<option value="">Saved searches</option>';
  form.append(save,list);
  const read=()=>JSON.parse(localStorage.getItem(key)||'[]');
  const refresh=()=>{list.innerHTML='<option value="">Saved searches</option>';read().forEach((x,i)=>{const o=document.createElement('option');o.value=i;o.textContent=x.name;list.append(o);});};
  save.addEventListener('click',()=>{const name=prompt('Name this search');if(!name)return;const rows=read();rows.push({name,query:document.querySelector('#researchQuery')?.value||'',domain:document.querySelector('#researchDomain')?.value||'',kind:document.querySelector('#researchKind')?.value||''});localStorage.setItem(key,JSON.stringify(rows));refresh();});
  list.addEventListener('change',()=>{const x=read()[list.value];if(!x)return;document.querySelector('#researchQuery').value=x.query;document.querySelector('#researchDomain').value=x.domain;document.querySelector('#researchKind').value=x.kind;['input','change'].forEach(t=>document.querySelector('#researchQuery').dispatchEvent(new Event(t)));}); refresh();
})();
