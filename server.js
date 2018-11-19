const Mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();
const config = require('./conf.js');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const opts = {
  useNewUrlParser: true
};


function database(reqResolve, reqReject, userConf, serverConf, method, table, index, payload) {
  if (userConf && serverConf) {
    const callback = async (err, database) => {
      if (err) reqReject(err);
      const myDB = database.db(serverConf.db)
      const collections = await myDB.collections();
      const apiKey = userConf.apiKey;
      const userCollections = userConf.tables;
      console.log('successfully connected to the database', collections && collections.map(el => el.s && el.s.name));

      const promises = userCollections.map(element => {
        const table = `${apiKey}_${element}`;
        const found = collections.find(serverTable => serverTable.s.name === table);
        if (!found) {
          return new Promise((resolve, reject) => {
            myDB.createCollection(table, (err, res) => {
              if (err) reject(err);
              resolve(res);
            });
          });
        } else {
          return Promise.resolve(true);
        }

      });
      Promise.all(promises).then(res => {
        if (method === 'get') {
          myDB.collection(`${apiKey}_${table}`).find({}).toArray((err, result) => {
            database.close();
            if (err) reqReject(err);
            reqResolve(result);
          });
        } else if (method === 'post') {
          myDB.collection(`${apiKey}_${table}`).insertOne(payload, (err, result) => {
            database.close();
            if (err) reqReject(err);
            reqResolve(result);
          });
        } else {
          database.close();
          reqResolve(res);
        }
        return res;
      }).catch(e => reqReject(e));
    }
    return (new MongoClient(serverConf.url, opts)).connect(callback);
  }
}


// Serve only the static files form the dist directory

app.use(express.static(__dirname + '/public'));
app.route('/api/*').get((req, res) => {
    const params = req.params && req.params[0] && req.params[0].split('/') || [];
    console.log(req.params && req.params[0], params);
    if (!params || params.length <= 0) {
      return res.status(201).send(`error with: ${params}`);
    }

    const apiKey = (req.headers && req.headers.token) || 'WDp5V4';
    const userConf = config.usersConf[apiKey];
    const serverConf = config.mongoConnections[userConf.zone];
    const userCollections = userConf.tables;
    const table = params[0];
    const index = params[1];

    const found = userCollections.find(t => t.toLowerCase() === table.toLowerCase());
    if (!found) {
      return res.status(404).send(`error table ${table} doesn't exist`);
    }
    const getPromise = new Promise((reqResolve, reqReject) => {
      database(reqResolve, reqReject, userConf, serverConf, 'get', table, index, {});
    });
    getPromise.then(result => {
      //res.send(err);
      res.status(201).json(result);
      return result;
    }).catch(e => {
      res.status(501).send(e);
      console.log('error', e);
    });
  })
  .post((req, res) => {

    const params = req.params && req.params[0] && req.params[0].split('/') || [];
    console.log(req.params && req.params[0], params);
    if (!params || params.length <= 0) {
      return res.status(201).send(`error with: ${params}`);
    }
    const body = req.body;
    if (!body) {
      return res.status(404).send(`error no body`);
    }
    const apiKey = (req.headers && req.headers.token) || 'WDp5V4';
    const userConf = config.usersConf[apiKey];
    const serverConf = config.mongoConnections[userConf.zone];
    const userCollections = userConf.tables;
    const table = params[0];
    const index = params[1];

    const found = userCollections.find(t => t.toLowerCase() === table.toLowerCase());
    if (!found) {
      return res.status(404).send(`error table ${table} doesn't exist`);
    }
    const getPromise = new Promise((reqResolve, reqReject) => {
      database(reqResolve, reqReject, userConf, serverConf, 'post', table, index, body);
    });
    getPromise.then(result => {
      //res.send(err);
      res.status(201).json(result);
      return result;
    }).catch(e => {
      res.status(501).send(e);
      console.log('error', e);
    });
  });

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
