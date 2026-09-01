/**
 * ui.js - 控制面板事件绑定
 * 将 UI 控件的交互连接到核心逻辑
 */
(function (global) {
    'use strict';

    const { CONFIG, DOM } = global.AppConfig;
    const { PATTERNS } = global.AppPatterns;
    const { RULES } = global.AppRules;
    const { play, pause, step, createGrid, randomize, clearGrid,
            placePattern, updateStats, updateRuleDesc, hasAliveCells } = global.AppCore;
    const { resizeCanvas, render } = global.AppRenderer;
    const { startDrawing, draw, stopDrawing, getTouchPos } = global.AppPainter;

    /**
     * 绑定所有控制面板事件
     */
    function setupEventListeners() {
        // —— 画布尺寸 ——
        DOM.applySizeBtn.addEventListener('click', () => {
            pause();
            createGrid();
            CONFIG.generation = 0;
            updateStats();
        });

        // —— 规则切换 ——
        DOM.ruleSelect.addEventListener('change', (e) => {
            CONFIG.rule = e.target.value;
            updateRuleDesc();
            CONFIG.generation = 0;
            CONFIG.aliveHistory = [];

            // Wolfram 规则：空网格时在第一行中心生成种子
            if (CONFIG.rule.startsWith('wolfram') && !hasAliveCells()) {
                CONFIG.grid[0][Math.floor(CONFIG.cols / 2)] = 1;
                CONFIG.neighborCount = global.AppRules.computeNeighborCounts(CONFIG.grid);
            }
            updateStats();
        });

        // —— 播放控制 ——
        DOM.playBtn.addEventListener('click', play);
        DOM.pauseBtn.addEventListener('click', pause);
        DOM.stepBtn.addEventListener('click', () => {
            pause();
            step();
        });

        // —— 网格操作 ——
        DOM.randomBtn.addEventListener('click', () => {
            pause();
            randomize();
            CONFIG.generation = 0;
            updateStats();
        });

        DOM.clearBtn.addEventListener('click', () => {
            pause();
            clearGrid();
            CONFIG.generation = 0;
            updateStats();
        });

        // —— 预设图案 ——
        DOM.gliderBtn.addEventListener('click', () => {
            pause();
            clearGrid();
            placePattern(PATTERNS.glider, 5, 5);
            CONFIG.generation = 0;
            updateStats();
        });

        DOM.pulsarBtn.addEventListener('click', () => {
            pause();
            clearGrid();
            placePattern(PATTERNS.pulsar,
                Math.floor(CONFIG.cols / 2) - 6,
                Math.floor(CONFIG.rows / 2) - 6
            );
            CONFIG.generation = 0;
            updateStats();
        });

        DOM.gosperBtn.addEventListener('click', () => {
            pause();
            clearGrid();
            placePattern(PATTERNS.gosperGun, 2, Math.floor(CONFIG.rows / 2) - 2);
            CONFIG.generation = 0;
            updateStats();
        });

        // —— 速度滑块 ——
        DOM.speedRange.addEventListener('input', (e) => {
            CONFIG.speed = parseInt(e.target.value);
            DOM.speedValue.textContent = CONFIG.speed;
        });

        // —— 颜色设置 ——
        DOM.aliveColorInput.addEventListener('input', (e) => {
            CONFIG.aliveColor = e.target.value;
        });
        DOM.deadColorInput.addEventListener('input', (e) => {
            CONFIG.deadColor = e.target.value;
        });
        DOM.gridColorInput.addEventListener('input', (e) => {
            CONFIG.gridColor = e.target.value;
        });
        DOM.showGridCheckbox.addEventListener('change', (e) => {
            CONFIG.showGrid = e.target.checked;
        });
        DOM.rainbowModeCheckbox.addEventListener('change', (e) => {
            CONFIG.rainbowMode = e.target.checked;
        });

        // —— 画布绘制（鼠标）——
        DOM.canvas.addEventListener('mousedown', startDrawing);
        DOM.canvas.addEventListener('mousemove', draw);
        DOM.canvas.addEventListener('mouseup', stopDrawing);
        DOM.canvas.addEventListener('mouseleave', stopDrawing);

        // —— 画布绘制（触屏）——
        DOM.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDrawing(getTouchPos(e));
        });
        DOM.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            draw(getTouchPos(e));
        });
        DOM.canvas.addEventListener('touchend', stopDrawing);

        // —— 窗口 resize ——
        window.addEventListener('resize', () => {
            resizeCanvas();
            render();
        });
    }

    global.AppUI = { setupEventListeners };
})(window);
