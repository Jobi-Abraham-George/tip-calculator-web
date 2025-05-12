// Role weights
const ROLE_WEIGHT = { cook: 1, cashier: 0.5 };

// Parse “HH:MM” into minutes since midnight
function toMin(t) {
  const [h,m] = t.split(":").map(Number);
  return h*60 + m;
}

// Overlap in minutes
function overlap(aStart,aEnd,bStart,bEnd) {
  return Math.max(0, Math.min(aEnd,bEnd) - Math.max(aStart,bStart));
}

document.getElementById("calc").addEventListener("click", () => {
  let employees, periods;
  try {
    employees = JSON.parse(document.getElementById("employees").value);
    periods   = JSON.parse(document.getElementById("periods").value);
  } catch {
    return alert("Invalid JSON in inputs");
  }

  // Initialize totals
  const totals = {};
  employees.forEach(e => totals[e.name]=0);

  periods.forEach(p => {
    const p0 = toMin(p.start), p1 = toMin(p.end);

    ["til","jar"].forEach(src => {
      const pot = p[src];
      if (!pot) return;

      // compute weights
      const weights = {};
      let sumW = 0;
      employees.forEach(e => {
        const e0 = toMin(e.start), e1 = toMin(e.end);
        const mins = overlap(p0,p1,e0,e1);
        const w = mins/60 * (ROLE_WEIGHT[e.role]||0);
        weights[e.name] = w;
        sumW += w;
      });
      if (sumW===0) return;

      const perUnit = pot/sumW;
      Object.entries(weights).forEach(([name,w]) => {
        totals[name] += w*perUnit;
      });
    });
  });

  // Display
  document.getElementById("output").textContent =
    Object.entries(totals)
          .map(([n,a])=>`${n}: $${a.toFixed(2)}`)
          .join("\n");
});
