/* eslint-disable no-console */

import express from 'express';

import constants from './config/constants';
import './config/database';
import middlewaresConfig from './config/middlewares';
import apiRoutes from './modules';
import { error } from 'util';

const app = express();

/**dùng cho đọc temp ejs */
app.use(express.static("./src/public"));
app.set("view engine", "ejs");
app.set("views", "./src/views");
/**end dùng cho đọc temp ejs */

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE,PATCH, OPTIONS, HEAD");
  next();
});
middlewaresConfig(app);

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.get('/docs', function (req, res) {
  res.render('docs');
});
apiRoutes(app);

//error handling middlewares
app.use(function (err, req, res, next) {
  res.status(400).send({ error: err });
});

app.listen(constants.PORT, err => {
  if (err) {
    throw err;
  } else {
    console.log(`
      Server running on port: ${constants.PORT}
      ---
      Running on ${process.env.NODE_ENV}
      ---
      IT Deparment
    `);
  }
});
