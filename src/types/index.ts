export interface Client {
  code: string;
  regulation: string;
  status: string;
  riskRating: 'High' | 'Medium' | 'Low';
  dateLastReview: string | null;
  dueDate: string | null;
  backlog: string | null;
  sfo: string | null;
  fo: string | null;
  sco: string | null;
  co: string | null;
  prTeamMember: string | null;
  prProjectDueDate: string | null;
  assignDate: string | null;
  prStartDate: string | null;
  reconfirmationEmailSent: string | null;
  reminderPlus1w: string | null;
  prStatus: string | null;
  reviewStatus: string | null;
  qaMember: string | null;
  qaRemarks: string | null;
  dateReviewComplete: string | null;
  dateSentBackToPrTeam: string | null;
  dateSentForSignOff: string | null;
  signedOffAndArchivedDate: string | null;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface SimulatedEmail {
  id: string;
  clientCode: string;
  type: 'outbox' | 'inbox';
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'no_response';
  category: 'reconfirmation' | 'reminder' | 'response' | 'follow_up';
}

export interface Activity {
  id: string;
  type: 'email_sent' | 'review_completed' | 'sign_off' | 'qa_review' | 'assignment' | 'status_change';
  description: string;
  clientCode: string;
  timestamp: string;
  user: string;
}

export type WorkflowStage =
  | 'Not Started'
  | 'Assigned'
  | 'In Progress'
  | 'Under Review'
  | 'QA'
  | 'Sign Off'
  | 'Archived';

export interface KPIs {
  totalClients: number;
  delayedPRs: number;
  highRiskClients: number;
  prsCompletedThisMonth: number;
}
