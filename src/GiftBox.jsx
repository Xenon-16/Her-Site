import { useReducer, useState } from 'react';
import './GiftBox.css';

// ACTIONS
const TOGGLE_BOX = '[GiftBox] Toggle';
const toggleBox = () => {
    return { type: TOGGLE_BOX };
};

// REDUCERS
const DEFAULT = { open: false, wasOpen: false };

const reducer = (state = DEFAULT, { type }) => {
    switch (type) {
        case TOGGLE_BOX: {
            return {
                open: !state.open,
                wasOpen: state.open
            };
        }
        default:
            return state;
    }
};

// Generate random particles
const generateParticles = () => {
    const particles = [];
    const numParticles = 50;

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            id: i,
            x: Math.random() * 200 - 100, // -100 to 100
            y: Math.random() * 200 - 100,
            rotation: Math.random() * 360,
            delay: Math.random() * 0.2
        });
    }

    return particles;
};

// COMPONENT
export default function GiftBox({ onOpen }) {
    const [state, dispatch] = useReducer(reducer, DEFAULT);
    const [particles, setParticles] = useState([]);
    const [showParticles, setShowParticles] = useState(false);

    const handleClick = () => {
        if (!state.open) {
            dispatch(toggleBox());
            setParticles(generateParticles());
            setShowParticles(true);

            // Wait for explosion animation before revealing content
            setTimeout(() => {
                onOpen();
            }, 1500);
        }
    };

    return (
        <div className="gift-box-scene">
            <div className="floor">
                <div className='shadow'></div>
                <div className='shadow2'></div>
                <div className='shadow3'></div>
                <div className="box">

                    <div
                        className={
                            state.open ? 'lid open'
                                : state.wasOpen ? 'lid close'
                                    : 'lid'
                        }
                        onClick={handleClick}>

                        <div className="qmark">{state.open ? '!' : '?'}</div>

                        <div className="face ltop"></div>
                        <div className="face lleft"></div>
                        <div className="face lright"></div>
                    </div>

                    <div className="face top"></div>
                    <div className="face left"></div>
                    <div className="face right"></div>

                </div>
            </div>

            {/* Particle explosion */}
            {showParticles && (
                <div className="particles-container">
                    {particles.map(particle => (
                        <div
                            key={particle.id}
                            className="particle"
                            style={{
                                '--x': `${particle.x}vw`,
                                '--y': `${particle.y}vh`,
                                '--rotation': `${particle.rotation}deg`,
                                animationDelay: `${particle.delay}s`
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
