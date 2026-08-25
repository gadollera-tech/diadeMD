(() => {
  const D = window.NMAT_PRACTICE;
  if (!D) return;
  const $ = s => document.querySelector(s);
  const storageKey = 'medudemyNmatPracticeLast';
  let session = null, timerId = null, zoom = 1;

  const sectionById = id => D.sections.find(s => s.id === id);
  const pageSrc = p => `assets/references/nmat/cem-practice-set/pages/page-${String(p).padStart(3,'0')}.webp`;

  function fillSelectors() {
    const opts = D.sections.map(s => `<option value="${s.id}">Part ${s.part} • ${s.name} — ${s.count} items</option>`).join('');
    $('#practiceSection').innerHTML = opts;
    $('#timedSection').innerHTML = opts;
    $('#sectionCards').innerHTML = D.sections.map(s => `
      <article class="nmatSectionCard">
        <span>PART ${s.part}</span><h3>${s.name}</h3><p>${s.subtitle}</p>
        <small>${s.count} questions • ${s.choices.length} choices/item</small>
        <button data-section="${s.id}">Practice this subtest →</button>
      </article>`).join('');
    $('#sectionCards').querySelectorAll('button').forEach(b => b.onclick = () => {
      $('#practiceSection').value = b.dataset.section;
      start('practice', [b.dataset.section], null);
    });
  }

  function makeQuestions(sectionIds) {
    return sectionIds.flatMap(id => {
      const s = sectionById(id);
      return Array.from({length:s.count}, (_,i) => ({
        key:`${id}-${i+1}`, sectionId:id, sectionName:s.name, part:s.part,
        num:i+1, answer:s.answers[i], choices:s.choices, page:s.pages[i]
      }));
    });
  }

  function start(mode, sectionIds, minutes, mistakeQuestions=null) {
    clearInterval(timerId);
    const qs = mistakeQuestions || makeQuestions(sectionIds);
    session = {
      mode, questions:qs, index:0, responses:{}, marked:{}, checked:{},
      startedAt:Date.now(), secondsLeft: minutes ? Math.round(minutes*60) : null,
      initialSeconds: minutes ? Math.round(minutes*60) : null,
      submitted:false
    };
    zoom = 1;
    $('#testRunner').hidden = false;
    document.body.classList.add('runnerOpen');
    window.scrollTo({top:0,behavior:'instant'});
    $('#runnerMode').textContent = mode === 'practice' ? 'UNTIMED PRACTICE' :
      mode === 'timed' ? 'TIMED SECTION' : mode === 'mock' ? 'MOCK EXAM' : 'MISTAKE REVIEW';
    $('#checkAnswer').hidden = mode !== 'practice' && mode !== 'mistakes';
    if (minutes) {
      updateTimer();
      timerId = setInterval(() => {
        session.secondsLeft--;
        updateTimer();
        if (session.secondsLeft <= 0) {
          clearInterval(timerId);
          submit(true);
        }
      },1000);
    } else $('#runnerTimer').textContent = 'Untimed';
    render();
  }

  function updateTimer() {
    const t = Math.max(0,session.secondsLeft);
    const h = Math.floor(t/3600), m=Math.floor((t%3600)/60), s=t%60;
    $('#runnerTimer').textContent = (h?String(h).padStart(2,'0')+':':'') + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    $('#runnerTimer').classList.toggle('timerUrgent', t <= 300);
  }

  function renderPalette() {
    const p = $('#questionPalette');
    p.innerHTML = session.questions.map((q,i) => {
      const answered = session.responses[q.key];
      return `<button class="${i===session.index?'current':''} ${answered?'answered':''} ${session.marked[q.key]?'marked':''}" data-i="${i}" title="${q.sectionName} ${q.num}">${i+1}</button>`;
    }).join('');
    p.querySelectorAll('button').forEach(b => b.onclick = () => {session.index=+b.dataset.i;render();});
  }

  function render() {
    const q = session.questions[session.index], sec=sectionById(q.sectionId);
    $('#runnerTitle').textContent = session.mode==='mock' ? 'Mock Exam' : sec.name;
    $('#runnerSubtitle').textContent = session.mode==='mock' ? `${session.questions.length} questions in this session` : `Part ${sec.part} • ${sec.subtitle}`;
    $('#runnerProgress').textContent = `${session.index+1} / ${session.questions.length}`;
    $('#questionSection').textContent = `PART ${q.part} • ${q.sectionName.toUpperCase()}`;
    $('#questionTitle').textContent = `Question ${q.num}`;
    $('#answerQuestionLabel').textContent = `${q.sectionName} Question ${q.num}`;
    $('#sourcePageLabel').textContent = `Original source page ${q.page}`;
    const src = pageSrc(q.page);
    $('#sourcePageImage').src = src;
    $('#openPage').href = src;
    $('#sourcePageImage').style.width = `${zoom*100}%`;
    $('#zoomLabel').textContent = `${Math.round(zoom*100)}%`;

    const selected = session.responses[q.key];
    $('#answerChoices').innerHTML = q.choices.map(c => `<button class="${selected===c?'selected':''}" data-choice="${c}">${c}</button>`).join('');
    $('#answerChoices').querySelectorAll('button').forEach(b => b.onclick = () => {
      session.responses[q.key] = b.dataset.choice;
      render();
    });
    $('#markQuestion').textContent = session.marked[q.key] ? '★ Marked for review' : '☆ Mark for review';
    $('#answeredCount').textContent = Object.keys(session.responses).length;
    $('#markedCount').textContent = Object.keys(session.marked).filter(k=>session.marked[k]).length;
    $('#prevQuestion').disabled = session.index===0;
    $('#nextQuestion').textContent = session.index===session.questions.length-1 ? 'Finish →' : 'Next →';
    $('#practiceFeedback').innerHTML = '';
    if (session.checked[q.key] && (session.mode==='practice'||session.mode==='mistakes')) {
      const ok = session.responses[q.key] === q.answer;
      $('#practiceFeedback').className='practiceFeedback show '+(ok?'correct':'wrong');
      $('#practiceFeedback').innerHTML = `<b>${ok?'Correct.':'Correct answer: '+q.answer}</b><span>Answer key from the uploaded practice set.</span>`;
    } else $('#practiceFeedback').className='practiceFeedback';
    renderPalette();
  }

  function scoreSession() {
    const bySection={}; let correct=0;
    session.questions.forEach(q => {
      if (!bySection[q.sectionId]) bySection[q.sectionId]={name:q.sectionName,total:0,correct:0};
      bySection[q.sectionId].total++;
      if (session.responses[q.key]===q.answer) {correct++;bySection[q.sectionId].correct++;}
    });
    return {correct,total:session.questions.length,bySection};
  }

  function submit(auto=false) {
    if (session.submitted) return;
    session.submitted=true;
    clearInterval(timerId);
    const sc=scoreSession();
    const elapsed = Math.round((Date.now()-session.startedAt)/1000);
    const wrong = session.questions.filter(q => session.responses[q.key]!==q.answer);
    const saved = {at:Date.now(),wrong,score:sc,elapsed,mode:session.mode,responses:session.responses};
    localStorage.setItem(storageKey,JSON.stringify(saved));
    updateMistakes();
    $('#resultTitle').textContent = auto ? 'Time is up' : 'Session complete';
    $('#resultScore').textContent = `${sc.correct} / ${sc.total}`;
    $('#resultPct').textContent = `${Math.round(sc.correct/sc.total*100)}%`;
    $('#resultBreakdown').innerHTML = Object.values(sc.bySection).map(s =>
      `<div><span>${s.name}</span><b>${s.correct} / ${s.total}</b><small>${Math.round(s.correct/s.total*100)}%</small></div>`).join('');
    $('#resultTiming').textContent = `Elapsed time: ${formatElapsed(elapsed)} • Unanswered items are scored as incorrect.`;
    $('#reviewWrong').disabled = wrong.length===0;
    $('#nmatResultDialog').showModal();
  }

  const formatElapsed = sec => {
    const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
    return `${h?h+'h ':''}${m}m ${s}s`;
  };

  function updateMistakes() {
    let last=null; try{last=JSON.parse(localStorage.getItem(storageKey)||'null')}catch{}
    if (last && last.wrong?.length) {
      $('#mistakeCount').textContent = `${last.wrong.length} items from your latest completed session.`;
      $('#startMistakes').disabled=false;
    } else {
      $('#mistakeCount').textContent = last ? 'No wrong items in your latest session.' : 'No completed session yet.';
      $('#startMistakes').disabled=true;
    }
  }

  $('#startPractice').onclick=()=>start('practice',[$('#practiceSection').value],null);
  $('#startTimed').onclick=()=>{
    const min=Math.max(1,+$('#timedMinutes').value||30);
    start('timed',[$('#timedSection').value],min);
  };
  $('#startMock').onclick=()=>{
    const scope=$('#mockScope').value, min=Math.max(1,+$('#mockMinutes').value||180);
    const ids=scope==='part1'?D.sections.filter(s=>s.part===1).map(s=>s.id):
      scope==='part2'?D.sections.filter(s=>s.part===2).map(s=>s.id):D.sections.map(s=>s.id);
    start('mock',ids,min);
  };
  $('#startMistakes').onclick=()=>{
    let last=null;try{last=JSON.parse(localStorage.getItem(storageKey)||'null')}catch{}
    if(last?.wrong?.length) start('mistakes',[],null,last.wrong);
  };
  $('#markQuestion').onclick=()=>{const q=session.questions[session.index];session.marked[q.key]=!session.marked[q.key];render();};
  $('#prevQuestion').onclick=()=>{if(session.index>0){session.index--;render()}};
  $('#nextQuestion').onclick=()=>{if(session.index<session.questions.length-1){session.index++;render()}else submit(false)};
  $('#checkAnswer').onclick=()=>{
    const q=session.questions[session.index];
    if(!session.responses[q.key]){alert('Choose an answer first.');return}
    session.checked[q.key]=true;render();
  };
  $('#zoomIn').onclick=()=>{zoom=Math.min(1.8,zoom+.15);render()};
  $('#zoomOut').onclick=()=>{zoom=Math.max(.7,zoom-.15);render()};
  $('#submitTestTop').onclick=$('#submitTestSide').onclick=()=>submit(false);
  $('#exitTest').onclick=e=>{
    e.preventDefault();
    if(confirm('Exit this session? Your current answers will not be scored.')){
      clearInterval(timerId);session=null;$('#testRunner').hidden=true;document.body.classList.remove('runnerOpen');window.scrollTo(0,0);
    }
  };
  $('#nmatResultDialog .close').onclick=$('#closeResults').onclick=()=>{
    $('#nmatResultDialog').close();$('#testRunner').hidden=true;document.body.classList.remove('runnerOpen');window.scrollTo(0,0);
  };
  $('#reviewWrong').onclick=()=>{
    let last=null;try{last=JSON.parse(localStorage.getItem(storageKey)||'null')}catch{}
    $('#nmatResultDialog').close();
    if(last?.wrong?.length) start('mistakes',[],null,last.wrong);
  };

  fillSelectors();updateMistakes();
})();