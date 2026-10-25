'use strict';
const $=id=>document.getElementById(id);
const core=window.CatalogCore;
const keys=['manufacturer','material','color','type','availability'];
const labels={manufacturer:'Hersteller',material:'Material',color:'Farbe',type:'Filamentsorte',availability:'Verfügbarkeit'};
const defaults={manufacturer:'Alle Hersteller',material:'Alle Materialien',color:'Alle Farben',type:'Alle Sorten',availability:'Alle Bestände'};
const stockLabels={in_stock:'Vorrätig',sample_only:'Nur Muster',out_of_stock:'Aufgebraucht',unknown:'Bestand noch offen'};
const filterValueLabel=(key,value)=>key==='availability'?stockLabels[value]:value;
const materialGuides={
  PLA:{label:'Deko & Alltag drinnen',description:'Für Figuren, Schilder und viele Alltagsgegenstände im Innenbereich. Bei Wärme oder stärkerer Belastung bitte vorher nachfragen.',icon:'<path d="m3 10 9-7 9 7M5 9v12h14V9M10 21v-7h4v7"/>'},
  PETG:{label:'Robuste Alltagsteile',description:'Für Halterungen, Gehäuse und praktische Teile – auch für Deko geeignet. Wir stimmen das Material auf deinen Einsatzzweck ab.',icon:'<path d="M14 6a5 5 0 0 0-6 6L3 17a3 3 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-4 3-3-3 3-4Z"/>'},
  ASA:{label:'Draußen & wetterfest',description:'Für Teile, die Sonne und Witterung ausgesetzt sind, zum Beispiel Gartendeko. Ob es für dein Teil passt, stimmen wir gemeinsam ab.',icon:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'},
  TPU:{label:'Flexibel & biegsam',description:'Für bewegliche Teile, Schutzkappen und rutschhemmende Füße. Wie weich oder biegsam das Teil wird, hängt von der Sorte und der Form ab.',icon:'<path d="M2 15c3-9 7-9 10-3s7 6 10-3"/>'}
};
materialGuides['PLA+']=materialGuides.PLA;
function materialGuide(material,detailed=false){
  const guide=materialGuides[material];if(!guide)return null;
  const box=element('div',detailed?'material-guide':'material-hint');
  const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.innerHTML=guide.icon;
  const text=element('div');text.append(element(detailed?'strong':'span','',guide.label));if(detailed)text.append(element('p','',guide.description));
  box.append(icon,text);return box;
}
const swatches={'Weiß':'#f4f0e2','Schwarz':'#333a3c','Grau':'#929895','Rot':'#bc4f50','Orange':'#dc9355','Gelb':'#d0ad58','Grün':'#82ac8b','Blau':'#6295b8','Türkis':'#53a2a5','Violett':'#9c7eb5','Rosa':'#dea0b0','Braun':'#9d7a5a','Transparent':'#d8e2e0','Mehrfarbig':'linear-gradient(135deg,#5d9c83,#a079ac,#d9a166)'};
let items=[],state={},visible=[],data,focusedCard=null,photoId=null;
const dialog=$('detail');
const readState=()=>{
  const params=new URLSearchParams(location.search);
  state={q:params.get('suche')||'',sort:params.get('sort')||'collection'};
  keys.forEach(key=>state[key]=params.get(key)||'');
  if(!['collection','name','manufacturer','material'].includes(state.sort))state.sort='collection';
  photoId=params.get('benchy');
};
function writeURL(){
  const params=new URLSearchParams();
  if(state.q)params.set('suche',state.q);
  keys.forEach(key=>{if(state[key])params.set(key,state[key]);});
  if(state.sort!=='collection')params.set('sort',state.sort);
  if(photoId)params.set('benchy',photoId);
  history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);
}
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function setupFilters(){
  keys.forEach(key=>{
    const values=key==='availability'?Object.keys(stockLabels):[...new Set(items.flatMap(item=>key==='color'?item.colors:key==='type'?item.types:[item[key]]))].sort(core.compare);
    if(!values.includes(state[key]))state[key]='';
    const select=$(key);select.replaceChildren(new Option(defaults[key],''));
    values.forEach(value=>select.add(new Option(filterValueLabel(key,value),value)));
    select.disabled=false;select.value=state[key];
    select.onchange=()=>{state[key]=select.value;render();};
  });
}
function card(item,index){
  const button=element('button','card');button.type='button';button.dataset.id=item.id;
  button.setAttribute('aria-label',`${item.name}, ${item.manufacturer}, ${item.material}, ${stockLabels[item.availability]} – Foto groß ansehen`);
  const visual=element('div','card-visual');
  const image=element('img');image.src=item.image;image.alt=`Gedrucktes Benchy: ${item.manufacturer}, ${item.name}`;image.width=item.width;image.height=item.height;image.loading=index<6?'eager':'lazy';image.decoding='async';
  visual.append(image);const watermark=element('span','photo-watermark','DS3d · Meine Filamentwand');watermark.setAttribute('aria-hidden','true');visual.append(watermark);const zoom=element('span','zoom-hint');zoom.setAttribute('aria-hidden','true');zoom.innerHTML='<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6M10 7v6"/></svg>';visual.append(zoom);
  const body=element('div','card-body');const dot=element('span','color-dot');const swatch=item.colors.includes('Mehrfarbig')?swatches.Mehrfarbig:item.colors.length>1?'linear-gradient(135deg,'+item.colors.map(c=>swatches[c]||'#aeb7ae').join(',')+')':swatches[item.colors[0]]||'#aeb7ae';dot.style.setProperty('--swatch',swatch);dot.setAttribute('aria-hidden','true');
  const text=element('div');const stock=element('p',`stock-badge stock-${item.availability}`,stockLabels[item.availability]);text.append(element('h3','card-title',item.name),element('p','card-meta',`${item.manufacturer} · ${item.material}`),stock);if(item.stockNote)text.append(element('p','stock-note',item.stockNote));body.append(dot,text);button.append(visual,body);const guide=materialGuide(item.material);if(guide)button.append(guide);
  button.onclick=()=>{focusedCard=button;showPhoto(item.id);};return button;
}
function render(){
  visible=core.sort(core.filter(items,state),state.sort);
  $('gallery').replaceChildren(...visible.map(card));$('gallery').setAttribute('aria-busy','false');
  $('result-count').textContent=visible.length===items.length?`${items.length} Benchys · ${new Set(items.map(x=>x.manufacturer)).size} Hersteller`:`${visible.length} von ${items.length} Benchys`;
  $('empty').hidden=visible.length>0;$('clear-search').hidden=!state.q;
  $('search').value=state.q;$('sort').value=state.sort;
  keys.forEach(key=>{
    const counts=core.facet(items,state,key),select=$(key);
    [...select.options].forEach(option=>{if(option.value){const n=counts.get(option.value)||0;option.textContent=`${filterValueLabel(key,option.value)} (${n})`;option.disabled=n===0&&option.value!==state[key];}});
    select.value=state[key];
  });
  const active=$('active-filters');active.replaceChildren();
  [...keys,'q'].forEach(key=>{
    if(!state[key])return;
    const value=key==='q'?state[key]:filterValueLabel(key,state[key]);const chip=element('button','filter-chip',(key==='q'?'Suche':labels[key])+': '+value);chip.type='button';chip.setAttribute('aria-label',`${key==='q'?'Suche':labels[key]} ${value} entfernen`);chip.append(element('span','', '×'));chip.onclick=()=>{state[key]='';render();};active.append(chip);
  });
  active.hidden=!active.childElementCount;
  const count=keys.filter(k=>state[k]).length;$('mobile-filter-count').hidden=!count;$('mobile-filter-count').textContent=count;
  writeURL();
}
function showPhoto(id,updateURL=true){
  const item=items.find(x=>x.id===id);if(!item)return;
  photoId=id;
  $('detail-title').textContent=item.name;$('detail-maker').textContent=item.manufacturer;
  $('detail-image').src=item.image;$('detail-image').alt=`${item.name} von ${item.manufacturer}`;
  $('detail-image').parentElement.style.setProperty('--photo-ratio',item.width/item.height);
  $('detail-stock').className=`stock-badge stock-${item.availability}`;$('detail-stock').textContent=stockLabels[item.availability];$('detail-stock').title=item.stockNote||'';
  $('detail-stock-note').textContent=item.stockNote||'';$('detail-stock-note').hidden=!item.stockNote;
  $('detail-tags').replaceChildren(...[item.material,...item.types,...item.colors].map(x=>element('span','',x)));
  const guide=materialGuide(item.material,true);$('detail-material-guide').replaceChildren(...(guide?[guide]:[]));
  const navigation=visible.some(x=>x.id===id)?visible:items;
  $('previous').hidden=$('next').hidden=navigation.length<2;
  if(!dialog.open)dialog.showModal();
  if(updateURL)writeURL();
}
function movePhoto(direction){const list=visible.some(x=>x.id===photoId)?visible:items;const index=list.findIndex(x=>x.id===photoId);showPhoto(list[(index+direction+list.length)%list.length].id);}
function reset(){keys.forEach(k=>state[k]='');state.q='';render();}
async function load(){
  $('load-error').hidden=true;$('gallery').setAttribute('aria-busy','true');
  try{
    const response=await fetch('catalog.json',{cache:'no-store'});if(!response.ok)throw new Error('catalog');data=await response.json();
    items=data.items.map((item,position)=>({...item,availability:Object.hasOwn(stockLabels,item.availability)?item.availability:'unknown',position}));
    const featured=['Minzcoktail – Pastel','Polarblau – Pastel','Rose – Pastel','Azurblau – rPLA','Bronzegold – Silky','Himbeerrot – Silky'];
    items.sort((a,b)=>{let x=featured.indexOf(a.name),y=featured.indexOf(b.name);return (x<0?999:x)-(y<0?999:y)||a.position-b.position;});items.forEach((x,i)=>x.position=i);
    readState();setupFilters();$('search').disabled=false;$('sort').disabled=false;
    const initialPhoto=photoId;render();if(initialPhoto)showPhoto(initialPhoto,false);
    const date=new Intl.DateTimeFormat('de',{dateStyle:'long'}).format(new Date(data.updated+'T12:00:00'));
    $('collection-stats').textContent=`${items.length} Benchys · Stand: ${date}`;
  }catch(error){$('load-error').hidden=false;$('result-count').textContent='Sammlung momentan nicht verfügbar';$('gallery').setAttribute('aria-busy','false');}
}
$('search').addEventListener('input',event=>{state.q=event.target.value;render();});
$('clear-search').onclick=()=>{state.q='';render();$('search').focus();};
$('sort').onchange=event=>{state.sort=event.target.value;render();};
$('reset').onclick=$('empty-reset').onclick=reset;
$('retry').onclick=load;
$('toggle-filters').onclick=()=>{const open=$('toggle-filters').getAttribute('aria-expanded')!=='true';$('toggle-filters').setAttribute('aria-expanded',String(open));$('filter-panel').classList.toggle('is-open',open);};
$('close-detail').onclick=()=>dialog.close();
dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{photoId=null;writeURL();if(focusedCard?.isConnected)focusedCard.focus();});
$('previous').onclick=()=>movePhoto(-1);$('next').onclick=()=>movePhoto(1);
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();movePhoto(-1);}if(event.key==='ArrowRight'){event.preventDefault();movePhoto(1);}});
window.addEventListener('popstate',()=>{readState();render();if(photoId)showPhoto(photoId,false);else if(dialog.open)dialog.close();});
load();
