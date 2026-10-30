(() => {
  'use strict';
  const stories = window.STORYBOARDS;
  const $ = (id) => document.getElementById(id);
  const select = $('episode-select'), tabs = $('shot-tabs'), still = $('still');
  const params = new URLSearchParams(location.search);
  let current = Math.max(0, stories.findIndex(x => x.id === params.get('episode')));
  let shot = Math.min(3, Math.max(0, (Number(params.get('shot')) || 1) - 1));
  const groups = [['實拍建議','實拍'],['H3 短劇','H3']];
  for (const [label, kind] of groups) {
    const group = document.createElement('optgroup'); group.label = label;
    for (const item of stories.filter(x => x.kind === kind)) { const o = document.createElement('option'); o.value = item.id; o.textContent = `${item.id}｜${item.title}`; group.appendChild(o); }
    select.appendChild(group);
  }
  function updateUrl(){const u=new URL(location.href);u.searchParams.set('episode',stories[current].id);u.searchParams.set('shot',String(shot+1));history.replaceState(null,'',u);}
  function render() {
    const story = stories[current], item = story.shots[shot];
    select.value = story.id;
    $('episode-number').textContent = `${story.id} / 12`;
    $('episode-kind').textContent = story.kind === '實拍' ? '實拍建議' : 'H3 短劇';
    $('episode-title').textContent = story.title;
    $('episode-meta').textContent = `${story.cast}　・　約 30 秒　・　直式 9:16`;
    $('episode-why').textContent = story.why;
    $('episode-progress').textContent = `${current+1} / ${stories.length}`;
    for (const id of ['prev-episode','prev-episode-bottom']) $(id).disabled = current === 0;
    for (const id of ['next-episode','next-episode-bottom']) $(id).disabled = current === stories.length - 1;
    tabs.replaceChildren();
    for (let i=0;i<4;i++) { const b=document.createElement('button'); b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(i===shot));b.setAttribute('aria-label',`鏡頭 ${i+1}，${story.shots[i].time}`);b.textContent=`鏡頭 ${i+1}`;b.addEventListener('click',()=>{shot=i;render()});tabs.appendChild(b); }
    const target=9/16, widthRatio=2*story.ratio/target, edge=(widthRatio/4-.5)/(widthRatio-1)*100;
    still.style.backgroundImage=`url("assets/${story.id}.webp")`;
    still.style.backgroundPosition=`${shot%2 ? 100-edge : edge}% ${shot<2?'0%':'100%'}`;
    still.setAttribute('aria-label',`${story.title}，鏡頭 ${shot+1}：女演員的拍攝情境示意`);
    $('photo-object').hidden=!item.product;
    $('photo-object').style.left=`${item.position[0]}%`; $('photo-object').style.top=`${item.position[1]}%`;
    $('visual-label').textContent=item.product?'實品照片合成 · 比例示意':'人物表情示意';
    $('shot-name').textContent=`鏡頭 ${shot+1}`; $('shot-time').textContent=item.time;
    $('shot-camera').textContent=item.camera; $('shot-action').textContent=item.action; $('shot-line').textContent=item.line; $('shot-prop').textContent=item.prop;
    $('prev-shot').disabled=shot===0; $('next-shot').disabled=shot===3;
    $('mode-notes').textContent=story.kind==='實拍'?'這支建議由一至兩位女演員及真實馬卡濃實拍；圖片是拍攝溝通用的構圖示意。':'這支規劃為 H3 系列短劇，約 30 秒可分兩段製作；人物一致性、產品外觀與口型尚未實際生成驗證。';
    updateUrl();
  }
  function changeEpisode(delta){current=Math.max(0,Math.min(stories.length-1,current+delta));shot=0;render();}
  select.addEventListener('change',()=>{current=stories.findIndex(x=>x.id===select.value);shot=0;render()});
  $('prev-episode').addEventListener('click',()=>changeEpisode(-1));
  $('prev-episode-bottom').addEventListener('click',()=>{changeEpisode(-1);$('viewer-title').scrollIntoView({block:'start'})});
  $('next-episode').addEventListener('click',()=>changeEpisode(1));
  $('next-episode-bottom').addEventListener('click',()=>{changeEpisode(1);$('viewer-title').scrollIntoView({block:'start'})});
  $('prev-shot').addEventListener('click',()=>{if(shot>0){shot--;render();tabs.scrollIntoView({block:'start'})}});
  $('next-shot').addEventListener('click',()=>{if(shot<3){shot++;render();tabs.scrollIntoView({block:'start'})}});
  $('share').addEventListener('click',async()=>{const data={title:`小烏龜｜${stories[current].title}`,text:`${stories[current].title}・鏡頭 ${shot+1}`,url:location.href};try{if(navigator.share){await navigator.share(data);return}await navigator.clipboard.writeText(data.url);toast('連結已複製')}catch(e){if(e.name!=='AbortError')toast('請複製瀏覽器網址分享')}});
  let timer; function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('toast').classList.remove('visible'),2600)}
  render();
})();