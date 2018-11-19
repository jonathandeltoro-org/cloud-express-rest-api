const Mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();
const config = require('./conf.js');
ObjectID = require('mongodb').ObjectID,


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
      if (err) return reqReject(err);

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
      const uuid = (index && (new ObjectID(index))) || '';
      const myTable = `${apiKey}_${table}`;
      Promise.all(promises).then(res => {
        if (method === 'get') {
          if (index) {
            myDB.collection(`${myTable}`).findOne({
              _id: uuid
            }, (err, result) => {
              database.close();
              if (err) reqReject(err);
              reqResolve(result);
            });
          } else {
            myDB.collection(`${myTable}`).find({}).toArray((err, result) => {
              database.close();
              if (err) reqReject(err);
              reqResolve(result);
            });
          }
        } else if (method === 'post') {
          myDB.collection(`${myTable}`).insertOne(payload, (err, result) => {
            database.close();
            if (err) reqReject(err);
            reqResolve(result);
          });
        } else if (method === 'delete') {
          if (index) {
            myDB.collection(`${myTable}`).deleteOne({
              _id: uuid
            }, (err, result) => {
              database.close();
              if (err) reqReject(err);
              reqResolve(result);
            });
          } else {
            database.close();
            reqReject('no index')
          }
        } else if (method === 'put') {
          if (index) {
            myDB.collection(`${myTable}`).updateOne({
              _id: uuid
            }, {
              $set: payload
            }, (err, result) => {
              database.close();
              if (err) reqReject(err);
              reqResolve(result);
            });
          } else {
            database.close();
            reqReject('no index')
          }
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
    if (!params || params.length <= 0) {
      return res.status(500).send(`error with: ${params}`);
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
      if (!result)
        res.status(404).json([]);
      else
        res.status(200).json(result);
      return result;
    }).catch(e => {
      res.status(501).send(`error ${e}`);
      console.log('error', e);
    });
  })
  .post((req, res) => {
    const params = req.params && req.params[0] && req.params[0].split('/') || [];
    if (!params || params.length <= 0) {
      return res.status(500).send(`error with: ${params}`);
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
  })
  .delete((req, res) => {
    const params = req.params && req.params[0] && req.params[0].split('/') || [];
    if (!params || params.length <= 1) {
      return res.status(500).send(`error with: ${params}`);
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
      database(reqResolve, reqReject, userConf, serverConf, 'delete', table, index, {});
    });
    getPromise.then(result => {
      res.status(201).json(result);
      return result;
    }).catch(e => {
      res.status(501).send(`error ${e}`);
      console.log('error', e);
    });
  })
  .put((req, res) => {
    const params = req.params && req.params[0] && req.params[0].split('/') || [];
    if (!params || params.length <= 1) {
      return res.status(500).send(`error with: ${params}`);
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
      database(reqResolve, reqReject, userConf, serverConf, 'put', table, index, body);
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
