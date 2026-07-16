import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bot,
  Building2,
  Droplets,
  FileBadge,
  Home,
  Info,
  Loader2,
  Mic,
  Paperclip,
  Send,
  Sprout,
  Users,
} from "lucide-react";
import { UserAI as askUserAI } from "../Services/UserAIService";

const content = {
  en: {
    title: "Grampanchayat AI",
    subtitle: "Your digital assistant",
    description: "Get information about schemes, services, certificates, taxes and Gram Panchayat work.",
    greeting:
      "Hello! I am your Grampanchayat AI assistant. I can help you with schemes, services, certificates, taxes and Gram Panchayat related information. Please ask your question.",
    suggestionTitle: "You can ask:",
    placeholder: "Type your question here...",
    disclaimer:
      "AI generated information is for assistance only. Contact the Gram Panchayat office for official confirmation.",
    languagePrompt: "Answer in English. Keep the answer simple and useful for village citizens.",
    categories: [
      ["Scheme Information", "Know about government schemes and benefits", FileBadge],
      ["Certificates", "Required documents and certificate process", FileBadge],
      ["Tax Registration", "Property tax registration and payment details", Users],
      ["General Information", "Gram Panchayat work, members and public information", Info],
    ],
    suggestions: [
      "What is Pradhan Mantri Awas Yojana?",
      "What documents are needed for residence certificate?",
      "What is required to get birth certificate?",
      "How to register property tax?",
      "What are the Gram Panchayat office timings?",
    ],
  },
  mr: {
    title: "Grampanchayat AI",
    subtitle: "तुमचा डिजिटल सहाय्यक",
    description: "योजना, सेवा, दाखले, कर आणि ग्रामपंचायत संबंधित माहिती मिळवा.",
    greeting:
      "नमस्कार! मी तुमचा Grampanchayat AI सहाय्यक आहे. योजना, सेवा, दाखले, कर आणि ग्रामपंचायत माहितीमध्ये मी मदत करू शकतो. कृपया तुमचा प्रश्न विचारा.",
    suggestionTitle: "तुम्ही विचारू शकता:",
    placeholder: "तुमचा प्रश्न येथे टाइप करा...",
    disclaimer:
      "AI दिलेली माहिती फक्त सहाय्यासाठी आहे. अधिकृत माहितीसाठी ग्रामपंचायत कार्यालयाशी संपर्क साधा.",
    languagePrompt: "उत्तर मराठीत द्या. उत्तर गावातील नागरिकांना समजेल असे सोपे आणि उपयोगी ठेवा.",
    categories: [
      ["योजना माहिती", "शासकीय योजना आणि लाभ जाणून घ्या", FileBadge],
      ["दाखले", "दाखल्यांसाठी लागणारी कागदपत्रे आणि प्रक्रिया", FileBadge],
      ["कर नोंदणी", "मालमत्ता कर नोंदणी आणि भरणा माहिती", Users],
      ["सामान्य माहिती", "ग्रामपंचायत कामकाज, सदस्य आणि सार्वजनिक माहिती", Info],
    ],
    suggestions: [
      "प्रधानमंत्री आवास योजना काय आहे?",
      "निवास दाखल्यासाठी कोणती कागदपत्रे लागतात?",
      "जन्म दाखला मिळवण्यासाठी काय लागते?",
      "मालमत्ता कर नोंदणी कशी करायची?",
      "ग्रामपंचायत कार्यालयाची वेळ काय आहे?",
    ],
  },
  hi: {
    title: "Grampanchayat AI",
    subtitle: "आपका डिजिटल सहायक",
    description: "योजनाओं, सेवाओं, प्रमाणपत्रों, कर और ग्राम पंचायत से जुड़ी जानकारी पाएं।",
    greeting:
      "नमस्कार! मैं आपका Grampanchayat AI सहायक हूं। मैं योजनाओं, सेवाओं, प्रमाणपत्रों, कर और ग्राम पंचायत जानकारी में मदद कर सकता हूं। कृपया अपना प्रश्न पूछें।",
    suggestionTitle: "आप पूछ सकते हैं:",
    placeholder: "अपना प्रश्न यहां टाइप करें...",
    disclaimer:
      "AI द्वारा दी गई जानकारी केवल सहायता के लिए है। आधिकारिक जानकारी के लिए ग्राम पंचायत कार्यालय से संपर्क करें।",
    languagePrompt: "उत्तर हिंदी में दें। उत्तर गांव के नागरिकों के लिए सरल और उपयोगी रखें.",
    categories: [
      ["योजना जानकारी", "सरकारी योजनाओं और लाभों की जानकारी लें", FileBadge],
      ["प्रमाणपत्र", "जरूरी दस्तावेज और प्रमाणपत्र प्रक्रिया", FileBadge],
      ["कर पंजीकरण", "संपत्ति कर पंजीकरण और भुगतान जानकारी", Users],
      ["सामान्य जानकारी", "ग्राम पंचायत कार्य, सदस्य और सार्वजनिक जानकारी", Info],
    ],
    suggestions: [
      "प्रधानमंत्री आवास योजना क्या है?",
      "निवास प्रमाणपत्र के लिए कौन से दस्तावेज चाहिए?",
      "जन्म प्रमाणपत्र के लिए क्या चाहिए?",
      "संपत्ति कर पंजीकरण कैसे करें?",
      "ग्राम पंचायत कार्यालय का समय क्या है?",
    ],
  },
};

function getLanguageContent(language) {
  return content[language] || content.en;
}

function buildQuestion(question, copy) {
  return `${copy.languagePrompt}\n\nQuestion: ${question}`;
}

function UserAI() {
  const { i18n } = useTranslation();
  const copy = useMemo(() => getLanguageContent(i18n.language), [i18n.language]);
  const [qun, setquestion] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [ans, setans] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState("");
  const requestIdRef = useRef(0);
  const recognitionRef = useRef(null);
  const micStreamRef = useRef(null);

  async function loadAnswer(question, shouldSaveQuestion = true) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);

    try {
      const response = await askUserAI(buildQuestion(cleanQuestion, copy));
      const nextAnswer = response?.data || response?.message;

      if (requestIdRef.current === requestId && nextAnswer) {
        setans(nextAnswer);
        if (shouldSaveQuestion) {
          setLastQuestion(cleanQuestion);
        }
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }

  const SearchAns = async (e) => {
    e.preventDefault();
    await loadAnswer(qun);
  };

  function askSuggestion(question) {
    setquestion(question);
    loadAnswer(question);
  }

  function stopVoiceQuestion() {
    recognitionRef.current?.stop();
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    setListening(false);
  }

  async function startVoiceQuestion() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (listening) {
      stopVoiceQuestion();
      return;
    }

    if (!SpeechRecognition) {
      setSpeechStatus("Mic is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (!window.isSecureContext) {
      setSpeechStatus("Mic works only on localhost or HTTPS.");
      return;
    }

    setSpeechStatus("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
    } catch {
      setSpeechStatus("Mic permission is allowed in browser, but device access failed. Please check Windows microphone privacy settings.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language === "hi" ? "hi-IN" : i18n.language === "mr" ? "mr-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setSpeechStatus("Listening... speak now");
    };
    recognition.onend = () => {
      micStreamRef.current?.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
      setListening(false);
      setSpeechStatus((status) => (status === "Listening... speak now" ? "" : status));
    };
    recognition.onerror = (event) => {
      micStreamRef.current?.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
      setListening(false);
      const errorMessages = {
        "not-allowed": "Mic permission denied. Please allow microphone access in browser settings.",
        "no-speech": "No speech detected. Please click mic and speak again.",
        "audio-capture": "No microphone found. Please check your mic device.",
        network: "Speech service network error. Please try again.",
      };
      setSpeechStatus(errorMessages[event.error] || "Mic could not hear clearly. Please try again.");
    };
    recognition.onnomatch = () => {
      setSpeechStatus("Could not understand. Please speak again.");
    };
    recognition.onresult = (event) => {
      let transcript = "";
      let isFinal = false;

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index]?.[0]?.transcript || "";
        isFinal = isFinal || event.results[index]?.isFinal;
      }

      const voiceQuestion = transcript.trim();

      if (!voiceQuestion) {
        return;
      }

      setquestion(voiceQuestion);
      setSpeechStatus(isFinal ? "" : "Listening... keep speaking");

      if (isFinal) {
        loadAnswer(voiceQuestion);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setListening(false);
      setSpeechStatus("Mic is already starting. Please try again.");
    }
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      micStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (lastQuestion && ans) {
      loadAnswer(lastQuestion, false);
    }
  }, [i18n.language]);

  return (
    <main className="min-h-full overflow-x-hidden bg-slate-50 px-4 py-5 text-slate-950 sm:px-6" data-no-translate="true">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="relative overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50 shadow-sm">
          <div className="relative grid min-h-48 gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[1fr_280px] lg:items-center">
            <div className="flex items-center gap-5">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-white ring-4 ring-emerald-100 sm:h-28 sm:w-28">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-800 ring-2 ring-emerald-700 sm:h-20 sm:w-20">
                  <Bot size={44} />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-black tracking-normal text-slate-900 sm:text-4xl">
                  {copy.title}
                </h1>
                <p className="mt-3 text-xl font-bold text-slate-800 sm:text-2xl">{copy.subtitle}</p>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">{copy.description}</p>
              </div>
            </div>

            <div className="relative hidden h-36 lg:block">
              <div className="absolute bottom-0 right-4 h-24 w-48 rounded-t-lg border-4 border-emerald-900/20 bg-stone-200 shadow-lg">
                <div className="mx-auto mt-4 grid h-9 w-28 place-items-center rounded border border-emerald-800 bg-white text-xs font-black text-emerald-900">
                  Panchayat
                </div>
                <div className="absolute bottom-0 left-20 h-10 w-9 bg-emerald-900" />
              </div>
              <Building2 className="absolute bottom-4 right-28 h-16 w-16 text-emerald-800" />
              <Sprout className="absolute bottom-0 left-4 h-20 w-20 text-green-600" />
              <Sprout className="absolute bottom-0 right-0 h-16 w-16 text-green-500" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {copy.categories.map(([title, description, Icon]) => (
            <article className="flex min-h-24 items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={title}>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <Icon size={25} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-emerald-800">{title}</h2>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200">
              <Bot size={30} />
            </div>
            <div className="min-w-0 max-w-3xl rounded-xl bg-slate-100 px-5 py-4 text-sm font-semibold leading-7 text-slate-700">
              {ans || copy.greeting}
              {loading && (
                <span className="ml-3 inline-flex items-center gap-2 text-emerald-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-black text-slate-800">{copy.suggestionTitle}</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {copy.suggestions.map((suggestion, index) => {
                const icons = [Home, FileBadge, Sprout, Droplets, Building2];
                const Icon = icons[index] || Info;
                return (
                  <button
                    className="flex min-h-14 items-center gap-3 rounded-lg bg-emerald-50 px-4 text-left text-xs font-black leading-5 text-slate-700 transition hover:bg-emerald-100"
                    key={suggestion}
                    onClick={() => askSuggestion(suggestion)}
                    type="button"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-emerald-700" />
                    <span>{suggestion}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form className="mt-8 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4" onSubmit={SearchAns}>
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                className="h-12 min-w-0 flex-1 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                onChange={(e) => setquestion(e.target.value)}
                placeholder={copy.placeholder}
                type="text"
                value={qun}
              />
              <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100" type="button">
                <Paperclip size={21} />
              </button>
              <button
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition ${
                  listening ? "bg-red-100 text-red-700" : "text-slate-500 hover:bg-slate-100"
                }`}
                onClick={startVoiceQuestion}
                title={listening ? "Stop listening" : "Speak question"}
                type="button"
              >
                <Mic size={21} />
              </button>
              <button
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
                disabled={loading}
                type="submit"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={21} />}
              </button>
            </div>
            {speechStatus && (
              <p className={`mt-3 text-xs font-bold ${listening ? "text-emerald-700" : "text-red-600"}`}>
                {speechStatus}
              </p>
            )}
          </form>

          <p className="mt-4 text-center text-xs font-bold text-slate-400">{copy.disclaimer}</p>
        </section>
      </div>
    </main>
  );
}

export default UserAI;
