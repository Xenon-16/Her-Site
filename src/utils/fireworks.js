import { playSound } from './soundManager';

// --- Utilities ---
const MyMath = {
    toRad: (deg) => deg * Math.PI / 180,
    toDeg: (rad) => rad * 180 / Math.PI,
    random: (min, max) => Math.random() * (max - min) + min,
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    randomChoice: (arr) => arr[Math.floor(Math.random() * arr.length)],
    clamp: (num, min, max) => Math.min(Math.max(num, min), max),
    pointDist: (x1, y1, x2, y2) => {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    },
    pointAngle: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1)
};

const COLOR = {
    Red: '#ff0043',
    Green: '#14fc56',
    Blue: '#1e7fff',
    Purple: '#e60aff',
    Gold: '#ffbf36',
    White: '#ffffff'
};
const INVISIBLE = '_INVISIBLE_';
const PI_2 = Math.PI * 2;
const GRAVITY = 0.9; // Reverted to original gravity

let mainCtx, trailsCtx;
let stageW, stageH;
let config;
let lastFrameTime = Date.now();

// --- Particle Systems ---
function createParticleCollection() {
    const collection = {};
    [...Object.values(COLOR), INVISIBLE].forEach(color => {
        collection[color] = [];
    });
    return collection;
}

const Star = {
    drawWidth: 3,
    airDrag: 0.98,
    airDragHeavy: 0.992,
    active: createParticleCollection(),
    _pool: [],
    _new() { return {}; },
    add(x, y, color, angle, speed, life, speedOffX, speedOffY) {
        const instance = this._pool.pop() || this._new();
        instance.visible = true;
        instance.heavy = false;
        instance.x = x;
        instance.y = y;
        instance.prevX = x;
        instance.prevY = y;
        instance.color = color;
        instance.speedX = Math.sin(angle) * speed + (speedOffX || 0);
        instance.speedY = Math.cos(angle) * speed + (speedOffY || 0);
        instance.life = life;
        instance.fullLife = life;
        instance.spinAngle = Math.random() * PI_2;
        instance.spinSpeed = 0.8;
        instance.spinRadius = 0;
        instance.sparkFreq = 0;
        instance.sparkSpeed = 1;
        instance.sparkTimer = 0;
        instance.sparkColor = color;
        instance.sparkLife = 750;
        instance.sparkLifeVariation = 0.25;
        instance.strobe = false;
        instance.angle = angle; // Store angle for Crossette
        this.active[color].push(instance);
        return instance;
    },
    returnInstance(instance) {
        instance.onDeath && instance.onDeath(instance);
        instance.onDeath = null;
        instance.secondColor = null;
        instance.transitionTime = 0;
        instance.colorChanged = false;
        this._pool.push(instance);
    }
};

const Spark = {
    drawWidth: 0,
    airDrag: 0.9,
    active: createParticleCollection(),
    _pool: [],
    _new() { return {}; },
    add(x, y, color, angle, speed, life) {
        const instance = this._pool.pop() || this._new();
        instance.x = x;
        instance.y = y;
        instance.prevX = x;
        instance.prevY = y;
        instance.color = color;
        instance.speedX = Math.sin(angle) * speed;
        instance.speedY = Math.cos(angle) * speed;
        instance.life = life;
        this.active[color].push(instance);
        return instance;
    },
    returnInstance(instance) {
        this._pool.push(instance);
    }
};

const BurstFlash = {
    active: [],
    _pool: [],
    _new() { return {} },
    add(x, y, radius) {
        const instance = this._pool.pop() || this._new();
        instance.x = x;
        instance.y = y;
        instance.radius = radius;
        this.active.push(instance);
        return instance;
    },
    returnInstance(instance) {
        this._pool.push(instance);
    }
};

// --- Shell Definitions ---
const shellTypes = {
    'Random': (size) => {
        const type = MyMath.randomChoice(Object.keys(shellTypes).filter(k => k !== 'Random'));
        return shellTypes[type](size);
    },
    'Crysanthemum': (size) => ({
        shellSize: size,
        spreadSize: 300 + size * 100,
        starLife: 900 + size * 200,
        starDensity: 1.2,
        color: MyMath.randomChoice(Object.values(COLOR)),
        glitter: 'light',
        glitterColor: COLOR.Gold
    }),
    'Ghost': (size) => ({
        shellSize: size,
        spreadSize: 300 + size * 100,
        starLife: 900 + size * 200,
        starDensity: 1.2,
        color: INVISIBLE,
        secondColor: MyMath.randomChoice(Object.values(COLOR)),
        streamers: true
    }),
    'Strobe': (size) => ({
        shellSize: size,
        spreadSize: 280 + size * 92,
        starLife: 1100 + size * 200,
        starDensity: 1.1,
        color: COLOR.White,
        glitter: 'light',
        glitterColor: COLOR.White,
        strobe: true,
        strobeColor: COLOR.White
    }),
    'Palm': (size) => ({
        shellSize: size,
        color: MyMath.randomChoice(Object.values(COLOR)),
        spreadSize: 250 + size * 75,
        starDensity: 0.4,
        starLife: 1800 + size * 200,
        glitter: 'heavy'
    }),
    'Ring': (size) => ({
        shellSize: size,
        ring: true,
        color: MyMath.randomChoice(Object.values(COLOR)),
        spreadSize: 300 + size * 100,
        starLife: 900 + size * 200,
        starCount: 2.2 * PI_2 * (size + 1),
        glitter: 'light',
        glitterColor: COLOR.White
    }),
    'Crackle': (size) => ({
        shellSize: size,
        spreadSize: 380 + size * 75,
        starDensity: 1,
        starLife: 600 + size * 100,
        glitter: 'light',
        glitterColor: COLOR.Gold,
        color: COLOR.Gold,
        crackle: true
    }),
    'Willow': (size) => ({
        shellSize: size,
        spreadSize: 300 + size * 100,
        starDensity: 0.6,
        starLife: 3000 + size * 300,
        glitter: 'willow',
        glitterColor: COLOR.Gold,
        color: INVISIBLE
    }),
    'Crossette': (size) => ({
        shellSize: size,
        spreadSize: 300 + size * 100,
        starLife: 900 + size * 200,
        starDensity: 0.8,
        color: MyMath.randomChoice(Object.values(COLOR)),
        crossette: true
    }),
};

class Shell {
    constructor(options) {
        Object.assign(this, options);
        this.starLifeVariation = options.starLifeVariation || 0.125;
        this.color = options.color || MyMath.randomChoice(Object.values(COLOR));
        this.glitterColor = options.glitterColor || this.color;
        if (!this.starCount) {
            const density = options.starDensity || 1;
            const scaledSize = this.spreadSize / 54;
            this.starCount = Math.max(6, scaledSize * scaledSize * density);
        }
    }
    launch(position, launchHeight) {
        const width = stageW;
        const height = stageH;
        const hpad = 60;
        const vpad = 50;
        const minHeightPercent = 0.45;
        const minHeight = height - height * minHeightPercent;
        const launchX = position * (width - hpad * 2) + hpad;
        const launchY = height;
        const burstY = minHeight - (launchHeight * (minHeight - vpad));
        const launchDistance = launchY - burstY;
        const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);

        const comet = this.comet = Star.add(
            launchX, launchY,
            typeof this.color === 'string' && this.color !== 'random' ? this.color : COLOR.White,
            Math.PI,
            launchVelocity * (this.horsetail ? 1.2 : 1),
            launchVelocity * (this.horsetail ? 100 : 400)
        );
        comet.heavy = true;
        comet.spinRadius = MyMath.random(0.32, 0.85);
        comet.sparkFreq = 32 / 2;
        comet.sparkLife = 320;
        comet.sparkLifeVariation = 3;
        if (this.glitter === 'willow' || this.fallingLeaves) {
            comet.sparkFreq = 20 / 2;
            comet.sparkSpeed = 0.5;
            comet.sparkLife = 500;
        }
        if (this.color === INVISIBLE) comet.sparkColor = COLOR.Gold;

        comet.onDeath = c => this.burst(c.x, c.y);
        playSound('lift');
    }
    burst(x, y) {
        const speed = this.spreadSize / 96;
        let onDeath, sparkFreq, sparkSpeed, sparkLife;
        let sparkLifeVariation = 0.25;

        if (this.crackle) onDeath = (star) => {
            playSound('crackle');
            const count = 16;
            const angleDelta = PI_2 / count;
            for (let i = 0; i < count; i++) {
                Spark.add(star.x, star.y, COLOR.Gold, i * angleDelta, Math.pow(Math.random(), 0.45) * 2.4, 300 + Math.random() * 200);
            }
        };

        if (this.crossette) onDeath = (star) => {
            const count = 4;
            const angleDelta = PI_2 / count;
            for (let i = 0; i < count; i++) {
                Star.add(star.x, star.y, star.color, i * angleDelta + star.angle, Math.random() * 0.6 + 0.75, 600);
            }
        };

        if (this.glitter === 'light') { sparkFreq = 400; sparkSpeed = 0.3; sparkLife = 300; sparkLifeVariation = 2; }
        else if (this.glitter === 'heavy') { sparkFreq = 80; sparkSpeed = 0.8; sparkLife = 1400; sparkLifeVariation = 2; }
        else if (this.glitter === 'willow') { sparkFreq = 120; sparkSpeed = 0.34; sparkLife = 1400; sparkLifeVariation = 3.8; }

        sparkFreq = sparkFreq / 2;

        const starFactory = (angle, speedMult) => {
            const star = Star.add(
                x, y, this.color, angle, speedMult * speed,
                this.starLife + Math.random() * this.starLife * this.starLifeVariation,
                0, -this.spreadSize / 1800
            );
            if (this.secondColor) {
                star.transitionTime = this.starLife * (Math.random() * 0.05 + 0.32);
                star.secondColor = this.secondColor;
            }
            if (this.strobe) {
                star.strobe = true;
                star.strobeFreq = Math.random() * 20 + 40;
            }
            star.onDeath = onDeath;
            if (this.glitter) {
                star.sparkFreq = sparkFreq;
                star.sparkSpeed = sparkSpeed;
                star.sparkLife = sparkLife;
                star.sparkLifeVariation = sparkLifeVariation;
                star.sparkColor = this.glitterColor;
                star.sparkTimer = Math.random() * star.sparkFreq;
            }
        };

        if (this.ring) {
            const ringStartAngle = Math.random() * Math.PI;
            const ringSquash = Math.pow(Math.random(), 2) * 0.85 + 0.15;
            const count = this.starCount;
            const angleDelta = PI_2 / count;
            for (let i = 0; i < count; i++) {
                const angle = i * angleDelta;
                const initSpeedX = Math.sin(angle) * speed * ringSquash;
                const initSpeedY = Math.cos(angle) * speed;
                const newSpeed = MyMath.pointDist(0, 0, initSpeedX, initSpeedY);
                const newAngle = MyMath.pointAngle(0, 0, initSpeedX, initSpeedY) + ringStartAngle;
                const star = Star.add(x, y, this.color, newAngle, newSpeed, this.starLife + Math.random() * this.starLife * this.starLifeVariation);
                if (this.glitter) {
                    star.sparkFreq = sparkFreq;
                    star.sparkSpeed = sparkSpeed;
                    star.sparkLife = sparkLife;
                    star.sparkLifeVariation = sparkLifeVariation;
                    star.sparkColor = this.glitterColor;
                    star.sparkTimer = Math.random() * star.sparkFreq;
                }
            }
        } else {
            // Spherical burst (Fibonacci Sphere)
            const count = this.starCount;
            const offset = 2 / count;
            const increment = Math.PI * (3 - Math.sqrt(5));

            for (let i = 0; i < count; i++) {
                const y = ((i * offset) - 1) + (offset / 2);
                const r = Math.sqrt(1 - Math.pow(y, 2));

                const phi = ((i + 1) % count) * increment;

                const x = Math.cos(phi) * r;
                // z is not needed for 2D projection angle, but needed for speedMult if we wanted perspective.
                // For a simple 2D projection of a sphere, the speed is proportional to the distance from center in 2D.
                // x and y here are coordinates on the unit sphere.

                const angle = Math.atan2(y, x);
                const speedMult = Math.sqrt(x * x + y * y);

                starFactory(angle, speedMult);
            }
        }

        BurstFlash.add(x, y, this.spreadSize / 4);
        playSound('burst');
    }
}

// --- Main Exports ---

export const initFireworks = (mainCanvas, trailsCanvas, conf) => {
    mainCtx = mainCanvas.getContext('2d');
    trailsCtx = trailsCanvas.getContext('2d');
    config = conf;
    resizeCanvas(mainCanvas, trailsCanvas);
};

export const resizeCanvas = (mainCanvas, trailsCanvas) => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    mainCanvas.width = w;
    mainCanvas.height = h;
    trailsCanvas.width = w;
    trailsCanvas.height = h;

    stageW = w;
    stageH = h;

    if (mainCtx) mainCtx.clearRect(0, 0, w, h);
    if (trailsCtx) trailsCtx.clearRect(0, 0, w, h);
};

let autoLaunchTime = 0;



export const updateFireworks = (timestamp, conf) => {
    config = conf;
    const now = Date.now();
    let dt = now - lastFrameTime;
    lastFrameTime = now;

    if (dt > 100) dt = 100;

    // Sim speed factor
    const simSpeed = 1;
    const speed = simSpeed * dt / 16.67; // Normalize to ~60fps
    const timeStep = speed * 16.67;

    // Auto Launch
    if (config.autoLaunch) {
        autoLaunchTime -= timeStep;
        if (autoLaunchTime <= 0) {
            const size = config.size ? parseInt(config.size) : 3;
            const type = config.shell || 'Random';
            const shellType = type === 'Random' ? shellTypes['Random'](size) : shellTypes[type](size);
            const shell = new Shell(shellType);
            shell.launch(MyMath.random(0.2, 0.8), MyMath.random(0.6, 0.9));
            autoLaunchTime = 1000 + Math.random() * 600;
        }
    }

    // Physics Update
    const gAcc = timeStep / 1000 * GRAVITY; // Reverted acceleration formula
    const starDrag = 1 - (1 - Star.airDrag) * speed;
    const starDragHeavy = 1 - (1 - Star.airDragHeavy) * speed;
    const sparkDrag = 1 - (1 - Spark.airDrag) * speed;

    Object.keys(Star.active).forEach(color => {
        const stars = Star.active[color];
        for (let i = stars.length - 1; i >= 0; i--) {
            const star = stars[i];
            star.life -= timeStep;
            if (star.life <= 0) {
                stars.splice(i, 1);
                Star.returnInstance(star);
            } else {
                star.prevX = star.x;
                star.prevY = star.y;
                star.x += star.speedX * speed;
                star.y += star.speedY * speed;
                if (!star.heavy) {
                    star.speedX *= starDrag;
                    star.speedY *= starDrag;
                } else {
                    star.speedX *= starDragHeavy;
                    star.speedY *= starDragHeavy;
                }
                star.speedY += gAcc;

                if (star.spinRadius) {
                    star.spinAngle += star.spinSpeed * speed;
                    star.x += Math.sin(star.spinAngle) * star.spinRadius * speed;
                    star.y += Math.cos(star.spinAngle) * star.spinRadius * speed;
                }

                if (star.sparkFreq) {
                    star.sparkTimer -= timeStep;
                    while (star.sparkTimer < 0) {
                        star.sparkTimer += star.sparkFreq;
                        Spark.add(star.x, star.y, star.sparkColor, Math.random() * PI_2, Math.random() * star.sparkSpeed, star.sparkLife);
                    }
                }

                if (star.life < star.transitionTime) {
                    if (star.secondColor && !star.colorChanged) {
                        star.colorChanged = true;
                        star.color = star.secondColor;
                        stars.splice(i, 1);
                        Star.active[star.secondColor].push(star);
                        if (star.secondColor === INVISIBLE) star.sparkFreq = 0;
                    }
                    if (star.strobe) {
                        star.visible = Math.floor(star.life / star.strobeFreq) % 3 === 0;
                    }
                }
            }
        }
    });

    Object.keys(Spark.active).forEach(color => {
        const sparks = Spark.active[color];
        for (let i = sparks.length - 1; i >= 0; i--) {
            const spark = sparks[i];
            spark.life -= timeStep;
            if (spark.life <= 0) {
                sparks.splice(i, 1);
                Spark.returnInstance(spark);
            } else {
                spark.prevX = spark.x;
                spark.prevY = spark.y;
                spark.x += spark.speedX * speed;
                spark.y += spark.speedY * speed;
                spark.speedX *= sparkDrag;
                spark.speedY *= sparkDrag;
                spark.speedY += gAcc;
            }
        }
    });

    render(speed);
};

const render = (speed) => {
    if (!trailsCtx || !mainCtx) return;

    const dpr = window.devicePixelRatio || 1;
    // Note: We are not scaling ctx here because we are not handling high-DPI scaling in this simplified version to match previous logic,
    // or we should handle it in resizeCanvas. For now, let's assume 1:1 or let CSS handle it.
    // Actually, the original code used dpr. Let's stick to standard canvas drawing for now.

    trailsCtx.globalCompositeOperation = 'source-over';
    trailsCtx.fillStyle = `rgba(0, 0, 0, ${config.longExposure ? 0.0025 : 0.175 * speed})`;
    trailsCtx.fillRect(0, 0, stageW, stageH);

    mainCtx.clearRect(0, 0, stageW, stageH);

    while (BurstFlash.active.length) {
        const bf = BurstFlash.active.pop();
        const burstGradient = trailsCtx.createRadialGradient(bf.x, bf.y, 0, bf.x, bf.y, bf.radius);
        burstGradient.addColorStop(0.024, 'rgba(255, 255, 255, 1)');
        burstGradient.addColorStop(0.125, 'rgba(255, 160, 20, 0.2)');
        burstGradient.addColorStop(0.32, 'rgba(255, 140, 20, 0.11)');
        burstGradient.addColorStop(1, 'rgba(255, 120, 20, 0)');
        trailsCtx.fillStyle = burstGradient;
        trailsCtx.fillRect(bf.x - bf.radius, bf.y - bf.radius, bf.radius * 2, bf.radius * 2);
        BurstFlash.returnInstance(bf);
    }

    trailsCtx.globalCompositeOperation = 'lighten';
    trailsCtx.lineWidth = Star.drawWidth;
    trailsCtx.lineCap = 'round';
    mainCtx.strokeStyle = '#fff';
    mainCtx.lineWidth = 1;
    mainCtx.beginPath();

    Object.keys(COLOR).forEach(color => {
        const stars = Star.active[COLOR[color]];
        trailsCtx.strokeStyle = COLOR[color];
        trailsCtx.beginPath();
        stars.forEach(star => {
            if (star.visible) {
                trailsCtx.moveTo(star.x, star.y);
                trailsCtx.lineTo(star.prevX, star.prevY);
                mainCtx.moveTo(star.x, star.y);
                mainCtx.lineTo(star.x - star.speedX * 1.6, star.y - star.speedY * 1.6);
            }
        });
        trailsCtx.stroke();
    });
    mainCtx.stroke();

    trailsCtx.lineWidth = Spark.drawWidth;
    trailsCtx.lineCap = 'butt';
    Object.keys(COLOR).forEach(color => {
        const sparks = Spark.active[COLOR[color]];
        trailsCtx.strokeStyle = COLOR[color];
        trailsCtx.beginPath();
        sparks.forEach(spark => {
            trailsCtx.moveTo(spark.x, spark.y);
            trailsCtx.lineTo(spark.prevX, spark.prevY);
        });
        trailsCtx.stroke();
    });

    trailsCtx.setTransform(1, 0, 0, 1, 0, 0);
    mainCtx.setTransform(1, 0, 0, 1, 0, 0);
};
