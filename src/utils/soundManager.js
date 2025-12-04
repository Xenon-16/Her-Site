let audioContext;
let soundEnabled = false;
let audioBuffers = {};

export const initSoundManager = (enabled) => {
    soundEnabled = enabled;

    if (enabled && !audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // loadSounds(); // Commented out until sounds are added
    }
};

// const loadSounds = () => {
//   const soundFiles = [
//     { name: 'burst', urls: ['/sounds/burst1.mp3', '/sounds/burst2.mp3'] },
//     { name: 'lift', urls: ['/sounds/lift1.mp3', '/sounds/lift2.mp3'] },
//     { name: 'crackle', urls: ['/sounds/crackle1.mp3'] }
//   ];

//   soundFiles.forEach(sound => {
//     Promise.all(sound.urls.map(url => fetch(url).then(r => r.arrayBuffer())))
//       .then(buffers => Promise.all(buffers.map(buffer => audioContext.decodeAudioData(buffer))))
//       .then(decoded => {
//         audioBuffers[sound.name] = decoded;
//       });
//   });
// };

export const playSound = (type, volume = 1) => {
    if (!soundEnabled || !audioContext || !audioBuffers[type]) return;

    const buffers = audioBuffers[type];
    const buffer = buffers[Math.floor(Math.random() * buffers.length)];

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start(0);
};
