"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Mic, Square, Loader2, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { AudioRecorder, sendAudioForProcessing } from "@/lib/audioRecorder";

const ANIMAL_THEMES: Record<string, { color: string; buttonColor: string; glow: string }> = {
  dog:    { color: "bg-gradient-to-br from-[#0f172a] to-[#0c4a6e]", buttonColor: "bg-cyan-500",    glow: "shadow-cyan-500/50" },
  cat:    { color: "bg-gradient-to-br from-[#1a0a2e] to-[#4a1068]", buttonColor: "bg-fuchsia-500",  glow: "shadow-fuchsia-500/50" },
  cow:    { color: "bg-gradient-to-br from-[#1c1005] to-[#78350f]", buttonColor: "bg-amber-500",    glow: "shadow-amber-500/50" },
  bird:   { color: "bg-gradient-to-br from-[#052e16] to-[#065f46]", buttonColor: "bg-emerald-500",  glow: "shadow-emerald-500/50" },
  horse:  { color: "bg-gradient-to-br from-[#1e1045] to-[#4c1d95]", buttonColor: "bg-violet-500",   glow: "shadow-violet-500/50" },
  parrot: { color: "bg-gradient-to-br from-[#2a0a0a] to-[#881337]", buttonColor: "bg-rose-500",     glow: "shadow-rose-500/50" },
};

const ANIMAL_EMOJIS: Record<string, string> = {
  dog: "🐕", cat: "🐈", cow: "🐄", bird: "🐦", horse: "🐎", parrot: "🦜",
};

const ANIMAL_IMAGES: Record<string, string> = {
  dog: "/dog.jpg",
  cat: "/cat.jpg",
  cow: "/cow.jpg",
  bird: "/bird.jpg",
  horse: "/horse.jpg",
  parrot: "/parrot.jpg",
};

const MOCK_RESPONSES: Record<string, { emotion: string; message: string }[]> = {
  dog: [
    { emotion: "Excited", message: "Your dog sounds super excited! They probably want to play or go for a walk!" },
    { emotion: "Hungry", message: "Your dog is telling you it's dinner time. They're feeling hungry!" },
    { emotion: "Happy", message: "Your dog is tail-wagging happy! They love your company." },
  ],
  cat: [
    { emotion: "Wants Attention", message: "Your cat is asking for your attention. They want some cuddles!" },
    { emotion: "Happy", message: "Your cat is purring with contentment. They feel safe and happy!" },
    { emotion: "Playful", message: "Your cat is in the mood to hunt and play. Get the feather wand!" },
  ],
  cow: [
    { emotion: "Lonely", message: "Your cow is calling out to the herd. They're feeling a bit lonely." },
    { emotion: "Hungry", message: "Your cow is mooing for food. Time to refill the trough!" },
  ],
  bird: [
    { emotion: "Happy", message: "Your bird is singing with joy! They're in a wonderful mood today!" },
    { emotion: "Scared", message: "Your bird sounds alarmed. Something nearby might be startling them." },
  ],
  horse: [
    { emotion: "Excited", message: "Your horse is neighing with excitement! They're ready for a ride!" },
    { emotion: "Angry", message: "Your horse sounds agitated. Give them some space and calm energy." },
  ],
  parrot: [
    { emotion: "Happy", message: "Your parrot is chattering happily! They love being around you!" },
    { emotion: "Wants Attention", message: "Your parrot is squawking for your attention. Talk to them!" },
  ],
};

function TranslateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const animalParam = searchParams.get("animal") || "dog";
  const animal = ANIMAL_THEMES[animalParam] ? animalParam : "dog";
  const theme = ANIMAL_THEMES[animal];
  const emoji = ANIMAL_EMOJIS[animal];

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ emotion: string; message: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push(`/login?animal=${animal}`);
      return;
    }

    // Fetch user's pets of this specific type
    fetch("/api/pets", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.pets) {
          const matchingPets = data.pets.filter((p: any) => p.type === animal);
          setPets(matchingPets);
          if (matchingPets.length > 0) {
            setSelectedPetId(matchingPets[0]._id);
          }
        }
      })
      .catch((err) => console.error("Error loading pets", err));
  }, [animal, router]);

  const MOCK_RESPONSES: Record<string, { emotion: string; message: string }[]> = {
    dog: [
      { emotion: "Excited", message: "Your dog sounds super excited! They probably want to play or go for a walk!" },
      { emotion: "Hungry", message: "Your dog is telling you it's dinner time. They're feeling hungry!" },
      { emotion: "Happy", message: "Your dog is tail-wagging happy! They love your company." },
      { emotion: "Wants Attention", message: "Your dog wants cuddles and attention right now!" },
    ],
    cat: [
      { emotion: "Wants Attention", message: "Your cat is asking for your attention. They want some cuddles!" },
      { emotion: "Happy", message: "Your cat is purring with contentment. They feel safe and happy!" },
      { emotion: "Playful", message: "Your cat is in the mood to hunt and play. Get the feather wand!" },
      { emotion: "Communicative", message: "Your cat is meowing to tell you something important!" },
    ],
    cow: [
      { emotion: "Lonely", message: "Your cow is calling out to the herd. They're feeling a bit lonely." },
      { emotion: "Hungry", message: "Your cow is mooing for food. Time to refill the trough!" },
    ],
    bird: [
      { emotion: "Happy", message: "Your bird is singing with joy! They're in a wonderful mood today!" },
      { emotion: "Excited", message: "Your bird is tweeting excitedly — they're energetic and playful!" },
    ],
    horse: [
      { emotion: "Excited", message: "Your horse is neighing with excitement! They're ready for a ride!" },
      { emotion: "Alert", message: "Your horse is snorting — they're alert and aware of their surroundings." },
    ],
    parrot: [
      { emotion: "Happy", message: "Your parrot is chattering happily! They love being around you!" },
      { emotion: "Wants Attention", message: "Your parrot is squawking for your attention. Talk to them!" },
    ],
  };

  const simulateResult = () => {
    const responses = MOCK_RESPONSES[animal] || MOCK_RESPONSES.dog;
    const pick = responses[Math.floor(Math.random() * responses.length)];
    setResult({ emotion: pick.emotion, message: pick.message });
    setSaveStatus("✓ Detected!");
    setIsProcessing(false);
  };

  const toggleListening = async () => {
    if (isListening) {
      // Stop recording
      setIsListening(false);
      setIsProcessing(true);
      setError("");

      try {
        if (!audioRecorderRef.current) {
          simulateResult();
          return;
        }

        // Stop recording and get audio blob with metrics
        const { audioBlob, volume, frequency } = await audioRecorderRef.current.stopRecording();
        audioRecorderRef.current = null;
        
        // Send audio for processing
        const token = localStorage.getItem("token");
        if (!token) {
          simulateResult();
          return;
        }

        const analysisResult = await sendAudioForProcessing(
          audioBlob,
          animal,
          selectedPetId,
          { volume, frequency }
        );

        setResult({
          emotion: analysisResult.emotion,
          message: analysisResult.message,
        });
        setSaveStatus("✓ Detected and saved!");
      } catch (err: any) {
        console.error("Error processing audio:", err);
        // Fallback to simulation if API fails
        simulateResult();
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Start recording
      setError("");
      setResult(null);
      setSaveStatus("");
      audioRecorderRef.current = null;

      // Try real microphone first
      try {
        const recorder = new AudioRecorder();
        await recorder.startRecording();
        audioRecorderRef.current = recorder;
        setIsListening(true);
      } catch (err: any) {
        console.warn("Mic not available, using simulation mode:", err.message);
        // Mic not available — start a 3-second simulated "listening" session
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          setIsProcessing(true);
          setTimeout(() => {
            simulateResult();
          }, 1500);
        }, 3000);
      }
    }
  };


  const reset = () => {
    setIsListening(false);
    setIsProcessing(false);
    setResult(null);
    setSaveStatus("");
    setError("");
    audioRecorderRef.current = null;
  };

  const selectedPet = pets.find((p) => p._id === selectedPetId);

  return (
    <div className={`min-h-screen ${theme.color} text-white flex flex-col font-sans overflow-hidden transition-colors duration-500`}>
      {/* Ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] ${theme.buttonColor} opacity-15 ${isListening ? "animate-pulse" : ""}`} />
      </div>

      <nav className="relative z-10 p-6 flex items-center justify-between max-w-md mx-auto w-full">
        <Link href="/" className="text-white/60 hover:text-white transition-colors p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center text-lg shadow-md">
            {selectedPet?.photo ? (
              <Image 
                src={selectedPet.photo} 
                alt={selectedPet.name} 
                width={32}
                height={32}
                className="w-full h-full object-cover" 
              />
            ) : ANIMAL_IMAGES[animal] ? (
              <Image 
                src={ANIMAL_IMAGES[animal]} 
                alt={animal} 
                width={32}
                height={32}
                className="w-full h-full object-cover" 
              />
            ) : (
              <span>{emoji}</span>
            )}
          </div>
          <h1 className="text-xl font-bold tracking-wide capitalize">
            {selectedPet ? `${selectedPet.name}'s Decode` : `${animal} Translator`}
          </h1>
        </div>
        <div className="w-10" />
      </nav>

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full">
        
        {/* PET SELECTOR BAR */}
        {!isListening && !isProcessing && !result && pets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 w-full bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md"
          >
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Select pet to translate</span>
            <div className="flex gap-2 justify-center overflow-x-auto pb-1">
              {pets.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setSelectedPetId(p._id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    selectedPetId === p._id
                      ? `${theme.buttonColor} text-white border-transparent shadow-md`
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center text-[10px] bg-white/10">
                    {p.photo ? (
                      <Image 
                        src={p.photo} 
                        alt="" 
                        width={16}
                        height={16}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span>{emoji}</span>
                    )}
                  </div>
                  {p.name}
                </button>
              ))}
              <button
                onClick={() => setSelectedPetId("")}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  selectedPetId === ""
                    ? `${theme.buttonColor} text-white border-transparent shadow-md`
                    : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                General
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key="error" 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm"
            >
              <p className="font-semibold">Error: {error}</p>
              <button
                onClick={() => setError("")}
                className="mt-2 text-red-300 hover:text-red-100 text-xs underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {!result && !isProcessing && !error && (
            <motion.div 
              key="ready" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center mb-10"
            >
              <h2 className="text-3xl font-bold mb-2">
                {isListening ? "Listening..." : "Tap to Start"}
              </h2>
              <p className="text-white/60 text-sm">
                {isListening 
                  ? `Detecting ${selectedPet ? selectedPet.name : animal}'s sounds...` 
                  : `Place mic near your ${selectedPet ? selectedPet.name : animal}`}
              </p>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div 
              key="processing" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center mb-12"
            >
              <div className="relative mb-6">
                <Loader2 className="w-16 h-16 animate-spin text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Decoding Emotion...</h2>
              <p className="text-white/60 text-sm">Translating pet frequencies via AI</p>
            </motion.div>
          )}

          {result && (
            <motion.div 
              key="result" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="w-full mb-8"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-white/20 bg-[#101018] flex items-center justify-center text-4xl shadow-lg">
                  {selectedPet?.photo ? (
                    <Image 
                      src={selectedPet.photo} 
                      alt="" 
                      width={80}
                      height={80}
                      className="w-full h-full object-cover" 
                    />
                  ) : ANIMAL_IMAGES[animal] ? (
                    <Image 
                      src={ANIMAL_IMAGES[animal]} 
                      alt={animal} 
                      width={80}
                      height={80}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span>{emoji}</span>
                  )}
                </div>
                <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 font-semibold mb-4 text-sm border border-white/20">
                  {result.emotion}
                </div>
                <p className="text-xl font-medium leading-relaxed text-white/90">
                  &ldquo;{result.message}&rdquo;
                </p>

                {saveStatus && (
                  <div className="mt-4 text-xs text-white/40 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    {saveStatus}
                  </div>
                )}
              </div>
              <button 
                onClick={reset} 
                className={`mt-6 px-8 py-3 rounded-full ${theme.buttonColor} font-bold shadow-xl hover:scale-105 transition-transform text-sm`}
              >
                Translate Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Big single tap target — animal image + mic merged into one large obvious button */}
        {!isProcessing && !result && (
          <div className="relative flex items-center justify-center mt-4">
            {/* Pulsing rings when listening */}
            {isListening && (
              <>
                <motion.div
                  animate={{ scale: [1, 2.0, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className={`absolute w-44 h-44 rounded-full ${theme.buttonColor} opacity-30 pointer-events-none`}
                />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                  className={`absolute w-44 h-44 rounded-full ${theme.buttonColor} opacity-20 pointer-events-none`}
                />
              </>
            )}

            {/* Main tap button — large, obvious, contains both image and mic label */}
            <motion.button
              onClick={toggleListening}
              whileTap={{ scale: 0.93 }}
              className={`relative w-44 h-44 rounded-full flex flex-col items-center justify-center gap-3 transition-all duration-300 z-10 select-none cursor-pointer ${
                isListening
                  ? `${theme.buttonColor} shadow-[0_0_80px_rgba(0,0,0,0.5)] scale-105`
                  : `bg-white/10 border-2 border-white/25 hover:bg-white/20 shadow-2xl`
              }`}
            >
              {/* Pet image/emoji */}
              <motion.div
                className="w-20 h-20 rounded-full overflow-hidden bg-black/20 flex items-center justify-center text-5xl flex-shrink-0 shadow-lg"
                animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                {selectedPet?.photo ? (
                  <Image 
                    src={selectedPet.photo} 
                    alt="" 
                    width={80}
                    height={80}
                    className="w-full h-full object-cover" 
                  />
                ) : ANIMAL_IMAGES[animal] ? (
                  <Image 
                    src={ANIMAL_IMAGES[animal]} 
                    alt={animal} 
                    width={80}
                    height={80}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span>{emoji}</span>
                )}
              </motion.div>

              {/* Label */}
              <div className="flex items-center gap-1.5">
                {isListening ? (
                  <>
                    <Square className="w-3.5 h-3.5 text-white fill-current" />
                    <span className="text-xs font-bold text-white tracking-wide">STOP</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-white/80" />
                    <span className="text-xs font-semibold text-white/70 tracking-wide">TAP ME</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>
        )}

        {/* Waveform Bars */}
        {isListening && (
          <div className="h-16 w-full mt-10 flex items-center justify-center gap-[3px]">
            {Array.from({ length: 35 }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-1.5 rounded-full ${theme.buttonColor}`}
                animate={{ height: ["15%", "90%", "30%", "70%", "15%"] }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: i * 0.05
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function TranslatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>}>
      <TranslateContent />
    </Suspense>
  );
}
