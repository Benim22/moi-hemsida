// This file now only exports constants for backward compatibility
// The actual EmailJS functionality has been moved to server actions

// Export constants for backward compatibility
export const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || ""
export const EMAILJS_CONTACT_TEMPLATE_ID = process.env.EMAILJS_CONTACT_TEMPLATE_ID || ""
export const EMAILJS_BOOKING_TEMPLATE_ID = process.env.EMAILJS_BOOKING_TEMPLATE_ID || ""
export const EMAILJS_ORDER_TEMPLATE_ID = process.env.EMAILJS_ORDER_TEMPLATE_ID || ""

// Export a dummy emailjs object for backward compatibility
export const emailjs = {
  // This is a dummy implementation that will log a warning if accidentally used
  send: async () => {
    console.warn("Direct use of emailjs.send() is deprecated. Please use server actions instead.")
    return { status: 500, text: "Direct use of emailjs.send() is deprecated" }
  },
  init: (publicKey: string) => {
    console.warn("Direct use of emailjs.init() is deprecated. Please use server actions instead.")
  },
}

