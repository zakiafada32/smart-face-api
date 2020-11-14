const jwt = require('jsonwebtoken');
// const redis = require('redis');

// redis setup
// const redisClient = redis.createClient();

const signToken = (email, id) => {
  const jwtPayload = { email, id };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, {
    expiresIn: '2 days',
  });
};

// const setToken = (key, value) => Promise.resolve(redisClient.set(key, value));

const createSession = (user) => {
  const { email, id } = user;
  const token = signToken(email, id);
  console.log(token);
  return { success: 'true', userId: id, token, user };
  // return setToken(token, id)
  //   .then(() => {
  //     return { success: 'true', userId: id, token, user };
  //   })
  //   .catch(console.log);
};

const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject('incorrect form submission');
  }
  return db
    .select('email', 'hash')
    .from('login')
    .where('email', '=', email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', '=', email)
          .then((user) => user[0])
          .catch((err) => res.status(400).json('unable to get user'));
      } else {
        return Promise.reject('wrong credentials');
      }
    })
    .catch((err) => err);
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  return jwt.verify(
    authorization,
    process.env.JWT_SECRET_KEY,
    (err, decoded) => {
      if (err) {
        return res.status(401).send('Unauthorized');
      }
      return res.json({ id: decoded.id });
    }
  );
  // return redisClient.get(authorization, (err, reply) => {
  //   if (err || !reply) {
  //     return res.status(401).send('Unauthorized');
  //   }
  //   return res.json({ id: reply });
  // });
};

const signinAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization
    ? getAuthTokenId(req, res)
    : handleSignin(db, bcrypt, req, res)
        .then((data) =>
          data.id && data.email ? createSession(data) : Promise.reject(data)
        )
        .then((session) => res.json(session))
        .catch((err) => res.status(400).json(err));
};

module.exports = {
  signinAuthentication: signinAuthentication,
  // redisClient: redisClient,
};
