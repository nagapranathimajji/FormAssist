/* ======================================
   FormAssist – Stable, Explainable Logic
   ====================================== */

// DOM
const micBtn = document.getElementById("micBtn");
const micStatus = document.getElementById("micStatus");
const transcriptEl = document.getElementById("transcript");

const speechLangSel = document.getElementById("speechLang");
const outputLangSel = document.getElementById("outputLang");
const letterTypeSel = document.getElementById("letterType");

const generateBtn = document.getElementById("generateBtn");
const teluguOut = document.getElementById("teluguOut");
const englishOut = document.getElementById("englishOut");

let recognition = null;
let listening = false;

/* ---------- Speech Recognition ---------- */
function initSpeech() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SR) {
    micStatus.textContent = "Speech not supported (use Chrome)";
    micBtn.disabled = true;
    return;
  }

  recognition = new SR();
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    listening = true;
    micStatus.textContent = "listening...";
    micBtn.textContent = "🎙 Stop";
  };

  recognition.onend = () => {
    listening = false;
    micStatus.textContent = "idle";
    micBtn.textContent = "🎙 Start Speaking";
  };

  recognition.onerror = (e) => {
    console.error(e);
    micStatus.textContent = "speech error";
    listening = false;
  };

  recognition.onresult = (e) => {
    transcriptEl.value = e.results[0][0].transcript;
  };
}

micBtn.addEventListener("click", async () => {
  if (!recognition) initSpeech();
  if (!recognition) return;

  recognition.lang = speechLangSel.value;

  if (listening) recognition.stop();
  else recognition.start();
});

/* ---------- Language Detection ---------- */
function detectLang(text) {
  return /[\u0C00-\u0C7F]/.test(text) ? "te" : "en";
}

/* ---------- Bhashini API ---------- */
const BHASHINI_API_KEY = "Y6pc66KE-9Hrlyb--vzlbiVZ1c5Njr7u2iOrmfNA0ET3Elc4QEMB3oSzAqVzfE9y";
const BHASHINI_ENDPOINT =
  "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";

async function bhashiniTranslate(text, src, tgt) {
  try {
    const payload = {
      pipelineTasks: [
        {
          taskType: "translation",
          config: { language: { sourceLanguage: src, targetLanguage: tgt } }
        }
      ],
      inputData: { input: [{ source: text }] }
    };

    const res = await fetch(BHASHINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${BHASHINI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data.pipelineResponse?.[0]?.output?.[0]?.target || text;
  } catch (err) {
    console.error("Bhashini error:", err);
    return text;
  }
}

/* ---------- Templates (STRUCTURE ONLY) ---------- */
function formatEnglish(body, type) {
  return `To,
The Concerned Officer

Subject: ${type}

${body}

Thanking you.`;
}

function formatTelugu(body, type) {
  return `గౌరవనీయులైన అధికారి గారికి

విషయం: ${type}

${body}

ధన్యవాదాలు.`;
}

/* ---------- Generate ---------- */
generateBtn.addEventListener("click", async () => {
  const raw = transcriptEl.value.trim();
  if (!raw) {
    alert("Please speak first");
    return;
  }

  const inputLang = detectLang(raw);
  const outPref = outputLangSel.value;
  const type = letterTypeSel.value;

  teluguOut.value = "";
  englishOut.value = "";

  let teluguText = "";
  let englishText = "";

  if (inputLang === "te") {
    teluguText = await bhashiniTranslate(raw, "te", "te");
    englishText = await bhashiniTranslate(raw, "te", "en");
  } else {
    englishText = await bhashiniTranslate(raw, "en", "en");
    teluguText = await bhashiniTranslate(raw, "en", "te");
  }

  if (outPref === "te" || outPref === "both") {
    teluguOut.value = formatTelugu(teluguText, type);
  }

  if (outPref === "en" || outPref === "both") {
    englishOut.value = formatEnglish(englishText, type);
  }
});

