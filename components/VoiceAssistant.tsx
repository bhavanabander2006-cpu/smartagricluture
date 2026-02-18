
import React, { useState, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Loader2, X, Bot } from 'lucide-react';

interface VoiceAssistantProps {
  t: (key: string) => string;
}

/**
 * Encodes Uint8Array to Base64 string manually to avoid external dependencies.
 */
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/**
 * Decodes Base64 string to Uint8Array.
 */
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

/**
 * Decodes raw PCM data into an AudioBuffer for playback.
 */
function decodeAudioDataSync(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): AudioBuffer {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ t }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  const stopAssistant = () => {
    // 1. Close session
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    // 2. Stop microphone tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    // 3. Close audio contexts
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close().catch(() => {});
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close().catch(() => {});
      outputAudioContextRef.current = null;
    }
    // 4. Stop all active audio playback nodes
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    
    setIsActive(false);
    setIsConnecting(false);
  };

  const startAssistant = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setTranscript('');
    setAiResponse('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      const AudioCtxClass = (window.AudioContext || (window as any).webkitAudioContext);
      inputAudioContextRef.current = new AudioCtxClass({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioCtxClass({ sampleRate: 24000 });
      
      // Ensure contexts are resumed (browser policy)
      await inputAudioContextRef.current.resume();
      await outputAudioContextRef.current.resume();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            // Using ScriptProcessor for compatibility; AudioWorklet is preferred but complex for single-file.
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = { 
                data: encode(new Uint8Array(int16.buffer)), 
                mimeType: 'audio/pcm;rate=16000' 
              };
              
              // Only send if session is established
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(() => {});
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // 1. Handle Transcriptions (User Input)
            if (message.serverContent?.inputTranscription) {
              setTranscript(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            // 2. Handle Transcriptions (AI Output)
            if (message.serverContent?.outputTranscription) {
              setAiResponse(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            // 3. Handle Turn Complete (Reset text for next turn)
            if (message.serverContent?.turnComplete) {
              setTranscript('');
              setAiResponse('');
            }
            // 4. Handle Interruption (User started speaking)
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(source => {
                try { source.stop(); } catch (e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
            // 5. Handle Audio Data (AI Speaking)
            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data && outputAudioContextRef.current) {
                const audioCtx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
                
                const audioBuffer = decodeAudioDataSync(decode(part.inlineData.data), audioCtx, 24000, 1);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                
                source.onended = () => {
                  sourcesRef.current.delete(source);
                };
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              }
            }
          },
          onerror: (e) => {
            console.error("Voice assistant connection error:", e);
            stopAssistant();
          },
          onclose: () => {
            stopAssistant();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } 
          },
          systemInstruction: 'You are AgriSmart AI, a professional agricultural assistant. You help farmers with crop disease identification, irrigation schedules, and market pricing. Provide concise, friendly, and expert advice. If the user asks about a specific crop, focus on that.',
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start voice assistant:", err);
      stopAssistant();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-50">
      {(isActive || isConnecting) && (
        <div className="bg-[#121917] text-white p-6 rounded-[2rem] shadow-2xl w-80 mb-4 border border-[#2E7D32]/20 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot size={14} className="text-[#66BB6A]" />
              <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">AgriSmart Voice</span>
            </div>
            <button onClick={stopAssistant} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-3 min-h-[60px] max-h-40 overflow-y-auto custom-scrollbar pr-2">
            {transcript && (
              <p className="text-xs text-white/40 font-medium leading-relaxed italic">
                "{transcript}"
              </p>
            )}
            {aiResponse ? (
              <p className="text-sm text-white font-bold leading-relaxed">
                {aiResponse}
              </p>
            ) : isActive && !transcript && (
              <p className="text-xs text-white/20 font-medium animate-pulse">
                Listening for your question...
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-center items-center gap-3">
            <div className="flex gap-1.5 items-center h-8">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 bg-[#66BB6A] rounded-full transition-all duration-300 ${isActive ? 'animate-bounce' : 'h-1'}`}
                  style={{ 
                    height: isActive ? `${Math.random() * 24 + 8}px` : '4px',
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s'
                  }} 
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      <button 
        onClick={isActive ? stopAssistant : startAssistant}
        disabled={isConnecting}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-4 border-white transition-all transform hover:scale-105 active:scale-95 ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#2E7D32] hover:bg-[#2E7D32]/90'}`}
      >
        {isConnecting ? (
          <Loader2 className="animate-spin text-white" size={24} />
        ) : isActive ? (
          <MicOff className="text-white" size={24} />
        ) : (
          <Mic className="text-white" size={24} />
        )}
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
