const graphContainer = document.getElementById('graph-container');
const dShiftInput = document.getElementById('demandShift');
const sShiftInput = document.getElementById('supplyShift');
const showShading = document.getElementById('showShading');

// Configuration
const width = 500;
const height = 400;
const padding = 60;

// Base Line Equations: y = mx + c
// In SVG, Y increases downwards, so a downward slope (Demand) is positive m
const D_BASE = { m: 0.8, c: 50 }; 
const S_BASE = { m: -0.8, c: 350 };

function init() {
    [dShiftInput, sShiftInput, showShading].forEach(el => {
        el.addEventListener('input', updateGraph);
    });
    document.getElementById('exportBtn').addEventListener('click', exportSVG);
    updateGraph();
}

function updateGraph() {
    const dShift = parseInt(dShiftInput.value);
    const sShift = parseInt(sShiftInput.value);
    
    document.getElementById('dVal').innerText = dShift;
    document.getElementById('sVal').innerText = sShift;

    // Current intercepts
    const curDc = D_BASE.c + dShift;
    const curSc = S_BASE.c - sShift;

    // Calculate Equilibrium (mx + c1 = mx + c2)
    const eqX = (curSc - curDc) / (D_BASE.m - S_BASE.m);
    const eqY = D_BASE.m * eqX + curDc;

    render(curDc, curSc, eqX, eqY);
}

function render(dIntercept, sIntercept, eqX, eqY) {
    const svg = `
        <svg width="${width}" height="${height}" id="ecoSvg" xmlns="http://www.w3.org/2000/svg">
            ${showShading.checked ? `
                <path d="M ${padding},${dIntercept} L ${eqX},${eqY} L ${padding},${eqY} Z" fill="#3b82f6" fill-opacity="0.1" />
                <path d="M ${padding},${sIntercept} L ${eqX},${eqY} L ${padding},${eqY} Z" fill="#ef4444" fill-opacity="0.1" />
            ` : ''}

            <line x1="${padding}" y1="${height - padding}" x2="${width - 20}" y2="${height - padding}" class="axis" />
            <line x1="${padding}" y1="20" x2="${padding}" y2="${height - padding}" class="axis" />
            
            <text x="10" y="30" class="label">Price (P)</text>
            <text x="${width - 40}" y="${height - 20}" class="label">Quantity (Q)</text>

            <line x1="${padding}" y1="${dIntercept}" x2="${width - padding}" y2="${D_BASE.m * (width - padding * 2) + dIntercept}" class="curve-d" />
            <line x1="${padding}" y1="${sIntercept}" x2="${width - padding}" y2="${S_BASE.m * (width - padding * 2) + sIntercept}" class="curve-s" />

            <line x1="${padding}" y1="${eqY}" x2="${eqX}" y2="${eqY}" class="projection" />
            <line x1="${eqX}" y1="${height - padding}" x2="${eqX}" y2="${eqY}" class="projection" />

            <circle cx="${eqX}" cy="${eqY}" r="5" fill="#1e293b" />
            <text x="${eqX + 10}" y="${eqY - 10}" font-weight="bold">E</text>
        </svg>
    `;
    graphContainer.innerHTML = svg;
}

function exportSVG() {
    const svgData = document.getElementById('ecoSvg').outerHTML;
    const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "economics-diagram.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

init();
