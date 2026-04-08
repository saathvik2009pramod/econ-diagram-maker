// --- DOM Elements ---
const splashScreen = document.getElementById('splash-screen');
const editorScreen = document.getElementById('editor-screen');
const graphContainer = document.getElementById('graph-container');

// Controls
const demandControls = document.getElementById('demand-controls');
const supplyControls = document.getElementById('supply-controls');
const dCountEl = document.getElementById('d-count');
const sCountEl = document.getElementById('s-count');
const showShading = document.getElementById('showShading');

// --- SVG Configurations ---
const width = 600;
const height = 500;
const padding = 70;

// Base Line Equations: Y increases downwards in SVG
const D_BASE = { m: 0.8, c: 80 };   // Base Demand
const S_BASE = { m: -0.8, c: 450 }; // Base Supply

// --- Application State ---
let state = {
    diagramType: 'supply-demand',
    demandCurves: [{ id: 1, shift: 0 }],
    supplyCurves: [{ id: 1, shift: 0 }]
};

// --- Initialization & UI Logic ---
function init() {
    // Diagram Selection
    document.querySelectorAll('.diagram-card').forEach(card => {
        card.addEventListener('click', (e) => {
            document.querySelectorAll('.diagram-card').forEach(c => c.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            state.diagramType = target.dataset.type;
        });
    });

    document.getElementById('start-btn').addEventListener('click', () => {
        splashScreen.classList.add('hidden');
        editorScreen.classList.remove('hidden');
        renderUI();
        updateGraph();
    });

    document.getElementById('back-btn').addEventListener('click', () => {
        editorScreen.classList.add('hidden');
        splashScreen.classList.remove('hidden');
    });

    document.getElementById('export-btn').addEventListener('click', exportSVG);
    document.getElementById('add-demand-btn').addEventListener('click', () => addCurve('demand'));
    document.getElementById('add-supply-btn').addEventListener('click', () => addCurve('supply'));
    showShading.addEventListener('change', updateGraph);
}

// --- Curve Management ---
function addCurve(type) {
    const list = type === 'demand' ? state.demandCurves : state.supplyCurves;
    if (list.length >= 3) return;
    
    // Default shift for new curve is +40 or -40 depending on type to make it visible immediately
    const defaultShift = list.length * 40; 
    list.push({ id: Date.now(), shift: defaultShift });
    
    renderUI();
    updateGraph();
}

function removeCurve(type, id) {
    if (type === 'demand') {
        state.demandCurves = state.demandCurves.filter(c => c.id !== id);
    } else {
        state.supplyCurves = state.supplyCurves.filter(c => c.id !== id);
    }
    renderUI();
    updateGraph();
}

function renderUI() {
    // Update Counters and Button States
    dCountEl.innerText = state.demandCurves.length;
    sCountEl.innerText = state.supplyCurves.length;
    document.getElementById('add-demand-btn').disabled = state.demandCurves.length >= 3;
    document.getElementById('add-supply-btn').disabled = state.supplyCurves.length >= 3;

    // Render Demand Controls
    demandControls.innerHTML = state.demandCurves.map((curve, index) => `
        <div class="slider-group d-slider">
            <div class="slider-header">
                <span>Demand (D${index + 1}) Shift: <span id="val-d-${curve.id}">${curve.shift}</span></span>
                ${index > 0 ? `<button class="delete-curve" onclick="removeCurve('demand', ${curve.id})">Remove</button>` : ''}
            </div>
            <input type="range" min="-150" max="150" value="${curve.shift}" 
                oninput="handleSliderChange('demand', ${curve.id}, this.value)">
        </div>
    `).join('');

    // Render Supply Controls
    supplyControls.innerHTML = state.supplyCurves.map((curve, index) => `
        <div class="slider-group s-slider">
            <div class="slider-header">
                <span>Supply (S${index + 1}) Shift: <span id="val-s-${curve.id}">${curve.shift}</span></span>
                ${index > 0 ? `<button class="delete-curve" onclick="removeCurve('supply', ${curve.id})">Remove</button>` : ''}
            </div>
            <input type="range" min="-150" max="150" value="${curve.shift}" 
                oninput="handleSliderChange('supply', ${curve.id}, this.value)">
        </div>
    `).join('');
}

// Attach this to window so inline handlers work
window.handleSliderChange = function(type, id, val) {
    const value = parseInt(val);
    document.getElementById(`val-${type.charAt(0)}-${id}`).innerText = value;
    
    if (type === 'demand') {
        const curve = state.demandCurves.find(c => c.id === id);
        if (curve) curve.shift = value;
    } else {
        const curve = state.supplyCurves.find(c => c.id === id);
        if (curve) curve.shift = value;
    }
    updateGraph();
};
window.removeCurve = removeCurve;

// --- Mathematical Engine & Rendering ---
function updateGraph() {
    let svgContent = '';

    // Calculate intercepts for all curves
    const processedDemand = state.demandCurves.map((c, i) => ({
        label: `D${i + 1}`,
        intercept: D_BASE.c - c.shift, // Subtraction moves D curve Right/Up
        isShifted: i > 0
    }));

    const processedSupply = state.supplyCurves.map((c, i) => ({
        label: `S${i + 1}`,
        intercept: S_BASE.c - c.shift, // Subtraction moves S curve Right/Down
        isShifted: i > 0
    }));

    // Find Base Equilibrium (D1 and S1) for Shading
    const baseDc = processedDemand[0].intercept;
    const baseSc = processedSupply[0].intercept;
    const baseEqX = (baseSc - baseDc) / (D_BASE.m - S_BASE.m);
    const baseEqY = D_BASE.m * baseEqX + baseDc;

    // 1. Render Shading (if toggled) based on D1 & S1
    if (showShading.checked) {
        svgContent += `
            <path d="M ${padding},${baseDc} L ${baseEqX},${baseEqY} L ${padding},${baseEqY} Z" fill="#3b82f6" fill-opacity="0.1" />
            <path d="M ${padding},${baseSc} L ${baseEqX},${baseEqY} L ${padding},${baseEqY} Z" fill="#ef4444" fill-opacity="0.1" />
        `;
    }

    // 2. Render Axes
    svgContent += `
        <line x1="${padding}" y1="${height - padding}" x2="${width - 20}" y2="${height - padding}" class="axis" />
        <line x1="${padding}" y1="20" x2="${padding}" y2="${height - padding}" class="axis" />
        <text x="20" y="30" class="label">Price</text>
        <text x="${width - 70}" y="${height - 30}" class="label">Quantity</text>
    `;

    // 3. Render all combinations of Equilibriums to show projections
    // If D2 and S2 exist, show (D1,S1), (D2,S1), (D1,S2), (D2,S2) depending on what shifted.
    // To keep it clean, we highlight the matching index intersections, or D1/S1 + latest shift.
    
    let eqPoints = [];
    processedDemand.forEach((d, dIdx) => {
        processedSupply.forEach((s, sIdx) => {
            // Only draw equilibriums for D1/S1, or shifts matching the same "step"
            // E.g., D2/S1 (Demand shifted), D1/S2 (Supply shifted), D2/S2 (Both shifted)
            if (dIdx === 0 && sIdx === 0 || dIdx > 0 || sIdx > 0) {
                 const eqX = (s.intercept - d.intercept) / (D_BASE.m - S_BASE.m);
                 const eqY = D_BASE.m * eqX + d.intercept;
                 
                 // Ensure intersection is within reasonable bounds
                 if(eqX > padding && eqX < width && eqY > 20 && eqY < height - padding) {
                     eqPoints.push({ x: eqX, y: eqY, label: `E${eqPoints.length + 1}` });
                 }
            }
        });
    });

    // Draw Projections for calculated equilibriums
    eqPoints.forEach(pt => {
        svgContent += `
            <line x1="${padding}" y1="${pt.y}" x2="${pt.x}" y2="${pt.y}" class="projection" />
            <line x1="${pt.x}" y1="${height - padding}" x2="${pt.x}" y2="${pt.y}" class="projection" />
            <circle cx="${pt.x}" cy="${pt.y}" r="5" class="eq-point" />
            <text x="${pt.x + 8}" y="${pt.y - 8}" class="eq-label">${pt.label}</text>
        `;
    });

    // 4. Render Curves on top
    processedDemand.forEach((d) => {
        const x2 = width - padding;
        const y2 = D_BASE.m * (width - padding * 2) + d.intercept;
        const styleClass = d.isShifted ? "curve-d curve-shifted" : "curve-d";
        svgContent += `
            <line x1="${padding}" y1="${d.intercept}" x2="${x2}" y2="${y2}" class="${styleClass}" />
            <text x="${x2 + 10}" y="${y2 + 5}" class="label" fill="#3b82f6">${d.label}</text>
        `;
    });

    processedSupply.forEach((s) => {
        const x2 = width - padding;
        const y2 = S_BASE.m * (width - padding * 2) + s.intercept;
        const styleClass = s.isShifted ? "curve-s curve-shifted" : "curve-s";
        svgContent += `
            <line x1="${padding}" y1="${s.intercept}" x2="${x2}" y2="${y2}" class="${styleClass}" />
            <text x="${x2 + 10}" y="${y2 + 5}" class="label" fill="#ef4444">${s.label}</text>
        `;
    });

    // Wrap in SVG tags
    graphContainer.innerHTML = `<svg width="${width}" height="${height}" id="ecoSvg" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
}

function exportSVG() {
    const svgData = document.getElementById('ecoSvg').outerHTML;
    const blob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "economics-diagram.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Start app
init();
