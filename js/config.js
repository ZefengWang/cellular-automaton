/**
 * config.js - 全局配置与 DOM 引用
 * 所有模块共享的状态和 DOM 元素
 */
(function (global) {
    'use strict';

    // 运行时状态
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

    // DOM 元素引用
    const DOM = {
        canvas: null,
        ctx: null,
        colsInput: null,
        rowsInput: null,
        applySizeBtn: null,
        ruleSelect: null,
        ruleDesc: null,
        playBtn: null,
        pauseBtn: null,
        stepBtn: null,
        randomBtn: null,
        clearBtn: null,
        gliderBtn: null,
        pulsarBtn: null,
        gosperBtn: null,
        speedRange: null,
        speedValue: null,
        aliveColorInput: null,
        deadColorInput: null,
        gridColorInput: null,
        showGridCheckbox: null,
        rainbowModeCheckbox: null,
        generationEl: null,
        aliveCountEl: null,
    };

    function initDOM() {
        DOM.canvas = document.getElementById('automatonCanvas');
        DOM.ctx = DOM.canvas.getContext('2d');
        DOM.colsInput = document.getElementById('cols');
        DOM.rowsInput = document.getElementById('rows');
        DOM.applySizeBtn = document.getElementById('applySize');
        DOM.ruleSelect = document.getElementById('ruleSelect');
        DOM.ruleDesc = document.getElementById('ruleDesc');
        DOM.playBtn = document.getElementById('playBtn');
        DOM.pauseBtn = document.getElementById('pauseBtn');
        DOM.stepBtn = document.getElementById('stepBtn');
        DOM.randomBtn = document.getElementById('randomBtn');
        DOM.clearBtn = document.getElementById('clearBtn');
        DOM.gliderBtn = document.getElementById('gliderBtn');
        DOM.pulsarBtn = document.getElementById('pulsarBtn');
        DOM.gosperBtn = document.getElementById('gosperBtn');
        DOM.speedRange = document.getElementById('speedRange');
        DOM.speedValue = document.getElementById('speedValue');
        DOM.aliveColorInput = document.getElementById('aliveColor');
        DOM.deadColorInput = document.getElementById('deadColor');
        DOM.gridColorInput = document.getElementById('gridColor');
        DOM.showGridCheckbox = document.getElementById('showGrid');
        DOM.rainbowModeCheckbox = document.getElementById('rainbowMode');
        DOM.generationEl = document.getElementById('generation');
        DOM.aliveCountEl = document.getElementById('aliveCount');
    }

    global.AppConfig = { CONFIG, DOM, initDOM };
})(window);
