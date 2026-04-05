// Diagram definitions: all supported IB/IGCSE diagram types
const DIAGRAMS = {
  micro: [
    { id: 'supply-demand',   label: 'Supply & Demand',          sub: 'Equilibrium & shifts' },
    { id: 'elasticity',      label: 'Elasticity',               sub: 'Elastic vs inelastic' },
    { id: 'surplus',         label: 'Consumer/Producer Surplus', sub: 'Shaded areas' },
    { id: 'tax',             label: 'Tax Incidence',            sub: 'Revenue, burden, DWL' },
    { id: 'subsidy',         label: 'Subsidy',                  sub: 'Govt spending, output' },
    { id: 'price-ceiling',   label: 'Price Ceiling',            sub: 'Max price control' },
    { id: 'price-floor',     label: 'Price Floor',              sub: 'Min price control' },
    { id: 'externality-neg', label: 'Negative Externality',     sub: 'MSC > MPC, DWL' },
    { id: 'externality-pos', label: 'Positive Externality',     sub: 'MSB > MPB, DWL' },
    { id: 'monopoly',        label: 'Monopoly',                 sub: 'MC=MR profit max' },
    { id: 'perfect-comp',    label: 'Perfect Competition',      sub: 'Normal/super profit' },
    { id: 'costs',           label: 'Costs & Revenue',          sub: 'MC, AC, AR, MR' },
  ],
  macro: [
    { id: 'ad-as',           label: 'AD-AS Model',              sub: 'Growth & inflation' },
    { id: 'phillips',        label: 'Phillips Curve',           sub: 'Inflation vs unemployment' },
    { id: 'ppf',             label: 'PPF',                      sub: 'Production possibility' },
    { id: 'demand-pull',     label: 'Demand-Pull Inflation',    sub: 'AD shift right' },
    { id: 'cost-push',       label: 'Cost-Push Inflation',      sub: 'SRAS shift left' },
    { id: 'labour',          label: 'Labour Market',            sub: 'Wage determination' },
  ]
};
