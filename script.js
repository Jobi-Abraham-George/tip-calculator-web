// Role weights: cook = 1 unit/hr, cashier = 0.5 unit/hr
const ROLE_WEIGHT = { cook: 1, cashier: 0.5 };

// Default employees & name dropdown options
const DEFAULT_EMPLOYEES = [
  { name: "Tayseer", role: "cook",    start: "10:00", end: "18:00" },
  { name: "Ramjot",  role: "cook",    start: "10:00", end: "18:00" },
  { name: "Jobi",    role: "cook",    start: "10:00", end: "18:00" },
  { name: "Terry",   role: "cook",    start: "10:00", end: "18:00" },
  { name: "Lori",    role: "cashier", start: "12:00", end: "20:00" },
  { name: "Ryan",    role: "cashier", start: "12:00", end: "20:00" },
  { name: "Taryn",   role: "cashier", start: "12:00", end: "20:00" },
  { name: "Asha",    role: "cashier", start: "12:00", end: "20:00" },
];
const NAME_OPTIONS = DEFAULT_EMPLOYEES.map(e => e.name);

// In-memory state
let employees = [];
let tipEntries = [];


/*—— Employee Manager ——————————————————————————————————————————————*/

// LocalStorage load/save
function loadEmployees() {
  const saved = localStorage.getItem("tipCalcEmployees");
  employees = saved
    ? JSON.parse(saved)
    : DEFAULT_EMPLOYEES.slice();
}
function saveEmployees() {
  localStorage.setItem("tipCalcEmployees", JSON.stringify(employees));
}

// Render employee rows
function renderEmployeeTable() {
  const tbody = document.querySelector("#emp-table tbody");
  tbody.innerHTML = "";
  employees.forEach((e, i) => {
    const row = document.createElement("tr");

    // Name dropdown
    const nameTd = document.createElement("td");
    const nameSel = document.createElement("select");
    NAME_OPTIONS.forEach(n => {
      const opt = document.createElement("option");
      opt.value = n; opt.text = n;
      if (e.name === n) opt.selected = true;
      nameSel.append(opt);
    });
    nameSel.onchange = () => {
      employees[i].name = nameSel.value;
      saveEmployees();
    };
    nameTd.append(nameSel);
    row.append(nameTd);

    // Role dropdown
    const roleTd = document.createElement("td");
    const roleSel = document.createElement("select");
    ["cook","cashier"].forEach(r => {
      const opt = document.createElement("option");
      opt.value = r; opt.text = r;
      if (e.role === r) opt.selected = true;
      roleSel.append(opt);
    });
    roleSel.onchange = () => {
      employees[i].role = roleSel.value;
      saveEmployees();
    };
    roleTd.append(roleSel);
    row.append(roleTd);

    // Start time
    const startTd = document.createElement("td");
    const startIn = document.createElement("input");
    startIn.type  = "time";
    startIn.value = e.start;
    startIn.onchange = () => {
      employees[i].start = startIn.value;
      saveEmployees();
    };
    startTd.append(startIn);
    row.append(startTd);

    // End time
    const endTd = document.createElement("td");
    const endIn = document.createElement("input");
    endIn.type  = "time";
    endIn.value = e.end;
    endIn.onchange = () => {
      employees[i].end = endIn.value;
      saveEmployees();
    };
    endTd.append(endIn);
    row.append(endTd);

    // Remove button
    const rmTd = document.createElement("td");
    const rmBtn = document.createElement("button");
    rmBtn.textContent = "✕";
    rmBtn.onclick = () => {
      employees.splice(i,1);
      saveEmployees();
      renderEmployeeTable();
    };
    rmTd.append(rmBtn);
    row.append(rmTd);

    tbody.append(row);
  });
}

// Add employee
document.getElementById("add-emp").onclick = () => {
  employees.push({
    name:  NAME_OPTIONS[0],
    role:  "cook",
    start: "09:00",
    end:   "17:00"
  });
  saveEmployees();
  renderEmployeeTable();
};


/*—— Tip Manager ————————————————————————————————————————————————*/

// Render tip rows
function renderTipTable() {
  const tbody = document.querySelector("#tip-table tbody");
  tbody.innerHTML = "";
  tipEntries.forEach((t, i) => {
    const row = document.createElement("tr");

    // Source dropdown
    const srcTd = document.createElement("td");
    const srcSel = document.createElement("select");
    [
      { v: "til",  label: "Tip From TIL Machine" },
      { v: "jar",  label: "Tip From Jar" }
    ].forEach(o => {
      const opt = document.createElement("option");
      opt.value = o.v; opt.text = o.label;
      if (t.source === o.v) opt.selected = true;
      srcSel.append(opt);
    });
    srcSel.onchange = () => { tipEntries[i].source = srcSel.value; };
    srcTd.append(srcSel);
    row.append(srcTd);

    // Start
    const sTd = document.createElement("td");
    const sIn = document.createElement("input");
    sIn.type  = "time";
    sIn.value = t.start;
    sIn.onchange = () => { tipEntries[i].start = sIn.value; };
    sTd.append(sIn);
    row.append(sTd);

    // End
    const eTd = document.createElement("td");
    const eIn = document.createElement("input");
    eIn.type  = "time";
    eIn.value = t.end;
    eIn.onchange = () => { tipEntries[i].end = eIn.value; };
    eTd.append(eIn);
    row.append(eTd);

    // Amount
    const aTd = document.createElement("td");
    const aIn = document.createElement("input");
    aIn.type        = "number";
    aIn.step        = "0.01";
    aIn.min         = "0";
    aIn.placeholder = "0.00";
    aIn.value       = t.amount;
    aIn.onchange    = () => { tipEntries[i].amount = aIn.value; };
    aTd.append(aIn);
    row.append(aTd);

    // Remove
    const rTd = document.createElement("td");
    const rBtn = document.createElement("button");
    rBtn.textContent = "✕";
    rBtn.onclick = () => {
      tipEntries.splice(i,1);
      renderTipTable();
    };
    rTd.append(rBtn);
    row.append(rTd);

    tbody.append(row);
  });
}

// Add tip row
document.getElementById("add-tip").onclick = () => {
  tipEntries.push({ source:"til", start:"", end:"", amount:"" });
  renderTipTable();
};


/*—— Calculation Logic ——————————————————————————————————————————*/

function toMinutes(str) {
  const [h,m] = str.split(":").map(Number);
  return h*60 + m;
}
function overlap(a0,a1,b0,b1) {
  return Math.max(0, Math.min(a1,b1) - Math.max(a0,b0));
}

function allocateEntry(entry, emps, totals) {
  const amt = parseFloat(entry.amount);
  if (!entry.start || !entry.end || isNaN(amt) || amt<=0) return;

  const p0 = toMinutes(entry.start), p1 = toMinutes(entry.end);
  let totalW = 0, wts = {};

  emps.forEach(e => {
    const e0 = toMinutes(e.start), e1 = toMinutes(e.end);
    const mins = overlap(p0,p1,e0,e1);
    const w    = (mins/60) * (ROLE_WEIGHT[e.role]||0);
    wts[e.name] = w;
    totalW += w;
  });
  if (totalW===0) return;

  const perUnit = amt/totalW;
  emps.forEach(e => {
    totals[e.name] = (totals[e.name]||0) + wts[e.name]*perUnit;
  });
}

function calculateTips() {
  // Source totals
  let totalTil = 0, totalJar = 0;
  tipEntries.forEach(t => {
    const a = parseFloat(t.amount)||0;
    if (t.source==="til") totalTil += a;
    if (t.source==="jar") totalJar += a;
  });
  document.getElementById("total-til").textContent = totalTil.toFixed(2);
  document.getElementById("total-jar").textContent = totalJar.toFixed(2);
  document.getElementById("total-all").textContent = (totalTil+totalJar).toFixed(2);

  // Per-employee breakdown
  const totals = {};
  employees.forEach(e => totals[e.name]=0);
  tipEntries.forEach(t => allocateEntry(t, employees, totals));

  document.getElementById("output").textContent =
    Object.entries(totals)
      .map(([n,v]) => `${n}: $${v.toFixed(2)}`)
      .join("\n");
}

document.getElementById("calc").onclick = calculateTips;


/*—— On load ————————————————————————————————————————————————————*/
loadEmployees();
renderEmployeeTable();
renderTipTable();
