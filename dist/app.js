/* Replace files or use Settings. Each illustration and guide remains a separate layer. */
const ASSETS={
 skull:{file:'01-skull.png',size:[1347,1167],box:[242,121,881,925]},
 bird:{file:'01-bird.png',size:[1397,1126],box:[495,401,432,348]},
 upper:{file:'02-upper-hand.png',size:[1358,1159],box:[379,80,886,1012]},
 lower:{file:'02-lower-hand.png',size:[1328,1184],box:[173,158,974,983]},
 moon:{file:'moon-refined.png',size:[1254,1254],box:[86,93,1085,1085]},
 thorn:{file:'03-thorn.png',size:[1536,1024],box:[54,109,1429,838]},
 feather:{file:'04-feather.png',size:[1536,1024],box:[186,88,1195,865]},
 paper:{file:'04-paper.png',size:[1296,1213],box:[180,191,955,834]}
};
const MODULES={signal:{number:'01',title:'Signal / 在场',copy:'有些对话没有结束，只是换了一种形状。'},touch:{number:'02',title:'Touch / 触碰',copy:'在触碰之前，信号已经抵达。'},echo:{number:'03',title:'Bloom / 共生',copy:'留下声音，也留下生长的空间。'},within:{number:'04',title:'Within / 内里',copy:'那些尚未说出的话，也可以慢慢留下。'}};
function raster(key,x,y,w,h,cls='neutral',rotation=0){const a=ASSETS[key];return `<div class="layer ${cls}" data-layer="${key}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;transform:rotate(${rotation}deg)"><svg viewBox="${a.box.join(' ')}" aria-hidden="true"><image href="assets/${a.file}" width="${a.size[0]}" height="${a.size[1]}"/></svg></div>`;}
const original={
 signal:raster('skull',12,30,71,62)+raster('bird',66,8,16,13,'bird',-12)+raster('bird',89,17,15,12,'bird',13)+raster('bird',74,31,15,12,'bird',-20),
 touch:raster('upper',49,9,48,39)+raster('lower',4,62,59,35)+`<svg class="layer thread" style="inset:0;width:100%;height:100%" viewBox="0 0 138 230" aria-hidden="true"><path d="M82 95C69 109 88 116 73 130S61 149 69 155"/></svg>`,
 echo:raster('moon',19,19,63,67,'moon')+raster('thorn',8,23,87,59),
 within:raster('paper',8,16,29,36,'paper')+raster('feather',24,15,68,78)+`<span class="paper-text" style="left:13%;top:23%">not<br>yet<br>sent</span>`
};
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
let prefs={motion:true,guides:true};let entries=[];let replacements={};let current='home';let toastTimer;
try{prefs={...prefs,...JSON.parse(localStorage.getItem('between-prefs')||'{}')};entries=JSON.parse(localStorage.getItem('between-entries')||'[]');if(!Array.isArray(entries))entries=[];}catch{}
function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2400);}
function savePrefs(){try{localStorage.setItem('between-prefs',JSON.stringify(prefs));}catch{toast('浏览器未允许保存设置。');}applyPrefs();window.dispatchEvent(new Event('between:prefs'));}
function applyPrefs(){document.body.classList.toggle('reduced-motion',!prefs.motion);document.body.classList.toggle('no-guides',!prefs.guides);$('#motion-toggle').setAttribute('aria-checked',String(prefs.motion));$('#guides-toggle').setAttribute('aria-checked',String(prefs.guides));}
function renderArt(id){const el=document.querySelector(`[data-art="${id}"]`);el.replaceChildren();if(replacements[id]){const img=new Image();img.src=replacements[id];img.className='replacement';img.alt='';img.onload=()=>requestAnimationFrame(updateOcclusion);el.append(img);}else el.innerHTML=original[id];requestAnimationFrame(updateOcclusion);}
Object.keys(MODULES).forEach(renderArt);applyPrefs();
function navigate(page){if(!['home','talk','settings'].includes(page))return;if(page===current)return;const old=document.getElementById(`${current}-view`);const next=document.getElementById(`${page}-view`);old.hidden=true;next.hidden=false;next.classList.remove('entering');void next.offsetWidth;next.classList.add('entering');current=page;document.body.dataset.page=page;window.dispatchEvent(new CustomEvent('between:view',{detail:page}));$$('[data-page]').forEach(b=>{if(b.dataset.page===page)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});window.scrollTo({top:0,behavior:'instant'});history.replaceState(null,'','#'+page);if(page==='home')requestAnimationFrame(updateOcclusion);const heading=next.querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));$$('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
$$('[data-category]').forEach(b=>b.addEventListener('click',()=>{$$('[data-category]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const ids={voice:['signal','touch'],memory:['echo'],letters:['within']}[b.dataset.category];$$('[data-module]').forEach(x=>x.classList.toggle('is-current',ids.includes(x.dataset.module)));}));
const dialog=$('#specimen-dialog');let lastTrigger;
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>{lastTrigger=b;const id=b.dataset.open;const m=MODULES[id];$('#detail-number').textContent=`[ ${m.number}* ]`;$('#detail-title').textContent=m.title;$('#detail-copy').textContent=m.copy;const art=document.querySelector(`[data-art="${id}"]`).cloneNode(true);art.removeAttribute('data-art');$('#detail-art').replaceChildren(art);dialog.showModal();}));
$('.close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>lastTrigger?.focus());$('#detail-action').addEventListener('click',()=>{dialog.close();navigate('talk');$('#message').focus();});
$('#motion-toggle').addEventListener('click',()=>{prefs.motion=!prefs.motion;savePrefs();});$('#guides-toggle').addEventListener('click',()=>{prefs.guides=!prefs.guides;savePrefs();});
const dbReady=new Promise((resolve,reject)=>{if(!window.indexedDB)return reject(new Error('不支持本地图片存储'));const request=indexedDB.open('between-assets',1);request.onupgradeneeded=()=>request.result.createObjectStore('images');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
async function dbWrite(key,value){const db=await dbReady;return new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');const store=tx.objectStore('images');if(value)store.put(value,key);else store.delete(key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
async function loadImages(){try{const db=await dbReady;const tx=db.transaction('images','readonly');for(const id of Object.keys(MODULES)){const r=tx.objectStore('images').get(id);r.onsuccess=()=>{if(r.result){replacements[id]=URL.createObjectURL(r.result);renderArt(id);}};}}catch{$('#settings-status').textContent='当前浏览器无法持久保存素材，上传仍可临时预览。';}}
Object.entries(MODULES).forEach(([id,m])=>{const row=document.createElement('div');row.className='asset-row';const num=document.createElement('span');num.textContent=`[${m.number}]`;const title=document.createElement('div');title.textContent=m.title;const label=document.createElement('label');label.textContent='换图';label.htmlFor=`upload-${id}`;const input=document.createElement('input');input.type='file';input.id=`upload-${id}`;input.className='file-input';input.accept='image/png,image/jpeg,image/webp';const reset=document.createElement('button');reset.textContent='还原';reset.setAttribute('aria-label',`还原${m.title}`);input.addEventListener('change',async()=>{const file=input.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)){toast('请选择 PNG、JPG 或 WebP 图片。');input.value='';return;}if(file.size>15*1024*1024){toast('请选择小于 15MB 的图片。');input.value='';return;}const url=URL.createObjectURL(file);const img=new Image();img.src=url;try{await img.decode();}catch{URL.revokeObjectURL(url);toast('图片无法读取，请换一张。');return;}if(replacements[id])URL.revokeObjectURL(replacements[id]);replacements[id]=url;renderArt(id);try{await dbWrite(id,file);$('#settings-status').textContent=`${m.title} 已替换并保存在此浏览器。`;}catch{$('#settings-status').textContent='已临时替换，但浏览器未允许保存图片。';}input.value='';toast('素材已换好，回主菜单看看。');});reset.addEventListener('click',async()=>{try{await dbWrite(id,null);}catch{}if(replacements[id])URL.revokeObjectURL(replacements[id]);delete replacements[id];renderArt(id);toast('已恢复原素材。');});row.append(num,title,label,input,reset);$('#asset-controls').append(row);});
/* Lines are occluded by actual image alpha, not merely placed underneath a translucent PNG.
   Every raster layer contributes an independent black silhouette to a luminance mask.
   The illustrations themselves remain untouched, including their transparent grain. */
function updateOcclusion(){
 if($('#home-view').hidden)return;
 const ns='http://www.w3.org/2000/svg';
 const make=(tag,attrs={})=>{const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));return el;};
 const targets=[$('.geometry'),...$$('.local-lines')];
 targets.forEach((svg,index)=>{
  const box=svg.getBoundingClientRect();if(!box.width||!box.height)return;
  const vb=svg.viewBox.baseVal,sx=vb.width/box.width,sy=vb.height/box.height;
  const maskId=`occlude-${index}`,filterId=`ink-silhouette-${index}`;
  let group=svg.querySelector(':scope > g[data-drawing]');
  if(!group){group=make('g',{'data-drawing':'true'});[...svg.childNodes].forEach(n=>group.append(n));svg.append(group);}
  svg.querySelector(':scope > defs')?.remove();
  const defs=make('defs');const filter=make('filter',{id:filterId,x:'-2%',y:'-2%',width:'104%',height:'104%','color-interpolation-filters':'sRGB'});
  filter.append(make('feColorMatrix',{type:'matrix',values:'0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 8 0'}));
  const dilation=make('feMorphology',{operator:'dilate',radius:'1'});filter.append(dilation);defs.append(filter);
  const mask=make('mask',{id:maskId,maskUnits:'userSpaceOnUse',x:0,y:0,width:vb.width,height:vb.height,style:'mask-type:luminance'});
  mask.append(make('rect',{width:vb.width,height:vb.height,fill:'white'}));
  const scope=index===0?$('#home-view'):svg.parentElement;
  scope.querySelectorAll('.layer:not(.thread)').forEach(layer=>{
   if(parseFloat(getComputedStyle(layer).opacity)<.05)return;const r=layer.getBoundingClientRect();const source=layer.querySelector('svg');if(!source)return;
   const silhouette=source.cloneNode(true);silhouette.removeAttribute('aria-hidden');silhouette.setAttribute('x',(r.left-box.left)*sx);silhouette.setAttribute('y',(r.top-box.top)*sy);silhouette.setAttribute('width',r.width*sx);silhouette.setAttribute('height',r.height*sy);silhouette.style.cssText='overflow:visible';
   silhouette.querySelectorAll('image').forEach(img=>img.setAttribute('filter',`url(#${filterId})`));mask.append(silhouette);
  });
  scope.querySelectorAll('.replacement,.bone-overlay,.within-closed').forEach(img=>{
   if(!img.naturalWidth||parseFloat(getComputedStyle(img).opacity)<.05)return;const r=img.getBoundingClientRect();
   mask.append(make('image',{href:img.src,x:(r.left-box.left)*sx,y:(r.top-box.top)*sy,width:r.width*sx,height:r.height*sy,preserveAspectRatio:'xMidYMid meet',filter:`url(#${filterId})`}));
  });
  if(index===0)scope.querySelectorAll('.masthead,.intro,.edition,.middle-note,.caption,.blue-note,.echo-note,.signal-note,.vertical-note,.quote p,.categories button,h2').forEach(el=>{const r=el.getBoundingClientRect();mask.append(make('rect',{x:(r.left-box.left-2)*sx,y:(r.top-box.top-2)*sy,width:(r.width+4)*sx,height:(r.height+4)*sy,fill:'black'}));});
  defs.append(mask);svg.prepend(defs);group.setAttribute('mask',`url(#${maskId})`);
 });
}
let occlusionTimer;window.addEventListener('resize',()=>{clearTimeout(occlusionTimer);occlusionTimer=setTimeout(updateOcclusion,100);});
window.addEventListener('load',updateOcclusion);document.fonts?.ready.then(updateOcclusion);
loadImages();if(location.hash.slice(1)&&location.hash.slice(1)!=='home')navigate(location.hash.slice(1));

