function mockCors(config) {
  function cors(req, res, cb) {
    cb();
  }
  return cors;
}

module.exports = mockCors;
