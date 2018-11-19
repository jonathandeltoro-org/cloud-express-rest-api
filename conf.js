const mongoConnections = {
  'zone1': {
    'url': 'mongodb://owner:owner123@ds211724.mlab.com:11724/heroku_fvd3x38k',
    'db': 'heroku_fvd3x38k'
  },
  'zone2': {
    'url': 'mongodb://owner:owner123@@ds151207.mlab.com:51207/heroku_hn6849br',
    'db': 'heroku_hn6849br'
  },
  'zone3': {
    'url': 'mongodb://owner:owner123@@ds129394.mlab.com:29394/heroku_vgwdng4t',
    'db': 'heroku_vgwdng4t'
  }
};

const usersConf = {
  WDp5V4: {
    apiKey: 'WDp5V4',
    zone: 'zone1',
    tables: [
      'usuarios', 'tareas'
    ]
  },
  l1cs4h: {
    apiKey: 'l1cs4h',
    zone: 'zone2',
    tables: [
      'usuarios', 'aplicaciones'
    ]
  },
  r37JDp: {
    apiKey: 'r37JDp',
    zone: 'zone3',
    tables: [
      'usuarios', 'comidas'
    ]
  },
  NKFyzL: {
    apiKey: 'NKFyzL',
    zone: 'zone1',
    tables: [
      'usuarios', 'paises'
    ]
  }
};

module.exports = {
  mongoConnections,
  usersConf
};
