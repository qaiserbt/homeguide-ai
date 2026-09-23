import { useEffect } from "react";
import { X, Phone, MessageSquare, Mail, Globe, CalendarCheck, User } from "lucide-react";
import type { Agent } from "../../types/property";

interface AgentContactSheetProps {
  agent: Agent;
  open: boolean;
  onClose: () => void;
}

export function AgentContactSheet({ agent, open, onClose }: AgentContactSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const telHref = `tel:${agent.phone.replace(/[^\d+]/g, "")}`;
  const smsHref = `sms:${agent.phone.replace(/[^\d+]/g, "")}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Contact agent">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm animate-fade-in"
      />
      <div className="animate-slide-up relative w-full max-w-md rounded-t-3xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-card-lg sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close contact sheet"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-offwhite text-text-secondary hover:text-navy"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center pt-2 text-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-navy/5">
            <User className="h-9 w-9 text-navy/40" strokeWidth={1.5} />
          </div>
          <h3 className="mt-3 font-serif text-xl text-navy">{agent.name}</h3>
          <p className="text-sm font-medium text-gold-dark">{agent.title}</p>
          <p className="text-sm text-text-secondary">{agent.brokerage}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <a href={telHref} className="flex flex-col items-center gap-1.5 rounded-2xl bg-offwhite py-3.5 text-navy transition-colors hover:bg-navy/5">
            <Phone className="h-5 w-5" />
            <span className="text-xs font-medium">Call</span>
          </a>
          <a href={smsHref} className="flex flex-col items-center gap-1.5 rounded-2xl bg-offwhite py-3.5 text-navy transition-colors hover:bg-navy/5">
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs font-medium">Text</span>
          </a>
          <a href={`mailto:${agent.email}`} className="flex flex-col items-center gap-1.5 rounded-2xl bg-offwhite py-3.5 text-navy transition-colors hover:bg-navy/5">
            <Mail className="h-5 w-5" />
            <span className="text-xs font-medium">Email</span>
          </a>
          {agent.website ? (
            <a href={agent.website} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 rounded-2xl bg-offwhite py-3.5 text-navy transition-colors hover:bg-navy/5">
              <Globe className="h-5 w-5" />
              <span className="text-xs font-medium">Website</span>
            </a>
          ) : (
            <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-offwhite/50 py-3.5 text-text-secondary/40">
              <Globe className="h-5 w-5" />
              <span className="text-xs font-medium">Website</span>
            </div>
          )}
        </div>

        <a
          href={`mailto:${agent.email}?subject=${encodeURIComponent("Schedule a Showing")}`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold tracking-wide text-navy shadow-gold transition-transform active:scale-[0.98] hover:bg-gold-dark"
        >
          <CalendarCheck className="h-4 w-4" />
          Schedule Showing
        </a>
      </div>
    </div>
  );
}
