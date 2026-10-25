(function(root){
  'use strict';
  const compare=new Intl.Collator('de',{numeric:true,sensitivity:'base'}).compare;
  const normalize=value=>String(value??'').toLowerCase().replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ae/g,'a').replace(/oe/g,'o').replace(/ue/g,'u');
  const matches=(item,state,exclude)=>{
    if(exclude!=='manufacturer'&&state.manufacturer&&item.manufacturer!==state.manufacturer)return false;
    if(exclude!=='material'&&state.material&&item.material!==state.material)return false;
    if(exclude!=='color'&&state.color&&!item.colors.includes(state.color))return false;
    if(exclude!=='type'&&state.type&&!item.types.includes(state.type))return false;
    if(exclude!=='availability'&&state.availability&&(item.availability||'unknown')!==state.availability)return false;
    const haystack=normalize([item.name,item.manufacturer,item.material,...item.colors,...item.types].join(' '));
    return normalize(state.q||'').trim().split(/\s+/).every(term=>haystack.includes(term));
  };
  const filter=(items,state)=>items.filter(item=>matches(item,state));
  const sort=(items,order)=>[...items].sort((a,b)=>order==='name'?compare(a.name,b.name):order==='manufacturer'?compare(a.manufacturer,b.manufacturer)||compare(a.name,b.name):order==='material'?compare(a.material,b.material)||compare(a.name,b.name):a.position-b.position);
  const facet=(items,state,key)=>{
    const counts=new Map();
    items.filter(item=>matches(item,state,key)).forEach(item=>{
      const values=key==='color'?item.colors:key==='type'?item.types:[item[key]];
      values.forEach(value=>counts.set(value,(counts.get(value)||0)+1));
    });
    return counts;
  };
  const isNew=(item,now=new Date())=>{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(item.addedAt||''))return false;
    const added=new Date(item.addedAt+'T00:00:00Z');
    if(!Number.isFinite(added.getTime())||added.toISOString().slice(0,10)!==item.addedAt)return false;
    const parts=new Intl.DateTimeFormat('en',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const part=type=>parts.find(p=>p.type===type).value;
    const today=`${part('year')}-${part('month')}-${part('day')}`;
    const age=(new Date(today+'T00:00:00Z')-added)/86400000;
    return age>=0&&age<9;
  };
  const photoURL=(base,id)=>{const url=new URL(base);url.search='';url.hash='';url.searchParams.set('benchy',id);return url.href;};
  const api={normalize,matches,filter,sort,facet,compare,isNew,photoURL};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CatalogCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
