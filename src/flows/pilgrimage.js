const { sendButtons, sendText } = require('../services/whatsapp');
const { setState, updateData }  = require('../utils/stateManager');
const { updateLead }            = require('../services/leadService');
const { STAGES, BTN }           = require('../config/constants');
const { startConsultation }     = require('./consultation');

const handlePilgrimage = async (from, action, state) => {

  if (action === 'START') {
    await setState(from, STAGES.PILGRIMAGE_TYPE, { service: 'Pilgrimage & Tours' });
    await updateLead(from, { service_interested: 'pilgrimage' });

    return sendButtons(
      from,
      `🕋 *Hajj, Umrah & Tour Packages*\n\nAlhamdulillah! We have helped thousands complete their spiritual journey.\n\nWhat are you interested in?`,
      [
        { id: BTN.PG_HAJJ,  title: '🕋 Hajj Package' },
        { id: BTN.PG_UMRAH, title: '🌙 Umrah Package' },
        { id: BTN.PG_TOURS, title: '🌍 Tour Packages' },
      ]
    );
  }

  if (action === BTN.PG_HAJJ) {
    await updateData(from, { pilgrimage_type: 'Hajj' });
    await sendText(
      from,
      `🕋 *Hajj Package — ApplyBoard Africa*\n\n` +
      `✅ All-inclusive Hajj packages\n` +
      `✅ Visa processing & documentation\n` +
      `✅ Return flights from Lagos / Abuja\n` +
      `✅ Accommodation in Makkah & Madinah\n` +
      `✅ Ground transportation\n` +
      `✅ Experienced tour coordinator\n\n` +
      `💰 *Price range: ₦2,500,000 – ₦6,000,000*\n` +
      `_(varies by package tier and season)_\n\n` +
      `⚡ *Hajj quotas fill up fast — register early!*`
    );
    return startConsultation(from, { ...state, data: { ...state.data, service: 'Hajj Package' } });
  }

  if (action === BTN.PG_UMRAH) {
    await updateData(from, { pilgrimage_type: 'Umrah' });
    await sendText(
      from,
      `🌙 *Umrah Package — ApplyBoard Africa*\n\n` +
      `✅ Group & private packages available\n` +
      `✅ Visa processing included\n` +
      `✅ Return flights + transfers\n` +
      `✅ 3-star to 5-star hotel options\n\n` +
      `💰 *From ₦2,500,000 per person*\n\n` +
      `Available year-round. Ramadan packages book out 3 months in advance.`
    );
    return startConsultation(from, { ...state, data: { ...state.data, service: 'Umrah Package' } });
  }

  if (action === BTN.PG_TOURS) {
    return sendButtons(
      from,
      `🌍 *Tour Packages*\n\nWhere would you like to go?`,
      [
        { id: 'TOUR_DUBAI',   title: '🇦🇪 Dubai' },
        { id: 'TOUR_TURKEY',  title: '🇹🇷 Turkey' },
        { id: 'TOUR_EUROPE',  title: '🇪🇺 Europe' },
      ]
    );
  }

  if (['TOUR_DUBAI', 'TOUR_TURKEY', 'TOUR_EUROPE'].includes(action)) {
    const dest = { TOUR_DUBAI: 'Dubai 🇦🇪', TOUR_TURKEY: 'Turkey 🇹🇷', TOUR_EUROPE: 'Europe 🇪🇺' }[action];
    await updateData(from, { tour_destination: dest });
    await sendText(
      from,
      `🌍 *${dest} Tour Package*\n\n` +
      `✅ Return flights from Nigeria\n` +
      `✅ Hotel accommodation\n` +
      `✅ Visa processing\n` +
      `✅ Airport transfers\n` +
      `✅ Tour guide & sightseeing\n\n` +
      `Our team will send you a full itinerary and pricing during your consultation.`
    );
    return startConsultation(from, { ...state, data: { ...state.data, service: `${dest} Tour` } });
  }
};

module.exports = { handlePilgrimage };