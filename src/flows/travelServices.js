const { sendButtons, sendText } = require('../services/messenger');
const { setState, updateData }  = require('../utils/stateManager');
const { updateLead }            = require('../services/leadService');
const { STAGES, BTN }           = require('../config/constants');
const { startConsultation }     = require('./consultation');

const handleTravel = async (from, action, state) => {

  if (action === 'START') {
    await setState(from, STAGES.TRAVEL_TYPE, { service: 'Travel Services' });
    await updateLead(from, { service_interested: 'travel' });

    return sendButtons(
      from,
      `✈️ *Travel Services — ApplyBoard Africa*\n\nWe get you the best deals on flights, hotels, and insurance worldwide.\n\nWhat do you need?`,
      [
        { id: BTN.TV_FLIGHTS,   title: '✈️ Cheap Flights' },
        { id: BTN.TV_HOTELS,    title: '🏨 Hotel Booking' },
        { id: BTN.TV_INSURANCE, title: '🛡️ Travel Insurance' },
      ]
    );
  }

  if (action === BTN.TV_FLIGHTS || action === 'INSURANCE') {
    const isInsurance = action === BTN.TV_INSURANCE || action === 'INSURANCE';
    const service     = isInsurance ? 'Travel Insurance' : 'Flight Tickets';

    await updateData(from, { service, travel_type: service });
    await updateLead(from, { service_interested: isInsurance ? 'insurance' : 'travel' });

    const msg = isInsurance
      ? `🛡️ *Travel & Health Insurance*\n\n✅ Accepted by all Schengen embassies\n✅ Student health insurance for all destinations\n✅ Emergency medical evacuation\n✅ Instant policy issuance\n\n💰 From ₦15,000 for 30-day coverage\n\nOur team will find you the best policy for your trip.`
      : `✈️ *Cheap Flights — Best Deals*\n\n✅ All major airlines from Lagos & Abuja\n✅ Group bookings available\n✅ Flexible rebooking options\n✅ Visa interview trip packages\n\n💰 Lagos to London from ₦850,000\nLagos to Canada from ₦1,200,000\n\nTell us your route and travel date and we will find you the best fare.`;

    await sendText(from, msg);
    return startConsultation(from, { ...state, data: { ...state.data, service } });
  }

  if (action === BTN.TV_HOTELS) {
    await updateData(from, { service: 'Hotel Booking', travel_type: 'Hotel' });

    await sendText(
      from,
      `🏨 *Hotel Reservations*\n\n✅ Hotels worldwide — all budgets\n✅ Visa interview accommodation\n✅ Near embassy / consulate options\n✅ Group bookings for pilgrimages & tours\n\nTell us your destination, dates, and budget and we will send options.`
    );
    return startConsultation(from, { ...state, data: { ...state.data, service: 'Hotel Booking' } });
  }
};

module.exports = { handleTravel };
