'use client';
import Icon from './Icon';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '';

// Floating WhatsApp chat launcher — Phase 1 "WhatsApp Integration".
// Renders nothing if no number is configured.
export default function WhatsAppButton() {
  if (!WHATSAPP) return null;
  const href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi Plant Gallery! I have a question about your plants.')}`;
  return (
    <a className="wa-fab" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
      <Icon name="whatsapp" size={26} stroke={2} color="#fff" />
    </a>
  );
}
