import { useEffect, useState } from 'react';
import './App.css';
import Cake from './Cake';
import GiftBox from './GiftBox';
import FireworksDisplay from './Fireworks';
import Confetti from './Confetti';

function App() {
  const birthDate = new Date("2025-12-15T00:00:00+0530");
  const [timeLeft, setTimeLeft] = useState({});
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const handleSurpriseClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowSurprise(true);
    }, 1500);
  };

  if (showSurprise) {
    return <FireworksDisplay />;
  }

  return (
    <>
      {isTransitioning && <div className="black-transition"></div>}
      {!isGiftOpen && <GiftBox onOpen={() => setIsGiftOpen(true)} />}
      <div className={`countdown-container ${!isGiftOpen ? 'hidden' : ''}`}>
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
      </div>
    </>
  );
}

export default App;
