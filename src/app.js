// ══════════════════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════════════════
const canvas = document.getElementById('diag');
const ctx = canvas.getContext('2d');
const wrap = document.getElementById('canvasWrap');

let curves = [];
let intersectPoints = [];
let selectedCurveIdx = -1;
let textMode = false;
let floatingTexts = [];
let selectedText = null;
let draggingText = null;
let dragOffX = 0, dragOffY = 0;
let selectedIntersectIdx = -1;

const PAD = { left: 60, right: 40, top: 30, bottom: 50 };

// Shading regions config
const SHADE_DEFS = [
  { id:'cs',  name:'Consumer Surplus',   color:'#2563eb', alpha:.18 },
  { id:'ps',  name:'Producer Surplus',   color:'#16a34a', alpha:.18 },
  { id:'tax', name:'Tax Revenue',        color:'#d97706', alpha:.22 },
  { id:'dwl', name:'Deadweight Loss',    color:'#dc2626', alpha:.18 },
  { id:'sub', name:'Gov. Subsidy',       color:'#7c3aed', alpha:.15 },
  { id:'ext', name:'Welfare Loss',       color:'#be185d', alpha:.18 },
  { id:'pft', name:'Profit Area',        color:'#0891b2', alpha:.18 },
];
let activeShades = {};

// ══════════════════════════════════════════════════════════════════════
// DIAGRAM PRESETS
// ══════════════════════════════════════════════════════════════════════
const DIAGRAMS = {
  supply_demand: {
    xLabel:'Quantity (Q)', yLabel:'Price (P)',
    curves:[
      { name:'D1', color:'#2563eb', slope:-1.1, offsetX:0, offsetY:0, style:'solid', thickness:2, type:'demand' },
      { name:'S1', color:'#dc2626', slope:1.1,  offsetX:0, offsetY:0, style:'solid', thickness:2, type:'supply' },
    ],
    intersects:[{ label:'E', xLabel:'Q*', yLabel:'P*' }],
    shades:['cs','ps'],
  },
  supply_demand_shift:{
    xLabel:'Quantity (Q)', yLabel:'Price (P)',
    curves:[
      { name:'D1', color:'#2563eb', slope:-1.1, offsetX:0,   offsetY:0,  style:'solid',  thickness:2, type:'demand' },
      { name:'D2', color:'#2563eb', slope:-1.1, offsetX:40,  offsetY:0,  style:'dashed', thickness:1.5, type:'demand' },
      { name:'S1', color:'#dc2626', slope:1.1,  offsetX:0,   offsetY:0,  style:'solid',  thickness:2, type:'supply' },
    ],
    intersects:[{ label:'E1', xLabel:'Q₁', yLabel:'P₁' },{ label:'E2', xLabel:'Q₂', yLabel:'P₂' }],
    shades:[],
  },
  elasticity:{
    xLabel:'Quantity (Q)', yLabel:'Price (P)',
    curves:[
      { name:'Elastic', color:'#2563eb', slope:-.4, offsetX:-20, offsetY:0, style:'solid', thickness:2, type:'demand' },
      { name:'Inelastic',color:'#7c3aed',slope:-2.8,offsetX:40,  offsetY:0, style:'solid', thickness:2, type:'demand' },
    ],
    intersects:[],
    shades:[],
  },
  consumer_producer_surplus:{
    xLabel:'Quantity (Q)', yLabel:'Price (P)',
    curves:[
      { name:'D', color:'#2563eb', slope:-1.1, offsetX:0, offsetY:0, style:'solid', thickness:2, type:'demand' },
      { name:'S', color:'#dc2626', slope:1.1,  offsetX:0, offsetY:0, style:'solid', thickness:2, type:'supply' },
    ],
    intersects:[{ label:'E', xLabel:'Qe', yLabel:'Pe' }],
    shades:['cs','ps'],
  },
  tax_incidence:{
    xLabel:'Quantity (Q)', yLabel:'Price (P)',
    curves:[
      { name:'D',  color:'#2563eb', slope:-1.1, offsetX:0,   offsetY:0,  style:'solid',  thickness:2, type:'demand' },
      { name:'S₁', color:'#dc2626', slope:1.1,  offsetX:0,   offsetY:0,  style:'solid',  thickness:2, type:'supply' },
      { name:'S₂', color:'#dc2626', slope:1.1,  offsetX:-30, offsetY:0,  style:'dashed', thickness:1.5, type:'supply' },
    ],
    intersects:[{ label:'E₁', xLabel:'Q₁', yLabel:'P₁' },{ label:'E₂', xLabel:'Q₂', yLabel:'P₂' }],
    shades:['tax','dwl'],
  },
  subsidy:{
    xLabel:'Quantity (Q)', yLabel:'Price (P)',
    curves:[
      { name:'D',  color:'#2563eb', slope:-1.1, offsetX:0,  offsetY:0, style:'solid',  thickness:2, type:'demand' },
      { name:'S₁', color:'#dc2626', slope:1.1,  offsetX:0,  offsetY:0, style:'solid',  thickness:2, type:'supply' },
      { name:'S₂', color:'#16a34a', slope:1.1,  offsetX:30, offsetY:0, style:'dashed', thickness:1.5, type:'supply' },
    ],
    intersects:[{ label:'E₁', xLabel:'Q₁', yLabel:'P₁' },{ label:'E₂', xLabel:'Q₂', yLabel:'P₂' }],
    shades:['sub','cs'],
  },
  price_ceiling:{
    xLabel:'Quantity (Q)', yLabel:'Price (P)',
    curves:[
      { name:'D', color:'#2563eb', slope:-1.1, offsetX:0, offsetY:0, style:'solid', thickness:2, type:'demand' },
      { name:'S', color:'#dc2626', slope:1.1,  offsetX:0, offsetY:0, style:'solid', thickness:2, type:'supply' },
      { name:'Price Ceiling', color:'#d97706', slope:0, offsetX:0, offsetY:-20, style:'dashed', thickness:1.5, type:'horizontal' },
    ],
    intersects:[],
    shades:['dwl'],
  },
  price_floor:{
    xLabel:'Quantity (Q)', yLabel:'Price (P)',
    curves:[
      { name:'D', color:'#2563eb', slope:-1.1, offsetX:0, offsetY:0, style:'solid', thickness:2, type:'demand' },
      { name:'S', color:'#dc2626', slope:1.1,  offsetX:0, offsetY:0, style:'solid', thickness:2, type:'supply' },
      { name:'Price Floor', color:'#d97706', slope:0, offsetX:0, offsetY:20, style:'dashed', thickness:1.5, type:'horizontal' },
    ],
    intersects:[],
    shades:['dwl'],
  },
  negative_externality:{
    xLabel:'Quantity (Q)', yLabel:'Price / Cost',
    curves:[
      { name:'MPB=D', color:'#2563eb', slope:-1.1, offsetX:0,   offsetY:0,  style:'solid', thickness:2, type:'demand' },
      { name:'MPC=S', color:'#dc2626', slope:1.1,  offsetX:0,   offsetY:0,  style:'solid', thickness:2, type:'supply' },
      { name:'MSC',   color:'#be185d', slope:1.1,  offsetX:-30, offsetY:0,  style:'dashed',thickness:2, type:'supply' },
    ],
    intersects:[{ label:'Qₘ', xLabel:'Qₘ', yLabel:'Pₘ' },{ label:'Q*', xLabel:'Q*', yLabel:'P*' }],
    shades:['ext'],
  },
  positive_externality:{
    xLabel:'Quantity (Q)', yLabel:'Price / Benefit',
    curves:[
      { name:'MPB',   color:'#2563eb', slope:-1.1, offsetX:0,  offsetY:0,  style:'solid', thickness:2, type:'demand' },
      { name:'MSB',   color:'#16a34a', slope:-1.1, offsetX:30, offsetY:0,  style:'dashed',thickness:2, type:'demand' },
      { name:'MPC=S', color:'#dc2626', slope:1.1,  offsetX:0,  offsetY:0,  style:'solid', thickness:2, type:'supply' },
    ],
    intersects:[{ label:'Qₘ', xLabel:'Qₘ', yLabel:'Pₘ' },{ label:'Q*', xLabel:'Q*', yLabel:'P*' }],
    shades:['ext'],
  },
  costs_revenue:{
    xLabel:'Output (Q)', yLabel:'Costs / Revenue (£)',
    curves:[
      { name:'MC',  color:'#dc2626', slope:1.5,  offsetX:0,   offsetY:0,  style:'solid', thickness:2, type:'u_curve' },
      { name:'AC',  color:'#d97706', slope:.8,   offsetX:0,   offsetY:30, style:'solid', thickness:2, type:'u_curve' },
      { name:'AR',  color:'#2563eb', slope:-.5,  offsetX:0,   offsetY:0,  style:'solid', thickness:2, type:'demand' },
      { name:'MR',  color:'#7c3aed', slope:-1.0, offsetX:0,   offsetY:0,  style:'solid', thickness:2, type:'demand' },
    ],
    intersects:[{ label:'Profit Max', xLabel:'Qₚ', yLabel:'Pₚ' }],
    shades:['pft'],
  },
  monopoly:{
    xLabel:'Output (Q)', yLabel:'Price / Cost (£)',
    curves:[
      { name:'AR=D', color:'#2563eb', slope:-1.1, offsetX:0,  offsetY:0,  style:'solid', thickness:2, type:'demand' },
      { name:'MR',   color:'#7c3aed', slope:-2.2, offsetX:0,  offsetY:0,  style:'solid', thickness:2, type:'demand' },
      { name:'MC',   color:'#dc2626', slope:1.0,  offsetX:0,  offsetY:0,  style:'solid', thickness:2, type:'supply' },
      { name:'AC',   color:'#d97706', slope:.4,   offsetX:0,  offsetY:20, style:'dashed',thickness:1.5, type:'supply' },
    ],
    intersects:[{ label:'Profit Max', xLabel:'Qₘ', yLabel:'Pₘ' }],
    shades:['pft','dwl'],
    allowBelowAxis: true,
  },
  perfect_competition:{
    xLabel:'Output (Q)', yLabel:'Price / Cost (£)',
    curves:[
      { name:'AR=MR=P', color:'#2563eb', slope:0,    offsetX:0, offsetY:0,  style:'solid', thickness:2, type:'horizontal' },
      { name:'MC',      color:'#dc2626', slope:1.5,  offsetX:0, offsetY:0,  style:'solid', thickness:2, type:'supply' },
      { name:'AC',      color:'#d97706', slope:.6,   offsetX:0, offsetY:30, style:'dashed',thickness:1.5, type:'u_curve' },
    ],
    intersects:[{ label:'E', xLabel:'Q*', yLabel:'P*' }],
    shades:['pft'],
  },
  ad_as:{
    xLabel:'Real GDP (Y)', yLabel:'Price Level (PL)',
    curves:[
      { name:'AD',  color:'#2563eb', slope:-1.1, offsetX:0,  offsetY:0, style:'solid', thickness:2, type:'demand' },
      { name:'SRAS',color:'#dc2626', slope:1.1,  offsetX:0,  offsetY:0, style:'solid', thickness:2, type:'supply' },
      { name:'LRAS',color:'#16a34a', slope:100,  offsetX:0,  offsetY:0, style:'dashed',thickness:2, type:'vertical' },
    ],
    intersects:[{ label:'E', xLabel:'Yₑ', yLabel:'PLₑ' }],
    shades:['cs'],
  },
  phillips_curve:{
    xLabel:'Unemployment Rate (%)', yLabel:'Inflation Rate (%)',
    curves:[
      { name:'PC₁', color:'#dc2626', slope:-1.2, offsetX:0,  offsetY:0, style:'solid', thickness:2, type:'demand' },
      { name:'PC₂', color:'#dc2626', slope:-1.2, offsetX:30, offsetY:0, style:'dashed',thickness:1.5, type:'demand' },
    ],
    intersects:[],
    shades:[],
  },
  ppf:{
    xLabel:'Good X', yLabel:'Good Y',
    curves:[
      { name:'PPF₁', color:'#2563eb', slope:-1.0, offsetX:0,  offsetY:0, style:'solid', thickness:2.5, type:'ppf' },
      { name:'PPF₂', color:'#16a34a', slope:-1.0, offsetX:25, offsetY:0, style:'dashed',thickness:1.5, type:'ppf' },
    ],
    intersects:[],
    shades:[],
  },
  labour_market:{
    xLabel:'Quantity of Labour (L)', yLabel:'Wage Rate (W)',
    curves:[
      { name:'Dₗ', color:'#2563eb', slope:-1.1, offsetX:0, offsetY:0, style:'solid', thickness:2, type:'demand' },
      { name:'Sₗ', color:'#dc2626', slope:1.1,  offsetX:0, offsetY:0, style:'solid', thickness:2, type:'supply' },
    ],
    intersects:[{ label:'E', xLabel:'L*', yLabel:'W*' }],
    shades:['cs','ps'],
  },
};

// ══════════════════════════════════════════════════════════════════════
// LOAD DIAGRAM
// ══════════════════════════════════════════════════════════════════════
function loadDiagram() {
  const key = document.getElementById('diagSelect').value;
  const def = DIAGRAMS[key];
  if (!def) return;

  document.getElementById('xLabel').value = def.xLabel;
  document.getElementById('yLabel').value = def.yLabel;

  curves = def.curves.map((c, i) => ({
    ...c,
    id: Date.now() + i,
    offsetX: c.offsetX || 0,
    offsetY: c.offsetY || 0,
    visible: true,
    allowBelowAxis: def.allowBelowAxis || false,
  }));

  intersectPoints = (def.intersects || []).map((p, i) => ({
    id: Date.now() + 100 + i,
    label: p.label,
    xLabel: p.xLabel || '',
    yLabel: p.yLabel || '',
    showDashedLines: true,
    auto: true,
    manualX: null, manualY: null,
  }));

  // activate default shades
  activeShades = {};
  (def.shades || []).forEach(s => activeShades[s] = true);

  selectedCurveIdx = -1;
  document.getElementById('curveControls').style.display = 'none';
  clearFloatingTexts();
  renderCurveList();
  renderIntersectList();
  renderShadePanel();
  autoSize();
}

// ══════════════════════════════════════════════════════════════════════
// AUTO SIZE
// ══════════════════════════════════════════════════════════════════════
function autoSize() {
  const W = canvas.width - PAD.left - PAD.right;
  const H = canvas.height - PAD.top - PAD.bottom;

  // space curves evenly
  const demandCurves = curves.filter(c => c.type === 'demand' || c.slope < 0);
  const supplyCurves = curves.filter(c => c.type === 'supply' || (c.slope > 0 && c.type !== 'demand'));

  // reset offsets to ensure good fit
  curves.forEach(c => {
    c.offsetX = 0;
    c.offsetY = 0;
  });

  // spread shifted copies
  const shifts = [-40, 0, 40];
  const groups = {};
  curves.forEach(c => {
    const base = c.name.replace(/[₁₂₃₀-₉\d]/g,'').trim();
    if (!groups[base]) groups[base] = [];
    groups[base].push(c);
  });
  Object.values(groups).forEach(grp => {
    if (grp.length > 1) {
      grp.forEach((c, i) => {
        c.offsetX = (i - (grp.length-1)/2) * 45;
      });
    }
  });

  redraw();
}

// ══════════════════════════════════════════════════════════════════════
// DRAW
// ══════════════════════════════════════════════════════════════════════
function redraw() {
  const W = canvas.width;
  const H = canvas.height;
  const gW = W - PAD.left - PAD.right;
  const gH = H - PAD.top - PAD.bottom;

  ctx.clearRect(0, 0, W, H);

  // background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // grid
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1;
  const gridN = 8;
  for (let i = 1; i < gridN; i++) {
    const x = PAD.left + (gW / gridN) * i;
    const y = PAD.top  + (gH / gridN) * i;
    ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + gH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + gW, y); ctx.stroke();
  }

  // axes
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD.left, PAD.top);
  ctx.lineTo(PAD.left, PAD.top + gH);
  ctx.lineTo(PAD.left + gW, PAD.top + gH);
  ctx.stroke();

  // arrowheads
  drawArrow(PAD.left, PAD.top + gH, PAD.left, PAD.top - 6);
  drawArrow(PAD.left, PAD.top + gH, PAD.left + gW + 6, PAD.top + gH);

  // axis labels
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'italic 13px DM Serif Display, serif';
  ctx.textAlign = 'center';
  ctx.fillText(document.getElementById('xLabel').value, PAD.left + gW / 2, H - 8);
  ctx.save();
  ctx.translate(14, PAD.top + gH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(document.getElementById('yLabel').value, 0, 0);
  ctx.restore();

  // origin
  ctx.fillStyle = '#1a1a2e';
  ctx.font = '12px DM Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('O', PAD.left - 10, PAD.top + gH + 14);

  // draw shading FIRST (under curves)
  drawShading(gW, gH);

  // draw curves
  curves.forEach((c, idx) => {
    if (!c.visible) return;
    drawCurve(c, idx === selectedCurveIdx, gW, gH);
  });

  // draw intersection points
  const computed = computeAllIntersections(gW, gH);
  intersectPoints.forEach((pt, i) => {
    const pos = computed[i];
    if (!pos) return;
    drawIntersectPoint(pos.cx, pos.cy, pos.px, pos.py, pt, gW, gH);
  });
}

function drawArrow(fromX, fromY, toX, toY) {
  const headLen = 8;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - 0.4), toY - headLen * Math.sin(angle - 0.4));
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle + 0.4), toY - headLen * Math.sin(angle + 0.4));
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ══════════════════════════════════════════════════════════════════════
// CURVE GEOMETRY
// ══════════════════════════════════════════════════════════════════════
function getCurvePoints(curve, gW, gH) {
  const slope = curve.slope;
  const ox = curve.offsetX || 0;
  const oy = curve.offsetY || 0;
  const cX = PAD.left + gW / 2 + ox;
  const cY = PAD.top  + gH / 2 + oy;
  const allowBelow = curve.allowBelowAxis;
  const minY = allowBelow ? PAD.top - 50 : PAD.top;

  if (curve.type === 'vertical') {
    return [[cX, PAD.top],[cX, PAD.top + gH]];
  }
  if (curve.type === 'horizontal') {
    return [[PAD.left, cY],[PAD.left + gW, cY]];
  }
  if (curve.type === 'ppf') {
    // curved PPF (concave)
    const pts = [];
    const r = gH * 0.75;
    for (let t = 0; t <= Math.PI/2; t += 0.05) {
      const x = PAD.left + ox + 20 + r * Math.sin(t);
      const y = PAD.top  + oy + 20 + r * (1 - Math.cos(t));
      if (x >= PAD.left && x <= PAD.left + gW && y >= PAD.top && y <= PAD.top + gH)
        pts.push([x, y]);
    }
    return pts;
  }

  // linear
  const pts = [];
  for (let x = PAD.left; x <= PAD.left + gW; x += 2) {
    const dx = x - cX;
    const y  = cY + dx * slope * (gH / gW);
    if (y >= minY && y <= PAD.top + gH) pts.push([x, y]);
  }
  return pts;
}

function drawCurve(curve, selected, gW, gH) {
  const pts = getCurvePoints(curve, gW, gH);
  if (pts.length < 2) return;

  ctx.save();
  ctx.strokeStyle = curve.color;
  ctx.lineWidth = curve.thickness || 2;
  if (curve.style === 'dashed') ctx.setLineDash([8, 5]);
  else if (curve.style === 'dotted') ctx.setLineDash([2, 4]);
  else ctx.setLineDash([]);

  if (selected) {
    ctx.shadowColor = curve.color;
    ctx.shadowBlur = 6;
  }

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
  ctx.restore();

  // curve label at end
  const last = pts[pts.length - 1];
  ctx.fillStyle = curve.color;
  ctx.font = `bold 13px DM Sans, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(curve.name, last[0] + 4, last[1]);
}

// ══════════════════════════════════════════════════════════════════════
// INTERSECTION COMPUTATION
// ══════════════════════════════════════════════════════════════════════
function computeAllIntersections(gW, gH) {
  const results = [];
  if (!intersectPoints.length) return results;

  // For each intersect point, find the crossing between relevant curves
  const pairs = getCurvePairs();
  intersectPoints.forEach((pt, i) => {
    const pair = pairs[i % pairs.length];
    if (!pair) { results.push(null); return; }
    const [a, b] = pair;
    const pos = findIntersection(a, b, gW, gH);
    results.push(pos);
  });
  return results;
}

function getCurvePairs() {
  const pairs = [];
  for (let i = 0; i < curves.length; i++) {
    for (let j = i+1; j < curves.length; j++) {
      if (curves[i].visible && curves[j].visible) pairs.push([curves[i], curves[j]]);
    }
  }
  return pairs;
}

function findIntersection(a, b, gW, gH) {
  const ptsA = getCurvePoints(a, gW, gH);
  const ptsB = getCurvePoints(b, gW, gH);
  if (!ptsA.length || !ptsB.length) return null;

  let best = null, bestDist = Infinity;
  for (let i = 0; i < ptsA.length - 1; i++) {
    for (let j = 0; j < ptsB.length - 1; j++) {
      const px = lineIntersect(ptsA[i], ptsA[i+1], ptsB[j], ptsB[j+1]);
      if (px) {
        const d = Math.abs(px.x - (PAD.left + gW/2));
        if (d < bestDist) { bestDist = d; best = px; }
      }
    }
  }
  if (!best) return null;
  return { cx: best.x, cy: best.y, px: best.x, py: best.y };
}

function lineIntersect(p1, p2, p3, p4) {
  const x1=p1[0],y1=p1[1],x2=p2[0],y2=p2[1];
  const x3=p3[0],y3=p3[1],x4=p4[0],y4=p4[1];
  const denom = (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
  if (Math.abs(denom) < 1e-10) return null;
  const t = ((x1-x3)*(y3-y4)-(y1-y3)*(x3-x4)) / denom;
  const u = -((x1-x2)*(y1-y3)-(y1-y2)*(x1-x3)) / denom;
  if (t>=0&&t<=1&&u>=0&&u<=1) return { x: x1+t*(x2-x1), y: y1+t*(y2-y1) };
  return null;
}

function drawIntersectPoint(cx, cy, px, py, pt, gW, gH) {
  // dot
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // label
  if (pt.label) {
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 12px DM Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(pt.label, cx + 7, cy - 5);
  }

  // dashed lines to axes
  if (pt.showDashedLines) {
    const bottom = PAD.top + gH;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(0,0,0,.35)';
    ctx.lineWidth = 1;

    // vertical to x-axis
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, bottom); ctx.stroke();
    // horizontal to y-axis
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(PAD.left, cy); ctx.stroke();

    ctx.setLineDash([]);

    // axis labels
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'italic 12px DM Mono, monospace';

    if (pt.xLabel) {
      ctx.textAlign = 'center';
      ctx.fillText(pt.xLabel, cx, bottom + 16);
    }
    if (pt.yLabel) {
      ctx.textAlign = 'right';
      ctx.fillText(pt.yLabel, PAD.left - 4, cy + 4);
    }
  }
}

// ══════════════════════════════════════════════════════════════════════
// SHADING
// ══════════════════════════════════════════════════════════════════════
function drawShading(gW, gH) {
  const bottom = PAD.top + gH;
  const left   = PAD.left;
  const right  = PAD.left + gW;
  const top    = PAD.top;

  const pairs = getCurvePairs();
  const inter = pairs[0] ? findIntersection(pairs[0][0], pairs[0][1], gW, gH) : null;

  SHADE_DEFS.forEach(sd => {
    if (!activeShades[sd.id]) return;

    ctx.save();
    ctx.fillStyle = sd.color;
    ctx.globalAlpha = sd.alpha;
    ctx.beginPath();

    if (sd.id === 'cs' && inter) {
      // consumer surplus: triangle above equilibrium, below demand
      const demCurve = curves.find(c => c.type==='demand'||c.slope<0);
      if (demCurve) {
        const pts = getCurvePoints(demCurve, gW, gH);
        const relevant = pts.filter(p => p[0] <= inter.x);
        ctx.moveTo(left, inter.cy);
        relevant.forEach(p => ctx.lineTo(p[0], p[1]));
        ctx.lineTo(inter.cx, inter.cy);
        ctx.closePath();
      }
    } else if (sd.id === 'ps' && inter) {
      // producer surplus: triangle below equilibrium price, above supply
      const supCurve = curves.find(c => c.type==='supply'||(c.slope>0&&c.type!=='demand'));
      if (supCurve) {
        const pts = getCurvePoints(supCurve, gW, gH);
        const relevant = pts.filter(p => p[0] <= inter.x);
        ctx.moveTo(left, inter.cy);
        ctx.lineTo(inter.cx, inter.cy);
        relevant.reverse().forEach(p => ctx.lineTo(p[0], p[1]));
        ctx.lineTo(left, bottom);
        ctx.closePath();
      }
    } else if ((sd.id === 'tax' || sd.id === 'dwl') && pairs.length >= 2) {
      const e1 = findIntersection(pairs[0][0], pairs[0][1], gW, gH);
      const e2 = pairs[1] ? findIntersection(pairs[1][0], pairs[1][1], gW, gH) : null;
      if (e1 && e2) {
        const x1 = Math.min(e1.cx, e2.cx), x2 = Math.max(e1.cx, e2.cx);
        if (sd.id === 'tax') {
          ctx.rect(x1, Math.min(e1.cy, e2.cy), x2-x1, Math.abs(e2.cy-e1.cy));
        } else {
          ctx.moveTo(x2, e2.cy);
          ctx.lineTo(x1, e1.cy);
          ctx.lineTo(x1, e2.cy);
          ctx.closePath();
        }
      }
    } else if (sd.id === 'sub' && pairs.length >= 2) {
      const e1 = findIntersection(pairs[0][0], pairs[0][1], gW, gH);
      const e2 = pairs[1] ? findIntersection(pairs[1][0], pairs[1][1], gW, gH) : null;
      if (e1 && e2) {
        ctx.rect(Math.min(e1.cx,e2.cx), Math.min(e1.cy,e2.cy),
          Math.abs(e2.cx-e1.cx), Math.abs(e2.cy-e1.cy)*1.5);
      }
    } else if (sd.id === 'pft' && inter) {
      ctx.rect(left, inter.cy - 30, inter.cx - left, 30);
    } else if (sd.id === 'ext' && pairs.length >= 2) {
      const e1 = findIntersection(pairs[0][0], pairs[0][1], gW, gH);
      const e2 = pairs[1] ? findIntersection(pairs[1][0], pairs[1][1], gW, gH) : null;
      if (e1 && e2) {
        ctx.moveTo(e1.cx, e1.cy);
        ctx.lineTo(e2.cx, e2.cy);
        ctx.lineTo(Math.max(e1.cx, e2.cx), Math.max(e1.cy, e2.cy));
        ctx.closePath();
      }
    }

    ctx.fill();
    ctx.restore();
  });
}

// ══════════════════════════════════════════════════════════════════════
// CURVE LIST UI
// ══════════════════════════════════════════════════════════════════════
function renderCurveList() {
  const list = document.getElementById('curveList');
  list.innerHTML = '';
  curves.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'curve-item' + (i === selectedCurveIdx ? ' selected' : '');
    div.innerHTML = `
      <div class="ci-swatch" style="background:${c.color}"></div>
      <span class="ci-name">${c.name}</span>
      <button class="ci-vis" onclick="toggleVis(${i})" title="Toggle visibility">${c.visible ? '👁' : '◻'}</button>
    `;
    div.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      selectCurve(i);
    });
    list.appendChild(div);
  });
}

function selectCurve(idx) {
  selectedCurveIdx = idx;
  const c = curves[idx];
  document.getElementById('curveControls').style.display = 'block';
  document.getElementById('curveName').value = c.name;
  document.getElementById('curveStyle').value = c.style || 'solid';
  document.getElementById('curveThick').value = c.thickness || 2;
  document.getElementById('thickVal').textContent = c.thickness || 2;
  document.getElementById('curveSlope').value = c.slope;
  document.getElementById('slopeVal').textContent = c.slope;
  // highlight color chip
  document.querySelectorAll('.color-chip').forEach(ch => {
    ch.classList.toggle('on', ch.dataset.col === c.color);
  });
  renderCurveList();
  redraw();
}

function updateSelectedCurve() {
  if (selectedCurveIdx < 0) return;
  const c = curves[selectedCurveIdx];
  c.name      = document.getElementById('curveName').value;
  c.style     = document.getElementById('curveStyle').value;
  c.thickness = parseFloat(document.getElementById('curveThick').value);
  c.slope     = parseFloat(document.getElementById('curveSlope').value);
  renderCurveList();
  redraw();
}

function pickColor(chip) {
  if (selectedCurveIdx < 0) return;
  curves[selectedCurveIdx].color = chip.dataset.col;
  document.querySelectorAll('.color-chip').forEach(ch => ch.classList.toggle('on', ch === chip));
  renderCurveList();
  redraw();
}

function pickCustomColor(val) {
  if (selectedCurveIdx < 0) return;
  curves[selectedCurveIdx].color = val;
  document.querySelectorAll('.color-chip[data-col]').forEach(ch => ch.classList.remove('on'));
  renderCurveList();
  redraw();
}

function toggleVis(idx) {
  curves[idx].visible = !curves[idx].visible;
  renderCurveList();
  redraw();
}

function addCurve() {
  curves.push({
    id: Date.now(), name: 'Curve ' + (curves.length+1),
    color:'#2563eb', slope:-1, offsetX:20, offsetY:-20,
    style:'solid', thickness:2, type:'demand', visible:true,
  });
  renderCurveList();
  selectCurve(curves.length - 1);
  redraw();
}

function deleteSelectedCurve() {
  if (selectedCurveIdx < 0) return;
  curves.splice(selectedCurveIdx, 1);
  selectedCurveIdx = -1;
  document.getElementById('curveControls').style.display = 'none';
  renderCurveList();
  redraw();
}

function shiftCurve(dx, dy) {
  if (selectedCurveIdx < 0) return;
  curves[selectedCurveIdx].offsetX += dx;
  curves[selectedCurveIdx].offsetY += dy;
  redraw();
}

// ══════════════════════════════════════════════════════════════════════
// INTERSECT POINT UI
// ══════════════════════════════════════════════════════════════════════
function renderIntersectList() {
  const list = document.getElementById('intersectList');
  list.innerHTML = '';
  intersectPoints.forEach((pt, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'margin-bottom:6px;background:rgba(255,255,255,.05);padding:7px;border-radius:6px;';
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="font-size:11px;color:rgba(255,255,255,.7);flex:1">${pt.label||'Point '+(i+1)}</span>
        <button class="ci-vis" onclick="removeIntersect(${i})">✕</button>
      </div>
      <input class="ctrl-input" placeholder="Point label" value="${pt.label}" oninput="updateIntersect(${i},'label',this.value)" style="margin-bottom:3px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        <input class="ctrl-input" placeholder="P label" value="${pt.yLabel}" oninput="updateIntersect(${i},'yLabel',this.value)">
        <input class="ctrl-input" placeholder="Q label" value="${pt.xLabel}" oninput="updateIntersect(${i},'xLabel',this.value)">
      </div>
    `;
    list.appendChild(div);
  });
}

function updateIntersect(i, key, val) {
  intersectPoints[i][key] = val;
  redraw();
}

function addIntersectPoint() {
  intersectPoints.push({ id:Date.now(), label:'E', xLabel:'Q', yLabel:'P', showDashedLines:true, auto:true });
  renderIntersectList();
  redraw();
}

function removeIntersect(i) {
  intersectPoints.splice(i, 1);
  renderIntersectList();
  redraw();
}

// ══════════════════════════════════════════════════════════════════════
// SHADE PANEL
// ══════════════════════════════════════════════════════════════════════
function renderShadePanel() {
  const panel = document.getElementById('shadePanel');
  panel.innerHTML = '';
  SHADE_DEFS.forEach(sd => {
    const div = document.createElement('div');
    div.className = 'shade-item' + (activeShades[sd.id] ? ' on' : '');
    div.innerHTML = `
      <div class="shade-swatch" style="background:${sd.color};opacity:.7"></div>
      <span class="shade-name">${sd.name}</span>
    `;
    div.onclick = () => {
      activeShades[sd.id] = !activeShades[sd.id];
      div.classList.toggle('on', activeShades[sd.id]);
      redraw();
    };
    panel.appendChild(div);
  });
}

// ══════════════════════════════════════════════════════════════════════
// TEXT MODE & FLOATING TEXTS
// ══════════════════════════════════════════════════════════════════════
function toggleTextMode() {
  textMode = !textMode;
  document.getElementById('addTextBtn').textContent = textMode ? '✕ Exit Text Mode' : '✎ Add Text';
  document.getElementById('addTextBtn').style.background = textMode ? 'var(--accent2)' : '';
  wrap.classList.toggle('text-mode', textMode);
}

canvas.addEventListener('click', (e) => {
  if (!textMode) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  createFloatingText(x, y);
});

function createFloatingText(x, y, text = '') {
  const el = document.createElement('div');
  el.contentEditable = 'true';
  el.className = 'floating-text';
  el.style.left = (canvas.offsetLeft + x) + 'px';
  el.style.top  = (canvas.offsetTop  + y) + 'px';
  el.textContent = text || 'Label';

  // drag support
  let isDragging = false;
  el.addEventListener('mousedown', (e) => {
    if (e.target !== el) return;
    selectedText = el;
    isDragging = true;
    dragOffX = e.clientX - el.offsetLeft;
    dragOffY = e.clientY - el.offsetTop;
    e.preventDefault();
  });

  el.addEventListener('focus', () => {
    selectedText = el;
    document.querySelectorAll('.floating-text').forEach(t => t.classList.remove('selected-ft'));
    el.classList.add('selected-ft');
  });

  wrap.appendChild(el);
  floatingTexts.push(el);
  el.focus();
  document.execCommand('selectAll');
}

document.addEventListener('mousemove', (e) => {
  if (!draggingText && !document.querySelector('.floating-text:active')) return;
  // handled by mousedown/up on el
});

window.addEventListener('mousemove', (e) => {
  if (!selectedText || !selectedText.dragging) return;
});

// global drag
let _dragEl = null, _dragOX = 0, _dragOY = 0;
document.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('floating-text')) {
    _dragEl = e.target;
    _dragOX = e.clientX - _dragEl.offsetLeft;
    _dragOY = e.clientY - _dragEl.offsetTop;
  }
});
document.addEventListener('mousemove', (e) => {
  if (!_dragEl) return;
  _dragEl.style.left = (e.clientX - _dragOX) + 'px';
  _dragEl.style.top  = (e.clientY - _dragOY) + 'px';
});
document.addEventListener('mouseup', () => { _dragEl = null; });

function clearFloatingTexts() {
  floatingTexts.forEach(el => el.remove());
  floatingTexts = [];
}

// ══════════════════════════════════════════════════════════════════════
// FORMATTING TOOLBAR
// ══════════════════════════════════════════════════════════════════════
function fmt(cmd, val) {
  if (selectedText) {
    selectedText.focus();
    document.execCommand(cmd, false, val || null);
    selectedText.focus();
  } else {
    document.execCommand(cmd, false, val || null);
  }
}

// ══════════════════════════════════════════════════════════════════════
// CANVAS RESIZE
// ══════════════════════════════════════════════════════════════════════
function resizeCanvas() {
  const w = parseInt(document.getElementById('canvasW').value) || 680;
  const h = parseInt(document.getElementById('canvasH').value) || 520;
  canvas.width  = Math.min(Math.max(w, 300), 1200);
  canvas.height = Math.min(Math.max(h, 200), 900);
  redraw();
}

// ══════════════════════════════════════════════════════════════════════
// EXPORT JPEG
// ══════════════════════════════════════════════════════════════════════
function exportJPEG() {
  // Render to offscreen canvas (merging floating text positions)
  const offscreen = document.createElement('canvas');
  offscreen.width  = canvas.width;
  offscreen.height = canvas.height;
  const octx = offscreen.getContext('2d');

  // draw diagram
  octx.drawImage(canvas, 0, 0);

  // render floating texts onto offscreen canvas
  const wrapRect = wrap.getBoundingClientRect();
  const canvRect = canvas.getBoundingClientRect();
  floatingTexts.forEach(el => {
    const elRect = el.getBoundingClientRect();
    const relX   = elRect.left - canvRect.left;
    const relY   = elRect.top  - canvRect.top;
    const styles = window.getComputedStyle(el);
    octx.font      = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
    octx.fillStyle = styles.color || '#1a1a2e';
    octx.textBaseline = 'top';

    // handle innerHTML with basic bold/italic
    const text = el.innerText || el.textContent;
    octx.fillText(text, relX, relY);
  });

  const link = document.createElement('a');
  link.download = 'econ-diagram.jpg';
  link.href = offscreen.toDataURL('image/jpeg', 0.95);
  link.click();
}

// ══════════════════════════════════════════════════════════════════════
// RESET
// ══════════════════════════════════════════════════════════════════════
function resetDiagram() {
  curves = [];
  intersectPoints = [];
  activeShades = {};
  selectedCurveIdx = -1;
  clearFloatingTexts();
  document.getElementById('curveControls').style.display = 'none';
  renderCurveList();
  renderIntersectList();
  renderShadePanel();
  redraw();
}

// ══════════════════════════════════════════════════════════════════════
// CANVAS CLICK TO SELECT CURVE
// ══════════════════════════════════════════════════════════════════════
canvas.addEventListener('click', (e) => {
  if (textMode) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const gW = canvas.width - PAD.left - PAD.right;
  const gH = canvas.height - PAD.top - PAD.bottom;

  // find nearest curve
  let bestIdx = -1, bestDist = 12;
  curves.forEach((c, i) => {
    if (!c.visible) return;
    const pts = getCurvePoints(c, gW, gH);
    pts.forEach(([px, py]) => {
      const d = Math.hypot(px - mx, py - my);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
  });

  if (bestIdx >= 0) {
    selectCurve(bestIdx);
  } else {
    selectedCurveIdx = -1;
    document.getElementById('curveControls').style.display = 'none';
    renderCurveList();
    redraw();
  }
});

// ══════════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════════
renderShadePanel();
loadDiagram();
