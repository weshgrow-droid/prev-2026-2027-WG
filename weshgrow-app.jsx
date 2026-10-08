import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

/* ============================================================
   WESH GROW — Pilotage financier
   Palette: encre (#1C2B22), sauge (#5C7A5E), argile (#B5502F),
   or-safran (#C9962B), lin (#F7F5EF), ardoise (#3A4A42)
   Type: display = "Fraunces", body/data = "Inter", tabular nums
   ============================================================ */

const MONTHS = ["Janv", "Févr", "Mars", "Avril", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
const FARM_KEYS = ["paris", "saintOuen", "marseille"];
const FARM_META = {
  paris: { label: "Paris 18e", accent: "#5C7A5E", tag: "Micro-pousses & fleurs" },
  saintOuen: { label: "Saint-Ouen", accent: "#C9962B", tag: "Herbes aromatiques" },
  marseille: { label: "Marseille", accent: "#3E7A8C", tag: "Micro-pousses" },
};
const FARM_PRODUCTS = {
  paris: ["microS", "microXS", "fleurs"],
  saintOuen: ["herbes"],
  marseille: ["micro"],
};
const PRODUCT_LABEL = {
  microS: "Micro-pousses S (grande barquette, + Metro/JP)",
  microXS: "Micro-pousses XS (petite barquette)",
  fleurs: "Fleurs comestibles",
  herbes: "Herbes aromatiques",
  micro: "Micro-pousses",
};

const SEED_SALES = {
  paris: {
    microS: [43750.88, 37140.53, 41945.93, 43909.55, 46865.11, 56900.05, 57514.3, 35081.11, 52409.36, 49415.93, 45062.66, 52239.07],
    microXS: [27898.22, 27228.17, 34795.66, 39192.65, 33943.09, 44094.02, 43035.7, 26287.89, 39276.64, 36993.07, 33734.34, 39106.93],
    fleurs: [11856, 11981, 18037, 21620, 21623, 29077.35, 27359, 16188, 24075, 20393, 18596, 21558],
  },
  saintOuen: { herbes: [0, 0, 0, 1296, 4115, 16591.7, 15000, 7000, 10000, 0, 0, 0] },
  marseille: { micro: [8203, 9068, 11781, 13924, 13057, 16753.5, 25257, 26148, 20430, 16187, 11731, 13566] },
};
const SEED_IS_REAL = {
  paris: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0].map(Boolean),
  saintOuen: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0].map(Boolean),
  marseille: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0].map(Boolean),
};

const SITE_LABEL = { paris: "Paris 18e", saintOuen: "Saint-Ouen", marseille: "Marseille", transverse: "Transverse (groupe)" };

const flatSalary = (v) => Array(12).fill(v);

const SEED_COLLABORATORS_RAW = [
  { id: "c1", name: "Jasmin A.", site: "paris", salary: flatSalary(2380.34) },
  { id: "c2", name: "Gouablin C.", site: "paris", salary: flatSalary(1989.45) },
  { id: "c3", name: "Fouache A.", site: "paris", salary: flatSalary(2359) },
  { id: "c4", name: "Desjardins L.", site: "paris", salary: flatSalary(4360.56) },
  { id: "c5", name: "Calmonte M.", site: "paris", salary: flatSalary(2457.75) },
  { id: "c6", name: "Wannasiri N.", site: "paris", salary: flatSalary(2064.53) },
  { id: "c7", name: "Vermot-Petit O. A.", site: "paris", salary: flatSalary(2458.48) },
  { id: "c8", name: "Sonko M.", site: "paris", salary: flatSalary(2483.7) },
  { id: "c9", name: "Besnehard M.", site: "paris", salary: flatSalary(4287.24) },
  { id: "c10", name: "Al Nasir Y.", site: "paris", salary: flatSalary(75.82) },
  { id: "c11", name: "Habib N.", site: "saintOuen", salary: flatSalary(2359) },
  { id: "c12", name: "Cabello J.", site: "saintOuen", salary: flatSalary(2568.39) },
  { id: "c13", name: "Bykov D.", site: "saintOuen", salary: flatSalary(2457.71) },
  { id: "c14", name: "Delaporte (Patron)", site: "marseille", salary: flatSalary(2546.41) },
  { id: "c15", name: "Klis Z.", site: "marseille", salary: flatSalary(2931.83) },
  { id: "c16", name: "Couraudon L. (Président)", site: "transverse", salary: flatSalary(7800) },
  { id: "c17", name: "Maussion C. (Commercial)", site: "transverse", salary: flatSalary(3622.01) },
  { id: "c18", name: "Coquet C. (Clientèle)", site: "transverse", salary: flatSalary(4570.73) },
  { id: "c19", name: "Cheynier G. (DG)", site: "transverse", salary: flatSalary(6332.55) },
  { id: "c20", name: "Stagiaire 1 (Paris)", site: "paris", salary: flatSalary(700) },
  { id: "c21", name: "Stagiaire 2 (Paris)", site: "paris", salary: flatSalary(700) },
  { id: "c22", name: "Stagiaire 3 (Paris)", site: "paris", salary: flatSalary(700) },
  { id: "c23", name: "Stagiaire 4 (Paris)", site: "paris", salary: flatSalary(700) },
  { id: "c24", name: "Stagiaire (Saint-Ouen, 0.5 ETP, depuis avril)", site: "saintOuen", salary: [0, 0, 0, 350, 350, 350, 350, 350, 350, 350, 350, 350] },
  { id: "c25", name: "ACAF Charbel (Resp. Horticulture, parti 28/02)", site: "paris", salary: [2274, 2274, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], salary2027: Array(12).fill(0) },
  { id: "c26", name: "Chatti Salma (Assist. Horticulture/R&D, partie 07/05)", site: "paris", salary: [2060, 2060, 2060, 2060, 480, 0, 0, 0, 0, 0, 0, 0], salary2027: Array(12).fill(0) },
];
const SEED_COLLABORATORS_2026 = SEED_COLLABORATORS_RAW.map((c) => ({ ...c, salary: [...c.salary] }));
// The 2027 list starts as an independent copy of the same people/salaries, but from
// here on editing one list (adding, removing, changing a salary) never touches the other.
const SEED_COLLABORATORS_2027 = SEED_COLLABORATORS_RAW.map((c) => ({ ...c, salary: [...(c.salary2027 || c.salary)] }));

const SEED_COST_PARAMS = {
  costRatio: { "paris.microS": 0.0735, "paris.microXS": 0.1365, "paris.fleurs": 0.1627, "saintOuen.herbes": 0.1386, "marseille.micro": 0.1043 },
  transportRatio: { paris: 0.1167, marseille: 0.09785 },
  forfait: { paris: -389.08, saintOuen: -250, marseille: -42.17 },
  // Un seul chiffre par ferme (loyer + eau/électricité + charges locatives +
  // assurance combinés). Saint-Ouen réglé à -1350€/mois (1200€ loyer/eau/élec +
  // 150€ assurance) sur demande.
  structureFixed: { paris: -12739.25, saintOuen: -1350, marseille: -1000 },
  fournituresPool: 7000,
  personnelDirect: { paris: -24775.07, saintOuen: -7432.3, marseille: -4922.31 },
  transversePool: 22729.31,
  externesPool: 12000,
};

// Exact historical figures for the 6 already-closed months (Jan→Juin), taken line-by-line
// from the reconciled ledger. These never move when you edit "Coûts & paramètres" —
// only projected months follow the live parameters above.
const SEED_REAL_ACTUALS = {
  paris: [
    { conso: -8729.42, transport: -10087, divers: -323, structure: -19024.55, personnel: -45486.5, externes: -10901 },
    { conso: -8330.45, transport: -9788, divers: -304, structure: -19876.22, personnel: -45107.84, externes: -10728 },
    { conso: -10602.44, transport: -12316, divers: -375, structure: -18803.44, personnel: -45011.28, externes: -10684 },
    { conso: -12153.4, transport: -11677, divers: -429, structure: -18558.15, personnel: -44639.4, externes: -10480 },
    { conso: -11684.7, transport: -10568, divers: -410, structure: -18528.04, personnel: -44257.47, externes: -10281 },
    { conso: -14740.86, transport: -13292.53, divers: -368, structure: -18417.31, personnel: -42866.46, externes: -9684.58 },
  ],
  saintOuen: [
    { conso: 0, transport: 0, divers: -250, structure: -775, personnel: -7169.8, externes: 0 },
    { conso: 0, transport: 0, divers: -250, structure: -775, personnel: -7169.8, externes: 0 },
    { conso: 0, transport: 0, divers: -250, structure: -775, personnel: -7169.8, externes: 0 },
    { conso: 0, transport: 0, divers: -250, structure: -850, personnel: -7763.76, externes: -129 },
    { conso: 0, transport: 0, divers: -250, structure: -1015, personnel: -8297.87, externes: -411 },
    { conso: -2556.35, transport: 0, divers: -250, structure: -775, personnel: -9827.51, externes: -1080 },
  ],
  marseille: [
    { conso: -868.57, transport: -1286.86, divers: -32, structure: -1621.45, personnel: -6940.19, externes: -1099 },
    { conso: -929.52, transport: -870.67, divers: -34, structure: -1755.78, personnel: -7318.85, externes: -1272 },
    { conso: -1210.05, transport: -1141.9, divers: -43, structure: -1779.56, personnel: -7415.41, externes: -1316 },
    { conso: -1461.08, transport: -1251, divers: -53, structure: -1819.57, personnel: -7543.33, externes: -1391 },
    { conso: -1373.97, transport: -1381, divers: -50, structure: -1760.33, personnel: -7391.15, externes: -1308 },
    { conso: -1747.17, transport: -1191, divers: -42, structure: -1678.63, personnel: -7252.52, externes: -1163.33 },
  ],
};

// CA "extra" hors fermes (ex. France Travail, Apsys) : affiché dans la Vue Groupe
// uniquement, réparti à parts égales sur les 12 mois, SANS aucune charge associée
// (ni coûts variables, ni quote-part des enveloppes) et exclu du point mort.
const SEED_GROUP_EXTRAS = [
  { id: "x1", label: "France Travail", annual: 50000 },
  { id: "x2", label: "Apsys", annual: 20000 },
];
const extraMonthly = (extras) => {
  const tot = (extras || []).reduce((a, x) => a + (parseFloat(x.annual) || 0), 0);
  return Array(12).fill(tot / 12);
};

const money = (v, opts = {}) => {
  if (v === null || v === undefined || isNaN(v)) return "—";
  const sign = v < 0 ? "-" : opts.forceSign && v > 0 ? "+" : "";
  return sign + Math.round(Math.abs(v)).toLocaleString("fr-FR") + " €";
};
const pct = (v) => (v === null || v === undefined || isNaN(v) ? "—" : (v * 100).toFixed(1) + " %");
const sum = (arr) => arr.reduce((a, b) => a + (b || 0), 0);
// Call this whenever a collaborator is removed, so a page reload can't quietly
// re-add someone you deliberately deleted (the "missing seed people" migration
// only re-adds an ID if it's NOT in this removed list).
function recordSeedRemoval(id, seedList, setRemovedSeed) {
  if (seedList.some((s) => s.id === id)) {
    setRemovedSeed((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }
}

// Fills in any key/field that exists in `seed` but is missing from `existing`,
// recursively, WITHOUT ever touching a value the user already has. This means a
// future app update can introduce a new farm, product, cost parameter, etc. and
// it will appear automatically for everyone, while every existing number/edit
// stays exactly as the user left it.
function fillMissing(existing, seed) {
  if (Array.isArray(seed)) return existing; // arrays are merged by id elsewhere (collaborators)
  if (typeof seed !== "object" || seed === null) return existing;
  const result = { ...existing };
  for (const key of Object.keys(seed)) {
    if (!(key in result) || result[key] === undefined) {
      result[key] = seed[key];
    } else if (typeof seed[key] === "object" && seed[key] !== null && !Array.isArray(seed[key]) && !Array.isArray(result[key])) {
      result[key] = fillMissing(result[key], seed[key]);
    }
  }
  return result;
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(fallback);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage?.get(key, true);
        if (!cancelled && res?.value) {
          const parsed = JSON.parse(res.value);
          // Merge immediately so a render can never see data missing a field the
          // current code expects (e.g. a farm/product added after this was last saved).
          setValue(Array.isArray(fallback) ? parsed : fillMissing(parsed, fallback));
        }
      } catch (e) {
        /* key not found yet, keep fallback */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [key]);
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      window.storage?.set(key, JSON.stringify(value), true).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [key, value, loaded]);
  return [value, setValue, loaded];
}

/* ---------- computation engine ---------- */
function computeFarmMonth(farm, m, sales, isReal, realActuals, liveCosts) {
  const products = FARM_PRODUCTS[farm];
  const ca = sum(products.map((p) => sales[farm][p][m] || 0));
  const locked = isReal[farm][m] ? realActuals[farm]?.[m] : null;

  if (locked) {
    // A real month locks its production costs (real invoices) exactly as reconciled.
    // Structure, personnel and externes are NOT locked — they always follow the
    // current Collaborateurs 2026 list, month by month, so the Scénarios engine and
    // the Budget 2027 engine (which does the same with the 2027 list) stay identical.
    const totalProdCost = locked.conso + locked.transport + locked.divers;
    return {
      ca, conso: locked.conso, transport: locked.transport, forfait: locked.divers,
      totalProdCost, mb: ca + totalProdCost, isActual: true,
    };
  }

  const conso = -sum(products.map((p) => (sales[farm][p][m] || 0) * (liveCosts.costRatio[`${farm}.${p}`] || 0)));
  const transportRatio = liveCosts.transportRatio[farm];
  const transport = transportRatio !== undefined ? -ca * transportRatio : 0;
  const forfait = liveCosts.forfait[farm] || 0;
  const totalProdCost = conso + transport + forfait;
  return { ca, conso, transport, forfait, totalProdCost, mb: ca + totalProdCost, isActual: false };
}

function computeAll(sales, isReal, realActuals, liveCosts) {
  const perFarmMonth = {};
  FARM_KEYS.forEach((f) => { perFarmMonth[f] = []; });
  const groupCA = new Array(12).fill(0);

  for (let m = 0; m < 12; m++) {
    FARM_KEYS.forEach((f) => {
      const r = computeFarmMonth(f, m, sales, isReal, realActuals, liveCosts);
      perFarmMonth[f][m] = r;
      groupCA[m] += r.ca;
    });
  }

  const result = {};
  FARM_KEYS.forEach((f) => { result[f] = []; });

  for (let m = 0; m < 12; m++) {
    FARM_KEYS.forEach((f) => {
      const r = perFarmMonth[f][m];
      const caShare = groupCA[m] ? r.ca / groupCA[m] : 0;
      const structureFixed = liveCosts.structureFixed[f] || 0;
      const fournitures = -(liveCosts.fournituresPool || 0) * caShare;
      const structure = structureFixed + fournitures;
      const personnelDirect = (liveCosts.personnelDirect[f] && liveCosts.personnelDirect[f][m]) || 0;
      const transverse = -((liveCosts.transverseByFarm?.[f]?.[m]) || 0);
      const personnel = personnelDirect + transverse;
      const externes = -(liveCosts.externesPool || 0) * caShare;
      const rbe = r.mb + structure;
      const ap = rbe + personnel;
      const re = ap + externes;
      result[f][m] = { ...r, structureFixed, fournitures, structure, rbe, personnelDirect, transverse, personnel, ap, externes, re, caShare };
    });
  }

  const groupe = [];
  for (let m = 0; m < 12; m++) {
    const g = { ca: 0, conso: 0, transport: 0, forfait: 0, totalProdCost: 0, mb: 0, structure: 0, rbe: 0, personnel: 0, ap: 0, externes: 0, re: 0 };
    FARM_KEYS.forEach((f) => {
      const r = result[f][m];
      g.ca += r.ca; g.conso += r.conso; g.transport += r.transport; g.forfait += r.forfait;
      g.totalProdCost += r.totalProdCost; g.mb += r.mb; g.structure += r.structure;
      g.rbe += r.rbe; g.personnel += r.personnel; g.ap += r.ap; g.externes += r.externes; g.re += r.re;
    });
    groupe.push(g);
  }

  return { farms: result, groupe };
}

function annualize(monthArr, field) {
  return sum(monthArr.map((m) => m[field]));
}

function pointMort(monthArr, realMask) {
  const realMonths = monthArr.filter((_, i) => realMask[i]);
  const n = realMonths.length || 1;
  const ca = annualize(realMonths, "ca");
  const mb = annualize(realMonths, "mb");
  const fixed = -(annualize(realMonths, "structure") + annualize(realMonths, "personnel") + annualize(realMonths, "externes"));
  const txMb = ca ? mb / ca : 0;
  const fixedMonthly = fixed / n;
  const pm = txMb ? fixedMonthly / txMb : 0;
  return { pm, txMb, fixedMonthly, caMoyReal: ca / n };
}

/* ---------- UI atoms ---------- */
function StatCard({ label, value, sub, tone = "neutral", accent }) {
  const toneColor = tone === "good" ? "#2F6B3F" : tone === "bad" ? "#A34328" : "#3A4A42";
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid #E4E0D4", borderRadius: 10,
      padding: "18px 20px", flex: 1, minWidth: 160, borderTop: accent ? `3px solid ${accent}` : undefined,
    }}>
      <div style={{ fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase", color: "#8A8578", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: toneColor, fontVariantNumeric: "tabular-nums", marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: "#8A8578", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Sparkline({ values, accent, height = 36 }) {
  const w = 220;
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (w - 4) + 2;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  const zeroY = height - ((0 - min) / range) * (height - 6) - 3;
  return (
    <svg width={w} height={height} style={{ display: "block" }}>
      <line x1={0} y1={zeroY} x2={w} y2={zeroY} stroke="#E4E0D4" strokeDasharray="3,2" />
      <polyline points={pts} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Table({ children }) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid #E4E0D4", borderRadius: 10, background: "#fff" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13.5 }}>{children}</table>
    </div>
  );
}

const th = { textAlign: "right", padding: "8px 10px", fontWeight: 600, color: "#6E6A5D", fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.03em", borderBottom: "1px solid #E4E0D4", whiteSpace: "nowrap" };
const thLeft = { ...th, textAlign: "left" };
const td = { textAlign: "right", padding: "7px 10px", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const tdLeft = { ...td, textAlign: "left", fontWeight: 600, color: "#2A2A28" };

const SEED_SCENARIO_PARAMS = {
  sdfSharePct: 66.4, sdfTransportMonthly: 1300,
  soJavier: 2509.55, soIntermSmic: 2300, soIntermMonths: 7, soStagiaire: 700, soStagiaireMonths: 7,
};

/* ---------- App ---------- */
export default function App() {
  const [sales, setSales, loaded1] = useStoredState("weshgrow.sales", SEED_SALES);
  const [isReal, setIsReal, loaded2] = useStoredState("weshgrow.isReal", SEED_IS_REAL);
  const [realActuals, setRealActuals, loaded3] = useStoredState("weshgrow.realActuals", SEED_REAL_ACTUALS);
  const [liveCosts, setLiveCosts, loaded4] = useStoredState("weshgrow.liveCosts", SEED_COST_PARAMS);
  const [scenarioParams, setScenarioParams, loaded5] = useStoredState("weshgrow.scenarios", SEED_SCENARIO_PARAMS);
  const [collaborators2026, setCollaborators2026, loaded6] = useStoredState("weshgrow.collaborators2026", SEED_COLLABORATORS_2026);
  const [collaborators2027, setCollaborators2027, loaded6b] = useStoredState("weshgrow.collaborators2027", SEED_COLLABORATORS_2027);
  const [removedSeed2026, setRemovedSeed2026, loadedR6] = useStoredState("weshgrow.removedSeed2026", []);
  const [removedSeed2027, setRemovedSeed2027, loadedR6b] = useStoredState("weshgrow.removedSeed2027", []);
  const [groupExtras, setGroupExtras] = useStoredState("weshgrow.groupExtras", SEED_GROUP_EXTRAS);
  const [budget2027, setBudget2027, loaded7] = useStoredState("weshgrow.budget2027", {
    pricePct: 0,
    growthPct: 0,
    grossisteShare: { paris: 59, saintOuen: 50, marseille: 50 },
  });
  const [tab, setTab] = useState("groupe");
  const loaded = loaded1 && loaded2 && loaded3 && loaded4 && loaded5 && loaded6 && loaded6b && loaded7 && loadedR6 && loadedR6b;

  // 2026 and 2027 collaborators are two fully independent lists — adding, editing
  // or removing someone in one never touches the other. Each just gets its own
  // seed people appended if missing (e.g. a new hire type added by an app update)
  // — but NEVER a person you deliberately deleted (tracked in removedSeedXXXX so a
  // reload can't silently bring back someone you removed).
  useEffect(() => {
    if (!loaded6 || !loadedR6) return;
    setCollaborators2026((prev) => {
      const missing = SEED_COLLABORATORS_2026.filter((s) => !prev.some((c) => c.id === s.id) && !removedSeed2026.includes(s.id));
      return missing.length > 0 ? [...prev, ...missing] : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded6, loadedR6]);
  useEffect(() => {
    if (!loaded6b || !loadedR6b) return;
    setCollaborators2027((prev) => {
      const missing = SEED_COLLABORATORS_2027.filter((s) => !prev.some((c) => c.id === s.id) && !removedSeed2027.includes(s.id));
      return missing.length > 0 ? [...prev, ...missing] : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded6b, loadedR6b]);

  // Backfill a default % split (Paris/Saint-Ouen/Marseille) for any transverse
  // collaborator saved before this feature existed — based on this year's average
  // CA share per farm, so their allocated cost stays close to what it was under the
  // old CA-prorata system until you deliberately change it.
  useEffect(() => {
    if (!loaded1 || !loaded6 || !loaded6b) return;
    const totals = {};
    FARM_KEYS.forEach((f) => { totals[f] = sum(FARM_PRODUCTS[f].flatMap((p) => sales[f][p])); });
    const grand = FARM_KEYS.reduce((s, f) => s + totals[f], 0);
    const defaultSplit = {};
    FARM_KEYS.forEach((f) => { defaultSplit[f] = grand ? Math.round((totals[f] / grand) * 1000) / 10 : Math.round(1000 / FARM_KEYS.length) / 10; });
    setCollaborators2026((prev) => {
      const changed = prev.some((c) => c.site === "transverse" && !c.splits);
      return changed ? prev.map((c) => (c.site === "transverse" && !c.splits ? { ...c, splits: { ...defaultSplit } } : c)) : prev;
    });
    setCollaborators2027((prev) => {
      const changed = prev.some((c) => c.site === "transverse" && !c.splits);
      return changed ? prev.map((c) => (c.site === "transverse" && !c.splits ? { ...c, splits: { ...defaultSplit } } : c)) : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded1, loaded6, loaded6b]);

  // Personnel costs are derived live from the 2026 collaborators list, month by
  // month — editing/adding/removing someone (or changing a specific month's
  // salary) immediately updates every farm's personnel line and the point mort.
  const derivedCosts = useMemo(() => {
    const byFarm = { paris: Array(12).fill(0), saintOuen: Array(12).fill(0), marseille: Array(12).fill(0) };
    const transverseByFarm = { paris: Array(12).fill(0), saintOuen: Array(12).fill(0), marseille: Array(12).fill(0) };
    collaborators2026.forEach((c) => {
      for (let m = 0; m < 12; m++) {
        const s = parseFloat(c.salary?.[m]) || 0;
        if (c.site === "transverse") {
          const splits = c.splits || DEFAULT_TRANSVERSE_SPLIT;
          FARM_KEYS.forEach((f) => { transverseByFarm[f][m] += s * ((splits[f] || 0) / 100); });
        } else if (byFarm[c.site] !== undefined) byFarm[c.site][m] += s;
      }
    });
    return {
      ...liveCosts,
      personnelDirect: {
        paris: byFarm.paris.map((v) => -v),
        saintOuen: byFarm.saintOuen.map((v) => -v),
        marseille: byFarm.marseille.map((v) => -v),
      },
      transverseByFarm,
    };
  }, [collaborators2026, liveCosts]);

  // Same idea, but entirely from the independent 2027 collaborators list — used
  // by both Budget 2027 and the Scénarios tab, so the two always agree.
  const derivedCosts2027 = useMemo(() => {
    const byFarm = { paris: Array(12).fill(0), saintOuen: Array(12).fill(0), marseille: Array(12).fill(0) };
    const transverseByFarm = { paris: Array(12).fill(0), saintOuen: Array(12).fill(0), marseille: Array(12).fill(0) };
    collaborators2027.forEach((c) => {
      if (c.active === false) return; // paused: contributes 0€ everywhere until reactivated
      for (let m = 0; m < 12; m++) {
        const s = parseFloat(c.salary?.[m]) || 0;
        if (c.site === "transverse") {
          const splits = c.splits || DEFAULT_TRANSVERSE_SPLIT;
          FARM_KEYS.forEach((f) => { transverseByFarm[f][m] += s * ((splits[f] || 0) / 100); });
        } else if (byFarm[c.site] !== undefined) byFarm[c.site][m] += s;
      }
    });
    return {
      ...liveCosts,
      personnelDirect: {
        paris: byFarm.paris.map((v) => -v),
        saintOuen: byFarm.saintOuen.map((v) => -v),
        marseille: byFarm.marseille.map((v) => -v),
      },
      transverseByFarm,
    };
  }, [collaborators2027, liveCosts]);

  const computed = useMemo(() => computeAll(sales, isReal, realActuals, derivedCosts), [sales, isReal, realActuals, derivedCosts]);

  const setCA = useCallback((farm, product, monthIdx, value) => {
    setSales((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[farm][product][monthIdx] = value === "" ? 0 : parseFloat(value);
      return next;
    });
  }, [setSales]);

  const toggleReal = useCallback((farm, monthIdx) => {
    const turningReal = !isReal[farm][monthIdx];
    if (turningReal) {
      // freeze the currently-computed (projected) cost breakdown as this month's real actual
      const snap = computed.farms[farm][monthIdx];
      setRealActuals((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        if (!next[farm]) next[farm] = Array(12).fill(null);
        next[farm][monthIdx] = {
          conso: snap.conso, transport: snap.transport, divers: snap.forfait,
          structure: snap.structure, personnel: snap.personnel, externes: snap.externes,
        };
        return next;
      });
    }
    setIsReal((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[farm][monthIdx] = turningReal;
      return next;
    });
  }, [isReal, computed, setIsReal, setRealActuals]);

  const exportBackup = useCallback(() => {
    const backup = {
      exportedAt: new Date().toISOString(),
      sales, isReal, realActuals, liveCosts, scenarioParams, collaborators2026, collaborators2027, groupExtras,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `weshgrow-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [sales, isReal, realActuals, liveCosts, scenarioParams, collaborators2026, collaborators2027, groupExtras]);

  const importInputRef = useRef(null);
  const importBackup = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.sales) setSales(data.sales);
        if (data.isReal) setIsReal(data.isReal);
        if (data.realActuals) setRealActuals(data.realActuals);
        if (data.liveCosts) setLiveCosts(data.liveCosts);
        if (data.scenarioParams) setScenarioParams(data.scenarioParams);
        if (data.collaborators2026) setCollaborators2026(data.collaborators2026);
        if (data.collaborators2027) setCollaborators2027(data.collaborators2027);
        else if (data.collaborators) setCollaborators2026(data.collaborators); // backward compatibility with older exports
        if (data.groupExtras) setGroupExtras(data.groupExtras);
        alert("Sauvegarde importée avec succès.");
      } catch (err) {
        alert("Fichier invalide, impossible de lire cette sauvegarde.");
      }
    };
    reader.readAsText(file);
  }, [setSales, setIsReal, setRealActuals, setLiveCosts, setScenarioParams, setCollaborators2026, setCollaborators2027]);

  if (!loaded) {
    return <div style={{ padding: 40, fontFamily: "Inter, sans-serif", color: "#6E6A5D" }}>Chargement des données…</div>;
  }

  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", background: "#F7F5EF", minHeight: "100vh", color: "#2A2A28" }}>
      <style>{`
        * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .display { font-family: Georgia, "Times New Roman", serif; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
        button:focus-visible, input:focus-visible { outline: 2px solid #5C7A5E; outline-offset: 1px; }
        table input[type=number] { width: 64px; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: "#1C2B22", color: "#F7F5EF", padding: "24px 16px", flexShrink: 0 }}>
          <div className="display" style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.15, marginBottom: 2 }}>Wesh Grow</div>
          <div style={{ fontSize: 11.5, opacity: 0.6, marginBottom: 28, letterSpacing: "0.03em" }}>PILOTAGE FINANCIER 2026</div>
          <NavItem active={tab === "groupe"} onClick={() => setTab("groupe")} label="Groupe" dot="#F7F5EF" />
          {FARM_KEYS.map((f) => (
            <NavItem key={f} active={tab === f} onClick={() => setTab(f)} label={FARM_META[f].label} dot={FARM_META[f].accent} />
          ))}
          <div style={{ height: 1, background: "rgba(247,245,239,0.15)", margin: "14px 0" }} />
          <NavItem active={tab === "couts"} onClick={() => setTab("couts")} label="Coûts & paramètres" dot="#B5502F" />
          <NavItem active={tab === "collaborateurs"} onClick={() => setTab("collaborateurs")} label="Collaborateurs" dot="#B5502F" />
          <NavItem active={tab === "scenarios"} onClick={() => setTab("scenarios")} label="Scénarios" dot="#B5502F" />
          <NavItem active={tab === "budget2027"} onClick={() => setTab("budget2027")} label="Budget 2027" dot="#C9962B" />
          <div style={{ marginTop: 22, padding: "10px 10px", background: "rgba(247,245,239,0.08)", borderRadius: 7, fontSize: 11, lineHeight: 1.5, opacity: 0.75 }}>
            🔗 Données partagées : toute personne ayant ce lien voit et modifie les mêmes chiffres, en direct.
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={exportBackup} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
              background: "rgba(247,245,239,0.1)", border: "1px solid rgba(247,245,239,0.25)", color: "#F7F5EF",
              padding: "8px 10px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}>
              ⬇️ Exporter (.json)
            </button>
            <button onClick={() => importInputRef.current?.click()} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
              background: "rgba(247,245,239,0.1)", border: "1px solid rgba(247,245,239,0.25)", color: "#F7F5EF",
              padding: "8px 10px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}>
              ⬆️ Importer une sauvegarde
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={(e) => { if (e.target.files?.[0]) importBackup(e.target.files[0]); e.target.value = ""; }}
            />
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "32px 40px", maxWidth: 1180 }}>
          {tab === "groupe" && <GroupeView computed={computed} isReal={isReal} collaborators={collaborators2026} setCollaborators={setCollaborators2026} removedSeed={removedSeed2026} setRemovedSeed={setRemovedSeed2026} groupExtras={groupExtras} setGroupExtras={setGroupExtras} />}
          {FARM_KEYS.includes(tab) && (
            <FarmView
              farm={tab}
              sales={sales}
              isReal={isReal}
              computed={computed}
              setCA={setCA}
              toggleReal={toggleReal}
              collaborators={collaborators2026}
              setCollaborators={setCollaborators2026}
              removedSeed={removedSeed2026}
              setRemovedSeed={setRemovedSeed2026}
            />
          )}
          {tab === "couts" && <CoutsView liveCosts={liveCosts} setLiveCosts={setLiveCosts} isReal={isReal} />}
          {tab === "collaborateurs" && (
            <CollaborateursView
              collaborators2026={collaborators2026} setCollaborators2026={setCollaborators2026}
              collaborators2027={collaborators2027} setCollaborators2027={setCollaborators2027}
              removedSeed2026={removedSeed2026} setRemovedSeed2026={setRemovedSeed2026}
              removedSeed2027={removedSeed2027} setRemovedSeed2027={setRemovedSeed2027}
            />
          )}
          {tab === "scenarios" && (
            <ScenariosView computed={computed} derivedCosts2027={derivedCosts2027} liveCosts={liveCosts} scenarioParams={scenarioParams} setScenarioParams={setScenarioParams} collaborators2027={collaborators2027} budget2027={budget2027} setBudget2027={setBudget2027} />
          )}
          {tab === "budget2027" && (
            <Budget2027View computed={computed} derivedCosts2027={derivedCosts2027} liveCosts={liveCosts} scenarioParams={scenarioParams} budget2027={budget2027} setBudget2027={setBudget2027} collaborators={collaborators2027} setCollaborators={setCollaborators2027} removedSeed={removedSeed2027} setRemovedSeed={setRemovedSeed2027} />
          )}
        </div>
      </div>
    </div>
  );
}

function NavItem({ active, onClick, label, dot }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
      background: active ? "rgba(247,245,239,0.12)" : "transparent", border: "none",
      color: "#F7F5EF", padding: "9px 10px", borderRadius: 7, marginBottom: 2, cursor: "pointer",
      fontSize: 14, fontWeight: active ? 600 : 500, opacity: active ? 1 : 0.75,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 99, background: dot, flexShrink: 0 }} />
      {label}
    </button>
  );
}

/* ---------- Groupe view ---------- */
function GroupeView({ computed, isReal, collaborators, setCollaborators, removedSeed, setRemovedSeed, groupExtras, setGroupExtras }) {
  const g0 = computed.groupe;
  // CA extra hors fermes : s'ajoute au CA, à la marge brute, au RBE et au résultat, sans aucune charge.
  const x = extraMonthly(groupExtras);
  const extraTotal = sum(x);
  const g = g0.map((m, i) => ({ ...m, ca: m.ca + x[i], mb: m.mb + x[i], rbe: m.rbe + x[i], ap: m.ap + x[i], re: m.re + x[i] }));
  const caAnnual = annualize(g, "ca");
  const reAnnual = annualize(g, "re");
  const mbAnnual = annualize(g, "mb");
  const realMask = FARM_KEYS.reduce((acc, f, i) => acc.map((v, idx) => v && isReal[f][idx]), Array(12).fill(true));
  const pm = pointMort(g0, realMask); // point mort des fermes seules : le CA extra est exclu
  const nRealMonths = realMask.filter(Boolean).length;

  return (
    <div>
      <Header title="Vue Groupe" subtitle="Consolidation des 3 fermes — réel + projeté 2026" />
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="CA annuel" value={money(caAnnual)} accent="#5C7A5E" />
        <StatCard label="Marge brute annuelle" value={money(mbAnnual)} sub={pct(mbAnnual / caAnnual)} accent="#5C7A5E" />
        <StatCard label="Résultat d'exploitation 2026" value={money(reAnnual, { forceSign: true })} tone={reAnnual >= 0 ? "good" : "bad"} accent={reAnnual >= 0 ? "#2F6B3F" : "#A34328"} />
        <StatCard label={`Point mort / mois (base ${nRealMonths} mois réels)`} value={money(pm.pm)} sub={`Taux MB ${pct(pm.txMb)}`} accent="#C9962B" />
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
        {FARM_KEYS.map((f) => {
          const arr = computed.farms[f];
          const annualRe = annualize(arr, "re");
          return (
            <div key={f} style={{ background: "#fff", border: "1px solid #E4E0D4", borderRadius: 10, padding: 16, flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>{FARM_META[f].label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: annualRe >= 0 ? "#2F6B3F" : "#A34328" }}>{money(annualRe, { forceSign: true })}</span>
              </div>
              <Sparkline values={arr.map((m) => m.re)} accent={FARM_META[f].accent} />
              <div style={{ fontSize: 11.5, color: "#8A8578", marginTop: 4 }}>Résultat d'exploitation mensuel (Janv → Déc)</div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#3A4A42", marginBottom: 8 }}>Compte de résultat consolidé, par mois</div>
      <Table>
        <thead>
          <tr>
            <th style={thLeft}>Poste</th>
            {MONTHS.map((m, i) => <th key={m} style={{ ...th, color: isReal.paris[i] ? "#2F6B3F" : "#8A8578" }}>{m}</th>)}
            <th style={{ ...th, fontWeight: 800 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          <Row label="CA HT" values={g.map((m) => m.ca)} bold />
          {extraTotal !== 0 && <Row label="   dont CA extra (hors fermes, sans charges)" values={x} />}
          <Row label="Marge brute" values={g.map((m) => m.mb)} />
          <Row label="Charges de structure" values={g.map((m) => m.structure)} />
          <Row label="RBE" values={g.map((m) => m.rbe)} />
          <PersonnelRow values={g.map((m) => m.personnel)} site="transverse" siteLabel="équipe transverse" collaborators={collaborators} setCollaborators={setCollaborators} removedSeed={removedSeed} setRemovedSeed={setRemovedSeed} />
          <Row label="Après personnel" values={g.map((m) => m.ap)} />
          <Row label="Charges externes" values={g.map((m) => m.externes)} />
          <Row label="Résultat d'exploitation" values={g.map((m) => m.re)} bold highlight />
        </tbody>
      </Table>
      <div style={{ fontSize: 12, color: "#8A8578", marginTop: 10, lineHeight: 1.5 }}>
        Les mois en <span style={{ color: "#2F6B3F", fontWeight: 600 }}>vert</span> sont marqués réels (voir onglet de chaque ferme). Le point mort se calcule sur le cumul des mois réels uniquement, et sur les fermes seules (hors CA extra).
      </div>
      <ExtraCAPanel extras={groupExtras} setExtras={setGroupExtras} />
    </div>
  );
}

function ExtraAmountInput({ value, onChange }) {
  const [local, setLocal] = useState(String(value));
  useEffect(() => {
    if (!(local === "" && value === 0) && parseFloat(local) !== value) setLocal(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <input
      type="number" step="1000" min="0" value={local}
      onChange={(e) => { setLocal(e.target.value); onChange(e.target.value === "" || isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value)); }}
      style={{ width: 110, textAlign: "right", border: "1px solid #E4E0D4", borderRadius: 5, padding: "5px 7px", fontSize: 13 }}
    />
  );
}

function ExtraCAPanel({ extras, setExtras }) {
  const list = extras || [];
  const total = sum(list.map((x) => parseFloat(x.annual) || 0));
  const updateLabel = (id, value) => setExtras((prev) => prev.map((x) => (x.id === id ? { ...x, label: value } : x)));
  const updateAnnual = (id, value) => setExtras((prev) => prev.map((x) => (x.id === id ? { ...x, annual: value } : x)));
  const remove = (id) => setExtras((prev) => prev.filter((x) => x.id !== id));
  const add = () => setExtras((prev) => [...prev, { id: "x" + Date.now() + Math.random().toString(36).slice(2, 5), label: "Nouvelle ligne", annual: 0 }]);
  return (
    <div style={{ background: "#fff", border: "1px solid #E4E0D4", borderRadius: 10, padding: 16, marginTop: 22, maxWidth: 560 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#3A4A42", marginBottom: 4 }}>CA extra annuel, hors fermes (sans aucune charge)</div>
      <div style={{ fontSize: 11.5, color: "#8A8578", marginBottom: 12, lineHeight: 1.5 }}>
        Réparti à parts égales sur les 12 mois et ajouté au CA, à la marge brute et au résultat de la Vue Groupe uniquement : aucun coût variable, aucune quote-part des enveloppes, exclu du point mort.
      </div>
      {list.map((x) => (
        <div key={x.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7 }}>
          <input value={x.label} onChange={(e) => updateLabel(x.id, e.target.value)}
            style={{ flex: 1, border: "1px solid #E4E0D4", borderRadius: 5, padding: "5px 8px", fontSize: 13 }} />
          <ExtraAmountInput value={parseFloat(x.annual) || 0} onChange={(v) => updateAnnual(x.id, v)} />
          <span style={{ fontSize: 12, color: "#8A8578" }}>€/an</span>
          <button onClick={() => remove(x.id)} title="Retirer"
            style={{ border: "none", background: "#F9D9D9", color: "#A34328", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✕</button>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <button onClick={add}
          style={{ border: "1px solid #5C7A5E", background: "#fff", color: "#5C7A5E", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          + Ajouter une ligne
        </button>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Total : {money(total)} / an</span>
      </div>
    </div>
  );
}

function Row({ label, values, bold, highlight }) {
  const total = sum(values);
  return (
    <tr style={highlight ? { background: "#FBF7EE" } : undefined}>
      <td style={{ ...tdLeft, fontWeight: bold ? 700 : 600, color: bold ? "#1C2B22" : "#5A5648" }}>{label}</td>
      {values.map((v, i) => (
        <td key={i} style={{ ...td, fontWeight: bold ? 700 : 400, color: v < 0 ? "#A34328" : "#2A2A28" }}>{money(v)}</td>
      ))}
      <td style={{ ...td, fontWeight: 800, color: total < 0 ? "#A34328" : "#1C2B22" }}>{money(total)}</td>
    </tr>
  );
}

function PersonnelRow({ values, site, siteLabel, collaborators, setCollaborators, transverseValues, removedSeed, setRemovedSeed }) {
  const [expanded, setExpanded] = useState(false);
  const total = sum(values);
  const people = collaborators.filter((c) => c.site === site);

  const updateMonth = (id, monthIdx, value) => {
    setCollaborators((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const salary = [...c.salary];
      salary[monthIdx] = value === "" ? 0 : parseFloat(value);
      return { ...c, salary };
    }));
  };
  const updateName = (id, value) => {
    setCollaborators((prev) => prev.map((c) => (c.id === id ? { ...c, name: value } : c)));
  };
  const applyForward = (id, monthIdx) => {
    setCollaborators((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const v = c.salary[monthIdx];
      const salary = c.salary.map((x, i) => (i >= monthIdx ? v : x));
      return { ...c, salary };
    }));
  };
  const remove = (id) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
    recordSeedRemoval(id, SEED_COLLABORATORS_2026, setRemovedSeed);
  };
  const add = () => setCollaborators((prev) => [...prev, { id: "c" + Date.now(), name: "Nouveau collaborateur", site, salary: Array(12).fill(0) }]);

  return (
    <>
      <tr onClick={() => setExpanded((e) => !e)} style={{ cursor: "pointer" }}>
        <td style={{ ...tdLeft, fontWeight: 600 }}>
          <span style={{ display: "inline-block", width: 12, transition: "transform 0.15s", transform: expanded ? "rotate(90deg)" : "none" }}>▸</span>
          {" "}Charges de personnel{siteLabel ? ` (${siteLabel})` : ""}
        </td>
        {values.map((v, i) => (
          <td key={i} style={{ ...td, color: v < 0 ? "#A34328" : "#2A2A28" }}>{money(v)}</td>
        ))}
        <td style={{ ...td, fontWeight: 800, color: total < 0 ? "#A34328" : "#1C2B22" }}>{money(total)}</td>
      </tr>
      {expanded && people.length === 0 && (
        <tr style={{ background: "#FBF9F3" }}>
          <td colSpan={values.length + 2} style={{ padding: "10px 16px", color: "#8A8578", fontSize: 12.5 }}>Aucun collaborateur sur ce site pour l'instant.</td>
        </tr>
      )}
      {expanded && people.map((p) => {
        const rowTotal = sum(p.salary);
        return (
          <tr key={p.id} style={{ background: "#FBF9F3" }}>
            <td style={{ ...td, textAlign: "left", padding: "5px 10px 5px 30px" }}>
              <input value={p.name} onChange={(e) => updateName(p.id, e.target.value)}
                style={{ border: "1px solid #E4E0D4", borderRadius: 5, padding: "4px 6px", fontSize: 12, width: "100%", boxSizing: "border-box" }} />
            </td>
            {p.salary.map((v, mi) => (
              <td key={mi} style={{ ...td, padding: "4px 3px" }}>
                <input
                  type="number" step="10" value={v}
                  onChange={(e) => updateMonth(p.id, mi, e.target.value)}
                  onDoubleClick={() => applyForward(p.id, mi)}
                  title="Double-cliquer pour appliquer ce montant à ce mois et tous les suivants"
                  style={{ border: "1px solid #E4E0D4", borderRadius: 5, padding: "4px 3px", fontSize: 11.5, textAlign: "right", boxSizing: "border-box" }}
                />
              </td>
            ))}
            <td style={{ ...td, fontWeight: 700, whiteSpace: "nowrap" }}>
              {money(-rowTotal)}
              <button onClick={() => remove(p.id)} style={{ marginLeft: 6, border: "none", background: "#F9D9D9", color: "#A34328", borderRadius: 5, padding: "2px 7px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✕</button>
            </td>
          </tr>
        );
      })}
      {expanded && transverseValues && (
        <tr style={{ background: "#FBF4E6" }}>
          <td style={{ ...td, textAlign: "left", padding: "5px 10px 5px 30px", fontStyle: "italic", color: "#7A5A20" }}>
            Quote-part équipe transverse (prorata CA)
          </td>
          {transverseValues.map((v, i) => (
            <td key={i} style={{ ...td, fontStyle: "italic", color: "#7A5A20" }}>{money(v)}</td>
          ))}
          <td style={{ ...td, fontWeight: 700, fontStyle: "italic", color: "#7A5A20" }}>{money(sum(transverseValues))}</td>
        </tr>
      )}
      {expanded && (
        <tr style={{ background: "#FBF9F3" }}>
          <td colSpan={values.length + 2} style={{ padding: "8px 16px 14px" }}>
            <button onClick={add} style={{ border: "1px solid #5C7A5E", background: "#fff", color: "#5C7A5E", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              + Ajouter un collaborateur {siteLabel ? `(${siteLabel})` : ""}
            </button>
            <div style={{ fontSize: 11, color: "#8A8578", marginTop: 6 }}>Astuce : double-cliquez une case pour appliquer ce montant à ce mois-là et à tous les mois suivants (les mois précédents ne changent pas).</div>
            {site !== "transverse" && (
              <div style={{ fontSize: 11.5, color: "#8A8578", marginTop: 6, lineHeight: 1.5 }}>
                La ligne "Quote-part équipe transverse" ci-dessus reflète le prorata du CA de cette ferme — les personnes elles-mêmes (Président, DG, Commercial, Clientèle) se gèrent dans l'onglet <strong>Groupe</strong>.
              </div>
            )}
            {site === "transverse" && (
              <div style={{ fontSize: 11.5, color: "#8A8578", marginTop: 6, lineHeight: 1.5 }}>
                Le montant total de la ligne ci-dessus inclut aussi le personnel direct de chaque ferme (visible dans leurs onglets respectifs) — ici ne s'affiche que l'équipe transverse, répartie au prorata du CA entre les fermes.
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function Header({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="display" style={{ fontSize: 27, fontWeight: 700, color: "#1C2B22" }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "#8A8578", marginTop: 2 }}>{subtitle}</div>
    </div>
  );
}

/* ---------- Farm view ---------- */
function FarmView({ farm, sales, isReal, computed, setCA, toggleReal, collaborators, setCollaborators, removedSeed, setRemovedSeed }) {
  const meta = FARM_META[farm];
  const arr = computed.farms[farm];
  const annualRe = annualize(arr, "re");
  const annualCa = annualize(arr, "ca");
  const realMask = isReal[farm];
  const pm = pointMort(arr, realMask);

  return (
    <div>
      <Header title={meta.label} subtitle={meta.tag} />
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="CA annuel" value={money(annualCa)} accent={meta.accent} />
        <StatCard label="Résultat d'exploitation" value={money(annualRe, { forceSign: true })} tone={annualRe >= 0 ? "good" : "bad"} accent={meta.accent} />
        <StatCard label="Point mort / mois" value={money(pm.pm)} sub={`Taux MB ${pct(pm.txMb)}`} accent={meta.accent} />
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#3A4A42", marginBottom: 8 }}>
        Chiffre d'affaires par produit — cliquez une cellule pour modifier, cochez "réel" une fois le mois clôturé
      </div>
      <Table>
        <thead>
          <tr>
            <th style={thLeft}>Produit</th>
            {MONTHS.map((m) => <th key={m} style={th}>{m}</th>)}
          </tr>
        </thead>
        <tbody>
          {FARM_PRODUCTS[farm].map((p) => (
            <tr key={p}>
              <td style={tdLeft}>{PRODUCT_LABEL[p]}</td>
              {MONTHS.map((_, i) => (
                <td key={i} style={{ ...td, padding: "4px 6px" }}>
                  <input
                    type="number"
                    value={sales[farm][p][i]}
                    onChange={(e) => setCA(farm, p, i, e.target.value)}
                    style={{
                      border: "1px solid #E4E0D4", borderRadius: 5, padding: "4px 6px", textAlign: "right",
                      fontSize: 13, fontVariantNumeric: "tabular-nums",
                      background: isReal[farm][i] ? "#EEF4EC" : "#fff",
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td style={{ ...tdLeft, fontWeight: 700 }}>Total CA</td>
            {MONTHS.map((_, i) => <td key={i} style={{ ...td, fontWeight: 700 }}>{money(arr[i].ca)}</td>)}
          </tr>
          <tr>
            <td style={tdLeft}>Statut du mois</td>
            {MONTHS.map((_, i) => (
              <td key={i} style={{ ...td, padding: "4px 6px" }}>
                <button
                  onClick={() => toggleReal(farm, i)}
                  style={{
                    fontSize: 10.5, fontWeight: 700, border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer",
                    background: isReal[farm][i] ? "#DCEBDD" : "#F0EEE4", color: isReal[farm][i] ? "#2F6B3F" : "#8A8578",
                  }}
                >
                  {isReal[farm][i] ? "RÉEL" : "PROJETÉ"}
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </Table>

      <div style={{ height: 26 }} />
      <div style={{ fontSize: 13, fontWeight: 700, color: "#3A4A42", marginBottom: 8 }}>Compte de résultat</div>
      <Table>
        <thead>
          <tr>
            <th style={thLeft}>Poste</th>
            {MONTHS.map((m, i) => <th key={m} style={{ ...th, color: isReal[farm][i] ? "#2F6B3F" : "#8A8578" }}>{m}</th>)}
            <th style={{ ...th, fontWeight: 800 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          <Row label="CA HT" values={arr.map((m) => m.ca)} bold />
          <Row label="Consommables" values={arr.map((m) => m.conso)} />
          <Row label="Transport" values={arr.map((m) => m.transport)} />
          <Row label="Divers / forfait" values={arr.map((m) => m.forfait)} />
          <Row label="Marge brute" values={arr.map((m) => m.mb)} bold />
          <Row label="Charges de structure" values={arr.map((m) => m.structure)} />
          <Row label="RBE" values={arr.map((m) => m.rbe)} bold />
          <PersonnelRow values={arr.map((m) => m.personnel)} site={farm} siteLabel={meta.label} collaborators={collaborators} setCollaborators={setCollaborators} transverseValues={arr.map((m) => m.transverse)} removedSeed={removedSeed} setRemovedSeed={setRemovedSeed} />
          <Row label="Après personnel" values={arr.map((m) => m.ap)} />
          <Row label="Charges externes" values={arr.map((m) => m.externes)} />
          <Row label="Résultat d'exploitation" values={arr.map((m) => m.re)} bold highlight />
        </tbody>
      </Table>
    </div>
  );
}

/* ---------- Coûts view ---------- */
function CoutsView({ liveCosts, setLiveCosts, isReal }) {
  const anyRealExists = FARM_KEYS.some((f) => isReal[f].some(Boolean));
  const update = (path, value) => {
    setLiveCosts((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      let obj = next;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      obj[path[path.length - 1]] = value === "" ? 0 : parseFloat(value);
      return next;
    });
  };
  const NumField = ({ label, path, suffix, step = "0.001" }) => {
    let v = liveCosts;
    path.forEach((k) => { v = v[k]; });
    const [local, setLocal] = useState(String(v));
    useEffect(() => { setLocal(String(v)); }, [v]);
    const handleChange = (e) => {
      const raw = e.target.value;
      setLocal(raw);
      // Only push a real update once the text is a complete, valid number — an
      // in-progress value like "-" or "-12." stays visible locally without ever
      // corrupting the stored value to NaN (which used to blank the field).
      if (raw === "" || !isNaN(parseFloat(raw))) update(path, raw);
    };
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #EFEBDE" }}>
        <span style={{ fontSize: 13.5 }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="number" step={step} value={local} onChange={handleChange}
            style={{ width: 100, textAlign: "right", border: "1px solid #E4E0D4", borderRadius: 5, padding: "4px 6px", fontSize: 13 }} />
          <span style={{ fontSize: 12, color: "#8A8578", width: 30 }}>{suffix}</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header title="Coûts & paramètres" subtitle="Un seul endroit pour tous les taux et charges du modèle" />
      <div style={{ background: "#FBF3E6", border: "1px solid #E9D6AC", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7A5A20", marginBottom: 22, lineHeight: 1.5 }}>
        ℹ️ Modifier une valeur ici <strong>ne change jamais les mois déjà marqués "réel"</strong> — ils gardent le paramètre qui était actif au moment où ils ont été clôturés.
        {anyRealExists ? " Ça n'affecte que les mois encore \"projetés\"." : ""}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Panel title="Coût de production (% du CA)">
          <NumField label="Paris — Micro-pousses S" path={["costRatio", "paris.microS"]} suffix="%×" />
          <NumField label="Paris — Micro-pousses XS" path={["costRatio", "paris.microXS"]} suffix="%×" />
          <NumField label="Paris — Fleurs" path={["costRatio", "paris.fleurs"]} suffix="%×" />
          <NumField label="Saint-Ouen — Herbes" path={["costRatio", "saintOuen.herbes"]} suffix="%×" />
          <NumField label="Marseille — Micro-pousses" path={["costRatio", "marseille.micro"]} suffix="%×" />
        </Panel>

        <Panel title="Transport (% du CA)">
          <NumField label="Paris" path={["transportRatio", "paris"]} suffix="%×" />
          <NumField label="Marseille" path={["transportRatio", "marseille"]} suffix="%×" />
          <div style={{ fontSize: 12, color: "#8A8578", paddingTop: 8 }}>Saint-Ouen : transport inclus dans le forfait mensuel (ci-dessous).</div>
        </Panel>

        <Panel title="Divers / forfait mensuel (€)">
          <NumField label="Paris" path={["forfait", "paris"]} suffix="€" step="1" />
          <NumField label="Saint-Ouen (forfait global)" path={["forfait", "saintOuen"]} suffix="€" step="1" />
          <NumField label="Marseille" path={["forfait", "marseille"]} suffix="€" step="1" />
        </Panel>

        <Panel title="Charges de structure fixes (€/mois)">
          <NumField label="Paris (loyer, élec, eau, frigo)" path={["structureFixed", "paris"]} suffix="€" step="1" />
          <NumField label="Saint-Ouen (loyer+eau+élec+assurance)" path={["structureFixed", "saintOuen"]} suffix="€" step="1" />
          <NumField label="Marseille (loyer)" path={["structureFixed", "marseille"]} suffix="€" step="1" />
          <NumField label="Fournitures & équipement (pool réparti au prorata CA)" path={["fournituresPool"]} suffix="€" step="1" />
        </Panel>

        <Panel title="Personnel">
          <div style={{ fontSize: 13, color: "#5A5648", lineHeight: 1.6 }}>
            Les salaires (directs par ferme et quote-part transverse) se gèrent maintenant dans l'onglet <strong>Collaborateurs</strong> — ajoutez, retirez ou modifiez une personne et son site là-bas, et tous les postes de personnel se recalculent automatiquement ici et dans les scénarios.
          </div>
        </Panel>

        <Panel title="Charges externes (€/mois)">
          <NumField label="Pool total (prestations, honoraires, assurances…) — réparti au prorata CA" path={["externesPool"]} suffix="€" step="1" />
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E4E0D4", borderRadius: 10, padding: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1C2B22", marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  );
}

/* ---------- Collaborateurs view ---------- */
function CollaborateursView({ collaborators2026, setCollaborators2026, collaborators2027, setCollaborators2027, removedSeed2026, setRemovedSeed2026, removedSeed2027, setRemovedSeed2027 }) {
  const [year, setYear] = useState(2026);
  const collaborators = year === 2026 ? collaborators2026 : collaborators2027;
  const setCollaborators = year === 2026 ? setCollaborators2026 : setCollaborators2027;
  const seedList = year === 2026 ? SEED_COLLABORATORS_2026 : SEED_COLLABORATORS_2027;
  const setRemovedSeed = year === 2026 ? setRemovedSeed2026 : setRemovedSeed2027;

  const updateName = (id, value) => setCollaborators((prev) => prev.map((c) => (c.id === id ? { ...c, name: value } : c)));
  const updateSite = (id, value) => setCollaborators((prev) => prev.map((c) => (c.id === id ? { ...c, site: value } : c)));
  const updateMonth = (id, monthIdx, value) => {
    setCollaborators((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const salary = [...c.salary];
      salary[monthIdx] = value === "" ? 0 : parseFloat(value);
      return { ...c, salary };
    }));
  };
  const applyForward = (id, monthIdx) => {
    setCollaborators((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const v = c.salary[monthIdx];
      return { ...c, salary: c.salary.map((x, i) => (i >= monthIdx ? v : x)) };
    }));
  };
  const remove = (id) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
    recordSeedRemoval(id, seedList, setRemovedSeed);
  };
  const addTo = (site) => setCollaborators((prev) => [...prev, { id: "c" + Date.now() + Math.random().toString(36).slice(2, 5), name: "Nouveau collaborateur", site, salary: Array(12).fill(0), ...(site === "transverse" ? { splits: { ...DEFAULT_TRANSVERSE_SPLIT } } : {}) }]);
  const updateSplit = (id, farm, value) => {
    const pct = value === "" ? 0 : parseFloat(value);
    setCollaborators((prev) => prev.map((c) => (c.id === id ? { ...c, splits: { ...(c.splits || DEFAULT_TRANSVERSE_SPLIT), [farm]: pct } } : c)));
  };
  const copyFromOtherYear = (id) => {
    const otherList = year === 2026 ? collaborators2027 : collaborators2026;
    const other = otherList.find((c) => c.id === id);
    if (!other) return;
    setCollaborators((prev) => prev.map((c) => (c.id === id ? { ...c, salary: [...other.salary] } : c)));
  };
  const otherYearHasSame = (id) => (year === 2026 ? collaborators2027 : collaborators2026).some((c) => c.id === id);
  const toggleActive = (id) => setCollaborators((prev) => prev.map((c) => (c.id === id ? { ...c, active: c.active === false } : c)));

  const sites = ["paris", "saintOuen", "marseille", "transverse"];
  const bySite = { paris: [], saintOuen: [], marseille: [], transverse: [] };
  collaborators.forEach((c) => bySite[c.site]?.push(c));
  const monthlyTotalBySite = (site) => {
    const arr = Array(12).fill(0);
    bySite[site].forEach((c) => c.salary.forEach((v, i) => { arr[i] += parseFloat(v) || 0; }));
    return arr;
  };
  const grandMonthly = Array(12).fill(0);
  collaborators.forEach((c) => c.salary.forEach((v, i) => { grandMonthly[i] += parseFloat(v) || 0; }));

  return (
    <div>
      <Header title="Collaborateurs" subtitle="Salaires mois par mois (coût employeur) — ajoutez, retirez, réaffectez ou ajustez un mois précis, tout se recalcule en direct" />

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[2026, 2027].map((y) => (
          <button key={y} onClick={() => setYear(y)} style={{
            border: "1px solid " + (year === y ? "#5C7A5E" : "#E4E0D4"),
            background: year === y ? "#5C7A5E" : "#fff",
            color: year === y ? "#fff" : "#3A4A42",
            borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            {y}
          </button>
        ))}
      </div>
      <div style={{ background: "#FBF3E6", border: "1px solid #E9D6AC", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#7A5A20", marginBottom: 18, lineHeight: 1.5 }}>
        ℹ️ Les listes 2026 et 2027 sont <strong>entièrement indépendantes</strong> — ajouter, modifier ou retirer quelqu'un ici n'affecte jamais l'autre année. Utilisez le bouton ↺ pour recopier le salaire de l'autre année si besoin.
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        <StatCard label="Paris (moy./mois)" value={money(-sum(monthlyTotalBySite("paris")) / 12)} accent={FARM_META.paris.accent} />
        <StatCard label="Saint-Ouen (moy./mois)" value={money(-sum(monthlyTotalBySite("saintOuen")) / 12)} accent={FARM_META.saintOuen.accent} />
        <StatCard label="Marseille (moy./mois)" value={money(-sum(monthlyTotalBySite("marseille")) / 12)} accent={FARM_META.marseille.accent} />
        <StatCard label="Transverse (moy./mois)" value={money(-sum(monthlyTotalBySite("transverse")) / 12)} accent="#B5502F" />
        <StatCard label="Masse salariale totale (moy./mois)" value={money(-sum(grandMonthly) / 12)} accent="#1C2B22" />
      </div>

      {sites.map((site) => (
        <div key={site} style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#3A4A42", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: site === "transverse" ? "#B5502F" : FARM_META[site]?.accent, display: "inline-block" }} />
            {SITE_LABEL[site]}
          </div>
          <Table>
            <thead>
              <tr>
                <th style={thLeft}>Nom</th>
                {MONTHS.map((m) => <th key={m} style={th}>{m}</th>)}
                <th style={th}>Total</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {bySite[site].length === 0 && (
                <tr><td colSpan={15} style={{ padding: "10px", color: "#8A8578", fontSize: 12.5 }}>Personne pour l'instant.</td></tr>
              )}
              {bySite[site].map((c) => {
                const rowTotal = sum(c.salary);
                const splits = c.splits || DEFAULT_TRANSVERSE_SPLIT;
                const splitSum = FARM_KEYS.reduce((s, f) => s + (parseFloat(splits[f]) || 0), 0);
                return (
                  <React.Fragment key={c.id}>
                  <tr style={year === 2027 && c.active === false ? { opacity: 0.45 } : undefined}>
                    <td style={{ ...td, textAlign: "left", padding: "5px 8px" }}>
                      <input value={c.name} onChange={(e) => updateName(c.id, e.target.value)}
                        style={{ border: "1px solid #E4E0D4", borderRadius: 5, padding: "5px 7px", fontSize: 12.5, width: 170 }} />
                    </td>
                    {c.salary.map((v, mi) => (
                      <td key={mi} style={{ ...td, padding: "4px 3px" }}>
                        <input
                          type="number" step="10" value={v}
                          onChange={(e) => updateMonth(c.id, mi, e.target.value)}
                          onDoubleClick={() => applyForward(c.id, mi)}
                          title="Double-cliquer pour appliquer ce montant à ce mois et tous les suivants"
                          style={{ border: "1px solid #E4E0D4", borderRadius: 5, padding: "4px 3px", fontSize: 11.5, textAlign: "right", boxSizing: "border-box" }}
                        />
                      </td>
                    ))}
                    <td style={{ ...td, fontWeight: 700 }}>
                      {money(-rowTotal)}
                      {year === 2027 && c.active === false && <span style={{ display: "block", fontSize: 10, color: "#A34328", fontWeight: 700 }}>En pause</span>}
                    </td>
                    <td style={{ ...td, padding: "4px 6px", whiteSpace: "nowrap" }}>
                      {year === 2027 && (
                        <button onClick={() => toggleActive(c.id)} title={c.active === false ? "Réactiver pour 2027" : "Mettre en pause pour 2027 (compte pour 0€ partout)"}
                          style={{
                            border: "none", borderRadius: 5, padding: "3px 7px", cursor: "pointer", fontSize: 11, fontWeight: 700, marginRight: 4,
                            background: c.active === false ? "#EEF4EC" : "#FBF3E6", color: c.active === false ? "#2F6B3F" : "#A3752F",
                          }}>
                          {c.active === false ? "▶ Réactiver" : "⏸ Pause"}
                        </button>
                      )}
                      <select value={c.site} onChange={(e) => updateSite(c.id, e.target.value)}
                        style={{ border: "1px solid #E4E0D4", borderRadius: 5, padding: "3px 4px", fontSize: 11, background: "#fff", marginRight: 4 }}>
                        <option value="paris">Paris</option>
                        <option value="saintOuen">St-Ouen</option>
                        <option value="marseille">Marseille</option>
                        <option value="transverse">Transverse</option>
                      </select>
                      {otherYearHasSame(c.id) && (
                        <button onClick={() => copyFromOtherYear(c.id)} title={`Recopier le salaire ${year === 2026 ? 2027 : 2026}`}
                          style={{ border: "none", background: "#EEF4EC", color: "#2F6B3F", borderRadius: 5, padding: "3px 7px", cursor: "pointer", fontSize: 11, fontWeight: 700, marginRight: 4 }}>
                          ↺
                        </button>
                      )}
                      <button onClick={() => remove(c.id)} title="Retirer"
                        style={{ border: "none", background: "#F9D9D9", color: "#A34328", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                        ✕
                      </button>
                    </td>
                  </tr>
                  {site === "transverse" && (
                    <tr style={{ background: "#FBF9F3" }}>
                      <td colSpan={15} style={{ padding: "4px 8px 10px 8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 11.5, color: "#6E6A5D" }}>
                          <span style={{ fontWeight: 600 }}>Répartition fixe :</span>
                          {FARM_KEYS.map((f) => (
                            <span key={f} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              {FARM_META[f].label}
                              <input
                                type="number" step="1" value={splits[f] ?? 0}
                                onChange={(e) => updateSplit(c.id, f, e.target.value)}
                                style={{ width: 52, border: "1px solid #E4E0D4", borderRadius: 5, padding: "3px 5px", fontSize: 11.5, textAlign: "right" }}
                              />
                              %
                            </span>
                          ))}
                          <span style={{ fontWeight: 700, color: Math.abs(splitSum - 100) < 0.01 ? "#2F6B3F" : "#A34328" }}>
                            = {Math.round(splitSum * 10) / 10}% {Math.abs(splitSum - 100) >= 0.01 && "⚠️ devrait sommer à 100%"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })}
              <tr>
                <td style={{ ...tdLeft, fontWeight: 700 }}>Sous-total</td>
                {monthlyTotalBySite(site).map((v, i) => <td key={i} style={{ ...td, fontWeight: 700 }}>{money(-v)}</td>)}
                <td style={{ ...td, fontWeight: 800 }}>{money(-sum(monthlyTotalBySite(site)))}</td>
                <td></td>
              </tr>
            </tbody>
          </Table>
          <button onClick={() => addTo(site)} style={{
            marginTop: 8, border: "1px solid #5C7A5E", background: "#fff", color: "#5C7A5E", borderRadius: 7,
            padding: "6px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          }}>
            + Ajouter à {SITE_LABEL[site]}
          </button>
        </div>
      ))}

      <div style={{ fontSize: 12, color: "#8A8578", marginTop: 4, lineHeight: 1.5 }}>
        Astuce : double-cliquez une case pour appliquer ce montant à ce mois-là et à tous les mois suivants. "Transverse (groupe)" concerne les personnes qui travaillent pour toutes les fermes — leur coût est réparti selon le <strong>% fixe que vous réglez pour chacune</strong> (par défaut, calculé sur le prorata CA moyen actuel). Si une ferme ferme dans un scénario, son % est redistribué proportionnellement entre les fermes restantes (même coût total). La liste <strong>2026</strong> alimente les onglets de ferme et le point mort. La liste <strong>2027</strong> alimente le Budget 2027 et les Scénarios — les deux utilisent exactement le même moteur de calcul. En 2027 uniquement, le bouton <strong>⏸ Pause</strong> permet de tester "sans cette personne" sans la supprimer : son salaire et ses réglages restent enregistrés, mais elle compte pour 0 € partout tant qu'elle est en pause — cliquez sur ▶ Réactiver pour la remettre.
      </div>
    </div>
  );
}

/* ---------- Scenarios view ---------- */
function scenarioDescription(config) {
  const parts = [];
  if (config.closeSO) parts.push("Saint-Ouen ferme complètement");
  else if (config.restructureSO) parts.push("Saint-Ouen reste ouvert avec une équipe réduite (Javier + intermittent + stagiaire)");
  if (config.closeMars) parts.push(config.keepSDF ? "Marseille ferme, Salade de Fruits repris par Paris" : "Marseille ferme intégralement (Salade de Fruits perdu)");
  if (parts.length === 0) return "Aucun changement — situation actuelle.";
  return parts.join(" · ") + ".";
}

const ZERO_SHARE = { paris: 0, saintOuen: 0, marseille: 0 };
const BASELINE_CONFIG = { closeSO: false, closeMars: false, keepSDF: false, restructureSO: false };

function ScenariosView({ computed, derivedCosts2027, liveCosts, scenarioParams, setScenarioParams, collaborators2027, budget2027, setBudget2027 }) {
  const update = (key, value) => setScenarioParams((p) => ({ ...p, [key]: value === "" ? 0 : parseFloat(value) }));
  const updateBudgetParam = (field, value) => {
    setBudget2027((prev) => ({ ...prev, [field]: value === "" ? 0 : parseFloat(value) }));
  };
  const transverseCollaborators = useMemo(() => collaborators2027.filter((c) => c.site === "transverse" && c.active !== false), [collaborators2027]);

  const baseline = useMemo(
    () => compute2027Scenario(BASELINE_CONFIG, computed, derivedCosts2027, liveCosts, scenarioParams, budget2027.growthPct, budget2027.pricePct, budget2027.grossisteShare, transverseCollaborators),
    [computed, derivedCosts2027, liveCosts, scenarioParams, transverseCollaborators, budget2027]
  );
  const groupRE = annualize(baseline.groupe, "re");

  const scenarios = useMemo(() => {
    return SCENARIO_2027_CONFIGS.map((config) => {
      const b = compute2027Scenario(config, computed, derivedCosts2027, liveCosts, scenarioParams, budget2027.growthPct, budget2027.pricePct, budget2027.grossisteShare, transverseCollaborators);
      return {
        key: config.key,
        title: config.label,
        result: annualize(b.groupe, "re"),
        description: scenarioDescription(config),
        accent: config.closeSO && config.closeMars ? "#A34328" : config.restructureSO ? "#5C7A5E" : "#3E7A8C",
      };
    }).sort((a, b) => a.result - b.result);
  }, [computed, derivedCosts2027, liveCosts, scenarioParams, transverseCollaborators, budget2027]);

  return (
    <div>
      <Header title="Scénarios d'optimisation" subtitle={`Base : résultat Groupe actuel ${money(groupRE, { forceSign: true })}/an — classés du moins bon au meilleur. Vue de synthèse du Budget 2027 : même moteur, mêmes curseurs de croissance/prix, pour les 8 scénarios en un coup d'œil.`} />

      <div style={{ display: "flex", gap: 20, marginBottom: 22, flexWrap: "wrap" }}>
        <Panel title="Hausse tarifaire Grossistes + Traiteurs (marge pure, aucun impact coût)">
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
            <input type="number" step="0.5" value={budget2027.pricePct} onChange={(e) => updateBudgetParam("pricePct", e.target.value)}
              style={{ width: 90, border: "1px solid #E4E0D4", borderRadius: 5, padding: "6px 8px", fontSize: 14, textAlign: "right" }} />
            <span style={{ fontSize: 13, color: "#8A8578" }}>% — partagé avec l'onglet Budget 2027</span>
          </div>
        </Panel>
        <Panel title="Croissance globale du CA (impacte les coûts à la même clé)">
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
            <input type="number" step="0.5" value={budget2027.growthPct} onChange={(e) => updateBudgetParam("growthPct", e.target.value)}
              style={{ width: 90, border: "1px solid #E4E0D4", borderRadius: 5, padding: "6px 8px", fontSize: 14, textAlign: "right" }} />
            <span style={{ fontSize: 13, color: "#8A8578" }}>% — partagé avec l'onglet Budget 2027</span>
          </div>
        </Panel>
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 22, flexWrap: "wrap" }}>
        <Panel title="Salade de Fruits (fermeture Marseille)">
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <ParamField label="Part de CA Marseille = Salade de Fruits" value={scenarioParams.sdfSharePct} onChange={(v) => update("sdfSharePct", v)} suffix="%" />
            <ParamField label="Transport Paris → client / mois" value={scenarioParams.sdfTransportMonthly} onChange={(v) => update("sdfTransportMonthly", v)} suffix="€" step="10" />
          </div>
        </Panel>
        <Panel title="Saint-Ouen restructuré">
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <ParamField label="Salarié permanent / mois" value={scenarioParams.soJavier} onChange={(v) => update("soJavier", v)} suffix="€" step="10" />
            <ParamField label="Intermittent SMIC / mois" value={scenarioParams.soIntermSmic} onChange={(v) => update("soIntermSmic", v)} suffix="€" step="10" />
            <ParamField label="Durée intermittent" value={scenarioParams.soIntermMonths} onChange={(v) => update("soIntermMonths", v)} suffix="mois" step="1" />
            <ParamField label="Stagiaire / mois" value={scenarioParams.soStagiaire} onChange={(v) => update("soStagiaire", v)} suffix="€" step="10" />
            <ParamField label="Durée stagiaire" value={scenarioParams.soStagiaireMonths} onChange={(v) => update("soStagiaireMonths", v)} suffix="mois" step="1" />
          </div>
        </Panel>
      </div>

      {scenarios.map((s, i) => (
        <ScenarioCard
          key={s.key}
          n={i + 1} title={s.title} accent={s.accent}
          result={s.result} base={groupRE}
          description={s.description}
        />
      ))}

      <div style={{ fontSize: 12, color: "#8A8578", marginTop: 4, lineHeight: 1.5 }}>
        "Fermer Saint-Ouen" et "Restructurer Saint-Ouen" sont deux options alternatives (non cumulables). Les scénarios Marseille (garder ou perdre Salade de Fruits, seule ou combinée à Saint-Ouen) couvrent les combinaisons possibles. Le personnel utilisé ici vient des salaires <strong>2027</strong> (onglet Collaborateurs) — identiques à ceux de l'onglet Budget 2027 à 0% croissance / 0% hausse tarifaire.
      </div>
    </div>
  );
}

/* ---------- Budget 2027 ---------- */
const SCENARIO_2027_CONFIGS = [
  { key: "s1", label: "Fermer Saint-Ouen", closeSO: true, closeMars: false, keepSDF: false, restructureSO: false },
  { key: "s2", label: "Fermer Marseille (garder Salade de Fruits)", closeSO: false, closeMars: true, keepSDF: true, restructureSO: false },
  { key: "s3", label: "Restructurer Saint-Ouen", closeSO: false, closeMars: false, keepSDF: false, restructureSO: true },
  { key: "s4", label: "Fermer Saint-Ouen ET Marseille (garder SDF)", closeSO: true, closeMars: true, keepSDF: true, restructureSO: false },
  { key: "s5", label: "Fermer Marseille (SDF) + Restructurer Saint-Ouen", closeSO: false, closeMars: true, keepSDF: true, restructureSO: true },
  { key: "s6", label: "Fermer Marseille (sans SDF) + Restructurer Saint-Ouen", closeSO: false, closeMars: true, keepSDF: false, restructureSO: true },
  { key: "s7", label: "Fermer Marseille (sans SDF) + Fermer Saint-Ouen", closeSO: true, closeMars: true, keepSDF: false, restructureSO: false },
  { key: "s8", label: "Fermer Marseille seule (sans Salade de Fruits)", closeSO: false, closeMars: true, keepSDF: false, restructureSO: false },
];

function soRestructuredPersonnel(m, scenarioParams) {
  const inSeasonInterm = m >= 2 && m < 2 + scenarioParams.soIntermMonths;
  const inSeasonStagiaire = m >= 2 && m < 2 + scenarioParams.soStagiaireMonths;
  return -(scenarioParams.soJavier
    + (inSeasonInterm ? scenarioParams.soIntermSmic : 0)
    + (inSeasonStagiaire ? scenarioParams.soStagiaire : 0));
}

// Builds a full 12-month 2027 P&L for one scenario, reusing 2026's monthly CA
// pattern (so seasonality carries over) scaled by growth (impacts costs too)
// and a price increase (pure margin, no cost impact). Personnel, structure and
// the shared cost pools (fournitures/transverse/externes) stay frozen at their
// December 2026 level, then re-shared by each farm's new 2027 CA weight.
const DEFAULT_TRANSVERSE_SPLIT = { paris: 100, saintOuen: 0, marseille: 0 };

// Allocates each transverse collaborator's monthly salary across active farms using
// their fixed % split. If a farm is closed, its share is redistributed proportionally
// among the remaining active farms (same total cost, just re-shared) rather than
// disappearing or falling back to a CA-based prorata.
function transverseByFarmForMonth(transverseCollaborators, isActive, m) {
  const result = { paris: 0, saintOuen: 0, marseille: 0 };
  transverseCollaborators.forEach((c) => {
    const salary = parseFloat(c.salary?.[m]) || 0;
    if (!salary) return;
    const splits = c.splits || DEFAULT_TRANSVERSE_SPLIT;
    const activeSum = FARM_KEYS.reduce((s, f) => s + (isActive[f] ? (splits[f] || 0) : 0), 0);
    if (activeSum <= 0) return;
    FARM_KEYS.forEach((f) => {
      if (!isActive[f]) return;
      result[f] += salary * ((splits[f] || 0) / activeSum);
    });
  });
  return result;
}

function compute2027Scenario(config, computed, derivedCosts2027, liveCosts, scenarioParams, growthPct, pricePct, grossisteShare, transverseCollaborators) {
  const g = 1 + growthPct / 100;
  const p = pricePct / 100;
  const isActive = { paris: true, saintOuen: !config.closeSO, marseille: !config.closeMars };

  const perFarmMonth = { paris: [], saintOuen: [], marseille: [] };
  for (let m = 0; m < 12; m++) {
    FARM_KEYS.forEach((f) => {
      if (!isActive[f]) {
        perFarmMonth[f][m] = { ca: 0, totalProdCost: 0, mb: 0 };
        return;
      }
      const base = computed.farms[f][m];
      const volumeCA = base.ca * g;
      const grossisteCA = volumeCA * ((grossisteShare[f] || 0) / 100);
      const priceUplift = grossisteCA * p;
      const ca = volumeCA + priceUplift;
      const conso = base.conso * g;
      const transport = base.transport * g;
      const forfait = base.forfait;
      const totalProdCost = conso + transport + forfait; // price uplift never touches cost
      perFarmMonth[f][m] = { ca, totalProdCost, mb: ca + totalProdCost };
    });

    if (config.closeMars && config.keepSDF) {
      const marsBase = computed.farms.marseille[m];
      const marsCostRatio = marsBase.ca ? (marsBase.conso + marsBase.transport + marsBase.forfait) / marsBase.ca : 0;
      const marsVolumeCA = marsBase.ca * g;
      const sdfVolumeCA = marsVolumeCA * (scenarioParams.sdfSharePct / 100);
      // Salade de Fruits is itself a wholesale (grossiste) account, so its full CA benefits from the price increase.
      const sdfCA = sdfVolumeCA * (1 + p);
      const sdfCost = sdfVolumeCA * marsCostRatio;
      perFarmMonth.paris[m].ca += sdfCA;
      perFarmMonth.paris[m].totalProdCost += sdfCost;
      perFarmMonth.paris[m].mb += sdfCA + sdfCost;
    }
  }

  const structureFixedBase = {
    paris: (liveCosts.structureFixed.paris || 0) - (config.closeMars && config.keepSDF ? scenarioParams.sdfTransportMonthly : 0),
    saintOuen: liveCosts.structureFixed.saintOuen || 0,
    marseille: liveCosts.structureFixed.marseille || 0,
  };
  const fournituresPoolFrozen = liveCosts.fournituresPool || 0;
  const externesPoolFrozen = liveCosts.externesPool || 0;

  const result = { paris: [], saintOuen: [], marseille: [] };
  const groupe = [];

  for (let m = 0; m < 12; m++) {
    const groupCA = FARM_KEYS.reduce((s, f) => s + perFarmMonth[f][m].ca, 0);
    const transverseByFarmMonth = transverseByFarmForMonth(transverseCollaborators || [], isActive, m);
    const g_ = { ca: 0, totalProdCost: 0, mb: 0, structure: 0, rbe: 0, personnel: 0, ap: 0, externes: 0, re: 0 };
    FARM_KEYS.forEach((f) => {
      const r = perFarmMonth[f][m];
      const caShare = groupCA ? r.ca / groupCA : 0;
      const fournitures = -fournituresPoolFrozen * caShare;
      const structure = (isActive[f] ? structureFixedBase[f] || 0 : 0) + (isActive[f] ? fournitures : 0);
      const rbe = r.mb + structure;
      const personnelDirect = f === "saintOuen" && config.restructureSO
        ? soRestructuredPersonnel(m, scenarioParams)
        : ((derivedCosts2027.personnelDirect[f] && derivedCosts2027.personnelDirect[f][m]) || 0);
      const transverse = -(transverseByFarmMonth[f] || 0);
      const personnel = (isActive[f] ? personnelDirect : 0) + (isActive[f] ? transverse : 0);
      const ap = rbe + personnel;
      const externes = -externesPoolFrozen * caShare;
      const re = ap + externes;
      result[f][m] = { ca: r.ca, totalProdCost: r.totalProdCost, mb: r.mb, structure, rbe, personnel, ap, externes, re };
      g_.ca += r.ca; g_.totalProdCost += r.totalProdCost; g_.mb += r.mb; g_.structure += structure;
      g_.rbe += rbe; g_.personnel += personnel; g_.ap += ap; g_.externes += externes; g_.re += re;
    });
    groupe.push(g_);
  }

  return { farms: result, groupe, isActive };
}

function PersonnelRow2027({ values, config, isActive, collaborators, setCollaborators, removedSeed, setRemovedSeed }) {
  const [expanded, setExpanded] = useState(false);
  const total = sum(values);

  const updateMonth = (id, monthIdx, value) => {
    setCollaborators((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const salary = [...c.salary];
      salary[monthIdx] = value === "" ? 0 : parseFloat(value);
      return { ...c, salary };
    }));
  };
  const updateName = (id, value) => setCollaborators((prev) => prev.map((c) => (c.id === id ? { ...c, name: value } : c)));
  const applyForward = (id, monthIdx) => {
    setCollaborators((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const v = c.salary[monthIdx];
      return { ...c, salary: c.salary.map((x, i) => (i >= monthIdx ? v : x)) };
    }));
  };
  const remove = (id) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
    recordSeedRemoval(id, SEED_COLLABORATORS_2027, setRemovedSeed);
  };
  const addTo = (site) => setCollaborators((prev) => [...prev, { id: "c" + Date.now() + Math.random().toString(36).slice(2, 5), name: "Nouveau collaborateur", site, salary: Array(12).fill(0) }]);

  const sitesToShow = FARM_KEYS.filter((f) => isActive[f]).concat(["transverse"]);

  return (
    <>
      <tr onClick={() => setExpanded((e) => !e)} style={{ cursor: "pointer" }}>
        <td style={{ ...tdLeft, fontWeight: 600 }}>
          <span style={{ display: "inline-block", width: 12, transition: "transform 0.15s", transform: expanded ? "rotate(90deg)" : "none" }}>▸</span>
          {" "}Charges de personnel
        </td>
        {values.map((v, i) => (
          <td key={i} style={{ ...td, color: v < 0 ? "#A34328" : "#2A2A28" }}>{money(v)}</td>
        ))}
        <td style={{ ...td, fontWeight: 800, color: total < 0 ? "#A34328" : "#1C2B22" }}>{money(total)}</td>
      </tr>
      {expanded && sitesToShow.map((site) => {
        const isRestructuredSO = site === "saintOuen" && config.restructureSO;
        if (isRestructuredSO) {
          return (
            <tr key={site} style={{ background: "#FBF9F3" }}>
              <td colSpan={values.length + 2} style={{ padding: "10px 16px 10px 30px", fontSize: 12.5, color: "#7A5A20", fontStyle: "italic" }}>
                Saint-Ouen restructuré : Javier + intermittent + stagiaire — réglable dans l'onglet <strong>Scénarios</strong>, pas ici.
              </td>
            </tr>
          );
        }
        const people = collaborators.filter((c) => c.site === site);
        return (
          <React.Fragment key={site}>
            <tr style={{ background: "#F0EEE4" }}>
              <td colSpan={values.length + 2} style={{ padding: "5px 10px 5px 30px", fontSize: 11.5, fontWeight: 700, color: "#5A5648", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                {SITE_LABEL[site]}
              </td>
            </tr>
            {people.length === 0 && (
              <tr style={{ background: "#FBF9F3" }}>
                <td colSpan={values.length + 2} style={{ padding: "8px 16px 8px 30px", color: "#8A8578", fontSize: 12.5 }}>Personne pour l'instant.</td>
              </tr>
            )}
            {people.map((p) => {
              const arr = p.salary;
              const rowTotal = sum(arr);
              return (
                <tr key={p.id} style={{ background: "#FBF9F3" }}>
                  <td style={{ ...td, textAlign: "left", padding: "5px 10px 5px 40px" }}>
                    <input value={p.name} onChange={(e) => updateName(p.id, e.target.value)}
                      style={{ border: "1px solid #E4E0D4", borderRadius: 5, padding: "4px 6px", fontSize: 12, width: "100%", boxSizing: "border-box" }} />
                  </td>
                  {arr.map((v, mi) => (
                    <td key={mi} style={{ ...td, padding: "4px 3px" }}>
                      <input
                        type="number" step="10" value={v}
                        onChange={(e) => updateMonth(p.id, mi, e.target.value)}
                        onDoubleClick={() => applyForward(p.id, mi)}
                        title="Double-cliquer pour appliquer ce montant à ce mois et tous les suivants"
                        style={{ border: "1px solid #E4E0D4", borderRadius: 5, padding: "4px 3px", fontSize: 11.5, textAlign: "right", boxSizing: "border-box" }}
                      />
                    </td>
                  ))}
                  <td style={{ ...td, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {money(-rowTotal)}
                    <button onClick={() => remove(p.id)} style={{ marginLeft: 6, border: "none", background: "#F9D9D9", color: "#A34328", borderRadius: 5, padding: "2px 7px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✕</button>
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "#FBF9F3" }}>
              <td colSpan={values.length + 2} style={{ padding: "4px 16px 10px 30px" }}>
                <button onClick={() => addTo(site)} style={{ border: "1px solid #5C7A5E", background: "#fff", color: "#5C7A5E", borderRadius: 6, padding: "4px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                  + Ajouter à {SITE_LABEL[site]}
                </button>
              </td>
            </tr>
          </React.Fragment>
        );
      })}
      {expanded && (
        <tr>
          <td colSpan={values.length + 2} style={{ padding: "6px 16px 12px", fontSize: 11, color: "#8A8578", lineHeight: 1.5 }}>
            Ces montants viennent des salaires <strong>2027</strong> (onglet Collaborateurs) et se modifient directement ici. Double-cliquez une case pour l'appliquer à ce mois et aux suivants.
          </td>
        </tr>
      )}
    </>
  );
}

function Budget2027View({ computed, derivedCosts2027, liveCosts, scenarioParams, budget2027, setBudget2027, collaborators, setCollaborators, removedSeed, setRemovedSeed }) {
  const [scenarioKey, setScenarioKey] = useState("s1");
  const config = SCENARIO_2027_CONFIGS.find((c) => c.key === scenarioKey);
  const transverseCollaborators = useMemo(() => collaborators.filter((c) => c.site === "transverse" && c.active !== false), [collaborators]);

  const updateParam = (field, value) => {
    setBudget2027((prev) => ({ ...prev, [field]: value === "" ? 0 : parseFloat(value) }));
  };
  const updateShare = (farm, value) => {
    setBudget2027((prev) => ({ ...prev, grossisteShare: { ...prev.grossisteShare, [farm]: value === "" ? 0 : parseFloat(value) } }));
  };

  const budget = useMemo(
    () => compute2027Scenario(config, computed, derivedCosts2027, liveCosts, scenarioParams, budget2027.growthPct, budget2027.pricePct, budget2027.grossisteShare, transverseCollaborators),
    [config, computed, derivedCosts2027, liveCosts, scenarioParams, budget2027, transverseCollaborators]
  );

  const annualRE = annualize(budget.groupe, "re");
  const annualCA = annualize(budget.groupe, "ca");

  const sortedConfigs = useMemo(() => {
    return SCENARIO_2027_CONFIGS.map((c) => {
      const b = compute2027Scenario(c, computed, derivedCosts2027, liveCosts, scenarioParams, budget2027.growthPct, budget2027.pricePct, budget2027.grossisteShare, transverseCollaborators);
      return { ...c, result: annualize(b.groupe, "re") };
    }).sort((a, b) => a.result - b.result);
  }, [computed, derivedCosts2027, liveCosts, scenarioParams, budget2027, transverseCollaborators]);

  return (
    <div>
      <Header title="Budget 2027" subtitle="Un budget mensualisé, basé sur la saisonnalité 2026 — les 2 curseurs sont partagés avec l'onglet Scénarios (les modifier ici les change aussi là-bas, et inversement)" />

      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        <Panel title="Hausse tarifaire Grossistes + Traiteurs (marge pure, aucun impact coût)">
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
            <input type="number" step="0.5" value={budget2027.pricePct} onChange={(e) => updateParam("pricePct", e.target.value)}
              style={{ width: 90, border: "1px solid #E4E0D4", borderRadius: 5, padding: "6px 8px", fontSize: 14, textAlign: "right" }} />
            <span style={{ fontSize: 13, color: "#8A8578" }}>% sur la part Grossistes+Traiteurs de chaque ferme</span>
          </div>
        </Panel>
        <Panel title="Croissance globale du CA (impacte les coûts à la même clé)">
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
            <input type="number" step="0.5" value={budget2027.growthPct} onChange={(e) => updateParam("growthPct", e.target.value)}
              style={{ width: 90, border: "1px solid #E4E0D4", borderRadius: 5, padding: "6px 8px", fontSize: 14, textAlign: "right" }} />
            <span style={{ fontSize: 13, color: "#8A8578" }}>% appliqué à tout le CA et aux coûts variables</span>
          </div>
        </Panel>
        <Panel title="Part de CA Grossistes + Traiteurs par ferme">
          {FARM_KEYS.map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "5px 0" }}>
              <span style={{ fontSize: 13 }}>{FARM_META[f].label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="number" step="1" value={budget2027.grossisteShare[f]} onChange={(e) => updateShare(f, e.target.value)}
                  style={{ width: 60, border: "1px solid #E4E0D4", borderRadius: 5, padding: "4px 6px", fontSize: 13, textAlign: "right" }} />
                <span style={{ fontSize: 12, color: "#8A8578" }}>%</span>
              </div>
            </div>
          ))}
        </Panel>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#3A4A42", marginBottom: 8 }}>Scénario (classés du moins bon au meilleur)</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {sortedConfigs.map((c) => (
          <button key={c.key} onClick={() => setScenarioKey(c.key)} style={{
            border: "1px solid " + (scenarioKey === c.key ? "#5C7A5E" : "#E4E0D4"),
            background: scenarioKey === c.key ? "#5C7A5E" : "#fff",
            color: scenarioKey === c.key ? "#fff" : "#3A4A42",
            borderRadius: 8, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          }}>
            {c.label} <span style={{ opacity: 0.75, fontWeight: 500 }}>({money(c.result, { forceSign: true })})</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        <StatCard label="CA 2027 estimé" value={money(annualCA)} accent="#5C7A5E" />
        <StatCard label="Résultat d'exploitation 2027 estimé" value={money(annualRE, { forceSign: true })} tone={annualRE >= 0 ? "good" : "bad"} accent={annualRE >= 0 ? "#2F6B3F" : "#A34328"} />
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#3A4A42", marginBottom: 8 }}>Compte de résultat consolidé — {config.label}</div>
      <Table>
        <thead>
          <tr>
            <th style={thLeft}>Poste</th>
            {MONTHS.map((m) => <th key={m} style={th}>{m}</th>)}
            <th style={{ ...th, fontWeight: 800 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          <Row label="CA HT" values={budget.groupe.map((m) => m.ca)} bold />
          <Row label="Marge brute" values={budget.groupe.map((m) => m.mb)} />
          <Row label="Charges de structure" values={budget.groupe.map((m) => m.structure)} />
          <Row label="RBE" values={budget.groupe.map((m) => m.rbe)} />
          <PersonnelRow2027
            values={budget.groupe.map((m) => m.personnel)}
            config={config} isActive={budget.isActive}
            collaborators={collaborators} setCollaborators={setCollaborators}
            removedSeed={removedSeed} setRemovedSeed={setRemovedSeed}
          />
          <Row label="Après personnel" values={budget.groupe.map((m) => m.ap)} />
          <Row label="Charges externes" values={budget.groupe.map((m) => m.externes)} />
          <Row label="Résultat d'exploitation" values={budget.groupe.map((m) => m.re)} bold highlight />
        </tbody>
      </Table>

      <div style={{ height: 24 }} />
      <div style={{ fontSize: 13, fontWeight: 700, color: "#3A4A42", marginBottom: 8 }}>Détail par ferme (résultat d'exploitation)</div>
      <Table>
        <thead>
          <tr>
            <th style={thLeft}>Ferme</th>
            {MONTHS.map((m) => <th key={m} style={th}>{m}</th>)}
            <th style={{ ...th, fontWeight: 800 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {FARM_KEYS.map((f) => (
            <Row key={f} label={FARM_META[f].label + (budget.isActive[f] ? "" : " (fermée)")} values={budget.farms[f].map((m) => m.re)} />
          ))}
        </tbody>
      </Table>

      <div style={{ fontSize: 12, color: "#8A8578", marginTop: 12, lineHeight: 1.5 }}>
        Base : CA mensuel 2026 de chaque ferme active (saisonnalité conservée), majoré par les deux curseurs ci-dessus. Le personnel suit les salaires <strong>2027</strong> réglés dans l'onglet Collaborateurs (copie modifiable de 2026 par défaut) ; la structure fixe et les pools fournitures/externes restent au niveau actuel, re-répartis selon le nouveau poids de CA de chaque ferme. Saint-Ouen restructuré utilise les paramètres réglés dans l'onglet Scénarios (Javier, intermittent, stagiaire) à la place des salaires 2027 sur cette ferme.
      </div>
    </div>
  );
}

function ScenarioCard({ n, title, description, result, base, accent, children }) {
  const delta = result - base;
  return (
    <div style={{ background: "#fff", border: "1px solid #E4E0D4", borderRadius: 10, padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ background: accent, color: "#fff", fontSize: 12, fontWeight: 800, width: 22, height: 22, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
            <span style={{ fontWeight: 700, fontSize: 15.5 }}>{title}</span>
          </div>
          <div style={{ fontSize: 13, color: "#5A5648", lineHeight: 1.5, marginBottom: 12 }}>{description}</div>
          {children}
        </div>
        <div style={{ textAlign: "right", minWidth: 170 }}>
          <div style={{ fontSize: 11.5, color: "#8A8578", textTransform: "uppercase", letterSpacing: "0.03em" }}>Résultat Groupe estimé</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: result >= 0 ? "#2F6B3F" : "#A34328", fontVariantNumeric: "tabular-nums" }}>{money(result, { forceSign: true })}</div>
          <div style={{ fontSize: 12.5, color: delta >= 0 ? "#2F6B3F" : "#A34328", fontWeight: 600 }}>{delta >= 0 ? "+" : ""}{money(delta, { forceSign: false })} vs actuel</div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ fontSize: 12.5, color: "#5A5648", marginBottom: 2 }}>
      <span style={{ color: "#8A8578" }}>{label} : </span><strong>{value}</strong>
    </div>
  );
}

function ParamField({ label, value, onChange, suffix, step = "1" }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "#8A8578", marginBottom: 3 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <input type="number" step={step} value={value} onChange={(e) => onChange(e.target.value)}
          style={{ width: 90, border: "1px solid #E4E0D4", borderRadius: 5, padding: "4px 6px", fontSize: 13, textAlign: "right" }} />
        <span style={{ fontSize: 12, color: "#8A8578" }}>{suffix}</span>
      </div>
    </div>
  );
}
