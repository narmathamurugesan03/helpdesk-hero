// ============================================================
// Core domain types for the Smart IT Helpdesk system
// ============================================================

export type Role = "admin" | "agent" | "user";
export type TicketStatus = "Open" | "In Progress" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High";
export type TicketCategory =
  | "Network"
  | "Hardware"
  | "Software"
  | "Security"
  | "Account Access"
  | "Other";

// ---- User ------------------------------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: string;
  createdAt: string;
}

// ---- Comment -----------------------------------------------
export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  body: string;
  createdAt: string;
}

// ---- Ticket ------------------------------------------------
export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdById: string;
  createdByName: string;
  assignedToId?: string;
  assignedToName?: string;
  attachments: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

// ---- Auth context value ------------------------------------
export interface AuthContextValue {
  currentUser: User | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (name: string, email: string, password: string, role?: Role) => { success: boolean; message: string };
  logout: () => void;
  isAuthenticated: boolean;
}

// ---- Ticket context value ----------------------------------
export interface TicketContextValue {
  tickets: Ticket[];
  addTicket: (data: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "comments">) => Ticket;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  addComment: (ticketId: string, body: string, author: User) => void;
  deleteTicket: (id: string) => void;
  getTicketById: (id: string) => Ticket | undefined;
}

// ---- Filters -----------------------------------------------
export interface TicketFilters {
  status: TicketStatus | "All";
  priority: TicketPriority | "All";
  search: string;
}
