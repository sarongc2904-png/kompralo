'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Theme } from '@/domain/themes/types';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicControllerProps {
  audioUrl: string;
  theme: Theme;
  autoPlayTrigger: boolean;
}

export default function MusicController({ audioUrl, theme, autoPlayTrigger }: MusicControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = 0.4; // Soft background volume
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl]);

  // Handle auto-play when intro is dismissed
  useEffect(() => {
    if (autoPlayTrigger && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Autoplay blocked by browser policy:', err);
        });
    }
  }, [autoPlayTrigger]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Playback error:', err);
        });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* HTML Audio tag is managed in ref, button is floating */}
      
      {/* Soundwaves visual animation (only visible when playing) */}
      {isPlaying && (
        <div className="flex gap-1 items-end h-4 px-2 py-0.5 bg-white/70 backdrop-blur-md border border-[#EDE8DF] rounded-full">
          <span className="w-[1.5px] h-2 bg-[#C5A880] rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" />
          <span className="w-[1.5px] h-3 bg-[#C5A880] rounded-full animate-[soundwave_0.8s_ease-in-out_0.2s_infinite]" />
          <span className="w-[1.5px] h-1 bg-[#C5A880] rounded-full animate-[soundwave_0.8s_ease-in-out_0.4s_infinite]" />
          <span className="w-[1.5px] h-3.5 bg-[#C5A880] rounded-full animate-[soundwave_0.8s_ease-in-out_0.1s_infinite]" />
        </div>
      )}

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayback}
        className={`w-12 h-12 rounded-full border shadow-md flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 bg-white text-[#4A4740] border-[#EDE8DF] cursor-pointer`}
        aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 animate-pulse" strokeWidth={1.2} />
        ) : (
          <VolumeX className="w-5 h-5 opacity-60" strokeWidth={1.2} />
        )}
      </button>

      {/* Styled soundwave keyframes */}
      <style jsx global>{`
        @keyframes soundwave {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.3);
          }
        }
      `}</style>
    </div>
  );
}
