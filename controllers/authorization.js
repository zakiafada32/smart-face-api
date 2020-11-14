// const redisClient = require('./signin').redisClient;
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send('Unauthorized');
  }
  // return redisClient.get(authorization, (err, reply) => {
  //   if (err || !reply) {
  //     return res.status(401).send('Unauthorized');
  //   }
  //   return next();
  // });

  return jwt.verify(
    authorization,
    process.env.JWT_SECRET_KEY,
    (err, decoded) => {
      console.log('err', err);
      console.log('decoded', decoded);
      console.log(decoded.id);
      if (err) {
        return res.status(401).send('Unauthorized');
      }
      return next();
    }
  );
};

module.exports = {
  requireAuth,
};
