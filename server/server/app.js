const express = require('express');
const httpStatusCode = require('http-status-codes');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const routes = require('./routes/index');

module.exports = () => {
  const server = express();

  const create = () => {
    // handle uncaught exception
    process.on('uncaughtException', (err) => {
      console.log(`uncaught exception: ${err.stack}`);
      process.exit(1);
    });

    dotenv.config({
      path: `${path.join(__dirname, './config/config.env')}`
    });

    server.use(cors());
    server.use(express.json());
    server.use(express.urlencoded({ extended: false }));

    if (process.env.NODE_ENV === 'dev') {
      server.use(morgan('tiny'));
    }

    const logStream = fs.createWriteStream(path.join(__dirname, './log.txt'));
    server.use(
      morgan(`${Date.now()}\t\t:url\t\tdone in :response-time s`, {
        stream: logStream
      })
    );

    routes.init(server);

    // 404 Error Handler. Request not found.
    server.use((req, res, next) => {
      res.status(httpStatusCode.BAD_REQUEST).json({
        error: [
          {
            msg: 'invalid endpoint. kindly check documentation'
          }
        ]
      });
      next();
    });
  };

  const start = () => {
    const port = process.env.PORT || 5111;
    server.listen(port, () => {
      console.log(`Express server listening on - https://localhost:${port}`);
    });
  };

  return {
    create,
    start
  };
};
