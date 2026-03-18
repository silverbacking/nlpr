import { useState } from 'react';
import { ArrowLeft, Mail, Calendar, User, Shield, FileText, Clock } from 'lucide-react';
import type { Client, SimulatedEmail, WorkflowStage } from '../types';
import { getWorkflowStage } from '../utils/simulateData';

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
  emails: SimulatedEmail[];
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  'Not Started',
  'Assigned',
  'In Progress',
  'Under Review',
  'QA',
  'Sign Off',
  'Archived',
];

function riskBadge(risk: string) {
  const base = 'px-3 py-1 rounded-full text-xs font-semibold';
  switch (risk) {
    case 'High':
      return <span className={`${base} bg-red-900/60 text-red-300 border border-red-700/50`}>High Risk</span>;
    case 'Medium':
      return <span className={`${base} bg-amber-900/60 text-amber-300 border border-amber-700/50`}>Medium Risk</span>;
    case 'Low':
      return <span className={`${base} bg-green-900/60 text-green-300 border border-green-700/50`}>Low Risk</span>;
    default:
      return <span className={`${base} bg-gray-800 text-gray-300`}>{risk}</span>;
  }
}

function regulationBadge(reg: string) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50">
      {reg}
    </span>
  );
}

function emailStatusBadge(status: SimulatedEmail['status']) {
  const base = 'px-2 py-0.5 rounded-full text-xs font-medium';
  switch (status) {
    case 'sent':
      return <span className={`${base} bg-gray-700 text-gray-300`}>Sent</span>;
    case 'delivered':
      return <span className={`${base} bg-blue-900/60 text-blue-300`}>Delivered</span>;
    case 'read':
      return <span className={`${base} bg-cyan-900/60 text-cyan-300`}>Read</span>;
    case 'replied':
      return <span className={`${base} bg-green-900/60 text-green-300`}>Replied</span>;
    case 'no_response':
      return <span className={`${base} bg-red-900/60 text-red-300`}>No Response</span>;
    default:
      return <span className={`${base} bg-gray-700 text-gray-300`}>{status}</span>;
  }
}

function InfoItem({ label, value, icon }: { label: string; value: string | null; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <div className="mt-0.5 text-gray-500">{icon}</div>}
      <div className="min-w-0">
        <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
        <div className="text-sm text-gray-200 mt-0.5 break-words">{value ?? '—'}</div>
      </div>
    </div>
  );
}

export default function ClientDetail({ client, onBack, emails }: ClientDetailProps) {
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const currentStage = getWorkflowStage(client);
  const currentStageIdx = WORKFLOW_STAGES.indexOf(currentStage);

  // Filter emails relevant to this client
  const clientEmails = emails.filter((e) => e.clientCode === client.code);

  const isOverdue =
    client.dueDate &&
    !client.dateReviewComplete &&
    !client.signedOffAndArchivedDate &&
    !isNaN(new Date(client.dueDate).getTime()) &&
    new Date(client.dueDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </button>

      {/* Header */}
      <div className="bg-navy-800 rounded-xl p-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-white">{client.code}</h1>
          {regulationBadge(client.regulation)}
          {riskBadge(client.riskRating)}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-navy-700 text-gray-300 border border-navy-600">
            {client.status}
          </span>
          {isOverdue && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-900/70 text-red-300 border border-red-700/50">
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General */}
        <div className="bg-navy-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            General
          </h2>
          <div className="grid grid-cols-2 gap-x-6">
            <InfoItem label="Code" value={client.code} />
            <InfoItem label="Regulation" value={client.regulation} />
            <InfoItem label="Status" value={client.status} />
            <InfoItem label="Risk Rating" value={client.riskRating} />
            <InfoItem label="Backlog" value={client.backlog} />
          </div>
        </div>

        {/* Dates */}
        <div className="bg-navy-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Dates
          </h2>
          <div className="grid grid-cols-2 gap-x-6">
            <InfoItem label="Last Review" value={client.dateLastReview} />
            <InfoItem
              label="Due Date"
              value={client.dueDate}
            />
            <InfoItem label="Assign Date" value={client.assignDate} />
            <InfoItem label="PR Start Date" value={client.prStartDate} />
            <InfoItem label="PR Project Due Date" value={client.prProjectDueDate} />
            <InfoItem label="Reconfirmation Email Sent" value={client.reconfirmationEmailSent} />
            <InfoItem label="Reminder +1w" value={client.reminderPlus1w} />
            <InfoItem label="Date Review Complete" value={client.dateReviewComplete} />
            <InfoItem label="Date Sent Back to PR Team" value={client.dateSentBackToPrTeam} />
            <InfoItem label="Date Sent for Sign Off" value={client.dateSentForSignOff} />
            <InfoItem label="Signed Off & Archived" value={client.signedOffAndArchivedDate} />
          </div>
        </div>

        {/* Team */}
        <div className="bg-navy-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Team
          </h2>
          <div className="grid grid-cols-2 gap-x-6">
            <InfoItem label="SFO" value={client.sfo} />
            <InfoItem label="FO" value={client.fo} />
            <InfoItem label="SCO" value={client.sco} />
            <InfoItem label="CO" value={client.co} />
            <InfoItem label="PR Team Member" value={client.prTeamMember} />
            <InfoItem label="QA Member" value={client.qaMember} />
          </div>
        </div>

        {/* Review */}
        <div className="bg-navy-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Review
          </h2>
          <div className="grid grid-cols-2 gap-x-6">
            <InfoItem label="PR Status" value={client.prStatus} />
            <InfoItem label="Review Status" value={client.reviewStatus} />
            <InfoItem label="QA Remarks" value={client.qaRemarks} />
          </div>
        </div>
      </div>

      {/* Workflow Timeline */}
      <div className="bg-navy-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Workflow Pipeline
        </h2>
        <div className="flex items-center overflow-x-auto pb-2">
          {WORKFLOW_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;

            return (
              <div key={stage} className="flex items-center flex-shrink-0">
                {/* Stage node */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-navy-700 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs whitespace-nowrap ${
                      isCurrent
                        ? 'text-blue-400 font-semibold'
                        : isCompleted
                        ? 'text-green-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {stage}
                  </span>
                </div>

                {/* Connector line */}
                {idx < WORKFLOW_STAGES.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-1 mt-[-1.25rem] ${
                      idx < currentStageIdx ? 'bg-green-600' : 'bg-navy-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Email Section */}
      <div className="bg-navy-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Communications
        </h2>

        {clientEmails.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No communications recorded for this client.</p>
        ) : (
          <div className="space-y-3">
            {clientEmails.map((email) => {
              const isExpanded = expandedEmail === email.id;
              return (
                <div
                  key={email.id}
                  className="bg-navy-900 rounded-lg border border-navy-700/50 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedEmail(isExpanded ? null : email.id)}
                    className="w-full text-left px-4 py-3 hover:bg-navy-700/50 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-white truncate">
                          {email.subject}
                        </span>
                      </div>
                      {emailStatusBadge(email.status)}
                      <span className="text-xs text-gray-500 flex-shrink-0">{email.date}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 ml-6 text-xs text-gray-500">
                      <span>
                        From: <span className="text-gray-400">{email.from}</span>
                      </span>
                      <span>
                        To: <span className="text-gray-400">{email.to}</span>
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-navy-700/50">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                        {email.body}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
