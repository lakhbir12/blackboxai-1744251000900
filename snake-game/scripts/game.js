// Game Constants and Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRID_SIZE = 20;
const GRID_COUNT = canvas.width / GRID_SIZE;

let snake = [];
let food = {};
let direction = 'right';
let score = 0;
let gameLoop = null;
let isPaused = false;

// Speed settings (in milliseconds)
const SPEEDS = {
    easy: 150,
    medium: 100,
    hard: 70
};

// Initialize game
function initGame() {
    // Initial snake position
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    
    // Generate initial food position
    generateFood();
    
    // Reset score
    score = 0;
    updateScore();
    
    // Reset direction
    direction = 'right';
}

// Generate food at random position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * GRID_COUNT),
        y: Math.floor(Math.random() * GRID_COUNT)
    };
    
    // Ensure food doesn't spawn on snake
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * GRID_COUNT),
            y: Math.floor(Math.random() * GRID_COUNT)
        };
    }
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Draw snake segment
function drawSnakeSegment(x, y, isHead = false) {
    ctx.fillStyle = isHead ? '#00ff00' : '#008000';
    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    
    if (isHead) {
        // Draw snake eyes
        ctx.fillStyle = '#000';
        const eyeSize = 3;
        if (direction === 'right') {
            ctx.fillRect((x + 0.8) * GRID_SIZE, (y + 0.3) * GRID_SIZE, eyeSize, eyeSize);
            ctx.fillRect((x + 0.8) * GRID_SIZE, (y + 0.7) * GRID_SIZE, eyeSize, eyeSize);
        } else if (direction === 'left') {
            ctx.fillRect((x + 0.2) * GRID_SIZE, (y + 0.3) * GRID_SIZE, eyeSize, eyeSize);
            ctx.fillRect((x + 0.2) * GRID_SIZE, (y + 0.7) * GRID_SIZE, eyeSize, eyeSize);
        } else if (direction === 'up') {
            ctx.fillRect((x + 0.3) * GRID_SIZE, (y + 0.2) * GRID_SIZE, eyeSize, eyeSize);
            ctx.fillRect((x + 0.7) * GRID_SIZE, (y + 0.2) * GRID_SIZE, eyeSize, eyeSize);
        } else if (direction === 'down') {
            ctx.fillRect((x + 0.3) * GRID_SIZE, (y + 0.8) * GRID_SIZE, eyeSize, eyeSize);
            ctx.fillRect((x + 0.7) * GRID_SIZE, (y + 0.8) * GRID_SIZE, eyeSize, eyeSize);
        }
    }
}

// Draw food
function drawFood() {
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(
        (food.x * GRID_SIZE) + (GRID_SIZE / 2),
        (food.y * GRID_SIZE) + (GRID_SIZE / 2),
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Draw game
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snake.forEach((segment, index) => {
        drawSnakeSegment(segment.x, segment.y, index === 0);
    });
    
    // Draw food
    drawFood();
}

// Move snake
function moveSnake() {
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'right':
            head.x++;
            break;
        case 'left':
            head.x--;
            break;
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
    }
    
    // Check collision with walls
    if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
        gameOver();
        return;
    }
    
    // Check collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Game loop
function gameStep() {
    if (!isPaused) {
        moveSnake();
        draw();
    }
}

// Start game
function startGame() {
    // Hide start button, show game canvas
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('difficulty').disabled = true;
    
    // Initialize game
    initGame();
    
    // Clear any existing game loop
    if (gameLoop) clearInterval(gameLoop);
    
    // Start new game loop
    const speed = SPEEDS[document.getElementById('difficulty').value];
    gameLoop = setInterval(gameStep, speed);
}

// Game over
function gameOver() {
    // Stop game loop
    clearInterval(gameLoop);
    
    // Update final score
    document.getElementById('finalScore').textContent = score;
    
    // Show game over modal
    document.getElementById('gameOverModal').classList.remove('hidden');
    
    // Save high score
    saveHighScore(score);
}

// Save high score
function saveHighScore(score) {
    try {
        let highScores = JSON.parse(localStorage.getItem('snakeHighScores')) || [];
        highScores.push({
            score: score,
            date: new Date().toISOString()
        });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 10); // Keep only top 10 scores
        localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
    } catch (error) {
        console.error('Error saving high score:', error);
    }
}

// Event Listeners
document.addEventListener('keydown', (event) => {
    if (gameLoop) {
        switch (event.key) {
            case 'ArrowRight':
                if (direction !== 'left') direction = 'right';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') direction = 'left';
                break;
            case 'ArrowUp':
                if (direction !== 'down') direction = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') direction = 'down';
                break;
            case ' ':
                // Space bar to pause/resume
                isPaused = !isPaused;
                break;
        }
    }
});

// Start button click handler
document.getElementById('startButton').addEventListener('click', startGame);

// Restart button click handler
document.getElementById('restartButton').addEventListener('click', () => {
    document.getElementById('gameOverModal').classList.add('hidden');
    document.getElementById('startButton').style.display = 'block';
    document.getElementById('difficulty').disabled = false;
});
