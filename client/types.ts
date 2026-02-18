
export type CRMStatus = 'onboarded' | 'drop' | 'on progress' | 'Quote Sent' | 'lead' | 'completed';

// Work Hub CRM Project Stages
export type ProjectStage = 
  | 'LEAD' 
  | 'ON_PROGRESS' 
  | 'QUOTATION_SENT' 
  | 'IN_REVIEW' 
  | 'ONBOARDED' 
  | 'SALES' 
  | 'ACCOUNTS' 
  | 'INSTALLATION' 
  | 'COMPLETED';

// Executive view classification (computed server-side from workflow stage)
export type ExecutiveProjectStatus = 
  | 'NON_ONBOARDED'      // LEAD, ON_PROGRESS, QUOTATION_SENT, IN_REVIEW
  | 'ONBOARDED_ACTIVE'   // ONBOARDED, SALES, ACCOUNTS, INSTALLATION
  | 'COMPLETED';         // COMPLETED

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'COMPLETED';
export type InstallationStatus = 'PENDING' | 'WORK_DONE' | 'NOT_DONE';
export type Region = 'North' | 'South';

export type UserRole = 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN' | 'ROLE_EMPLOYEE' | 'ROLE_CLIENT' 
  | 'ROLE_EXECUTIVE' | 'ROLE_SALES_COORDINATOR' | 'ROLE_ACCOUNTS' | 'ROLE_INSTALLATION';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  clientCrmId?: number; // Linked CRM ID for Client Role
  googleId?: string; 
  avatarUrl?: string; 
  createdAt?: string; 
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface AuthResponse {
  statusCode: number;
  token: string;
  role: string;
  user: User;
  message: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  clientCrmId?: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ChangePasswordRequest {
  email: string;
  newPassword: string; 
  otp: string; 
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SocialLinks {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  twitter?: string;
  other?: string;
}

export interface CRMEntry {
  id: number;
  company: string;
  phone: string;
  email: string;
  contactName: string;
  assignedTo: string;
  assigneeId?: number; // Linked User ID
  address?: string; 
  companyImageUrl?: string; 
  lastContact: string; 
  nextFollowUp: string; 
  dealValue: number;
  notes: string;
  status: CRMStatus;
  tags: string[];
  work: string[];
  leadSources: string[];
  driveLink?: string; 
  socials?: SocialLinks;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  referenceId?: string; 
}

export interface FilterState {
  status: string;
  assignedTo: string;
  search: string;
  dateRangeStart: string;
  dateRangeEnd: string;
}

export interface CompanyFilterState {
  search: string;
  status: string;
  workType: string;
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'In Review' | 'Posted' | 'Completed' | 'Dropped' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskType = 'General' | 'Reel' | 'Post' | 'Story' | 'Carousel' | 'Video';

export interface Task {
  id: number;
  companyId?: number; 
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  taskType?: TaskType; 
  assignedTo?: string; // Deprecated: for backward compatibility
  assignedToList?: string[]; // New: list of assignee emails
  assigneeId?: number; // Deprecated: for backward compatibility
  dueDate: string; 
  attachments?: string[]; 
  taskLink?: string; 
  createdAt: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  isVisibleOnMainBoard?: boolean; 
}

export interface TaskFilterState {
  search: string;
  status: string;
  priority: string;
  assignedTo: string;
}

export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Postponed';

export interface Meeting {
  id: number;
  title: string;
  dateTime: string; 
  status: MeetingStatus;
  meetingLink?: string;
  notes?: string;
  companyId?: number; 
  assignedTo?: string;
  assigneeId?: number; // Linked User ID
  createdAt: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface MeetingFilterState {
  search: string;
  status: string;
  dateRangeStart: string;
}

export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export type CalendarItem = {
    id: string; 
    dateStr: string; 
    sortTime: number; 
    title: string;
    type: 'task' | 'meeting';
    data: Task | Meeting;
    status: string;
    priority?: string; 
};

// Payment Transaction for Installment Tracking
export interface PaymentTransaction {
  id: number;
  projectId: number;
  amountPaid: number;
  paymentDate: string;
  paymentProofUrl?: string;
  remarks?: string;
  createdAt: string;
  createdBy: string;
}

// Work Hub CRM Project Entity
export interface Project {
  id: number;
  
  // Base Information
  school: string;
  contactPerson?: string;
  contactNumber?: string;
  place?: string;
  district?: string;
  region?: Region;
  projectName?: string;
  parentCompany?: string;
  executiveRemarks?: string;
  createdDate: string;
  createdBy: string;
  
  // Stage Tracking
  currentStage: ProjectStage;
  previousStage?: ProjectStage;
  stageChangeTimestamp?: string;
  stageChangedBy?: string;
  currentOwnerRole?: string;
  
  // Executive View Status (computed server-side from currentStage)
  // Used for executive dashboard tab categorization
  executiveViewStatus?: ExecutiveProjectStatus;
  
  // Sales Data
  projectValue?: number;
  invoiceAmount?: number;
  pendingDelivery?: string;
  quotationRemarks?: string;
  expectedDeliveryDate?: string;
  salesRemarks?: string;
  salesUpdatedTimestamp?: string;
  
  // Accounts Data
  paymentStatus?: PaymentStatus;
  amountReceived?: number;
  pendingAmount?: number;
  totalReceived?: number;  // Calculated sum from payment transactions
  paymentHistory?: PaymentTransaction[];  // List of all payment transactions
  paymentDate?: string;
  paymentRemarks?: string;
  paymentProofUrl?: string;
  accountsUpdatedTimestamp?: string;
  
  // Installation Data
  installationStatus?: InstallationStatus;
  installationRemarks?: string;
  completionDate?: string;
  installationUpdatedTimestamp?: string;
  
  // Audit
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  isLocked?: boolean;
}

// Alert System Types
export type AlertType = 
  | 'STAGE_INACTIVITY' 
  | 'PAYMENT_DELAY' 
  | 'INSTALLATION_DELAY' 
  | 'DUPLICATE_LEAD' 
  | 'UNAUTHORIZED_EDIT';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface Alert {
  id: number;
  projectId: number;
  projectName: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  createdAt: string;
  dismissedAt?: string;
  dismissedBy?: string;
  isActive: boolean;
  daysOverdue: number;
}

export interface AlertSummary {
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  infoAlerts: number;
}

export interface CreateProjectRequest {
  school: string;
  contactPerson?: string;
  contactNumber?: string;
  place?: string;
  district?: string;
  region?: Region;
  projectName?: string;
  parentCompany?: string;
  executiveRemarks?: string;
}

export interface UpdateSalesDataRequest {
  projectValue?: number;
  invoiceAmount?: number;
  pendingDelivery?: string;
  quotationRemarks?: string;
  expectedDeliveryDate?: string;
  salesRemarks?: string;
}

export interface UpdateAccountsDataRequest {
  paymentStatus?: PaymentStatus;
  amountReceived?: number;
  pendingAmount?: number;
  paymentDate?: string;
  paymentRemarks?: string;
  paymentProofUrl?: string;
}

export interface UpdateInstallationDataRequest {
  installationStatus?: InstallationStatus;
  installationRemarks?: string;
  completionDate?: string;
}

export interface StageTransitionRequest {
  toStage: ProjectStage;
  remarks?: string;
}

export interface ProjectFilterState {
  stage?: ProjectStage;
  district?: string;
  region?: Region;
  parentCompany?: string;
  search?: string;
}

// Analytics Types
export interface StageDistribution {
  stage: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  projectCount: number;
  revenue: number;
  completedCount: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  completedRevenue: number;
  pendingRevenue: number;
  totalReceived: number;
  totalPending: number;
}

export interface Analytics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  successRate: number;
  financialSummary: FinancialSummary;
  stageDistribution: StageDistribution[];
  monthlyTrends: MonthlyTrend[];
  projectsThisMonth: number;
  completedThisMonth: number;
  revenueThisMonth: number;
}
