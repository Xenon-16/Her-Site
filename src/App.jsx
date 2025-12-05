import { useEffect, useState } from 'react';
import './App.css';
import Cake from './Cake';
import GiftBox from './GiftBox';
import FireworksDisplay from './Fireworks';
import Confetti from './Confetti';
import NightSky from './components/NightSky';

import bgMusic from './assets/bg-music.mp3';

function App() {
  const birthDate = new Date("2025-12-15T00:00:00+0530");
  const [timeLeft, setTimeLeft] = useState({});
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const audioRef = useState(null);

  useEffect(() => {
    const audio = new Audio(bgMusic);
    audio.loop = true;
    audio.volume = 0.5;

    const playAudio = () => {
      audio.play().catch(e => console.log("Audio play failed:", e));
    };

    // Try to play immediately
    playAudio();

    // Also play on any user interaction
    document.addEventListener('click', playAudio, { once: true });
    document.addEventListener('scroll', playAudio, { once: true });

    return () => {
      audio.pause();
      document.removeEventListener('click', playAudio);
      document.removeEventListener('scroll', playAudio);
    };
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      const diff = birthDate.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(tick);
        setTimeLeft({});
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const progress = Math.min(Math.max(currentScroll / totalScroll, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSurpriseClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowSurprise(true);
    }, 1500);
  };

  const scrollToNightSky = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  if (showSurprise) {
    return <FireworksDisplay />;
  }

  // Calculate styles based on scrollProgress
  // Smoother easing function
  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easedProgress = easeInOutCubic(scrollProgress);

  const nightSkyStyle = {
    transform: `translateY(${(1 - easedProgress) * 100}vh)`,
    opacity: 1, // Always visible, just moving
    pointerEvents: scrollProgress > 0.9 ? 'auto' : 'none',
    transition: 'transform 0.1s linear', // Smooth out frame drops
  };

  const countdownStyle = {
    transform: `translateY(${easedProgress * -50}vh) scale(${1 - easedProgress * 0.2})`,
    filter: `blur(${easedProgress * 10}px)`,
    opacity: 1 - easedProgress * 0.8,
    transition: 'transform 0.1s linear, filter 0.1s linear, opacity 0.1s linear',
  };

  return (
    <div className="main-scroll-container" style={{ height: '300vh' }}>
      <div className="fixed-content-wrapper">
        {isTransitioning && <div className="black-transition"></div>}
        {!isGiftOpen && <GiftBox onOpen={() => setIsGiftOpen(true)} />}

        <div className={`countdown-container ${!isGiftOpen ? 'hidden' : ''}`} style={countdownStyle}>
          <Confetti />

          <div className="text-wrapper">
            <h1>{timeLeft.days !== undefined ? 'Countdown to the Big Day' : 'Happy birthday Likkkkkyyyy!!!'}</h1>
            <div className="gif-container">
              <Cake />
            </div>
            {timeLeft.days !== undefined ? (
              <div className="timer-display">
                <div className="time-unit">
                  <span className="time-value">{timeLeft.days}</span>
                  <span className="time-label">Days</span>
                </div>
                <div className="time-unit">
                  <span className="time-value">{timeLeft.hours}</span>
                  <span className="time-label">Hours</span>
                </div>
                <div className="time-unit">
                  <span className="time-value">{timeLeft.minutes}</span>
                  <span className="time-label">Minutes</span>
                </div>
                <div className="time-unit">
                  <span className="time-value">{timeLeft.seconds}</span>
                  <span className="time-label">Seconds</span>
                </div>
              </div>
            ) : (
              <>
                <p className="message">It's your special day! ❤️</p>
                <div className="surprise-text" onClick={handleSurpriseClick}>
                  wanna see a surprise? ✨
                </div>
              </>
            )}
          </div>

          {/* Down Arrow */}
          <div className="scroll-arrow" onClick={scrollToNightSky}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Night Sky Section */}
        <div id="night-sky-section" style={nightSkyStyle}>
          <NightSky isVisible={scrollProgress > 0.8} />
        </div>
      </div>
    </div>
  );
}

export default App;
