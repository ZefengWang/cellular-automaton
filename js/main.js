/**
 * main.js - 应用入口
 * 初始化并启动
 */
(function (global) {
    'use strict';

    function init() {
        const { initDOM } = global.AppConfig;
        const { createGrid, updateRuleDesc, updateStats, loop } = global.AppCore;
        const { resizeCanvas, render } = global.AppRenderer;
        const { setupEventListeners } = global.AppUI;

        initDOM();
        createGrid();
        updateRuleDesc();
        setupEventListeners();
        updateStats();
        render();
        requestAnimationFrame(loop);
    }

    // 等待 DOM 就绪
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
