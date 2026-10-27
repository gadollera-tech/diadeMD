(()=>{const D=window.HSCI201_DATA;if(!D)return;const $=s=>document.querySelector(s);let sess=null,zoom=1;
const byId=id=>D.sets.find(s=>s.id===id);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function setup(){const opts=D.sets.map(s=>`<option value="${s.id}">${s.group} • ${s.title} — ${s.questions.length}</option>`).join('');$('#hs201Set').innerHTML=opts;const sn=D.sets.filter(s=>s.group==='Snell');$('#snellRegion').innerHTML=sn.map(s=>`<option value="${s.id}">${s.region} — ${s.questions.length}</option>`).join('');$('#hs201SetCards').innerHTML=D.sets.map(s=>`<article class="pastExamCard"><div class="examCardTop"><span>${s.group.toUpperCase()}</span><b>${s.questions.length} items</b></div><h3>${esc(s.title)}</h3><p>${esc(s.subtitle)}</p><div class="examStatus ${s.questions.some(q=>q.answer)?'keyed':'unkeyed'}">${s.questions.filter(q=>q.answer).length} KEYED • ${s.questions.filter(q=>q.key_status==='review_flag').length} FLAGGED</div><button data-id="${s.id}">Practice this set →</button></article>`).join('');document.querySelectorAll('#hs201SetCards button').forEach(b=>b.onclick=()=>start(byId(b.dataset.id).questions,byId(b.dataset.id).title));const p=new URLSearchParams(location.search),set=p.get('set'),group=p.get('group'),mode=p.get('mode');if(set&&byId(set))start(byId(set).questions,byId(set).title);else if(group&&mode==='mix'){let pool=D.sets.filter(s=>s.group===group).flatMap(s=>s.questions);start(shuffle(pool).slice(0,Math.min(30,pool.length)),`${group} Mixed Challenge`)}else if(group){const first=D.sets.find(s=>s.group===group);if(first)$('#hs201Set').value=first.id}}
function start(qs,title){sess={questions:qs.map(q=>({...q,options:(q.options||[]).map(o=>({...o}))})),title,index:0,responses:{},checked:{},marked:{},xpAwarded:{},xp:0,submitted:false};zoom=1;$('#hs201Runner').hidden=false;document.body.classList.add('runnerOpen');window.scrollTo(0,0);render()}
function cur(){return sess.questions[sess.index]}
function render(){const q=cur(),set=byId(q.set_id);$('#hs201Progress').textContent=`${sess.index+1} / ${sess.questions.length}`;$('#hs201ProgressFill').style.width=`${(sess.index+1)/sess.questions.length*100}%`;$('#hs201SessionXP').textContent=sess.xp;$('#hs201SourceLabel').textContent=`${q.group.toUpperCase()} • ${q.region.toUpperCase()}`;$('#hs201QuestionNo').textContent=`Question ${sess.index+1}`;$('#hs201SourceNumber').textContent=`SOURCE ITEM ${q.source_number} • ${set.title} • ${q.type==='text_mcq'?'TEXT MCQ':'TEXT + SOURCE IMAGE'}`;$('#hs201Download').href=`assets/references/hsci201-anatomy/${set.source}`;const ks=q.key_source||'';
if(q.key_status==='review_flag'){
  $('#hs201KeyBadge').textContent='REVIEW KEY • FLAWED ITEM';
  $('#hs201KeyBadge').className='keyBadge pendingKey';
}else if(q.key_status==='review'){
  $('#hs201KeyBadge').textContent='MEDUDEMY REVIEW KEY';
  $('#hs201KeyBadge').className='keyBadge reviewKey';
}else{
  $('#hs201KeyBadge').textContent=!q.answer?'NO SOURCE KEY IN FILE':ks.includes('Compiled Quiz')?'COMPILED SOURCE KEY':ks.includes('BRS')?'BRS SOURCE KEY':ks.includes('Snell')?'SNELL SOURCE KEY':'SOURCE KEY';
  $('#hs201KeyBadge').className=q.answer?'keyBadge keyed':'keyBadge pendingKey';
}$('#hs201Prompt').textContent=q.prompt;$('#hs201Mark').textContent=sess.marked[q.id]?'★':'☆';
const vis=$('#hs201Visual'),needsVisual=(q.type==='visual_mcq'||q.type==='hybrid_mcq');if(needsVisual){vis.hidden=false;$('#hs201PageImage').src=q.image;$('#hs201PageImage').style.width=`${zoom*100}%`;$('#hs201ZoomLabel').textContent=`${Math.round(zoom*100)}%`;$('#hs201PageLabel').textContent=`Original PDF page ${q.source_page} • visual required`}else vis.hidden=true;
const area=$('#hs201ResponseArea'),sel=sess.responses[q.id]||'';area.innerHTML=`<div class="duoChoices">${(q.options||[]).map(o=>{const t=String(o.text||'').trim(),show=t&&t!==String(o.label);return `<button class="${sel===o.label?'selected':''}" data-v="${esc(o.label)}"><b>${esc(o.label)}</b>${show?`<span>${esc(t)}</span>`:''}</button>`}).join('')}</div>`;area.querySelectorAll('button').forEach(b=>b.onclick=()=>{sess.responses[q.id]=b.dataset.v;render();$('#hs201Hint').textContent='Ready to check?'});
const reveal=sess.submitted||sess.checked[q.id],fb=$('#hs201Feedback'),rp=$('#hs201Rationale');fb.className='sourceKeyFeedback';fb.innerHTML='';rp.className='rationalePanel';rp.innerHTML='';if(reveal){
  if(q.answer){
    const ok=sess.responses[q.id]===q.answer;
    const label=q.key_status==='review'?'MeduDemy review answer':'Source answer';
    fb.className='sourceKeyFeedback show '+(ok?'ok':'bad');
    fb.innerHTML=`<b>${ok?'Correct':label+': '+esc(q.answer)}</b>`;
  }else if(q.review_answer_text){
    fb.className='sourceKeyFeedback show neutral';
    fb.innerHTML=`<b>${esc(q.review_answer_text)}</b>`;
  }else{
    fb.className='sourceKeyFeedback show neutral';
    fb.innerHTML='<b>No answer key is printed for this item in the uploaded source.</b>';
  }
  if(q.rationale){
    rp.className='rationalePanel show';
    rp.innerHTML=`<span>${q.key_status==='review'||q.key_status==='review_flag'?'MEDUDEMY REVIEW RATIONALE':'RATIONALE / SOURCE NOTE'}</span><p>${esc(q.rationale)}</p>${q.key_note?`<small>${esc(q.key_note)}</small>`:''}`;
  }
}
$('#hs201Prev').disabled=sess.index===0;$('#hs201Next').textContent=sess.index===sess.questions.length-1?'Finish →':'Continue';$('#hs201Check').style.display=sess.submitted?'none':'inline-flex'}
$('#startHs201Set').onclick=()=>{const s=byId($('#hs201Set').value);if(s)start(s.questions,s.title)};$('#startSnellRegion').onclick=()=>{const s=byId($('#snellRegion').value);if(s)start(s.questions,s.title)};$('#hs201MixCount').oninput=()=>$('#startHs201Mix').textContent=`Build ${Math.max(10,+$('#hs201MixCount').value||30)}-item mix`;$('#startHs201Mix').onclick=()=>{const groups=[...document.querySelectorAll('.hs201Checks input:checked')].map(x=>x.value);if(!groups.length)return alert('Choose at least one source.');let pool=D.sets.filter(s=>groups.includes(s.group)).flatMap(s=>s.questions);const n=Math.min(pool.length,Math.max(10,+$('#hs201MixCount').value||30));start(shuffle(pool).slice(0,n),'Mixed Anatomy Challenge')};
$('#hs201Check').onclick=()=>{const q=cur();if(!sess.responses[q.id]){$('#hs201Hint').textContent='Choose an answer first.';return}const first=!sess.checked[q.id];sess.checked[q.id]=true;if(first&&q.answer&&sess.responses[q.id]===q.answer&&!sess.xpAwarded[q.id]){sess.xpAwarded[q.id]=1;sess.xp+=5;localStorage.setItem('medudemyXP',String(Number(localStorage.getItem('medudemyXP')||0)+5))}render();$('#hs201Hint').textContent=q.answer?(sess.responses[q.id]===q.answer?'Nice! +5 XP':'Review the source note, then continue.'):(q.review_answer_text?'Flawed item — review the corrected concept.':'Unkeyed source item — use for self-testing.')};$('#hs201Next').onclick=()=>{const q=cur();if(sess.responses[q.id]&&!sess.checked[q.id]&&!sess.submitted){$('#hs201Check').click();return}if(sess.index<sess.questions.length-1){sess.index++;render();$('#hs201Hint').textContent='Choose the best answer.'}else submit()};$('#hs201Prev').onclick=()=>{if(sess.index>0){sess.index--;render()}};$('#hs201Mark').onclick=()=>{const q=cur();sess.marked[q.id]=!sess.marked[q.id];render()};$('#hs201ZoomIn').onclick=()=>{zoom=Math.min(1.8,zoom+.15);render()};$('#hs201ZoomOut').onclick=()=>{zoom=Math.max(.7,zoom-.15);render()};$('#exitHs201').onclick=()=>{if(confirm('Exit this practice session?')){$('#hs201Runner').hidden=true;document.body.classList.remove('runnerOpen')}};
function submit(){sess.submitted=true;
const keyed=sess.questions.filter(q=>q.answer),sourceKeyed=keyed.filter(q=>q.key_status!=='review'),reviewKeyed=keyed.filter(q=>q.key_status==='review'),flagged=sess.questions.filter(q=>q.key_status==='review_flag');
const correct=keyed.filter(q=>sess.responses[q.id]===q.answer).length,answered=sess.questions.filter(q=>sess.responses[q.id]).length;
$('#hs201Score').textContent=keyed.length?`${correct} / ${keyed.length}`:`${answered} answered`;
$('#hs201Pct').textContent=keyed.length?`${Math.round(correct/keyed.length*100)}%`:'';
$('#hs201ResultMeta').innerHTML=`<b>${answered} / ${sess.questions.length} answered</b><span>${sourceKeyed.length} source-keyed • ${reviewKeyed.length} MeduDemy review-keyed${flagged.length?' • '+flagged.length+' flawed/unscored':''} • ${sess.xp} XP earned</span>`;
$('#hs201Result').showModal()}
$('#hs201Result .close').onclick=$('#hs201Done').onclick=()=>{$('#hs201Result').close();$('#hs201Runner').hidden=true;document.body.classList.remove('runnerOpen')};$('#hs201Review').onclick=()=>{$('#hs201Result').close();sess.index=0;render()};setup()})();