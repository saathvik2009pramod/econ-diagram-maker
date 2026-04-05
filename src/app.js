// ── STATE ──────────────────────────────────────────────────────────────────
const state = {
  type: 'supply-demand',
  curves: [],
  textObjects: [],
  axisLabels: {},
  selectedTextId: null,
  isDragging: false,
  dragId: null,
  dragOffX: 0, dragOffY: 0,
  shading: true,
};

const DIM = { w: 580, h: 480, padL: 70, padB: 60, padT: 30, padR: 40 };

// ── DIAGRAM CONFIGS ────────────────────────────────────────────────────────
const CONFIGS = {
  'supply-demand': {
    xLabel:'Quantity (Q)', yLabel:'Price (P)', allowNeg:false,
    curves:[
      { id:'D1', kind:'demand', label:'D', color:'#2563eb', shift:0 },
      { id:'S1', kind:'supply', label:'S', color:'#dc2626', shift:0 },
    ]
  },
  'elasticity': {
    xLabel:'Quantity (Q)', yLabel:'Price (P)', allowNeg:false,
    curves:[
      { id:'De', kind:'demand', label:'D (elastic)', color:'#2563eb', shift:0 },
      { id:'Di', kind:'demand-inelastic', label:'D (inelastic)', color:'#7c3aed', shift:80 },
    ]
  },
  'surplus': {
    xLabel:'Quantity (Q)', yLabel:'Price (P)', allowNeg:false,
    curves:[
      { id:'D1', kind:'demand', label:'D', color:'#2563eb', shift:0 },
      { id:'S1', kind:'supply', label:'S', color:'#dc2626', shift:0 },
    ]
  },
  'tax': {
    xLabel:'Quantity (Q)', yLabel:'Price (P)', allowNeg:false,
    curves:[
      { id:'D1', kind:'demand', label:'D', color:'#2563eb', shift:0 },
      { id:'S1', kind:'supply', label:'S (pre-tax)', color:'#dc2626', shift:0 },
      { id:'S2', kind:'supply', label:'S (post-tax)', color:'#f97316', shift:-70 },
    ]
  },
  'subsidy': {
    xLabel:'Quantity (Q)', yLabel:'Price (P)', allowNeg:false,
    curves:[
      { id:'D1', kind:'demand', label:'D', color:'#2563eb', shift:0 },
      { id:'S1', kind:'supply', label:'S (pre-subsidy)', color:'#dc2626', shift:0 },
      { id:'S2', kind:'supply', label:'S (post-subsidy)', color:'#16a34a', shift:70 },
    ]
  },
  'price-ceiling': {
    xLabel:'Quantity (Q)', yLabel:'Price (P)', allowNeg:false,
    curves:[
      { id:'D1', kind:'demand', label:'D', color:'#2563eb', shift:0 },
      { id:'S1', kind:'supply', label:'S', color:'#dc2626', shift:0 },
    ]
  },
  'price-floor': {
    xLabel:'Quantity (Q)', yLabel:'Price (P)', allowNeg:false,
    curves:[
      { id:'D1', kind:'demand', label:'D', color:'#2563eb', shift:0 },
      { id:'S1', kind:'supply', label:'S', color:'#dc2626', shift:0 },
    ]
  },
  'externality-neg': {
    xLabel:'Quantity (Q)', yLabel:'Price / Cost / Benefit (P)', allowNeg:false,
    curves:[
      { id:'MPB', kind:'demand', label:'MPB', color:'#2563eb', shift:0 },
      { id:'MPC', kind:'supply', label:'MPC', color:'#dc2626', shift:0 },
      { id:'MSC', kind:'supply', label:'MSC', color:'#7c3aed', shift:-60 },
    ]
  },
  'externality-pos': {
    xLabel:'Quantity (Q)', yLabel:'Price / Cost / Benefit (P)', allowNeg:false,
    curves:[
      { id:'MPC', kind:'supply', label:'MPC=MSC', color:'#dc2626', shift:0 },
      { id:'MPB', kind:'demand', label:'MPB', color:'#2563eb', shift:0 },
      { id:'MSB', kind:'demand', label:'MSB', color:'#16a34a', shift:60 },
    ]
  },
  'monopoly': {
    xLabel:'Quantity (Q)', yLabel:'Price / Cost (P)', allowNeg:true,
    curves:[
      { id:'AR', kind:'demand', label:'AR=D', color:'#2563eb', shift:0 },
      { id:'MR', kind:'mr', label:'MR', color:'#0891b2', shift:0 },
      { id:'MC', kind:'mc', label:'MC', color:'#dc2626', shift:0 },
      { id:'AC', kind:'ac', label:'AC', color:'#f97316', shift:0 },
    ]
  },
  'perfect-comp': {
    xLabel:'Quantity (Q)', yLabel:'Price / Cost (P)', allowNeg:false,
    curves:[
      { id:'AR', kind:'ar-flat', label:'AR=MR=D', color:'#2563eb', shift:0 },
      { id:'MC', kind:'mc', label:'MC', color:'#dc2626', shift:0 },
      { id:'AC', kind:'ac', label:'AC', color:'#f97316', shift:0 },
    ]
  },
  'costs': {
    xLabel:'Output (Q)', yLabel:'Cost / Revenue (£)', allowNeg:false,
    curves:[
      { id:'MC', kind:'mc', label:'MC', color:'#dc2626', shift:0 },
      { id:'AC', kind:'ac', label:'AC', color:'#f97316', shift:0 },
      { id:'AR', kind:'demand', label:'AR=D', color:'#2563eb', shift:0 },
      { id:'MR', kind:'mr', label:'MR', color:'#0891b2', shift:0 },
    ]
  },
  'ad-as': {
    xLabel:'Real GDP (Y)', yLabel:'Price Level (P)', allowNeg:false,
    curves:[
      { id:'AD', kind:'demand', label:'AD', color:'#2563eb', shift:0 },
      { id:'SRAS', kind:'supply', label:'SRAS', color:'#dc2626', shift:0 },
      { id:'LRAS', kind:'lras', label:'LRAS', color:'#16a34a', shift:0 },
    ]
  },
  'phillips': {
    xLabel:'Unemployment (%)', yLabel:'Inflation (%)', allowNeg:false,
    curves:[
      { id:'SPC', kind:'phillips', label:'SRPC', color:'#2563eb', shift:0 },
      { id:'LPC', kind:'lrpc', label:'LRPC', color:'#dc2626', shift:0 },
    ]
  },
  'ppf': {
    xLabel:'Good X', yLabel:'Good Y', allowNeg:false,
    curves:[
      { id:'PPF1', kind:'ppf', label:'PPF', color:'#2563eb', shift:0 },
    ]
  },
  'demand-pull': {
    xLabel:'Real GDP (Y)', yLabel:'Price Level (P)', allowNeg:false,
    curves:[
      { id:'AD1', kind:'demand', label:'AD₁', color:'#2563eb', shift:0 },
      { id:'AD2', kind:'demand', label:'AD₂', color:'#0891b2', shift:80 },
      { id:'AS1', kind:'supply', label:'AS', color:'#dc2626', shift:0 },
    ]
  },
  'cost-push': {
    xLabel:'Real GDP (Y)', yLabel:'Price Level (P)', allowNeg:false,
    curves:[
      { id:'AD1', kind:'demand', label:'AD', color:'#2563eb', shift:0 },
      { id:'AS1', kind:'supply', label:'SRAS₁', color:'#dc2626', shift:0 },
      { id:'AS2', kind:'supply', label:'SRAS₂', color:'#f97316', shift:-70 },
    ]
  },
  'labour': {
    xLabel:'Labour (L)', yLabel:'Wage (W)', allowNeg:false,
    curves:[
      { id:'Ld', kind:'demand', label:'Dₗ', color:'#2563eb', shift:0 },
      { id:'Ls', kind:'supply', label:'Sₗ', color:'#dc2626', shift:0 },
    ]
  },
};

// ── MATH HELPERS ────────────────────────────────────────────────────────────
const X0 = () => DIM.padL;
const Y0 = () => DIM.h - DIM.padB;
const XE = () => DIM.w - DIM.padR;
const YT = () => DIM.padT;

function clipLine(slope, c, allowNeg) {
  const x1 = X0(), yAtX1 = slope * 0 + c;
  const x2 = XE(), yAtX2 = slope * (x2 - X0()) + c;
  let pts = [[x1, yAtX1], [x2, yAtX2]];
  pts = clipSeg(pts, 'top', YT());
  if (!allowNeg) pts = clipSeg(pts, 'bottom', Y0());
  pts = clipSeg(pts, 'right', XE());
  pts = clipSeg(pts, 'left', X0());
  return pts;
}

function clipSeg([[x1,y1],[x2,y2]], side, val) {
  const inside = p => side==='top'?p[1]>=val:side==='bottom'?p[1]<=val:side==='right'?p[0]<=val:p[0]>=val;
  if (inside([x1,y1]) && inside([x2,y2])) return [[x1,y1],[x2,y2]];
  if (!inside([x1,y1]) && !inside([x2,y2])) return [[x1,y1],[x2,y2]];
  const t = (side==='top'||side==='bottom') ? (val-y1)/(y2-y1) : (val-x1)/(x2-x1);
  const ix = x1+t*(x2-x1), iy = y1+t*(y2-y1);
  if (!inside([x1,y1])) return [[ix,iy],[x2,y2]];
  return [[x1,y1],[ix,iy]];
}

function intersection(s1, c1, s2, c2) {
  if (Math.abs(s1-s2) < 0.0001) return null;
  const rx = (c2-c1)/(s1-s2);
  const ry = s1*rx + c1;
  return { rx, ry, ax: X0()+rx, ay: ry };
}

function curvePoints(curve, allowNeg) {
  switch(curve.kind) {
    case 'demand': case 'demand-inelastic': {
      const sl = curve.kind === 'demand-inelastic' ? -0.3 : -0.8;
      const c = 110 + curve.shift;
      return { pts: clipLine(sl, c, allowNeg), slope: sl, c };
    }
    case 'supply': {
      const c = 370 - curve.shift;
      return { pts: clipLine(0.8, c, allowNeg), slope: 0.8, c };
    }
    case 'lras': {
      const xPos = X0() + 250 + curve.shift * 0.5;
      return { pts: [[xPos, YT()],[xPos, Y0()]], slope: Infinity, c: xPos, vertical: true };
    }
    case 'lrpc': {
      const xPos = X0() + 180 + curve.shift * 0.5;
      return { pts: [[xPos, YT()],[xPos, Y0()]], slope: Infinity, c: xPos, vertical: true };
    }
    case 'phillips': {
      return { pts: [[X0(), Y0()-30+curve.shift],[XE(), YT()+30+curve.shift]], slope:-0.6, c: Y0()-30+curve.shift };
    }
    case 'mr': {
      const c = 110;
      return { pts: clipLine(-1.6, c, true), slope: -1.6, c };
    }
    case 'ar-flat': {
      const yVal = 180 + curve.shift;
      return { pts: [[X0(), yVal],[XE(), yVal]], slope: 0, c: yVal, flat: true };
    }
    case 'mc': return { kind:'mc', shift: curve.shift };
    case 'ac': return { kind:'ac', shift: curve.shift };
    case 'ppf': return { kind:'ppf', shift: curve.shift };
    default: return { pts: [[X0(),Y0()],[XE(),YT()]], slope: 0.8, c: 370 };
  }
}

function mcPath(shift) {
  const cx=X0(), cy=Y0(), s=shift*0.5;
  return `M${cx},${cy-40+s} Q${cx+120},${cy-120+s} ${cx+150},${cy-180+s} Q${cx+210},${cy-240+s} ${XE()-20},${YT()+20+s}`;
}
function acPath(shift) {
  const cx=X0(), cy=Y0(), s=shift*0.5;
  return `M${cx},${cy-100+s} Q${cx+140},${cy-210+s} ${cx+170},${cy-190+s} Q${cx+230},${cy-170+s} ${XE()-20},${cy-40+s}`;
}
function ppfPath(shift) {
  const cx=X0(), cy=Y0(), r=280+shift*0.5;
  return `M${cx},${cy-r} Q${cx+r*0.8},${cy-r*0.3} ${cx+r},${cy}`;
}

// ── RENDER ─────────────────────────────────────────────────────────────────
function render() {
  const cfg = CONFIGS[state.type];
  const allowNeg = cfg.allowNeg;
  let svg = `<svg id="mainSvg" width="${DIM.w}" height="${DIM.h}" xmlns="http://www.w3.org/2000/svg" style="cursor:crosshair">`;
  svg += `<rect width="${DIM.w}" height="${DIM.h}" fill="white"/>`;
  svg += renderGrid();
  svg += renderShading(cfg);
  svg += renderAxes(cfg);
  svg += renderCurves(cfg, allowNeg);
  svg += renderIntersections(cfg, allowNeg);
  svg += renderSpecialOverlays(cfg, allowNeg);
  svg += renderTextObjects();
  svg += `</svg>`;
  document.getElementById('graph-container').innerHTML = svg;
  bindTextDrag();
  bindCurveClick();
  renderAxisInputs(cfg, allowNeg);
}

function renderGrid() {
  let s = '';
  for (let i=1; i<=5; i++) {
    const x = X0() + (XE()-X0()) * i / 6;
    const y = YT() + (Y0()-YT()) * i / 6;
    s += `<line x1="${x}" y1="${YT()}" x2="${x}" y2="${Y0()}" stroke="#f0f0f0" stroke-width="1"/>`;
    s += `<line x1="${X0()}" y1="${y}" x2="${XE()}" y2="${y}" stroke="#f0f0f0" stroke-width="1"/>`;
  }
  return s;
}

function renderAxes() {
  let s = '';
  s += `<line x1="${X0()}" y1="${Y0()}" x2="${XE()+10}" y2="${Y0()}" class="axis-line"/>`;
  s += `<polygon points="${XE()+10},${Y0()-4} ${XE()+18},${Y0()} ${XE()+10},${Y0()+4}" class="axis-arrow"/>`;
  s += `<line x1="${X0()}" y1="${Y0()}" x2="${X0()}" y2="${YT()-10}" class="axis-line"/>`;
  s += `<polygon points="${X0()-4},${YT()-10} ${X0()},${YT()-18} ${X0()+4},${YT()-10}" class="axis-arrow"/>`;
  s += `<text x="${X0()-14}" y="${Y0()+16}" font-size="13" font-family="Inter,sans-serif" fill="#444">O</text>`;
  return s;
}

function renderCurves(cfg, allowNeg) {
  let s = '';
  state.curves.forEach((curve, i) => {
    if (!curve.visible) return;
    const cp = curvePoints(curve, allowNeg);
    if (curve.kind === 'mc') {
      s += `<path d="${mcPath(curve.shift)}" stroke="${curve.color}" class="curve-line" data-id="${curve.id}"/>`;
      s += `<text x="${XE()-15}" y="${YT()+20+curve.shift*0.5}" fill="${curve.color}" font-size="13" font-weight="bold" font-family="Inter,sans-serif">${curve.label}</text>`;
    } else if (curve.kind === 'ac') {
      s += `<path d="${acPath(curve.shift)}" stroke="${curve.color}" class="curve-line" data-id="${curve.id}"/>`;
      s += `<text x="${XE()-10}" y="${Y0()-40+curve.shift*0.5}" fill="${curve.color}" font-size="13" font-weight="bold" font-family="Inter,sans-serif">${curve.label}</text>`;
    } else if (curve.kind === 'ppf') {
      s += `<path d="${ppfPath(curve.shift)}" stroke="${curve.color}" class="curve-line" data-id="${curve.id}"/>`;
      const r = 280+curve.shift*0.5;
      s += `<text x="${X0()+r*0.55}" y="${Y0()-r*0.55}" fill="${curve.color}" font-size="13" font-weight="bold" font-family="Inter,sans-serif">${curve.label}</text>`;
    } else if (cp.pts) {
      const [[x1,y1],[x2,y2]] = cp.pts;
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${curve.color}" class="curve-line" data-id="${curve.id}"/>`;
      s += `<text x="${x2+5}" y="${y2+4}" fill="${curve.color}" font-size="13" font-weight="bold" font-family="Inter,sans-serif">${curve.label}</text>`;
    }
  });
  return s;
}

function renderIntersections(cfg, allowNeg) {
  let s = '';
  const demands = state.curves.filter(c => ['demand','demand-inelastic','mr','ar-flat'].includes(c.kind));
  const supplies = state.curves.filter(c => c.kind === 'supply');
  let eqIdx = 1;
  demands.forEach(d => {
    supplies.forEach(sup => {
      const dp = curvePoints(d, allowNeg), sp = curvePoints(sup, allowNeg);
      if (!dp.pts || !sp.pts) return;
      const eq = intersection(dp.slope, dp.c, sp.slope, sp.c);
      if (!eq) return;
      const { ax, ay } = eq;
      if (ax < X0() || ax > XE() || ay < YT() || ay > Y0()+5) return;
      s += `<line x1="${X0()}" y1="${ay}" x2="${ax}" y2="${ay}" class="projection"/>`;
      s += `<line x1="${ax}" y1="${Y0()}" x2="${ax}" y2="${ay}" class="projection"/>`;
      s += `<circle cx="${ax}" cy="${ay}" r="4.5" class="eq-dot"/>`;
      if (!state.axisLabels[`Px${eqIdx}`]) state.axisLabels[`Px${eqIdx}`] = `P${eqIdx===1?'':eqIdx}`;
      if (!state.axisLabels[`Qx${eqIdx}`]) state.axisLabels[`Qx${eqIdx}`] = `Q${eqIdx===1?'':eqIdx}`;
      eqIdx++;
    });
  });
  // LRAS intersections
  const lrasCurves = state.curves.filter(c => c.kind === 'lras');
  const adCurves = state.curves.filter(c => c.kind === 'demand');
  lrasCurves.forEach(lr => {
    const lrx = X0()+250+lr.shift*0.5;
    adCurves.forEach(ad => {
      const adp = curvePoints(ad, allowNeg);
      if (!adp.pts) return;
      const [[ax1,ay1],[ax2,ay2]] = adp.pts;
      const t = (lrx-ax1)/(ax2-ax1);
      if (t<0||t>1) return;
      const iy = ay1+t*(ay2-ay1);
      if (iy<YT()||iy>Y0()) return;
      s += `<line x1="${X0()}" y1="${iy}" x2="${lrx}" y2="${iy}" class="projection"/>`;
      s += `<line x1="${lrx}" y1="${Y0()}" x2="${lrx}" y2="${iy}" class="projection"/>`;
      s += `<circle cx="${lrx}" cy="${iy}" r="4.5" class="eq-dot"/>`;
    });
  });
  return s;
}

function renderShading(cfg) {
  if (!state.shading) return '';
  let s = '';
  const demands = state.curves.filter(c => c.kind==='demand');
  const supplies = state.curves.filter(c => c.kind==='supply');
  const type = state.type;

  if (['supply-demand','labour','ad-as','demand-pull','cost-push'].includes(type) && demands.length && supplies.length) {
    const dp = curvePoints(demands[0], false), sp = curvePoints(supplies[0], false);
    if (dp.pts && sp.pts) {
      const eq = intersection(dp.slope, dp.c, sp.slope, sp.c);
      if (eq && eq.ax>=X0() && eq.ax<=XE()) {
        s += `<polygon points="${X0()},${dp.c} ${eq.ax},${eq.ay} ${X0()},${eq.ay}" fill="#3b82f6" class="shade-region"/>`;
        s += `<polygon points="${X0()},${sp.c} ${eq.ax},${eq.ay} ${X0()},${eq.ay}" fill="#ef4444" class="shade-region"/>`;
      }
    }
  }
  if (type==='surplus' && demands.length && supplies.length) {
    const dp = curvePoints(demands[0], false), sp = curvePoints(supplies[0], false);
    if (dp.pts && sp.pts) {
      const eq = intersection(dp.slope, dp.c, sp.slope, sp.c);
      if (eq) {
        s += `<polygon points="${X0()},${dp.c} ${eq.ax},${eq.ay} ${X0()},${eq.ay}" fill="#3b82f6" opacity="0.28"/>`;
        s += `<polygon points="${X0()},${sp.c} ${eq.ax},${eq.ay} ${X0()},${eq.ay}" fill="#ef4444" opacity="0.28"/>`;
      }
    }
  }
  if (type==='tax' && demands.length && supplies.length>=2) {
    const dp=curvePoints(demands[0],false), s1p=curvePoints(supplies[0],false), s2p=curvePoints(supplies[1],false);
    const eq1=intersection(dp.slope,dp.c,s1p.slope,s1p.c), eq2=intersection(dp.slope,dp.c,s2p.slope,s2p.c);
    if (eq1&&eq2) {
      s += `<polygon points="${eq2.ax},${eq2.ay} ${eq2.ax},${eq1.ay} ${X0()},${eq1.ay} ${X0()},${eq2.ay}" fill="#f59e0b" opacity="0.25"/>`;
      s += `<polygon points="${eq2.ax},${eq2.ay} ${eq1.ax},${eq1.ay} ${eq2.ax},${eq1.ay}" fill="#ef4444" opacity="0.25"/>`;
    }
  }
  if (type==='subsidy' && demands.length && supplies.length>=2) {
    const dp=curvePoints(demands[0],false), s1p=curvePoints(supplies[0],false), s2p=curvePoints(supplies[1],false);
    const eq1=intersection(dp.slope,dp.c,s1p.slope,s1p.c), eq2=intersection(dp.slope,dp.c,s2p.slope,s2p.c);
    if (eq1&&eq2) {
      s += `<polygon points="${eq1.ax},${eq1.ay} ${eq2.ax},${eq2.ay} ${eq2.ax},${eq1.ay}" fill="#16a34a" opacity="0.2"/>`;
    }
  }
  if (['externality-neg','externality-pos'].includes(type) && demands.length && supplies.length>=2) {
    const dp=curvePoints(demands[0],false), s1p=curvePoints(supplies[0],false), s2p=curvePoints(supplies[1],false);
    const eq1=intersection(dp.slope,dp.c,s1p.slope,s1p.c), eq2=intersection(dp.slope,dp.c,s2p.slope,s2p.c);
    if (eq1&&eq2) {
      s += `<polygon points="${eq1.ax},${eq1.ay} ${eq2.ax},${eq2.ay} ${eq1.ax},${eq2.ay}" fill="#f59e0b" opacity="0.3"/>`;
    }
  }
  return s;
}

function renderSpecialOverlays(cfg, allowNeg) {
  let s = `<defs><marker id="arrow-red" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#dc2626"/></marker></defs>`;
  const demands = state.curves.filter(c => c.kind==='demand');
  const supplies = state.curves.filter(c => c.kind==='supply');
  if (!demands.length || !supplies.length) return s;
  const dp=curvePoints(demands[0],allowNeg), sp=curvePoints(supplies[0],allowNeg);
  if (!dp.pts||!sp.pts) return s;
  const eq=intersection(dp.slope,dp.c,sp.slope,sp.c);
  if (!eq) return s;
  const {ax,ay}=eq;
  if (state.type==='price-ceiling') {
    const capY=ay-55;
    s += `<line x1="${X0()}" y1="${capY}" x2="${XE()}" y2="${capY}" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 3"/>`;
    s += `<text x="${XE()-60}" y="${capY-6}" fill="#dc2626" font-size="12" font-family="Inter,sans-serif">Price Ceiling</text>`;
    s += `<text x="${ax-20}" y="${capY+16}" fill="#dc2626" font-size="11" font-family="Inter,sans-serif">← Shortage →</text>`;
  }
  if (state.type==='price-floor') {
    const floorY=ay+55;
    s += `<line x1="${X0()}" y1="${floorY}" x2="${XE()}" y2="${floorY}" stroke="#16a34a" stroke-width="2" stroke-dasharray="6 3"/>`;
    s += `<text x="${XE()-55}" y="${floorY-6}" fill="#16a34a" font-size="12" font-family="Inter,sans-serif">Price Floor</text>`;
    s += `<text x="${ax-20}" y="${floorY+16}" fill="#16a34a" font-size="11" font-family="Inter,sans-serif">← Surplus →</text>`;
  }
  return s;
}

function renderTextObjects() {
  let s = '';
  state.textObjects.forEach(obj => {
    const fw=obj.style.bold?'bold':'normal';
    const fs=obj.style.italic?'italic':'normal';
    const sz=obj.style.size||14;
    const col=obj.style.color||'#222';
    const sel=state.selectedTextId===obj.id;
    if (obj.style.sub) {
      const match=obj.text.match(/^(.*?)_(.+)$/);
      if (match) {
        s += `<text x="${obj.x}" y="${obj.y}" font-weight="${fw}" font-style="${fs}" font-size="${sz}" fill="${col}" font-family="Inter,sans-serif" class="graph-label${sel?' selected':''}" data-tid="${obj.id}">${match[1]}<tspan dy="4" font-size="${sz*0.75}">${match[2]}</tspan></text>`;
        return;
      }
    }
    s += `<text x="${obj.x}" y="${obj.y}" font-weight="${fw}" font-style="${fs}" font-size="${sz}" fill="${col}" font-family="Inter,sans-serif" class="graph-label${sel?' selected':''}" data-tid="${obj.id}">${obj.text}</text>`;
  });
  return s;
}

// ── AXIS LABEL INPUTS ──────────────────────────────────────────────────────
function renderAxisInputs(cfg, allowNeg) {
  const overlay = document.getElementById('axis-overlay');
  overlay.innerHTML = '';
  const demands = state.curves.filter(c => ['demand','demand-inelastic','ar-flat'].includes(c.kind));
  const supplies = state.curves.filter(c => c.kind==='supply');
  const wrap = document.getElementById('graph-wrap');
  const wrapRect = wrap.getBoundingClientRect();
  const svgEl = document.getElementById('mainSvg');
  const svgRect = svgEl ? svgEl.getBoundingClientRect() : wrapRect;
  const offX = svgRect.left - wrapRect.left;
  const offY = svgRect.top - wrapRect.top;

  let eqIdx = 1;
  demands.forEach(d => {
    supplies.forEach(sup => {
      const dp=curvePoints(d,allowNeg), sp=curvePoints(sup,allowNeg);
      if (!dp.pts||!sp.pts) return;
      const eq=intersection(dp.slope,dp.c,sp.slope,sp.c);
      if (!eq) return;
      const {ax,ay}=eq;
      if (ax<X0()||ax>XE()||ay<YT()||ay>Y0()+5) return;
      addInput(overlay, X0()-58+offX, ay-9+offY, `Px${eqIdx}`, state.axisLabels[`Px${eqIdx}`]||`P${eqIdx===1?'':eqIdx}`);
      addInput(overlay, ax-22+offX, Y0()+12+offY, `Qx${eqIdx}`, state.axisLabels[`Qx${eqIdx}`]||`Q${eqIdx===1?'':eqIdx}`);
      eqIdx++;
    });
  });
  addInput(overlay, X0()-55+offX, YT()+10+offY, 'yaxislabel', state.axisLabels['yaxislabel']||cfg.yLabel||'P', true);
  addInput(overlay, XE()-40+offX, Y0()+24+offY, 'xaxislabel', state.axisLabels['xaxislabel']||cfg.xLabel||'Q', true);
}

function addInput(overlay, x, y, key, defaultVal, wide) {
  const inp = document.createElement('input');
  inp.className = 'axis-input';
  inp.style.left = x+'px';
  inp.style.top = y+'px';
  if (wide) inp.style.width = '120px';
  inp.value = state.axisLabels[key]!==undefined ? state.axisLabels[key] : defaultVal;
  inp.dataset.key = key;
  inp.addEventListener('input', e => { state.axisLabels[key] = e.target.value; });
  inp.addEventListener('focus', () => inp.style.borderBottomColor='#01696f');
  inp.addEventListener('blur', () => inp.style.borderBottomColor='#ccc');
  overlay.appendChild(inp);
}

// ── DRAG TEXT ──────────────────────────────────────────────────────────────
function bindTextDrag() {
  const svg = document.getElementById('mainSvg');
  if (!svg) return;
  svg.addEventListener('mousedown', e => {
    const el = e.target.closest('[data-tid]');
    if (el) {
      state.isDragging = true;
      state.dragId = el.getAttribute('data-tid');
      state.selectedTextId = state.dragId;
      const obj = state.textObjects.find(t => t.id===state.dragId);
      if (obj) {
        const rect = svg.getBoundingClientRect();
        state.dragOffX = e.clientX-rect.left-obj.x;
        state.dragOffY = e.clientY-rect.top-obj.y;
      }
      updateToolbarState(); render(); e.preventDefault();
    } else {
      state.selectedTextId = null; updateToolbarState();
    }
  });
  document.addEventListener('mousemove', e => {
    if (!state.isDragging||!state.dragId) return;
    const svg = document.getElementById('mainSvg');
    const rect = svg.getBoundingClientRect();
    const obj = state.textObjects.find(t => t.id===state.dragId);
    if (obj) { obj.x=e.clientX-rect.left-state.dragOffX; obj.y=e.clientY-rect.top-state.dragOffY; render(); }
  });
  document.addEventListener('mouseup', () => { state.isDragging=false; state.dragId=null; });
  svg.addEventListener('click', e => {
    if (e.target.closest('[data-tid]')||e.target.closest('[data-id]')||state.isDragging) return;
    const rect=svg.getBoundingClientRect();
    const x=e.clientX-rect.left, y=e.clientY-rect.top;
    const txt=prompt('Enter label (use _ for subscript, e.g. P_e):');
    if (txt&&txt.trim()) {
      state.textObjects.push({ id:'txt-'+Date.now(), x, y, text:txt.trim(), style:{bold:false,italic:false,sub:txt.includes('_'),size:14,color:'#222'} });
      render();
    }
  });
}

function bindCurveClick() {
  document.querySelectorAll('[data-id]').forEach(el => {
    el.addEventListener('click', e => {
      const curve=state.curves.find(c=>c.id===el.getAttribute('data-id'));
      if (!curve) return;
      const inp=document.createElement('input'); inp.type='color'; inp.value=curve.color;
      inp.oninput=ev=>{curve.color=ev.target.value; buildSidebar(); render();};
      inp.click(); e.stopPropagation();
    });
  });
}

// ── TOOLBAR ────────────────────────────────────────────────────────────────
function updateToolbarState() {
  const obj = state.textObjects.find(t=>t.id===state.selectedTextId);
  const hint = document.getElementById('toolbar-hint');
  if (hint) hint.textContent = obj ? `Editing: "${obj.text}"` : 'Click a label on the graph to select it';
  document.getElementById('tb-bold').classList.toggle('active',!!(obj&&obj.style.bold));
  document.getElementById('tb-italic').classList.toggle('active',!!(obj&&obj.style.italic));
  document.getElementById('tb-sub').classList.toggle('active',!!(obj&&obj.style.sub));
  if (obj) {
    document.getElementById('toolbar-fontsize').value=obj.style.size||14;
    document.getElementById('toolbar-color').value=obj.style.color||'#222222';
  }
}

function applyStyle(type) {
  const obj=state.textObjects.find(t=>t.id===state.selectedTextId);
  if (!obj&&type!=='delete') return;
  switch(type) {
    case 'bold':   obj.style.bold=!obj.style.bold; break;
    case 'italic': obj.style.italic=!obj.style.italic; break;
    case 'sub':    obj.style.sub=!obj.style.sub; break;
    case 'size':   obj.style.size=parseInt(document.getElementById('toolbar-fontsize').value)||14; break;
    case 'color':  obj.style.color=document.getElementById('toolbar-color').value; break;
    case 'delete': state.textObjects=state.textObjects.filter(t=>t.id!==state.selectedTextId); state.selectedTextId=null; break;
  }
  updateToolbarState(); render();
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────
function buildSidebar() {
  const body = document.getElementById('sidebar-body');
  const groups = [
    { label:'Demand / Revenue Curves', kinds:['demand','demand-inelastic','mr','ar-flat','phillips','ppf'] },
    { label:'Supply / Cost Curves',    kinds:['supply','lras','lrpc','mc','ac'] },
  ];
  let html = '';
  groups.forEach(group => {
    const curves=state.curves.filter(c=>group.kinds.includes(c.kind));
    if (!curves.length) return;
    html += `<div class="sidebar-section"><div class="sidebar-section-title">${group.label}</div>`;
    curves.forEach(curve => {
      html += `<div class="curve-item">
        <div class="curve-color-btn" style="background:${curve.color}" onclick="pickCurveColor('${curve.id}')" title="Change color"></div>
        <span class="curve-label">${curve.label}</span>
        <div class="curve-shift-wrap">
          <input type="range" min="-120" max="120" value="${curve.shift}" oninput="updateShift('${curve.id}',this.value)">
          <span class="shift-val">${curve.shift>0?'+':''}${curve.shift}</span>
        </div>
        <button class="icon-btn" onclick="removeCurve('${curve.id}')" title="Remove curve">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>`;
    });
    html += `</div>`;
  });
  body.innerHTML = html;
}

window.pickCurveColor = id => {
  const inp=document.createElement('input'); inp.type='color';
  const curve=state.curves.find(c=>c.id===id); if (curve) inp.value=curve.color;
  inp.oninput=e=>{if(curve){curve.color=e.target.value;buildSidebar();render();}};
  inp.click();
};
window.updateShift = (id,val) => {
  const curve=state.curves.find(c=>c.id===id);
  if (curve){curve.shift=parseInt(val);buildSidebar();render();}
};
window.removeCurve = id => { state.curves=state.curves.filter(c=>c.id!==id); buildSidebar(); render(); };

// ── AUTO-SIZE & EXPORT ─────────────────────────────────────────────────────
function autoSize() {
  const cfg=CONFIGS[state.type];
  state.curves.forEach((c,i)=>{ if(cfg.curves[i]) c.shift=cfg.curves[i].shift; });
  buildSidebar(); render();
}

function exportJpeg() {
  const svg=document.getElementById('mainSvg'); if (!svg) return;
  const svgClone=svg.cloneNode(true);
  document.querySelectorAll('#axis-overlay .axis-input').forEach(inp => {
    const svgRect=svg.getBoundingClientRect();
    const wrapRect=document.getElementById('graph-wrap').getBoundingClientRect();
    const inpRect=inp.getBoundingClientRect();
    const x=inpRect.left-svgRect.left+inpRect.width/2;
    const y=inpRect.top-svgRect.top+12;
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x',x); t.setAttribute('y',y);
    t.setAttribute('font-size','12'); t.setAttribute('fill','#444');
    t.setAttribute('font-family','Inter,sans-serif'); t.setAttribute('text-anchor','middle');
    t.textContent=inp.value;
    svgClone.appendChild(t);
  });
  const data=new XMLSerializer().serializeToString(svgClone);
  const canvas=document.createElement('canvas');
  const scale=2; canvas.width=DIM.w*scale; canvas.height=DIM.h*scale;
  const ctx=canvas.getContext('2d'); ctx.scale(scale,scale);
  ctx.fillStyle='white'; ctx.fillRect(0,0,DIM.w,DIM.h);
  const blob=new Blob([data],{type:'image/svg+xml;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const img=new Image();
  img.onload=()=>{
    ctx.drawImage(img,0,0,DIM.w,DIM.h); URL.revokeObjectURL(url);
    const a=document.createElement('a');
    a.download=`${state.type}-diagram.jpg`; a.href=canvas.toDataURL('image/jpeg',0.98); a.click();
  };
  img.src=url;
}

// ── INIT ───────────────────────────────────────────────────────────────────
function loadDiagram(type) {
  state.type=type;
  const cfg=CONFIGS[type];
  state.curves=cfg.curves.map(c=>({...c}));
  state.textObjects=[
    {id:'ylabel',x:8,y:DIM.padT+40,text:cfg.yLabel||'P',style:{bold:true,italic:true,size:13,color:'#444'}},
    {id:'xlabel',x:DIM.w-DIM.padR-30,y:DIM.h-10,text:cfg.xLabel||'Q',style:{bold:true,italic:true,size:13,color:'#444'}},
  ];
  state.axisLabels={}; state.selectedTextId=null;
  document.querySelector('.diagram-badge').textContent=cfg.curves.map(c=>c.label).join(', ');
  buildSidebar(); render();
}

function init() {
  const microGrid=document.getElementById('micro-grid');
  const macroGrid=document.getElementById('macro-grid');

  DIAGRAMS.micro.forEach(d => {
    const el=document.createElement('div');
    el.className='diagram-card'+(d.id==='supply-demand'?' active':'');
    el.dataset.type=d.id;
    el.innerHTML=`<h3>${d.label}</h3><p>${d.sub}</p>`;
    el.onclick=()=>{document.querySelectorAll('.diagram-card').forEach(c=>c.classList.remove('active'));el.classList.add('active');state.type=d.id;};
    microGrid.appendChild(el);
  });
  DIAGRAMS.macro.forEach(d => {
    const el=document.createElement('div');
    el.className='diagram-card';
    el.dataset.type=d.id;
    el.innerHTML=`<h3>${d.label}</h3><p>${d.sub}</p>`;
    el.onclick=()=>{document.querySelectorAll('.diagram-card').forEach(c=>c.classList.remove('active'));el.classList.add('active');state.type=d.id;};
    macroGrid.appendChild(el);
  });

  document.getElementById('launch-btn').onclick=()=>{
    document.getElementById('splash').style.display='none';
    document.getElementById('app').classList.add('active');
    loadDiagram(state.type);
  };
  document.getElementById('back-btn').onclick=()=>{
    document.getElementById('splash').style.display='flex';
    document.getElementById('app').classList.remove('active');
  };
  document.getElementById('tb-bold').onclick=()=>applyStyle('bold');
  document.getElementById('tb-italic').onclick=()=>applyStyle('italic');
  document.getElementById('tb-sub').onclick=()=>applyStyle('sub');
  document.getElementById('tb-delete').onclick=()=>applyStyle('delete');
  document.getElementById('toolbar-fontsize').oninput=()=>applyStyle('size');
  document.getElementById('toolbar-color').oninput=()=>applyStyle('color');
  document.getElementById('auto-size-btn').onclick=autoSize;
  document.getElementById('export-btn').onclick=exportJpeg;
  document.getElementById('reset-btn').onclick=()=>loadDiagram(state.type);
  document.getElementById('shade-btn').onclick=()=>{
    state.shading=!state.shading;
    document.getElementById('shade-btn').textContent=state.shading?'◼ Shading On':'◻ Shading Off';
    render();
  };
}

document.addEventListener('DOMContentLoaded', init);
