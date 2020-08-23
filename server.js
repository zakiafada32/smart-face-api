const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
require('dotenv').config();

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

let dbConnection = {
  host: '127.0.0.1',
  user: 'postgres',
  password: '12345',
  database: 'smart-face-detection',
};

if (process.env.NODE_ENV === 'production') {
  dbConnection = {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  };
}

const db = knex({
  client: 'pg',
  connection: dbConnection,
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('smart face detection app');
});

app.post('/signin', signin.handleSignin(db, bcrypt));

app.post('/register', (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});

app.get('/profile/:id', (req, res) => {
  profile.handleProfileGet(req, res, db);
});

app.put('/image', (req, res) => {
  image.handleImage(req, res, db);
});

app.post('/imageurl', (req, res) => {
  image.handleApiCall(req, res);
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`app is running on port 3001 || ${process.env.PORT}`);
});
