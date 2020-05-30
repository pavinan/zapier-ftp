
const createFtpClient = (z, bundle) => {

    const PromiseFtp = require('promise-ftp');

    const isPortSpecified = !!bundle.authData.ftpPort;

    const client = new PromiseFtp();

    const promise = new Promise((resolve, reject) => {

        client.connect({
            host: bundle.authData.ftpHost,
            user: bundle.authData.ftpUsername,
            password: bundle.authData.ftpPassword,
            port: isPortSpecified ? bundle.authData.ftpPort : 21,
            secure: bundle.authData.ftpSecure == 'true'
        }).then(() => {
            let id = bundle.authData.ftpUsername + '@' + bundle.authData.ftpHost;

            if (isPortSpecified) {
                id += ':' + bundle.authData.ftpPort
            }

            resolve({
                id: id,
                ftpClient: client
            });
        }, (err) => {
            reject(err);
        });
    });

    return promise;
};


module.exports = {
    createFtpClient: createFtpClient
}