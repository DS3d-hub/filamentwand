(()=>{
  'use strict';
  const get=id=>document.getElementById(id);
  const audio=get('soundtrack-audio'),button=get('soundtrack-toggle');
  if(!audio||!button)return;
  const seek=get('soundtrack-seek'),elapsed=get('soundtrack-elapsed'),duration=get('soundtrack-duration'),status=get('soundtrack-status');
  const time=value=>{if(!Number.isFinite(value)||value<0)return '–:––';return Math.floor(value/60)+':'+String(Math.floor(value%60)).padStart(2,'0');};
  const sync=()=>{const playing=!audio.paused&&!audio.ended;button.replaceChildren();const icon=document.createElement('span');icon.setAttribute('aria-hidden','true');icon.textContent=playing?'Ⅱ':'▶';button.append(icon,document.createTextNode(playing?' Pause':audio.ended?' Noch einmal abspielen':' Lied abspielen'));};
  const progress=()=>{elapsed.textContent=time(audio.currentTime);duration.textContent=time(audio.duration);seek.disabled=!Number.isFinite(audio.duration)||audio.duration<=0;seek.value=seek.disabled?0:audio.currentTime/audio.duration*100;seek.setAttribute('aria-valuetext',time(audio.currentTime)+' von '+time(audio.duration));};
  audio.volume=0.45;
  get('soundtrack-controls').hidden=false;
  audio.controls=false;
  button.addEventListener('click',async()=>{
    if(!audio.paused){audio.pause();return;}
    if(audio.ended)audio.currentTime=0;
    status.textContent='Lied wird geladen …';
    try{await audio.play();}catch{status.textContent='Das Lied konnte nicht gestartet werden. Bitte prüfe deine Verbindung und versuche es erneut.';sync();}
  });
  audio.addEventListener('playing',()=>{status.textContent='Viel Spaß mit dem Soundtrack deiner Flotte.';sync();});
  audio.addEventListener('pause',()=>{if(!audio.ended)status.textContent='Musik pausiert.';sync();});
  audio.addEventListener('ended',()=>{status.textContent='Das war der Soundtrack deiner Flotte. Noch eine Runde?';sync();progress();});
  audio.addEventListener('waiting',()=>{if(!audio.paused)status.textContent='Lied wird geladen …';});
  audio.addEventListener('error',()=>{status.textContent='Das Lied ist gerade nicht erreichbar. Bitte versuche es später erneut.';sync();});
  audio.addEventListener('loadedmetadata',progress);
  audio.addEventListener('durationchange',progress);
  audio.addEventListener('timeupdate',progress);
  seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration)&&audio.duration>0){audio.currentTime=Number(seek.value)/100*audio.duration;progress();}});
  get('soundtrack-volume').addEventListener('input',event=>{audio.volume=Number(event.target.value);audio.muted=audio.volume===0;});
})();
