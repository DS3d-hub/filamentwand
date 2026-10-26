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
const comparison=$('comparison');
let compared=[],comparisonTrigger=null;
const favoriteKey='ds3d-filamentwand-favorites-v1';
let favorites=new Set(),favoriteStorage=true;
try{const saved=JSON.parse(localStorage.getItem(favoriteKey)||'[]');if(Array.isArray(saved))favorites=new Set(saved.filter(id=>typeof id==='string'));}catch{favoriteStorage=false;}
const heartIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
const readState=()=>{
  const params=new URLSearchParams(location.search);
  state={q:params.get('suche')||'',sort:params.get('sort')||'collection',favoritesOnly:state.favoritesOnly||false};
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
  const container=element('article','card');container.dataset.id=item.id;
  const button=element('button','card-open');button.type='button';
  button.setAttribute('aria-label',`${item.name}, ${item.manufacturer}, ${item.material}, ${stockLabels[item.availability]} – Foto groß ansehen`);
  const visual=element('div','card-visual');
  const image=element('img');image.src=item.image;image.alt=`Gedrucktes Benchy: ${item.manufacturer}, ${item.name}`;image.width=item.width;image.height=item.height;image.loading=index<6?'eager':'lazy';image.decoding='async';
  visual.append(image);const watermark=element('span','photo-watermark','DS3d · Meine Filamentwand');watermark.setAttribute('aria-hidden','true');visual.append(watermark);const zoom=element('span','zoom-hint');zoom.setAttribute('aria-hidden','true');zoom.innerHTML='<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6M10 7v6"/></svg>';visual.append(zoom);
  const body=element('div','card-body');const dot=element('span','color-dot');const swatch=item.colors.includes('Mehrfarbig')?swatches.Mehrfarbig:item.colors.length>1?'linear-gradient(135deg,'+item.colors.map(c=>swatches[c]||'#aeb7ae').join(',')+')':swatches[item.colors[0]]||'#aeb7ae';dot.style.setProperty('--swatch',swatch);dot.setAttribute('aria-hidden','true');
  const text=element('div');const stock=element('p',`stock-badge stock-${item.availability}`,stockLabels[item.availability]);text.append(element('h3','card-title',item.name),element('p','card-meta',`${item.manufacturer} · ${item.material}`),stock);if(item.stockNote)text.append(element('p','stock-note',item.stockNote));body.append(dot,text);button.append(visual,body);const guide=materialGuide(item.material);if(guide)button.append(guide);
  if(core.isNew(item))visual.append(element('span','new-badge','Neu'));
  const favorite=element('button','favorite-button');favorite.type='button';favorite.innerHTML=heartIcon;
  favorite.setAttribute('aria-pressed',String(favorites.has(item.id)));
  favorite.setAttribute('aria-label',`${item.name} ${favorites.has(item.id)?'aus der Merkliste entfernen':'merken'}`);
  favorite.onclick=()=>toggleFavorite(item.id);
  const compare=element('button','compare-pick',compared.includes(item.id)?'✓ Im Vergleich':'+ Vergleichen');compare.type='button';
  compare.setAttribute('aria-label',`${item.name} ${compared.includes(item.id)?'aus dem Vergleich entfernen':'vergleichen'}`);compare.setAttribute('aria-pressed',String(compared.includes(item.id)));
  compare.disabled=compared.length===4&&!compared.includes(item.id);compare.onclick=()=>toggleComparison(item.id);
  button.onclick=()=>{focusedCard=button;showPhoto(item.id);};container.append(button,favorite,compare);return container;
}
function toggleComparison(id){
  if(!items.some(item=>item.id===id))return;
  if(compared.includes(id))compared=compared.filter(value=>value!==id);
  else if(compared.length<4)compared.push(id);else return;
  render();
  if(!dialog.open&&!comparison.open){const card=[...$('gallery').children].find(node=>node.dataset.id===id);(card?.querySelector('.compare-pick')||$('open-comparison')).focus();}
}
function syncComparison(){
  const selected=compared.map(id=>items.find(item=>item.id===id)).filter(Boolean);
  $('compare-tray').hidden=!selected.length;document.body.classList.toggle('has-comparison',!!selected.length);
  $('compare-count').textContent=`${selected.length} von 4 Farben`;$('open-comparison').disabled=selected.length<2;
  $('compare-status').textContent=selected.length===4?'Vier Farben ausgewählt. Entferne eine Farbe, um eine andere hinzuzufügen.':selected.length===1?'Wähle noch eine Farbe für deine Kombination.':'';
  $('compare-selection').replaceChildren(...selected.map(item=>{const chip=element('button','filter-chip',item.name+' ×');chip.type='button';chip.setAttribute('aria-label',`${item.name} aus der Auswahl entfernen`);chip.onclick=()=>toggleComparison(item.id);return chip;}));
  const saved=compared.includes(photoId);$('detail-compare').textContent=saved?'✓ Im Vergleich':'+ Vergleichen';$('detail-compare').setAttribute('aria-pressed',String(saved));$('detail-compare').disabled=selected.length===4&&!saved;
  $('comparison-hint').textContent=selected.length<2?'Wähle in der Galerie mindestens zwei Farben aus.':'So wirken deine Farben nebeneinander. Für eine andere Kombination kannst du einzelne Farben entfernen und weitere auswählen.';
  const grid=$('comparison-grid');grid.style.setProperty('--compare-columns',Math.max(2,selected.length));
  grid.replaceChildren(...selected.map(item=>{
    const panel=element('article','comparison-card');
    const visual=element('div','card-visual');const img=element('img');img.src=item.image;img.alt=`${item.name} von ${item.manufacturer}`;img.width=item.width;img.height=item.height;
    const watermark=element('span','photo-watermark','DS3d · Meine Filamentwand');watermark.setAttribute('aria-hidden','true');visual.append(img,watermark);
    const info=element('div','comparison-info');info.append(element('h3','card-title',item.name),element('p','card-meta',`${item.manufacturer} · ${item.material}`),element('p','comparison-type',item.types.join(' · ')),element('p',`stock-badge stock-${item.availability}`,stockLabels[item.availability]));
    if(item.stockNote)info.append(element('p','stock-note',item.stockNote));
    const remove=element('button','compare-remove','Entfernen');remove.type='button';remove.setAttribute('aria-label',`${item.name} aus dem Farbvergleich entfernen`);remove.onclick=()=>{toggleComparison(item.id);$('close-comparison').focus();};info.append(remove);panel.append(visual,info);return panel;
  }));
}
function syncFavoriteControls(){
  $('favorites-count').textContent=items.filter(item=>favorites.has(item.id)).length;
  $('favorites-view').setAttribute('aria-pressed',String(!!state.favoritesOnly));
  $('favorites-help').textContent=favoriteStorage?'Deine Merkliste wird nur in diesem Browser auf deinem Gerät gespeichert.':'Deine Merkliste gilt nur für diesen Besuch, weil der Browser das Speichern nicht erlaubt.';
  const saved=favorites.has(photoId);$('detail-favorite').setAttribute('aria-pressed',String(saved));$('detail-favorite-label').textContent=saved?'Gemerkt':'Merken';
}
function toggleFavorite(id){
  if(favorites.has(id))favorites.delete(id);else favorites.add(id);
  try{localStorage.setItem(favoriteKey,JSON.stringify([...favorites]));favoriteStorage=true;}catch{favoriteStorage=false;}
  render();
  if(!dialog.open){const replacement=[...$('gallery').children].find(node=>node.dataset.id===id);(replacement?.querySelector('.favorite-button')||$('favorites-view')).focus();}
}
function render(){
  const source=state.favoritesOnly?items.filter(item=>favorites.has(item.id)):items;
  visible=core.sort(core.filter(source,state),state.sort);
  $('gallery').replaceChildren(...visible.map(card));$('gallery').setAttribute('aria-busy','false');
  $('result-count').textContent=visible.length===items.length?`${items.length} Benchys · ${new Set(items.map(x=>x.manufacturer)).size} Hersteller`:`${visible.length} von ${items.length} Benchys`;
  $('empty').hidden=visible.length>0;$('clear-search').hidden=!state.q;
  $('empty-title').textContent=state.favoritesOnly&&!source.length?'Deine Merkliste wartet auf ihre ersten Farben.':'Hier liegt gerade kein Boot vor Anker.';
  $('empty-description').textContent=state.favoritesOnly&&!source.length?'Tippe auf das Herz an einem Benchy, um dir die Farbe für später zu merken.':'Für diese Auswahl gibt es noch keinen Treffer. Probiere einen anderen Suchbegriff oder setze die Filter zurück.';
  $('search').value=state.q;$('sort').value=state.sort;
  keys.forEach(key=>{
    const counts=core.facet(source,state,key),select=$(key);
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
  syncFavoriteControls();syncComparison();writeURL();
}
function showPhoto(id,updateURL=true){
  const item=items.find(x=>x.id===id);if(!item)return;
  photoId=id;
  $('detail-new').hidden=!core.isNew(item);$('share-status').textContent='';$('share-fallback').hidden=true;syncFavoriteControls();syncComparison();
  $('detail-title').textContent=item.name;$('detail-maker').textContent=item.manufacturer;
  $('detail-image').src=item.image;$('detail-image').alt=`${item.name} von ${item.manufacturer}`;
  $('detail-image').parentElement.style.setProperty('--photo-ratio',item.width/item.height);
  $('detail-stock').className=`stock-badge stock-${item.availability}`;$('detail-stock').textContent=stockLabels[item.availability];$('detail-stock').title=item.stockNote||'';
  $('detail-stock-note').textContent=item.stockNote||'';$('detail-stock-note').hidden=!item.stockNote;
  $('detail-tags').replaceChildren(...[item.material,...item.types,...item.colors].map(x=>element('span','',x)));
  let shopUrl=null;try{const url=new URL(item.shopUrl);if(url.protocol==='https:')shopUrl=url.href;}catch{/* Entries without a checked shop link keep this section hidden. */}
  $('detail-shop').hidden=!shopUrl;
  if(shopUrl){$('detail-shop-link').href=shopUrl;$('detail-shop-link').setAttribute('aria-label',`${item.name} im offiziellen Shop ansehen (öffnet in neuem Tab)`);$('detail-shop-color').textContent=`Im Shop: ${item.shopProduct} · ${item.shopColor}`;}
  else $('detail-shop-link').removeAttribute('href');
  const guide=materialGuide(item.material,true);$('detail-material-guide').replaceChildren(...(guide?[guide]:[]));
  const navigation=visible.some(x=>x.id===id)?visible:items;
  $('previous').hidden=$('next').hidden=navigation.length<2;
  if(!dialog.open)dialog.showModal();
  if(updateURL)writeURL();
}
function movePhoto(direction){const list=visible.some(x=>x.id===photoId)?visible:items;const index=list.findIndex(x=>x.id===photoId);showPhoto(list[(index+direction+list.length)%list.length].id);}
function reset(){keys.forEach(k=>state[k]='');state.q='';state.favoritesOnly=false;render();}
async function sharePhoto(){
  const id=photoId;if(!id)return;
  const url=core.photoURL(location.href,id);$('share-status').textContent='';$('share-fallback').hidden=true;
  try{await navigator.clipboard.writeText(url);if(photoId===id)$('share-status').textContent='Link kopiert – du kannst ihn jetzt verschicken.';}
  catch{if(photoId===id){$('share-link').value=url;$('share-fallback').hidden=false;$('share-status').textContent='Kopiere diesen Link und verschicke ihn.';$('share-link').focus();$('share-link').select();}}
}
async function load(){
  $('load-error').hidden=true;$('gallery').setAttribute('aria-busy','true');
  try{
    const response=await fetch('catalog.json',{cache:'no-store'});if(!response.ok)throw new Error('catalog');data=await response.json();
    items=data.items.map((item,position)=>({...item,availability:Object.hasOwn(stockLabels,item.availability)?item.availability:'unknown',position}));
    const featured=['Minzcoktail – Pastel','Polarblau – Pastel','Rose – Pastel','Azurblau – rPLA','Bronzegold – Silky','Himbeerrot – Silky'];
    items.sort((a,b)=>{let x=featured.indexOf(a.name),y=featured.indexOf(b.name);return (x<0?999:x)-(y<0?999:y)||a.position-b.position;});items.forEach((x,i)=>x.position=i);
    readState();setupFilters();$('search').disabled=false;$('sort').disabled=false;$('favorites-view').disabled=false;
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
$('favorites-view').onclick=()=>{state.favoritesOnly=!state.favoritesOnly;render();};
$('detail-favorite').onclick=()=>toggleFavorite(photoId);
$('share-photo').onclick=sharePhoto;
$('detail-compare').onclick=()=>toggleComparison(photoId);
$('open-comparison').onclick=()=>{if(compared.length<2)return;comparisonTrigger=$('open-comparison');syncComparison();comparison.showModal();};
$('clear-comparison').onclick=()=>{compared=[];render();};
$('close-comparison').onclick=()=>comparison.close();
comparison.addEventListener('close',()=>{if(comparisonTrigger?.isConnected&&!comparisonTrigger.disabled)comparisonTrigger.focus();else $('search').focus();});
comparison.addEventListener('click',event=>{if(event.target===comparison){const box=comparison.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)comparison.close();}});
window.addEventListener('storage',event=>{if(event.key!==favoriteKey&&event.key!==null)return;try{const saved=JSON.parse(event.newValue||'[]');favorites=new Set(Array.isArray(saved)?saved.filter(id=>typeof id==='string'):[]);if(items.length)render();}catch{/* Keep the current list if another tab stores invalid data. */}});
$('toggle-filters').onclick=()=>{const open=$('toggle-filters').getAttribute('aria-expanded')!=='true';$('toggle-filters').setAttribute('aria-expanded',String(open));$('filter-panel').classList.toggle('is-open',open);};
$('close-detail').onclick=()=>dialog.close();
dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{photoId=null;writeURL();if(focusedCard?.isConnected)focusedCard.focus();});
$('previous').onclick=()=>movePhoto(-1);$('next').onclick=()=>movePhoto(1);
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();movePhoto(-1);}if(event.key==='ArrowRight'){event.preventDefault();movePhoto(1);}});
window.addEventListener('popstate',()=>{readState();render();if(photoId)showPhoto(photoId,false);else if(dialog.open)dialog.close();});
load();
