const http = require('https'); // require('http') if your URL is not https
const helpers = require("../helpers");
const FTP = require('@icetee/ftp');

function fixFTP() {

  // Private/Internal methods
  FTP.prototype._pasv = function (cb) {
    const RE_EPSV = /([\d]+)/;
    const RE_PASV = /([\d]+),([\d]+),([\d]+),([\d]+),([-\d]+),([-\d]+)/

    var self = this, first = true, ip, port;

    var pasvCmd = (self._featEpsv && !self.options.forcePasv) ? 'EPSV' : 'PASV';
    self._send(pasvCmd, function reentry(err, text) {
      if (err)
        return cb(err);

      self._curReq = undefined;

      if (first) {
        if (pasvCmd === 'EPSV') {
          var tcpPrt = RE_EPSV.exec(text)[0];

          ip = self._socket.remoteAddress;
          port = tcpPrt;

        } else {
          var m = RE_PASV.exec(text);
          if (!m) return cb(new Error('Unable to parse PASV server response'));
          ip = m[1];
          ip += '.';
          ip += m[2];
          ip += '.';
          ip += m[3];
          ip += '.';
          ip += m[4];
          port = (parseInt(m[5], 10) * 256) + parseInt(m[6], 10);
        }

        first = false;
      }

      self._pasvConnect(ip, port, function (err, sock) {
        if (err) {
          // try the IP of the control connection if the server was somehow
          // misconfigured and gave for example a LAN IP instead of WAN IP over
          // the Internet
          if (self._socket && ip !== self._socket.remoteAddress) {
            ip = self._socket.remoteAddress;
            return reentry();
          }

          // automatically abort PASV mode
          self._send('ABOR', function () {
            cb(err);
            self._send();
          }, true);

          return;
        }
        cb(undefined, sock);
        self._send();
      });
    });
  };
}


const makeDownloadStream = (url) =>
  new Promise((resolve, reject) => {
    http.request(url, resolve).on('error', reject).end();
  });


// create a particular file by name
const perform = async (z, bundle) => {

  fixFTP();

  const result = await helpers.createFtpClient(z, bundle);

  z.console.log(bundle.inputData);

  const stream = await makeDownloadStream(bundle.inputData.file);

  await result.ftpClient.put(stream, bundle.inputData.upload_path);

  result.ftpClient.end();

  return {
    isSuccess: true
  }
};

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#createschema
  key: 'file',
  noun: 'File',

  display: {
    label: 'Create File',
    description: 'Creates a new file, probably with input from previous steps.'
  },

  operation: {
    perform,

    // `inputFields` defines the fields a user could provide
    // Zapier will pass them in as `bundle.inputData` later. They're optional.
    // End-users will map data into these fields. In general, they should have any fields that the API can accept. Be sure to accurately mark which fields are required!
    inputFields: [
      { key: 'file', label: 'File', required: true },
      { key: 'upload_path', label: 'Upload Path', helpText: 'Absolute path with file name and extension.', required: true }
    ],

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obvious placeholder values that we can show to any user.
    sample: {
      id: 1,
      name: 'Test'
    },

    // If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels
    // For a more complete example of using dynamic fields see
    // https://github.com/zapier/zapier-platform/tree/master/packages/cli#customdynamic-fields
    // Alternatively, a static field definition can be provided, to specify labels for the fields
    outputFields: [
      // these are placeholders to match the example `perform` above
      // {key: 'id', label: 'Person ID'},
      // {key: 'name', label: 'Person Name'}
    ]
  }
};
