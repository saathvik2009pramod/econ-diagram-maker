const state = {
    type: 'supply-demand',
    demand: [{ id: 1, shift: 0, color: '#2563eb' }],
    supply: [{ id: 1, shift: 0, color: '#dc2626' }],
    textObjects: [
        { id: 'p-axis', x: 20, y: 40, text: 'Price (P)', style: { bold: true, italic: true, size: 16 } },
        { id: 'q-axis', x: 520, y: 480, text: 'Quantity (Q)', style: { bold: true, italic: true, size: 16 } }
    ],
    axisLabels: {}, // Stores P1, Q1, etc.
    selectedId: null
};

const DIM = { w: 600, h: 500, pad: 80, mD: 0.8, mS: -0.8 };

function init() {
    document.getElementById('start-btn').onclick = () => {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('editor-screen').classList.remove('hidden');
        render();
    };

    document.getElementById('add-d').onclick = () => addCurve('demand');
    document.getElementById('add-s').onclick = () => addCurve('supply');
    document.getElementById('export-btn').onclick = exportToJpeg;
    document.getElementById('graph-container').onclick = handleGraphClick;
    
    render();
}

function addCurve(type) {
    const list = state[type];
    if (list.length >= 3) return;
    list.push({ id: Date.now(), shift: list.length * 50, color: type === 'demand' ? '#2563eb' : '#dc2626' });
    render();
}

// --- MATH: Curve Clipping ---
function getClippedLine(m, c) {
    const xStart = DIM.pad;
    const yStart = c;
    let xEnd = DIM.w - DIM.pad;
    let yEnd = m * (xEnd - DIM.pad) + c;

    // Clip at X-Axis (y = DIM.h - DIM.pad)
    const xAxisY = DIM.h - DIM.pad;
    if (state.type !== 'monopoly' && yEnd > xAxisY) {
        xEnd = (xAxisY - c) / m + DIM.pad;
        yEnd = xAxisY;
    }
    return { x1: xStart, y1: yStart, x2: xEnd, y2: yEnd };
}

function render() {
    const container = document.getElementById('graph-container');
    const inputLayer = document.getElementById('axis-inputs');
    inputLayer.innerHTML = '';

    let svg = `<svg width="${DIM.w}" height="${DIM.h}" id="mainSvg">`;
    
    // 1. Axes
    svg += `<line x1="${DIM.pad}" y1="${DIM.h - DIM.pad}" x2="${DIM.w - 20}" y2="${DIM.h - DIM.pad}" stroke="black" stroke-width="2"/>`;
    svg += `<line x1="${DIM.pad}" y1="20" x2="${DIM.pad}" y2="${DIM.h - DIM.pad}" stroke="black" stroke-width="2"/>`;

    // 2. Intersections & Projections
    let eqCount = 1;
    state.demand.forEach(d => {
        const dc = 120 - d.shift;
        state.supply.forEach(s => {
            const sc = 380 - s.shift;
            const xEq = (sc - dc) / (DIM.mD - DIM.mS);
            const yEq = DIM.mD * xEq + dc;
            const realX = xEq + DIM.pad;
            
            // Draw Projections
            svg += `<line x1="${DIM.pad}" y1="${yEq}" x2="${realX}" y2="${yEq}" class="projection" />`;
            svg += `<line x1="${realX}" y1="${DIM.h - DIM.pad}" x2="${realX}" y2="${yEq}" class="projection" />`;
            svg += `<circle cx="${realX}" cy="${yEq}" r="4" class="dot" />`;

            // Axis Inputs (Absolute positioned overlays)
            createAxisInput(DIM.pad - 60, yEq - 10, `P${eqCount}`);
            createAxisInput(realX - 25, DIM.h - DIM.pad + 10, `Q${eqCount}`);
            eqCount++;
        });
    });

    // 3. Curves
    state.demand.forEach((d, i) => {
        const coords = getClippedLine(DIM.mD, 120 - d.shift);
        svg += `<line x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}" stroke="${d.color}" class="curve" onclick="selectCurve('demand', ${d.id})"/>`;
        svg += `<text x="${coords.x2 + 5}" y="${coords.y2}" fill="${d.color}" font-weight="bold">D${i+1}</text>`;
    });

    state.supply.forEach((s, i) => {
        const coords = getClippedLine(DIM.mS, 380 - s.shift);
        svg += `<line x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}" stroke="${s.color}" class="curve" onclick="selectCurve('supply', ${s.id})"/>`;
        svg += `<text x="${coords.x2 + 5}" y="${coords.y2}" fill="${s.color}" font-weight="bold">S${i+1}</text>`;
    });

    // 4. Free Text Objects
    state.textObjects.forEach(obj => {
        svg += `<text x="${obj.x}" y="${obj.y}" class="draggable-text" 
                style="font-weight:${obj.style.bold?'bold':'normal'}; font-style:${obj.style.italic?'italic':'normal'}; font-size:${obj.style.size}px"
                onmousedown="startDrag(event, '${obj.id}')">${obj.text}</text>`;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
    updateSidebar();
}

function createAxisInput(x, y, defaultVal) {
    const input = document.createElement('input');
    input.className = 'axis-label-input';
    input.style.left = `${x + 60}px`; // Adjusted for container padding
    input.style.top = `${y + 60}px`;
    input.value = state.axisLabels[`${x}-${y}`] || defaultVal;
    input.onchange = (e) => state.axisLabels[`${x}-${y}`] = e.target.value;
    document.getElementById('axis-inputs').appendChild(input);
}

function handleGraphClick(e) {
    if (e.target.tagName === 'svg' || e.target.id === 'graph-container') {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const txt = prompt("Enter text:");
        if (txt) {
            state.textObjects.push({ id: Date.now(), x, y, text: txt, style: { size: 14 } });
            render();
        }
    }
}

function exportToJpeg() {
    const svg = document.querySelector('#mainSvg');
    const canvas = document.createElement('canvas');
    canvas.width = DIM.w + 100;
    canvas.height = DIM.h + 100;
    const ctx = canvas.getContext('2d');
    
    // Fill white background
    ctx.fillStyle = "white";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    const data = (new XMLSerializer()).serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
        ctx.drawImage(img, 50, 50);
        const jpgUrl = canvas.toDataURL("image/jpeg", 1.0);
        const link = document.createElement('a');
        link.download = 'diagram.jpg';
        link.href = jpgUrl;
        link.click();
    };
    img.src = url;
}

// Sidebar/Curve UI Helpers
function updateSidebar() {
    const dList = document.getElementById('d-list');
    dList.innerHTML = state.demand.map(d => `
        <div class="control-group">
            <input type="range" min="-100" max="150" value="${d.shift}" oninput="updateShift('demand', ${d.id}, this.value)">
        </div>
    `).join('');
    // Similar for supply...
}

window.updateShift = (type, id, val) => {
    state[type].find(c => c.id === id).shift = parseInt(val);
    render();
};

init();
