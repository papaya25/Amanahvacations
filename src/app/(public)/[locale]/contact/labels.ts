export type ContactLabels = {
  name: string;
  email: string;
  whatsapp: string;
  whatsappPlaceholder: string;
  subject: string;
  message: string;
  messagePlaceholder: string;
  nameError: string;
  emailErrorIncomplete: string;
  emailErrorMissing: string;
  messageError: string;
  sending: string;
  sendEmail: string;
  sendWhatsApp: string;
  waHint: string;
  waNudge: string;
  replyNote: string;
  sentTitle: string;
  thanksPrefix: string;
  sentBody: string;
  genericError: string;
};

export const DEFAULT_CONTACT_LABELS: ContactLabels = {
  name: "Name *",
  email: "Email *",
  whatsapp: "WhatsApp",
  whatsappPlaceholder: "+1 ... — needed for a WhatsApp reply",
  subject: "Subject",
  message: "Message *",
  messagePlaceholder: "Tell us about your trip — dates, group size, what you're dreaming of...",
  nameError: "Please enter your name.",
  emailErrorIncomplete: "This email looks incomplete — it should be like name@email.com",
  emailErrorMissing: "Please enter your email.",
  messageError: "Please write a short message.",
  sending: "Sending…",
  sendEmail: "Send via Email →",
  sendWhatsApp: "Send via WhatsApp",
  waHint: "Add your WhatsApp number above so we know where to answer you",
  waNudge: "💬 Want a WhatsApp reply? Add your WhatsApp number above to unlock the green button.",
  replyNote: "We usually reply within a few hours — same day, every day.",
  sentTitle: "Message sent!",
  thanksPrefix: "Thanks",
  sentBody: "we've got your message and will reply within a few hours, same day, every day.",
  genericError: "Something went wrong.",
};
