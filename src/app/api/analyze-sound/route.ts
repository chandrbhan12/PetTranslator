import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import dbConnect from "@/lib/mongodb";
import Translation from "@/models/Translation";

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Audio analysis patterns and characteristics
const ANIMAL_SOUND_PATTERNS: Record<string, any> = {
  dog: {
    emotions: [
      { pattern: "bark", emotion: "Excited", confidence: 0.9, message: "Your dog sounds super excited! They probably want to play or go for a walk!" },
      { pattern: "low", emotion: "Aggressive", confidence: 0.85, message: "Your dog is giving a warning growl. They might be protective or scared." },
      { pattern: "whine", emotion: "Wants Attention", confidence: 0.9, message: "Your dog is whining for attention. They want cuddles or need something!" },
      { pattern: "howl", emotion: "Lonely", confidence: 0.85, message: "Your dog is howling - they're feeling lonely or responding to sounds." },
    ],
  },
  cat: {
    emotions: [
      { pattern: "meow", emotion: "Communicative", confidence: 0.88, message: "Your cat is meowing and trying to tell you something!" },
      { pattern: "purr", emotion: "Happy", confidence: 0.95, message: "Your cat is purring with contentment. They feel safe and loved!" },
      { pattern: "hiss", emotion: "Defensive", confidence: 0.9, message: "Your cat is hissing - they're scared or protecting themselves. Give them space." },
      { pattern: "chirp", emotion: "Playful", confidence: 0.85, message: "Your cat is making chirping sounds - they're in hunting mode! Get the toy!" },
    ],
  },
  cow: {
    emotions: [
      { pattern: "moo", emotion: "Communicative", confidence: 0.9, message: "Your cow is mooing to communicate with the herd or get your attention!" },
      { pattern: "low", emotion: "Distressed", confidence: 0.85, message: "Your cow is making low sounds - they might be hungry or uncomfortable." },
    ],
  },
  bird: {
    emotions: [
      { pattern: "chirp", emotion: "Happy", confidence: 0.9, message: "Your bird is chirping merrily! They're in a wonderful mood today!" },
      { pattern: "tweet", emotion: "Excited", confidence: 0.85, message: "Your bird is tweeting excitedly - they're energetic and playful!" },
      { pattern: "screech", emotion: "Alarmed", confidence: 0.88, message: "Your bird sounds alarmed. Something nearby might be startling them." },
    ],
  },
  horse: {
    emotions: [
      { pattern: "neigh", emotion: "Excited", confidence: 0.9, message: "Your horse is neighing with excitement! They're ready for action!" },
      { pattern: "snort", emotion: "Alert", confidence: 0.85, message: "Your horse is snorting - they're alert and aware of their surroundings." },
      { pattern: "whinny", emotion: "Social", confidence: 0.88, message: "Your horse is whinnying - they're calling out to other horses or you!" },
    ],
  },
  parrot: {
    emotions: [
      { pattern: "squawk", emotion: "Excited", confidence: 0.87, message: "Your parrot is squawking! They're full of energy and want attention!" },
      { pattern: "chirp", emotion: "Happy", confidence: 0.9, message: "Your parrot is chirping happily. They're content and enjoying themselves!" },
      { pattern: "scream", emotion: "Distressed", confidence: 0.86, message: "Your parrot is screaming - they might be scared or seeking attention urgently." },
    ],
  },
};

// Helper to verify JWT token
async function verifyUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.userId;
  } catch {
    return null;
  }
}

// Analyze audio using OpenAI Whisper API
async function analyzeAudioWithWhisper(audioBuffer: Buffer): Promise<string> {
  try {
    // Create a File-like object for OpenAI
    const uint8Array = new Uint8Array(audioBuffer);
    const audioFile = new File([uint8Array], "audio.webm", { type: "audio/webm" });
    
    if (!openai) return "";
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    return transcription.text || "";
  } catch (error) {
    console.error("Error with Whisper API:", error);
    return "";
  }
}

// Detect emotion based on audio characteristics
function detectEmotionFromAudio(
  audioText: string,
  animal: string,
  audioBuffer: Buffer,
  volume: number,
  frequency: number
): { emotion: string; message: string; confidence: number } {
  const patterns = ANIMAL_SOUND_PATTERNS[animal] || ANIMAL_SOUND_PATTERNS.dog;
  
  if (audioText) {
    // Try to match audio text to emotion patterns
    const lowerText = audioText.toLowerCase();
    const matched = patterns.emotions.find((e: any) =>
      lowerText.includes(e.pattern) || lowerText.includes(animal)
    );
    if (matched) return matched;
  }

  // Use real-world volume and frequency to predict emotion instead of random guessing!
  let index = -1;
  // FFT RMS volume is usually very low (10-20) even for loud sounds because many frequency bins are 0.
  // 25+ is actually quite loud for FFT average.
  const loud = volume > 20;
  // Average frequency bin value. 40+ is relatively high pitch.
  const highPitch = frequency > 40;

  if (loud) {
    // Loud noises: excitement, alarm, aggression, distress, defensive
    const loudEmotions = ["Excited", "Aggressive", "Alarmed", "Distressed", "Defensive", "Angry"];
    const matchingIndices = patterns.emotions
      .map((e: any, i: number) => loudEmotions.includes(e.emotion) ? i : -1)
      .filter((i: number) => i !== -1);
      
    if (matchingIndices.length > 0) {
      // Use frequency to pick which loud emotion
      index = matchingIndices[Math.floor(frequency) % matchingIndices.length];
    } else {
      index = patterns.emotions.findIndex((e: any) => loudEmotions.includes(e.emotion));
    }
  } else if (highPitch) {
    // Quiet but high pitch: wanting attention, playful, communicative
    const highEmotions = ["Wants Attention", "Playful", "Happy", "Communicative"];
    const matchingIndices = patterns.emotions
      .map((e: any, i: number) => highEmotions.includes(e.emotion) ? i : -1)
      .filter((i: number) => i !== -1);
      
    if (matchingIndices.length > 0) {
      index = matchingIndices[Math.floor(volume * 10) % matchingIndices.length];
    } else {
      index = patterns.emotions.findIndex((e: any) => highEmotions.includes(e.emotion));
    }
  } else {
    // Quiet and low pitch: relaxed, content, lonely, social
    const quietEmotions = ["Happy", "Lonely", "Social", "Alert"];
    const matchingIndices = patterns.emotions
      .map((e: any, i: number) => quietEmotions.includes(e.emotion) ? i : -1)
      .filter((i: number) => i !== -1);
      
    if (matchingIndices.length > 0) {
      // Add a bit of randomness so it's not strictly fixed to one output for low background noise
      const hash = Math.floor(volume + frequency + (Math.random() * 5));
      index = matchingIndices[hash % matchingIndices.length];
    } else {
      index = patterns.emotions.findIndex((e: any) => quietEmotions.includes(e.emotion));
    }
  }

  // Fallback to a deterministic hash if no specific emotion matched
  if (index === -1) {
    // Deterministic selection based on volume and frequency
    const hash = Math.floor(volume + frequency);
    index = hash % patterns.emotions.length;
  }

  // Ensure index is within bounds
  if (isNaN(index) || index < 0 || index >= patterns.emotions.length) {
    index = 0;
  }

  const selectedEmotion = patterns.emotions[index];
  
  // Slightly adjust confidence based on how loud they were
  const adjustedConfidence = Math.min(0.99, selectedEmotion.confidence + (volume / 1000));

  return {
    emotion: selectedEmotion.emotion,
    message: selectedEmotion.message,
    confidence: Number(adjustedConfidence.toFixed(2)),
  };
}

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const animal = (formData.get("animal") as string) || "dog";
    const petId = formData.get("petId") as string | undefined;
    const volume = Number(formData.get("volume")) || 0;
    const frequency = Number(formData.get("frequency")) || 0;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Convert audio file to buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Analyze audio with Whisper if available
    let audioTranscription = "";
    if (process.env.OPENAI_API_KEY) {
      try {
        audioTranscription = await analyzeAudioWithWhisper(audioBuffer);
      } catch (error) {
        console.error("Whisper analysis failed, using pattern matching:", error);
      }
    }

    // Detect emotion from audio using real characteristics
    const result = detectEmotionFromAudio(audioTranscription, animal, audioBuffer, volume, frequency);

    // Save translation to database
    try {
      await dbConnect();
      await Translation.create({
        userId,
        petId: petId || undefined,
        animal,
        emotion: result.emotion,
        message: result.message,
        audioData: audioFile.name,
        confidence: result.confidence,
      });
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      // Don't fail the request if DB save fails
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Audio analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze audio" },
      { status: 500 }
    );
  }
}
