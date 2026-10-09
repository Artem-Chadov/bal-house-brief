'use strict';
const toggle=document.querySelector('.menu-toggle'), menu=document.querySelector('#mobile-menu');
const background=[...document.querySelectorAll('main,.site-footer,.demo-strip')];
function closeMenu(){menu.hidden=true;menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');document.body.classList.remove('locked');background.forEach(e=>e.inert=false);}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';if(open){closeMenu();return;}menu.hidden=false;menu.classList.add('open');toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Закрыть меню');document.body.classList.add('locked');background.forEach(e=>e.inert=true);menu.querySelector('a').focus();});
document.addEventListener('keydown',e=>{if(menu.hidden)return;if(e.key==='Escape'){closeMenu();toggle.focus();}if(e.key==='Tab'){const targets=[toggle,...menu.querySelectorAll('a')];const i=targets.indexOf(document.activeElement);if(e.shiftKey&&(i<=0)){e.preventDefault();targets.at(-1).focus();}else if(!e.shiftKey&&(i===targets.length-1||i<0)){e.preventDefault();toggle.focus();}}});
menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
window.matchMedia('(min-width:1001px)').addEventListener('change',e=>{if(e.matches)closeMenu();});

const filters=document.querySelector('[data-filters]');
if(filters){
 const grid=document.querySelector('[data-project-grid]'),cards=[...grid.querySelectorAll('[data-project]')];
 const search=document.querySelector('#project-search'),kind=document.querySelector('#project-kind'),sort=document.querySelector('#project-sort');
 const empty=document.querySelector('[data-empty]'),count=document.querySelector('[data-count]'),tools=filters.querySelector('.filter-tools');
 const narrow=window.matchMedia('(max-width:700px)');
 filters.hidden=false;document.querySelector('[data-filter-info]').hidden=false;
 const setTools=()=>{if(tools)tools.open=!narrow.matches;};setTools();narrow.addEventListener('change',setTools);
 const normalize=s=>s.toLowerCase().replace(/ё/g,'е').replace(/\bkds/g,'кдс').replace(/\bkd/g,'кд').replace(/[\s\-\u2010-\u2015\u2212]+/g,'');
 function save(){
  const url=new URL(location.href);
  for(const [key,value,defaultValue] of [['q',search.value.trim(),''],['kind',kind.value,'all'],['sort',sort.value,'default']]){
   if(value===defaultValue)url.searchParams.delete(key);else url.searchParams.set(key,value);
  }
  history.replaceState(history.state,'',url);
 }
 function update(remember=true){
  const q=normalize(search.value),ordered=[...cards];
  if(sort.value==='price-up')ordered.sort((a,b)=>Number(a.dataset.price)-Number(b.dataset.price));
  if(sort.value==='price-down')ordered.sort((a,b)=>Number(b.dataset.price)-Number(a.dataset.price));
  let n=0;
  ordered.forEach(card=>{card.hidden=!((kind.value==='all'||card.dataset.kind===kind.value)&&normalize(card.dataset.name).includes(q));if(!card.hidden)n++;grid.appendChild(card);});
  grid.dataset.visibleCount=String(n);count.textContent='Показано домов: '+n+' из '+cards.length;empty.hidden=n>0;
  if(remember)save();
 }
 function restore(){
  const params=new URL(location.href).searchParams;
  search.value=(params.get('q')||'').slice(0,100);
  kind.value=[...kind.options].some(o=>o.value===params.get('kind'))?params.get('kind'):'all';
  sort.value=[...sort.options].some(o=>o.value===params.get('sort'))?params.get('sort'):'default';
  if(tools&&(search.value||sort.value!=='default'))tools.open=true;
  update(false);
 }
 [search,kind,sort].forEach(el=>el.addEventListener(el===search?'input':'change',()=>update()));
 document.querySelectorAll('[data-reset-filters]').forEach(btn=>btn.addEventListener('click',()=>{
  search.value='';kind.value='all';sort.value='default';update();
  if(tools)tools.open=true;search.focus();
 }));
 window.addEventListener('pageshow',()=>{restore();requestAnimationFrame(restore);});
 window.addEventListener('popstate',restore);
 restore();
}

document.querySelectorAll('[data-gallery]').forEach(gallery=>{const main=gallery.querySelector('.gallery-main img'),label=gallery.querySelector('.gallery-main [data-gallery-label]');gallery.querySelectorAll('[data-gallery-src]').forEach(button=>button.addEventListener('click',()=>{main.src=button.dataset.gallerySrc;main.alt=button.dataset.galleryAlt;main.classList.toggle('plan',button.dataset.galleryPlan==='true');label.textContent=button.dataset.galleryLabel;gallery.querySelectorAll('[data-gallery-src]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));});

document.querySelectorAll('[data-project-carousel]').forEach(grid=>{
 const cards=[...grid.querySelectorAll('.project-card')],controls=grid.nextElementSibling,prev=controls.querySelector('[data-carousel-prev]'),next=controls.querySelector('[data-carousel-next]'),count=controls.querySelector('[data-carousel-count]');
 controls.hidden=false;
 function current(){return Math.max(0,Math.min(cards.length-1,Math.round(grid.scrollLeft/(cards[0].getBoundingClientRect().width+14))));}
 function update(){const index=current();prev.disabled=index===0;next.disabled=index===cards.length-1;count.textContent=(index+1)+' из '+cards.length;}
 function step(delta){const index=Math.max(0,Math.min(cards.length-1,current()+delta));grid.scrollTo({left:cards[index].offsetLeft-cards[0].offsetLeft,behavior:'instant'});update();}
 prev.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));grid.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
});
// Motion leaves the document usable without the animation library or JavaScript.
if(window.gsap){
 const motion=gsap.matchMedia();
 motion.add('(prefers-reduced-motion: no-preference)',()=>{
  const hero=document.querySelector('.hero-inner');
  if(hero){
   const intro=gsap.timeline({defaults:{duration:.65,ease:'power2.out',clearProps:'opacity,transform'}});
   intro.fromTo(hero.querySelector('h1'),{opacity:.3,y:12},{opacity:1,y:0},0);
   intro.fromTo(hero.querySelector('.lead'),{opacity:.45,y:8},{opacity:1,y:0},.12);
  }
  const listeners=[];
  document.querySelectorAll('[data-gallery-src]').forEach(button=>{
   const image=button.closest('[data-gallery]').querySelector('.gallery-main img');
   const change=()=>gsap.fromTo(image,{opacity:.45},{opacity:1,duration:.32,ease:'power1.out',overwrite:true,clearProps:'opacity'});
   button.addEventListener('click',change);listeners.push([button,change]);
  });
  return ()=>listeners.forEach(([button,change])=>button.removeEventListener('click',change));
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)gsap.globalTimeline.getChildren().forEach(t=>t.progress(1));});
 window.addEventListener('pagehide',()=>motion.revert(),{once:true});
}

