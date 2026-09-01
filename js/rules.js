/**
 * rules.js - 元胞自动机规则定义与计算
 * 支持 B/S 记法规则和 Wolfram 一维规则
 */
(function (global) {
    'use strict';

    // 规则定义：B/S 记法（出生/存活）
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
        maze: {
            name: 'Maze',
            desc: '迷宫规则。活细胞邻居 1~5 个存活，死细胞恰好 3 个邻居出生。会生长出蜿蜒的迷宫结构。',
            survive: [1, 2, 3, 4, 5],
            birth: [3],
        },
        assimilation: {
            name: 'Assimilation',
            desc: '同化规则。出生条件较宽松（3~5 邻居），存活条件也宽松（4~7 邻居），活细胞会不断扩张并填充空间。',
            survive: [4, 5, 6, 7],
            birth: [3, 4, 5],
        },
        replicator: {
            name: 'Replicator',
            desc: '复制规则。奇偶邻居同时满足出生和存活，任何初始图案都会不断复制自身。',
            survive: [1, 3, 5, 7],
            birth: [1, 3, 5, 7],
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

    /**
     * 统计环形边界下的邻居数量（单个细胞）
     */
    function countNeighbors(grid, r, c, rows, cols) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = (r + dr + rows) % rows;
                const nc = (c + dc + cols) % cols;
                count += grid[nr][nc];
            }
        }
        return count;
    }

    /**
     * 计算整个网格每个位置的邻居数量
     * 返回一个同样大小的二维数组，值为 0~8
     */
    function computeNeighborCounts(grid) {
        const rows = grid.length;
        const cols = grid[0].length;
        const counts = new Array(rows);
        for (let r = 0; r < rows; r++) {
            counts[r] = new Array(cols);
            for (let c = 0; c < cols; c++) {
                counts[r][c] = countNeighbors(grid, r, c, rows, cols);
            }
        }
        return counts;
    }

    /**
     * Wolfram 一维元胞自动机（滚动窗口模式）
     */
    function computeWolframRow(grid, rule, rows, cols) {
        const ruleBits = rule.ruleNumber.toString(2).padStart(8, '0').split('').reverse();
        const next = new Array(rows);
        for (let r = 0; r < rows; r++) {
            next[r] = new Array(cols).fill(0);
        }

        // 检查是否已有任何活细胞
        let hasAlive = false;
        for (let r = 0; r < rows; r++) {
            if (grid[r].some(v => v === 1)) { hasAlive = true; break; }
        }
        if (!hasAlive) return next;

        // 滚动窗口：向上移动一行
        for (let r = 0; r < rows - 1; r++) {
            for (let c = 0; c < cols; c++) {
                next[r][c] = grid[r + 1][c];
            }
        }

        // 计算新的最后一行
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

    /**
     * 根据规则计算下一代
     */
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

    global.AppRules = { RULES, computeNextGeneration, computeNeighborCounts };
})(window);
