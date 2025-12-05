import React from 'react';
import '../styles/NightSky.scss';
import moonImg from '../assets/moon.jpg';

const NightSky = ({ isVisible }) => {
    const [timeSince, setTimeSince] = React.useState({});

    React.useEffect(() => {
        const birthDate = new Date("2002-12-15T00:00:00+05:30");

        const calculateTime = () => {
            const now = new Date();
            const diff = now.getTime() - birthDate.getTime();

            const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
            const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeSince({ years, days, hours, minutes, seconds });
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    const [typedText, setTypedText] = React.useState('');
    const [startTyping, setStartTyping] = React.useState(false);

    const fullText = `In these vast stars and endless space, 🌌
We only get one life we remember,
so be gentle with yourself. 🌸
ninnu nuv ekkuva thittukoku thakkuva cheskoku daniki chala mandi vunnar le, 🫂
In ways you may never see,
you are special Likkyyyyy to so many. ✨
and you never were, never will be burden Rakshasi 🤍`;

    React.useEffect(() => {
        let timer;
        if (isVisible) {
            timer = setTimeout(() => {
                setStartTyping(true);
            }, 5000);
        } else {
            setStartTyping(false);
            setTypedText('');
        }
        return () => clearTimeout(timer);
    }, [isVisible]);

    React.useEffect(() => {
        if (startTyping) {
            let index = 0;
            const typingInterval = setInterval(() => {
                if (index <= fullText.length) {
                    setTypedText(fullText.slice(0, index));
                    index++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 50); // Typing speed
            return () => clearInterval(typingInterval);
        }
    }, [startTyping]);

    return (
        <div className="night-sky-con">
            <div className="blessing-text-container">
                <p className="blessing-intro">this world has been blessed by your appearance since..</p>
                <p className="blessing-timer">
                    {timeSince.years} years, {timeSince.days} days, {timeSince.hours} hours, {timeSince.minutes} minutes, {timeSince.seconds} seconds
                </p>
            </div>

            <div className="moon-image-container">
                <img src={moonImg} alt="Moon" className="moon-image" />
            </div>

            <div className="typing-text-container">
                <pre className="typing-text">{typedText}</pre>
            </div>

            {[...Array(4)].map((_, i) => (
                <div key={i} className="shoot"></div>
            ))}

            <div className="stars">
                {[...Array(200)].map((_, i) => (
                    <div key={i} className="star"></div>
                ))}
            </div>
        </div>
    );
};

export default NightSky;
