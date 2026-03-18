import * as XLSX from 'xlsx';
import type { Client } from '../types';

function excelDateToISO(val: unknown): string | null {
  if (val == null || val === '' || val === 0) return null;
  if (typeof val === 'string') {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return val;
  }
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) {
      const month = String(d.m).padStart(2, '0');
      const day = String(d.d).padStart(2, '0');
      return `${d.y}-${month}-${day}`;
    }
  }
  return String(val);
}

function normalizeRisk(val: unknown): 'High' | 'Medium' | 'Low' {
  const s = String(val || '').toLowerCase().trim();
  if (s.startsWith('h')) return 'High';
  if (s.startsWith('m')) return 'Medium';
  return 'Low';
}

function str(val: unknown): string | null {
  if (val == null || val === '') return null;
  return String(val).trim();
}

export function parseClientsSheet(file: ArrayBuffer): Client[] {
  const wb = XLSX.read(file, { type: 'array' });
  const ws = wb.Sheets['Clients'];
  if (!ws) throw new Error("Sheet 'Clients' not found");

  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: null,
  }) as unknown[][];

  // Row index 1 (0-indexed) is the header
  const headerRow = rows[1] as string[];
  const clients: Client[] = [];

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue;

    clients.push({
      code: String(row[0]).trim(),
      regulation: String(row[1] || 'WWFT').trim(),
      status: String(row[2] || '').trim(),
      riskRating: normalizeRisk(row[3]),
      dateLastReview: excelDateToISO(row[4]),
      dueDate: excelDateToISO(row[5]),
      backlog: str(row[6]),
      sfo: str(row[7]),
      fo: str(row[8]),
      sco: str(row[9]),
      co: str(row[10]),
      prTeamMember: str(row[11]),
      prProjectDueDate: excelDateToISO(row[12]),
      assignDate: excelDateToISO(row[13]),
      prStartDate: excelDateToISO(row[14]),
      reconfirmationEmailSent: excelDateToISO(row[15]),
      reminderPlus1w: excelDateToISO(row[16]),
      prStatus: str(row[17]),
      reviewStatus: str(row[18]),
      qaMember: str(row[19]),
      qaRemarks: str(row[20]),
      dateReviewComplete: excelDateToISO(row[21]),
      dateSentBackToPrTeam: excelDateToISO(row[22]),
      dateSentForSignOff: excelDateToISO(row[23]),
      signedOffAndArchivedDate: excelDateToISO(row[24]),
    });
  }

  return clients;
}

export function exportToExcel(clients: Client[]): void {
  const headers = [
    'Code', 'Regulation', 'Status', 'Risk Rating',
    'Date last acceptance/review', 'Due date', 'Backlog 01/02/26',
    'SFO', 'FO', 'SCO', 'CO', 'PR Team Member', 'PR project due date',
    'Assign date', 'PR start date', 'Re-confirmation e-mail sent',
    'Reminder +1w', 'PR status', 'Review Status', 'QA Member',
    'QA Remarks', 'Date review complete', 'Date sent back to PR team',
    'Date sent for sign off', 'Signed off and archived date',
  ];

  const data = clients.map((c) => [
    c.code, c.regulation, c.status, c.riskRating,
    c.dateLastReview, c.dueDate, c.backlog,
    c.sfo, c.fo, c.sco, c.co, c.prTeamMember, c.prProjectDueDate,
    c.assignDate, c.prStartDate, c.reconfirmationEmailSent,
    c.reminderPlus1w, c.prStatus, c.reviewStatus, c.qaMember,
    c.qaRemarks, c.dateReviewComplete, c.dateSentBackToPrTeam,
    c.dateSentForSignOff, c.signedOffAndArchivedDate,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    ['NL Periodic Review Tracker - Clients'],
    headers,
    ...data,
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clients');
  XLSX.writeFile(wb, 'NLPR_Export.xlsx');
}
