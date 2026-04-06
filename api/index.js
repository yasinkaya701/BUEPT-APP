const { requestHandler } = require('../web-api-server');

module.exports = async (req, res) => {
  await requestHandler(req, res);
};
