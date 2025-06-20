'use client';
import React, { useRef, useState } from 'react';
import ClearFavoritosClient from '@/hooks/ClearFavoritosClient';

export default function HomePage() {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true); // Start muted as per your original code

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <main className='flex flex-col items-center bg-[#a3324e] h-full relative'>
        <video
          ref={videoRef}
          src="/videos/video.mp4" 
          className='absolute w-full h-full object-cover'
          autoPlay 
          loop
          playsInline
          muted={isMuted}
        />
        <button 
          onClick={toggleMute}
          className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 border border-[#e9e9e9]/50 cursor-pointer text-white p-2 rounded-full z-10"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg width={"40"} height={"40"} fill="#000000" viewBox="0 0 24 24" id="sound-mute-alt" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" className="icon flat-line">
              <g id="SVGRepo_bgCarrier"></g>
              <g id="SVGRepo_tracerCarrier"></g>
              <g id="SVGRepo_iconCarrier">
                <path id="secondary" d="M11,5V19L7,15H4a1,1,0,0,1-1-1V10A1,1,0,0,1,4,9H7Z" style={{ fill: "#a3324e", strokeWidth: 2 }} />
                <path id="primary" d="M16,14.5l5-5m-5,0,5,5M7,9H4a1,1,0,0,0-1,1v4a1,1,0,0,0,1,1H7l4,4V5Z" style={{ fill: "none", stroke: "#000000", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2 }} />
              </g>
            </svg>
          ) : (
            <svg width={"40"} height={"40"} fill="#000000" viewBox="0 0 24 24" id="sound-max" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" className="icon flat-line">
              <g id="SVGRepo_bgCarrier"></g>
              <g id="SVGRepo_tracerCarrier"></g>
              <g id="SVGRepo_iconCarrier">
                <path id="secondary" d="M11,5V19L7,15H4a1,1,0,0,1-1-1V10A1,1,0,0,1,4,9H7Z" style={{ fill: "#a3324e", strokeWidth: 2 }} />
                <path id="primary" d="M18.36,5.64a9,9,0,0,1,0,12.72" style={{ fill: "none", stroke: "#000000", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2 }} />
                <path id="primary-2" data-name="primary" d="M15.54,8.46a5,5,0,0,1,0,7.08" style={{ fill: "none", stroke: "#000000", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2 }} />
                <path id="primary-3" data-name="primary" d="M11,5V19L7,15H4a1,1,0,0,1-1-1V10A1,1,0,0,1,4,9H7Z" style={{ fill: "none", stroke: "#000000", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2 }} />
              </g>
            </svg>
          )}
        </button>
      </main>
    </div>
  );
}