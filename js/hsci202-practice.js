(()=>{const D=window.HSCI202_DATA;if(!D)return;const $=s=>document.querySelector(s);
const allSets=[...D.mcq_sets,...D.recall_sets],byId=id=>allSets.find(s=>s.id===id);let sess=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function clone(qs){return qs.map(q=>({...q,options:(q.options||[]).map(o=>({...o}))}))}
function setup(){
  $('#hs202Set').innerHTML=D.mcq_sets.map(s=>`<option value="${s.id}">${s.section} • ${s.title} — ${s.questions.length}</option>`).join('');
  $('#hs202SetCards').innerHTML=D.mcq_sets.map(s=>`<article class="pastExamCard"><div class="examCardTop"><span>${s.section.toUpperCase()}</span><b>${s.questions.length} items</b></div><h3>${esc(s.title)}</h3><p>${esc(s.subtitle)}</p><div class="examStatus keyed">SOURCE-KEYED + RATIONALE</div><button data-id="${s.id}">Practice this set →</button></article>`).join('');
  document.querySelectorAll('#hs202SetCards button').forEach(b=>b.onclick=()=>start(byId(b.dataset.id).questions,byId(b.dataset.id).title,'mcq'));
  const p=new URLSearchParams(location.search),set=p.get('set'),mode=p.get('mode');
  if(set&&byId(set)){const s=byId(set);start(s.questions,s.title,s.group==='Recall'?'recall':'mcq')}
  else if(mode==='mix'){let pool=D.mcq_sets.flatMap(s=>s.questions);start(shuffle(pool).slice(0,30),'Mixed Neuro Challenge','mcq')}
}
function start(qs,title,mode){sess={questions:clone(qs),title,mode,index:0,responses:{},checked:{},marked:{},revealed:{},ratings:{},xpAwarded:{},xp:0,submitted:false};$('#hs202Runner').hidden=false;document.body.classList.add('runnerOpen');window.scrollTo(0,0);render()}
function cur(){return sess.questions[sess.index]}
function render(){
  const q=cur(),set=byId(q.set_id),isRecall=q.type==='recall';
  $('#hs202Progress').textContent=`${sess.index+1} / ${sess.questions.length}`;
  $('#hs202ProgressFill').style.width=`${(sess.index+1)/sess.questions.length*100}%`;
  $('#hs202SessionXP').textContent=sess.xp;
  $('#hs202Mode').textContent=isRecall?'RECALL':'MCQ PRACTICE';
  $('#hs202SectionLabel').textContent=(set.section||set.title).toUpperCase();
  $('#hs202QuestionNo').textContent=isRecall?'Recall prompt':`Question ${sess.index+1}`;
  $('#hs202SourceNumber').textContent=`SOURCE ITEM ${q.source_number} • ${set.title}`;
  $('#hs202KeyBadge').textContent=isRecall?'SOURCE RECALL':'COMPILED SOURCE KEY';
  $('#hs202KeyBadge').className='keyBadge keyed';
  $('#hs202Download').href=`assets/references/hsci202-neuroanatomy/${set.source}`;
  $('#hs202Prompt').textContent=q.prompt;
  $('#hs202Mark').textContent=sess.marked[q.id]?'★':'☆';

  const area=$('#hs202ResponseArea'),fb=$('#hs202Feedback'),rp=$('#hs202Rationale');
  fb.className='sourceKeyFeedback';fb.innerHTML='';rp.className='rationalePanel';rp.innerHTML='';

  if(!isRecall){
    const sel=sess.responses[q.id]||'';
    area.innerHTML=`<div class="duoChoices">${q.options.map(o=>`<button class="${sel===o.label?'selected':''}" data-v="${esc(o.label)}"><b>${esc(o.label)}</b><span>${esc(o.text)}</span></button>`).join('')}</div>`;
    area.querySelectorAll('button').forEach(b=>b.onclick=()=>{sess.responses[q.id]=b.dataset.v;render();$('#hs202Hint').textContent='Ready to check?'});
    const reveal=sess.submitted||sess.checked[q.id];
    if(reveal){
      const ok=sess.responses[q.id]===q.answer;
      fb.className='sourceKeyFeedback show '+(ok?'ok':'bad');
      fb.innerHTML=`<b>${ok?'Correct':'Source answer: '+esc(q.answer)}</b>`;
      rp.className='rationalePanel show';
      rp.innerHTML=`<span>RATIONALE</span><p>${esc(q.rationale)}</p>`;
    }
    $('#hs202Check').style.display=sess.submitted?'none':'inline-flex';
    $('#hs202Check').textContent=sess.checked[q.id]?'Checked ✓':'Check';
    $('#hs202Hint').textContent=sess.checked[q.id]?(sess.responses[q.id]===q.answer?'Correct — keep going.':'Review the rationale, then continue.'):'Choose the best answer.';
  }else{
    const shown=!!sess.revealed[q.id],rating=sess.ratings[q.id]||'';
    area.innerHTML=`<div class="recallOnly">
      ${shown?`<div class="recallReveal"><small>SOURCE ANSWER</small><strong>${esc(q.answer)}</strong></div>`:''}
      <button class="recallRevealBtn" id="revealHs202">${shown?'Hide answer':'Reveal answer'}</button>
      ${shown?`<div class="recallRate"><button data-rate="know" class="${rating==='know'?'active':''}">✓ Know it</button><button data-rate="review" class="${rating==='review'?'active':''}">↻ Review again</button></div>`:''}
    </div>`;
    $('#revealHs202').onclick=()=>{sess.revealed[q.id]=!shown;render()};
    area.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{const first=!sess.ratings[q.id];sess.ratings[q.id]=b.dataset.rate;if(first&&b.dataset.rate==='know'&&!sess.xpAwarded[q.id]){sess.xpAwarded[q.id]=1;sess.xp+=3;localStorage.setItem('medudemyXP',String(Number(localStorage.getItem('medudemyXP')||0)+3))}saveRecall(q.id,b.dataset.rate);render()});
    if(shown&&q.rationale){rp.className='rationalePanel show';rp.innerHTML=`<span>SOURCE NOTE</span><p>${esc(q.rationale)}</p>`}
    $('#hs202Check').style.display='none';
    $('#hs202Hint').textContent=shown?(rating==='know'?'Marked as known.':'Decide whether you know it or want to review it again.'):'Recall the answer first, then reveal it.';
  }
  $('#hs202Prev').disabled=sess.index===0;
  $('#hs202Next').textContent=sess.index===sess.questions.length-1?'Finish →':'Continue';
}
function saveRecall(id,rating){let x={};try{x=JSON.parse(localStorage.getItem('medudemyHS202Recall')||'{}')}catch{}x[id]=rating;localStorage.setItem('medudemyHS202Recall',JSON.stringify(x))}
$('#startHs202Set').onclick=()=>{const s=byId($('#hs202Set').value);if(s)start(s.questions,s.title,'mcq')};
$('#hs202MixCount').oninput=()=>$('#startHs202Mix').textContent=`Build ${Math.max(10,+$('#hs202MixCount').value||30)}-item mix`;
$('#startHs202Mix').onclick=()=>{let pool=D.mcq_sets.flatMap(s=>s.questions),n=Math.min(pool.length,Math.max(10,+$('#hs202MixCount').value||30));start(shuffle(pool).slice(0,n),'Mixed Neuro Challenge','mcq')};
$('#startSimpleRecall').onclick=()=>{const s=byId('simple-recall');start(s.questions,s.title,'recall')};
$('#startStructuredRecall').onclick=()=>{const s=byId('structured-recall');start(s.questions,s.title,'recall')};
$('#hs202Check').onclick=()=>{const q=cur();if(!sess.responses[q.id]){$('#hs202Hint').textContent='Choose an answer first.';return}const first=!sess.checked[q.id];sess.checked[q.id]=true;if(first&&sess.responses[q.id]===q.answer&&!sess.xpAwarded[q.id]){sess.xpAwarded[q.id]=1;sess.xp+=5;localStorage.setItem('medudemyXP',String(Number(localStorage.getItem('medudemyXP')||0)+5))}render()};
$('#hs202Next').onclick=()=>{const q=cur();if(q.type==='mcq'&&sess.responses[q.id]&&!sess.checked[q.id]&&!sess.submitted){$('#hs202Check').click();return}if(sess.index<sess.questions.length-1){sess.index++;render()}else submit()};
$('#hs202Prev').onclick=()=>{if(sess.index>0){sess.index--;render()}};
$('#hs202Mark').onclick=()=>{const q=cur();sess.marked[q.id]=!sess.marked[q.id];render()};
$('#exitHs202').onclick=()=>{if(confirm('Exit this practice session?')){$('#hs202Runner').hidden=true;document.body.classList.remove('runnerOpen')}};
function submit(){
  sess.submitted=true;
  const recalls=sess.questions.filter(q=>q.type==='recall');
  if(recalls.length===sess.questions.length){
    const known=recalls.filter(q=>sess.ratings[q.id]==='know').length,review=recalls.filter(q=>sess.ratings[q.id]==='review').length;
    $('#hs202Score').textContent=`${known} known`;
    $('#hs202Pct').textContent=`${review} review`;
    $('#hs202ResultMeta').innerHTML=`<b>${recalls.length} recall prompts</b><span>${known} know • ${review} review again • ${sess.xp} XP earned</span>`;
  }else{
    const keyed=sess.questions,correct=keyed.filter(q=>sess.responses[q.id]===q.answer).length,answered=keyed.filter(q=>sess.responses[q.id]).length;
    $('#hs202Score').textContent=`${correct} / ${keyed.length}`;
    $('#hs202Pct').textContent=`${Math.round(correct/keyed.length*100)}%`;
    $('#hs202ResultMeta').innerHTML=`<b>${answered} / ${keyed.length} answered</b><span>All items source-keyed • ${sess.xp} XP earned</span>`;
  }
  $('#hs202Result').showModal();
}
$('#hs202Result .close').onclick=$('#hs202Done').onclick=()=>{$('#hs202Result').close();$('#hs202Runner').hidden=true;document.body.classList.remove('runnerOpen')};
$('#hs202Review').onclick=()=>{$('#hs202Result').close();sess.index=0;render()};
setup();
})();