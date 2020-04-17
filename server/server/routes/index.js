const apiRoutes = require('./apis');

const init = (server) => {
  server.use('/api', apiRoutes);
  server.use('/', apiRoutes);
};

module.exports = {
  init
};
