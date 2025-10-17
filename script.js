// ======================================
// TIC-TAC-TOE GAME - MODERN UI/UX
// ======================================

class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'pvp'; // 'pvp' or 'pvc'
        this.difficulty = 'easy'; // 'easy', 'medium', 'hard'
        this.isGameActive = true;
        this.isAITurn = false;
        this.moveHistory = [];
        this.prefs = this.loadPrefs ? this.loadPrefs() : { sound: true, vibrate: true };
        this.stats = this.loadStats();
        
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
            [0, 4, 8], [2, 4, 6] // Diagonales
        ];
        
        this.initializeGame();
    }
    
    // ======================================
    // INICIALIZACIÓN Y EVENTOS
    // ======================================
    
    initializeGame() {
        this.bindEvents();
        this.updateUI();
        this.displayStats();
        if (this.applyPrefsUI) this.applyPrefsUI();
    }
    
    bindEvents() {
        // Eventos del tablero
        const boardEl = document.getElementById('game-board');
        boardEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                const index = parseInt(e.target.dataset.index);
                this.handleCellClick(index);
            }
        });
        // Navegación por teclado
        boardEl.addEventListener('keydown', (e) => {
            const active = document.activeElement;
            if (!active || !active.classList.contains('cell')) return;
            const idx = parseInt(active.dataset.index);
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            let nextIdx = idx;
            switch (e.key) {
                case 'ArrowRight': nextIdx = row * 3 + Math.min(col + 1, 2); break;
                case 'ArrowLeft': nextIdx = row * 3 + Math.max(col - 1, 0); break;
                case 'ArrowDown': nextIdx = Math.min(idx + 3, 8); break;
                case 'ArrowUp': nextIdx = Math.max(idx - 3, 0); break;
                case 'Enter':
                case ' ': e.preventDefault(); this.handleCellClick(idx); return;
                default: return;
            }
            if (nextIdx !== idx) {
                e.preventDefault();
                const nextCell = boardEl.querySelector(`[data-index="${nextIdx}"]`);
                if (nextCell) nextCell.focus();
            }
        });
        
        // Eventos de modo de juego
        document.getElementById('pvp-mode').addEventListener('click', () => {
            this.setGameMode('pvp');
        });
        
        document.getElementById('pvc-mode').addEventListener('click', () => {
            this.setGameMode('pvc');
        });
        
        // Eventos de dificultad
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setDifficulty(btn.dataset.level);
            });
        });
        
        // Botones de acción
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.addEventListener('click', () => this.undoMove());
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.resetGame();
            this.hideGameResult();
        });

        // Cerrar modal de resultado con botón
        const closeResult = document.getElementById('close-result');
        if (closeResult) {
            closeResult.addEventListener('click', () => {
                this.hideGameResult();
            });
        }
        
        document.getElementById('stats-btn').addEventListener('click', () => {
            this.showStatsModal();
        });
        
        document.getElementById('close-stats').addEventListener('click', () => {
            this.hideStatsModal();
        });
        
        document.getElementById('reset-stats').addEventListener('click', () => {
            this.resetStats();
        });
        
        // Cerrar modales con clic fuera
        document.getElementById('stats-modal').addEventListener('click', (e) => {
            if (e.target.id === 'stats-modal') {
                this.hideStatsModal();
            }
        });
        
        document.getElementById('game-result').addEventListener('click', (e) => {
            if (e.target.id === 'game-result') {
                this.resetGame();
                this.hideGameResult();
            }
        });
        
        // Eventos de teclado para accesibilidad
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideStatsModal();
                this.hideGameResult();
            }
        });

        // Recalcular elementos posicionados tras cambios de tamaño/orientación
        window.addEventListener('resize', () => this.handleResize());

        // Preferencias
        const soundToggle = document.getElementById('sound-toggle');
        const vibrateToggle = document.getElementById('vibrate-toggle');
        if (soundToggle) soundToggle.addEventListener('change', () => this.togglePref('sound', soundToggle.checked));
        if (vibrateToggle) vibrateToggle.addEventListener('change', () => this.togglePref('vibrate', vibrateToggle.checked));
        const startXBtn = document.getElementById('start-x');
        const startOBtn = document.getElementById('start-o');
        if (startXBtn && startOBtn) {
            startXBtn.addEventListener('click', () => this.setStartPlayer('X'));
            startOBtn.addEventListener('click', () => this.setStartPlayer('O'));
        }
    }
    
    // ======================================
    // CONFIGURACIÓN DEL JUEGO
    // ======================================
    
    setGameMode(mode) {
        this.gameMode = mode;
        this.resetGame();
        this.updateModeButtons();
        this.updateDifficultyVisibility();
    }
    
    setDifficulty(level) {
        this.difficulty = level;
        this.updateDifficultyButtons();
        this.resetGame();
    }
    
    setStartPlayer(player) {
        this.currentPlayer = player;
        const xBtn = document.getElementById('start-x');
        const oBtn = document.getElementById('start-o');
        if (xBtn && oBtn) {
            xBtn.classList.toggle('active', player === 'X');
            oBtn.classList.toggle('active', player === 'O');
            xBtn.setAttribute('aria-pressed', String(player === 'X'));
            oBtn.setAttribute('aria-pressed', String(player === 'O'));
        }
        this.resetGame({ preserveStartPlayer: true });
    }
    
    updateModeButtons() {
        document.getElementById('pvp-mode').classList.toggle('active', this.gameMode === 'pvp');
        document.getElementById('pvc-mode').classList.toggle('active', this.gameMode === 'pvc');
    }
    
    updateDifficultyButtons() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === this.difficulty);
        });
    }
    
    updateDifficultyVisibility() {
        const difficultySelector = document.getElementById('difficulty-selector');
        difficultySelector.style.display = this.gameMode === 'pvc' ? 'block' : 'none';
    }
    
    // ======================================
    // LÓGICA DE JUEGO PRINCIPAL
    // ======================================
    
    handleCellClick(index) {
        if (!this.isValidMove(index)) return;
        
        this.makeMove(index, this.currentPlayer);
        
        if (this.checkGameEnd()) return;
        
        this.switchPlayer();
        
        // Si es modo PvC y ahora es turno de la IA
        if (this.gameMode === 'pvc' && this.currentPlayer === 'O') {
            this.handleAITurn();
        }
    }
    
    isValidMove(index) {
        return this.board[index] === '' && this.isGameActive && !this.isAITurn;
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.updateCell(index, player);
        this.addMoveAnimation(index);
        this.createParticleEffect(index);
        // Registrar historial y feedback
        this.moveHistory.push(index);
        this.playFeedback();
        this.announceMove(index, player);
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateTurnIndicator();
    }
    
    checkGameEnd() {
        const winner = this.checkWinner();
        
        if (winner) {
            this.handleGameWin(winner);
            return true;
        }
        
        if (this.isBoardFull()) {
            this.handleGameDraw();
            return true;
        }
        
        return false;
    }
    
    checkWinner() {
        for (const condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningLine = condition;
                return this.board[a];
            }
        }
        return null;
    }
    
    isBoardFull() {
        return this.board.every(cell => cell !== '');
    }
    
    handleGameWin(winner) {
        this.isGameActive = false;
        this.highlightWinningCells();
        this.showWinningLine();
        this.createWinConfetti();
        
        setTimeout(() => {
            this.showGameResult(winner);
            this.updateStats(winner);
        }, 1000);
    }
    
    handleGameDraw() {
        this.isGameActive = false;
        
        setTimeout(() => {
            this.showGameResult('draw');
            this.updateStats('draw');
        }, 500);
    }
    
    // ======================================
    // EFECTOS VISUALES MODERNOS
    // ======================================
    
    createParticleEffect(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        const rect = cell.getBoundingClientRect();
        const particles = 6;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.backgroundColor = this.currentPlayer === 'X' ? '#ef4444' : '#3b82f6';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.left = rect.left + rect.width / 2 + 'px';
            particle.style.top = rect.top + rect.height / 2 + 'px';
            particle.style.zIndex = '1000';
            particle.style.boxShadow = '0 0 6px currentColor';
            
            document.body.appendChild(particle);
            
            const angle = (i / particles) * Math.PI * 2;
            const velocity = 50 + Math.random() * 50;
            const lifetime = 800 + Math.random() * 400;
            
            particle.animate([
                {
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: lifetime,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }
    
    createWinConfetti() {
        const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = Math.random() * 8 + 4 + 'px';
                confetti.style.height = confetti.style.width;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.top = '-10px';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '999';
                confetti.style.boxShadow = '0 0 6px currentColor';
                
                document.body.appendChild(confetti);
                
                const fallDuration = Math.random() * 3000 + 2000;
                const rotation = Math.random() * 360;
                const sway = (Math.random() - 0.5) * 100;
                
                confetti.animate([
                    {
                        transform: `translateX(0) rotate(0deg)`,
                        opacity: 1
                    },
                    {
                        transform: `translateX(${sway}px) translateY(${window.innerHeight + 100}px) rotate(${rotation}deg)`,
                        opacity: 0
                    }
                ], {
                    duration: fallDuration,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }).onfinish = () => {
                    confetti.remove();
                };
            }, i * 100);
        }
    }
    
    // ======================================
    // LÓGICA DE IA - TRES NIVELES
    // ======================================
    
    handleAITurn() {
        this.isAITurn = true;
        this.showAIThinking();
        
        // Delay visual para mejorar UX (~500ms)
        setTimeout(() => {
            const move = this.getAIMove();
            if (move !== -1) {
                this.makeMove(move, 'O');
                
                if (this.checkGameEnd()) {
                    this.hideAIThinking();
                    return;
                }
                
                this.switchPlayer();
            }
            
            this.isAITurn = false;
            this.hideAIThinking();
        }, 500);
    }
    
    getAIMove() {
        switch (this.difficulty) {
            case 'easy':
                return this.getEasyAIMove();
            case 'medium':
                return this.getMediumAIMove();
            case 'hard':
                return this.getHardAIMove();
            default:
                return this.getEasyAIMove();
        }
    }
    
    // IA FÁCIL: Movimientos completamente aleatorios
    getEasyAIMove() {
        const availableMoves = this.getAvailableMoves();
        if (availableMoves.length === 0) return -1;
        
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }
    
    // IA MEDIO: Lógica heurística de 5 pasos
    getMediumAIMove() {
        // 1. Intentar ganar
        const winMove = this.findWinningMove('O');
        if (winMove !== -1) return winMove;
        
        // 2. Bloquear al oponente
        const blockMove = this.findWinningMove('X');
        if (blockMove !== -1) return blockMove;
        
        // 3. Tomar el centro si está disponible
        if (this.board[4] === '') return 4;
        
        // 4. Tomar una esquina disponible
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => this.board[corner] === '');
        if (availableCorners.length > 0) {
            const randomCorner = Math.floor(Math.random() * availableCorners.length);
            return availableCorners[randomCorner];
        }
        
        // 5. Tomar cualquier lado disponible o movimiento aleatorio
        return this.getEasyAIMove();
    }
    
    // IA DIFÍCIL: Algoritmo Minimax
    getHardAIMove() {
        const bestMove = this.minimax(this.board, 0, true);
        return bestMove.index;
    }
    
    // Implementación del algoritmo Minimax
    minimax(board, depth, isMaximizing) {
        const winner = this.evaluateBoard(board);
        
        // Casos base
        if (winner === 'O') return { score: 10 - depth };
        if (winner === 'X') return { score: depth - 10 };
        if (this.isBoardFullArray(board)) return { score: 0 };
        
        const availableMoves = this.getAvailableMovesArray(board);
        
        if (isMaximizing) {
            let maxEval = { score: -Infinity };
            
            for (const move of availableMoves) {
                const newBoard = [...board];
                newBoard[move] = 'O';
                
                const evaluation = this.minimax(newBoard, depth + 1, false);
                
                if (evaluation.score > maxEval.score) {
                    maxEval = { score: evaluation.score, index: move };
                }
            }
            
            return maxEval;
        } else {
            let minEval = { score: Infinity };
            
            for (const move of availableMoves) {
                const newBoard = [...board];
                newBoard[move] = 'X';
                
                const evaluation = this.minimax(newBoard, depth + 1, true);
                
                if (evaluation.score < minEval.score) {
                    minEval = { score: evaluation.score, index: move };
                }
            }
            
            return minEval;
        }
    }
    
    // Evalúa el estado del tablero para Minimax
    evaluateBoard(board) {
        for (const condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }
    
    // Funciones auxiliares para IA
    getAvailableMoves() {
        return this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
    }
    
    getAvailableMovesArray(board) {
        return board
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
    }
    
    isBoardFullArray(board) {
        return board.every(cell => cell !== '');
    }
    
    findWinningMove(player) {
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = player;
                if (this.checkWinner() === player) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        return -1;
    }
    
    // ======================================
    // INTERFAZ DE USUARIO MEJORADA
    // ======================================
    
    updateUI() {
        this.updateBoard();
        this.updateTurnIndicator();
        this.updateModeButtons();
        this.updateDifficultyButtons();
        this.updateDifficultyVisibility();
    }
    
    updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const value = this.board[index];
            cell.textContent = value;
            cell.className = 'cell';
            cell.setAttribute('aria-label', `Celda ${index + 1} ${value ? 'con ' + value : 'vacía'}`);
            cell.tabIndex = 0;
            
            if (value) {
                cell.classList.add(value.toLowerCase());
                cell.classList.add('disabled');
                cell.setAttribute('aria-disabled', 'true');
            } else {
                cell.removeAttribute('aria-disabled');
            }
        });
    }
    
    updateCell(index, player) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        cell.classList.add('disabled');
        cell.setAttribute('aria-disabled', 'true');
        cell.setAttribute('aria-label', `Celda ${index + 1} con ${player}`);
    }
    
    addMoveAnimation(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.style.animation = 'none';
        cell.offsetHeight; // Forzar reflow
        cell.style.animation = null;
    }
    
    updateTurnIndicator() {
        const symbolElement = document.getElementById('current-symbol');
        const playerElement = document.getElementById('current-player');
        
        symbolElement.textContent = this.currentPlayer;
        symbolElement.className = `player-symbol ${this.currentPlayer.toLowerCase()}`;
        
        // Añadir efecto de pulse al cambiar turno
        symbolElement.style.animation = 'none';
        symbolElement.offsetHeight; // Forzar reflow
        symbolElement.style.animation = 'pulse 0.6s ease-out';
        
        if (this.gameMode === 'pvp') {
            playerElement.textContent = this.currentPlayer === 'X' ? 'Jugador 1' : 'Jugador 2';
        } else {
            playerElement.textContent = this.currentPlayer === 'X' ? 'Tu turno' : 'IA';
        }
        document.getElementById('turn-indicator').setAttribute('aria-live', 'polite');
    }
    
    showAIThinking() {
        document.getElementById('ai-thinking').style.display = 'flex';
        document.querySelector('.current-turn').style.display = 'none';
    }
    
    hideAIThinking() {
        document.getElementById('ai-thinking').style.display = 'none';
        document.querySelector('.current-turn').style.display = 'flex';
    }
    
    highlightWinningCells() {
        if (this.winningLine) {
            this.winningLine.forEach(index => {
                const cell = document.querySelector(`[data-index="${index}"]`);
                cell.classList.add('winning');
            });
        }
    }
    
    showWinningLine() {
        if (!this.winningLine) return;
        
        const line = document.getElementById('winning-line');
        const board = document.getElementById('game-board');
        const cells = document.querySelectorAll('.cell');
        
        const [start, , end] = this.winningLine;
        const startCell = cells[start];
        const endCell = cells[end];
        
        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();
        
        const startX = startRect.left + startRect.width / 2 - boardRect.left;
        const startY = startRect.top + startRect.height / 2 - boardRect.top;
        const endX = endRect.left + endRect.width / 2 - boardRect.left;
        const endY = endRect.top + endRect.height / 2 - boardRect.top;
        
        const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        
        line.style.width = `${length}px`;
        line.style.height = '4px';
        line.style.left = `${startX}px`;
        line.style.top = `${startY}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 50%';
        
        line.style.display = 'block';
        requestAnimationFrame(() => line.classList.add('show'));
    }

    // Recalcula la línea ganadora tras cambios de tamaño
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            if (this.winningLine) {
                const line = document.getElementById('winning-line');
                if (line) {
                    line.classList.remove('show');
                    // Forzar recálculo de posiciones
                    this.showWinningLine();
                }
            }
        }, 150);
    }
    
    showGameResult(result) {
        const modal = document.getElementById('game-result');
        const icon = document.getElementById('result-icon');
        const title = document.getElementById('result-title');
        const message = document.getElementById('result-message');
        
        if (result === 'draw') {
            icon.textContent = '🤝';
            title.textContent = '¡Empate!';
            message.textContent = 'Fue una partida muy reñida.';
        } else if (result === 'X') {
            if (this.gameMode === 'pvp') {
                icon.textContent = '🎉';
                title.textContent = '¡Jugador 1 Gana!';
                message.textContent = '¡Felicidades! X se lleva la victoria.';
            } else {
                icon.textContent = '🎉';
                title.textContent = '¡Ganaste!';
                message.textContent = '¡Excelente! Derrotaste a la IA.';
            }
        } else { // result === 'O'
            if (this.gameMode === 'pvp') {
                icon.textContent = '🎉';
                title.textContent = '¡Jugador 2 Gana!';
                message.textContent = '¡Felicidades! O se lleva la victoria.';
            } else {
                icon.textContent = '🤖';
                title.textContent = 'IA Gana';
                message.textContent = '¡Buena partida! La IA fue superior esta vez.';
            }
        }
        
        modal.style.display = 'flex';
        const content = modal.querySelector('.result-content');
        if (content) content.focus();
    }
    
    hideGameResult() {
        document.getElementById('game-result').style.display = 'none';
    }
    
    // ======================================
    // ESTADÍSTICAS
    // ======================================
    
    loadStats() {
        const savedStats = localStorage.getItem('ticTacToeStats');
        return savedStats ? JSON.parse(savedStats) : {
            gamesPlayed: 0,
            playerWins: 0,
            aiWins: 0,
            draws: 0
        };
    }
    
    saveStats() {
        localStorage.setItem('ticTacToeStats', JSON.stringify(this.stats));
    }
    
    updateStats(result) {
        this.stats.gamesPlayed++;
        
        if (result === 'draw') {
            this.stats.draws++;
        } else if (this.gameMode === 'pvc') {
            if (result === 'X') {
                this.stats.playerWins++;
            } else {
                this.stats.aiWins++;
            }
        }
        
        this.saveStats();
        this.displayStats();
    }
    
    displayStats() {
        document.getElementById('games-played').textContent = this.stats.gamesPlayed;
        document.getElementById('player-wins').textContent = this.stats.playerWins;
        document.getElementById('ai-wins').textContent = this.stats.aiWins;
        document.getElementById('draws').textContent = this.stats.draws;
    }

    // Preferencias
    loadPrefs() {
        const saved = localStorage.getItem('ticTacToePrefs');
        return saved ? JSON.parse(saved) : { sound: true, vibrate: true };
    }
    savePrefs() {
        localStorage.setItem('ticTacToePrefs', JSON.stringify(this.prefs));
    }
    togglePref(key, value) {
        this.prefs[key] = value;
        this.savePrefs();
    }
    applyPrefsUI() {
        const soundToggle = document.getElementById('sound-toggle');
        const vibrateToggle = document.getElementById('vibrate-toggle');
        if (soundToggle) soundToggle.checked = !!this.prefs.sound;
        if (vibrateToggle) vibrateToggle.checked = !!this.prefs.vibrate;
    }
    
    resetStats() {
        if (confirm('¿Estás seguro de que quieres reiniciar todas las estadísticas?')) {
            this.stats = {
                gamesPlayed: 0,
                playerWins: 0,
                aiWins: 0,
                draws: 0
            };
            this.saveStats();
            this.displayStats();
        }
    }
    
    showStatsModal() {
        document.getElementById('stats-modal').style.display = 'flex';
    }
    
    hideStatsModal() {
        document.getElementById('stats-modal').style.display = 'none';
    }
    
    // ======================================
    // CONTROL DEL JUEGO
    // ======================================
    
    resetGame(options = { preserveStartPlayer: false }) {
        this.board = Array(9).fill('');
        if (!options.preserveStartPlayer) this.currentPlayer = 'X';
        this.isGameActive = true;
        this.isAITurn = false;
        this.winningLine = null;
        this.moveHistory = [];
        
        this.updateBoard();
        this.updateTurnIndicator();
        this.hideAIThinking();
        this.hideGameResult();
        
        // Limpiar línea ganadora
        const line = document.getElementById('winning-line');
        line.classList.remove('show');
        line.style.display = 'none';
        
        // Remover clases de celdas ganadoras
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('winning', 'disabled');
        });

        // IA empieza si corresponde
        if (this.gameMode === 'pvc' && this.currentPlayer === 'O') {
            this.handleAITurn();
        }
    }

    undoMove() {
        if (!this.moveHistory.length) return;
        this.hideGameResult();
        const last = this.moveHistory.pop();
        if (last === undefined) return;
        this.board[last] = '';
        const cell = document.querySelector(`[data-index="${last}"]`);
        if (cell) {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'disabled', 'winning');
            cell.removeAttribute('aria-disabled');
            cell.setAttribute('aria-label', `Celda ${last + 1} vacía`);
        }
        this.isGameActive = true;
        // Si pvc y la IA jugó último, deshacer también su jugada anterior
        if (this.gameMode === 'pvc') {
            // Si tras quitar uno, el número de jugadas es impar, significa que X tiene más jugadas, por lo que quitamos una más (la de IA)
            if (this.moveHistory.length && this.currentPlayer === 'O') {
                const aiLast = this.moveHistory.pop();
                if (aiLast !== undefined) {
                    this.board[aiLast] = '';
                    const aiCell = document.querySelector(`[data-index="${aiLast}"]`);
                    if (aiCell) {
                        aiCell.textContent = '';
                        aiCell.classList.remove('x', 'o', 'disabled', 'winning');
                        aiCell.removeAttribute('aria-disabled');
                        aiCell.setAttribute('aria-label', `Celda ${aiLast + 1} vacía`);
                    }
                }
            }
        }
        // Quitar línea ganadora si estaba
        const lineEl = document.getElementById('winning-line');
        if (lineEl) { lineEl.classList.remove('show'); lineEl.style.display = 'none'; }
        // Recalcular turno
        this.currentPlayer = (this.moveHistory.length % 2 === 0) ? 'X' : 'O';
        this.updateTurnIndicator();
    }

    playFeedback() {
        if (this.prefs && this.prefs.vibrate && navigator.vibrate) {
            try { navigator.vibrate(10); } catch {}
        }
        if (this.prefs && this.prefs.sound) {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = 660;
                gain.gain.value = 0.0001;
                osc.connect(gain).connect(ctx.destination);
                const t = ctx.currentTime;
                gain.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
                osc.start(t);
                osc.stop(t + 0.15);
                setTimeout(() => ctx.close(), 250);
            } catch {}
        }
    }

    announceMove(index, player) {
        const boardEl = document.getElementById('game-board');
        if (boardEl) {
            boardEl.setAttribute('aria-live', 'polite');
            boardEl.setAttribute('aria-label', `Jugador ${player} marcó la celda ${index + 1}`);
        }
    }
}

// ======================================
// INICIALIZACIÓN DEL JUEGO
// ======================================

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});

// ======================================
// FUNCIONES DE UTILIDAD ADICIONALES
// ======================================

// Prevenir el comportamiento por defecto en algunos eventos
document.addEventListener('selectstart', (e) => {
    if (e.target.classList.contains('cell')) {
        e.preventDefault();
    }
});

// Añadir soporte para temas (opcional)
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function handleThemeChange(e) {
    // Aquí se podría implementar cambio de tema automático
    // si se desea soporte para modo oscuro
}

prefersDarkScheme.addListener(handleThemeChange);
