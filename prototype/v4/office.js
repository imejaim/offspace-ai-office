import {areas,characters,meta,getArea} from './office-data.js';
const $ = selector => document.querySelector(selector);
const nav = $('#area-nav');
const panel = $('#detail-panel');
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = matchMedia('(max-width: 760px)');
const modalBackground = ['.masthead','#area-nav','.stage','.team-wrap','.scene-tools','.footer','#about-dialog'].map($);
let campus = null;
let selected = null;
let previousFocus = null;
let previousInert = null;
let motionEnabled = !motionQuery.matches;
let exploring = false;

function el(tag, className, text) {
 const node = document.createElement(tag);
 if (className) node.className = className;
 if (text !== undefined) node.textContent = text;
 return node;
}
const navLabel = el('p','nav-label','CHOOSE YOUR SPACE');
navLabel.append(el('span','','01 — 06'));
nav.append(navLabel);
for (const area of areas) {
 const button = el('button','area-button');
 button.dataset.area = area.id;
 button.setAttribute('aria-pressed','false');
 button.setAttribute('aria-controls','detail-panel');
 button.style.setProperty('--area-color',area.color);
 button.append(el('span','area-number',area.number),el('span','area-name',area.name),el('span','area-mark','↗'));
 button.addEventListener('click',()=>selectArea(area.id));
 nav.append(button);
}
for (const character of characters) {
 const wrapper = el('span','team-member');
 wrapper.dataset.name = `${character.name} · ${character.role}`;
 wrapper.title = wrapper.dataset.name;
 const image = el('img');
 image.src = `../assets/characters/transparent/${character.file}`;
 image.alt = `${character.name} · ${character.role}`;
 image.width = 39; image.height = 42;
 wrapper.append(image); $('#team').append(wrapper);
}
function updatePressed() {
 nav.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.area===selected)));
}
function setMobileModalIsolation(enabled) {
 if(enabled && !previousInert) {
  previousInert=new Map(modalBackground.map(node=>[node,node.inert]));
  modalBackground.forEach(node=>{node.inert=true;});
 } else if(!enabled && previousInert) {
  previousInert.forEach((inert,node)=>{node.inert=inert;});
  previousInert=null;
 }
}
function updatePanelMode() {
 const modal=mobileQuery.matches && !panel.hidden;
 panel.setAttribute('role',mobileQuery.matches?'dialog':'region');
 if(modal) {
  if($('#about-dialog').open) $('#about-dialog').close();
  panel.setAttribute('aria-modal','true');
 } else panel.removeAttribute('aria-modal');
 setMobileModalIsolation(modal);
 if(modal && !panel.contains(document.activeElement)) panel.querySelector('.close-panel')?.focus({preventScroll:true});
}
function closePanel({restore=true}={}) {
 panel.hidden = true;
 setMobileModalIsolation(false);
 selected = null;
 updatePressed();
 if (restore && previousFocus?.isConnected) previousFocus.focus({preventScroll:true});
 previousFocus = null;
}
function selectArea(id,{focus=true}={}) {
 const area = getArea(id);
 if (!area) return;
 if (panel.hidden) previousFocus = document.activeElement;
 selected=id;
 panel.replaceChildren();
 panel.dataset.area=id;
 panel.setAttribute('aria-labelledby','detail-title');
 const top=el('div','detail-top');
 top.append(el('span','detail-code',`${area.number} / ${area.english}`));
 const close=el('button','close-panel','×');
 close.setAttribute('aria-label','업무 영역 닫기');
 close.addEventListener('click',()=>closePanel()); top.append(close); panel.append(top);
 const guide=characters.find(c=>c.id===area.guide);
 const image=el('img','detail-guide'); image.src=`../assets/characters/transparent/${guide.file}`;image.alt=guide.name;
 const heading=el('h2','',area.name);heading.id='detail-title';
 panel.append(image,heading,el('p','detail-description',area.description));
 const list=el('div','project-list');
 for (const project of area.projects) {
  const item=el('div','project-item');
  const content=project.url ? el('a') : el('div');
  if(project.url){content.href=project.url;content.target='_blank';content.rel='noopener noreferrer';content.setAttribute('aria-label',`${project.name} · 새 탭에서 열기`);}
  const name=el('strong','project-name',project.name);
  if(project.url) name.append(el('span','','↗'));
  const tag=project.url ? `${project.label} · 새 탭에서 열기 ↗` : project.label;
  content.append(name,el('span','project-description',project.description),el('span','project-tag',tag));
  item.append(content); list.append(item);
 }
 panel.append(list);
 const map=el('div','directory-map'); map.append(el('p','','WORKSPACE DIRECTORY'),el('code','',area.folder));
 if(area.channel) map.append(el('code','channel',`# ${area.channel}`));
 panel.append(map,el('p','detail-note',area.note));
 panel.hidden=false; updatePanelMode(); panel.scrollTop=0; updatePressed();
 $('#announcement').textContent=`${area.name}을 열었습니다.`;
 if(exploring) toggleExploration(false);
 campus?.focus(id);
 if(focus) close.focus({preventScroll:true});
}
function home() {
 closePanel({restore:false});
 toggleExploration(false);
 campus?.home();
 $('#announcement').textContent='전체 캠퍼스를 보고 있습니다.';
}
function setMotion(enabled) {
 motionEnabled=enabled && !motionQuery.matches;
 $('#motion-button').setAttribute('aria-pressed',String(!motionEnabled));
 campus?.setMotion(motionEnabled);
}
function updateHint() {
 $('.interaction-hint').textContent = exploring ? '방향키 / WASD로 산책 · Esc로 종료' : mobileQuery.matches ? '드래그로 회전 · 두 손가락으로 확대 · 건물을 탭' : '드래그로 회전 · 휠로 확대 · 공간을 눌러 방문';
}
function toggleExploration(enabled) {
 exploring=Boolean(enabled && campus && !mobileQuery.matches);
 campus?.setExploration(exploring);
 $('#explore-button').setAttribute('aria-pressed',String(exploring));
 if(exploring){
  closePanel({restore:false}); $('#campus').focus({preventScroll:true});
  $('#announcement').textContent='산책 모드. 방향키 또는 WASD로 헤리를 움직이세요. Escape로 나갑니다.';
 }
 updateHint();
}
$('#home-button').addEventListener('click',home);
$('#motion-button').addEventListener('click',()=>setMotion(!motionEnabled));
$('#explore-button').addEventListener('click',()=>toggleExploration(!exploring));
$('#about-button').addEventListener('click',()=>$('#about-dialog').showModal());
$('#about-close').addEventListener('click',()=>$('#about-dialog').close());
$('#about-dialog').addEventListener('click',event=>{if(event.target===$('#about-dialog')) {const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape') {if(!panel.hidden) closePanel();if(exploring)toggleExploration(false);}
 if(event.key==='Tab' && !panel.hidden && mobileQuery.matches) {
  const tabbable=[...panel.querySelectorAll('button,a[href]')];
  if(!panel.contains(document.activeElement)) {event.preventDefault();(event.shiftKey?tabbable.at(-1):tabbable[0])?.focus();}
  else if(event.shiftKey && document.activeElement===tabbable[0]) {event.preventDefault();tabbable.at(-1).focus();}
  else if(!event.shiftKey && document.activeElement===tabbable.at(-1)) {event.preventDefault();tabbable[0].focus();}
 }
});
motionQuery.addEventListener('change',()=>setMotion(!motionQuery.matches));
mobileQuery.addEventListener('change',()=>{updateHint();if(mobileQuery.matches && exploring)toggleExploration(false);if(!panel.hidden)updatePanelMode();});
setMotion(motionEnabled);
updateHint();
$('#reviewed-date').textContent=`구성 확인 ${meta.reviewedAt.replaceAll('-','.')}`;
window.officeDiagnostics=()=>({version:meta.version,live:meta.live,selected,areas:areas.length,motionEnabled,scene:document.body.dataset.scene,...campus?.getDiagnostics()});
try {
 const {createCampus}=await import('./scene.js');
 campus=await createCampus({canvas:$('#campus'),onSelect:selectArea,onReady:()=>{},reducedMotion:motionQuery.matches});
 setMotion(motionEnabled);
 $('#loading-card').hidden=true;
 document.body.dataset.scene='ready';
} catch(error) {
 console.warn('3D campus unavailable; keeping the public HTML directory.',error.message);
 $('#loading-card').hidden=true;$('#fallback').hidden=false;$('#campus').hidden=true;
 document.body.dataset.scene='fallback';
 $('#home-button').disabled=true;$('#motion-button').disabled=true;$('#explore-button').disabled=true;
}
window.addEventListener('pagehide',event=>{if(!event.persisted)campus?.destroy();});
