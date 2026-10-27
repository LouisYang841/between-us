/* GSAP 3.15 — authored per-fragment timelines, masked ink wipe and growing geometry.
 * Guidance: greensock/gsap-skills (core, timeline, plugins, performance).
 * Bitmap states are revealed in independent layers; SVG contours genuinely morph.
 */
(() => {
 const G=window.gsap;if(!G){console.warn('GSAP unavailable; simple motion remains enabled.');return;}
 G.registerPlugin(MorphSVGPlugin,DrawSVGPlugin,MotionPathPlugin);
 document.body.classList.add('gsap-motion');
 // Interactive artwork starts in its intact, uncoloured state on each page load.
 artState.tear=false;artState.bones=false;artState.moon=false;artState.opening=0;applyHomeStates();
 const NS='http://www.w3.org/2000/svg';
 const element=(tag,attrs={})=>{const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));return el;};
 const defs=element('svg',{class:'motion-svg-defs','aria-hidden':'true'});
 defs.innerHTML='<defs><clipPath id="reveal-bones" clipPathUnits="objectBoundingBox"><path id="bone-reveal-path" d="M.49 .48C.51 .47 .52 .49 .51 .51C.50 .53 .48 .51 .49 .48Z"/></clipPath><clipPath id="reveal-moon" clipPathUnits="objectBoundingBox"><path id="moon-reveal-path" d="M.23 .56C.24 .53 .28 .54 .28 .57C.27 .60 .23 .59 .23 .56Z"/></clipPath><clipPath id="reveal-back" clipPathUnits="objectBoundingBox"><path id="back-reveal-path" d="M.50 .44C.505 .44 .505 .47 .50 .48C.495 .47 .495 .44 .50 .44Z"/></clipPath><mask id="cover-back" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1" style="mask-type:luminance"><rect width="1" height="1" fill="white"/><path id="back-cover-path" fill="black" d="M.50 .44C.505 .44 .505 .47 .50 .48C.495 .47 .495 .44 .50 .44Z"/></mask></defs>';
 document.body.prepend(defs);
 const timelines=new Map();let openingTL=null,growingTL=null,ambient=[];
 const full='M-.12 -.12C.3 -.18 .82 -.1 1.12 -.12C1.18 .3 1.12 .76 1.12 1.12C.75 1.18 .3 1.12 -.12 1.12C-.18 .8 -.12 .28 -.12 -.12Z';
 const backOpen='M.50 .15C.58 .17 .63 .24 .67 .31C.65 .35 .76 .39 .72 .44C.80 .51 .72 .55 .74 .61C.67 .65 .69 .74 .61 .78C.57 .86 .52 .92 .48 .94C.43 .86 .34 .83 .33 .76C.26 .70 .31 .64 .24 .59C.30 .53 .21 .47 .29 .42C.27 .35 .36 .32 .37 .25C.41 .23 .45 .17 .50 .15Z';
 const boneStart=defs.querySelector('#bone-reveal-path').getAttribute('d');
 const moonStart=defs.querySelector('#moon-reveal-path').getAttribute('d');
 const backStart=defs.querySelector('#back-reveal-path').getAttribute('d');
 function setupLayers(){
  const signal=$('[data-art="signal"]');if(signal&&!signal.querySelector('.tear-attachment')){signal.querySelector('.tear-layer')?.remove();const svg=signal.querySelector('[data-layer="skull"] svg');if(svg){const tear=element('g',{class:'tear-attachment'});tear.innerHTML='<path class="tear-stroke" d="M978 546C975 575 988 594 987 627C986 671 981 703 987 744"/><path class="falling-tear" d="M0 -17C-8 -4 -16 7 -12 16C-8 29 12 29 16 16C20 7 7 -6 0 -17Z"/>';svg.append(tear);}}
  const touch=$('[data-art="touch"]');if(touch&&!touch.querySelector('.wrap-thread')){
   touch.querySelector('.thread')?.remove();
   const back=element('svg',{class:'wrap-thread wrap-thread-back',viewBox:'0 0 138 230','aria-hidden':'true'});
   back.innerHTML='<path d="M99 39C95 26 122 23 125 39"/><path d="M96 45C92 33 120 30 124 46"/><path d="M23 181C18 168 45 165 49 182"/><path d="M20 188C15 175 42 172 46 189"/><path d="M120 44C118 73 88 87 79 108C70 129 55 154 44 182"/>';
   const front=element('svg',{class:'wrap-thread wrap-thread-front',viewBox:'0 0 138 230','aria-hidden':'true'});
   front.innerHTML='<path class="upper-coil" d="M125 39C123 49 106 48 99 39"/><path class="upper-coil" d="M124 46C120 55 103 53 96 45"/><path class="connection-a" d="M79 108C83 114 68 117 69 127"/><path class="connection-b" d="M80 109C85 115 71 120 69 127"/><path class="lower-coil" d="M49 182C45 192 29 190 23 181"/><path class="lower-coil" d="M46 189C42 198 25 196 20 188"/>';
   touch.prepend(back);touch.append(front);
  }
  if(touch&&!touch.querySelector('.touch-ripple')){const ripple=document.createElement('i');ripple.className='touch-ripple';touch.append(ripple);}
  const moon=$('.echo .moon');if(moon&&!$('.echo .moon-bloom')){const clone=moon.cloneNode(true);clone.classList.add('moon-bloom');clone.style.clipPath='url(#reveal-moon)';moon.after(clone);const pulse=document.createElement('i');pulse.className='moon-contact';moon.parentElement.append(pulse);}
  const back=$('[data-art="within"]');if(back&&!back.querySelector('.back-edge-layer')){const svg=element('svg',{class:'back-edge-layer',viewBox:'0 0 150 112'});svg.innerHTML='<path class="edge-left" d="M74 23C62 33 64 48 74 58"/><path class="edge-right" d="M76 23C90 32 88 48 76 58"/>';back.append(svg);}
  if(back&&!back.querySelector('.back-hand-tug')){
   [['top','470 0 510 420'],['left','140 920 520 334'],['right','780 710 474 544']].forEach(([part,box])=>{const layer=document.createElement('div');layer.className='back-hand-tug back-hand-'+part;const svg=element('svg',{viewBox:box,'aria-hidden':'true'});svg.append(element('image',{href:'assets/back-open.png',width:1254,height:1254}));layer.append(svg);back.append(layer);});
  }
 }
 setupLayers();
 function makeTimeline(id){
  const root=document.querySelector('.specimen.'+id);if(!root||replacements[id])return null;
  const tl=G.timeline({paused:true,defaults:{ease:'power2.inOut'},onComplete:()=>requestAnimationFrame(updateOcclusion),onReverseComplete:()=>requestAnimationFrame(updateOcclusion)});
  if(id==='signal'){
   const stroke=root.querySelector('.tear-stroke'),drop=root.querySelector('.falling-tear'),skull=root.querySelector('[data-layer=skull]');
   tl.addLabel('gather',0).fromTo(skull,{y:0,rotation:0},{y:-1.8,rotation:-1.3,duration:.48},'gather')
    .fromTo(stroke,{drawSVG:'0% 0%'},{drawSVG:'0% 100%',duration:1.02,ease:'power1.in'},.15)
    .fromTo(drop,{autoAlpha:0,x:978,y:546,scale:.45},{autoAlpha:1,scale:1,duration:.25},.27)
    .to(drop,{motionPath:{path:'M978 546C975 597 992 679 987 767',autoRotate:false},duration:1.12,ease:'power2.in'},.32)
    .to(drop,{scaleY:1.4,scaleX:.75,autoAlpha:0,duration:.2},1.25)
    .to(skull,{y:0,rotation:0,duration:.6,ease:'sine.out'},.7);
   root.querySelectorAll('.bird').forEach((bird,i)=>{const angle=Number(G.getProperty(bird,'rotation'))||0;tl.to(bird,{x:4+i*2,y:-4-i*2,rotation:angle+7,duration:.5,ease:'power2.out'},.35+i*.08).to(bird,{x:0,y:0,rotation:angle,duration:.7,ease:'sine.out'},.85+i*.06);});
  }else if(id==='touch'){
   const upper=root.querySelector('[data-layer=upper]'),lower=root.querySelector('[data-layer=lower]'),bones=root.querySelector('.bone-overlay'),ripple=root.querySelector('.touch-ripple');
   const upperCoils=root.querySelectorAll('.upper-coil'),lowerCoils=root.querySelectorAll('.lower-coil'),bridges=root.querySelectorAll('.connection-a,.connection-b'),backCoils=root.querySelectorAll('.wrap-thread-back path');
   tl.fromTo(upper,{opacity:.68,x:0,y:0,rotation:0},{x:-3,y:5,rotation:-5,duration:.48},0)
    .fromTo(lower,{opacity:.68,x:0,y:0,rotation:0},{x:4,y:-5,rotation:4,duration:.48},.08)
    .fromTo(backCoils,{drawSVG:'0% 0%'},{drawSVG:'0% 100%',stagger:.28,duration:.95,ease:'none'},.12)
    .fromTo(upperCoils,{drawSVG:'0% 0%'},{drawSVG:'0% 100%',stagger:.16,duration:.75,ease:'sine.inOut'},.1)
    .fromTo(bridges,{drawSVG:'0% 0%'},{drawSVG:'0% 100%',stagger:.12,duration:1.08,ease:'sine.inOut'},.65)
    .fromTo(lowerCoils,{drawSVG:'0% 0%'},{drawSVG:'0% 100%',stagger:.16,duration:.8,ease:'sine.out'},1.35)
    .fromTo(ripple,{autoAlpha:0,scale:.2},{autoAlpha:.55,scale:1.7,duration:.6,ease:'power2.out'},.24)
    .to(ripple,{autoAlpha:0,scale:2.2,duration:.4},.64)
    .fromTo(bones,{autoAlpha:0,y:3},{autoAlpha:.86,y:0,duration:1.05},.85)
    .fromTo('#bone-reveal-path',{attr:{d:boneStart}},{morphSVG:{shape:full,curveMode:true},duration:1.3,ease:'power2.out'},.85)
    .to([upper,lower],{opacity:0,duration:.85,stagger:.08},1.14);
  }else if(id==='echo'){
   const pulse=root.querySelector('.moon-contact'),thorn=root.querySelector('[data-layer=thorn]');
   tl.fromTo('#moon-reveal-path',{attr:{d:moonStart}},{morphSVG:{shape:'M.04 .36C.16 .08 .53 -.03 .81 .16C1.04 .33 1.03 .73 .78 .92C.51 1.12 .12 .98 .02 .71C-.03 .57 -.02 .44 .04 .36Z',type:'rotational',shapeIndex:0},duration:.7,ease:'power2.out'},0)
    .to('#moon-reveal-path',{morphSVG:full,duration:.65,ease:'sine.out'},.53)
    .fromTo(pulse,{autoAlpha:.8,scale:.1},{autoAlpha:0,scale:5,duration:1,ease:'power2.out'},0);
   if(thorn)tl.fromTo(thorn,{rotation:0,x:0},{rotation:4,x:1,duration:.5,ease:'sine.out'},.08).to(thorn,{rotation:0,x:0,duration:.7,ease:'sine.inOut'},.54);
  }else{
   const open=root.querySelector('.within-open'),closed=root.querySelector('.within-closed'),edges=root.querySelector('.back-edge-layer');
   if(!open||!closed)return null;
   tl.fromTo(open,{autoAlpha:.86},{autoAlpha:.86,duration:.1},0)
    .fromTo(root.querySelector('.back-hand-top'),{autoAlpha:0,x:0,y:3},{autoAlpha:.8,x:0,y:-2,duration:.65,ease:'power2.out'},.02)
    .fromTo(root.querySelector('.back-hand-left'),{autoAlpha:0,x:2,y:0,rotation:0},{autoAlpha:.75,x:-3,y:2,rotation:-4,duration:.95,ease:'power2.inOut'},.14)
    .fromTo(root.querySelector('.back-hand-right'),{autoAlpha:0,x:-2,y:0,rotation:0},{autoAlpha:.75,x:3,y:1,rotation:4,duration:.95,ease:'power2.inOut'},.18)
    .fromTo(['#back-reveal-path','#back-cover-path'],{attr:{d:backStart}},{morphSVG:{shape:'M.49 .25C.59 .27 .61 .4 .60 .52C.61 .68 .54 .82 .49 .85C.40 .80 .36 .64 .38 .51C.36 .39 .40 .28 .49 .25Z',curveMode:true},duration:.56},.06)
    .to(['#back-reveal-path','#back-cover-path'],{morphSVG:{shape:backOpen,curveMode:true},duration:.8,ease:'power3.out'},.57)
    .fromTo(edges,{autoAlpha:0},{autoAlpha:.8,duration:.25},.18)
    .fromTo(root.querySelector('.edge-left'),{drawSVG:0},{drawSVG:'100%',morphSVG:'M74 18C39 33 32 70 59 99',duration:.94},.22)
    .fromTo(root.querySelector('.edge-right'),{drawSVG:0},{drawSVG:'100%',morphSVG:'M76 18C112 36 119 72 88 99',duration:.94},.28)
    .to(edges,{autoAlpha:0,duration:.35},1.18)
    .fromTo(closed,{scaleX:1,rotation:0},{scaleX:1.045,rotation:-.5,duration:.6},.12).to(closed,{scaleX:1.015,rotation:0,duration:.75},.67);
  }
  return tl;
 }
 function keyState(id){return ({signal:artState.tear,touch:artState.bones,echo:artState.moon,within:artState.opening>50})[id];}
 function timelineFor(id){if(!timelines.has(id)){const tl=makeTimeline(id);if(tl){timelines.set(id,tl);tl.progress(keyState(id)?1:0).pause();}}return timelines.get(id);}
 ['signal','touch','echo','within'].forEach(timelineFor);
 let selectedTile=null;
 function activate(id){
  if(selectedTile===id){showScene(id);return;}
  if(selectedTile){const previous=selectedTile;const oldTL=timelineFor(previous);if(previous==='signal')artState.tear=false;if(previous==='touch')artState.bones=false;if(previous==='echo')artState.moon=false;if(previous==='within')artState.opening=0;if(oldTL){if(motionAllowed())oldTL.reverse();else oldTL.progress(0).pause();}}
  selectedTile=id;
  document.querySelectorAll(".specimen").forEach(el=>el.classList.toggle("is-selected",el.dataset.module===id));
  const next=true,tl=timelineFor(id);
  if(id==='signal')artState.tear=next;if(id==='touch')artState.bones=next;if(id==='echo')artState.moon=next;if(id==='within')artState.opening=next?100:0;
  saveArtState();applyHomeStates();
  if(tl){if(!motionAllowed())tl.progress(next?1:0).pause();else if(next)tl.play();else tl.reverse();}
 }
 // First image tap selects and animates; the second opens its room.
 document.querySelectorAll('.hit-area,.title-trigger').forEach(old=>{const b=old.cloneNode(true);old.replaceWith(b);const id=b.closest('[data-module]').dataset.module;b.setAttribute('aria-label',({signal:'轻触头骨，流下蓝泪',touch:'轻触双手，白骨缠线',echo:'轻触月亮，晕染成蓝',within:'轻触背部，揭开内里'})[id]);b.addEventListener('click',()=>activate(id));});
 document.querySelectorAll('.specimen .caption').forEach(p=>{const id=p.closest('[data-module]').dataset.module,button=document.createElement('button');button.className='module-enter';button.type='button';button.setAttribute('aria-label','进入'+definitions[id].cn+'片段');button.append(document.createTextNode(p.textContent+' '));const icon=element('svg',{viewBox:'0 0 12 12','aria-hidden':'true'});icon.append(element('path',{d:'M3 9 9 3M3 3h6v6'}));button.append(icon);button.addEventListener('click',()=>showScene(id));p.replaceChildren(button);});
 // Detail pages display the state already created by the click; they are not adjustment panels.
 const priorFill=fillScene;
 fillScene=function(id){priorFill(id);const controls=scene.querySelector('.scene-controls');controls.replaceChildren();scene.querySelector('.hold-touch')?.remove();scene.querySelector('.scene-note').textContent=({signal:'情绪先抵达，语言慢慢来。',touch:'靠近一点，也把此刻留住。',echo:'和你，停在同一轮月光里。',within:'表面之下，也有可以被看见的柔软。'})[id];
  const art=scene.querySelector('.scene-art');const source=document.querySelector(`[data-art="${id}"]`);if(source){const clone=source.cloneNode(true);clone.removeAttribute('data-art');art.replaceChildren(clone);}
 };
 // Use a single batched timeline for growing the tree of guides, nodes, frames and labels.
 stopFlows=function(){ambient.forEach(a=>a.kill());ambient=[];};
 startFlows=function(){stopFlows();if(!motionAllowed()||current!=='home')return;document.querySelectorAll('.geometry [id$="-dash"]').forEach((p,i)=>ambient.push(G.to(p,{strokeDashoffset:-28,duration:8+i*1.3,ease:'none',repeat:-1})));};
 // sweep：开屏碎完时用——线/节点/标题按所在高度从上往下依次长
 const SWEEP=1.6,clearSweep=()=>{['#main','.bottom-nav'].forEach(s=>{const el=$(s);if(el)el.style.clipPath='';});};
 growHome=function(sweep){growingTL?.kill();clearSweep();if(!motionAllowed()){startFlows();return;}stopFlows();
  growingTL=G.timeline({defaults:{duration:.7,ease:'power2.out'},onComplete:()=>{clearSweep();startFlows();}});
  const VH=innerHeight||1,at=(el,i)=>sweep?Math.max(0,Math.min(el.getBoundingClientRect().top/VH,1))*SWEEP:Math.min(i*.018,.9);
  // 开屏期间底下一直垫着静态主页；sweep 只让线/节点/标题重新长一遍
  const paths=[...document.querySelectorAll('.geometry path,.local-lines path')].filter(p=>!p.closest('defs')&&p.getTotalLength()>6);
  paths.forEach((p,i)=>{const oldDash=p.style.strokeDasharray,oldOffset=p.style.strokeDashoffset;growingTL.fromTo(p,{drawSVG:'0% 0%'},{drawSVG:'0% 100%',duration:.75,onComplete:()=>{p.style.strokeDasharray=oldDash;p.style.strokeDashoffset=oldOffset;}},at(p,i));});
  const nodes=[...document.querySelectorAll('.geometry circle,.local-lines circle')].filter(n=>!n.closest('defs'));
  if(sweep)nodes.forEach(n=>growingTL.fromTo(n,{scale:0,transformOrigin:'center center'},{scale:1,duration:.28,ease:'back.out(1.4)'},at(n)+.15));
  else growingTL.fromTo(nodes,{scale:0,transformOrigin:'center center'},{scale:1,stagger:.018,duration:.28,ease:'back.out(1.4)'},.15);
  if(sweep)document.querySelectorAll('.specimen h2').forEach(h=>growingTL.fromTo(h,{autoAlpha:0,y:4},{autoAlpha:1,y:0,duration:.5},at(h)+.2));
  else growingTL.fromTo(document.querySelectorAll('.specimen h2'),{autoAlpha:0,y:4},{autoAlpha:1,y:0,stagger:.18,duration:.5},.36);
 };
 function seeded(seed){let n=seed;return ()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};}
 // Canvas ink remains at full scale while irregular brush strokes erase its alpha.
 function inkPainter(canvas,underlay){
  const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5),w=rect.width,h=rect.height;
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
  const random=seeded(6174),cx=w*.49,cy=h*.45,diagonal=Math.hypot(w,h);
  const splashes=Array.from({length:64},(_,i)=>({a:i<53?-.78+(random()-.5)*1.05:random()*Math.PI*2,r:(.12+random()*.9)*diagonal,size:(.004+random()*.017)*Math.min(w,h),stretch:2+random()*5,delay:random()*.2}));
  const P={impact:0,cover:0,wipe:0};
  function cleanGlass(progress){
   if(progress<=0)return;ctx.globalCompositeOperation='destination-out';
   const rows=6,travel=Math.min(1,progress)*rows,row=Math.min(rows-1,Math.floor(travel)),t0=travel-row,t=.5-.5*Math.cos(Math.PI*t0),band=h/rows;
   // Earlier passes are wholly clean. The current broad, smooth pass overlaps them.
   ctx.fillRect(-2,-2,w+4,row*band+2);
   const leftToRight=row%2===0,xStart=leftToRight?-.35*w:1.35*w,xEnd=leftToRight?1.35*w:-.35*w;
   const end=xStart+(xEnd-xStart)*t,y=row*band+band*.51;
   ctx.lineWidth=band*1.72;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
   const steps=Math.max(1,Math.ceil(t*60));for(let i=0;i<=steps;i++){const q=Math.min(t,i/60),x=xStart+(xEnd-xStart)*q,yy=y+(q-.5)*band*.32+Math.sin(q*Math.PI)*band*.05;if(i===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);}ctx.stroke();
   // Edge overscan completes the final sweep without fading or shrinking the layer.
   if(progress>=1)ctx.clearRect(0,0,w,h);
  }
  function draw(){ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='source-over';
   // The paper underlay is separate so the thread and flower remain visible above it.
   ctx.fillStyle='#1834d4';
   if(P.impact>0){
    const radius=diagonal*.20*P.impact;ctx.beginPath();
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.78);for(let i=0;i<=38;i++){const a=i/38*Math.PI*2,r=radius*(.67+.18*Math.sin(i*2.7)+.14*Math.cos(i*5.1));const x=Math.cos(a)*r*1.7,y=Math.sin(a)*r*.55;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.fill();ctx.restore();
    splashes.forEach(s=>{const t=Math.max(0,(P.impact-s.delay)/(1-s.delay));if(!t)return;const drift=1-Math.pow(1-t,3),x=cx+Math.cos(s.a)*s.r*drift,y=cy+Math.sin(s.a)*s.r*drift+40*t*t;ctx.save();ctx.translate(x,y);ctx.rotate(s.a);ctx.beginPath();ctx.ellipse(0,0,s.size*Math.min(1,t*5)*s.stretch,s.size*Math.min(1,t*5),0,0,Math.PI*2);ctx.fill();ctx.restore();});
   }
   if(P.cover>0){ctx.save();ctx.globalAlpha=P.cover;ctx.fillRect(0,0,w,h);ctx.restore();}
   if(P.wipe>0)cleanGlass(P.wipe);
   ctx.globalCompositeOperation='source-over';
  }
  return {P,draw};
 }
 let wipeDone=false;
 endIntro=function(){openingTL?.kill();openingTL=null;introTimers.forEach(clearTimeout);introTimers=[];introOverlay?.remove();introOverlay=null;$('#main').inert=false;$('.bottom-nav').inert=false;try{sessionStorage.setItem('between-intro-seen','1');}catch{}if(current==='home'&&!wipeDone)growHome();wipeDone=false;};
 playIntro=function(){if(!motionAllowed()){endIntro();return;}if(current!=='home')navigate('home');openingTL?.kill();introOverlay?.remove();stopFlows();growingTL?.kill();wipeDone=false;
  const el=document.createElement('div');el.className='intro-overlay gsap-opening';el.setAttribute('role','status');el.setAttribute('aria-label','线条汇聚，蓝墨爆开并被擦除');
  el.innerHTML='<canvas class="intro-ink-canvas"></canvas><svg class="impact-lines" viewBox="0 0 390 844" preserveAspectRatio="none" aria-hidden="true"><path class="intro-aim" d="M-45 801C85 742 129 574 195 380"/><path class="intro-aim" d="M420 -40C361 80 245 215 195 380"/><path class="intro-aim" d="M-30 135C45 162 122 269 195 380"/></svg><span class="intro-word">BETWEEN / US</span><button class="intro-skip">跳过 / SKIP</button>';
  const paper=document.createElement('div');paper.className='intro-paper';el.prepend(paper);
  introOverlay=el;document.body.append(el);$('#main').inert=true;$('.bottom-nav').inert=true;const painter=inkPainter(el.querySelector('canvas'));painter.draw();el.querySelector('button').addEventListener('click',endIntro);
  const flower=element('g',{class:'intro-pop-flower'});
  for(let i=0;i<9;i++){const petal=element('path',{d:'M195 380C158 384 139 359 150 337C169 319 196 343 195 380Z',fill:i===2||i===5?'#1834d4':i===7?'#242522':'#fafaf7',stroke:'#242522','stroke-width':'.8',transform:'rotate('+i*40+' 195 380)'});flower.append(petal);}
  const lineSvg=el.querySelector('svg');lineSvg.append(flower);
  const center=element('circle',{cx:195,cy:380,r:9,fill:'#1834d4',stroke:'#242522','stroke-width':'.8'});flower.append(center);
  const petalPieces=[...flower.querySelectorAll('path')];
  const thread=element('path',{class:'flower-thread',d:'M-30 732C95 702 106 505 178 423C206 392 220 345 191 348C162 351 176 401 211 379C254 353 270 249 420 190',fill:'none',stroke:'#1834d4','stroke-width':'.9'});lineSvg.append(thread);
  el.querySelectorAll('.intro-aim').forEach(p=>p.remove());
  const tl=G.timeline({defaults:{ease:'power3.out'},onUpdate:painter.draw,onComplete:()=>{wipeDone=true;endIntro();}});openingTL=tl;
  tl.addLabel('flower',0).fromTo(petalPieces,{autoAlpha:0,scale:.8,svgOrigin:'195 380'},{autoAlpha:1,scale:1,duration:.72,stagger:.025,ease:'power2.out'},'flower')
   .fromTo(center,{scale:0,svgOrigin:'195 380'},{scale:1,duration:.4},.45)
   .addLabel('thread',.55).fromTo(thread,{drawSVG:'0% 0%'},{drawSVG:'0% 100%',duration:1.45,ease:'power1.inOut'},'thread')
   .addLabel('impact',1.9).to(painter.P,{impact:1,duration:.8,ease:'power3.out'},'impact')
   .to(thread,{autoAlpha:0,duration:.25},'impact')
   .to(center,{autoAlpha:0,duration:.15},'impact')
   .to(petalPieces,{x:i=>Math.cos(-.78+Math.sin(i)*.65)*(180+i*14),y:i=>Math.sin(-.78+Math.sin(i)*.65)*(210+i*12),rotation:i=>i%2?70:-85,autoAlpha:0,duration:.88,stagger:.025,ease:'power3.out'},'impact')
   .to(el.querySelector('.intro-word'),{autoAlpha:0,duration:.3},'impact')
   .to(painter.P,{cover:1,duration:.45,ease:'power1.in'},'impact+=.5')
   .set(paper,{autoAlpha:0},3.2)
   .addLabel('erase',3.25).to(painter.P,{wipe:1,duration:3.4,ease:'none'},'erase')
   .call(()=>{wipeDone=true;growHome();},[],4.5);
 };
 window.addEventListener('between:prefs',()=>{if(!motionAllowed()){openingTL?.progress(1);growingTL?.progress(1);timelines.forEach((tl,id)=>tl.progress(keyState(id)?1:0).pause());stopFlows();}});
 const mm=G.matchMedia();mm.add('(prefers-reduced-motion: reduce)',()=>{if(introOverlay)endIntro();growingTL?.progress(1);timelines.forEach((tl,id)=>tl.progress(keyState(id)?1:0).pause());stopFlows();});
 window.addEventListener('pagehide',()=>{openingTL?.kill();growingTL?.kill();stopFlows();timelines.forEach(tl=>tl.kill());},{once:true});
 const originalRender=renderArt;renderArt=function(id){timelines.get(id)?.kill();timelines.delete(id);originalRender(id);requestAnimationFrame(()=>{setupLayers();timelineFor(id);});};
 // Opening bootstrap is owned by opening-integration.js.
})();
