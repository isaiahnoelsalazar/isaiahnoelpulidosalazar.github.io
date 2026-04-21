document.addEventListener("DOMContentLoaded", () => {
    const theme = new ECTheme({
        primary: "#4f46e5",
        background: "#ffffff", 
        text: "#1e293b", 
        textMuted: "#64748b", 
        border: "#cbd5e1"
    });

    const mainWrapper = document.createElement("div");
    mainWrapper.className = "display-flex flexDirection-column alignItems-center justifyContent-center minHeight-100vh boxSizing-border-box";
    
    const card = document.createElement("div");
    card.classList.add("display-flex", "flexDirection-column", "alignItems-center", "justifyContent-center", "background-#ffffff", "boxShadow-0_4px_16px_rgba(0,0,0,0.08)", "borderRadius-16px", "padding-24px");

    const diffPanel = document.createElement("div");
    diffPanel.className = "display-flex gap-12px marginBottom-20px width-100% justifyContent-center";

    const diffDropdown = new ECDropdown({
        items:[
            { label: "Beginner (10x10, 10 Mines)", value: "beginner" },
            { label: "Intermediate (16x16, 40 Mines)", value: "intermediate" },
            { label: "Expert (30x16, 99 Mines)", value: "expert" }
        ]
    }).setTheme(theme);

    diffPanel.appendChild(diffDropdown.element);
    card.appendChild(diffPanel);

    const controlPanel = document.createElement("div");
    controlPanel.className = "display-flex justifyContent-space-between alignItems-center width-100% marginBottom-24px background-#e2e8f0 padding-10px_16px borderRadius-8px border-2px_solid_#cbd5e1 borderBottomColor-#f8fafc borderRightColor-#f8fafc borderTopColor-#94a3b8 borderLeftColor-#94a3b8 boxSizing-border-box";
    
    const minesCounter = document.createElement("div");
    minesCounter.className = "fontSize-24px fontWeight-bold color-#ef4444 background-#1e293b padding-4px_8px borderRadius-4px fontFamily-monospace lineHeight-1 border-2px_solid_#94a3b8 borderTopColor-#0f172a borderLeftColor-#0f172a borderBottomColor-#f1f5f9 borderRightColor-#f1f5f9";
    minesCounter.textContent = "010";

    const resetBtn = document.createElement("button");
    resetBtn.className = "fontSize-28px width-48px height-48px display-flex alignItems-center justifyContent-center cursor-pointer background-#cbd5e1 border-4px_solid_#94a3b8 borderTopColor-#f8fafc borderLeftColor-#f8fafc borderBottomColor-#64748b borderRightColor-#64748b active:borderTopColor-#64748b active:borderLeftColor-#64748b active:borderBottomColor-#f8fafc active:borderRightColor-#f8fafc boxSizing-border-box padding-0 borderRadius-4px";
    resetBtn.textContent = "🙂";

    const timerCounter = document.createElement("div");
    timerCounter.className = "fontSize-24px fontWeight-bold color-#ef4444 background-#1e293b padding-4px_8px borderRadius-4px fontFamily-monospace lineHeight-1 border-2px_solid_#94a3b8 borderTopColor-#0f172a borderLeftColor-#0f172a borderBottomColor-#f1f5f9 borderRightColor-#f1f5f9";
    timerCounter.textContent = "000";

    controlPanel.appendChild(minesCounter);
    controlPanel.appendChild(resetBtn);
    controlPanel.appendChild(timerCounter);
    card.appendChild(controlPanel);

    let ROWS = 10;
    let COLS = 10;
    let MINES = 10;
    
    const gridEl = document.createElement("div");
    card.appendChild(gridEl);
    
    gridEl.addEventListener("contextmenu", e => e.preventDefault());

    mainWrapper.appendChild(card);
    document.body.appendChild(mainWrapper);

    let board =[];
    let firstClick = true;
    let gameOver = false;
    let flags = 0;
    let revealedCount = 0;
    let timerInterval = null;
    let timeElapsed = 0;

    function updateGridStyle() {
        gridEl.className = `display-grid gridTemplateColumns-repeat(${COLS},_32px) gridTemplateRows-repeat(${ROWS},_32px) gap-0 border-4px_solid_#94a3b8 borderTopColor-#64748b borderLeftColor-#64748b borderBottomColor-#f1f5f9 borderRightColor-#f1f5f9 background-#cbd5e1 userSelect-none`;
    }

    function updateCounters() {
        let remain = MINES - flags;
        minesCounter.textContent = String(remain < 0 ? 0 : remain).padStart(3, '0');
        timerCounter.textContent = String(timeElapsed).padStart(3, '0');
    }

    function init() {
        board =[];
        firstClick = true;
        gameOver = false;
        flags = 0;
        revealedCount = 0;
        timeElapsed = 0;
        resetBtn.textContent = "🙂";
        clearInterval(timerInterval);
        timerInterval = null;
        updateCounters();
        updateGridStyle();
        gridEl.innerHTML = '';

        for(let r = 0; r < ROWS; r++) {
            let row =[];
            for(let c = 0; c < COLS; c++) {
                const cellEl = document.createElement("div");
                
                cellEl.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    toggleFlag(r, c);
                });
                
                cellEl.addEventListener("mousedown", (e) => {
                    if(e.button === 2) return;
                    handleCellClick(r, c);
                });

                let cell = { 
                    r, c, 
                    isMine: false, 
                    isRevealed: false, 
                    isFlagged: false, 
                    isDeathMine: false,
                    adjacentMines: 0, 
                    el: cellEl 
                };
                row.push(cell);
                gridEl.appendChild(cellEl);
                renderCell(cell);
            }
            board.push(row);
        }
    }

    function placeMines(firstR, firstC) {
        let placed = 0;
        while(placed < MINES) {
            let r = Math.floor(Math.random() * ROWS);
            let c = Math.floor(Math.random() * COLS);
            
            if (!board[r][c].isMine && (Math.abs(r - firstR) > 1 || Math.abs(c - firstC) > 1)) {
                board[r][c].isMine = true;
                placed++;
            }
        }
        
        for(let r = 0; r < ROWS; r++) {
            for(let c = 0; c < COLS; c++) {
                if(!board[r][c].isMine) {
                    let count = 0;
                    for(let dr = -1; dr <= 1; dr++) {
                        for(let dc = -1; dc <= 1; dc++) {
                            let nr = r + dr, nc = c + dc;
                            if(nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
                                count++;
                            }
                        }
                    }
                    board[r][c].adjacentMines = count;
                }
            }
        }
    }

    function renderCell(cell, wrongFlag = false) {
        let el = cell.el;
        if (cell.isRevealed) {
            el.className = "width-32px height-32px display-flex alignItems-center justifyContent-center fontSize-18px fontWeight-900 background-#e2e8f0 border-1px_solid_#94a3b8 boxSizing-border-box userSelect-none cursor-default";
            
            if (wrongFlag) {
                el.innerHTML = "❌";
            } else if (cell.isDeathMine) {
                el.innerHTML = "💥";
                el.classList.add("background-#ef4444");
            } else if (cell.isMine) {
                el.innerHTML = "💣";
            } else {
                el.innerHTML = cell.adjacentMines > 0 ? cell.adjacentMines : "";
                const colors =["", "#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c", "#0d9488", "#000000", "#57534e"];
                if (cell.adjacentMines > 0) {
                    el.style.color = colors[cell.adjacentMines];
                }
            }
        } else {
            el.className = "width-32px height-32px display-flex alignItems-center justifyContent-center fontSize-18px fontWeight-bold cursor-pointer background-#cbd5e1 border-3px_solid_#94a3b8 borderTopColor-#f8fafc borderLeftColor-#f8fafc borderBottomColor-#64748b borderRightColor-#64748b boxSizing-border-box active:borderTopColor-#64748b active:borderLeftColor-#64748b active:borderBottomColor-#f8fafc active:borderRightColor-#f8fafc userSelect-none";
            el.innerHTML = cell.isFlagged ? "🚩" : "";
        }
    }

    function toggleFlag(r, c) {
        let cell = board[r][c];
        if (gameOver || cell.isRevealed) return;
        cell.isFlagged = !cell.isFlagged;
        flags += cell.isFlagged ? 1 : -1;
        updateCounters();
        renderCell(cell);
    }

    function handleCellClick(r, c) {
        let cell = board[r][c];
        if (gameOver || cell.isFlagged || cell.isRevealed) return;
        
        if (firstClick) {
            firstClick = false;
            placeMines(r, c);
            timerInterval = setInterval(() => {
                if (timeElapsed < 999) timeElapsed++;
                updateCounters();
            }, 1000);
        }
        
        reveal(r, c);
    }

    function reveal(r, c) {
        let cell = board[r][c];
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        revealedCount++;
        
        if (cell.isMine) {
            cell.isDeathMine = true;
            renderCell(cell);
            handleLose();
            return;
        }

        renderCell(cell);
        
        if (cell.adjacentMines === 0) {
            for(let dr = -1; dr <= 1; dr++) {
                for(let dc = -1; dc <= 1; dc++) {
                    let nr = r + dr, nc = c + dc;
                    if(nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                        reveal(nr, nc);
                    }
                }
            }
        }
        
        checkWin();
    }

    function handleLose() {
        gameOver = true;
        clearInterval(timerInterval);
        resetBtn.textContent = "😵";
        
        for(let r = 0; r < ROWS; r++) {
            for(let c = 0; c < COLS; c++) {
                let cell = board[r][c];
                if (cell.isMine && !cell.isFlagged && !cell.isDeathMine) {
                    cell.isRevealed = true;
                    renderCell(cell);
                } else if (!cell.isMine && cell.isFlagged) {
                    cell.isRevealed = true;
                    renderCell(cell, true);
                }
            }
        }
        
        new ECToast("Game Over! You hit a mine.", { type: "error" }).setTheme(theme).show();
    }

    function checkWin() {
        if (revealedCount === ROWS * COLS - MINES) {
            gameOver = true;
            clearInterval(timerInterval);
            resetBtn.textContent = "😎";
            
            for(let r = 0; r < ROWS; r++) {
                for(let c = 0; c < COLS; c++) {
                    let cell = board[r][c];
                    if (cell.isMine && !cell.isFlagged) {
                        cell.isFlagged = true;
                        renderCell(cell);
                    }
                }
            }
            flags = MINES;
            updateCounters();
            
            new ECToast(`You Win! Minefield cleared in ${timeElapsed}s.`, { type: "success" }).setTheme(theme).show();
        }
    }

    diffDropdown.onChange((val) => {
        if (val === "beginner") { ROWS = 10; COLS = 10; MINES = 10; }
        else if (val === "intermediate") { ROWS = 16; COLS = 16; MINES = 40; }
        else if (val === "expert") { ROWS = 16; COLS = 30; MINES = 99; }
        init();
    });

    resetBtn.addEventListener("click", init);

    init();
});