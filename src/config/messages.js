const { COMPANY } = require('./constants');

const MESSAGES = {

  // Natural opener — rotates to feel fresh, opens conversation
  // No service dump, no emoji overload, no corporate intro
  greeting: (name = '') => {
    const n = name && name !== 'there' ? ` ${name}` : '';
    const openers = [
      `Hey${n}. What are you trying to figure out?`,
      `Hey${n}, good to have you here. What's on your mind?`,
      `Hi${n}. What brings you here today?`,
      `Hey${n}. Are you thinking about studying abroad or relocating?`,
      `Hey${n}. What's the plan?`,
    ];
    return openers[Math.floor(Math.random() * openers.length)];
  },

  fallback:
    `Something went wrong on my end. Give me a moment and try again, or reach us directly on ${COMPANY.phone}`,

  rateLimit:
    `You are sending messages quite fast. Give me a second to catch up.`,

  paystackTransfer: (url) => url
    ? `We only process payments through Paystack — it accepts card, bank transfer, and USSD all in one place, no card required.\n\nHere is your secure link:\n\n${url}\n\nSelect "Bank Transfer" on the Paystack page and it will give you the transfer details. Confirmation comes through automatically once done.`
    : `We only process payments through Paystack — it accepts card, bank transfer, and USSD all in one place, no card required.\n\nOnce you have your payment link, select "Bank Transfer" on the Paystack page and it handles everything from there.`,

  paymentConfirmed: (amount, ref) =>
    `Payment confirmed.\n\nAmount: ₦${Number(amount).toLocaleString('en-NG')}\nReference: ${ref}\n\nYou are in the system. Someone from our team will be in touch shortly.`,

  escalation:
    `Understood. Flagging this for a senior team member right now.\n\nThey will reach out to you directly — usually within 30 minutes during business hours.\n\nAnything else you want me to note before they call?`,

  sessionExpired:
    `Hey, welcome back.\n\nWhat are you working on today?`,

  registrationPrompt: (name = '') => {
    const n = name ? `, ${name}` : '';
    return `Alright${n}, I have a clear picture of your situation.\n\nTo move this forward properly and get you matched with the right specialist on our team, there is a one-time registration fee of ₦10,000.\n\nThis gets you into the system and on the priority list — the team will be fully briefed on your case before they reach out.\n\nReady to proceed?`;
  },
};

module.exports = { MESSAGES };
