import type { Agent } from "../types/property";

export function inquiryMessage(agent: Agent, propertyAddress: string): string {
  return `Hi ${agent.name}, I'm interested in ${propertyAddress}.`;
}

export function telHref(agent: Agent): string {
  return `tel:${agent.phone.replace(/[^\d+]/g, "")}`;
}

export function smsHref(agent: Agent, propertyAddress: string): string {
  return `sms:${agent.phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(inquiryMessage(agent, propertyAddress))}`;
}

export function whatsAppHref(agent: Agent, propertyAddress: string): string {
  return `https://wa.me/${agent.phone.replace(/\D/g, "")}?text=${encodeURIComponent(inquiryMessage(agent, propertyAddress))}`;
}
