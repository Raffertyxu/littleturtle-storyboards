(()=>{
'use strict';
const films=window.FILMS,$=id=>document.getElementById(id),query=new URLSearchParams(location.search);
let f=query.get('film')==='b'?1:0,i=Math.min(15,Math.max(0,(Number.parseInt(query.get('shot'),10)||1)-1)),renderedFilm=null;
const dialog=$('dialog');
const cache=new Map(),queue=[];let active=0;
function urlFor(film,page){return `assets/no-window-${film}-${page}.webp`}
function pump(){
 while(active<2&&queue.length){
  const item=queue.shift();if(item.started)continue;item.started=true;active++;
  const image=item.image;image.decoding='async';if('fetchPriority' in image)image.fetchPriority=item.priority?'high':'low';
  const done=ok=>{if(!ok)cache.delete(item.key);item.resolve(ok);active--;pump()};
  image.onload=()=>{if(item.priority&&typeof image.decode==='function')image.decode().catch(()=>{}).then(()=>done(true));else done(true)};
  image.onerror=()=>done(false);image.src=urlFor(item.film,item.page);
 }
}
function preload(film,page,priority=false){
 if(page<1||page>4)return Promise.resolve(false);const key=film+page;let item=cache.get(key);
 if(item){if(priority&&!item.started){item.priority=true;const at=queue.indexOf(item);if(at>=0){queue.splice(at,1);queue.unshift(item)}}return item.promise}
 item={key,film,page,priority,started:false,image:new Image()};item.promise=new Promise(resolve=>{item.resolve=resolve});cache.set(key,item);if(priority)queue.unshift(item);else queue.push(item);pump();return item.promise;
}
function warm(film,index){
 const current=Math.floor(index/4)+1;
 preload(film,current,true).then(()=>{
  const currentFilm=films[f].id,group=Math.floor(i/4)+1,other=currentFilm==='a'?'b':'a';
  // Prioritise the next group and the first image of the other film, then fill the cache in the background.
  for(const [id,page] of [[currentFilm,group+1],[other,1],[currentFilm,group-1]])preload(id,page,true);
  for(const id of [currentFilm,other])for(let page=1;page<=4;page++)preload(id,page);
 });
}
function picture(el,film,index){const page=Math.floor(index/4)+1,quadrant=index%4;el.style.backgroundImage=`url("${urlFor(film,page)}")`;el.style.backgroundPosition=`${quadrant%2?'100%':'0%'} ${quadrant<2?'0%':'100%'}`}
function renderFilm(film){
 $('kind').textContent=film.kind;$('title').textContent=film.title;$('desc').textContent=film.desc;$('setup').textContent=film.setup;$('flow').textContent=film.flow;
 for(const x of films)$('film-'+x.id).setAttribute('aria-pressed',String(x.id===film.id));
 $('allshots').replaceChildren(...film.shots.map((x,n)=>{const d=document.createElement('div');d.className='fullitem';const h=document.createElement('strong');h.textContent=`${n+1}｜${x.time}｜${x.name}`;const p=document.createElement('p');p.textContent=x.action+' 卡點：'+x.beat+' 字卡：'+x.card;d.append(h,p);return d}));
 $('grid').replaceChildren(...film.shots.map((x,n)=>{const b=document.createElement('button');b.type='button';b.dataset.index=String(n);b.setAttribute('aria-label',`鏡頭 ${n+1}：${x.name}`);b.textContent=String(n+1);return b}));renderedFilm=film.id;
}
function draw(){
 const film=films[f],shot=film.shots[i];if(renderedFilm!==film.id)renderFilm(film);
 $('shotcount').textContent=`鏡頭 ${i+1} / ${film.shots.length}`;$('time').textContent=shot.time;$('name').textContent=shot.name;$('camera').textContent=shot.camera;$('action').textContent=shot.action;$('beat').textContent=shot.beat;$('card').textContent=shot.card;$('step').textContent=`${i+1} / ${film.shots.length}`;
 $('prev').disabled=i===0;$('next').textContent=i===15?'切換另一支 →':'下一鏡 →';picture($('picture'),film.id,i);
 $('grid').querySelectorAll('button').forEach((b,n)=>b.setAttribute('aria-current',String(n===i)));
 const u=new URL(location.href);u.searchParams.set('film',film.id);u.searchParams.set('shot',String(i+1));history.replaceState(null,'',u);warm(film.id,i);
}
function changeFilm(index){f=index;i=0;$('jump').open=false;draw();window.scrollTo({top:0,behavior:'instant'})}
$('grid').addEventListener('click',e=>{const b=e.target.closest('button[data-index]');if(!b)return;i=Number(b.dataset.index);$('jump').open=false;draw();$('shot').scrollIntoView({block:'nearest'})});
$('film-a').addEventListener('click',()=>changeFilm(0));$('film-b').addEventListener('click',()=>changeFilm(1));$('prev').addEventListener('click',()=>{if(i>0){i--;draw()}});$('next').addEventListener('click',()=>{if(i<15){i++;draw()}else changeFilm(1-f)});
$('zoom').addEventListener('click',()=>{picture($('modal-picture'),films[f].id,i);$('modal-title').textContent=`鏡頭 ${i+1}｜${films[f].shots[i].name}`;dialog.showModal()});$('close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
const reference=document.querySelector('.reference');reference.addEventListener('toggle',()=>{const img=reference.querySelector('img[data-src]');if(reference.open&&img){img.src=img.dataset.src;img.removeAttribute('data-src')}});
draw();
})();
