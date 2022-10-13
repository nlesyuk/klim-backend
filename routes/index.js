const auth = require('./auth.route');
const publicRoute = require('./public.route');
const work = require('./work.route');
const contact = require('./contact.route');
const shots = require('./shots.route');
const photos = require('./photos.route');
const slider = require('./slider.route');

module.exports = {
  auth,
  publicRoute,
  work,
  contact,
  shots,
  photos,
  slider,
};
