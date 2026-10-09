'use strict';
const toggle=document.querySelector('.menu-toggle'), menu=document.querySelector('#mobile-menu');
const background=[...document.querySelectorAll('main,.site-footer,.demo-strip')];
function closeMenu(){menu.hidden=true;menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');document.body.classList.remove('locked');background.forEach(e=>e.inert=false);}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';if(open){closeMenu();return;}menu.hidden=false;menu.classList.add('open');toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Закрыть меню');document.body.classList.add('locked');background.forEach(e=>e.inert=true);menu.querySelector('a').focus();});
document.addEventListener('keydown',e=>{if(menu.hidden)return;if(e.key==='Escape'){closeMenu();toggle.focus();}if(e.key==='Tab'){const targets=[toggle,...menu.querySelectorAll('a')];const i=targets.indexOf(document.activeElement);if(e.shiftKey&&(i<=0)){e.preventDefault();targets.at(-1).focus();}else if(!e.shiftKey&&(i===targets.length-1||i<0)){e.preventDefault();toggle.focus();}}});
menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
window.matchMedia('(min-width:1001px)').addEventListener('change',e=>{if(e.matches)closeMenu();});

const dialog=document.querySelector('dialog.modal');let returnFocus=null;
document.querySelectorAll('[data-request]').forEach(link=>link.addEventListener('click',e=>{if(!dialog||!dialog.showModal)return;e.preventDefault();closeMenu();returnFocus=link;const form=dialog.querySelector('form');form.elements.subject.value=link.dataset.request||'';form.querySelector('[data-lead-result]').hidden=true;dialog.showModal();document.body.classList.add('locked');form.elements.message.focus();}));
if(dialog){dialog.querySelector('.close-modal').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();});dialog.addEventListener('close',()=>{document.body.classList.remove('locked');if(returnFocus?.isConnected)returnFocus.focus();});}

document.querySelectorAll('[data-lead-form]').forEach(form=>{
 const button=form.querySelector('[type=submit]'),result=form.querySelector('[data-lead-result]'),title=form.querySelector('[data-result-title]'),instruction=form.querySelector('[data-result-instruction]'),manual=form.querySelector('[data-manual]'),output=form.querySelector('[data-output]'),status=form.querySelector('[data-result-status]');
 let version=0,busy=false;
 button.disabled=false;
 form.addEventListener('input',e=>{if(e.target===output)return;version++;result.hidden=true;if(e.target.name==='message'){e.target.removeAttribute('aria-invalid');form.querySelector('[data-error=message]').hidden=true;}});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;
  const message=form.elements.message.value.trim(),error=form.querySelector('[data-error=message]');
  if(!message||message.length>1500){error.textContent=!message?'Коротко опишите, что хотите построить.':'Сократите описание до 1500 знаков.';error.hidden=false;form.elements.message.setAttribute('aria-invalid','true');form.elements.message.focus();return;}
  error.hidden=true;form.elements.message.removeAttribute('aria-invalid');
  const name=form.elements.name.value.trim(),subject=form.elements.subject.value.trim();
  const text=['Здравствуйте! Хочу обсудить строительство с Bal House.',subject?'Проект или направление: '+subject:'',name?'Меня зовут: '+name:'','Задача: '+message].filter(Boolean).join('\n\n');
  const copiedVersion=version;busy=true;button.disabled=true;button.textContent='Копируем запрос…';let copied=false;
  try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);copied=true;}catch{}
  finally{busy=false;button.disabled=false;button.textContent='Скопировать запрос';}
  if(version!==copiedVersion)return;
  output.value=text;manual.hidden=copied;title.textContent=copied?'Запрос скопирован':'Скопируйте запрос вручную';instruction.textContent=copied?'Теперь откройте сообщения Bal House в VK, вставьте текст и отправьте его.':'Браузер не разрешил копирование. Выделите текст, скопируйте его, затем откройте сообщения VK и отправьте.';status.textContent='';result.hidden=false;title.focus({preventScroll:true});result.scrollIntoView({block:'nearest',behavior:'instant'});
 });
 form.querySelector('[data-select]').addEventListener('click',()=>{output.focus();output.select();output.setSelectionRange(0,output.value.length);status.textContent='Текст выделен. Нажмите Ctrl+C или выберите «Копировать» на телефоне, затем откройте VK.';});
});

const filters=document.querySelector('[data-filters]');
if(filters){
 const grid=document.querySelector('[data-project-grid]'),cards=[...grid.querySelectorAll('[data-project]')],search=document.querySelector('#project-search'),kind=document.querySelector('#project-kind'),sort=document.querySelector('#project-sort'),empty=document.querySelector('[data-empty]'),count=document.querySelector('[data-count]');
 filters.hidden=false;document.querySelector('[data-filter-info]').hidden=false;
 const normalize=s=>s.toLowerCase().replace(/ё/g,'е').replace(/\bkds/g,'кдс').replace(/\bkd/g,'кд').replace(/[\s-]+/g,'');
 function update(){const q=normalize(search.value),ordered=[...cards];if(sort.value==='price-up')ordered.sort((a,b)=>Number(a.dataset.price)-Number(b.dataset.price));if(sort.value==='price-down')ordered.sort((a,b)=>Number(b.dataset.price)-Number(a.dataset.price));let n=0;ordered.forEach(card=>{card.hidden=!((kind.value==='all'||card.dataset.kind===kind.value)&&normalize(card.dataset.name).includes(q));if(!card.hidden)n++;grid.appendChild(card);});count.textContent='Показано проектов: '+n+' из '+cards.length;empty.hidden=n>0;}
 [search,kind,sort].forEach(el=>el.addEventListener(el===search?'input':'change',update));document.querySelectorAll('[data-reset-filters]').forEach(btn=>btn.addEventListener('click',()=>{search.value='';kind.value='all';sort.value='default';update();search.focus();}));update();
}

document.querySelectorAll('[data-gallery]').forEach(gallery=>{const main=gallery.querySelector('.gallery-main img'),label=gallery.querySelector('.gallery-main [data-gallery-label]');gallery.querySelectorAll('[data-gallery-src]').forEach(button=>button.addEventListener('click',()=>{main.src=button.dataset.gallerySrc;main.alt=button.dataset.galleryAlt;main.classList.toggle('plan',button.dataset.galleryPlan==='true');label.textContent=button.dataset.galleryLabel;gallery.querySelectorAll('[data-gallery-src]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));});
