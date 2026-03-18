import type { Client, SimulatedEmail, Activity, WorkflowStage } from '../types';

const teamMembers = [
  'Sarah van den Berg', 'Jan de Vries', 'Maria Bakker',
  'Thomas Jansen', 'Lisa Visser', 'Peter Smit',
  'Anna de Groot', 'Mark Bos', 'Eva Mulder',
];

const qaMembers = [
  'Dr. Willem Hendriks', 'Ingrid Dekker', 'Hans van Dijk',
];

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getWorkflowStage(client: Client): WorkflowStage {
  if (client.signedOffAndArchivedDate) return 'Archived';
  if (client.dateSentForSignOff) return 'Sign Off';
  if (client.qaMember || client.dateReviewComplete) return 'QA';
  if (client.reviewStatus || client.dateSentBackToPrTeam) return 'Under Review';
  if (client.prStartDate) return 'In Progress';
  if (client.assignDate || client.prTeamMember) return 'Assigned';
  return 'Not Started';
}

export function generateSimulatedEmails(clients: Client[]): SimulatedEmail[] {
  const emails: SimulatedEmail[] = [];

  for (const client of clients) {
    const rand = seededRandom(client.code);

    if (client.reconfirmationEmailSent && client.reconfirmationEmailSent !== 'No') {
      // Derive a real date: use the value if it's a date, otherwise estimate from assignDate/dueDate
      const sentDate = isValidDate(client.reconfirmationEmailSent)
        ? client.reconfirmationEmailSent
        : client.assignDate && isValidDate(client.assignDate)
          ? addDays(client.assignDate, 3)
          : client.dueDate && isValidDate(client.dueDate)
            ? addDays(client.dueDate, -30)
            : null;
      if (!sentDate) continue;
      emails.push({
        id: `out-reconf-${client.code}`,
        clientCode: client.code,
        type: 'outbox',
        subject: `Periodic Review - Re-confirmation Required [${client.code}]`,
        from: 'compliance@silverbacking.com',
        to: `contact@${client.code.toLowerCase()}.nl`,
        date: sentDate,
        body: `Dear Sir/Madam,\n\nAs part of our ongoing compliance obligations under ${client.regulation} regulations, we are conducting a periodic review of your account (ref: ${client.code}).\n\nWe kindly request you to confirm your current company details and provide any updated documentation as required. Please find attached the re-confirmation questionnaire.\n\nPlease respond within 14 business days.\n\nKind regards,\nCompliance Department\nSilverBacking Trust B.V.`,
        status: rand() > 0.3 ? 'delivered' : 'sent',
        category: 'reconfirmation',
      });

      // Simulated response
      if (rand() > 0.4) {
        const responseDelay = Math.floor(rand() * 20) + 2;
        const responded = rand() > 0.25;
        if (responded) {
          emails.push({
            id: `in-resp-${client.code}`,
            clientCode: client.code,
            type: 'inbox',
            subject: `RE: Periodic Review - Re-confirmation Required [${client.code}]`,
            from: `contact@${client.code.toLowerCase()}.nl`,
            to: 'compliance@silverbacking.com',
            date: addDays(sentDate, responseDelay),
            body: `Dear Compliance Team,\n\nThank you for your message. Please find attached the completed re-confirmation questionnaire and the requested documentation.\n\nShould you require any additional information, please do not hesitate to contact us.\n\nBest regards,\nClient Administration\n${client.code}`,
            status: 'replied',
            category: 'response',
          });
        }
      }
    }

    if (client.reminderPlus1w && isValidDate(client.reminderPlus1w)) {
      emails.push({
        id: `out-rem-${client.code}`,
        clientCode: client.code,
        type: 'outbox',
        subject: `Reminder: Periodic Review Documentation Outstanding [${client.code}]`,
        from: 'compliance@silverbacking.com',
        to: `contact@${client.code.toLowerCase()}.nl`,
        date: client.reminderPlus1w,
        body: `Dear Sir/Madam,\n\nThis is a friendly reminder regarding our periodic review request for account ${client.code}.\n\nWe have not yet received the completed re-confirmation questionnaire. To ensure continued compliance with ${client.regulation} regulations, we kindly request your prompt response.\n\nPlease note that failure to respond may result in restrictions on your account.\n\nKind regards,\nCompliance Department\nSilverBacking Trust B.V.`,
        status: rand() > 0.5 ? 'read' : 'delivered',
        category: 'reminder',
      });
    }

    // Generate additional follow-up for overdue clients
    if (client.dueDate && isValidDate(client.dueDate) && !client.dateReviewComplete) {
      const due = new Date(client.dueDate);
      const now = new Date();
      if (due < now) {
        emails.push({
          id: `out-follow-${client.code}`,
          clientCode: client.code,
          type: 'outbox',
          subject: `URGENT: Outstanding Periodic Review [${client.code}]`,
          from: 'compliance@silverbacking.com',
          to: `contact@${client.code.toLowerCase()}.nl`,
          date: addDays(client.dueDate, 30),
          body: `Dear Sir/Madam,\n\nDespite our previous correspondence, we have not received the required documentation for the periodic review of account ${client.code}.\n\nThis review is now overdue. We urge you to provide the requested information at your earliest convenience to avoid any disruption to services.\n\nPlease contact us immediately if you are experiencing difficulties in completing the review.\n\nUrgent attention required.\n\nKind regards,\nCompliance Department\nSilverBacking Trust B.V.`,
          status: 'no_response',
          category: 'follow_up',
        });
      }
    }
  }

  return emails.sort((a, b) => b.date.localeCompare(a.date));
}

export function generateActivities(clients: Client[]): Activity[] {
  const activities: Activity[] = [];
  const now = new Date();

  for (const client of clients) {
    const rand = seededRandom(client.code + 'act');

    if (client.reconfirmationEmailSent && client.reconfirmationEmailSent !== 'No') {
      // reconfirmationEmailSent may be "Yes" or a date string; derive a timestamp
      const emailTimestamp = isValidDate(client.reconfirmationEmailSent)
        ? client.reconfirmationEmailSent
        : client.assignDate && isValidDate(client.assignDate)
          ? addDays(client.assignDate, 3)
          : client.prStartDate && isValidDate(client.prStartDate)
            ? client.prStartDate
            : null;
      if (emailTimestamp) {
        activities.push({
          id: `act-email-${client.code}`,
          type: 'email_sent',
          description: `Re-confirmation email sent to ${client.code}`,
          clientCode: client.code,
          timestamp: emailTimestamp,
          user: pick(teamMembers, rand),
        });
      }
    }

    if (client.assignDate && client.prTeamMember) {
      activities.push({
        id: `act-assign-${client.code}`,
        type: 'assignment',
        description: `${client.code} assigned to ${client.prTeamMember}`,
        clientCode: client.code,
        timestamp: client.assignDate,
        user: 'System',
      });
    }

    if (client.dateReviewComplete) {
      activities.push({
        id: `act-review-${client.code}`,
        type: 'review_completed',
        description: `Periodic review completed for ${client.code}`,
        clientCode: client.code,
        timestamp: client.dateReviewComplete,
        user: client.prTeamMember || pick(teamMembers, rand),
      });
    }

    if (client.signedOffAndArchivedDate) {
      activities.push({
        id: `act-signoff-${client.code}`,
        type: 'sign_off',
        description: `${client.code} signed off and archived`,
        clientCode: client.code,
        timestamp: client.signedOffAndArchivedDate,
        user: client.qaMember || pick(qaMembers, rand),
      });
    }
  }

  return activities
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 100);
}

export function computeKPIs(clients: Client[]) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return {
    totalClients: clients.length,
    delayedPRs: clients.filter((c) => {
      if (!c.dueDate || c.dateReviewComplete || c.signedOffAndArchivedDate) return false;
      return isValidDate(c.dueDate) && new Date(c.dueDate) < now;
    }).length,
    highRiskClients: clients.filter((c) => c.riskRating === 'High').length,
    prsCompletedThisMonth: clients.filter((c) =>
      c.dateReviewComplete && c.dateReviewComplete.startsWith(thisMonth)
    ).length,
  };
}

export function getAlerts(clients: Client[]) {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const critical: Client[] = [];
  const warning: Client[] = [];
  const info: Client[] = [];
  const highRiskNoReview: Client[] = [];

  for (const c of clients) {
    if (!c.dueDate || !isValidDate(c.dueDate)) continue;
    const due = new Date(c.dueDate);
    const isComplete = c.dateReviewComplete || c.signedOffAndArchivedDate;

    if (!isComplete && due < sixMonthsAgo) {
      critical.push(c);
    } else if (!isComplete && due < threeMonthsAgo) {
      warning.push(c);
    } else if (!isComplete && due >= now && due <= thirtyDaysFromNow) {
      info.push(c);
    }

    if (c.riskRating === 'High' && !isComplete) {
      const lastReview = c.dateLastReview && isValidDate(c.dateLastReview) ? new Date(c.dateLastReview) : null;
      if (!lastReview || lastReview < threeMonthsAgo) {
        highRiskNoReview.push(c);
      }
    }
  }

  return { critical, warning, info, highRiskNoReview };
}
