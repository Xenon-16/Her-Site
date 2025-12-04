import React, { useRef, useEffect } from 'react';
import { initFireworks, updateFireworks, resizeCanvas } from '../utils/fireworks';
import { initSoundManager } from '../utils/soundManager';

const Fireworks = ({ config, isPlaying, soundEnabled }) => {
    const canvasRef = useRef(null);
    const trailsCanvasRef = useRef(null);

    useEffect(() => {
        const mainCanvas = canvasRef.current;
        const trailsCanvas = trailsCanvasRef.current;

        if (mainCanvas && trailsCanvas) {
            initFireworks(mainCanvas, trailsCanvas, config);
            initSoundManager(soundEnabled);

            const handleResize = () => {
                resizeCanvas(mainCanvas, trailsCanvas);
            };

            window.addEventListener('resize', handleResize);
            handleResize();

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [config]);

    useEffect(() => {
        let animationFrame;

        if (isPlaying) {
            const loop = (timestamp) => {
                updateFireworks(timestamp, config);
                animationFrame = requestAnimationFrame(loop);
            };
            animationFrame = requestAnimationFrame(loop);
        } else {
            cancelAnimationFrame(animationFrame);
        }

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [isPlaying, config]);

    return (
        <div className="canvas-container">
            <canvas ref={trailsCanvasRef} id="trails-canvas"></canvas>
            <canvas ref={canvasRef} id="main-canvas"></canvas>
        </div>
    );
};

export default Fireworks;
