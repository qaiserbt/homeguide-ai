import { useEffect } from "react";
import { X, Phone, MessageSquare, Mail, Globe, CalendarCheck, User } from "lucide-react";
import type { Agent } from "../../types/property";

interface AgentContactSheetProps {
  agent: Agent;
  propertyAddress: string;
  open: boolean;
  onClose: () => void;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.05 2C6.55 2 2.1 6.45 2.1 11.95c0 1.85.5 3.58 1.37 5.07L2 22l5.15-1.42a9.87 9.87 0 0 0 4.9 1.32h.005c5.5 0 9.95-4.45 9.95-9.95C21.99 6.45 17.55 2 12.05 2zm0 18.15h-.005a8.15 8.15 0 0 1-4.16-1.14l-.298-.178-3.056.844.816-2.98-.194-.306a8.13 8.13 0 0 1-1.253-4.436c0-4.5 3.665-8.15 8.155-8.15 2.18 0 4.226.85 5.766 2.393a8.1 8.1 0 0 1 2.39 5.766c0 4.5-3.665 8.19-8.16 8.19z" />
    </svg>
  );
}

export function AgentContactSheet({ agent, propertyAddress, open, onClose }: AgentContactSheetProps) {
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

  const inquiryMessage = `Hi ${agent.name}, I'm interested in ${propertyAddress}.`;
  const telHref = `tel:${agent.phone.replace(/[^\d+]/g, "")}`;
  const smsHref = `sms:${agent.phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(inquiryMessage)}`;
  const waHref = `https://wa.me/${agent.phone.replace(/\D/g, "")}?text=${encodeURIComponent(inquiryMessage)}`;

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

        <div className="mt-6 grid grid-cols-3 gap-3">
          <a href={telHref} className="flex flex-col items-center gap-1.5 rounded-2xl bg-offwhite py-3.5 text-navy transition-colors hover:bg-navy/5">
            <Phone className="h-5 w-5" />
            <span className="text-xs font-medium">Call</span>
          </a>
          <a href={smsHref} className="flex flex-col items-center gap-1.5 rounded-2xl bg-offwhite py-3.5 text-navy transition-colors hover:bg-navy/5">
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs font-medium">Text</span>
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-offwhite py-3.5 text-navy transition-colors hover:bg-navy/5"
          >
            <WhatsAppIcon className="h-5 w-5" />
            <span className="text-xs font-medium">WhatsApp</span>
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
