import React, { useState } from 'react';
import Fireworks from './components/Fireworks';
import Controls from './components/Controls';
import Settings from './components/Settings';
import './styles/Fireworks.scss';


function FireworksDisplay() {
    const [isPlaying, setIsPlaying] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [config, setConfig] = useState({
        quality: 'normal',
        shell: 'Random',
        size: '3',
        autoLaunch: true,
        finale: false,
        skyLighting: 'normal',
        hideControls: false,
        longExposure: false,
        scaleFactor: 1.0
    });

    const togglePlay = () => setIsPlaying(!isPlaying);
    const toggleSound = () => setSoundEnabled(!soundEnabled);
    const toggleSettings = () => setShowSettings(!showSettings);

    const updateConfig = (newConfig) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    };

    return (
        <div className="fireworks-wrapper">
            <div className={`loading-init ${isPlaying ? 'remove' : ''}`}>
                <div className="loading-init__header">Loading</div>
                <div className="loading-init__status">Assembling Shells</div>
            </div>

            <div className={`stage-container ${isPlaying ? '' : 'remove'}`}>
                <Fireworks
                    config={config}
                    isPlaying={isPlaying}
                    soundEnabled={soundEnabled}
                />

                <Controls
                    isPlaying={isPlaying}
                    soundEnabled={soundEnabled}
                    showSettings={showSettings}
                    onPlayToggle={togglePlay}
                    onSoundToggle={toggleSound}
                    onSettingsToggle={toggleSettings}
                    config={config}
                    hideControls={config.hideControls}
                />

                <Settings
                    show={showSettings}
                    config={config}
                    onClose={toggleSettings}
                    onUpdateConfig={updateConfig}
                />
            </div>
        </div>
    );
}

export default FireworksDisplay;
