document.addEventListener("DOMContentLoaded", () => {
  // State & Engine Initialization
  const game = new Chess();
  let selectedSquare = null;
  let gameActive = true;
  let playerColor = 'w'; // default
  
  let playerElo = parseInt(localStorage.getItem('chess_elo')) || 1000;
  const botElos = { '1': 300, '2': 1000, '3': 1375 };
  // UI Setup using ECElements
  const playerCard = new window.ECMediaCard({
    author: "You (White)",
    content: `<b>Elo Rating:</b> ${playerElo}`,
    avatarSrc: "https://api.dicebear.com/7.x/avataaars/svg?seed=Player"
  });
  document.getElementById('player-info-container').appendChild(playerCard.element);
  
  const botCard = new window.ECMediaCard({
    author: "ChessBot (Black)",
    content: `<b>Elo Rating:</b> 1000`,
    avatarSrc: "https://api.dicebear.com/7.x/bottts/svg?seed=ChessBot"
  });
  document.getElementById('bot-info-container').appendChild(botCard.element);
  
  // Spinner to indicate thinking
  // const spinnerContainer = document.createElement('div');
  // spinnerContainer.className = "display-none alignItems-center gap-8px marginTop-8px color-var(--ec-text-muted,_#6c757d) fontSize-14px fontWeight-500";
  // const spinner = new window.ECSpinner({ size: "sm" });
  // spinnerContainer.appendChild(spinner.element);
  // const spinnerText = document.createElement("span");
  // spinnerText.textContent = "Bot is thinking...";
  // spinnerContainer.appendChild(spinnerText);
  // document.getElementById('bot-info-container').appendChild(spinnerContainer);
  // Color Randomizer Dropdown
  const colorDropdown = new window.ECDropdown({
    label: "Play as",
    items: [
      { label: "Random Color", value: "random" },
      { label: "White", value: "w" },
      { label: "Black", value: "b" }
    ]
  });
  document.getElementById('color-dropdown-container').appendChild(colorDropdown.element);
  // Difficulty Dropdown
  const botLevelDropdown = new window.ECDropdown({
    label: "AI Difficulty Level",
    items: [
      { label: "L1 (300 Elo)", value: "1" },
      { label: "L2 (1000 Elo)", value: "2" },
      { label: "L3 (1375 Elo)", value: "3" }
    ]
  });
  botLevelDropdown.setValue("2"); // Default to intermediate
  botLevelDropdown.onChange((val) => {
    botCard.setContent(`<b>Elo Rating:</b> ${botElos[val]}`);
  });
  document.getElementById('dropdown-container').appendChild(botLevelDropdown.element);
  // Log Format Toggle
  const logFormatDropdown = new window.ECDropdown({
    items: [
      { label: "Move List", value: "list" },
      { label: "PGN (Raw)", value: "pgn" }
    ]
  });
  logFormatDropdown.onChange(() => updateSidebar());
  document.getElementById('log-format-container').appendChild(logFormatDropdown.element);
  // New Game Button
  const newGameBtn = new window.ECButton("Start New Game", { variant: "filled" });
  newGameBtn.onClick(() => startGame());
  document.getElementById('new-game-btn-container').appendChild(newGameBtn.element);
  const pgnBox = document.getElementById('pgn-container');
  const moveListBox = document.getElementById('movelist-container');
  const boardContainer = document.getElementById('board-container');
  
  const solidPieces = { 'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚' };
  function startGame() {
    game.reset();
    selectedSquare = null;
    gameActive = true;
    
    // Resolve random color
    const colorPref = colorDropdown.getValue();
    playerColor = colorPref === 'random' ? (Math.random() > 0.5 ? 'w' : 'b') : colorPref;
    // Update Labels dynamically
    playerCard.element.querySelector('p').textContent = `You (${playerColor === 'w' ? 'White' : 'Black'})`;
    botCard.element.querySelector('p').textContent = `ChessBot (${playerColor === 'w' ? 'Black' : 'White'})`;
    updateBoard();
    updateSidebar();
    // Bot moves first if player is Black
    if (playerColor === 'b') {
      makeBotMove();
    }
  }
  function updateSidebar() {
    const format = logFormatDropdown.getValue();
    
    if (format === 'pgn') {
      pgnBox.classList.replace("display-none", "display-block");
      moveListBox.classList.replace("display-flex", "display-none");
      pgnBox.value = game.pgn() || "Moves will appear here...";
      pgnBox.scrollTop = pgnBox.scrollHeight;
    } else {
      pgnBox.classList.replace("display-block", "display-none");
      moveListBox.classList.replace("display-none", "display-flex");
      
      moveListBox.innerHTML = '';
      const history = game.history();
      
      if (history.length === 0) {
        moveListBox.innerHTML = '<div class="padding-12px color-var(--ec-text-muted,_#6c757d) fontSize-14px">Moves will appear here...</div>';
      } else {
        for (let i = 0; i < history.length; i += 2) {
          const row = document.createElement("div");
          row.className = "display-flex alignItems-center padding-8px_12px fontSize-14px borderBottom-1px_solid_var(--ec-border,_#dee2e6)";
          // Alternating backgrounds for rows
          if ((i / 2) % 2 === 1) row.classList.add("background-var(--ec-bg,_#fff)");
          
          const whiteMove = history[i];
          const blackMove = history[i+1] || '';
          
          row.innerHTML = `
            <div class="color-var(--ec-text-muted,_#6c757d) width-36px fontWeight-600">${i / 2 + 1}.</div>
            <div class="flex-1 color-var(--ec-text,_#212529)">${whiteMove}</div>
            <div class="flex-1 color-var(--ec-text,_#212529)">${blackMove}</div>
          `;
          moveListBox.appendChild(row);
        }
      }
      moveListBox.scrollTop = moveListBox.scrollHeight;
    }
  }
  function updateElo(score) {
    const level = botLevelDropdown.getValue();
    const botElo = botElos[level] || 1000; // Fallback just in case
    
    // 1. Dynamic K-Factor
    // New players fluctuate faster, veterans stabilize
    let K = 32;
    if (playerElo < 1200) K = 40;
    else if (playerElo >= 2000) K = 16;
    else if (playerElo >= 2400) K = 10;
    
    // 2. Standard Elo Math
    const expected = 1 / (1 + Math.pow(10, (botElo - playerElo) / 400));
    const eloChange = Math.round(K * (score - expected));
    let newElo = playerElo + eloChange;
    
    // 3. Set a rating floor (no one goes below 100 Elo)
    if (newElo < 100) newElo = 100;
    
    // Recalculate actual change in case they hit the floor
    const actualChange = newElo - playerElo;
    playerElo = newElo; // Update global variable
    
    localStorage.setItem('chess_elo', playerElo);
    playerCard.setContent(`<b>Elo Rating:</b> ${playerElo}`);
    
    // 4. Polish the UI Notification
    // Format the change string so it shows a plus sign for gains (e.g., "+15")
    const changeStr = actualChange > 0 ? `+${actualChange}` : `${actualChange}`;
    
    // Determine text and toast color based on the score (1 = win, 0.5 = draw, 0 = loss)
    let resultText = 'Draw';
    let toastType = 'info';
    
    if (score === 1) {
      resultText = 'Victory!';
      toastType = 'success'; // Usually green
    } else if (score === 0) {
      resultText = 'Defeat...';
      toastType = 'error';   // Usually red
    }

    // Example output: "Victory! New Elo: 1215 (+15)"
    const toastMessage = `${resultText} New Elo: ${playerElo} (${changeStr})`;
    const toast = new window.ECToast(toastMessage, { type: toastType, duration: 4000 });
    toast.show();
  }
  function checkGameOver() {
    if (game.game_over() && gameActive) {
      gameActive = false;
      if (game.in_checkmate()) {
        // game.turn() returns the color of the player who was JUST checkmated 
        // (i.e., the player who has no legal moves).
        const playerWon = game.turn() !== playerColor;
        const winnerName = playerWon ? 'Player' : 'Bot';
        
        const toast = new window.ECToast(`Checkmate! ${winnerName} wins.`, { type: playerWon ? 'success' : 'error' });
        toast.show();
        
        updateElo(playerWon ? 1 : 0);
      } else {
        const toast = new window.ECToast(`Game drawn!`, { type: 'warning' });
        toast.show();
        updateElo(0.5);
      }
    }
  }
  function handleSquareClick(sq) {
    if (!gameActive || game.turn() !== playerColor) return;
    if (!selectedSquare) {
      const piece = game.get(sq);
      if (piece && piece.color === playerColor) {
        selectedSquare = sq;
        updateBoard();
      }
    } else {
      const moves = game.moves({ verbose: true });
      let validMoves = moves.filter(m => m.from === selectedSquare && m.to === sq);
      if (validMoves.length > 0) {
        // Auto-promote to Queen if a promotion is valid
        let moveObj = validMoves[0];
        if (moveObj.promotion) {
          moveObj = validMoves.find(m => m.promotion === 'q') || validMoves[0];
        }
        
        game.move(moveObj.san);
        selectedSquare = null;
        updateBoard();
        updateSidebar();
        checkGameOver();
        
        if (gameActive && game.turn() !== playerColor) {
          makeBotMove();
        }
      } else {
        // Switch selection if another allied piece is clicked
        const piece = game.get(sq);
        if (piece && piece.color === playerColor) {
          selectedSquare = sq;
          updateBoard();
        } else {
          selectedSquare = null;
          updateBoard();
        }
      }
    }
  }
  function updateBoard() {
    boardContainer.innerHTML = '';
    const board = game.board();
    const moves = game.moves({ verbose: true });
    const validDestinations = selectedSquare ? moves.filter(m => m.from === selectedSquare).map(m => m.to) : [];
    const isWhitePerspective = playerColor === 'w';
    for (let visualRow = 0; visualRow < 8; visualRow++) {
      for (let visualCol = 0; visualCol < 8; visualCol++) {
        
        // Map visual grid rendering coordinates to the logical chess.js coordinates
        const boardRow = isWhitePerspective ? visualRow : 7 - visualRow;
        const boardCol = isWhitePerspective ? visualCol : 7 - visualCol;
        
        // chess.js format: a-h is 0-7, rank 8-1 is 0-7
        const fileChar = String.fromCharCode(97 + boardCol);
        const rankNum = 8 - boardRow;
        const squareId = fileChar + rankNum;
        const squareDiv = document.createElement('div');
        
        const isDark = (visualRow + visualCol) % 2 === 1;
        const baseColor = isDark ? "background-#b58863" : "background-#f0d9b5";
        const bgClass = selectedSquare === squareId ? "background-#baca44" : baseColor;
        squareDiv.className = `display-flex alignItems-center justifyContent-center fontSize-36px cursor-pointer userSelect-none transition-background_0.15s_ease position-relative ${bgClass}`;
        
        // Render Piece
        const piece = board[boardRow][boardCol];
        if (piece) {
          squareDiv.textContent = solidPieces[piece.type];
          if(piece.color === 'w') {
             squareDiv.style.color = '#ffffff';
             squareDiv.style.textShadow = '0 2px 4px rgba(0,0,0,0.6)';
          } else {
             squareDiv.style.color = '#212529';
             squareDiv.style.textShadow = '0 1px 2px rgba(255,255,255,0.3)';
          }
        }
        // Draw coordinate labels over edges relative to board orientation
        if (visualCol === 0) {
          const rankLabel = document.createElement('span');
          rankLabel.textContent = rankNum;
          rankLabel.className = "position-absolute top-4px left-4px fontSize-11px fontWeight-700 pointerEvents-none";
          rankLabel.style.color = isDark ? "#f0d9b5" : "#b58863";
          squareDiv.appendChild(rankLabel);
        }
        if (visualRow === 7) {
          const fileLabel = document.createElement('span');
          fileLabel.textContent = fileChar;
          fileLabel.className = "position-absolute bottom-4px right-4px fontSize-11px fontWeight-700 pointerEvents-none";
          fileLabel.style.color = isDark ? "#f0d9b5" : "#b58863";
          squareDiv.appendChild(fileLabel);
        }
        // Valid Move Indicators (Dots)
        if (validDestinations.includes(squareId)) {
          const dot = document.createElement('div');
          dot.className = "width-16px height-16px borderRadius-50% background-rgba(0,0,0,0.2) position-absolute top-50% left-50% transform-translate(-50%,_-50%) pointerEvents-none";
          squareDiv.appendChild(dot);
        }
        squareDiv.addEventListener('click', () => handleSquareClick(squareId));
        boardContainer.appendChild(squareDiv);
      }
    }
  }
  // // Bot Logic (Minimax with Alpha-Beta Pruning)
  // const pieceValues = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
  // function evaluateBoard(gameNode) {
  //   if (gameNode.in_checkmate()) return gameNode.turn() === 'w' ? -9999 : 9999;
  //   if (gameNode.in_draw() || gameNode.in_stalemate() || gameNode.in_threefold_repetition()) return 0;
    
  //   let score = 0;
  //   const board = gameNode.board();
  //   for (let r = 0; r < 8; r++) {
  //     for (let c = 0; c < 8; c++) {
  //       const piece = board[r][c];
  //       if (piece) {
  //         // Positional logic: Small advantage points for central control
  //         const posBonus = (piece.type === 'p' || piece.type === 'n') ? 
  //           (0.5 - Math.abs(3.5 - r)/8 - Math.abs(3.5 - c)/8) * 3 : 0;
          
  //         const val = pieceValues[piece.type] + posBonus;
  //         score += piece.color === 'w' ? val : -val;
  //       }
  //     }
  //   }
  //   return score;
  // }
  // function minimax(gameNode, depth, alpha, beta, isMaximizing) {
  //   if (depth === 0 || gameNode.game_over()) {
  //     return evaluateBoard(gameNode);
  //   }
  //   const mvs = gameNode.moves();
  //   if (isMaximizing) {
  //     let maxEval = -Infinity;
  //     for (let i = 0; i < mvs.length; i++) {
  //       gameNode.move(mvs[i]);
  //       let ev = minimax(gameNode, depth - 1, alpha, beta, false);
  //       gameNode.undo();
  //       maxEval = Math.max(maxEval, ev);
  //       alpha = Math.max(alpha, ev);
  //       if (beta <= alpha) break;
  //     }
  //     return maxEval;
  //   } else {
  //     let minEval = Infinity;
  //     for (let i = 0; i < mvs.length; i++) {
  //       gameNode.move(mvs[i]);
  //       let ev = minimax(gameNode, depth - 1, alpha, beta, true);
  //       gameNode.undo();
  //       minEval = Math.min(minEval, ev);
  //       beta = Math.min(beta, ev);
  //       if (beta <= alpha) break;
  //     }
  //     return minEval;
  //   }
  // }
  // function getBestMove(gameNode, depth) {
  //   const mvs = gameNode.moves();
  //   let bestMove = null;
  //   let bestValue = gameNode.turn() === 'w' ? -Infinity : Infinity;
  //   // Randomly shuffle moves slightly to prevent deterministic, repetitive mirror openings
  //   mvs.sort(() => Math.random() - 0.5);
  //   for (let i = 0; i < mvs.length; i++) {
  //     gameNode.move(mvs[i]);
  //     let boardValue = minimax(gameNode, depth - 1, -Infinity, Infinity, gameNode.turn() === 'w');
  //     gameNode.undo();
      
  //     if (gameNode.turn() === 'w') {
  //       if (boardValue > bestValue) {
  //         bestValue = boardValue;
  //         bestMove = mvs[i];
  //       }
  //     } else {
  //       if (boardValue < bestValue) {
  //         bestValue = boardValue;
  //         bestMove = mvs[i];
  //       }
  //     }
  //   }
  //   return bestMove || mvs[0];
  // }

  // --- 1. Enhanced Evaluation Constants ---
  // Standard Centipawn values
  const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

  // Piece-Square Tables (PST) to encourage better piece placement. 
  // These values are oriented for White. The code flips them for Black automatically.
  const PST = {
    p: [[0,  0,  0,  0,  0,  0,  0,  0],[50, 50, 50, 50, 50, 50, 50, 50],[10, 10, 20, 30, 30, 20, 10, 10],[5,  5, 10, 25, 25, 10,  5,  5],[0,  0,  0, 20, 20,  0,  0,  0],[5, -5,-10,  0,  0,-10, -5,  5],[5, 10, 10,-20,-20, 10, 10,  5],[0,  0,  0,  0,  0,  0,  0,  0]
    ],
    n: [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,  0,  0,  0,  0,-20,-40],[-30,  0, 10, 15, 15, 10,  0,-30],[-30,  5, 15, 20, 20, 15,  5,-30],[-30,  0, 15, 20, 20, 15,  0,-30],[-30,  5, 10, 15, 15, 10,  5,-30],[-40,-20,  0,  5,  5,  0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    b: [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,  0,  0,  0,  0,  0,  0,-10],[-10,  0,  5, 10, 10,  5,  0,-10],[-10,  5,  5, 10, 10,  5,  5,-10],[-10,  0, 10, 10, 10, 10,  0,-10],[-10, 10, 10, 10, 10, 10, 10,-10],[-10,  5,  0,  0,  0,  0,  5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    r: [[0,  0,  0,  0,  0,  0,  0,  0],[5, 10, 10, 10, 10, 10, 10,  5],[-5,  0,  0,  0,  0,  0,  0, -5],[-5,  0,  0,  0,  0,  0,  0, -5],[-5,  0,  0,  0,  0,  0,  0, -5],[-5,  0,  0,  0,  0,  0,  0, -5],[-5,  0,  0,  0,  0,  0,  0, -5],[0,  0,  0,  5,  5,  0,  0,  0]
    ],
    q: [[-20,-10,-10, -5, -5,-10,-10,-20],[-10,  0,  0,  0,  0,  0,  0,-10],[-10,  0,  5,  5,  5,  5,  0,-10],[ -5,  0,  5,  5,  5,  5,  0, -5],[  0,  0,  5,  5,  5,  5,  0, -5],[-10,  5,  5,  5,  5,  5,  0,-10],[-10,  0,  5,  0,  0,  0,  0,-10],[-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    k: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[ 20, 20,  0,  0,  0,  0, 20, 20],[ 20, 30, 10,  0,  0, 10, 30, 20]
    ]
  };

  function evaluateBoard(gameNode) {
    let score = 0;
    const board = gameNode.board();

    // Purely evaluates board state. Game-over states are handled in minimax now for performance.
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          // Automatically flips the row perspective if the piece is Black
          const pstRow = piece.color === 'w' ? r : 7 - r;
          const posBonus = PST[piece.type][pstRow][c];

          const val = PIECE_VALUES[piece.type] + posBonus;
          score += piece.color === 'w' ? val : -val;
        }
      }
    }
    return score;
  }

  // Helper to efficiently order moves (using chess.js verbose moves)
  function orderMoves(moves) {
    return moves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // MVV-LVA logic: prioritize capturing high-value pieces with low-value attackers
      if (a.captured) scoreA += 10 * PIECE_VALUES[a.captured] - PIECE_VALUES[a.piece];
      if (a.flags.includes('p')) scoreA += PIECE_VALUES[a.promotion] || 900;

      if (b.captured) scoreB += 10 * PIECE_VALUES[b.captured] - PIECE_VALUES[b.piece];
      if (b.flags.includes('p')) scoreB += PIECE_VALUES[b.promotion] || 900;

      return scoreB - scoreA;
    });
  }

  // Quiescence Search: Only searches capturing sequences to avoid the horizon effect
  function quiescence(gameNode, alpha, beta, isMaximizing, qsDepth = 0) {
    const standPat = evaluateBoard(gameNode);

    // Evaluate the "quiet" board state
    if (isMaximizing) {
      if (standPat >= beta) return beta;
      if (alpha < standPat) alpha = standPat;
    } else {
      if (standPat <= alpha) return alpha;
      if (standPat < beta) beta = standPat;
    }

    // Prevent endless capture chains lagging the browser
    if (qsDepth > 4) return standPat;

    // Only check moves that involve a capture
    const captures = gameNode.moves({ verbose: true }).filter(m => m.captured);
    const orderedCaptures = orderMoves(captures);

    for (const move of orderedCaptures) {
      gameNode.move(move.san);
      const score = quiescence(gameNode, alpha, beta, !isMaximizing, qsDepth + 1);
      gameNode.undo();

      if (isMaximizing) {
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      } else {
        if (score <= alpha) return alpha;
        if (score < beta) beta = score;
      }
    }

    return isMaximizing ? alpha : beta;
  }

  function minimax(gameNode, depth, alpha, beta, isMaximizing) {
    // Graceful handling depending on chess.js version
    const isGameOver = typeof gameNode.isGameOver === 'function' ? gameNode.isGameOver() : gameNode.game_over();

    if (isGameOver) {
      if (gameNode.in_draw() || gameNode.in_stalemate() || gameNode.in_threefold_repetition()) return 0;
      
      // Penalize slower checkmates / Reward faster checkmates depending on perspective
      return gameNode.turn() === 'w' ? -99999 - depth : 99999 + depth;
    }

    // Once depth limits are hit, switch strictly to Quiescence Search for capturing moves
    if (depth === 0) {
      return quiescence(gameNode, alpha, beta, isMaximizing, 0);
    }

    // Use verbose mode to get objects, saving us from manually checking strings for 'x'
    const moves = orderMoves(gameNode.moves({ verbose: true }));

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        gameNode.move(move.san);
        const evalScore = minimax(gameNode, depth - 1, alpha, beta, false);
        gameNode.undo();
        
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break; // alpha-beta cutoff
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        gameNode.move(move.san);
        const evalScore = minimax(gameNode, depth - 1, alpha, beta, true);
        gameNode.undo();
        
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break; // alpha-beta cutoff
      }
      return minEval;
    }
  }

  function getBestMove(gameNode, depth) {
    // Fetch detailed moves to power MVV-LVA logic later
    const moves = gameNode.moves({ verbose: true });
    if (moves.length === 0) return null;
    
    const orderedMoves = orderMoves(moves);
    const isWhite = gameNode.turn() === 'w';

    let bestMove = null;
    let bestValue = isWhite ? -Infinity : Infinity;

    for (const move of orderedMoves) {
      gameNode.move(move.san);
      const boardValue = minimax(gameNode, depth - 1, -Infinity, Infinity, !isWhite);
      gameNode.undo();

      if (isWhite) {
        if (boardValue > bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }
      } else {
        if (boardValue < bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }
      }
    }

    // Extract the SAN string notation (e.g. "Nf3") which behaves perfectly with your existing bot execution logic
    return bestMove ? bestMove.san : orderedMoves[0].san;
  }

  function makeBotMove() {
    if (!gameActive) return;
    // Show thinking UI
    // spinnerContainer.classList.replace("display-none", "display-flex");
    
    // Timeout prevents block & allows the DOM spinner to render before intensive calculation
    setTimeout(() => {
      const level = botLevelDropdown.getValue();
      const mvs = game.moves();
      let move;
      
      if (level === '1') { 
        // Level 1: Beginner, Random Move
        move = mvs[Math.floor(Math.random() * mvs.length)];
      } else if (level === '2') { 
        // Level 2: Intermediate, 2-Ply Minimax Read
        move = getBestMove(game, 2);
      } else if (level === '3') { 
        // Level 3: Advanced, 3-Ply Minimax Read
        move = getBestMove(game, 3);
      }
      
      game.move(move);
      updateBoard();
      updateSidebar();
      // spinnerContainer.classList.replace("display-flex", "display-none");
      checkGameOver();
    }, 50);
  }
  // Initialize the first match
  startGame();
});