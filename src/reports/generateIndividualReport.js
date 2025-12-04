// src/reports/generateIndividualReport.js

export function createIndividualReportWindow({ employee, monthName, year, stats, timeEntries }) {
  const empName = employee ? employee.name : 'Unknown';
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalHoursNumeric =
    parseFloat(stats.totalHoursFormatted.replace(' hrs ', '.').replace(' min', '')) || 0;

  const baseSalary = totalHoursNumeric * (employee?.wage || 0);
  const aga = baseSalary * 0.141;
  const otp = baseSalary * 0.02;
  const feriepenger = baseSalary * 0.102;
  const realCost = baseSalary + aga + otp + feriepenger;

  const printWindow = window.open('', '_blank');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Staff Report - ${empName}</title>
  <style>
    @media print {
      @page { margin: 1.5cm; size: A4; }
      body { margin: 0; }
      .no-print { display: none; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 20px;
      max-width: 210mm;
      margin: 0 auto;
      background: #f5f5f5;
    }
    .report-container {
      background: white;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header-left h1 {
      font-size: 18px;
      color: #1e293b;
      margin-bottom: 3px;
    }
    .header-left .period {
      color: #64748b;
      font-size: 13px;
    }
    .header-right { text-align: right; }
    .header-right .label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
    }
    .header-right .value {
      font-size: 15px;
      color: #1e293b;
      font-weight: 600;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: #f8fafc;
      padding: 12px;
      border-radius: 6px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .stat-card .label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .stat-card .value {
      font-size: 20px;
      font-weight: bold;
      color: #1e293b;
    }
    .stat-card .unit {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .stat-card.highlight {
      background: #dbeafe;
      border-color: #2563eb;
    }
    .stat-card.highlight .value {
      color: #2563eb;
    }
    .stat-card.positive .value { color: #059669; }
    .stat-card.negative .value { color: #dc2626; }
    .table-section h2 {
      font-size: 14px;
      color: #1e293b;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    thead { background: #f1f5f9; }
    th {
      text-align: left;
      padding: 8px 6px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.3px;
    }
    td {
      padding: 8px 6px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    tbody tr:hover { background: #f8fafc; }
    .shift-badge {
      background: #dbeafe;
      color: #1e40af;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 600;
      display: inline-block;
    }
    .diff-positive { color: #059669; font-weight: 600; }
    .diff-negative { color: #dc2626; font-weight: 600; }
    .diff-neutral { color: #64748b; }
    .footer {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 9px;
    }
    .no-print {
      text-align: center;
      margin-top: 15px;
      padding: 15px;
    }
    .btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 25px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      margin: 0 8px;
    }
    .btn:hover { background: #1d4ed8; }
    .btn-secondary { background: #64748b; }
    .btn-secondary:hover { background: #475569; }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <div class="header-left">
        <h1>${empName}</h1>
        <div class="period">${monthName} ${year}</div>
      </div>
      <div class="header-right">
        <div class="label">Role</div>
        <div class="value">${employee?.role || 'N/A'}</div>
        <div style="margin-top:5px; font-size: 11px; color:#64748b;">
          ${employee?.wage ?? 'N/A'} NOK/h • ${employee?.percentage ?? '--'}%
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card highlight">
        <div class="label">Total Hours</div>
        <div class="value">${stats.totalHoursFormatted}</div>
      </div>
      <div class="stat-card">
        <div class="label">Base Salary</div>
        <div class="value">${baseSalary.toLocaleString('nb-NO', {maximumFractionDigits: 0})}</div>
        <div class="unit">NOK</div>
      </div>
      <div class="stat-card" style="background: #fee2e2; border: 1px solid #fecaca;">
        <div class="label">Real Cost</div>
        <div class="value" style="color: #dc2626;">
          ${realCost.toLocaleString('nb-NO', {maximumFractionDigits: 0})}
        </div>
        <div class="unit">NOK (w/ taxes)</div>
      </div>
      <div class="stat-card ${stats.overtimeHours >= 0 ? 'positive' : 'negative'}">
        <div class="label">Difference</div>
        <div class="value">
          ${stats.overtimeHours > 0 ? '+' : ''}${stats.overtimeHours}h
        </div>
      </div>
    </div>

    <div style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
      <div style="font-size: 9px; color: #64748b; margin-bottom: 6px; text-transform: uppercase; font-weight: 600;">
        Cost Breakdown:
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 10px; color: #475569;">
        <div>AGA (14.1%): <strong>${aga.toLocaleString('nb-NO', {maximumFractionDigits: 0})} NOK</strong></div>
        <div>OTP (2%): <strong>${otp.toLocaleString('nb-NO', {maximumFractionDigits: 0})} NOK</strong></div>
        <div>Feriepenger (10.2%): <strong>${feriepenger.toLocaleString('nb-NO', {maximumFractionDigits: 0})} NOK</strong></div>
      </div>
    </div>

    <div class="table-section">
      <h2>Time Entries</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Shift</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Break</th>
            <th>Actual</th>
            <th>Diff</th>
          </tr>
        </thead>
        <tbody>
          ${timeEntries.map(entry => {
            const diff = parseFloat(entry.difference);
            const diffClass =
              diff > 0 ? 'diff-positive' :
              diff < 0 ? 'diff-negative' :
              'diff-neutral';
            return `
            <tr>
              <td>${entry.date}</td>
              <td><span class="shift-badge">${entry.shiftName}</span></td>
              <td>${entry.clockIn}</td>
              <td>${entry.clockOut}</td>
              <td>${entry.breakHours}h</td>
              <td><strong>${entry.actualHours}h</strong></td>
              <td class="${diffClass}">${diff > 0 ? '+' : ''}${entry.difference}h</td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      Generated by Staff Management System • ${currentDate}
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
