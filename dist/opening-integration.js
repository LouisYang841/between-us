/* VPS opening port: preserve animation isolation, reveal the actual local home. */
(() => {
 let frame=null,revealed=false,timer=null;
 // index.html 最前面那块黑盖板：脚本还没跑到这儿时挡住没长好的主页，开屏接手或不播时撤掉
 const uncover=()=>document.getElementById('boot-cover')?.remove();
 function finish(){
  uncover();
  clearTimeout(timer);timer=null;
  const visible=!!frame;frame?.remove();frame=null;
  if(visible&&current==='home'&&!revealed)growHome();
  document.querySelector('#main').inert=false;
  document.querySelector('.bottom-nav').inert=false;
 }
 endIntro=finish;
 playIntro=function(){
  finish();
  if(!motionAllowed())return;
  if(current!=='home')navigate('home');
  stopFlows();revealed=false;
  document.querySelector('#main').inert=true;
  document.querySelector('.bottom-nav').inert=true;
  frame=document.createElement('iframe');
  frame.src='opening/index.html?v=1027i';frame.title='开屏动画：三角翻面、花与裂纹';
  // 底色先给黑：iframe 自己的页面还没到时也别露出底下主页
  frame.style.cssText='position:fixed;inset:0;width:100%;height:100dvh;border:0;z-index:1000;background:#0b0b0d;';
  frame.addEventListener('load',uncover,{once:true});
  document.body.append(frame);
  // Asset-load/network failures must never trap the user outside their home.
  // 下载阶段最多等 60 秒，素材齐了（opening-ready）再给动画 20 秒
  timer=setTimeout(()=>{if(frame)finish();},60000);
 };
 window.addEventListener('message',event=>{
  if(!frame||event.origin!==location.origin||event.source!==frame.contentWindow)return;
  const type=event.data?.type;
  // 开播后底色撤成透明：玻璃掉下去要露出底下的纸，不是黑底
  if(type==='between:opening-ready'){frame.style.background='transparent';clearTimeout(timer);timer=setTimeout(()=>{if(frame)finish();},20000);}
  if(type==='between:opening-reveal'&&!revealed){revealed=true;growHome(true);}
  if(type==='between:opening-complete'||type==='between:opening-error')finish();
 });
 window.addEventListener('between:prefs',()=>{if(!motionAllowed())finish();});
 window.addEventListener('between:view',()=>{if(current!=='home')finish();});
 window.addEventListener('pagehide',finish,{once:true});
 if(current==='home'&&!location.hash.startsWith('#piece-'))playIntro();
 if(!frame)uncover();
})();
