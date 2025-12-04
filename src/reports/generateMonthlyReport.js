// src/reports/generateMonthlyReport.js

export function createMonthlyReportWindow({ employeesWithData, totals, monthName, year }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const printWindow = window.open('', '_blank');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Monthly Staff Report - ${monthName} ${year}</title>
  <style>
    @media print {
      @page { margin: 1.5cm; size: A4 landscape; }
      body { margin: 0; }
      .no-print { display: none; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 30px;
      background: #f5f5f5;
    }
    .report-container {
      background: white;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 100%;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      color: #1e293b;
      margin-bottom: 5px;
    }
    .header .subtitle {
      color: #64748b;
      font-size: 16px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .summary-card .label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #1e293b;
    }
    .summary-card .unit {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    .summary-card.highlight {
      background: #dbeafe;
      border-color: #2563eb;
    }
    .summary-card.highlight .value {
      color: #2563eb;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 12px;
    }
    thead {
      background: #1e293b;
      color: white;
    }
    th {
      text-align: left;
      padding: 12px 10px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    th.text-right { text-align: right; }
    td {
      padding: 12px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    td.text-right { text-align: right; }
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    tbody tr:hover {
      background: #f1f5f9;
    }
    .role-badge {
      background: #e0e7ff;
      color: #4338ca;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      display: inline-block;
    }
    .positive { color: #059669; font-weight: 600; }
    .negative { color: #dc2626; font-weight: 600; }
    .neutral { color: #64748b; }
    tfoot {
      background: #f1f5f9;
      font-weight: bold;
    }
    tfoot td {
      padding: 15px 10px;
      border-top: 2px solid #2563eb;
      border-bottom: 2px solid #2563eb;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 11px;
    }
    .no-print {
      text-align: center;
      margin-top: 20px;
      padding: 20px;
    }
    .btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin: 0 10px;
    }
    .btn:hover { background: #1d4ed8; }
    .btn-secondary { background: #64748b; }
    .btn-secondary:hover { background: #475569; }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <h1>Monthly Staff Report</h1>
      <div class="subtitle">${monthName} ${year}</div>
    </div>

    <div class="summary-grid">
      <div class="summary-card highlight">
        <div class="label">Total Employees</div>
        <div class="value">${employeesWithData.length}</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Hours</div>
        <div class="value">${totals.totalHours.toFixed(1)}</div>
        <div class="unit">hours</div>
      </div>
      <div class="summary-card">
        <div class="label">Base Salary Cost</div>
        <div class="value">${totals.totalBaseSalary.toLocaleString('nb-NO', {maximumFractionDigits: 0})}</div>
        <div class="unit">NOK</div>
      </div>
      <div class="summary-card" style="background: #fee2e2; border-color: #ef4444;">
        <div class="label">Real Cost (w/ taxes)</div>
        <div class="value" style="color: #dc2626;">${totals.totalRealCost.toLocaleString('nb-NO', {maximumFractionDigits: 0})}</div>
        <div class="unit">NOK</div>
      </div>
      <div class="summary-card ${totals.overtimeHours >= 0 ? 'positive' : 'negative'}">
        <div class="label">Total Difference</div>
        <div class="value">${totals.overtimeHours > 0 ? '+' : ''}${totals.overtimeHours.toFixed(1)}</div>
        <div class="unit">hours</div>
      </div>
    </div>

    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <div style="font-size: 11px; color: #64748b; margin-bottom: 8px; text-transform: uppercase; font-weight: 600;">
        Cost Breakdown Formula:
      </div>
      <div style="font-size: 12px; color: #475569;">
        Real Cost = Base Salary + AGA (14.1%) + OTP (2%) + Feriepenger (10.2%) = <strong>Base × 1.263</strong>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Employee Name</th>
          <th>Role</th>
          <th>Wage</th>
          <th class="text-right">Work Days</th>
          <th class="text-right">Total Hours</th>
          <th class="text-right">Difference</th>
          <th class="text-right">Base Salary</th>
          <th class="text-right">AGA (14.1%)</th>
          <th class="text-right">OTP (2%)</th>
          <th class="text-right">Ferie (10.2%)</th>
          <th class="text-right">Real Cost</th>
        </tr>
      </thead>
      <tbody>
        ${employeesWithData.map(emp => {
          const diff = emp.stats.overtimeHours;
          const diffClass = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';
          const baseSalary = emp.stats.totalHours * emp.wage;
          const aga = baseSalary * 0.141;
          const otp = baseSalary * 0.02;
          const feriepenger = baseSalary * 0.102;
          const realCost = baseSalary + aga + otp + feriepenger;

          return `
          <tr>
            <td><strong>${emp.name}</strong></td>
            <td><span class="role-badge">${emp.role}</span></td>
            <td>${emp.wage} NOK</td>
            <td class="text-right">${emp.stats.workDays}</td>
            <td class="text-right"><strong>${emp.stats.totalHours.toFixed(1)}h</strong></td>
            <td class="text-right ${diffClass}">${diff > 0 ? '+' : ''}${diff.toFixed(1)}h</td>
            <td class="text-right">${baseSalary.toLocaleString('nb-NO', {maximumFractionDigits: 0})} NOK</td>
            <td class="text-right" style="color: #64748b;">${aga.toLocaleString('nb-NO', {maximumFractionDigits: 0})}</td>
            <td class="text-right" style="color: #64748b;">${otp.toLocaleString('nb-NO', {maximumFractionDigits: 0})}</td>
            <td class="text-right" style="color: #64748b;">${feriepenger.toLocaleString('nb-NO', {maximumFractionDigits: 0})}</td>
            <td class="text-right"><strong style="color: #dc2626;">${realCost.toLocaleString('nb-NO', {maximumFractionDigits: 0})} NOK</strong></td>
          </tr>
          `;
        }).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4"><strong>TOTALS</strong></td>
          <td class="text-right">${totals.totalHours.toFixed(1)}h</td>
          <td class="text-right ${totals.overtimeHours >= 0 ? 'positive' : 'negative'}">
            ${totals.overtimeHours > 0 ? '+' : ''}${totals.overtimeHours.toFixed(1)}h
          </td>
          <td class="text-right"><strong>${totals.totalBaseSalary.toLocaleString('nb-NO', {maximumFractionDigits: 0})} NOK</strong></td>
          <td class="text-right" style="color: #64748b;">${(totals.totalBaseSalary * 0.141).toLocaleString('nb-NO', {maximumFractionDigits: 0})}</td>
          <td class="text-right" style="color: #64748b;">${(totals.totalBaseSalary * 0.02).toLocaleString('nb-NO', {maximumFractionDigits: 0})}</td>
          <td class="text-right" style="color: #64748b;">${(totals.totalBaseSalary * 0.102).toLocaleString('nb-NO', {maximumFractionDigits: 0})}</td>
          <td class="text-right"><strong style="color: #dc2626;">${totals.totalRealCost.toLocaleString('nb-NO', {maximumFractionDigits: 0})} NOK</strong></td>
        </tr>
      </tfoot>
    </table>

    <div class="footer">
      Report generated on ${currentDate} • Staff Management System
    </div>
  </div>

  <div class="no-print">
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
    <button class="btn btn-secondary" onclick="window.close()">Close</button>
  </div>
</body>
</html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
