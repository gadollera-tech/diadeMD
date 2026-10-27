(() => {
const D=window.HSCI208_DATA;if(!D)return;
const $=s=>document.querySelector(s);
const byId=id=>D.sets.find(s=>s.id===id);
const sourceBase='assets/references/hsci208-finals/';
let sess=null,timer=null;

function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function setup(){
  const opts=D.sets.map(s=>`<option value="${s.id}">${s.system} • ${s.title} — ${s.questions.length} items</option>`).join('');
  $('#setSelect').innerHTML=opts;$('#timedSetSelect').innerHTML=opts;
  $('#pastExamGrid').innerHTML=D.sets.map(s=>`
  <article class="pastExamCard">
    <div class="examCardTop"><span>${s.system.toUpperCase()}</span><b>${s.questions.length} items</b></div>
    <h3>${esc(s.title)}</h3><p>${esc(s.subtitle)}</p>
    <div class="examStatus ${s.key_status==='source'?'keyed':'unkeyed'}">${s.key_status==='source'?'SOURCE ANSWERS INCLUDED':'ANSWER KEY NOT IN SOURCE'}</div>
    <button data-id="${s.id}">Practice this set →</button>
  </article>`).join('');
  document.querySelectorAll('.pastExamCard button').forEach(b=>b.onclick=()=>start('practice',byId(b.dataset.id).questions,byId(b.dataset.id).title,null));
  const params=new URLSearchParams(location.search),sys=params.get('system');
  if(sys){
    const first=D.sets.find(s=>s.system===sys);
    if(first){$('#setSelect').value=first.id;$('#timedSetSelect').value=first.id;}
  }
}

function cloneQuestions(qs){return qs.map(q=>({...q,options:(q.options||[]).map(o=>({...o}))}))}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

function start(mode,questions,title,minutes){
  clearInterval(timer);
  sess={mode,questions:cloneQuestions(questions),title,index:0,responses:{},marked:{},revealed:{},checked:{},xpAwarded:{},sessionXP:0,started:Date.now(),seconds:minutes?minutes*60:null,submitted:false};
  $('#hsciRunner').hidden=false;document.body.classList.add('runnerOpen');window.scrollTo(0,0);
  $('#hsciMode').textContent=mode==='mix'?'FINALS MIX':mode==='timed'?'TIMED PREVIOUS EXAM':'UNTIMED PREVIOUS EXAM';
  if(sess.seconds!==null){tick();timer=setInterval(()=>{sess.seconds--;tick();if(sess.seconds<=0){clearInterval(timer);submit(true)}},1000)}else $('#hsciTimer').textContent='Untimed';
  render();
}

function tick(){
  const t=Math.max(0,sess.seconds),m=Math.floor(t/60),s=t%60;
  $('#hsciTimer').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  $('#hsciTimer').classList.toggle('timerUrgent',t<=300);
}

function current(){return sess.questions[sess.index]}

function render(){
  const q=current(),set=byId(q.set_id);
  $('#hsciRunnerTitle').textContent=sess.title;
  $('#hsciRunnerSubtitle').textContent=`${sess.questions.length} items in this session`;
  $('#hsciProgress').textContent=`${sess.index+1} / ${sess.questions.length}`;
  const pf=$('#duoProgressFill'); if(pf) pf.style.width=`${((sess.index+1)/sess.questions.length)*100}%`;
  const sx=$('#duoSessionXP'); if(sx) sx.textContent=sess.sessionXP||0;
  $('#hsciSystemLabel').textContent=q.system.toUpperCase();
  $('#hsciQuestionNumber').textContent=`Question ${sess.index+1}`;
  $('#hsciSourceNumber').textContent=`SOURCE ITEM ${q.source_number} • ${set.title}`;
  $('#hsciPrompt').textContent=q.prompt;
  $('#hsciSourceBadge').textContent=q.key_source==='ARAL'?'ARAL VERIFIED KEY':q.key_status==='source'?'SOURCE KEY':q.key_status==='review'?'MEDUDEMY REVIEW KEY':'INSTRUCTOR CONFIRMATION RECOMMENDED';
  $('#hsciSourceBadge').className=q.key_source==='ARAL'?'keyBadge aralKey':q.key_status==='source'?'keyBadge keyed':q.key_status==='review'?'keyBadge reviewKey':'keyBadge pendingKey';
  $('#hsciSourceDownload').href=sourceBase+set.source;

  const responseArea=$('#hsciResponseArea');
  responseArea.innerHTML='';

  if(q.type==='mcq'){
    const sel=sess.responses[q.id]||'';
    responseArea.innerHTML=`<div id="hsciOptions" class="duoChoices">${
      (q.options||[]).map(o=>`<button class="${sel===o.label?'selected':''}" data-label="${esc(o.label)}"><b>${esc(o.label)}</b><span>${esc(o.text)}</span></button>`).join('')
    }</div>`;
    responseArea.querySelectorAll('#hsciOptions button').forEach(b=>b.onclick=()=>{
      sess.responses[q.id]=b.dataset.label;
      render();
      const h=$('#duoFeedbackHint'); if(h) h.textContent='Ready to check?';
    });
  } else if(q.type==='recall'){
    responseArea.innerHTML=`
      <div id="recallBox" class="recallBox">
        <textarea id="recallInput" placeholder="Type your recall answer..."></textarea>
        <button class="btn outline" id="revealRecall">${sess.revealed[q.id]?'Hide source answer':'Reveal source answer'}</button>
        <div id="recallAnswer" ${sess.revealed[q.id]?'':'hidden'}></div>
      </div>`;
    $('#recallInput').value=sess.responses[q.id]||'';
    $('#recallInput').oninput=e=>{sess.responses[q.id]=e.target.value};
    $('#recallAnswer').innerHTML=`<b>Source answer:</b> ${esc(q.answer||'')}<p>${esc(q.rationale||'')}</p>${q.key_note?`<small>${esc(q.key_note)}</small>`:''}`;
    $('#revealRecall').onclick=()=>{sess.revealed[q.id]=!sess.revealed[q.id];render()};
  } else if(q.type==='essay'){
    responseArea.innerHTML=`
      <div id="essayBox" class="recallBox">
        <textarea id="essayInput" rows="8" placeholder="Write your open-response answer..."></textarea>
      </div>`;
    $('#essayInput').value=sess.responses[q.id]||'';
    $('#essayInput').oninput=e=>{sess.responses[q.id]=e.target.value};
  }

  const fb=$('#sourceKeyFeedback'), rp=$('#rationalePanel');
  fb.innerHTML='';fb.className='sourceKeyFeedback';rp.innerHTML='';rp.className='rationalePanel';
  const canReveal=sess.submitted||sess.checked[q.id]||q.type==='recall'&&sess.revealed[q.id];
  if(canReveal){
    if(q.type==='mcq' && q.answer){
      const ok=sess.responses[q.id]===q.answer;
      const label=q.key_status==='source'?'Source answer':'MeduDemy review answer';
      fb.className='sourceKeyFeedback show '+(ok?'ok':'bad');
      fb.innerHTML=`<b>${ok?'Correct':label+': '+esc(q.answer)}</b>`;
    } else if(q.key_status==='pending'){
      fb.className='sourceKeyFeedback show neutral';
      fb.innerHTML='<b>Not force-scored — instructor confirmation recommended.</b>';
    }
    if(q.rationale){
      rp.className='rationalePanel show';
      rp.innerHTML=`<span>RATIONALE</span><p>${esc(q.rationale)}</p>${q.key_note?`<small>${esc(q.key_note)}</small>`:''}`;
    }
  }
  const cb=$('#checkHsciAnswer');
  if(cb){
    cb.style.display=(q.type==='mcq' && sess.mode!=='timed' && !sess.submitted)?'inline-flex':'none';
    cb.textContent=sess.checked[q.id]?'Checked ✓':'Check answer & rationale';
  }

  $('#markHsci').textContent=sess.marked[q.id]?'★ Marked for review':'☆ Mark for review';
  $('#hsciPrev').disabled=sess.index===0;
  $('#hsciNext').textContent=sess.index===sess.questions.length-1?'Finish →':'Next →';
  $('#hsciAnswered').textContent=Object.keys(sess.responses).filter(k=>String(sess.responses[k]).trim()).length;
  $('#hsciMarked').textContent=Object.values(sess.marked).filter(Boolean).length;
  palette();
}

function palette(){
  $('#hsciPalette').innerHTML=sess.questions.map((q,i)=>`<button data-i="${i}" class="${i===sess.index?'current':''} ${sess.responses[q.id]?'answered':''} ${sess.marked[q.id]?'marked':''}">${i+1}</button>`).join('');
  $('#hsciPalette').querySelectorAll('button').forEach(b=>b.onclick=()=>{sess.index=+b.dataset.i;render()});
}

function submit(auto=false){
  if(sess.submitted)return;
  clearInterval(timer);sess.submitted=true;
  const answered=sess.questions.filter(q=>String(sess.responses[q.id]||'').trim()).length;
  const scored=sess.questions.filter(q=>q.type==='mcq'&&q.answer&&q.key_status!=='pending');
  const sourceKeyed=scored.filter(q=>q.key_status==='source');
  const reviewKeyed=scored.filter(q=>q.key_status==='review');
  const correct=scored.filter(q=>sess.responses[q.id]===q.answer).length;
  const sourceCorrect=sourceKeyed.filter(q=>sess.responses[q.id]===q.answer).length;
  const reviewCorrect=reviewKeyed.filter(q=>sess.responses[q.id]===q.answer).length;
  const bySys={};
  sess.questions.forEach(q=>{
    if(!bySys[q.system])bySys[q.system]={total:0,answered:0};
    bySys[q.system].total++;if(String(sess.responses[q.id]||'').trim())bySys[q.system].answered++;
  });
  $('#hsciResultTitle').textContent=auto?'Time is up':'Session complete';
  $('#hsciCompletion').textContent=`${answered} / ${sess.questions.length}`;
  $('#keyedScoreBox').innerHTML=scored.length?`
      <b>Review score: ${correct} / ${scored.length}</b>
      <span>${sourceKeyed.length?`Source Key: ${sourceCorrect}/${sourceKeyed.length} • `:''}${reviewKeyed.length?`MeduDemy Review Key: ${reviewCorrect}/${reviewKeyed.length}`:''}</span>
      <small>Review keys are study aids added to questions whose uploaded file did not include an explicit answer key.</small>`:
      `<b>No scorable answer key in this session.</b><span>Use the rationale/instructor flag for self-review.</span>`;
  $('#hsciBreakdown').innerHTML=Object.entries(bySys).map(([name,x])=>`<div><span>${name}</span><b>${x.answered} / ${x.total}</b><small>answered</small></div>`).join('');
  $('#hsciResultNote').textContent=`You earned ${sess.sessionXP||0} XP this session. Review every answer and rationale before your next round.`;
  $('#hsciResultDialog').showModal();
}

$('#startSet').onclick=()=>{
  const s=byId($('#setSelect').value);
  if(!s){alert('Please choose an exam first.');return}
  start('practice',s.questions,s.title,null);
};
$('#startTimedHsci').onclick=()=>{
  const s=byId($('#timedSetSelect').value);
  if(!s){alert('Please choose an exam first.');return}
  start('timed',s.questions,s.title,Math.max(1,+$('#timedMinutesHsci').value||30));
};
$('#startMix').onclick=()=>{
  const systems=[...document.querySelectorAll('.systemChecks input:checked')].map(x=>x.value);
  if(!systems.length){alert('Choose at least one system.');return}
  let pool=D.sets.filter(s=>systems.includes(s.system)).flatMap(s=>s.questions);
  // Open-response essay item is excluded from random mixed drills.
  pool=pool.filter(q=>q.type!=='essay');
  const n=Math.min(pool.length,Math.max(10,+$('#mixCount').value||50));
  start('mix',shuffle(pool).slice(0,n),`Mixed Finals • ${systems.join(' + ')}`,null);
};
$('#mixCount').oninput=()=>{$('#startMix').textContent=`Build ${Math.max(10,+$('#mixCount').value||50)}-item mix`};
$('#checkHsciAnswer').onclick=()=>{
  const q=current();
  if(!sess.responses[q.id]){const h=$('#duoFeedbackHint');if(h)h.textContent='Choose an answer first.';return}
  const firstCheck=!sess.checked[q.id];
  sess.checked[q.id]=true;
  if(firstCheck && q.answer && q.key_status!=='pending' && sess.responses[q.id]===q.answer && !sess.xpAwarded[q.id]){
    sess.xpAwarded[q.id]=true;sess.sessionXP+=5;
    const total=Number(localStorage.getItem('medudemyXP')||0)+5;localStorage.setItem('medudemyXP',String(total));
  }
  render();
  const h=$('#duoFeedbackHint');
  if(h) h.textContent=(q.answer&&sess.responses[q.id]===q.answer)?'Nice! +5 XP':'Review the rationale, then continue.';
};
$('#markHsci').onclick=()=>{const q=current();sess.marked[q.id]=!sess.marked[q.id];render()};
$('#hsciPrev').onclick=()=>{if(sess.index>0){sess.index--;render()}};
$('#hsciNext').onclick=()=>{
  const q=current();
  if(q.type==='mcq' && sess.responses[q.id] && !sess.checked[q.id] && sess.mode!=='timed'){
    $('#checkHsciAnswer').click(); return;
  }
  if(sess.index<sess.questions.length-1){sess.index++;render();const h=$('#duoFeedbackHint');if(h)h.textContent='Choose the best answer.'}
  else submit(false)
};
$('#submitHsciTop').onclick=$('#submitHsciSide').onclick=()=>submit(false);
$('#exitHsci').onclick=e=>{e.preventDefault();if(confirm('Exit this practice session?')){clearInterval(timer);$('#hsciRunner').hidden=true;document.body.classList.remove('runnerOpen');window.scrollTo(0,0)}};
$('#hsciResultDialog .close').onclick=$('#hsciDone').onclick=()=>{$('#hsciResultDialog').close();$('#hsciRunner').hidden=true;document.body.classList.remove('runnerOpen');window.scrollTo(0,0)};
$('#hsciReview').onclick=()=>{$('#hsciResultDialog').close();sess.index=0;render()};

setup();
const params=new URLSearchParams(location.search);
const setParam=params.get('set'), systemParam=params.get('system'), modeParam=params.get('mode');
if(setParam && byId(setParam)){const s=byId(setParam);start('practice',s.questions,s.title,null)}
else if(systemParam && modeParam==='mix'){
  const pool=D.sets.filter(s=>s.system===systemParam).flatMap(s=>s.questions).filter(q=>q.type!=='essay');
  start('mix',shuffle(pool).slice(0,Math.min(30,pool.length)),`${systemParam} Challenge`,null);
}
})();