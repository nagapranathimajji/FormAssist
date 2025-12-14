

const startBtn = document.getElementById("startBtn");
const statusEl = document.getElementById("status");
const transcriptEl = document.getElementById("transcript");
const finalTextEl = document.getElementById("finalText");

const speechLangSel = document.getElementById("speechLang");
const outputLangSel = document.getElementById("outputLang");
const letterTypeSel = document.getElementById("letterType");

let recognition;

/* ---------- Speech Recognition ---------- */

function initSpeech() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SR) {
    alert("Speech Recognition works only in Chrome.");
    return;
  }

  recognition = new SR();
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => {
    statusEl.innerText = "Listening...";
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    transcriptEl.value = text;
    statusEl.innerText = "Captured";
  };

  recognition.onerror = (e) => {
    statusEl.innerText = "Speech error";
    console.error(e);
  };
}

startBtn.onclick = () => {
  if (!recognition) initSpeech();

  recognition.lang = speechLangSel.value;
  recognition.start();
};

/* ---------- Bhashini API ---------- */
/* ⚠️ Paste your API key here TEMPORARILY */
const BHASHINI_API_KEY = "PASTE_YOUR_KEY_HERE";
const BHASHINI_ENDPOINT =
  "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";

async function bhashiniGenerate(text, targetLang) {
  const payload = {
    pipelineTasks: [
      {
        taskType: "translation",
        config: {
          language: {
            sourceLanguage: "te",
            targetLanguage: targetLang
          }
        }
      }
    ],
    inputData: {
      input: [{ source: text }]
    }
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
  return data.pipelineResponse[0].output[0].target;
}

/* ---------- Letter Formatting ---------- */

function buildLetter(type, body, lang) {
  if (lang === "en") {
    return `To,
The Concerned Officer

Subject: ${type}

${body}

Thanking you.`;
  } else {
    return `గౌరవనీయులైన అధికారి గారికి

విషయం: ${type}

${body}

ధన్యవాదాలు.`;
  }
}

/* ---------- Generate ---------- */

document.getElementById("generateBtn").onclick = async () => {
  const raw = transcriptEl.value.trim();
  if (!raw) {
    alert("Please speak first");
    return;
  }

  statusEl.innerText = "Generating...";

  const outLang = outputLangSel.value;
  let content = raw;

  // Use Bhashini ONLY for language generation
  if (outLang !== "en") {
    content = await bhashiniGenerate(raw, outLang);
  }

  const letter = buildLetter(
    letterTypeSel.value,
    content,
    outLang
  );

  finalTextEl.value = letter;
  statusEl.innerText = "Done";
};
