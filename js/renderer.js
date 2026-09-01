/**
 * renderer.js - Canvas 渲染
 * 负责细胞绘制、网格线、画布尺寸调整
 */
(function (global) {
    'use strict';

    const { CONFIG, DOM } = global.AppConfig;

    /**
     * 动态计算 cellSize 并调整画布尺寸
     */
    function resizeCanvas() {
        const maxWidth = Math.min(window.innerWidth - 380, 1200);
        const maxHeight = window.innerHeight - 280;

        const sizeByWidth = Math.floor(maxWidth / CONFIG.cols);
        const sizeByHeight = Math.floor(maxHeight / CONFIG.rows);
        CONFIG.cellSize = Math.max(4, Math.min(20, sizeByWidth, sizeByHeight));

        DOM.canvas.width = CONFIG.cols * CONFIG.cellSize;
        DOM.canvas.height = CONFIG.rows * CONFIG.cellSize;
    }

    /**
     * 主渲染函数
     */
    function render() {
        const ctx = DOM.ctx;
        const { cols, rows, cellSize, grid, aliveColor, deadColor, gridColor, showGrid, rainbowMode, generation } = CONFIG;

        // 清空画布
        ctx.fillStyle = deadColor;
        ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);

        // 绘制细胞
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 1) {
                    if (rainbowMode) {
                        const hue = (r * cols + c + generation * 10) % 360;
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

    global.AppRenderer = { resizeCanvas, render };
})(window);
