const { sendText } = require('./messenger');
const supabase     = require('../config/database');

// Staff WhatsApp numbers — add to Railway environment variables
const STAFF = {
  admissions:   process.env.STAFF_ADMISSIONS,
  visa:         process.env.STAFF_VISA,
  support:      process.env.STAFF_SUPPORT,
  finance:      process.env.STAFF_FINANCE,
  info:         process.env.STAFF_INFO,
  partnerships: process.env.STAFF_PARTNERSHIPS,
  complaints:   process.env.STAFF_COMPLAINTS,
};

// Determine which staff member should receive this lead
const getStaffNumber = (service) => {
  const routing = {
    study_abroad: STAFF.admissions,
    visa:         STAFF.visa,
    test_prep:    STAFF.support,
    loan:         STAFF.admissions,
    travel:       STAFF.info,
    insurance:    STAFF.info,
    pilgrimage:   STAFF.info,
    pof:          STAFF.admissions,
    default:      STAFF.info,
  };
  return routing[service] || routing.default || process.env.AGENT_WHATSAPP;
};

// Determine staff email for CRM reference
const getStaffEmail = (service) => {
  const routing = {
    study_abroad: 'admissions@applyboardafrica.com',
    visa:         'visa@applyboardafrica.com',
    test_prep:    'support@applyboardafrica.com',
    loan:         'admissions@applyboardafrica.com',
    travel:       'info@applyboardafrica.com',
    insurance:    'info@applyboardafrica.com',
    pilgrimage:   'info@applyboardafrica.com',
    pof:          'admissions@applyboardafrica.com',
    default:      'info@applyboardafrica.com',
  };
  return routing[service] || routing.default;
};

// Build a complete brief for the staff member
const buildStaffBrief = (phone, state, lead = {}) => {
  const d = state.data || {};

  const lines = [
    `NEW REGISTERED CLIENT`,
    ``,
    `Name: ${d.name || lead.name || 'Not provided'}`,
    `Contact: ${phone}`,
    `Service: ${d.service || lead.service_interested || 'Not specified'}`,
    ``,
  ];

  if (d.destination || lead.destination_country) {
    lines.push(`Destination: ${d.destination || lead.destination_country}`);
  }
  if (d.program_level || lead.program_level) {
    lines.push(`Program Level: ${d.program_level || lead.program_level}`);
  }
  if (d.timeline || lead.timeline) {
    lines.push(`Timeline: ${d.timeline || lead.timeline}`);
  }
  if (d.age) {
    lines.push(`Age: ${d.age}`);
  }
  if (d.loan_region) {
    lines.push(`Loan Interest: ${d.loan_region}`);
  }
  if (d.budget) {
    lines.push(`Budget situation: ${d.budget}`);
  }
  if (d.fears) {
    lines.push(`Concerns raised: ${d.fears}`);
  }
  if (d.exam) {
    lines.push(`Test prep needed: ${d.exam}`);
  }

  lines.push(``);
  lines.push(`Payment: Registration fee ₦10,000 confirmed`);
  lines.push(`Platform: ${phone.startsWith('tg_') ? 'Telegram' : 'WhatsApp'}`);
  lines.push(``);
  lines.push(`ACTION REQUIRED: Reach out to this client and continue from where the conversation left off. They are ready to move forward.`);

  return lines.join('\n');
};

// Main function — route to correct staff with full brief
const notifyStaff = async (phone, state) => {
  try {
    const service     = state.data?.service || 'default';
    const staffNumber = getStaffNumber(service);
    const staffEmail  = getStaffEmail(service);

    // Get full lead from DB for complete context
    let lead = {};
    try {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('phone_number', phone)
        .single();
      lead = data || {};
    } catch (e) {}

    // Update lead with assigned staff
    await supabase
      .from('leads')
      .update({
        agent_assigned:     staffEmail,
        conversation_stage: 'registered',
      })
      .eq('phone_number', phone);

    // Send brief to staff WhatsApp if number is configured
    if (staffNumber) {
      const brief = buildStaffBrief(phone, state, lead);
      await sendText(staffNumber, brief).catch((err) =>
        console.error('[NOTIFY] Staff WhatsApp failed:', err.message)
      );
    }

    console.log(`[NOTIFY] Lead ${phone} routed to ${staffEmail}`);
  } catch (err) {
    console.error('[NOTIFY] Error:', err.message);
  }
};

// General agent notification (escalations etc)
const notifyAgent = async (event, data = {}) => {
  const agentNumber = process.env.AGENT_WHATSAPP;
  if (!agentNumber) return;

  let message = '';

  switch (event) {
    case 'PAYMENT_RECEIVED':
      message =
        `PAYMENT RECEIVED\n\n` +
        `Phone: ${data.phone}\n` +
        `Amount: ₦${Number(data.amount).toLocaleString()}\n` +
        `Reference: ${data.reference}`;
      break;

    case 'ESCALATION':
      message =
        `ESCALATION — Action Required\n\n` +
        `Phone: ${data.phone}\n` +
        `Name: ${data.name || 'Unknown'}\n` +
        `Service: ${data.service || 'Unknown'}\n` +
        `Stage: ${data.stage}`;
      break;

    default:
      message = `ApplyBoard Bot Alert\nEvent: ${event}\n${JSON.stringify(data, null, 2)}`;
  }

  await sendText(agentNumber, message).catch((err) =>
    console.error('[NOTIFY] Agent notification failed:', err.message)
  );
};

module.exports = { notifyStaff, notifyAgent, getStaffEmail };