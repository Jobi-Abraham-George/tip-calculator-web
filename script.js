// Role weights: cook = 1 unit/hr, cashier = 0.5 unit/hr
const ROLE_WEIGHT = { cook: 1, cashier: 0.5 };

// Default employees & name dropdown options
const DEFAULT_EMPLOYEES = [
  { name: "Tayseer", role: "cook",    start: "10:00", end: "18:00" },
  { name: "Ramjot",  role: "cook",    start: "10:00", end: "18:00" },
  { name: "Jobi",    role: "cook",    start: "10:00", end: "18:00" },
  { name: "Terry",   role: "cook",    start: "10:00", end: "18:00" },
  { name: "Ali",     role: "cook",    start: "10:00", end: "18:00" },
  { name: "Lori",    role: "cashier", start: "12:00", end: "20:00" },
  { name: "Ryan",    role: "cashier", start: "12:00", end: "20:00" },
  { name: "Taryn",   role: "cashier", start: "12:00", end: "20:00" },
  { name: "Asha",    role: "cashier", start: "12:00", end: "20:00" },
];
const NAME_OPTIONS = DEFAULT_EMPLOYEES.map(e => e.name);

// In-memory state
let employees = [];
let tipEntries = [];


/*—— Utility Functions ——————————————————————————————————————————*/

// Show validation error tooltip
function showValidationError(element, message) {
  element.classList.add('error');
  element.title = message;
  
  // Remove error after 3 seconds
  setTimeout(() => {
    element.classList.remove('error');
    element.title = '';
  }, 3000);
}

// Validate time range (end time should be after start time)
function validateTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return false;
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  return end > start;
}

// Validate tip amount
function validateTipAmount(amount) {
  const value = parseFloat(amount);
  return !isNaN(value) && value >= 0;
}

// Auto-save with debouncing
let autoSaveTimeout;
function triggerAutoSave() {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    calculateTips();
    showSaveIndicator();
  }, 500); // Wait 500ms after last change
}

// Show save indicator
function showSaveIndicator() {
  let indicator = document.getElementById('save-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'save-indicator';
    indicator.className = 'save-indicator';
    indicator.textContent = '✓ Saved';
    document.body.appendChild(indicator);
  }
  
  indicator.classList.add('show');
  setTimeout(() => {
    indicator.classList.remove('show');
  }, 2000);
}


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

// LocalStorage load/save for tip entries
function loadTipEntries() {
  const saved = localStorage.getItem("tipCalcTipEntries");
  tipEntries = saved ? JSON.parse(saved) : [];
}
function saveTipEntries() {
  localStorage.setItem("tipCalcTipEntries", JSON.stringify(tipEntries));
}

// Render employee rows
function renderEmployeeTable() {
  const tbody = document.querySelector("#emp-table tbody");
  tbody.innerHTML = "";
  employees.forEach((e, i) => {
    const row = document.createElement("tr");

    // Name dropdown
    const nameTd = document.createElement("td");
    nameTd.setAttribute('data-label', 'Name');
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
      triggerAutoSave();
    };
    nameTd.append(nameSel);
    row.append(nameTd);

    // Role dropdown
    const roleTd = document.createElement("td");
    roleTd.setAttribute('data-label', 'Role');
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
      triggerAutoSave();
    };
    roleTd.append(roleSel);
    row.append(roleTd);

    // Start time
    const startTd = document.createElement("td");
    startTd.setAttribute('data-label', 'Start');
    const startIn = document.createElement("input");
    startIn.type  = "time";
    startIn.value = e.start;
    startIn.onchange = () => {
      const endTime = employees[i].end;
      if (!validateTimeRange(startIn.value, endTime)) {
        showValidationError(startIn, 'Start time must be before end time');
        return;
      }
      employees[i].start = startIn.value;
      saveEmployees();
      triggerAutoSave();
    };
    startTd.append(startIn);
    row.append(startTd);

    // End time
    const endTd = document.createElement("td");
    endTd.setAttribute('data-label', 'End');
    const endIn = document.createElement("input");
    endIn.type  = "time";
    endIn.value = e.end;
    endIn.onchange = () => {
      const startTime = employees[i].start;
      if (!validateTimeRange(startTime, endIn.value)) {
        showValidationError(endIn, 'End time must be after start time');
        return;
      }
      employees[i].end = endIn.value;
      saveEmployees();
      triggerAutoSave();
    };
    endTd.append(endIn);
    row.append(endTd);

    // Remove button
    const rmTd = document.createElement("td");
    rmTd.setAttribute('data-label', 'Remove');
    const rmBtn = document.createElement("button");
    rmBtn.textContent = "✕";
    rmBtn.onclick = () => {
      if (confirm(`Are you sure you want to remove ${e.name}? This action cannot be undone.`)) {
        employees.splice(i,1);
        saveEmployees();
        renderEmployeeTable();
        triggerAutoSave();
      }
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
  triggerAutoSave();
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
    srcTd.setAttribute('data-label', 'Tip Source');
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
    srcSel.onchange = () => { 
      tipEntries[i].source = srcSel.value; 
      saveTipEntries();
      triggerAutoSave();
    };
    srcTd.append(srcSel);
    row.append(srcTd);

    // Start
    const sTd = document.createElement("td");
    sTd.setAttribute('data-label', 'Start');
    const sIn = document.createElement("input");
    sIn.type  = "time";
    sIn.value = t.start;
    sIn.onchange = () => { 
      const endTime = tipEntries[i].end;
      if (endTime && !validateTimeRange(sIn.value, endTime)) {
        showValidationError(sIn, 'Start time must be before end time');
        return;
      }
      tipEntries[i].start = sIn.value; 
      saveTipEntries();
      triggerAutoSave();
    };
    sTd.append(sIn);
    row.append(sTd);

    // End
    const eTd = document.createElement("td");
    eTd.setAttribute('data-label', 'End');
    const eIn = document.createElement("input");
    eIn.type  = "time";
    eIn.value = t.end;
    eIn.onchange = () => { 
      const startTime = tipEntries[i].start;
      if (startTime && !validateTimeRange(startTime, eIn.value)) {
        showValidationError(eIn, 'End time must be after start time');
        return;
      }
      tipEntries[i].end = eIn.value; 
      saveTipEntries();
      triggerAutoSave();
    };
    eTd.append(eIn);
    row.append(eTd);

    // Amount
    const aTd = document.createElement("td");
    aTd.setAttribute('data-label', 'Amount');
    const aIn = document.createElement("input");
    aIn.type        = "number";
    aIn.step        = "0.01";
    aIn.min         = "0";
    aIn.placeholder = "0.00";
    aIn.value       = t.amount;
    aIn.oninput     = () => { 
      if (!validateTipAmount(aIn.value)) {
        showValidationError(aIn, 'Please enter a valid positive number');
        return;
      }
      tipEntries[i].amount = aIn.value; 
      saveTipEntries();
      triggerAutoSave();
    };
    aTd.append(aIn);
    row.append(aTd);

    // Remove
    const rTd = document.createElement("td");
    rTd.setAttribute('data-label', 'Remove');
    const rBtn = document.createElement("button");
    rBtn.textContent = "✕";
    rBtn.onclick = () => {
      const tipAmount = t.amount || '0.00';
      if (confirm(`Are you sure you want to remove this $${tipAmount} tip entry? This action cannot be undone.`)) {
        tipEntries.splice(i,1);
        saveTipEntries();
        renderTipTable();
        triggerAutoSave();
      }
    };
    rTd.append(rBtn);
    row.append(rTd);

    tbody.append(row);
  });
}

// Add tip row
document.getElementById("add-tip").onclick = () => {
  tipEntries.push({ source:"til", start:"", end:"", amount:"" });
  saveTipEntries();
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

  // Enhanced Analytics
  calculateAnalytics(totals, totalTil + totalJar);
}

// Calculate advanced analytics and insights
function calculateAnalytics(employeeTotals, totalTips) {
  // Calculate total working hours and average tip per hour
  let totalWorkingHours = 0;
  employees.forEach(e => {
    const startMins = toMinutes(e.start);
    const endMins = toMinutes(e.end);
    const hoursWorked = (endMins - startMins) / 60;
    totalWorkingHours += hoursWorked;
  });

  const avgTipPerHour = totalWorkingHours > 0 ? totalTips / totalWorkingHours : 0;
  document.getElementById("avg-tip-hour").textContent = `$${avgTipPerHour.toFixed(2)}`;

  // Find highest earner
  let highestEarner = { name: "-", amount: 0 };
  Object.entries(employeeTotals).forEach(([name, amount]) => {
    if (amount > highestEarner.amount) {
      highestEarner = { name, amount };
    }
  });

  if (highestEarner.name !== "-") {
    document.getElementById("highest-earner").textContent = 
      `${highestEarner.name} ($${highestEarner.amount.toFixed(2)})`;
  } else {
    document.getElementById("highest-earner").textContent = "-";
  }

  // Calculate fairness score (standard deviation of tip amounts)
  const tipAmounts = Object.values(employeeTotals);
  const avgTip = tipAmounts.length > 0 ? tipAmounts.reduce((a, b) => a + b, 0) / tipAmounts.length : 0;
  
  if (tipAmounts.length > 1 && avgTip > 0) {
    const variance = tipAmounts.reduce((acc, amount) => 
      acc + Math.pow(amount - avgTip, 2), 0) / tipAmounts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / avgTip;
    
    // Convert to fairness score (lower variation = higher fairness)
    // Scale from 0-100 where 100 is perfectly fair
    const fairnessScore = Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
    
    let fairnessText = "";
    if (fairnessScore >= 85) fairnessText = "Excellent";
    else if (fairnessScore >= 70) fairnessText = "Good";
    else if (fairnessScore >= 50) fairnessText = "Fair";
    else fairnessText = "Needs Review";
    
    document.getElementById("fairness-score").textContent = 
      `${fairnessScore.toFixed(0)}% (${fairnessText})`;
  } else {
    document.getElementById("fairness-score").textContent = "-";
  }
}

document.getElementById("calc").onclick = calculateTips;


/*—— On load ————————————————————————————————————————————————————*/
loadEmployees();
loadTipEntries();
renderEmployeeTable();
renderTipTable();
calculateTips(); // Initial calculation


/*—— Data Management Functions ———————————————————————————————————*/

// Export all data to JSON file
function exportData() {
  const currentDate = new Date().toISOString().split('T')[0];
  const exportData = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    restaurant: "Tip Calculator Data",
    employees: employees,
    tipEntries: tipEntries,
    metadata: {
      totalEmployees: employees.length,
      totalTipEntries: tipEntries.length,
      totalTipsAmount: tipEntries.reduce((sum, tip) => sum + (parseFloat(tip.amount) || 0), 0)
    }
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tip-calculator-data-${currentDate}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification('✅ Data exported successfully!', 'success');
}

// Import data from JSON file
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      // Validate data structure
      if (!importedData.employees || !importedData.tipEntries) {
        throw new Error('Invalid data format');
      }

      // Backup current data before import
      const backupData = {
        employees: [...employees],
        tipEntries: [...tipEntries]
      };

      // Import new data
      employees = importedData.employees;
      tipEntries = importedData.tipEntries;

      // Save to localStorage
      saveEmployees();
      saveTipEntries();

      // Re-render everything
      renderEmployeeTable();
      renderTipTable();
      calculateTips();

      showNotification(`✅ Data imported successfully! Loaded ${employees.length} employees and ${tipEntries.length} tip entries.`, 'success');

    } catch (error) {
      console.error('Import error:', error);
      showNotification('❌ Failed to import data. Please check the file format.', 'error');
    }
  };

  reader.readAsText(file);
  // Clear the file input
  event.target.value = '';
}

// Clear all data with confirmation
function clearAllData() {
  const confirmation = confirm(
    '⚠️ WARNING: This will delete ALL data!\n\n' +
    '• All employees will be removed\n' +
    '• All tip entries will be deleted\n' +
    '• This action cannot be undone\n\n' +
    'Are you sure you want to continue?'
  );

  if (confirmation) {
    const doubleConfirm = confirm(
      '🚨 FINAL CONFIRMATION\n\n' +
      'You are about to permanently delete:\n' +
      `• ${employees.length} employees\n` +
      `• ${tipEntries.length} tip entries\n\n` +
      'Type "DELETE" in the next prompt to confirm.'
    );

    if (doubleConfirm) {
      const finalConfirm = prompt(
        'Type "DELETE" (in capital letters) to confirm deletion:'
      );

      if (finalConfirm === 'DELETE') {
        // Clear all data
        employees = [];
        tipEntries = [];
        
        // Clear localStorage
        localStorage.removeItem('tipCalcEmployees');
        localStorage.removeItem('tipCalcTipEntries');
        
        // Re-render everything
        renderEmployeeTable();
        renderTipTable();
        calculateTips();

        showNotification('🗑️ All data has been cleared.', 'warning');
      } else {
        showNotification('❌ Deletion cancelled - incorrect confirmation text.', 'info');
      }
    }
  }
}

// Print summary
function printSummary() {
  // Create a printable version
  const printWindow = window.open('', '_blank');
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  
  // Calculate totals for print
  let totalTil = 0, totalJar = 0;
  tipEntries.forEach(t => {
    const a = parseFloat(t.amount) || 0;
    if (t.source === "til") totalTil += a;
    if (t.source === "jar") totalJar += a;
  });

  const totals = {};
  employees.forEach(e => totals[e.name] = 0);
  tipEntries.forEach(t => allocateEntry(t, employees, totals));

  const employeeBreakdown = Object.entries(totals)
    .map(([name, amount]) => `${name}: $${amount.toFixed(2)}`)
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Tip Calculator Summary - ${currentDate}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .employees { background: #e8f5e8; padding: 15px; border-radius: 5px; }
        .total { font-weight: bold; font-size: 1.1em; color: #2c5aa0; }
        .date { color: #666; font-size: 0.9em; }
        pre { background: white; padding: 10px; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <h1>🧾 Tip Calculator Summary</h1>
      <div class="date">Generated: ${currentDate} at ${currentTime}</div>
      
      <div class="summary">
        <h3>💰 Tip Totals</h3>
        <p><strong>Total Tip From TIL Machine:</strong> $${totalTil.toFixed(2)}</p>
        <p><strong>Total Tip From Jar:</strong> $${totalJar.toFixed(2)}</p>
        <p class="total">Total Tips (TIL + JAR): $${(totalTil + totalJar).toFixed(2)}</p>
      </div>

      <div class="employees">
        <h3>👥 Employee Tip Allocation</h3>
        <pre>${employeeBreakdown}</pre>
      </div>

      <div style="margin-top: 30px; font-size: 0.8em; color: #666;">
        <p>Generated by Tip Calculator App</p>
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

// Copy summary to clipboard
async function copySummaryToClipboard() {
  try {
    // Calculate totals
    let totalTil = 0, totalJar = 0;
    tipEntries.forEach(t => {
      const a = parseFloat(t.amount) || 0;
      if (t.source === "til") totalTil += a;
      if (t.source === "jar") totalJar += a;
    });

    const totals = {};
    employees.forEach(e => totals[e.name] = 0);
    tipEntries.forEach(t => allocateEntry(t, employees, totals));

    const employeeBreakdown = Object.entries(totals)
      .map(([name, amount]) => `${name}: $${amount.toFixed(2)}`)
      .join('\n');

    const summaryText = `🧾 TIP CALCULATOR SUMMARY
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

💰 TIP TOTALS:
• TIL Machine: $${totalTil.toFixed(2)}
• Jar: $${totalJar.toFixed(2)}
• TOTAL: $${(totalTil + totalJar).toFixed(2)}

👥 EMPLOYEE ALLOCATION:
${employeeBreakdown}

Generated by Tip Calculator App`;

    await navigator.clipboard.writeText(summaryText);
    showNotification('📋 Summary copied to clipboard!', 'success');
  } catch (error) {
    console.error('Copy failed:', error);
    showNotification('❌ Failed to copy to clipboard.', 'error');
  }
}

// Enhanced notification system
function showNotification(message, type = 'info') {
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
      max-width: 90%;
      text-align: center;
    `;
    document.body.appendChild(notification);
  }

  // Set color based on type
  const colors = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3'
  };

  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  notification.style.opacity = '1';

  setTimeout(() => {
    notification.style.opacity = '0';
  }, 4000);
}


/*—— Event Listeners for Data Management ————————————————————————*/

document.getElementById("export-data").onclick = exportData;
document.getElementById("import-data").onclick = () => {
  document.getElementById("import-file").click();
};
document.getElementById("import-file").onchange = importData;
document.getElementById("clear-all").onclick = clearAllData;
document.getElementById("print-summary").onclick = printSummary;
document.getElementById("copy-summary").onclick = copySummaryToClipboard;


/*—— Shift Templates ———————————————————————————————————————————*/

const SHIFT_TEMPLATES = {
  morning: { start: "06:00", end: "14:00", name: "Morning Shift (6AM-2PM)" },
  afternoon: { start: "14:00", end: "22:00", name: "Afternoon Shift (2PM-10PM)" },
  fullDay: { start: "10:00", end: "18:00", name: "Full Day (10AM-6PM)" },
  breakfast: { start: "07:00", end: "11:00", name: "Breakfast (7AM-11AM)" },
  lunch: { start: "11:00", end: "15:00", name: "Lunch (11AM-3PM)" },
  dinner: { start: "17:00", end: "21:00", name: "Dinner (5PM-9PM)" },
  weekend: { start: "09:00", end: "17:00", name: "Weekend (9AM-5PM)" },
  closing: { start: "18:00", end: "23:00", name: "Closing Shift (6PM-11PM)" }
};

// Apply shift template to all employees
function applyShiftTemplate(templateKey) {
  const template = SHIFT_TEMPLATES[templateKey];
  if (!template) return;
  
  const confirmation = confirm(
    `Apply "${template.name}" to all employees?\n\n` +
    `This will set all employee times to:\n` +
    `Start: ${template.start}\n` +
    `End: ${template.end}\n\n` +
    `This will overwrite current schedules.`
  );
  
  if (confirmation) {
    employees.forEach(emp => {
      emp.start = template.start;
      emp.end = template.end;
    });
    
    saveEmployees();
    renderEmployeeTable();
    triggerAutoSave();
    
    showNotification(`✅ Applied ${template.name} to all employees!`, 'success');
  }
}

// Apply shift template to new employee
function applyShiftTemplateToNew(templateKey) {
  const template = SHIFT_TEMPLATES[templateKey];
  if (!template) return;
  
  employees.push({
    name: NAME_OPTIONS[0],
    role: "cook",
    start: template.start,
    end: template.end
  });
  
  saveEmployees();
  renderEmployeeTable();
  triggerAutoSave();
  
  showNotification(`✅ Added employee with ${template.name}!`, 'success');
}


/*—— Progressive Web App Registration ———————————————————————————*/

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Handle PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show install button or notification
  showNotification('💡 This app can be installed for a better experience!', 'info');
});

// Handle app shortcuts from manifest
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  
  if (action === 'add-employee') {
    // Trigger add employee action
    document.getElementById("add-emp").click();
  } else if (action === 'add-tip') {
    // Trigger add tip action
    document.getElementById("add-tip").click();
  }
});
