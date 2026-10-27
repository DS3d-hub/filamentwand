(()=>{
  'use strict';
  const image=document.getElementById('harbor-counter-image');
  const status=document.getElementById('harbor-counter-status');
  if(!image||!status)return;
  // One image request per page load; filters and photo navigation do not count again.
  // Local previews use a separate counter, never the public site's total.
  const production=location.hostname==='ds3d-hub.github.io'&&/^\/filamentwand(?:\/|$)/.test(location.pathname);
  const path=production?'filamentwand':'filamentwand-vorschau';
  const base='https://hits.sh/ds3d-hub.github.io/'+path;
  const link=document.getElementById('harbor-counter-link');
  link.href=base+'/';
  if(!production)document.getElementById('harbor-counter-note').textContent='Vorschau – zählt keine öffentlichen Hafenbesuche.';
  let settled=false;
  const fail=()=>{if(settled)return;settled=true;image.hidden=true;status.hidden=false;status.textContent='Zähler momentan nicht erreichbar';};
  const timeout=setTimeout(fail,10000);
  image.onload=()=>{if(settled)return;settled=true;clearTimeout(timeout);image.hidden=false;status.hidden=true;};
  image.onerror=()=>{clearTimeout(timeout);fail();};
  // Only a small counter image is requested; no external script or query/filter data is sent.
  image.src=base+'.svg?label=Gesamt&color=176b6b&labelColor=193038&style=flat';
})();
