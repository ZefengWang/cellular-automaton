/**
 * painter.js - 画布上的交互绘制（鼠标/触屏）
 */
(function (global) {
    'use strict';

    const { CONFIG, DOM } = global.AppConfig;

    /**
     * 将事件坐标转换为网格坐标
     */
    function getCellFromEvent(e) {
        const rect = DOM.canvas.getBoundingClientRect();
        const scaleX = DOM.canvas.width / rect.width;
        const scaleY = DOM.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const c = Math.floor(x / CONFIG.cellSize);
        const r = Math.floor(y / CONFIG.cellSize);
        return {
            r: Math.max(0, Math.min(CONFIG.rows - 1, r)),
            c: Math.max(0, Math.min(CONFIG.cols - 1, c)),
        };
    }

    /**
     * 触屏事件坐标适配
     */
    function getTouchPos(e) {
        const rect = DOM.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return {
            clientX: touch.clientX,
            clientY: touch.clientY,
            getBoundingClientRect: () => rect,
        };
    }

    function startDrawing(e) {
        CONFIG.isDrawing = true;
        const pos = getCellFromEvent(e);
        CONFIG.drawValue = CONFIG.grid[pos.r][pos.c] === 1 ? 0 : 1;
        CONFIG.grid[pos.r][pos.c] = CONFIG.drawValue;
        global.AppCore.updateStats();
    }

    function draw(e) {
        if (!CONFIG.isDrawing) return;
        const pos = getCellFromEvent(e);
        CONFIG.grid[pos.r][pos.c] = CONFIG.drawValue;
        global.AppCore.updateStats();
    }

    function stopDrawing() {
        if (!CONFIG.isDrawing) return;
        CONFIG.isDrawing = false;
        // 拖拽结束后统一重算邻居数，避免每帧都全量计算
        CONFIG.neighborCount = global.AppRules.computeNeighborCounts(CONFIG.grid);
    }

    global.AppPainter = { startDrawing, draw, stopDrawing, getTouchPos };
})(window);
