// Local conversation and settings. No model endpoint, network calls, or simulated AI delivery.
const CHAT_DEFAULTS={fontSize:16,typeScale:1,density:'standard',lineHeight:1.7,showTime:true,sendKey:'newline',autoScroll:true,saveDraft:true,motion:true,guides:true,partnerName:'L.',selfName:'我'};
function cleanPrefs(raw={}){
 const p={...CHAT_DEFAULTS};
 for(const key of ['motion','guides','showTime','autoScroll','saveDraft'])if(typeof raw[key]==='boolean')p[key]=raw[key];
 if([12,16,20,24].includes(Number(raw.fontSize)))p.fontSize=Number(raw.fontSize);
 if([.875,1,1.125,1.25].includes(Number(raw.typeScale)))p.typeScale=Number(raw.typeScale);
 if([1.5,1.7,1.8,2].includes(Number(raw.lineHeight)))p.lineHeight=Number(raw.lineHeight);
 if(['compact','standard','airy'].includes(raw.density))p.density=raw.density;
 if(['send','newline'].includes(raw.sendKey))p.sendKey=raw.sendKey;
 if(typeof raw.partnerName==='string'&&raw.partnerName.trim())p.partnerName=raw.partnerName.trim().slice(0,24);
 if(typeof raw.selfName==='string'&&raw.selfName.trim())p.selfName=raw.selfName.trim().slice(0,24);
 return p;
}
prefs=cleanPrefs(prefs);
entries=entries.filter(e=>e&&typeof e.text==='string'&&!Number.isNaN(Date.parse(e.date))).map(e=>({id:String(e.id||crypto.randomUUID()),date:new Date(e.date).toISOString(),text:e.text.slice(0,3000),role:e.role==='assistant'?'assistant':'user',edited:e.edited===true}));
let demoMode=entries.length===0,editingId=null,priorDraft='',undoSnapshot=null,confirmResolve=null;
const demoMessages=[
 {id:'demo-1',role:'assistant',text:'今天有没有好好吃饭？',date:'2026-10-22T20:14:00+08:00'},
 {id:'demo-2',role:'assistant',text:'我想听你说。',date:'2026-10-22T20:14:30+08:00'},
 {id:'demo-3',role:'user',text:'有呀。回来的路上，\n突然很想你。',date:'2026-10-22T20:18:00+08:00'},
 {id:'demo-4',role:'assistant',text:'那就再陪我待一会儿。\n不用急着说什么。',date:'2026-10-22T20:21:00+08:00'},
 {id:'demo-5',role:'user',text:'好。\n就这样待着也很好。',date:'2026-10-22T20:27:00+08:00'}
];
function writeEntries(next){try{localStorage.setItem('between-entries',JSON.stringify(next));entries=next;updateStorageInfo();return true;}catch{toast('保存失败，原记录未改变。请先导出备份。');return false;}}
function updateStorageInfo(){let bytes=0;try{bytes=new Blob([JSON.stringify(entries),JSON.stringify(prefs),localStorage.getItem('between-draft')||'']).size;}catch{}$('#record-count').textContent=`${entries.length} 条记录`;$('#storage-size').textContent=`文字与设置 ${(bytes/1024).toFixed(1)} KB`;}
function applyChatPrefs(){
 document.documentElement.style.setProperty('--type-scale',prefs.typeScale);
 document.documentElement.style.setProperty('--chat-font',`${prefs.fontSize}px`);
 document.documentElement.style.setProperty('--chat-leading',prefs.lineHeight);
 document.documentElement.style.setProperty('--bubble-pad',({compact:'8px 11px',standard:'10px 12px',airy:'13px 15px'})[prefs.density]);
 document.documentElement.style.setProperty('--message-gap',({compact:'12px',standard:'19px',airy:'27px'})[prefs.density]);
 document.body.classList.toggle('hide-message-time',!prefs.showTime);
 $$('[data-pref]').forEach(el=>el.value=String(prefs[el.dataset.pref]));
 $$('[data-switch]').forEach(el=>el.setAttribute('aria-checked',String(prefs[el.dataset.switch])));
 $('#send-hint').textContent=prefs.sendKey==='send'?'Enter 发送 · Shift + Enter 换行':'Enter 换行 · Ctrl / ⌘ + Enter 发送';
 updateStorageInfo();resizeComposer();requestAnimationFrame(updateOcclusion);
}
window.addEventListener('between:prefs',applyChatPrefs);
$$('[data-pref]').forEach(el=>el.addEventListener('change',()=>{prefs=cleanPrefs({...prefs,[el.dataset.pref]:el.value});savePrefs();}));
$$('[data-switch]').forEach(el=>el.addEventListener('click',()=>{const key=el.dataset.switch;prefs[key]=!prefs[key];if(key==='saveDraft'&&!prefs.saveDraft){try{localStorage.removeItem('between-draft');}catch{}}savePrefs();}));
function formatTime(value){try{return new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value));}catch{return '';}}
function appendHighlighted(parent,text,query){if(!query){parent.textContent=text;return;}const lower=text.toLocaleLowerCase(),needle=query.toLocaleLowerCase();let from=0,index;while((index=lower.indexOf(needle,from))>=0){parent.append(document.createTextNode(text.slice(from,index)));const mark=document.createElement('mark');mark.textContent=text.slice(index,index+query.length);parent.append(mark);from=index+query.length;}parent.append(document.createTextNode(text.slice(from)));}
function scrollLatest(){if(prefs.autoScroll)requestAnimationFrame(()=>$('#chat-stream').scrollTo({top:$('#chat-stream').scrollHeight,behavior:prefs.motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'instant'}));}
function actionButton(label,handler){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',handler);return b;}
function renderEntries(){
 const box=$('#entries'),query=$('#message-search').value.trim();box.replaceChildren();
 $('#demo-toggle').setAttribute('aria-pressed',String(demoMode));$('#demo-label').hidden=!demoMode;
 const source=demoMode?demoMessages:entries;const visible=source.filter(e=>e.text.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 if(!visible.length){const p=document.createElement('p');p.className='message-empty';if(query)p.textContent='没有找到这段文字。';else{const em=document.createElement('em');em.textContent='A little room for the unsaid.';p.append(em,document.createTextNode('写下一句，留在此刻。'));}box.append(p);}
 visible.forEach((e,index)=>{
  const article=document.createElement('article');article.className='message '+(e.role==='user'?'outgoing':'incoming');article.dataset.messageId=e.id;
  const face=document.createElement('img');face.className='message-avatar';face.dataset.avatar=e.role==='user'?'self':'partner';face.src=e.role==='user'?avatarUrls.self:avatarUrls.partner;face.alt=e.role==='user'?prefs.selfName:prefs.partnerName;
  const content=document.createElement('div');content.className='message-content';
  const bubble=document.createElement('div');bubble.className='message-bubble';const p=document.createElement('p');appendHighlighted(p,e.text,query);bubble.append(p);
  const meta=document.createElement('div');meta.className='message-meta';const time=document.createElement('time');time.dateTime=e.date;time.textContent=formatTime(e.date)+(e.edited?' · 已编辑':'');meta.append(time);
  if(!demoMode){const more=actionButton('···',()=>openMessageMenu(e));more.className='message-more';more.setAttribute('aria-label','这条消息的更多操作');meta.append(more);let timer;const clear=()=>clearTimeout(timer);bubble.addEventListener('pointerdown',event=>{if(event.button===0)timer=setTimeout(()=>openMessageMenu(e),500);});['pointerup','pointercancel','pointerleave'].forEach(type=>bubble.addEventListener(type,clear));}
  if(index>0&&visible[index-1].role===e.role)article.classList.add('is-followup');
  content.append(bubble,meta);article.append(face,content);box.append(article);
 });
 $('#stream-status').textContent=query?`找到 ${visible.length} 条`:'';
}
function resizeComposer(){const input=$('#message');input.style.height='auto';input.style.height=Math.max(40,Math.min(110,input.scrollHeight))+'px';$('#message-count').textContent=`${input.value.length} / 3000`;$('.send-button').disabled=!input.value.trim();}
function startEdit(e){if(!editingId)priorDraft=$('#message').value;editingId=e.id;$('#message').value=e.text;$('#edit-banner').hidden=false;$('#message').focus();resizeComposer();}
function cancelEdit(){editingId=null;$('#edit-banner').hidden=true;$('#message').value=priorDraft;priorDraft='';resizeComposer();}
$('#cancel-edit').addEventListener('click',cancelEdit);
$('#draft-form').addEventListener('submit',event=>{
 event.preventDefault();const text=$('#message').value.trim();if(!text)return;
 if(editingId){const next=entries.map(e=>e.id===editingId?{...e,text,edited:true}:e);if(!writeEntries(next))return;cancelEdit();}
 else{const entry={id:crypto.randomUUID(),role:'user',date:new Date().toISOString(),text,edited:false};if(!writeEntries([...entries,entry]))return;$('#message').value='';try{localStorage.removeItem('between-draft');}catch{}}
 undoSnapshot=null;$('#undo-action').hidden=true;demoMode=false;$('#message-search').value='';renderEntries();resizeComposer();$('#draft-status').textContent='已保存 · 尚未连接 AI';scrollLatest();
});
$('#message').addEventListener('keydown',event=>{if(event.isComposing||event.keyCode===229||event.key!=='Enter')return;const send=event.ctrlKey||event.metaKey||(prefs.sendKey==='send'&&!event.shiftKey);if(send){event.preventDefault();$('#draft-form').requestSubmit();}});
$('#message').addEventListener('input',()=>{resizeComposer();if(!editingId&&prefs.saveDraft){try{localStorage.setItem('between-draft',$('#message').value);$('#draft-status').textContent='草稿已保存';}catch{$('#draft-status').textContent='草稿保存失败';}}else if(!editingId)$('#draft-status').textContent='草稿保存已关闭';});
try{if(prefs.saveDraft)$('#message').value=localStorage.getItem('between-draft')||'';}catch{}
$('#message-search').addEventListener('input',renderEntries);$('#demo-toggle').addEventListener('click',()=>{demoMode=!demoMode;renderEntries();});
window.addEventListener('between:view',e=>{if(e.detail==='talk'){resizeComposer();scrollLatest();}if(e.detail==='settings')updateStorageInfo();});
const dataDialog=$('#data-dialog');
function confirmAction(title,copy,button='确认'){return new Promise(resolve=>{confirmResolve=resolve;$('#data-dialog-title').textContent=title;$('#data-dialog-copy').textContent=copy;$('#data-confirm').textContent=button;dataDialog.showModal();});}
$('#data-confirm').addEventListener('click',()=>{const done=confirmResolve;confirmResolve=null;dataDialog.close();done?.(true);});
$('#data-cancel').addEventListener('click',()=>dataDialog.close());dataDialog.addEventListener('close',()=>{if(confirmResolve){confirmResolve(false);confirmResolve=null;}});
function rememberUndo(previous){undoSnapshot=previous;$('#undo-action').hidden=false;}
$('#undo-action').addEventListener('click',()=>{if(undoSnapshot&&writeEntries(undoSnapshot)){undoSnapshot=null;$('#undo-action').hidden=true;demoMode=false;renderEntries();toast('已恢复记录。');}});
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function fileStamp(){return new Date().toISOString().slice(0,10);}
$('#export-json').addEventListener('click',()=>{let draft='';try{draft=prefs.saveDraft?(localStorage.getItem('between-draft')||''):'';}catch{}download(`between-us-${fileStamp()}.json`,JSON.stringify({format:'between-us',version:1,exportedAt:new Date().toISOString(),messages:entries,settings:prefs,draft,features:window.betweenFeatures?.exportData()},null,2),'application/json');$('#backup-status').textContent='已生成文字备份：对话、记忆、信件与设置。不含照片、音频和上传素材。';});
$('#export-text').addEventListener('click',()=>{const content=entries.map(e=>`${e.role==='user'?'YOU':'BETWEEN'} · ${formatTime(e.date)}\n${e.text}`).join('\n\n—\n\n');download(`between-us-${fileStamp()}.txt`,content||'暂无对话记录。','text/plain;charset=utf-8');$('#backup-status').textContent='已生成对话文字下载。';});
function validateBackup(raw){
 if(!raw||raw.format!=='between-us'||raw.version!==1||!Array.isArray(raw.messages)||raw.messages.length>10000)throw new Error('不是有效的 BETWEEN US 备份。');
 const seen=new Set();const messages=raw.messages.map(e=>{if(!e||typeof e.id!=='string'||e.id.length>150||seen.has(e.id)||!['user','assistant'].includes(e.role)||typeof e.text!=='string'||e.text.length>3000||typeof e.date!=='string'||Number.isNaN(Date.parse(e.date)))throw new Error('备份包含无效消息。');seen.add(e.id);return {id:e.id,role:e.role,text:e.text,date:new Date(e.date).toISOString(),edited:e.edited===true};});
 if(raw.draft!==undefined&&(typeof raw.draft!=='string'||raw.draft.length>3000))throw new Error('备份草稿无效。');
 if(raw.settings!==undefined&&(!raw.settings||typeof raw.settings!=='object'||Array.isArray(raw.settings)))throw new Error('备份设置无效。');
 const features=raw.features&&window.betweenFeatures?window.betweenFeatures.validate(raw.features):null;
 return {messages,settings:cleanPrefs(raw.settings),draft:raw.draft||'',features};
}
$('#import-data').addEventListener('change',async event=>{
 const file=event.target.files[0];event.target.value='';if(!file)return;
 try{if(file.size>5*1024*1024)throw new Error('备份文件请小于 5MB。');const data=validateBackup(JSON.parse(await file.text()));
  if(!await confirmAction('导入这份备份？',`合并 ${data.messages.length} 条对话（相同编号不重复），并恢复备份中的设置与草稿。主页素材保持不变。`,'导入'))return;
  const ids=new Set(entries.map(e=>e.id)),previous=entries.map(e=>({...e}));const merged=[...entries,...data.messages.filter(e=>!ids.has(e.id))].sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));if(!writeEntries(merged))return;
  rememberUndo(previous);prefs=data.settings;savePrefs();cancelEdit();$('#message').value=data.draft;
  try{if(prefs.saveDraft)localStorage.setItem('between-draft',data.draft);else localStorage.removeItem('between-draft');}catch{}
  if(data.features)window.betweenFeatures.restore(data.features);
  demoMode=false;renderEntries();resizeComposer();$('#backup-status').textContent='已合并对话与片段并恢复设置。可撤销对话合并，其他内容不随撤销回退。';toast('备份已导入。');
 }catch(error){$('#backup-status').textContent='导入失败：'+(error instanceof SyntaxError?'JSON 格式无法读取。':error.message);}
});
$('#clear-messages').addEventListener('click',async()=>{if(!entries.length){toast('暂无记录需要清空。');return;}if(!await confirmAction('清空本地对话？',`将移除 ${entries.length} 条记录。素材与设置保留，在下一次编辑或发送前可撤销。`,'清空记录'))return;const previous=entries.map(e=>({...e}));if(writeEntries([])){rememberUndo(previous);demoMode=false;if(editingId)cancelEdit();renderEntries();toast('已清空，可撤销。');}});
$('#reset-reading').addEventListener('click',async()=>{if(!await confirmAction('恢复默认设置？','字号、间距、动效和输入习惯将恢复默认。对话与素材保持不变。','恢复'))return;prefs={...CHAT_DEFAULTS};savePrefs();toast('设置已恢复。');});
const avatarUrls={partner:'assets/avatar-partner.png',self:'assets/avatar-self.png'};
let selectedMessage=null;
function updateIdentity(){document.querySelectorAll('[data-partner-name]').forEach(el=>el.textContent=prefs.partnerName);document.querySelectorAll('[data-avatar]').forEach(el=>el.src=avatarUrls[el.dataset.avatar]);}
function openMessageMenu(e){selectedMessage=e;$('#message-menu').showModal();}
$('#menu-close').addEventListener('click',()=>$('#message-menu').close());
$('#menu-copy').addEventListener('click',async()=>{if(!selectedMessage)return;try{await navigator.clipboard.writeText(selectedMessage.text);toast('已复制。');}catch{toast('复制不可用，请选中文字复制。');}$('#message-menu').close();});
$('#menu-edit').addEventListener('click',()=>{if(selectedMessage)startEdit(selectedMessage);$('#message-menu').close();});
$('#menu-delete').addEventListener('click',()=>{if(!selectedMessage)return;const e=selectedMessage,previous=entries.map(x=>({...x}));if(writeEntries(entries.filter(x=>x.id!==e.id))){rememberUndo(previous);if(editingId===e.id)cancelEdit();renderEntries();toast('已移除，可在设置中撤销。');}$('#message-menu').close();});
function openProfile(){ $('#partner-name').value=prefs.partnerName;$('#self-name').value=prefs.selfName;$('#profile-dialog').showModal(); }
['#open-profile','#profile-more','#profile-settings'].forEach(selector=>$(selector).addEventListener('click',openProfile));
$('.profile-close').addEventListener('click',()=>$('#profile-dialog').close());
$('#profile-form').addEventListener('submit',event=>{event.preventDefault();prefs=cleanPrefs({...prefs,partnerName:$('#partner-name').value,selfName:$('#self-name').value});savePrefs();updateIdentity();renderEntries();$('#profile-dialog').close();toast('称呼已记住。');});
document.querySelector('[data-chat-home]').addEventListener('click',()=>navigate('home'));
function toggleSearch(open){$('#chat-search-panel').hidden=!open;$('#toggle-search').setAttribute('aria-expanded',String(open));if(open)$('#message-search').focus();else{$('#message-search').value='';renderEntries();}}
$('#toggle-search').addEventListener('click',()=>toggleSearch($('#chat-search-panel').hidden));$('#close-search').addEventListener('click',()=>toggleSearch(false));
$('#composer-plus').addEventListener('click',()=>{const open=$('#composer-extras').hidden;$('#composer-extras').hidden=!open;$('#composer-plus').setAttribute('aria-expanded',String(open));});
function closeExtras(){$('#composer-extras').hidden=true;$('#composer-plus').setAttribute('aria-expanded','false');}
$('#extra-reading').addEventListener('click',()=>{closeExtras();navigate('settings');$('#view-heading').scrollIntoView({block:'start',behavior:'smooth'});});
$('#extra-demo').addEventListener('click',()=>{closeExtras();demoMode=!demoMode;renderEntries();});
$('#extra-clear').addEventListener('click',()=>{closeExtras();if(editingId)cancelEdit();else{$('#message').value='';$('#message').dispatchEvent(new Event('input'));}});
for(const who of ['partner','self']){
 $('#upload-avatar-'+who).addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8*1024*1024){$('#profile-status').textContent='请选择小于 8MB 的 PNG、JPG 或 WebP。';return;}const url=URL.createObjectURL(file),img=new Image();img.src=url;try{await img.decode();await dbWrite('avatar-'+who,file);if(avatarUrls[who].startsWith('blob:'))URL.revokeObjectURL(avatarUrls[who]);avatarUrls[who]=url;updateIdentity();renderEntries();$('#profile-status').textContent='头像已保存在此浏览器。';}catch{URL.revokeObjectURL(url);$('#profile-status').textContent='头像保存失败，请检查浏览器存储权限。';}});
 document.querySelector('[data-reset-avatar="'+who+'"]').addEventListener('click',async()=>{try{await dbWrite('avatar-'+who,null);if(avatarUrls[who].startsWith('blob:'))URL.revokeObjectURL(avatarUrls[who]);avatarUrls[who]='assets/avatar-'+who+'.png';updateIdentity();renderEntries();$('#profile-status').textContent='已恢复默认头像。';}catch{$('#profile-status').textContent='还原失败，请重试。';}});
}
async function loadAvatars(){try{const db=await dbReady;const tx=db.transaction('images','readonly');for(const who of ['partner','self']){const request=tx.objectStore('images').get('avatar-'+who);request.onsuccess=()=>{if(request.result){avatarUrls[who]=URL.createObjectURL(request.result);updateIdentity();renderEntries();}};}}catch{}}
window.addEventListener('between:prefs',()=>{updateIdentity();renderEntries();});
applyChatPrefs();updateIdentity();renderEntries();loadAvatars();
