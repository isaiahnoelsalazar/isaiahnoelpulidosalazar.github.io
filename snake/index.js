document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("game-app");
    const header = document.createElement("div");
    header.className = "display-flex justifyContent-space-between alignItems-center width-100% maxWidth-480px";
    const title = document.createElement("h1");
    title.textContent = "Snake";
    title.className = "margin-0 fontSize-28px fontWeight-700 color-var(--ec-text,_#212529)";
    const scoreBadge = new ECBadge("Score: 0", "primary");
    scoreBadge.element.classList.add("fontSize-14px", "padding-6px_12px");
    header.appendChild(title);
    header.appendChild(scoreBadge.element);
    container.appendChild(header);
    const canvasCard = document.createElement("div");
    canvasCard.className = "eccard padding-8px display-flex justifyContent-center alignItems-center background-var(--ec-surface,_#f8f9fa)";
    const canvas = document.createElement("canvas");
    const tileSize = 30;
    const cols = 16;
    const rows = 10;
    canvas.width = cols * tileSize;
    canvas.height = rows * tileSize;
    canvas.className = "borderRadius-6px boxShadow-0_4px_12px_rgba(0,0,0,0.1) display-block";
    canvasCard.appendChild(canvas);
    container.appendChild(canvasCard);
    const controls = document.createElement("div");
    controls.className = "display-flex gap-16px flexWrap-wrap justifyContent-center";
    const startBtn = new ECButton("Start Game", { variant: "filled" });
    startBtn.setTheme(ECTheme.Green);
    const pauseBtn = new ECButton("Pause", { variant: "outline" });
    pauseBtn.disable();
    controls.appendChild(startBtn.element);
    controls.appendChild(pauseBtn.element);
    container.appendChild(controls);
    const dpad = document.createElement("div");
    dpad.className = "display-flex flexDirection-column alignItems-center gap-8px marginTop-8px";
    const upBtn = new ECButton("↑", { variant: "outline" });
    const middleRow = document.createElement("div");
    middleRow.className = "display-flex gap-48px";
    const leftBtn = new ECButton("←", { variant: "outline" });
    const rightBtn = new ECButton("→", { variant: "outline" });
    const downBtn = new ECButton("↓", { variant: "outline" });
    middleRow.appendChild(leftBtn.element);
    middleRow.appendChild(rightBtn.element);
    dpad.appendChild(upBtn.element);
    dpad.appendChild(middleRow);
    dpad.appendChild(downBtn.element);
    [upBtn, leftBtn, rightBtn, downBtn].forEach(btn => {
        btn.element.classList.remove("padding-8px_18px");
        btn.element.classList.add("width-48px", "height-48px", "fontSize-24px", "padding-0");
    });
    container.appendChild(dpad);
    const gameOverModal = new ECModal("Game Over!");
    document.body.appendChild(gameOverModal.element);
    gameOverModal.setContent('<div class="fontSize-18px textAlign-center margin-16px_0">Final Score: <strong id="final-score" class="color-var(--ec-accent,_#1a73e8)">0</strong></div>');
    gameOverModal.addFooterButton("Play Again", () => {
        gameOverModal.close();
        resetGame();
    }, "filled");
    const ctx = canvas.getContext("2d");
    let snake = [];
    let food = null;
    let dx = 1;
    let dy = 0;
    let nextDx = 1;
    let nextDy = 0;
    let score = 0;
    let gameInterval = null;
    let isPaused = false;
    let isGameOver = false;
    function drawGrid() {
        ctx.fillStyle = "#1e1e2e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0f3460"; 
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    ctx.strokeStyle = "#16213e";
                    ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }
    }
    function drawSnake() {
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? "#4caf50" : "#81c784";
            ctx.fillRect(segment.x * tileSize + 1, segment.y * tileSize + 1, tileSize - 2, tileSize - 2);
            
            if (index === 0) {
                ctx.fillStyle = "#000";
                const eyeOffset = tileSize / 4;
                const eyeSize = tileSize / 8;
                ctx.beginPath();
                if (dx === 1) {
                    ctx.arc(segment.x * tileSize + tileSize - eyeOffset, segment.y * tileSize + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.arc(segment.x * tileSize + tileSize - eyeOffset, segment.y * tileSize + tileSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                } else if (dx === -1) {
                    ctx.arc(segment.x * tileSize + eyeOffset, segment.y * tileSize + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.arc(segment.x * tileSize + eyeOffset, segment.y * tileSize + tileSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                } else if (dy === 1) {
                    ctx.arc(segment.x * tileSize + eyeOffset, segment.y * tileSize + tileSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.arc(segment.x * tileSize + tileSize - eyeOffset, segment.y * tileSize + tileSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                } else if (dy === -1) {
                    ctx.arc(segment.x * tileSize + eyeOffset, segment.y * tileSize + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.arc(segment.x * tileSize + tileSize - eyeOffset, segment.y * tileSize + eyeOffset, eyeSize, 0, Math.PI * 2);
                }
                ctx.fill();
            }
        });
    }
    function drawFood() {
        if (!food) return;
        ctx.fillStyle = "#e94560";
        ctx.beginPath();
        ctx.arc(food.x * tileSize + tileSize / 2, food.y * tileSize + tileSize / 2, tileSize / 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
    function spawnFood() {
        let valid = false;
        while (!valid) {
            food = {
                x: Math.floor(Math.random() * (cols - 2)) + 1,
                y: Math.floor(Math.random() * (rows - 2)) + 1
            };
            valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
        }
    }
    function resetGame() {
        snake = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 }
        ];
        dx = 1; dy = 0;
        nextDx = 1; nextDy = 0;
        score = 0;
        isGameOver = false;
        
        scoreBadge.setLabel("Score: " + score);
        startBtn.setLabel("Start Game");
        pauseBtn.disable();
        pauseBtn.setLabel("Pause");
        
        spawnFood();
        draw();
    }
    function draw() {
        drawGrid();
        drawFood();
        drawSnake();
    }
    function update() {
        if (isPaused || isGameOver) return;
        dx = nextDx;
        dy = nextDy;
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        if (head.x <= 0 || head.x >= cols - 1 || head.y <= 0 || head.y >= rows - 1) {
            endGame();
            return;
        }
        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            endGame();
            return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreBadge.setLabel("Score: " + score);
            spawnFood();
        } else {
            snake.pop();
        }
        draw();
    }
    function startGame() {
        if (gameInterval) clearInterval(gameInterval);
        isPaused = false;
        isGameOver = false;
        startBtn.disable();
        pauseBtn.enable();
        pauseBtn.setLabel("Pause");
        gameInterval = setInterval(update, 150);
    }
    function endGame() {
        clearInterval(gameInterval);
        isGameOver = true;
        startBtn.enable();
        startBtn.setLabel("Restart Game");
        pauseBtn.disable();
        document.getElementById("final-score").textContent = score;
        gameOverModal.open();
    }
    startBtn.onClick(() => {
        if (isGameOver) {
            resetGame();
        } else {
            startGame();
        }
    });
    pauseBtn.onClick(() => {
        if (isGameOver) return;
        if (isPaused) {
            isPaused = false;
            pauseBtn.setLabel("Pause");
        } else {
            isPaused = true;
            pauseBtn.setLabel("Resume");
        }
    });
    const setDirection = (newDx, newDy) => {
        if (isPaused || isGameOver) return;
        if (newDx !== 0 && dx === 0) { nextDx = newDx; nextDy = 0; }
        if (newDy !== 0 && dy === 0) { nextDx = 0; nextDy = newDy; }
    };
    window.addEventListener("keydown", (e) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }
        
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") setDirection(0, -1);
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") setDirection(0, 1);
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") setDirection(-1, 0);
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") setDirection(1, 0);
    });
    upBtn.onClick(() => setDirection(0, -1));
    downBtn.onClick(() => setDirection(0, 1));
    leftBtn.onClick(() => setDirection(-1, 0));
    rightBtn.onClick(() => setDirection(1, 0));
    resetGame();
});