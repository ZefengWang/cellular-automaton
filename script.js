// ========================================================
// 元胞自动机可视化 - 核心逻辑
// ========================================================

(() => {
    'use strict';

    // ========== 配置 ==========
    const CONFIG = {
        cellSize: 12,
        grid: null,          // 二维数组存储细胞状态
        cols: 60,
        rows: 40,
        generation: 0,
        isPlaying: false,
        animationId: null,
        speed: 100,          // 毫秒
        lastUpdate: 0,
        rule: 'gameoflife',
        // 颜色设置
        aliveColor: '#00d4aa',
        deadColor: '#1a1a2e',
        gridColor: '#2a2a4a',
        showGrid: true,
        rainbowMode: false,
        // 交互状态
        isDrawing: false,
        drawValue: 1,
    };

    // ========== 规则定义 ==========
    // 每个规则定义: 存活条件(survive) 和 出生条件(birth)
    // 基于邻居数量(0-8)
    const RULES = {
        gameoflife: {
            name: "Conway's Game of Life",
            desc: '经典生命游戏。活细胞周围有 2 或 3 个活邻居存活，死细胞恰好有 3 个活邻居复活。',
            survive: [2, 3],
            birth: [3],
        },
        seeds: {
            name: 'Seeds',
            desc: '种子规则。只有恰好 2 个活邻居的死细胞会出生，活细胞在下一代全部死亡。',
            survive: [],
            birth: [2],
        },
        highlife: {
            name: 'HighLife',
            desc: '类似生命游戏，但死细胞有 3 或 6 个活邻居时出生。',
            survive: [2, 3],
            birth: [3, 6],
        },
        '2x2': {
            name: '2×2',
            desc: '活细胞有 1、2、5 个邻居存活；死细胞有 3、6 个邻居出生。',
            survive: [1, 2, 5],
            birth: [3, 6],
        },
        daynight: {
            name: 'Day & Night',
            desc: '对称规则。活细胞有 3、4、7、8 个邻居存活；死细胞有 3、6、7、8 个邻居出生。',
            survive: [3, 4, 7, 8],
            birth: [3, 6, 7, 8],
        },
        wolfram30: {
            name: 'Wolfram Rule 30',
            desc: '一维元胞自动机。Rule 30 能产生混沌图案，左邻居为1时：010→1, 011→1, 100→1, 101→1。',
            type: 'wolfram',
            ruleNumber: 30,
        },
        wolfram110: {
            name: 'Wolfram Rule 110',
            desc: '一维元胞自动机。Rule 110 可以模拟图灵机，具有类生命周期的行为。',
            type: 'wolfram',
            ruleNumber: 110,
        },
    };

    // ========== DOM 元素 ==========
    const canvas = document.getElementById('automatonCanvas');
    const ctx = canvas.getContext('2d');
    const colsInput = document.getElementById('cols');
    const rowsInput = document.getElementById('rows');
    const applySizeBtn = document.getElementById('applySize');
    const ruleSelect = document.getElementById('ruleSelect');
    const ruleDesc = document.getElementById('ruleDesc');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stepBtn = document.getElementById('stepBtn');
    const randomBtn = document.getElementById('randomBtn');
    const clearBtn = document.getElementById('clearBtn');
    const gliderBtn = document.getElementById('gliderBtn');
    const pulsarBtn = document.getElementById('pulsarBtn');
    const gosperBtn = document.getElementById('gosperBtn');
    const speedRange = document.getElementById('speedRange');
    const speedValue = document.getElementById('speedValue');
    const aliveColorInput = document.getElementById('aliveColor');
    const deadColorInput = document.getElementById('deadColor');
    const gridColorInput = document.getElementById('gridColor');
    const showGridCheckbox = document.getElementById('showGrid');
    const rainbowModeCheckbox = document.getElementById('rainbowMode');
    const generationEl = document.getElementById('generation');
    const aliveCountEl = document.getElementById('aliveCount');

    // ========== 初始化 ==========
    function init() {
        createGrid();
        updateRuleDesc();
        setupEventListeners();
        updateStats();
        render();
        requestAnimationFrame(loop);
    }

    function createGrid() {
        CONFIG.cols = parseInt(colsInput.value);
        CONFIG.rows = parseInt(rowsInput.value);
        CONFIG.grid = new Array(CONFIG.rows);
        for (let r = 0; r < CONFIG.rows; r++) {
            CONFIG.grid[r] = new Array(CONFIG.cols).fill(0);
        }
        CONFIG.generation = 0;
        resizeCanvas();
        updateStats();
    }

    function resizeCanvas() {
        const maxWidth = Math.min(window.innerWidth - 380, 1200);
        const maxHeight = window.innerHeight - 280;

        // 根据可用空间动态计算 cellSize
        const sizeByWidth = Math.floor(maxWidth / CONFIG.cols);
        const sizeByHeight = Math.floor(maxHeight / CONFIG.rows);
        CONFIG.cellSize = Math.max(4, Math.min(20, sizeByWidth, sizeByHeight));

        canvas.width = CONFIG.cols * CONFIG.cellSize;
        canvas.height = CONFIG.rows * CONFIG.cellSize;
    }

    // ========== 渲染 ==========
    function render() {
        const { cols, rows, cellSize, grid, aliveColor, deadColor, gridColor, showGrid, rainbowMode } = CONFIG;

        // 清空画布
        ctx.fillStyle = deadColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制细胞
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 1) {
                    if (rainbowMode) {
                        const hue = (r * cols + c + CONFIG.generation * 10) % 360;
                        ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
                    } else {
                        ctx.fillStyle = aliveColor;
                    }
                    ctx.fillRect(
                        c * cellSize,
                        r * cellSize,
                        cellSize - (showGrid ? 1 : 0),
                        cellSize - (showGrid ? 1 : 0)
                    );
                }
            }
        }

        // 绘制网格线
        if (showGrid && cellSize >= 6) {
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            for (let c = 0; c <= cols; c++) {
                ctx.moveTo(c * cellSize, 0);
                ctx.lineTo(c * cellSize, rows * cellSize);
            }
            for (let r = 0; r <= rows; r++) {
                ctx.moveTo(0, r * cellSize);
                ctx.lineTo(cols * cellSize, r * cellSize);
            }
            ctx.stroke();
        }
    }

    // ========== 游戏循环 ==========
    function loop(timestamp) {
        if (CONFIG.isPlaying && timestamp - CONFIG.lastUpdate >= CONFIG.speed) {
            step();
            CONFIG.lastUpdate = timestamp;
        }
        render();
        requestAnimationFrame(loop);
    }

    // ========== 步进逻辑 ==========
    function step() {
        const rule = RULES[CONFIG.rule];
        CONFIG.grid = computeNextGeneration(CONFIG.grid, rule);
        CONFIG.generation++;
        updateStats();
    }

    function computeNextGeneration(grid, rule) {
        const rows = grid.length;
        const cols = grid[0].length;
        const next = new Array(rows);
        for (let r = 0; r < rows; r++) {
            next[r] = new Array(cols).fill(0);
        }

        if (rule.type === 'wolfram') {
            return computeWolframRow(grid, rule, rows, cols);
        }

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const neighbors = countNeighbors(grid, r, c, rows, cols);
                const alive = grid[r][c] === 1;

                if (alive && rule.survive.includes(neighbors)) {
                    next[r][c] = 1;
                } else if (!alive && rule.birth.includes(neighbors)) {
                    next[r][c] = 1;
                }
            }
        }

        return next;
    }

    function countNeighbors(grid, r, c, rows, cols) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                // 环形边界
                const nr = (r + dr + rows) % rows;
                const nc = (c + dc + cols) % cols;
                count += grid[nr][nc];
            }
        }
        return count;
    }

    // Wolfram 一维元胞自动机 - 滚动窗口模式
    function computeWolframRow(grid, rule, rows, cols) {
        const ruleBits = rule.ruleNumber.toString(2).padStart(8, '0').split('').reverse();
        const next = new Array(rows);

        // 初始化 next 数组
        for (let r = 0; r < rows; r++) {
            next[r] = new Array(cols).fill(0);
        }

        // 检查是否已有任何活细胞
        let hasAlive = false;
        for (let r = 0; r < rows; r++) {
            if (grid[r].some(v => v === 1)) {
                hasAlive = true;
                break;
            }
        }

        if (!hasAlive) {
            return next;
        }

        // 滚动窗口：将整个网格向上移动一行
        // next[r] = grid[r+1]，最后一行用规则计算
        for (let r = 0; r < rows - 1; r++) {
            for (let c = 0; c < cols; c++) {
                next[r][c] = grid[r + 1][c];
            }
        }

        // 用规则计算新的最后一行（基于原网格最后一行）
        const lastRow = grid[rows - 1];
        for (let c = 0; c < cols; c++) {
            const left = lastRow[(c - 1 + cols) % cols];
            const center = lastRow[c];
            const right = lastRow[(c + 1) % cols];
            const pattern = left * 4 + center * 2 + right;
            next[rows - 1][c] = parseInt(ruleBits[pattern]);
        }

        return next;
    }

    // ========== 统计更新 ==========
    function updateStats() {
        let count = 0;
        for (let r = 0; r < CONFIG.rows; r++) {
            for (let c = 0; c < CONFIG.cols; c++) {
                if (CONFIG.grid[r][c] === 1) count++;
            }
        }
        generationEl.textContent = CONFIG.generation;
        aliveCountEl.textContent = count;
    }

    // ========== 事件监听 ==========
    function setupEventListeners() {
        applySizeBtn.addEventListener('click', () => {
            pause();
            createGrid();
            CONFIG.generation = 0;
            updateStats();
        });

        ruleSelect.addEventListener('change', (e) => {
            CONFIG.rule = e.target.value;
            updateRuleDesc();
            CONFIG.generation = 0;

            // Wolfram 规则：如果网格为空，在第一行中心生成种子
            if (CONFIG.rule.startsWith('wolfram')) {
                let hasAlive = false;
                for (let r = 0; r < CONFIG.rows; r++) {
                    if (CONFIG.grid[r].some(v => v === 1)) { hasAlive = true; break; }
                }
                if (!hasAlive) {
                    CONFIG.grid[0][Math.floor(CONFIG.cols / 2)] = 1;
                }
            }
        });

        playBtn.addEventListener('click', play);
        pauseBtn.addEventListener('click', pause);
        stepBtn.addEventListener('click', () => {
            pause();
            step();
        });

        randomBtn.addEventListener('click', () => {
            pause();
            randomize();
            CONFIG.generation = 0;
            updateStats();
        });

        clearBtn.addEventListener('click', () => {
            pause();
            clearGrid();
            CONFIG.generation = 0;
            updateStats();
        });

        gliderBtn.addEventListener('click', () => {
            pause();
            clearGrid();
            placePattern(PATTERNS.glider, 5, 5);
            CONFIG.generation = 0;
            updateStats();
        });

        pulsarBtn.addEventListener('click', () => {
            pause();
            clearGrid();
            placePattern(PATTERNS.pulsar,
                Math.floor(CONFIG.cols / 2) - 6,
                Math.floor(CONFIG.rows / 2) - 6
            );
            CONFIG.generation = 0;
            updateStats();
        });

        gosperBtn.addEventListener('click', () => {
            pause();
            clearGrid();
            placePattern(PATTERNS.gosperGun, 2, Math.floor(CONFIG.rows / 2) - 2);
            CONFIG.generation = 0;
            updateStats();
        });

        speedRange.addEventListener('input', (e) => {
            CONFIG.speed = parseInt(e.target.value);
            speedValue.textContent = CONFIG.speed;
        });

        aliveColorInput.addEventListener('input', (e) => {
            CONFIG.aliveColor = e.target.value;
        });

        deadColorInput.addEventListener('input', (e) => {
            CONFIG.deadColor = e.target.value;
        });

        gridColorInput.addEventListener('input', (e) => {
            CONFIG.gridColor = e.target.value;
        });

        showGridCheckbox.addEventListener('change', (e) => {
            CONFIG.showGrid = e.target.checked;
        });

        rainbowModeCheckbox.addEventListener('change', (e) => {
            CONFIG.rainbowMode = e.target.checked;
        });

        // 鼠标绘制
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);

        // 触屏绘制
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDrawing(getTouchPos(e));
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            draw(getTouchPos(e));
        });
        canvas.addEventListener('touchend', stopDrawing);

        window.addEventListener('resize', () => {
            resizeCanvas();
            render();
        });
    }

    function getTouchPos(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return {
            clientX: touch.clientX,
            clientY: touch.clientY,
            getBoundingClientRect: () => rect
        };
    }

    function startDrawing(e) {
        CONFIG.isDrawing = true;
        const pos = getCellFromEvent(e);
        CONFIG.drawValue = CONFIG.grid[pos.r][pos.c] === 1 ? 0 : 1;
        CONFIG.grid[pos.r][pos.c] = CONFIG.drawValue;
        updateStats();
    }

    function draw(e) {
        if (!CONFIG.isDrawing) return;
        const pos = getCellFromEvent(e);
        CONFIG.grid[pos.r][pos.c] = CONFIG.drawValue;
        updateStats();
    }

    function stopDrawing() {
        CONFIG.isDrawing = false;
    }

    function getCellFromEvent(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const c = Math.floor(x / CONFIG.cellSize);
        const r = Math.floor(y / CONFIG.cellSize);
        return {
            r: Math.max(0, Math.min(CONFIG.rows - 1, r)),
            c: Math.max(0, Math.min(CONFIG.cols - 1, c)),
        };
    }

    // ========== 播放控制 ==========
    function play() {
        CONFIG.isPlaying = true;
    }

    function pause() {
        CONFIG.isPlaying = false;
    }

    // ========== 网格操作 ==========
    function randomize() {
        for (let r = 0; r < CONFIG.rows; r++) {
            for (let c = 0; c < CONFIG.cols; c++) {
                CONFIG.grid[r][c] = Math.random() < 0.3 ? 1 : 0;
            }
        }
    }

    function clearGrid() {
        for (let r = 0; r < CONFIG.rows; r++) {
            for (let c = 0; c < CONFIG.cols; c++) {
                CONFIG.grid[r][c] = 0;
            }
        }
    }

    function placePattern(pattern, startCol, startRow) {
        for (let r = 0; r < pattern.length; r++) {
            for (let c = 0; c < pattern[r].length; c++) {
                const gridR = startRow + r;
                const gridC = startCol + c;
                if (gridR >= 0 && gridR < CONFIG.rows && gridC >= 0 && gridC < CONFIG.cols) {
                    CONFIG.grid[gridR][gridC] = pattern[r][c];
                }
            }
        }
    }

    function updateRuleDesc() {
        const rule = RULES[ruleSelect.value];
        ruleDesc.textContent = rule.desc;
    }

    // ========== 预设图案 ==========
    const PATTERNS = {
        glider: [
            [0, 1, 0],
            [0, 0, 1],
            [1, 1, 1],
        ],
        pulsar: [
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
        ],
        gosperGun: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    };

    // ========== 启动 ==========
    init();
})();
