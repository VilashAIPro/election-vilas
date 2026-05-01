"use strict";

/**
 * VoteIQ — India Election Process Guide
 * Premium Modular Architecture
 * 
 * This file encapsulates all UI logic into clean, maintainable modules.
 */

// ————— CONFIGURATION & STATE —————
const APP_STATE = {
  tlSeen: new Set(),
  qIdx: 0,
  score: 0,
  answered: false,
  countdowns: [],
  activeIdx: -1,
  cdInterval: null
};

const CONSTANTS = {
  TOTAL_TL_STEPS: 8,
  TOTAL_CHECKLIST: 7,
  GEMINI_KEY: "AIzaSyBDCVfC6mzoUBWGrbqh53QaavbH53cMByc",
  GA_ID: 'G-VOTEIQ2024'
};

// ————— UTILITIES —————
const Utils = {
  /** Tracks events in Google Analytics */
  track(name, params) {
    try { if (typeof gtag === 'function') gtag('event', name, params); } catch(e) {}
  },
  /** Announces messages for Accessibility */
  announce(msg) {
    const r = document.getElementById('liveRegion');
    if (r) { r.textContent = ''; setTimeout(() => { r.textContent = msg; }, 50); }
  }
};

// ————— CORE MODULES —————

/** NAVIGATION MODULE */
const Nav = {
  toggle() {
    const nav = document.getElementById('mobileNav');
    const ham = document.getElementById('ham');
    if (!nav || !ham) return;
    const isOpen = nav.classList.toggle('open');
    ham.setAttribute('aria-expanded', String(isOpen));
    nav.setAttribute('aria-hidden', String(!isOpen));
  },
  close() {
    const nav = document.getElementById('mobileNav');
    const ham = document.getElementById('ham');
    if (nav) nav.classList.remove('open');
    if (ham) ham.setAttribute('aria-expanded', 'false');
  }
};

/** PHASES MODULE */
const Phases = {
  DATA: {
    pre: { tag: 'Phase 01 — Pre-Election', title: 'Pre-election phase', body: 'Announcements, voter registration (Form 6), nominations, and campaign monitoring.' },
    day: { tag: 'Phase 02 — Election Day', title: 'Election day / polling', body: 'Voters cast their ballot using EVM and VVPAT. Strict security is maintained.' },
    post: { tag: 'Phase 03 — Post-Election', title: 'Post-election phase', body: 'Counting of votes at designated centres, declaration of results, and government formation.' }
  },
  select(el, key) {
    document.querySelectorAll('.phase-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    const d = this.DATA[key];
    const detail = document.getElementById('phase-detail');
    if (!detail) return;
    detail.textContent = '';
    
    const tag = document.createElement('div'); tag.className = 'phase-detail-tag'; tag.textContent = d.tag;
    const h3 = document.createElement('h3'); h3.textContent = d.title;
    const p = document.createElement('p'); p.style.marginTop='8px'; p.textContent = d.body;
    
    detail.append(tag, h3, p);
    Utils.track('phase_selected', { phase: key });
  }
};

/** TIMELINE MODULE */
const Timeline = {
  toggle(el, idx) {
    const isOpen = el.classList.toggle('open');
    const header = el.querySelector('.tl-header');
    if (header) header.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) APP_STATE.tlSeen.add(idx);
    const progress = Math.round((APP_STATE.tlSeen.size / CONSTANTS.TOTAL_TL_STEPS) * 100);
    const fill = document.getElementById('tl-fill');
    const lbl = document.getElementById('tl-lbl');
    if (fill) fill.style.width = progress + '%';
    if (lbl) lbl.textContent = `${APP_STATE.tlSeen.size} of ${CONSTANTS.TOTAL_TL_STEPS} steps explored`;
    if (APP_STATE.tlSeen.size === CONSTANTS.TOTAL_TL_STEPS) Utils.announce('Timeline complete!');
  }
};

/** QUIZ MODULE */
const Quiz = {
  QUESTIONS: [
    {q:'Minimum voting age in India?', opts:['16 years','18 years','21 years','25 years'], ans:1, exp:'61st Amendment (1988) lowered it to 18.'},
    {q:'How many elected seats in Lok Sabha?', opts:['543','545','550','520'], ans:0, exp:'543 constituencies. Anglo-Indian seats abolished in 2020.'},
    {q:'EVM stands for?', opts:['Electronic Vote Map','Electronic Voting Machine','Electoral Vote Method'], ans:1, exp:'Used universally since 2004.'},
    {q:'What is NOTA?', opts:['National Order','None of the Above','New Option'], ans:1, exp:'Allows rejection of all candidates.'},
    {q:'Which form for new voter registration?', opts:['Form 4','Form 6','Form 8'], ans:1, exp:'Form 6 is for new registrations.'}
  ],
  render() {
    const q = this.QUESTIONS[APP_STATE.qIdx];
    const counter = document.getElementById('quizCounter');
    const fill = document.getElementById('quizFill');
    if (counter) counter.textContent = `${APP_STATE.qIdx+1} / ${this.QUESTIONS.length}`;
    if (fill) fill.style.width = ((APP_STATE.qIdx+1)/this.QUESTIONS.length*100) + '%';
    
    const card = document.getElementById('quizCard');
    if (!card) return;
    card.textContent = '';
    const qText = document.createElement('div'); qText.className='quiz-q-text'; qText.textContent=q.q;
    const optsDiv = document.createElement('div'); optsDiv.className='quiz-opts';
    
    q.opts.forEach((o, i) => {
      const b = document.createElement('button'); b.className='quiz-opt'; b.textContent=o;
      b.onclick = () => this.answer(b, i);
      optsDiv.appendChild(b);
    });
    
    const exp = document.createElement('div'); exp.className='quiz-exp'; exp.id='qExp'; exp.textContent=q.exp;
    card.append(qText, optsDiv, exp);
    const nb = document.getElementById('quizNextBtn');
    if (nb) nb.style.display='none';
    APP_STATE.answered = false;
  },
  answer(btn, idx) {
    if (APP_STATE.answered) return;
    APP_STATE.answered = true;
    const q = this.QUESTIONS[APP_STATE.qIdx];
    const opts = document.querySelectorAll('.quiz-opt');
    opts.forEach(o => o.disabled = true);
    if (idx === q.ans) { btn.classList.add('correct'); APP_STATE.score++; }
    else { btn.classList.add('wrong'); opts[q.ans].classList.add('reveal'); }
    const exp = document.getElementById('qExp');
    if (exp) exp.style.display='block';
    const nb = document.getElementById('quizNextBtn');
    if (nb) {
      nb.style.display='block';
      nb.textContent = APP_STATE.qIdx === this.QUESTIONS.length - 1 ? 'See results' : 'Next Question';
    }
  },
  next() {
    APP_STATE.qIdx++;
    if (APP_STATE.qIdx >= this.QUESTIONS.length) { this.showScore(); return; }
    this.render();
  },
  showScore() {
    const main = document.getElementById('quizMain');
    const sc = document.getElementById('quizScoreCard');
    if (main) main.style.display='none';
    if (sc) {
      sc.style.display='block';
      const num = document.getElementById('quizScoreNum');
      if (num) num.textContent = `${APP_STATE.score}/${this.QUESTIONS.length}`;
    }
  },
  reset() {
    APP_STATE.qIdx = 0; APP_STATE.score = 0;
    const main = document.getElementById('quizMain');
    const sc = document.getElementById('quizScoreCard');
    if (sc) sc.style.display='none';
    if (main) main.style.display='block';
    this.render();
  }
};

/** COUNTDOWN MODULE */
const Countdown = {
  add(name, date) {
    if (!name || !date) return;
    APP_STATE.countdowns.push({ name, date });
    this.renderList();
    this.setActive(APP_STATE.countdowns.length - 1);
  },
  renderList() {
    const list = document.getElementById('savedList');
    if (!list) return;
    list.textContent = '';
    APP_STATE.countdowns.forEach((c, i) => {
      const item = document.createElement('div');
      item.className = `saved-item ${APP_STATE.activeIdx === i ? 'active-item' : ''}`;
      item.onclick = () => this.setActive(i);
      item.textContent = c.name;
      list.appendChild(item);
    });
  },
  setActive(i) {
    APP_STATE.activeIdx = i;
    this.renderList();
    clearInterval(APP_STATE.cdInterval);
    const target = new Date(APP_STATE.countdowns[i].date).getTime();
    const nameEl = document.getElementById('cdName');
    const display = document.getElementById('cdDisplay');
    if (nameEl) nameEl.textContent = APP_STATE.countdowns[i].name;
    if (display) display.classList.add('visible');
    
    const dEl = document.getElementById('cdDays');
    const hEl = document.getElementById('cdHours');
    const mEl = document.getElementById('cdMins');
    const sEl = document.getElementById('cdSecs');

    APP_STATE.cdInterval = setInterval(() => {
      const diff = target - Date.now();
      if (diff < 0) { 
        clearInterval(APP_STATE.cdInterval); 
        if (dEl) dEl.textContent = '00';
        return; 
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      
      if (dEl) dEl.textContent = String(d).padStart(2, '0');
      if (hEl) hEl.textContent = String(h).padStart(2, '0');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');
    }, 1000);
  }
};

/** AI MODULE (GEMINI) */
const AI = {
  async send() {
    const input = document.getElementById('aiInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    this.append(text, 'user');
    input.value = '';
    
    const loadId = 'ai-load-' + Date.now();
    this.append('Thinking...', 'bot loading', loadId);
    
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONSTANTS.GEMINI_KEY}`;
      const res = await fetch(url, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents: [{ parts: [{ text: `Indian Election Guide: ${text}` }] }] })
      });
      const data = await res.json();
      const loadEl = document.getElementById(loadId);
      if (loadEl) loadEl.remove();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to answer that.";
      this.append(reply, 'bot');
    } catch(e) {
      const loadEl = document.getElementById(loadId);
      if (loadEl) loadEl.textContent = "AI offline. Please check ECI.gov.in";
    }
  },
  append(t, c, id) {
    const m = document.getElementById('aiMessages');
    if (!m) return;
    const d = document.createElement('div'); d.className=`ai-msg ${c}`; d.textContent=t; if(id) d.id=id;
    m.appendChild(d); m.scrollTop = m.scrollHeight;
  },
  toggle() {
    const box = document.getElementById('aiBox');
    const btn = document.getElementById('aiToggle');
    if (!box || !btn) return;
    const open = box.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      const input = document.getElementById('aiInput');
      if (input) input.focus();
    }
  }
};

// ————— FEEDBACK MODULE —————
let currentRating = 0;

const Feedback = {
  rate(val) {
    currentRating = val;
    document.querySelectorAll('.fb-star').forEach((s, i) => {
      s.classList.toggle('active', i < val);
    });
    const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];
    const lbl = document.getElementById('fb-rating-lbl');
    if (lbl) lbl.textContent = labels[val] || 'Select a rating';
  },

  async submit() {
    const textEl = document.getElementById('fbText');
    if (!textEl) return;
    const text = textEl.value.trim();
    const statusEl = document.getElementById('fb-status');

    if (!currentRating) {
      if (statusEl) { statusEl.textContent = 'Please select a rating first.'; statusEl.style.color = '#F59E0B'; }
      return;
    }
    if (text.length < 5) {
      if (statusEl) { statusEl.textContent = 'Please enter at least 5 characters.'; statusEl.style.color = '#EF4444'; }
      return;
    }

    const btn = document.getElementById('fbSubmitBtn');
    if (btn) btn.disabled = true;
    if (statusEl) { statusEl.textContent = 'Submitting...'; statusEl.style.color = 'var(--text3)'; }

    try {
      if (window.VoteIQBackend?.DataService) {
        await window.VoteIQBackend.DataService.submitFeedback(text, currentRating);
      }
      if (statusEl) { statusEl.textContent = '✅ Thank you! Your feedback has been saved.'; statusEl.style.color = '#10B981'; }
      textEl.value = '';
      currentRating = 0;
      document.querySelectorAll('.fb-star').forEach(s => s.classList.remove('active'));
      const lbl = document.getElementById('fb-rating-lbl');
      if (lbl) lbl.textContent = 'Select a rating';
    } catch(e) {
      if (statusEl) { statusEl.textContent = 'Submission failed. Please try again.'; statusEl.style.color = '#EF4444'; }
      if (btn) btn.disabled = false;
    }
  }
};

/** INITIALIZATION */
document.addEventListener('DOMContentLoaded', () => {
  Quiz.render();
  Countdown.add('Bihar Assembly 2025', '2025-10-15');

  // Map globals for HTML calls
  window.toggleMobileNav = () => Nav.toggle();
  window.closeMobileNav = () => Nav.close();
  window.selectPhase = (el, k) => Phases.select(el, k);
  window.toggleTL = (el, i) => Timeline.toggle(el, i);
  window.answerQ = (b, i) => Quiz.answer(b, i);
  window.nextQuestion = () => Quiz.next();
  window.resetQuiz = () => Quiz.reset();
  window.toggleAI = () => AI.toggle();
  window.sendAIMsg = () => AI.send();
  window.addCountdown = () => {
    const name = document.getElementById('cdElectionName')?.value;
    const date = document.getElementById('cdDate')?.value;
    Countdown.add(name, date);
  };
  window.addPreset = (name, date) => {
    const nameInp = document.getElementById('cdElectionName');
    const dateInp = document.getElementById('cdDate');
    if (nameInp) nameInp.value = name;
    if (dateInp) dateInp.value = date;
    Countdown.add(name, date);
  };
  window.toggleCheck = (el) => {
    el.classList.toggle('checked');
    const done = document.querySelectorAll('.check-item.checked').length;
    const fill = document.getElementById('vc-fill');
    if (fill) fill.style.width = Math.round((done / 7) * 100) + '%';
    if (done === 7) Utils.announce('All checklist items complete! You are election-ready.');
  };
  window.signIn = () => {
    if (window.VoteIQBackend?.AuthService) {
      window.VoteIQBackend.AuthService.signInWithGoogle().catch(console.warn);
    } else {
      const b = document.getElementById('btnSignIn');
      if (b) { b.textContent = 'Signed In'; b.disabled = true; }
    }
  };

  // Expose feedback module
  window.VoteIQ = window.VoteIQ || {};
  window.VoteIQ.rateStar = (v) => Feedback.rate(v);
  window.VoteIQ.submitFeedback = async () => {
    await Feedback.submit();
    if (window.BadgeService) window.BadgeService.unlock('CONTRIBUTOR');
  };

  // Integrate quiz score saving with backend
  const origShowScore = Quiz.showScore.bind(Quiz);
  Quiz.showScore = function() {
    origShowScore();
    if (window.VoteIQBackend?.DataService) {
      window.VoteIQBackend.DataService.saveQuizResult(APP_STATE.score, Quiz.QUESTIONS.length).catch(console.warn);
    }
    if (APP_STATE.score === Quiz.QUESTIONS.length && window.BadgeService) {
      window.BadgeService.unlock('SCHOLAR');
    }
  };

  // Initialize badges
  if (window.BadgeService) {
    window.BadgeService.renderCollection('badgesCollection');
  }
});

// Update timeline to track Explorer badge
const origToggleTL = Timeline.toggle.bind(Timeline);
Timeline.toggle = function(el, idx) {
  origToggleTL(el, idx);
  if (APP_STATE.tlSeen.size === CONSTANTS.TOTAL_TL_STEPS && window.BadgeService) {
    window.BadgeService.unlock('EXPLORER');
  }
};

// Update checklist to track Citizen badge
const origToggleCheck = window.toggleCheck;
window.toggleCheck = (el) => {
  origToggleCheck(el);
  const done = document.querySelectorAll('.check-item.checked').length;
  if (done === 7 && window.BadgeService) {
    window.BadgeService.unlock('CITIZEN');
  }
};

