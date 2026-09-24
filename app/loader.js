'use client';

import { useEffect, useRef, useState } from 'react';

export default function Loader({ onComplete }) {
  const [label, setLabel] = useState('Loading admin panel');
  const [isVisible, setIsVisible] = useState(true);
  const labelRef = useRef(null);
  const loaderRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLabel('Ready');
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 400);
      }, 400);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      className={`app-loader ${!isVisible ? 'is-hidden' : ''}`}
    >
      <div className="loader-card">
        
        {/* Scrolling Text - Full Width */}
        <div className="scrolling-text-track">
          <div className="scrolling-text">
            <span>LOADING</span>
            <span className="separator">✦</span>
            <span>LOADING</span>
            <span className="separator">✦</span>
            <span>LOADING</span>
            <span className="separator">✦</span>
            <span>LOADING</span>
            <span className="separator">✦</span>
            <span>LOADING</span>
            <span className="separator">✦</span>
            <span>LOADING</span>
          </div>
        </div>

        {/* Status Label */}
        <div className="status-wrapper">
          <span ref={labelRef} className="status-label">
            {label}
          </span>
        </div>
      </div>

      <style jsx>{`
        .app-loader {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
          transition: opacity 0.4s ease, visibility 0.4s ease;
        }

        .app-loader.is-hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .loader-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100vw;
          height: 100vh;
          gap: 24px;
        }

        .scrolling-text-track {
          width: 100vw;
          height: 140px;
          overflow: hidden;
          display: flex;
          align-items: center;
          background: #0a0a0a;
          border-top: 1px solid #1a1a1a;
          border-bottom: 1px solid #1a1a1a;
        }

        @media (min-width: 640px) {
          .scrolling-text-track {
            height: 160px;
          }
        }

        @media (min-width: 1024px) {
          .scrolling-text-track {
            height: 180px;
          }
        }

        .scrolling-text {
          display: flex;
          align-items: center;
          gap: 3rem;
          white-space: nowrap;
          animation: scroll-left 6s linear infinite;
          font-size: 36px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.12em;
          padding-left: 3rem;
        }

        @media (min-width: 640px) {
          .scrolling-text {
            font-size: 48px;
            gap: 4rem;
          }
        }

        @media (min-width: 1024px) {
          .scrolling-text {
            font-size: 60px;
            gap: 5rem;
          }
        }

        .separator {
          color: #ffffff;
          opacity: 0.2;
          font-size: 16px;
        }

        @media (min-width: 640px) {
          .separator {
            font-size: 20px;
          }
        }

        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .status-wrapper {
          width: 100vw;
          padding: 0 8vw;
          text-align: center;
        }

        .status-label {
          font-size: 13px;
          color: #666666;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        @media (prefers-reduced-motion: reduce) {
          .scrolling-text { animation: none; }
        }
      `}</style>
    </div>
  );
}