// Audio Recorder utility for capturing pet sounds
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private analysisInterval: any = null;
  private metrics = { maxVolume: 0, sumFrequency: 0, samples: 0 };

  async startRecording(): Promise<void> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone API not supported. Use HTTPS or localhost.");
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      
      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);

      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) options = { mimeType: 'audio/webm;codecs=opus' };
      else if (MediaRecorder.isTypeSupported('audio/mp4')) options = { mimeType: 'audio/mp4' };
      
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };

      // Track volume and frequency while recording
      this.metrics = { maxVolume: 0, sumFrequency: 0, samples: 0 };
      this.analysisInterval = setInterval(() => {
        const { frequency, volume } = this.getAudioAnalytics();
        if (volume > this.metrics.maxVolume) this.metrics.maxVolume = volume;
        if (frequency > 0) {
          this.metrics.sumFrequency += frequency;
          this.metrics.samples++;
        }
      }, 100);

      this.mediaRecorder.start();
    } catch (error: any) {
      console.error("Error accessing microphone:", error);
      throw new Error(error.message || "Unable to access microphone. Please check permissions.");
    }
  }

  stopRecording(): Promise<{ audioBlob: Blob; volume: number; frequency: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("Recording not started"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        if (this.analysisInterval) clearInterval(this.analysisInterval);
        
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        if (this.stream) this.stream.getTracks().forEach(track => track.stop());
        if (this.audioContext && this.audioContext.state !== "closed") this.audioContext.close();

        const avgFrequency = this.metrics.samples > 0 ? this.metrics.sumFrequency / this.metrics.samples : 0;
        resolve({ audioBlob, volume: this.metrics.maxVolume, frequency: avgFrequency });
      };

      this.mediaRecorder.stop();
    });
  }

  getAudioAnalytics(): { frequency: number; volume: number } {
    if (!this.analyser) {
      return { frequency: 0, volume: 0 };
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate average frequency
    const sum = dataArray.reduce((a, b) => a + b, 0);
    const frequency = sum / dataArray.length;

    // Calculate volume (RMS)
    const rms = Math.sqrt(dataArray.reduce((sum, val) => sum + val * val, 0) / dataArray.length);
    const volume = (rms / 255) * 100;

    return { frequency, volume };
  }
}

export async function sendAudioForProcessing(
  audioBlob: Blob,
  animal: string,
  petId?: string,
  metrics?: { volume: number; frequency: number }
): Promise<{ emotion: string; message: string; confidence: number }> {
  const formData = new FormData();
  formData.append("audio", audioBlob);
  formData.append("animal", animal);
  if (petId) formData.append("petId", petId);
  if (metrics) {
    formData.append("volume", metrics.volume.toString());
    formData.append("frequency", metrics.frequency.toString());
  }

  const token = localStorage.getItem("token");
  
  const response = await fetch("/api/analyze-sound", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to analyze sound");
  }

  return response.json();
}
