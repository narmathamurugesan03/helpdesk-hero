// ============================================================
// TicketContext — in-memory ticket store with CRUD operations
// ============================================================
import React, { createContext, useContext, useState } from "react";
import type { Ticket, TicketStatus, TicketContextValue, Comment } from "@/types";
import type { User } from "@/types";
import { mockTickets } from "@/data/mockData";

const TicketContext = createContext<TicketContextValue | null>(null);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

  /** Create a new ticket */
  const addTicket = (data: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "comments">) => {
    const now = new Date().toISOString();
    const ticket: Ticket = {
      ...data,
      id: `t${Date.now()}`,
      comments: [],
      createdAt: now,
      updatedAt: now,
    };
    setTickets((prev) => [ticket, ...prev]);
    return ticket;
  };

  /** Update the status of a ticket */
  const updateTicketStatus = (id: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  /** Add a comment to a ticket */
  const addComment = (ticketId: string, body: string, author: User) => {
    const comment: Comment = {
      id: `c${Date.now()}`,
      ticketId,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      body,
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, comments: [...t.comments, comment], updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  /** Delete a ticket (admin only — enforced in UI) */
  const deleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  const getTicketById = (id: string) => tickets.find((t) => t.id === id);

  return (
    <TicketContext.Provider value={{ tickets, addTicket, updateTicketStatus, addComment, deleteTicket, getTicketById }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used inside <TicketProvider>");
  return ctx;
};
