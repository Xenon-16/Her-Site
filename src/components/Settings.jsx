import React from 'react';

const Settings = ({ show, config, onClose, onUpdateConfig }) => {
    if (!show) return null;

    const handleChange = (key, value) => {
        onUpdateConfig({ [key]: value });
    };

    return (
        <div className="menu">
            <div className="menu__inner-wrap">
                <div className="btn btn--bright close-menu-btn" onClick={onClose}>
                    <svg fill="white" width="24" height="24">
                        <use href="#icon-close"></use>
                    </svg>
                </div>

                <div className="menu__header">Settings</div>
                <div className="menu__subheader">Customize your display</div>

                <form>
                    <div className="form-option form-option--select">
                        <label className="shell-type-label">Shell Type</label>
                        <select
                            className="shell-type"
                            value={config.shell}
                            onChange={(e) => handleChange('shell', e.target.value)}
                        >
                            <option value="Random">Random</option>
                            <option value="Crysanthemum">Crysanthemum</option>
                            <option value="Crackle">Crackle</option>
                            <option value="Crossette">Crossette</option>
                        </select>
                    </div>

                    <div className="form-option form-option--select">
                        <label className="shell-size-label">Shell Size</label>
                        <select
                            className="shell-size"
                            value={config.size}
                            onChange={(e) => handleChange('size', e.target.value)}
                        >
                            <option value="1">1"</option>
                            <option value="2">2"</option>
                            <option value="3">3"</option>
                            <option value="4">4"</option>
                        </select>
                    </div>

                    <div className="form-option form-option--select">
                        <label className="quality-ui-label">Quality</label>
                        <select
                            className="quality-ui"
                            value={config.quality}
                            onChange={(e) => handleChange('quality', e.target.value)}
                        >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="form-option form-option--checkbox">
                        <label className="auto-launch-label">Auto Fire</label>
                        <input
                            className="auto-launch"
                            type="checkbox"
                            checked={config.autoLaunch}
                            onChange={(e) => handleChange('autoLaunch', e.target.checked)}
                        />
                    </div>

                    <div className="form-option form-option--checkbox">
                        <label className="hide-controls-label">Hide Controls</label>
                        <input
                            className="hide-controls"
                            type="checkbox"
                            checked={config.hideControls}
                            onChange={(e) => handleChange('hideControls', e.target.checked)}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
