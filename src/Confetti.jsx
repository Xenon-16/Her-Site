import { useEffect, useRef } from 'react';
import './Confetti.scss';

const COLORS = ["#f2abe7", "#9fa3ec", "#86d2e1", "#fec31e"];
const NUM_CONFETTIS = 200;

function Confetti() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clear existing confetti
        container.innerHTML = '';

        const confettiShower = [];

        class ConfettiParticle {
            constructor() {
                this.w = Math.floor(Math.random() * 10 + 5);
                this.h = this.w * 1;
                this.x = Math.floor(Math.random() * 100);
                this.y = Math.floor(Math.random() * 100);
                this.c = COLORS[Math.floor(Math.random() * COLORS.length)];
            }

            create() {
                const el = document.createElement('div');
                el.className = 'confetti';
                el.style.bottom = `${this.y}%`;
                el.style.left = `${this.x}%`;
                el.style.width = `${this.w}px`;
                el.style.height = `${this.h}px`;

                const rotate = document.createElement('div');
                rotate.className = 'rotate';

                const askew = document.createElement('div');
                askew.className = 'askew';
                askew.style.backgroundColor = this.c;

                rotate.appendChild(askew);
                el.appendChild(rotate);
                container.appendChild(el);

                return el;
            }
        }

        for (let i = 0; i < NUM_CONFETTIS; i++) {
            const particle = new ConfettiParticle();
            const el = particle.create();

            const opacity = Math.random() + 0.1;
            const animated = el.animate([
                { transform: 'translate3d(0,0,0)', opacity: opacity },
                { transform: 'translate3d(20vw, 100vh, 0)', opacity: 1 }
            ], {
                duration: Math.random() * 3000 + 3000,
                iterations: Infinity,
                delay: -(Math.random() * 5000)
            });
            confettiShower.push(animated);
        }

        return () => {
            confettiShower.forEach(anim => anim.cancel());
            container.innerHTML = '';
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 3000
            }}
        />
    );
}

export default Confetti;
