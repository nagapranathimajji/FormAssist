/* FormAssist - client side MVP
   - Web Speech API for input (Telugu/English)
   - Dummy Bhashini hook (replace with real API key)
   - Safe client-side expansion fallback
   - No backend, deploy on Vercel
*/

const micBtn = document.getElementById('micBtn');
const micStatus = document.getElementById('micStatus');
const transcriptEl = document.getElementById('transcript');
const inputLangSel = document.getElementById('inputLang');
const outputLangSel = document.getElementById('outputLang');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const teluguOut = document.getElementById('teluguLetter');
const englishOut = document.getElementById('englishLetter');
const recipientName = document.getElementById('recipientName');
const honorificMode = document.getElementById('honorificMode');
const locationInput = document.getElementById('location');
const moduleBtns = document.querySelectorAll('.module-btn');
const tabs = document.querySelectorAll('.tab');
const outputsDiv = document.getElementById('outputs');

let recognition = null;
let listening = false;

// Feature: simple language detect (Telugu unicode check)
function guessLanguage(text){
  const teluguRange = /[\u0C00-\u0C7F]/;
  if(teluguRange.test(text)) return 'te';
  // fallback: english
  return 'en';
}

// Initialize Web Speech
function initSpeech(){
  if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)){
    micBtn.disabled = true;
    micStatus.textContent = 'Speech API not supported in this browser. Use Chrome.';
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    listening = true;
    micStatus.textContent = 'listening...';
    micBtn.textContent = '🎙 Stop';
  };
  recognition.onend = () => {
    listening = false;
    micStatus.textContent = 'idle';
    micBtn.textContent = '🎙 Start Speaking';
  };
  recognition.onerror = (e) => {
    listening = false;
    micStatus.textContent = 'error: ' + (e.error || 'unknown');
    micBtn.textContent = '🎙 Start Speaking';
  };
  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    // append or set
    if(transcriptEl.value && transcriptEl.value.trim().length>0){
      transcriptEl.value = transcriptEl.value.trim() + ' ' + text;
    } else {
      transcriptEl.value = text;
    }
  };
}

// Mic button handler
micBtn.addEventListener('click', () => {
  if(!recognition){ initSpeech(); }
  if(!recognition) return;
  // decide recognition language
  let chosen = inputLangSel.value;
  if(chosen === 'auto'){
    // default to Telugu if UI output both else en
    chosen = 'te-IN';
  }
  recognition.lang = chosen;
  if(listening){
    recognition.stop();
  } else {
    try {
      recognition.start();
    } catch(e) {
      // ignore already started
    }
  }
});

// module buttons
moduleBtns.forEach(b => b.addEventListener('click', (e) => {
  moduleBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
}));

// tabs
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  const show = t.dataset.show;
  if(show === 'both'){
    document.getElementById('teluguOut').style.display = 'block';
    document.getElementById('englishOut').style.display = 'block';
  } else if(show === 'telugu'){
    document.getElementById('teluguOut').style.display = 'block';
    document.getElementById('englishOut').style.display = 'none';
  } else {
    document.getElementById('teluguOut').style.display = 'none';
    document.getElementById('englishOut').style.display = 'block';
  }
}));

// helper: apply honorific
function applyHonorific(name, mode){
  if(!name || name.trim()==='') return '';
  name = name.trim();
  if(mode === 'garu') return `${name} గారు`;
  if(mode === 'gariki') return `${name} గారికి`;
  return name;
}

// Dummy Bhashini call (replace when key arrives)
async function callBhashiniExpand(text, targetLang='te', mode='expand'){
  // mode: 'expand' -> expand short text to paragraph
  // targetLang: 'te' or 'en'
  // THIS IS A DUMMY FUNCTION for MVP.
  // Replace with real fetch() to Bhashini when API key available.
  // Example fetch snippet (uncomment + replace):
  /*
  const resp = await fetch('https://api.bhashini.example/expand', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':'Bearer <YOUR_KEY>'
    },
    body: JSON.stringify({text, targetLang, mode})
  });
  const data = await resp.json();
  return data.output;
  */
  // Fallback simple safe expansion (client-side)
  return simpleSafeExpand(text, targetLang);
}

// Simple safe expansion (client-side): adds 3-5 polite sentences around user content
function simpleSafeExpand(text, targetLang){
  const t = text.trim();
  if(!t) return '';
  if(targetLang === 'en'){
    // English expansion templates
    const s1 = `I wish to bring to your attention that ${t}.`;
    const s2 = `This issue is causing inconvenience to the local residents.`;
    const s3 = `I kindly request you to look into this matter and take necessary action at the earliest.`;
    return `${s1} ${s2} ${s3}`;
  } else {
    // Telugu expansion - modern, simple phrases (no archaic language)
    const s1 = `ఈ విషయాన్ని మీ దృష్టికి తీసుకువచ్చవలసిన అవసరం ఏర్పడింది: ${t}.`;
    const s2 = `ఈ సమస్య వల్ల స్థానికుల‌కు అసౌకర్యం కలుగుతోంది.`;
    const s3 = `దయచేసి దీన్ని పరిశీలించి అవసరమైతే చర్య చేపట్టండి.`;
    return `${s1} ${s2} ${s3}`;
  }
}

// generate letter templates
function buildTeluguLetter(expandedPara, module){
  const recipient = applyHonorific(recipientName.value, honorificMode.value);
  const subjMap = {
    complaint: 'ఫిర్యాదు',
    application: 'అప్లికేషన్',
    report: 'ఫీల్డ్ రిపోర్ట్'
  };
  const subject = subjMap[module] || 'సంబంధిత విషయం';
  const loc = locationInput.value || '';
  // simple template
  return `${recipient ? recipient + ',' : ''}\n\nవిషయం: ${subject} - ${loc}\n\n${expandedPara}\n\nదయచేసి అవసరమైన చర్యలు తీసుకోవాలని కోరుతున్నాను.\n\nధన్యవాదాలు,\n\n${loc ? loc + '\n' : ''}`;
}

function buildEnglishLetter(expandedPara, module){
  const recipient = recipientName.value ? recipientName.value : 'The Concerned Officer';
  const subjMap = {
    complaint: 'Complaint',
    application: 'Application',
    report: 'Field Visit Report'
  };
  const subject = subjMap[module] || 'Related Matter';
  const loc = locationInput.value || '';
  return `To,\n${recipient}\n\nSubject: ${subject} ${loc ? ' - ' + loc : ''}\n\n${expandedPara}\n\nI request you to kindly look into this matter and take the necessary action.\n\nThank you,\n\n${loc ? loc + '\n' : ''}`;
}

// copy handler
document.querySelectorAll('.copyBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    const el = document.getElementById(target);
    navigator.clipboard.writeText(el.textContent.trim()).then(() => {
      btn.textContent = 'Copied ✓';
      setTimeout(()=> btn.textContent = 'Copy ' + (target === 'teluguLetter' ? 'Telugu' : 'English'), 1500);
    });
  });
});

clearBtn.addEventListener('click', () => {
  transcriptEl.value = '';
  teluguOut.textContent = '';
  englishOut.textContent = '';
  locationInput.value = '';
  recipientName.value = '';
});

// generate logic
generateBtn.addEventListener('click', async () => {
  const module = document.querySelector('.module-btn.active').dataset.module;
  let raw = transcriptEl.value.trim();
  if(!raw){
    alert('Please speak or type the issue first.');
    return;
  }

  // determine input language if auto
  let inLang = inputLangSel.value;
  if(inLang === 'auto'){
    const guessed = guessLanguage(raw);
    inLang = guessed === 'te' ? 'te-IN' : 'en-IN';
  }

  // decide outputs
  const outPref = outputLangSel.value; // both / te / en

  // Call Bhashini or fallback
  // Prefer client-side safety -> but code attempts real API if you implement callBhashiniExpand to fetch
  let expandedTelugu = '';
  let expandedEnglish = '';

  // If input is Telugu script or chosen Telugu, expand accordingly
  if( guessLanguage(raw) === 'te' ){
    // expand Telugu
    expandedTelugu = await callBhashiniExpand(raw, 'te', 'expand');
    // english: either translate via Bhashini NMT or create english expanded fallback
    expandedEnglish = await callBhashiniExpand(raw, 'en', 'translate');
  } else {
    // input English -> expand english and optionally produce Telugu via translation
    expandedEnglish = await callBhashiniExpand(raw, 'en', 'expand');
    expandedTelugu = await callBhashiniExpand(raw, 'te', 'translate');
  }

  // Build templates
  const telLetter = buildTeluguLetter(expandedTelugu, module);
  const enLetter = buildEnglishLetter(expandedEnglish, module);

  // Fill outputs according to user preference
  if(outPref === 'both' || outPref === 'te'){
    teluguOut.textContent = telLetter;
  } else {
    teluguOut.textContent = '';
  }
  if(outPref === 'both' || outPref === 'en'){
    englishOut.textContent = enLetter;
  } else {
    englishOut.textContent = '';
  }
});

// init UI
initSpeech();
