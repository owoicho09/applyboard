const testimonials = [
  {
    name:        'Adebayo Johnson',
    destination: 'Canada',
    quote:       'ApplyBoard Africa made my Canada dream a reality. From document prep to visa approval — seamless! 🇨🇦',
  },
  {
    name:        'Fatimah Ibrahim',
    destination: 'Saudi Arabia',
    quote:       'The Hajj package was perfectly organized. Every detail was handled with care and professionalism. 🕋',
  },
  {
    name:        'Chinedu Okonkwo',
    destination: 'United Kingdom',
    quote:       'Got my UK visa on first attempt. Their 95% success rate is real — I am living proof! 🇬🇧',
  },
  {
    name:        'Amina Suleiman',
    destination: 'Germany',
    quote:       'Studied in Germany tuition-free. ApplyBoard handled everything including my blocked account. 🇩🇪',
  },
  {
    name:        'Emeka Nwosu',
    destination: 'Australia',
    quote:       'My student visa was approved in 3 weeks. The team guided me through every step professionally. 🇦🇺',
  },
  {
    name:        'Blessing Okafor',
    destination: 'Ireland',
    quote:       'From IELTS prep to admission to visa — ApplyBoard handled it all. Now studying in Dublin! 🇮🇪',
  },
];

/**
 * Returns a random testimonial formatted for WhatsApp
 */
const getRandomTestimonial = () => {
  const t = testimonials[Math.floor(Math.random() * testimonials.length)];
  return `⭐ *Client Success Story*\n\n_"${t.quote}"_\n\n— *${t.name}*, ${t.destination}`;
};

module.exports = { testimonials, getRandomTestimonial };