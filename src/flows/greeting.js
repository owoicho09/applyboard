const { sendButtons }          = require('../services/messenger');
const { setState }             = require('../utils/stateManager');
const { getRandomTestimonial } = require('../data/testimonials');
const { MESSAGES, STAGES, BTN } = require('../config/constants');
const { getFirstName }         = require('../utils/helpers');

const sendGreeting = async (from, name = '') => {
  const firstName = getFirstName(name);

  await setState(from, STAGES.MAIN_MENU);

  await sendButtons(
    from,
    MESSAGES.greeting(firstName),
    [
      { id: BTN.MENU_EXPLORE, title: '📚 Explore Services' },
      { id: BTN.MENU_CONSULT, title: '📞 Free Consultation' },
      { id: BTN.SVC_LOAN,     title: '💰 Study Loan' },
    ]
  );

  // Send a testimonial 30% of the time to build social proof
  if (Math.random() < 0.3) {
    const { sendText } = require('../services/messenger');
    await sendText(from, getRandomTestimonial());
  }
};

module.exports = { sendGreeting };
