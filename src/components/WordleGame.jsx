import React, { useState, useEffect, useRef } from 'react';
import './WordleGame.css';
import Confetti from '../Confetti';
import boyChar from '../assets/boy_char.png';
import boySmirk from '../assets/boy_smirk.png';
import boySurprised from '../assets/boy_surprised.png';
import boyHappy from '../assets/boy_happy.png';
import girlChar from '../assets/girl_char.png';
import girlSmirk from '../assets/girl_smirk.png';
import girlWink from '../assets/girl_wink.png';
import girlWorried from '../assets/girl_worried.png';
import girlPouting from '../assets/girl_pouting.png';
import girlConfident from '../assets/girl_confident.png';

import { MOVIE_DATA } from '../data/teluguMovies';
const CUSTOM_WORDS = [
    "Naa Bonda", "Egg Pulls", "Nen call chestha", "Nen malla chestha", "Khathara ante", "Naa phone silent lo vunde", "Naa phone lo charging ledu",
    "Naa phone switch off aythadhi", "Mari intha kopama", "Nen emaina chesana", "Chai lo murkulu",
    "Life is like a cup of coffee its all in how you make it", "Nen baita vunna", "Nen bai kada vunna", "Nen maa oor potunna",
    "Chi po", "Baane", "ithadi ithadi ni pelli ithadi", "Nen chuskoled abba", "Ekkuva Cheyyaku", "Muskoni paduko",
    "Manchidi", "Adhi avvadhu amma"
];

const CUSTOM_WORDS_BOY_REPLY = [
    "Enti ??", "Curry Enti", "Adhi avvadhu amma", "Adhi avvadhu amma", "Khathara ledu", "Enni sarlu call cheshna", "Enni sarlu call cheshna",
    "--", "--", "--", "Tiffin Enti ??",
    "Ohhh", "Edaunnav ??", "Edaunnav ??", "Edaunnav ??",
    "Mast cute vunnav", "Intha andhanga ela vunnav asalu", "he he he", "Super ra", "Uppal ostha", "mm",
    "Nen cheppa", "Baitaki podham"
];

const CUSTOM_WORDS_HINTS = [
    "Nee Ootha padam", "Curry", "Nuv cheppe sollu", "Nuv cheppe sollu", "Nannu chala sarlu dini meaning adigav", "Nen call enduk ethale ante em chepthav", "Nen call enduk ethale ante em chepthav",
    "call matlade last lo chpthav ooke", "Nen arusthe okasari annav", "Pavan gadi intlo annav idhi", "Nak ardham kani me tiffin",
    "Nak okasari motivation ki pettav", "Nen call chesthe ethi idhi cheppi cut chesthav", "Mee ooru lo vunte idhi chpthav", "Prathi rendu rojulaki nuv chese pani",
    "Nen ekkuva pogidithe u say this", "Nen ekkuva pogidithe u say this", "Nen ekkuva chesthe u say this", "Nen saakulu", "Nen emaina chestha ante chalu", "night",
    "good", "kaludham ante"
];

const MAX_LIVES = 7;

const WordleGame = ({ onBack }) => {
    // Game State
    const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
    const [targetWordObj, setTargetWordObj] = useState(null); // Stores full object {title, hero...}
    const [targetWord, setTargetWord] = useState(''); // Stores just the string to guess
    const [guessedLetters, setGuessedLetters] = useState(new Set());
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [showRules, setShowRules] = useState(false); // Default false, strictly controlled
    const [showWordPrompt, setShowWordPrompt] = useState(false); // For "Guess Whole Word" prompt
    const [isGuessingWord, setIsGuessingWord] = useState(false);
    const [category, setCategory] = useState(null); // null (selection), 'WORDS', 'MOVIES', 'RANDOM'

    // Interactive Input State (for full word guess)
    const [tempGuess, setTempGuess] = useState([]);
    const [activeSlotIndex, setActiveSlotIndex] = useState(0);

    // Character Messages State
    const [boyMessage, setBoyMessage] = useState("Let's play!");
    const [girlMessage, setGirlMessage] = useState("Good luck!");
    const [girlImage, setGirlImage] = useState(girlChar);
    const [boyImage, setBoyImage] = useState(boySmirk);

    // Sound Effects (placeholder, assuming actual implementation is elsewhere)
    const playSound = (type) => {
        // console.log(`Playing sound: ${type}`);
        // Actual sound implementation would go here
    };

    useEffect(() => {
        // No initial game start here. Game starts after category selection.
    }, []);

    // Initialize temp guess when entering word guess mode
    useEffect(() => {
        if (isGuessingWord) {
            const initialGuess = targetWord.split('').map(l => (guessedLetters.has(l) || l === ' ') ? l : '');
            setTempGuess(initialGuess);

            // Find first editable slot
            const firstEditable = targetWord.split('').findIndex(l => !guessedLetters.has(l) && l !== ' ');
            setActiveSlotIndex(firstEditable !== -1 ? firstEditable : 0);

            setBoyMessage("You got this!");
            setGirlMessage("Focus...");
        }
    }, [isGuessingWord, targetWord, guessedLetters]);

    const startNewGame = (selectedCategory = category) => {
        let wordStr = "";
        let wordObj = null;

        let mode = selectedCategory;
        if (mode === 'RANDOM') {
            mode = Math.random() < 0.5 ? 'WORDS' : 'MOVIES';
        }

        if (mode === 'MOVIES') {
            const randomMovie = MOVIE_DATA[Math.floor(Math.random() * MOVIE_DATA.length)];
            wordStr = randomMovie.title.toUpperCase();
            wordObj = { ...randomMovie, type: 'MOVIE' };
        } else {
            // WORDS
            const randomIndex = Math.floor(Math.random() * CUSTOM_WORDS.length);
            const randomPhrase = CUSTOM_WORDS[randomIndex];
            wordStr = randomPhrase.toUpperCase();
            wordObj = { type: 'PHRASE', text: randomPhrase, index: randomIndex };
        }

        setCategory(selectedCategory); // Ensure category is set
        setTargetWord(wordStr);
        setTargetWordObj(wordObj);
        setGuessedLetters(new Set());
        setWrongGuesses(0);
        setGameStatus('playing');
        setShowWordPrompt(false);
        setIsGuessingWord(false);
        setTempGuess([]);
        setTempGuess([]);

        if (wordObj && wordObj.type === 'MOVIE') {
            setBoyMessage("Nee valla kaadu le");
            setGirlMessage("Chi po ra");
            setGirlImage(girlSmirk); // Start of game for movies: girl_smirk
            setBoyImage(boySmirk); // Throughout game: boy_smirk
        } else {
            // WORDS mode - same image logic as movies
            setBoyMessage("Nee valla kaadu le");
            setGirlMessage("Chi po ra");
            setGirlImage(girlSmirk); // Start of game: girl_smirk
            setBoyImage(boySmirk); // Throughout game: boy_smirk
        }
    };

    const handleLetterGuess = (letter) => {
        if (gameStatus !== 'playing' || showRules || showWordPrompt || isGuessingWord) return;
        if (guessedLetters.has(letter)) return;

        const newGuessed = new Set(guessedLetters);
        newGuessed.add(letter);
        setGuessedLetters(newGuessed);

        if (targetWord.includes(letter)) {
            // Correct guess
            const allLettersGuessed = targetWord.split('').every(l => l === ' ' || newGuessed.has(l));
            if (allLettersGuessed) {
                setGameStatus('won');
                if (targetWordObj && targetWordObj.type === 'MOVIE') {
                    setBoyImage(boySurprised); // MOVIE win: boy_surprised
                    setGirlImage(girlConfident); // MOVIE win: girl_confident
                    setBoyMessage("😑");
                    setGirlMessage("la la la la la....");
                } else if (targetWordObj && targetWordObj.type === 'PHRASE') {
                    // Nee Maatalu win: boy_happy, girl_wink
                    setBoyImage(boyHappy);
                    setGirlImage(girlWink);
                    const idx = targetWordObj.index;
                    setBoyMessage(CUSTOM_WORDS_BOY_REPLY[idx] || "😑");
                    setGirlMessage(targetWordObj.text);
                }
            } else {
                // Correct guess but game continues
                if (targetWordObj && (targetWordObj.type === 'MOVIE' || targetWordObj.type === 'PHRASE')) {
                    setGirlImage(girlConfident); // Correctly guessed letter
                }
            }
        } else {
            // Wrong guess
            const newWrong = wrongGuesses + 1;
            setWrongGuesses(newWrong);
            if (newWrong >= MAX_LIVES) {
                setGameStatus('lost');
                if (targetWordObj && targetWordObj.type === 'MOVIE') {
                    setBoyImage(boyHappy); // MOVIE loss: boy_happy
                    setGirlImage(girlSmirk); // MOVIE loss: girl_smirk
                    setBoyMessage("He he he 😂");
                    setGirlMessage("Samputha ra ninnu 🔪");
                } else if (targetWordObj && targetWordObj.type === 'PHRASE') {
                    // Nee Maatalu loss: boy_happy, girl_wink
                    setBoyImage(boyHappy);
                    setGirlImage(girlWink);
                    const idx = targetWordObj.index;
                    setBoyMessage(CUSTOM_WORDS_BOY_REPLY[idx] || "He he he 😂");
                    setGirlMessage(targetWordObj.text);
                }
            } else {
                // Determine hint based on remaining lives (MAX_LIVES - newWrong)
                const livesLeft = MAX_LIVES - newWrong;

                if (targetWordObj && targetWordObj.type === 'MOVIE') {
                    // Set girl image based on lives left for movies - only change messages at hint points
                    if (livesLeft === 5) {
                        setBoyMessage(targetWordObj.hero);
                        setGirlMessage("Hint please 🥺");
                        setGirlImage(girlWink); // 5 lives left: girl_wink
                    } else if (livesLeft === 4) {
                        setBoyMessage(targetWordObj.heroine);
                        setGirlMessage(targetWordObj.hero + " 🤔");
                        setGirlImage(girlWorried); // 4 lives left: girl_worried
                    } else if (livesLeft === 3) {
                        // Only change image, not messages
                        setGirlImage(girlWink); // 3 lives left: girl_wink
                    } else if (livesLeft <= 2) {
                        setBoyMessage(targetWordObj.plot);
                        setGirlMessage(targetWordObj.hero + " & " + targetWordObj.heroine);
                        setGirlImage(girlPouting); // 2 lives left: girl_pouting
                    } else {
                        // Lives 6 - only change image, not messages
                        setGirlImage(girlWink); // Wrong guess: girl_wink
                    }
                } else if (targetWordObj && targetWordObj.type === 'PHRASE') {
                    // WORDS mode: only change messages at hint point (4 lives)
                    const idx = targetWordObj.index;
                    if (livesLeft === 5) {
                        // Only change image
                        setGirlImage(girlWink); // 5 lives left: girl_wink
                    } else if (livesLeft === 4) {
                        // Display hint at 4 lives - change messages here
                        setBoyMessage(CUSTOM_WORDS_HINTS[idx] || "Hint...");
                        setGirlMessage("mmm");
                        setGirlImage(girlWorried); // 4 lives left: girl_worried
                    } else if (livesLeft === 3) {
                        // Only change image
                        setGirlImage(girlWink); // 3 lives left: girl_wink
                    } else if (livesLeft <= 2) {
                        // Only change image
                        setGirlImage(girlPouting); // 2 lives left: girl_pouting
                    } else {
                        // Lives 6 - only change image
                        setGirlImage(girlWink); // Wrong guess: girl_wink
                    }
                } else {
                    setBoyMessage("Ouch!");
                    setGirlMessage("Try another letter.");
                }
            }
        }
    };

    const submitWordGuess = () => {
        const guess = tempGuess.join('');
        // Compare ignoring spaces
        const cleanInput = guess.replace(/\s/g, '');
        const cleanTarget = targetWord.replace(/\s/g, '');

        if (cleanInput === cleanTarget) {
            setGameStatus('won');
            if (targetWordObj && targetWordObj.type === 'MOVIE') {
                setBoyImage(boySurprised); // MOVIE win: boy_surprised
                setGirlImage(girlConfident); // MOVIE win: girl_confident
                setBoyMessage("😑");
                setGirlMessage("la la la la la....");
            } else if (targetWordObj && targetWordObj.type === 'PHRASE') {
                // Nee Maatalu win: boy_happy, girl_wink
                setBoyImage(boyHappy);
                setGirlImage(girlWink);
                const idx = targetWordObj.index;
                setBoyMessage(CUSTOM_WORDS_BOY_REPLY[idx] || "😑");
                setGirlMessage(targetWordObj.text);
            }
        } else {
            setGameStatus('lost');
            if (targetWordObj && targetWordObj.type === 'MOVIE') {
                setBoyImage(boyHappy); // MOVIE loss: boy_happy
                setGirlImage(girlSmirk); // MOVIE loss: girl_smirk
                setBoyMessage("It was " + targetWord);
                setGirlMessage("So close...");
            } else if (targetWordObj && targetWordObj.type === 'PHRASE') {
                // Nee Maatalu loss: boy_happy, girl_wink
                setBoyImage(boyHappy);
                setGirlImage(girlWink);
                const idx = targetWordObj.index;
                setBoyMessage(CUSTOM_WORDS_BOY_REPLY[idx] || "It was " + targetWord);
                setGirlMessage(targetWordObj.text);
            }
        }
        setIsGuessingWord(false);
    };

    // Main Game Key Handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameStatus !== 'playing' || showRules || isGuessingWord) return;

            const key = e.key.toUpperCase();
            // Accept letters, numbers, and common special characters
            if (/^[A-Z0-9!@#$%&?',.]$/.test(key) || /^[a-z0-9!@#$%&?',.]$/i.test(e.key)) {
                handleLetterGuess(e.key.toUpperCase());
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [guessedLetters, gameStatus, showRules, showWordPrompt, isGuessingWord]);

    // Modal Input Key Handler
    useEffect(() => {
        if (!isGuessingWord) return;

        const handleModalKeyDown = (e) => {
            const key = e.key.toUpperCase();

            if (key === 'ENTER') {
                e.preventDefault();
                // Only submit if all slots are filled
                if (tempGuess.every(c => c !== '')) {
                    submitWordGuess();
                }
                return;
            }

            if (key === 'BACKSPACE') {
                e.preventDefault();

                if (tempGuess[activeSlotIndex]) {
                    // Clear current if occupied
                    const newGuess = [...tempGuess];
                    newGuess[activeSlotIndex] = '';
                    setTempGuess(newGuess);
                } else {
                    // Move back to previous editable slot
                    let i = activeSlotIndex - 1;
                    while (i >= 0) {
                        const l = targetWord[i];
                        if (!guessedLetters.has(l) && l !== ' ') {
                            break;
                        }
                        i--;
                    }

                    if (i >= 0) {
                        const newGuess = [...tempGuess];
                        newGuess[i] = '';
                        setTempGuess(newGuess);
                        setActiveSlotIndex(i);
                    }
                }
                return;
            }

            if (/^[A-Z]$/.test(key)) {
                e.preventDefault();

                // Fill current slot
                const newGuess = [...tempGuess];
                newGuess[activeSlotIndex] = key;
                setTempGuess(newGuess);

                // Move to next editable slot
                let i = activeSlotIndex + 1;
                while (i < targetWord.length) {
                    const l = targetWord[i];
                    if (!guessedLetters.has(l) && l !== ' ') {
                        break;
                    }
                    i++;
                }

                // If we found a next slot, move there.
                // If not (end of word), stay at current (or could deselect, but staying allows editing)
                if (i < targetWord.length) {
                    setActiveSlotIndex(i);
                }
            }
        };

        window.addEventListener('keydown', handleModalKeyDown);
        return () => window.removeEventListener('keydown', handleModalKeyDown);
    }, [isGuessingWord, tempGuess, activeSlotIndex, targetWord, guessedLetters]);

    const getBoyMessage = () => {
        if (showRules) return "Listen carefully...";
        return boyMessage;
    };

    const getGirlMessage = () => {
        if (showRules) return "Okay, I'm ready!";
        return girlMessage;
    };

    const getWinMessage = () => {
        const messages = ["You're a star! 🌟", "Amazing job! 🎉", "Tollywood Expert! 🎬", "Perfect! ✨"];
        return messages[Math.floor(Math.random() * messages.length)];
    };

    const getLossMessage = () => {
        const messages = ["Don't give up! 💪", "So close! 🤏", "Try again! 🔄", "Ayyayo! 🙈"];
        return messages[Math.floor(Math.random() * messages.length)];
    };

    const getKeyStatus = (key) => {
        if (!guessedLetters.has(key)) return 'default';
        return targetWord.includes(key) ? 'correct' : 'absent';
    };

    // If no category selected, show Category Selection Screen
    if (!category) {
        return (
            <div className="wordle-container rules-view">
                <div className="rules-content">
                    <h1>Choose Your Challenge</h1>
                    <p style={{ marginBottom: '20px', color: '#555' }}>What do you want to guess today?</p>

                    <div className="prompt-actions">
                        <button
                            className="action-btn yes-btn"
                            style={{ backgroundColor: '#ff1493' }}
                            onClick={() => startNewGame('WORDS')}
                        >
                            Nee Maatalu 💬
                        </button>
                        <button className="action-btn yes-btn" style={{ backgroundColor: '#9c27b0' }} onClick={() => startNewGame('MOVIES')}>
                            Movie Names
                        </button>
                    </div>

                    <button className="back-btn-rules" onClick={onBack} style={{ marginTop: '30px' }}>Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="wordle-game-wrapper">
            <Confetti />
            {showRules ? (
                <div className="wordle-container rules-view">
                    <div className="rules-content">
                        <h1>How to Play</h1>
                        <ul className="rules-list">
                            <li>You have <strong>{MAX_LIVES} lives</strong> to find the secret word.</li>
                            <li>Guess letters one by one to reveal them.</li>
                            <li>If you think you know it, you can guess the <strong>whole word</strong>!</li>
                            <li>Chinnapudu Tollywood game aadav ga same kani ikkada movie names tho paatu <strong>Nuv vaade maatalu vuntai anthe</strong></li>
                            <li className="warning">⚠️ <strong>Warning:</strong> If you guess the whole word wrong, it's <strong>GAME OVER</strong> instantly!</li>
                        </ul>
                        <button className="start-game-btn" onClick={() => setShowRules(false)}>Start Game</button>
                        <button className="back-btn-rules" onClick={onBack}>Back</button>
                    </div>
                </div>
            ) : (
                <div className="wordle-container game-view">


                    <div className="wordle-header">
                        <button className="back-btn" onClick={onBack}>← Back</button>
                        <h1>Guess your word</h1>
                        <div style={{ width: '60px' }}></div>
                    </div>

                    <div className="game-stats">
                        <div className="lives-display">
                            Lives: {Array.from({ length: MAX_LIVES - wrongGuesses }).map((_, i) => (
                                <span key={i} className="heart-icon">❤️</span>
                            ))}
                        </div>
                    </div>

                    {/* Word Display */}
                    <div className="word-area-row">
                        <div className="word-display">
                            {targetWord.split('').map((letter, i) => (
                                <div key={i} className={`letter-slot ${letter === ' ' ? 'space-slot' : ''} ${guessedLetters.has(letter) || gameStatus !== 'playing' ? 'revealed' : ''}`}>
                                    {guessedLetters.has(letter) || gameStatus !== 'playing' ? letter : (letter === ' ' ? '' : '')}
                                </div>
                            ))}
                        </div>

                        {/* Action Button: Hints or Play Again */}
                        {gameStatus === 'playing' ? (
                            <button className="manual-guess-btn" onClick={() => setShowWordPrompt(true)}>
                                Wanna Guess !! ⚡️
                            </button>
                        ) : (
                            <button className="manual-guess-btn" style={{ backgroundColor: '#4CAF50' }} onClick={() => startNewGame()}>
                                Play Again 🔄
                            </button>
                        )}
                    </div>

                    <div className="game-interface-wrapper">

                        {/* Characters positioned under the word */}
                        <div className="characters-under-word">
                            {/* Boy Character (Left) */}
                            <div className="character-wrapper left-char">
                                <div className="speech-bubble">{getBoyMessage()}</div>
                                <img src={boyImage} alt="Boy Character" className="character-img" />
                            </div>

                            {/* Girl Character (Right) */}
                            <div className="character-wrapper right-char">
                                <div className="speech-bubble">{getGirlMessage()}</div>
                                <img src={girlImage} alt="Girl Character" className="character-img" />
                            </div>
                        </div>

                        <div className="wordle-keyboard">
                            {['1234567890', 'QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM', "!@#$%&?',."].map((row, i) => (
                                <div key={i} className="keyboard-row">
                                    {row.split('').map(char => (
                                        <button
                                            key={char}
                                            className={`key-btn ${getKeyStatus(char)}`}
                                            onClick={() => handleLetterGuess(char)}
                                            disabled={guessedLetters.has(char)}
                                        >
                                            {char}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prompt Modal */}
                    {showWordPrompt && (
                        <div className="game-modal">
                            <div className="modal-content prompt-content">
                                <h2>Nice Guess!</h2>
                                <p>Do you want to try and guess the whole word?</p>
                                <p className="warning-text">⚠️ If you get it wrong, you lose instantly!</p>
                                <div className="prompt-actions">
                                    <button
                                        className="action-btn yes-btn"
                                        onClick={() => {
                                            setShowWordPrompt(false);
                                            setIsGuessingWord(true);
                                        }}
                                    >
                                        Yes, I know it!
                                    </button>
                                    <button
                                        className="action-btn no-btn"
                                        onClick={() => setShowWordPrompt(false)}
                                    >
                                        No, keep guessing letters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Interactive Word Guess Modal */}
                    {isGuessingWord && (
                        <div className="game-modal">
                            <div className="modal-content input-content">
                                <h2>Guess the Word</h2>
                                <div className="modal-word-display">
                                    {targetWord.split('').map((letter, i) => {
                                        if (letter === ' ') {
                                            return <div key={i} className="modal-space-slot"></div>;
                                        }
                                        const isLocked = guessedLetters.has(letter);
                                        const isActive = i === activeSlotIndex;
                                        return (
                                            <div
                                                key={i}
                                                className={`modal-slot ${isLocked ? 'locked' : ''} ${isActive ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (!isLocked) setActiveSlotIndex(i);
                                                }}
                                            >
                                                {tempGuess[i]}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="input-hint">Type to fill the blanks</p>
                                <div className="prompt-actions">
                                    <button
                                        className="action-btn yes-btn"
                                        onClick={submitWordGuess}
                                        disabled={!tempGuess.every(c => c !== '')}
                                    >
                                        Submit Guess
                                    </button>
                                    <button
                                        className="action-btn no-btn"
                                        onClick={() => {
                                            setIsGuessingWord(false);
                                            setTempGuess([]);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Game Over / Win Modal */}

                </div>
            )}
        </div >
    );
};

export default WordleGame;
