async function launchImageLibrary() {
  return {
    didCancel: true,
    assets: [],
  };
}

async function launchCamera() {
  return {
    didCancel: true,
    assets: [],
  };
}

module.exports = {
  launchImageLibrary,
  launchCamera,
};
module.exports.default = module.exports;
