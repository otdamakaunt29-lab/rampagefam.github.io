
export enum UserRole {
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
  EXECUTIVE = 'EXECUTIVE',
  MEMBER = 'MEMBER'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  password?: string;
  isBlocked?: boolean;
  hasAccessCode?: boolean; // Флаг для тех, кто зашел по коду
}

export interface NewsEntry {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
}

export interface FinancialEntry {
  id: string;
  businessName: string;
  withdrawalAmount: number;
  screenshotUrl: string;
  creator: string;
  date: string;
  description: string;
}

export interface MarketplaceEntry {
  id: string;
  title: string;
  price: string;
  description: string;
  seller: string;
  date: string;
  type: 'market' | 'rent';
  imageUrl?: string;
}

export interface UserNote {
  targetUserId: string;
  content: string;
}

export interface ConfidentialItem {
  id: string;
  title: string;
  owesTo?: string;
  category: string;
  urgency: 'high' | 'medium' | 'low';
  lastUpdated: string;
  dueDate?: string;
  content: string;
  restrictedTo: UserRole[];
  debtStatus?: 'owes' | 'closed';
}

export interface LogEntry {
  id: string;
  userId?: string;
  action: string;
  timestamp: string;
  details?: string;
}
