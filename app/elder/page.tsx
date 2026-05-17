"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Heart, PencilLine } from "lucide-react";
import { UploadBox } from "@/components/UploadBox";
import { startMemory } from "@/lib/api";
import type { Language, MemoryType, Relationship } from "@/lib/types";

const memoryTypes: Array<{ label: string; value: MemoryType }> = [
  { label: "A life story", value: "life story" },
  { label: "A recipe", value: "recipe" },
  { label: "Advice", value: "advice" },
  { label: "A childhood memory", value: "childhood memory" },
  { label: "Something hard", value: "hardship" },
  { label: "A thank-you message", value: "gratitude" },
];
const languages: Language[] = ["English", "Hindi", "Spanish", "Mandarin", "Arabic", "Tagalog", "Vietnamese", "French", "other"];
const languageNames: Record<Language, string> = {
  English: "English",
  Hindi: "हिन्दी",
  Spanish: "Español",
  Mandarin: "中文",
  Arabic: "العربية",
  Tagalog: "Tagalog",
  Vietnamese: "Tiếng Việt",
  French: "Français",
  other: "Other",
};

const elderCopy = {
  English: {
    familyView: "Family view",
    badge: "For elders",
    title: "Tell one memory.",
    intro: "You can record your voice, upload a file, or type a few lines. Your family can turn it into a keepsake later.",
    pageLanguage: "Page language",
    name: "Your name",
    namePlaceholder: "What should your family call you?",
    place: "Where is this memory from?",
    placePlaceholder: "City, country, or home",
    memoryTypePrompt: "What kind of memory is it?",
    typeLabels: ["A life story", "A recipe", "Advice", "A childhood memory", "Something hard", "A thank-you message"],
    storyLabel: "Or type the memory here",
    storyPlaceholder: "Start anywhere. A smell, a song, a recipe, a lesson, a person...",
    save: "Save this memory",
    saving: "Saving...",
    open: "Open keepsake",
    upload: {
      title: "Voice note or phone-call audio",
      description: "Record in-browser or upload a forwarded call file, then send it to Transcribe.",
      uploadAudio: "Upload audio",
      record: "Record",
      stop: "Stop",
      uploadFirst: "Upload first",
      startTranscribe: "Start Transcribe",
      transcribing: "Transcribing...",
      unsupportedRecording: "This browser does not support in-browser recording. Upload an audio file instead.",
      preparingUpload: "Preparing secure S3 upload...",
      staged: "Audio is staged for Amazon Transcribe.",
      recording: "Recording. Speak naturally, or capture a short call excerpt with permission.",
    },
    messages: {
      uploadFirst: "Please record or upload audio first.",
      transcribing: "Writing down the recording...",
      transcribed: "The recording has been written into the story box.",
      transcribeFailed: "We could not write down that recording yet.",
      saving: "Saving this memory...",
      saved: "Saved. Your family can open this keepsake now.",
      started: "The memory workflow has started. Your family can check the archive shortly.",
      saveFailed: "We could not save this memory yet.",
      defaultStory: "A voice recording was uploaded for the family to preserve.",
      defaultPerson: "A loved one",
      defaultCountry: "Home",
    },
  },
  Hindi: {
    familyView: "परिवार वाला दृश्य",
    badge: "बुज़ुर्गों के लिए",
    title: "एक याद सुनाइए।",
    intro: "आप अपनी आवाज़ रिकॉर्ड कर सकते हैं, फ़ाइल अपलोड कर सकते हैं, या कुछ पंक्तियाँ लिख सकते हैं। आपका परिवार इसे यादगार बना सकता है।",
    pageLanguage: "पेज की भाषा",
    name: "आपका नाम",
    namePlaceholder: "परिवार आपको क्या कहे?",
    place: "यह याद कहाँ की है?",
    placePlaceholder: "शहर, देश, या घर",
    memoryTypePrompt: "यह कैसी याद है?",
    typeLabels: ["जीवन की कहानी", "रेसिपी", "सलाह", "बचपन की याद", "कठिन समय", "धन्यवाद संदेश"],
    storyLabel: "या यहाँ याद लिखें",
    storyPlaceholder: "कहीं से भी शुरू करें। कोई खुशबू, गीत, रेसिपी, सीख, या व्यक्ति...",
    save: "यह याद सहेजें",
    saving: "सहेज रहे हैं...",
    open: "यादगार खोलें",
  },
  Spanish: {
    familyView: "Vista familiar",
    badge: "Para mayores",
    title: "Cuente un recuerdo.",
    intro: "Puede grabar su voz, subir un archivo o escribir unas líneas. Su familia podrá convertirlo en un recuerdo especial.",
    pageLanguage: "Idioma de la página",
    name: "Su nombre",
    namePlaceholder: "¿Cómo quiere que le llame su familia?",
    place: "¿De dónde es este recuerdo?",
    placePlaceholder: "Ciudad, país o casa",
    memoryTypePrompt: "¿Qué tipo de recuerdo es?",
    typeLabels: ["Una historia de vida", "Una receta", "Un consejo", "Un recuerdo de infancia", "Algo difícil", "Un mensaje de gratitud"],
    storyLabel: "O escriba el recuerdo aquí",
    storyPlaceholder: "Empiece donde quiera. Un olor, una canción, una receta, una lección, una persona...",
    save: "Guardar este recuerdo",
    saving: "Guardando...",
    open: "Abrir recuerdo",
  },
  Mandarin: {
    familyView: "家人视图",
    badge: "长辈使用",
    title: "讲一个回忆。",
    intro: "您可以录音、上传文件，或写几句话。家人之后可以把它变成珍藏。",
    pageLanguage: "页面语言",
    name: "您的名字",
    namePlaceholder: "家人应该怎么称呼您？",
    place: "这个回忆来自哪里？",
    placePlaceholder: "城市、国家或家",
    memoryTypePrompt: "这是什么样的回忆？",
    typeLabels: ["人生故事", "食谱", "建议", "童年回忆", "艰难时刻", "感谢留言"],
    storyLabel: "或在这里输入回忆",
    storyPlaceholder: "从任何地方开始。一个气味、一首歌、一道菜、一个教训、一个人...",
    save: "保存这个回忆",
    saving: "正在保存...",
    open: "打开珍藏",
  },
  Arabic: {
    familyView: "عرض العائلة",
    badge: "لكبار السن",
    title: "احكِ ذكرى واحدة.",
    intro: "يمكنك تسجيل صوتك أو رفع ملف أو كتابة بضعة أسطر. يمكن لعائلتك تحويلها إلى تذكار.",
    pageLanguage: "لغة الصفحة",
    name: "اسمك",
    namePlaceholder: "ماذا تريد أن تناديك عائلتك؟",
    place: "من أين تأتي هذه الذكرى؟",
    placePlaceholder: "مدينة أو بلد أو منزل",
    memoryTypePrompt: "ما نوع هذه الذكرى؟",
    typeLabels: ["قصة حياة", "وصفة", "نصيحة", "ذكرى طفولة", "شيء صعب", "رسالة شكر"],
    storyLabel: "أو اكتب الذكرى هنا",
    storyPlaceholder: "ابدأ من أي مكان. رائحة، أغنية، وصفة، درس، شخص...",
    save: "احفظ هذه الذكرى",
    saving: "جارٍ الحفظ...",
    open: "افتح التذكار",
  },
  Tagalog: {
    familyView: "Tingin ng pamilya",
    badge: "Para sa matatanda",
    title: "Magkuwento ng isang alaala.",
    intro: "Maaari kang mag-record ng boses, mag-upload ng file, o magsulat ng ilang linya. Gagawin ito ng pamilya mong keepsake.",
    pageLanguage: "Wika ng pahina",
    name: "Pangalan mo",
    namePlaceholder: "Ano ang itatawag sa iyo ng pamilya mo?",
    place: "Saan galing ang alaalang ito?",
    placePlaceholder: "Lungsod, bansa, o tahanan",
    memoryTypePrompt: "Anong uri ng alaala ito?",
    typeLabels: ["Kuwento ng buhay", "Recipe", "Payo", "Alaala ng pagkabata", "Mahirap na karanasan", "Mensahe ng pasasalamat"],
    storyLabel: "O isulat ang alaala dito",
    storyPlaceholder: "Magsimula kahit saan. Amoy, kanta, recipe, aral, tao...",
    save: "I-save ang alaalang ito",
    saving: "Sine-save...",
    open: "Buksan ang keepsake",
  },
  Vietnamese: {
    familyView: "Chế độ gia đình",
    badge: "Dành cho người lớn tuổi",
    title: "Kể một kỷ niệm.",
    intro: "Bạn có thể ghi âm, tải tệp lên, hoặc viết vài dòng. Gia đình bạn có thể biến nó thành một kỷ vật.",
    pageLanguage: "Ngôn ngữ trang",
    name: "Tên của bạn",
    namePlaceholder: "Gia đình nên gọi bạn là gì?",
    place: "Kỷ niệm này đến từ đâu?",
    placePlaceholder: "Thành phố, quốc gia, hoặc nhà",
    memoryTypePrompt: "Đây là loại kỷ niệm gì?",
    typeLabels: ["Câu chuyện cuộc đời", "Công thức nấu ăn", "Lời khuyên", "Kỷ niệm tuổi thơ", "Điều khó khăn", "Lời cảm ơn"],
    storyLabel: "Hoặc viết kỷ niệm ở đây",
    storyPlaceholder: "Bắt đầu ở bất cứ đâu. Một mùi hương, bài hát, món ăn, bài học, một người...",
    save: "Lưu kỷ niệm này",
    saving: "Đang lưu...",
    open: "Mở kỷ vật",
  },
  French: {
    familyView: "Vue famille",
    badge: "Pour les aînés",
    title: "Racontez un souvenir.",
    intro: "Vous pouvez enregistrer votre voix, téléverser un fichier ou écrire quelques lignes. Votre famille pourra en faire un souvenir précieux.",
    pageLanguage: "Langue de la page",
    name: "Votre nom",
    namePlaceholder: "Comment votre famille doit-elle vous appeler ?",
    place: "D’où vient ce souvenir ?",
    placePlaceholder: "Ville, pays ou maison",
    memoryTypePrompt: "Quel type de souvenir est-ce ?",
    typeLabels: ["Une histoire de vie", "Une recette", "Un conseil", "Un souvenir d’enfance", "Quelque chose de difficile", "Un message de gratitude"],
    storyLabel: "Ou écrivez le souvenir ici",
    storyPlaceholder: "Commencez n’importe où. Une odeur, une chanson, une recette, une leçon, une personne...",
    save: "Sauvegarder ce souvenir",
    saving: "Sauvegarde...",
    open: "Ouvrir le souvenir",
  },
  other: {},
};

export default function ElderPage() {
  const [form, setForm] = useState({
    personName: "",
    relationship: "grandparent" as Relationship,
    country: "",
    language: "English" as Language,
    memoryType: "life story" as MemoryType,
    storyText: "",
  });
  const [fileName, setFileName] = useState("family-memory-recording.m4a");
  const [fileKey, setFileKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const localized = (elderCopy[form.language] || elderCopy.English) as Partial<typeof elderCopy.English>;
  const t = { ...elderCopy.English, ...localized } as typeof elderCopy.English;
  const messages = { ...elderCopy.English.messages, ...(localized.messages || {}) };
  const uploadLabels = { ...elderCopy.English.upload, ...(localized.upload || {}) };
  const isRtl = form.language === "Arabic";

  async function transcribeAudio() {
    if (!fileKey) {
      setMessage(messages.uploadFirst);
      return;
    }

    setBusy(true);
    setError("");
    setMessage(messages.transcribing);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileKey, language: form.language, identifyLanguage: true }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || messages.transcribeFailed);
      }

      if (data.mode === "async" && data.jobName) {
        const transcript = await waitForTranscript(data.jobName);
        setForm((current) => ({ ...current, storyText: transcript || current.storyText }));
      } else if (data.transcript) {
        setForm((current) => ({ ...current, storyText: data.transcript }));
      }

      setMessage(messages.transcribed);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messages.transcribeFailed);
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage(messages.saving);
    setSavedUrl("");

    try {
      const result = await startMemory({
        ...form,
        personName: form.personName.trim() || messages.defaultPerson,
        country: form.country.trim() || messages.defaultCountry,
        storyText: form.storyText.trim() || messages.defaultStory,
        goal: "preserve story",
      });

      const memory = result.memoryCard;
      if (memory) {
        setSavedUrl(`/memory/${memory.memoryId}`);
        setMessage(messages.saved);
      } else {
        setMessage(messages.started);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messages.saveFailed);
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-[linear-gradient(180deg,#fff7ed,#f2dfcf)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-semibold text-stone-950">
            Before I <span className="text-rose-900">Forget</span>
          </Link>
          <Link href="/start" className="rounded-full bg-white px-5 py-3 text-base font-semibold text-stone-800 shadow-sm ring-1 ring-stone-200">
            {t.familyView}
          </Link>
        </div>

        <section className="mt-8 rounded-[2rem] bg-white/88 p-6 shadow-xl shadow-rose-950/10 ring-1 ring-stone-900/5 sm:p-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-lg font-semibold text-rose-950">
              <Heart size={22} /> {t.badge}
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-tight text-stone-950 sm:text-7xl">
              {t.title}
            </h1>
            <p className="mt-5 text-2xl leading-10 text-stone-600">
              {t.intro}
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 grid gap-6">
            <BigField label={t.pageLanguage}>
              <select
                value={form.language}
                onChange={(event) => {
                  setForm({ ...form, language: event.target.value as Language });
                  setMessage("");
                  setError("");
                }}
                className="elder-field"
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {languageNames[language]}
                  </option>
                ))}
              </select>
            </BigField>

            <div className="grid gap-5 md:grid-cols-2">
              <BigField label={t.name}>
                <input
                  value={form.personName}
                  onChange={(event) => setForm({ ...form, personName: event.target.value })}
                  className="elder-field"
                  placeholder={t.namePlaceholder}
                />
              </BigField>
              <BigField label={t.place}>
                <input
                  value={form.country}
                  onChange={(event) => setForm({ ...form, country: event.target.value })}
                  className="elder-field"
                  placeholder={t.placePlaceholder}
                />
              </BigField>
            </div>

            <section>
              <p className="mb-3 text-2xl font-semibold text-stone-950">{t.memoryTypePrompt}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {memoryTypes.map((item, index) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setForm({ ...form, memoryType: item.value })}
                    className={`rounded-3xl px-5 py-5 text-left text-xl font-semibold ring-1 transition ${
                      form.memoryType === item.value
                        ? "bg-rose-900 text-white ring-rose-900"
                        : "bg-white text-stone-900 ring-stone-200 hover:bg-rose-50"
                    }`}
                  >
                    {t.typeLabels[index] || item.label}
                  </button>
                ))}
              </div>
            </section>

            <UploadBox
              fileName={fileName}
              fileKey={fileKey}
              onFileNameChange={setFileName}
              onFileKeyChange={setFileKey}
              onTranscribe={transcribeAudio}
              isBusy={busy}
              labels={uploadLabels}
            />

            <BigField label={t.storyLabel}>
              <textarea
                value={form.storyText}
                onChange={(event) => setForm({ ...form, storyText: event.target.value })}
                className="elder-field min-h-52 resize-none leading-9"
                placeholder={t.storyPlaceholder}
              />
            </BigField>

            {message ? (
              <p className="rounded-3xl bg-emerald-50 px-5 py-4 text-xl font-semibold text-emerald-900">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-3xl bg-rose-50 px-5 py-4 text-xl font-semibold text-rose-900">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                disabled={busy}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-rose-900 px-8 py-5 text-2xl font-semibold text-white shadow-lg shadow-rose-950/15 transition hover:bg-rose-950 disabled:opacity-60"
              >
                {busy ? t.saving : t.save} <ArrowRight size={24} />
              </button>
              {savedUrl ? (
                <Link
                  href={savedUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-5 text-xl font-semibold text-stone-900 ring-1 ring-stone-200"
                >
                  <CheckCircle2 size={22} /> {t.open}
                </Link>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function BigField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-3 flex items-center gap-2 text-2xl font-semibold text-stone-950">
        <PencilLine size={22} /> {label}
      </span>
      {children}
    </label>
  );
}

async function waitForTranscript(jobName: string) {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 1200 : 3000));
    const response = await fetch(`/api/transcribe?jobName=${encodeURIComponent(jobName)}`);
    const data = await response.json();

    if (data.status === "COMPLETED" || data.provider === "mock-transcribe") {
      return data.transcript || "";
    }

    if (data.status === "FAILED") {
      throw new Error("The recording could not be written down.");
    }
  }

  return "";
}
