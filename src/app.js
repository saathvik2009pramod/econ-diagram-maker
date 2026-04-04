/**
 * EcoGraph Pro - Main Logic
 * Coordinate system: (0,0) is Top-Left in SVG. 
 * X-axis = Quantity, Y-axis = Price
 */

const state = {
    diagramType: 'supply-demand',
    demandCurves: [{ id: Date.now(), shift: 0 }],
    supplyCurves: [{ id: Date.now() + 1, shift: 0 }],
    showShading: false
};

const CONFIG = {
    width: 600,
    height: 500,
    padding: 80,
    mD: 0.8, // Demand Slope
    mS: -0.8 // Supply Slope
};

function init() {
    // Event Listeners for Splash Screen
    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('editor-screen').classList.remove('hidden');
        render();
    });

    document.querySelectorAll('.diagram-card').forEach(card => {
        card.addEventListener('click', (e) => {
            document.querySelectorAll('.diagram-card').forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.diagramType = e.currentTarget.dataset.type;
        });
    });

    // Control Buttons
    document.getElementById('add-demand-btn').addEventListener('click', () => addCurve('demand'));
    document.getElementById('add-supply-btn').addEventListener('click', () => addCurve('supply'));
    document.getElementById('back-btn').addEventListener('click', () => location.reload());
    document.getElementById('export-btn').addEventListener('click', exportDiagram);
    document.getElementById('showShading').addEventListener('change', (e) => {
        state.showShading = e.target.checked;
        render();
    });

    render();
}

function addCurve(type) {
    const list = type === 'demand' ? state.demandCurves : state.supplyCurves;
    if (list.length >= 3) return;
    list.push({ id: Date.now(), shift: (list.length * 40) });
    render();
}

function removeCurve(type, id) {
    if (type === 'demand') {
        state.demandCurves = state.demandCurves.filter(c => c.id !== id);
    } else {
        state.supplyCurves = state.supplyCurves.filter(c => c.id !== id);
    }
    render();
}

function updateShift(type, id, val) {
    const list = type === 'demand' ? state.demandCurves : state.supplyCurves;
    const curve = list.find(c => c.id === id);
    if (curve) curve.shift = parseInt(val);
    render();
}

function render() {
    renderControls();
    renderGraph();
}

function renderControls() {
    const dContainer = document.getElementById('demand-controls');
    const sContainer = document.getElementById('supply-controls');
    
    document.getElementById('d-count').innerText = state.demandCurves.length;
    document.getElementById('s-count').innerText = state.supplyCurves.length;

    dContainer.innerHTML = state.demandCurves.map((c, i) => `
        <div class="slider-group">
            <div class="slider-header">
                <span>D${i+1} Shift</span>
                ${i > 0 ? `<button class="delete-curve" onclick="removeCurve('demand', ${c.id})">Delete</button>` : ''}
            </div>
            <input type="range" min="-120" max="120" value="${c.shift}" oninput="updateShift('demand', ${c.id}, this.value)">
        </div>
    `).join('');

    sContainer.innerHTML = state.supplyCurves.map((c, i) => `
        <div class="slider-group">
            <div class="slider-header">
                <span>S${i+1} Shift</span>
                ${i > 0 ? `<button class="delete-curve" onclick="removeCurve('supply', ${c.id})">Delete</button>` : ''}
            </div>
            <input type="range" min="-120" max="120" value="${c.shift}" oninput="updateShift('supply', ${c.id}, this.value)">
        </div>
    `).join('');
}

function renderGraph() {
    const { width, height, padding, mD, mS } = CONFIG;
    const canvas = document.getElementById('graph-container');
    
    // Base Intercepts (Starting point of the lines)
    const baseDc = 100;
    const baseSc = 400;

    let svgHtml = `<svg width="${width}" height="${height}" id="mainSvg" xmlns="http://www.w3.org/2000/svg">`;

    // 1. Draw Shading (Between D1 and S1)
    if (state.showShading) {
        const xEq = (baseSc - baseDc) / (mD - mS);
        const yEq = mD * xEq + baseDc;
        svgHtml += `<path d="M ${padding},${baseDc} L ${xEq + padding},${yEq} L ${padding},${yEq} Z" fill="#3b82f6" fill-opacity="0.1" />`;
        svgHtml += `<path d="M ${padding},${baseSc} L ${xEq + padding},${yEq} L ${padding},${yEq} Z" fill="#ef4444" fill-opacity="0.1" />`;
    }

    // 2. Draw Axes
    svgHtml += `
        <line x1="${padding}" y1="${height - padding}" x2="${width - 20}" y2="${height - padding}" class="axis" />
        <line x1="${padding}" y1="20" x2="${padding}" y2="${height - padding}" class="axis" />
        <text x="${padding - 60}" y="40" class="label-text">Price (P)</text>
        <text x="${width - 100}" y="${height - padding + 40}" class="label-text">Quantity (Q)</text>
    `;

    // 3. Draw Curves and Intersections
    state.demandCurves.forEach((dc, dIdx) => {
        const currentDc = baseDc - dc.shift;
        const xEnd = width - (padding * 2);
        const yEnd = mD * xEnd + currentDc;
        svgHtml += `<line x1="${padding}" y1="${currentDc}" x2="${xEnd + padding}" y2="${yEnd}" class="curve-d" style="${dIdx > 0 ? 'stroke-dasharray: 5;' : ''}" />`;
        svgHtml += `<text x="${xEnd + padding + 5}" y="${yEnd}" fill="#2563eb" font-weight="bold">D${dIdx+1}</text>`;

        // Intersect with all supply curves
        state.supplyCurves.forEach((sc, sIdx) => {
            const currentSc = baseSc - sc.shift;
            const xEq = (currentSc - currentDc) / (mD - mS);
            const yEq = mD * xEq + currentDc;

            // Only draw projection if it's the main equilibrium or both are secondary
            if ((dIdx === 0 && sIdx === 0) || (dIdx === state.demandCurves.length - 1 && sIdx === state.supplyCurves.length - 1)) {
                svgHtml += `
                    <line x1="${padding}" y1="${yEq}" x2="${xEq + padding}" y2="${yEq}" class="projection" />
                    <line x1="${xEq + padding}" y1="${height - padding}" x2="${xEq + padding}" y2="${yEq}" class="projection" />
                    <circle cx="${xEq + padding}" cy="${yEq}" r="4" fill="#000" />
                `;
            }
        });
    });

    state.supplyCurves.forEach((sc, sIdx) => {
        const currentSc = baseSc - sc.shift;
        const xEnd = width - (padding * 2);
        const yEnd = mS * xEnd + currentSc;
        svgHtml += `<line x1="${padding}" y1="${currentSc}" x2="${xEnd + padding}" y2="${yEnd}" class="curve-s" style="${sIdx > 0 ? 'stroke-dasharray: 5;' : ''}" />`;
        svgHtml += `<text x="${xEnd + padding + 5}" y="${yEnd}" fill="#dc2626" font-weight="bold">S${sIdx+1}</text>`;
    });

    svgHtml += `</svg>`;
    canvas.innerHTML = svgHtml;
}

function exportDiagram() {
    const svg = document.getElementById('mainSvg').outerHTML;
    const blob = new Blob([svg], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'economics-diagram.svg';
    link.click();
}

// Global exposure for inline HTML events
window.updateShift = updateShift;
window.removeCurve = removeCurve;

window.onload = init;
