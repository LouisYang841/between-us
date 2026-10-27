// Artwork states, individual fragment pages and the blue-ink opening sequence.
let artState={tear:false,bones:false,moon:false,opening:0,phase:'full',notes:{}};
try{const saved=JSON.parse(localStorage.getItem('between-art-states')||'{}');for(const k of ['tear','bones','moon'])if(typeof saved[k]==='boolean')artState[k]=saved[k];if(Number.isFinite(saved.opening))artState.opening=Math.max(0,Math.min(100,saved.opening));if(['new','first','full','last'].includes(saved.phase))artState.phase=saved.phase;if(saved.notes&&typeof saved.notes==='object')for(const id of ['signal','touch','echo','within'])if(typeof saved.notes[id]==='string')artState.notes[id]=saved.notes[id].slice(0,1000);}catch{}
const motionAllowed=()=>prefs.motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
function saveArtState(){try{localStorage.setItem('between-art-states',JSON.stringify(artState));return true;}catch{toast('此刻的变化暂时无法保存。');return false;}}
function applyHomeStates(){
 $('.signal').classList.toggle('tear-on',artState.tear);$('.touch').classList.toggle('bones-on',artState.bones);$('.echo').classList.toggle('moon-on',artState.moon);$('.within').classList.toggle('within-on',artState.opening>50);
 document.querySelectorAll('.title-trigger,.hit-area').forEach(b=>{const id=b.dataset.reveal||b.closest('[data-module]')?.dataset.module;const value={signal:artState.tear,touch:artState.bones,echo:artState.moon,within:artState.opening>50}[id];b.setAttribute('aria-pressed',String(value));});requestAnimationFrame(updateOcclusion);
}
const tear=`<svg class="tear-layer" viewBox="0 0 130 172" aria-hidden="true"><path class="tear-stroke" d="M83 100C81 110 85 116 83 124L83 145"/><path class="tear-drop" d="M83 141C83 141 79.8 146 80.2 148C80.8 151 85.2 151 85.8 148C86.2 146 83 141 83 141Z"/></svg>`;
original.signal+=tear;
original.touch+='<img class="bone-overlay" src="assets/bone-hands.png" alt="">';
original.within='<img class="within-art-state within-closed" src="assets/back-intact.png" alt=""><img class="within-art-state within-open" src="assets/back-open.png" alt="">';
Object.keys(MODULES).forEach(renderArt);applyHomeStates();
const definitions={
 signal:{number:'01',en:'Every signal,<br>finds you.',cn:'在场',micro:'A presence, between signals.',note:'有些情绪，先于语言抵达。',placeholder:'这一刻，你想让对方知道什么？'},
 touch:{number:'02',en:'Between<br>a touch.',cn:'触碰',micro:'Not distance, but a way to reach you.',note:'按住，让两端的信号慢慢靠近。',placeholder:'把这一次靠近，留下一句。'},
 echo:{number:'03',en:'A quieter<br>orbit.',cn:'月相',micro:'Under the same changing moon.',note:'轻触月面，让它染上蓝色。',placeholder:'今晚的月亮，让你想起什么？'},
 within:{number:'04',en:'Under<br>the surface.',cn:'内里',micro:'A little room for the unsaid.',note:'向右轻推，看看表面之下。',placeholder:'那些尚未说出的话，可以留在这里。'}
};
const scene=document.createElement('section');scene.id='module-view';scene.className='view scene-page';scene.hidden=true;$('#main').append(scene);
const lines=`<svg class="scene-lines" viewBox="0 0 300 300" aria-hidden="true"><path d="M35 55H239V250H65" stroke-dasharray="2 4"/><path d="M232 60A102 105 0 1 1 67 217"/><path d="M67 217A102 105 0 0 1 232 60" stroke-dasharray="3 5"/><path d="M150 15V51M131 33H169M254 221H277M266 207V236"/><circle cx="232" cy="60" r="2" class="scene-accent"/></svg>`;
function sceneHTML(id){const d=definitions[id];return `<header class="scene-top"><button class="scene-back" aria-label="返回主菜单">← 主菜单</button><span>[ ${d.number}* ] / ${id==='echo'?'MOON':id.toUpperCase()}</span></header><div class="scene-heading"><h1>${d.en}</h1><p>${d.cn}</p></div><div class="scene-stage">${lines}<div class="scene-art"></div><span class="scene-micro">${d.micro}</span></div><p class="scene-note">${d.note}</p><div class="scene-controls"></div><textarea class="scene-note-input" maxlength="1000" rows="2" aria-label="${d.cn}记录" placeholder="${d.placeholder}"></textarea><div class="scene-save-row"><span class="scene-save-status">仅存于此浏览器</span><button class="scene-save">保存这一页 ↗</button></div><button class="scene-nav-talk">想继续和你说说话 ↗</button>`;}
let activeScene=null;
function setArtFlag(key,value){artState[key]=value;saveArtState();applyHomeStates();}
function fillScene(id){
 const stage=scene.querySelector('.scene-art'),controls=scene.querySelector('.scene-controls');
 if(id==='signal'){
  stage.innerHTML='<div class="art">'+original.signal+'</div>';scene.classList.toggle('tear-on',artState.tear);
  const b=document.createElement('button');b.className='scene-action';b.textContent=artState.tear?'把蓝泪收起 —':'让情绪流动 ↗';b.addEventListener('click',()=>{setArtFlag('tear',!artState.tear);scene.classList.toggle('tear-on',artState.tear);b.textContent=artState.tear?'把蓝泪收起 —':'让情绪流动 ↗';});controls.append(b);
 }else if(id==='touch'){
  stage.innerHTML='<div class="art">'+raster('upper',46,2,45,40)+raster('lower',0,60,57,37)+'</div><img class="bone-overlay" style="opacity:.55" src="assets/bone-hands.png" alt="">';
  const b=document.createElement('button');b.className='hold-touch';b.innerHTML='按住，靠近一点<em>hold to connect</em>';scene.querySelector('.scene-stage').append(b);
  const hold=()=>{b.classList.add('is-held');scene.classList.add('is-held');setArtFlag('bones',true);};const release=()=>{b.classList.remove('is-held');scene.classList.remove('is-held');};
  b.addEventListener('pointerdown',e=>{b.setPointerCapture(e.pointerId);hold();});['pointerup','pointercancel','lostpointercapture'].forEach(t=>b.addEventListener(t,release));b.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();hold();}});b.addEventListener('keyup',release);b.addEventListener('blur',release);
  controls.innerHTML='<p class="scene-micro">一次触碰，也可以是一条连接。</p>';
 }else if(id==='echo'){
  const a=ASSETS.moon;
  stage.innerHTML=`<button class="moon-control" aria-label="切换蓝色月面"><span class="lunar-disc"><svg viewBox="${a.box.join(' ')}" aria-hidden="true"><image href="assets/${a.file}" width="${a.size[0]}" height="${a.size[1]}"/></svg></span></button>`;
  const phases=[['new','新月'],['first','上弦'],['full','满月'],['last','下弦']];const row=document.createElement('div');row.className='phase-choices';
  phases.forEach(([value,label])=>{const b=document.createElement('button');b.textContent=label;b.dataset.phase=value;b.setAttribute('aria-pressed',String(artState.phase===value));b.addEventListener('click',()=>{artState.phase=value;saveArtState();applyMoon();});row.append(b);});controls.append(row);
  function applyMoon(){const disc=stage.querySelector('.lunar-disc');disc.classList.toggle('is-blue',artState.moon);disc.style.clipPath=({new:'inset(0 49% 0 49%)',first:'inset(0 0 0 50%)',full:'inset(0)',last:'inset(0 50% 0 0)'})[artState.phase];row.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.phase===artState.phase)));}
  stage.querySelector('.moon-control').addEventListener('click',()=>{setArtFlag('moon',!artState.moon);applyMoon();});applyMoon();
 }else{
  stage.innerHTML='<img class="back-state back-state-closed" src="assets/back-intact.png" alt="完整的背部线稿"><img class="back-state back-state-open" src="assets/back-open.png" alt="显露脊柱的背部线稿">';
  controls.innerHTML='<label class="sr-only" for="opening-slider">揭开程度</label><div class="slider-labels"><span>表面</span><span>内里</span></div><input class="opening-slider" id="opening-slider" type="range" min="0" max="100" value="'+artState.opening+'"><p class="scene-reveal-caption"></p>';
  const slider=controls.querySelector('input');const apply=()=>{const progress=Number(slider.value);stage.querySelector('.back-state-open').style.clipPath=`inset(0 ${50-progress/2}%)`;stage.querySelector('.back-state-closed').style.opacity=String(1-progress/100);controls.querySelector('.scene-reveal-caption').textContent=progress<20?'有些话，藏在表面之下。':progress<80?'慢慢来，看见不必着急。':'也把柔软的一面留给你。';artState.opening=progress;applyHomeStates();};slider.addEventListener('input',apply);slider.addEventListener('change',saveArtState);apply();
 }
}
function showScene(id){
 if(!definitions[id])return;const from=document.querySelector(`[data-art="${id}"]`);const commit=()=>{
  const old=document.getElementById(current+'-view');if(old)old.hidden=true;scene.hidden=false;scene.className='view scene-page scene-'+id;scene.innerHTML=sceneHTML(id);current='module';activeScene=id;document.body.dataset.page='module';history.replaceState(null,'','#piece-'+id);document.querySelectorAll('[data-page]').forEach(b=>{if(b.dataset.page==='home')b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});fillScene(id);
  scene.querySelector('.scene-back').addEventListener('click',()=>navigate('home'));
  const note=scene.querySelector('textarea');note.value=artState.notes[id]||'';
  scene.querySelector('.scene-save').addEventListener('click',()=>{artState.notes[id]=note.value.trim();if(saveArtState()){scene.querySelector('.scene-save-status').textContent='已保存在本机';toast('这一页，留下了。');}});
  scene.querySelector('.scene-nav-talk').addEventListener('click',()=>{navigate('talk');if(note.value.trim()&&!$('#message').value.trim()){$('#message').value=note.value.trim();$('#message').dispatchEvent(new Event('input'));}$('#message').focus();});
  window.scrollTo(0,0);const dest=scene.querySelector('.scene-art');dest.style.viewTransitionName='shared-specimen';scene.classList.add('entering');
 };
 if(document.startViewTransition&&motionAllowed()){from.style.viewTransitionName='shared-specimen';const transition=document.startViewTransition(commit);transition.finished.catch(()=>{}).finally(()=>{from.style.viewTransitionName='';scene.querySelector('.scene-art')?.style.removeProperty('view-transition-name');});}else commit();
}
document.querySelectorAll('[data-open]').forEach(old=>{const b=old.cloneNode(true);old.replaceWith(b);b.setAttribute('aria-label','进入'+definitions[b.dataset.open].cn+'页面');b.addEventListener('click',()=>showScene(b.dataset.open));});
document.querySelectorAll('.specimen h2').forEach(h=>{const id=h.closest('[data-module]').dataset.module;const b=document.createElement('button');b.className='title-trigger';b.dataset.reveal=id;b.textContent=h.textContent;b.setAttribute('aria-label','轻触标题，'+({signal:'流下蓝泪',touch:'手骨缠线',echo:'月亮染蓝',within:'揭开背部'})[id]);h.replaceChildren(b);b.addEventListener('click',()=>{
  if(id==='signal')setArtFlag('tear',!artState.tear);if(id==='touch')setArtFlag('bones',!artState.bones);if(id==='echo')setArtFlag('moon',!artState.moon);if(id==='within'){artState.opening=artState.opening>50?0:100;saveArtState();applyHomeStates();}
  if(motionAllowed()&&id==='signal')document.querySelectorAll('.signal .bird').forEach((el,i)=>el.animate([{translate:'0 0'},{translate:`${5+i*2}px ${-5-i*2}px`},{translate:'0 0'}],{duration:1000,delay:i*70,easing:'ease-out'}));
 });});applyHomeStates();
let growAnimations=[],flowAnimations=[];
function stopFlows(){flowAnimations.forEach(a=>a.cancel());flowAnimations=[];}
function startFlows(){stopFlows();if(!motionAllowed())return;
 document.querySelectorAll('.geometry [id$="-dash"]').forEach((p,i)=>flowAnimations.push(p.animate([{strokeDashoffset:'0'},{strokeDashoffset:'-24'}],{duration:7000+i*1100,iterations:Infinity,easing:'linear'})));
}
function growHome(){growAnimations.forEach(a=>a.cancel());growAnimations=[];if(!motionAllowed()){startFlows();return;}
 document.body.classList.remove('home-growing');void document.body.offsetWidth;document.body.classList.add('home-growing');
 document.querySelectorAll('.geometry path,.local-lines path').forEach((p,i)=>{if(p.closest('defs'))return;let length;try{length=p.getTotalLength();}catch{return;}if(length<6)return;const a=p.animate([{strokeDasharray:`${length} ${length}`,strokeDashoffset:length},{strokeDasharray:`${length} ${length}`,strokeDashoffset:0}],{duration:900,delay:Math.min(i*19,850),easing:'cubic-bezier(.22,1,.36,1)'});growAnimations.push(a);});
 setTimeout(()=>{document.body.classList.remove('home-growing');startFlows();},1850);
}
let introTimers=[],introOverlay;
function endIntro(){introTimers.forEach(clearTimeout);introTimers=[];introOverlay?.remove();introOverlay=null;try{sessionStorage.setItem('between-intro-seen','1');}catch{}if(current==='home')growHome();}
function playIntro(){if(!motionAllowed()){endIntro();return;}if(current!=='home')navigate('home');introTimers.forEach(clearTimeout);introOverlay?.remove();
 const el=document.createElement('div');el.className='intro-overlay';el.setAttribute('role','status');el.setAttribute('aria-label','蓝墨展开，进入主菜单');
 el.innerHTML='<span class="intro-word">BETWEEN / US</span><svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path class="intro-aim" d="M-30 780 195 422 390 -30M-30 160 195 422 440 640"/><circle class="intro-center" cx="195" cy="422" r="3"/><g class="intro-ink"><path d="M195 331C213 322 228 344 237 341L271 321 257 367C266 380 300 372 286 402L325 432 280 444C269 460 292 486 259 489L265 529 224 509C208 519 205 550 188 519L150 537 153 503C133 490 109 516 114 483L72 465 111 438C95 410 65 399 111 388L106 350 150 365C163 351 173 317 195 331Z"/><circle cx="86" cy="339" r="6"/><circle cx="295" cy="357" r="4"/><circle cx="305" cy="510" r="8"/><circle cx="91" cy="533" r="3"/></g></svg><div class="intro-fill"></div><button class="intro-skip">跳过 / SKIP</button>';
 introOverlay=el;document.body.append(el);el.querySelector('button').addEventListener('click',endIntro);requestAnimationFrame(()=>el.classList.add('is-playing'));
 introTimers.push(setTimeout(()=>el.classList.add('is-wiping'),1150),setTimeout(endIntro,1900));
}
const replay=document.createElement('button');replay.className='replay-intro';replay.textContent='重看蓝墨开屏 ↗';replay.addEventListener('click',()=>playIntro());document.querySelector('[aria-labelledby="view-heading"]').append(replay);
const note=document.createElement('p');note.className='motion-setting-note';note.textContent='轻触图像或编号就在菜单里变化，点旁边的小箭头进入片段页。减少动态效果时跳过开屏。';replay.after(note);
window.addEventListener('between:prefs',()=>{if(!motionAllowed()){stopFlows();growAnimations.forEach(a=>a.cancel());if(introOverlay)endIntro();}else startFlows();});
window.addEventListener('between:view',event=>{if(event.detail==='home'){activeScene=null;startFlows();}else stopFlows();});
const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');reducedQuery.addEventListener?.('change',()=>{if(reducedQuery.matches){stopFlows();growAnimations.forEach(a=>a.cancel());if(introOverlay)endIntro();}else startFlows();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFlows();else if(current==='home')startFlows();});
// Initial piece routes are owned by feature-pages.js.
let seen=false;try{seen=sessionStorage.getItem('between-intro-seen')==='1';}catch{}
// Opening and flow initialization are owned by motion-gsap.js.
function fitChatViewport(){if(!window.visualViewport)return;const baseline=window.innerHeight;const keyboard=document.activeElement===$('#message')&&baseline-window.visualViewport.height>100;document.body.classList.toggle('chat-keyboard',keyboard);if(current==='talk'){const desktop=matchMedia('(min-width:700px)').matches;const nav=keyboard?0:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'))||72;const h=window.visualViewport.height-nav-(desktop?24:0);$('#talk-view').style.setProperty('--chat-visible-height',Math.max(220,h)+'px');}else $('#talk-view').style.removeProperty('--chat-visible-height');}
window.visualViewport?.addEventListener('resize',fitChatViewport);window.addEventListener('resize',fitChatViewport);window.addEventListener('between:view',fitChatViewport);$('#message').addEventListener('blur',()=>setTimeout(fitChatViewport,100));fitChatViewport();
