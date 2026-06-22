'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { InvitationMusic } from '@/domain/invitations/types';

interface BackgroundMusicPlayerProps {
  music: InvitationMusic;
}

export default function BackgroundMusicPlayer({ music }: BackgroundMusicPlayerProps) {
  const [isPlaying, setIsPlaying]       = useState(false);
  const [hasActivated, setHasActivated] = useState(false);
  const [retryPrompt, setRetryPrompt]   = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // enabled is true unless explicitly set to false (undefined = legacy record with audioUrl = enabled)
  const isEnabled = music.enabled !== false;
  const audioUrl  = music.audioUrl?.trim() ?? '';

  // Diagnostics: log audio resolution
  if (typeof window !== 'undefined') {
    console.log('[BackgroundMusicPlayer] enabled:', isEnabled, '| audioUrl:', audioUrl);
  }

  useEffect(() => {
    if (!isEnabled || !audioUrl) return;

    console.log('[BackgroundMusicPlayer] Creating Audio element with URL:', audioUrl);

    const audio = new Audio(audioUrl);
    audio.loop    = true;
    audio.volume  = 0.4;
    audio.preload = 'none';
    audioRef.current = audio;

    return () => {
      console.log('[BackgroundMusicPlayer] Cleanup: pausing audio');
      audio.pause();
      audioRef.current = null;
    };
  }, [isEnabled, audioUrl]);

  if (!isEnabled || !audioUrl) return null;

  const handleToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setRetryPrompt(false);

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setHasActivated(true);
        })
        .catch((err) => {
          console.warn('[BackgroundMusicPlayer] playback blocked:', err);
          setRetryPrompt(true);
        });
    }
  };

  // suppress unused-var lint — hasActivated may be used for future tooltip state
  void hasActivated;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">

      {/* Retry hint */}
      {retryPrompt && (
        <p
          className="text-[10px] px-3 py-1.5 rounded-full border border-[#d4af5f]/30 backdrop-blur-sm shadow-sm whitespace-nowrap"
          style={{ background: 'rgba(255,248,234,0.92)', color: '#7a5c3a' }}
        >
          Toca para activar la música
        </p>
      )}

      {/* Circular toggle button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isPlaying ? 'Pausar música' : 'Activar música'}
        className="relative flex h-[52px] w-[52px] md:h-[58px] md:w-[58px] items-center justify-center rounded-full border border-[#d4af5f]/40 bg-[#fff8ea]/90 text-[#5a3f24] shadow-[0_12px_35px_rgba(116,84,38,0.22)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer select-none"
      >
        {/* Ripple rings when playing */}
        {isPlaying && (
          <>
            <span className="absolute inset-0 rounded-full border border-[#d4af5f]/40 animate-ping motion-reduce:animate-none" />
            <span className="absolute -inset-2 rounded-full border border-[#d4af5f]/20 animate-pulse motion-reduce:animate-none" />
          </>
        )}

        {/* Icon */}
        <span className="relative z-10">
          {isPlaying ? (
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          ) : (
            <svg className="w-[22px] h-[22px] opacity-60" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
