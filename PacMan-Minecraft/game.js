// Setup canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define map size
const gridCols = 28;
const gridRows = 14;
const tileSize = 40;

canvas.width = tileSize * gridCols;
canvas.height = tileSize * gridRows;

// Map
const originalMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,3,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
  [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,3,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,3,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,3,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

function cloneMap() {
    return originalMap.map(row => row.slice());
}
let map = cloneMap();

// Game state
const pacman = { x: 1, y: 1, mouthAngle: 0, mouthOpening: true };
const ghosts = [
    { x: 14, y: 5, color: 'red', state: 'normal', blinkCounter: 0, blinkTimer: 0, visible: true },
    { x: 14, y: 7, color: 'pink', state: 'normal', blinkCounter: 0, blinkTimer: 0, visible: true },
    { x: 13, y: 5, color: 'cyan', state: 'normal', blinkCounter: 0, blinkTimer: 0, visible: true },
    { x: 13, y: 7, color: 'orange', state: 'normal', blinkCounter: 0, blinkTimer: 0, visible: true },
    { x: 2, y: 2, color: 'red', state: 'normal', blinkCounter: 0, blinkTimer: 0, visible: true },
    { x: 25, y: 2, color: 'pink', state: 'normal', blinkCounter: 0, blinkTimer: 0, visible: true },
    { x: 2, y: 11, color: 'cyan', state: 'normal', blinkCounter: 0, blinkTimer: 0, visible: true },
    { x: 25, y: 11, color: 'orange', state: 'normal', blinkCounter: 0, blinkTimer: 0, visible: true }
];

// Assets
const ghostImages = {
    red: new Image(), pink: new Image(), cyan: new Image(), orange: new Image(),
    redEyes: new Image(), pinkEyes: new Image(), cyanEyes: new Image(), orangeEyes: new Image()
};

ghostImages.red.src = 'assets/ghost_red.png';
ghostImages.pink.src = 'assets/ghost_pink.png';
ghostImages.cyan.src = 'assets/ghost_cyan.png';
ghostImages.orange.src = 'assets/ghost_orange.png';
ghostImages.redEyes.src = 'assets/ghostImages_red.png';
ghostImages.pinkEyes.src = 'assets/ghostImages_pink.png';
ghostImages.cyanEyes.src = 'assets/ghostImages_cyan.png';
ghostImages.orangeEyes.src = 'assets/ghostImages_orange.png';

const fruitImage = new Image();
fruitImage.src = 'assets/fruit.png';

const sounds = {
    beginning: new Audio('assets/pacman_beginning.wav'),
    chomp: new Audio('assets/pacman_chomp.wav'),
    eatFruit: new Audio('assets/pacman_eatfruit.wav'),
    eatGhost: new Audio('assets/pacman_eatghost.wav'),
    death: new Audio('assets/pacman_death.wav'),
    extraLife: new Audio('assets/pacman_extrapac.wav')
};

let direction = { dx: 0, dy: 0 };
let frightened = false;
let frightenedTimer = 0;
let score = 0;
let lives = 3;
let gameState = 'title';
let ghostMoveCounter = 0;
const ghostMoveInterval = 10;
let nextExtraLifeScore = 8000;
// Draw the map
function drawMap() {
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            if (map[row][col] === 1) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
            } else if (map[row][col] === 0) {
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2, tileSize * 0.1, 0, 2 * Math.PI);
                ctx.fill();
            } else if (map[row][col] === 3) {
                ctx.drawImage(
                    fruitImage,
                    col * tileSize,
                    row * tileSize,
                    tileSize,
                    tileSize
                );
            }
        }
    }
}

// Draw PacMan
function drawPacMan() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.moveTo(pacman.x * tileSize + tileSize / 2, pacman.y * tileSize + tileSize / 2);
    ctx.arc(
        pacman.x * tileSize + tileSize / 2,
        pacman.y * tileSize + tileSize / 2,
        tileSize / 2 - 2,
        pacman.mouthAngle,
        2 * Math.PI - pacman.mouthAngle
    );
    ctx.closePath();
    ctx.fill();
}

// Draw ghosts
function drawGhost(ghost) {
    if (ghost.state === 'returning' && !ghost.visible) {
        return;  // Skip drawing to create blinking effect
    }
    let img;
    if (ghost.state === 'returning') {
        img = ghostImages[ghost.color + 'Eyes'];
    } else {
        img = ghostImages[ghost.color];
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
        img,
        ghost.x * tileSize,
        ghost.y * tileSize,
        tileSize,
        tileSize
    );
}

// Controls
document.addEventListener('keydown', e => {
    if (gameState === 'title' || gameState === 'gameover') {
        resetFullGame();
        return;
    }
    if (gameState !== 'playing') return;
    if (e.key === 'ArrowUp') direction = { dx: 0, dy: -1 };
    else if (e.key === 'ArrowDown') direction = { dx: 0, dy: 1 };
    else if (e.key === 'ArrowLeft') direction = { dx: -1, dy: 0 };
    else if (e.key === 'ArrowRight') direction = { dx: 1, dy: 0 };
});

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'title') {
        ctx.fillStyle = 'white';
        ctx.font = `${tileSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText("Thomas & Sophie's Minecraft PacMan", canvas.width / 2, canvas.height / 2);
        ctx.font = `${tileSize * 0.5}px Arial`;
        ctx.fillText("Press an arrow key to start", canvas.width / 2, canvas.height / 2 + tileSize);
    } else if (gameState === 'playing') {
        updateGame();
        drawMap();
        drawPacMan();
        ghosts.forEach(drawGhost);

        ctx.fillStyle = 'white';
        ctx.font = `${tileSize * 0.4}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${score}`, 10, tileSize * 0.8);
        ctx.textAlign = 'right';
        ctx.fillText(`Lives: ${lives}`, canvas.width - 10, tileSize * 0.8);
    } else if (gameState === 'gameover') {
        ctx.fillStyle = 'white';
        ctx.font = `${tileSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
        ctx.font = `${tileSize * 0.5}px Arial`;
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + tileSize);
        ctx.fillText("Press an arrow key to restart", canvas.width / 2, canvas.height / 2 + tileSize * 1.8);
    }

    requestAnimationFrame(gameLoop);
}

// Game update logic
function updateGame() {
    // PacMan movement
    if (direction.dx !== 0 || direction.dy !== 0) {
        const nextX = pacman.x + direction.dx;
        const nextY = pacman.y + direction.dy;
        if (map[nextY] && map[nextY][nextX] !== 1) {
            pacman.x = nextX;
            pacman.y = nextY;
        }
        direction = { dx: 0, dy: 0 };
    }

    // Eat dots/fruits
    const currentTile = map[pacman.y][pacman.x];
    if (currentTile === 0 || currentTile === 3) {
        map[pacman.y][pacman.x] = 2;
        const eatenX = pacman.x;
        const eatenY = pacman.y;

        if (currentTile === 0) {
            score += 10;
            sounds.chomp.play();
        } else if (currentTile === 3) {
            score += 50;
            frightened = true;
            frightenedTimer = 480;
            ghosts.forEach(g => g.state = 'frightened');
            sounds.eatFruit.play();
        }

        // New regeneration times:
        let regenTime = (currentTile === 0) ? 3000 : 5000;
        setTimeout(() => {
            if (map[eatenY][eatenX] === 2) {
                map[eatenY][eatenX] = currentTile;
            }
        }, regenTime);

        if (score >= nextExtraLifeScore) {
            lives++;
            sounds.extraLife.play();
            nextExtraLifeScore += 8000;
        }
    }

    // Animate PacMan mouth
    if (pacman.mouthOpening) {
        pacman.mouthAngle += 0.1;
        if (pacman.mouthAngle >= 0.4) pacman.mouthOpening = false;
    } else {
        pacman.mouthAngle -= 0.1;
        if (pacman.mouthAngle <= 0) pacman.mouthOpening = true;
    }

    // Ghosts move + blinking
    ghostMoveCounter++;
    if (ghostMoveCounter >= ghostMoveInterval) {
        ghosts.forEach(ghost => {
            moveGhost(ghost);

            if (ghost.state === 'returning') {
                ghost.blinkTimer++;
                if (ghost.blinkTimer >= 15) {  // every 15 frames toggle
                    ghost.visible = !ghost.visible;
                    ghost.blinkTimer = 0;
                    if (!ghost.visible) {
                        ghost.blinkCounter++;
                    }
                }
                if (ghost.blinkCounter >= 2) {  // After 2 full blinks
                    ghost.state = 'normal';
                    ghost.blinkCounter = 0;
                    ghost.blinkTimer = 0;
                    ghost.visible = true;
                }
            }
        });
        ghostMoveCounter = 0;
    }

    // Check collisions
    ghosts.forEach(ghost => {
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
            if (ghost.state === 'frightened') {
                if (ghost.state !== 'returning') {
                    teleportGhostToRandomWalkable(ghost);
                    sounds.eatGhost.play();
                    score += 200;
                }
            } else if (ghost.state === 'normal') {
                lives--;
                sounds.death.play();
                if (lives <= 0) {
                    gameState = 'gameover';
                } else {
                    resetPositions();
                }
            }
        }
    });

    // Power pellet timer
    if (frightened) {
        frightenedTimer--;
        if (frightenedTimer <= 0) {
            frightened = false;
            ghosts.forEach(g => {
                if (g.state === 'frightened') g.state = 'normal';
            });
        }
    }
}

// Teleport ghost to random walkable spot
function teleportGhostToRandomWalkable(ghost) {
    const walkableSpots = [];
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] !== 1) {
                walkableSpots.push([x, y]);
            }
        }
    }
    const [x, y] = walkableSpots[Math.floor(Math.random() * walkableSpots.length)];
    ghost.x = x;
    ghost.y = y;
    ghost.state = 'returning';
    ghost.blinkCounter = 0;
    ghost.blinkTimer = 0;
    ghost.visible = true;
}

// Ghost AI movement
function moveGhost(ghost) {
    const directions = [
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
    ];
    const validMoves = directions.filter(d => {
        const nx = ghost.x + d.dx;
        const ny = ghost.y + d.dy;
        return map[ny] && map[ny][nx] !== 1;
    });
    let move = validMoves[Math.floor(Math.random() * validMoves.length)];
    ghost.x += move.dx;
    ghost.y += move.dy;
}

// Reset positions after death
function resetPositions() {
    pacman.x = 1;
    pacman.y = 1;
    const startPositions = [
        [14, 5], [14, 7], [13, 5], [13, 7],
        [2, 2], [25, 2], [2, 11], [25, 11]
    ];
    ghosts.forEach((ghost, index) => {
        const [sx, sy] = startPositions[index % startPositions.length];
        ghost.x = sx;
        ghost.y = sy;
        ghost.state = 'normal';
        ghost.visible = true;
    });
    direction = { dx: 0, dy: 0 };
}

// Reset full game
function resetFullGame() {
    score = 0;
    lives = 3;
    nextExtraLifeScore = 8000;
    map = cloneMap();
    resetPositions();
    gameState = 'playing';
    sounds.beginning.play();
}

// Start the loop
gameLoop();
