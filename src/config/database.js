// /* eslint-disable no-console */

import mongoose from 'mongoose';

import constants from './constants';

// Remove the warning with Promise
mongoose.Promise = global.Promise;

const options = {
  useMongoClient: true,
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0
};
// Connect the db with the url provide
try {
  mongoose.connect(constants.MONGO_URL, options);
} catch (err) {
  mongoose.createConnection(constants.MONGO_URL, options);
}

mongoose.connection
  .once('open', () => console.log('MongoDB Running'))
  .on('error', e => {
    throw e;
  });

// const mongoose = require('mongoose');
// mongoose.Promise = Promise;

// mongoose.connection.on("connected", () => {
//   console.log("Connection Established");
// });

// mongoose.connection.on("reconnected", () => {
//   console.log("Connection Reestablished");
// });

// mongoose.connection.on("disconnected", () => {
//   console.log("Connection Disconnected");
// });

// mongoose.connection.on("close", () => {
//   console.log("Connection Closed");
// });

// mongoose.connection.on("error", (error) => {
//   console.log("ERROR: " + error);
// });

// var nodeSchema = new mongoose.Schema({}, { bufferCommands: false });
// var Node = mongoose.model('Node', nodeSchema);

// run().catch(error => console.error(error));

// async function run() {
//   await mongoose.connect(constants.MONGO_URL, {
//     useMongoClient: true,
//     autoReconnect: true,
//     reconnectTries: 1000000,
//     reconnectInterval: 3000,
//     bufferMaxEntries: 0 // Disable node driver's buffering as well
//   });

//   while (true) {
//     console.log('Query', await Node.findOne());
//     await new Promise(resolve => setTimeout(() => resolve(), 2000));
//   }
// }
