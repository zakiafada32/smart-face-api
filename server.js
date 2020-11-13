require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const auth = require('./controllers/authorization');

let dbConnection = {};

if (process.env.NODE_ENV === 'production') {
  dbConnection = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else {
  dbConnection = {
    host: '127.0.0.1',
    user: 'postgres',
    password: '12345',
    database: 'smart-face-detection',
  };
}

const db = knex({
  client: 'pg',
  connection: dbConnection,
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/signin', signin.signinAuthentication(db, bcrypt));

app.post('/register', (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});

app.get('/profile/:id', auth.requireAuth, (req, res) => {
  profile.handleProfileGet(req, res, db);
});

app.post('/profile/:id', auth.requireAuth, (req, res) => {
  profile.handleProfileUpdate(req, res, db);
});

app.put('/image', auth.requireAuth, (req, res) => {
  image.handleImage(req, res, db);
});

app.post('/imageurl', auth.requireAuth, (req, res) => {
  image.handleApiCall(req, res);
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`app is running on port 3001 or ${process.env.PORT}`);
});
