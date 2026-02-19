const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

module.exports = function (app) {
  // Secure headers
  app.use(helmet());

  // Basic rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
};
