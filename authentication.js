'use strict';

const test = (z, bundle) => {

  const promise = require("./helpers").createFtpClient(z, bundle);



  return promise.then(x => {
    x.ftpClient.end();
    return {
      id: x.id
    }
  });
};

module.exports = {
  config: {
    type: 'custom',
    fields: [
      { key: 'ftpHost', label: 'Host address', required: true },
      { key: 'ftpPort', label: 'Port', required: false },
      { key: 'ftpUsername', label: 'Username', required: true },
      { key: 'ftpPassword', label: 'Password', required: true },
      { key: 'ftpSecure', type: 'boolean', label: 'Secure', required: false }
    ],
    test,
    connectionLabel: '{{id}}',
  }
};
