import React from 'react';

const Controls = ({
    isPlaying,
    soundEnabled,
    showSettings,
    onPlayToggle,
    onSoundToggle,
    onSettingsToggle,
    hideControls
}) => {
    return (
        <div className={`controls ${hideControls ? 'hide' : ''}`}>
            <div className="btn pause-btn" onClick={onPlayToggle}>
                <svg fill="white" width="24" height="24">
                    <use href={`#icon-${isPlaying ? 'pause' : 'play'}`}></use>
                </svg>
            </div>

            <div className="btn sound-btn" onClick={onSoundToggle}>
                <svg fill="white" width="24" height="24">
                    <use href={`#icon-sound-${soundEnabled ? 'on' : 'off'}`}></use>
                </svg>
            </div>

            <div className="btn settings-btn" onClick={onSettingsToggle}>
                <svg fill="white" width="24" height="24">
                    <use href="#icon-settings"></use>
                </svg>
            </div>
        </div>
    );
};

export default Controls;
