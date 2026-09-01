/**
 * core.js - 核心逻辑：网格操作、播放控制、统计
 */
(function (global) {
    'use strict';

    const { CONFIG, DOM } = global.AppConfig;
    const { RULES, computeNextGeneration, computeNeighborCounts } = global.AppRules;
    const { render } = global.AppRenderer;

    /**
     * 创建空网格
     */
    function createGrid() {
        CONFIG.cols = parseInt(DOM.colsInput.value);
        CONFIG.rows = parseInt(DOM.rowsInput.value);
        CONFIG.grid = new Array(CONFIG.rows);
        for (let r = 0; r < CONFIG.rows; r++) {
            CONFIG.grid[r] = new Array(CONFIG.cols).fill(0);
        }
        CONFIG.neighborCount = computeNeighborCounts(CONFIG.grid);
        CONFIG.generation = 0;
        CONFIG.aliveHistory = [];
        global.AppRenderer.resizeCanvas();
        updateStats();
    }

    /**
     * 随机填充网格
     */
    function randomize() {
        for (let r = 0; r < CONFIG.rows; r++) {
            for (let c = 0; c < CONFIG.cols; c++) {
                CONFIG.grid[r][c] = Math.random() < 0.3 ? 1 : 0;
            }
        }
        CONFIG.neighborCount = computeNeighborCounts(CONFIG.grid);
        CONFIG.aliveHistory = [];
    }

    /**
     * 清空网格
     */
    function clearGrid() {
        for (let r = 0; r < CONFIG.rows; r++) {
            for (let c = 0; c < CONFIG.cols; c++) {
                CONFIG.grid[r][c] = 0;
            }
        }
        CONFIG.neighborCount = computeNeighborCounts(CONFIG.grid);
        CONFIG.aliveHistory = [];
    }

    /**
     * 将预设图案放入网格
     */
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
        CONFIG.neighborCount = computeNeighborCounts(CONFIG.grid);
    }

    /**
     * 统计活细胞数并更新 UI，返回活细胞数
     */
    function updateStats() {
        let count = 0;
        for (let r = 0; r < CONFIG.rows; r++) {
            for (let c = 0; c < CONFIG.cols; c++) {
                if (CONFIG.grid[r][c] === 1) count++;
            }
        }
        DOM.generationEl.textContent = CONFIG.generation;
        DOM.aliveCountEl.textContent = count;
        DOM.avgRecentEl.textContent = calcAvgRecent(CONFIG.aliveHistory);
        DOM.avgAllEl.textContent = calcAvgAll(CONFIG.aliveHistory);
        return count;
    }

    /** 最近 50 代平均（不足 50 代则取全部） */
    function calcAvgRecent(history) {
        if (history.length === 0) return '—';
        const recent = history.slice(-50);
        const sum = recent.reduce((a, b) => a + b, 0);
        return (sum / recent.length).toFixed(1);
    }

    /** 整体平均 */
    function calcAvgAll(history) {
        if (history.length === 0) return '—';
        const sum = history.reduce((a, b) => a + b, 0);
        return (sum / history.length).toFixed(1);
    }

    /**
     * 更新规则描述文本
     */
    function updateRuleDesc() {
        const rule = RULES[DOM.ruleSelect.value];
        DOM.ruleDesc.textContent = rule.desc;
    }

    /**
     * 步进一次
     */
    function step() {
        const rule = RULES[CONFIG.rule];
        CONFIG.grid = computeNextGeneration(CONFIG.grid, rule);
        CONFIG.neighborCount = computeNeighborCounts(CONFIG.grid);
        CONFIG.generation++;
        const count = updateStats();
        CONFIG.aliveHistory.push(count);
    }

    /**
     * 开始播放
     */
    function play() {
        CONFIG.isPlaying = true;
    }

    /**
     * 暂停
     */
    function pause() {
        CONFIG.isPlaying = false;
    }

    /**
     * 游戏循环（在 main.js 中通过 requestAnimationFrame 启动）
     */
    function loop(timestamp) {
        if (CONFIG.isPlaying && timestamp - CONFIG.lastUpdate >= CONFIG.speed) {
            step();
            CONFIG.lastUpdate = timestamp;
        }
        render();
        requestAnimationFrame(loop);
    }

    /**
     * 检查网格中是否有活细胞
     */
    function hasAliveCells() {
        for (let r = 0; r < CONFIG.rows; r++) {
            if (CONFIG.grid[r].some(v => v === 1)) return true;
        }
        return false;
    }

    global.AppCore = {
        createGrid, randomize, clearGrid, placePattern,
        updateStats, updateRuleDesc,
        step, play, pause, loop, hasAliveCells,
    };
})(window);
