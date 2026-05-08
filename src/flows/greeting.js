const { sendText }   = require('../services/messenger');
const { setState }   = require('../utils/stateManager');
const { STAGES, MESSAGES } = require('../config/constants');
const { getFirstName }     = require('../utils/helpers');

const sendGreeting = async (from, name = '') => {
  const firstName = getFirstName(name);

  // Move to AI-driven state — no menus, no buttons
  // The AI takes over from here
  await setState(from, STAGES.FREE_TEXT_AI);

  return sendText(from, MESSAGES.greeting(firstName));
};

module.exports = { sendGreeting };