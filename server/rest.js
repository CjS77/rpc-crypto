const grpc = require('grpc');
const certs = require('../lib/certs');
const grpcGateway = require('grpc-dg');
const express = require('express');
const bodyParser = require('body-parser');
const {exit} = require('../lib/logging');
const resolve = require('path').resolve;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Configure certificates
const keyPair = certs.loadKeyPair('client');
const CA = certs.loadCA();
if (!keyPair || !CA) {
    exit('Could not load certificates. Exiting.', 1);
    return;
}
const credentials = grpc.credentials.createSsl(CA, keyPair.private_key, keyPair.cert_chain);

// load the proxy on / URL  -- see https://github.com/grpc/grpc/issues/9591 for how we resolved the import issues
app.use('/', grpcGateway(
    ['session.proto'],
    'localhost:50051',
    credentials,
    true,
    resolve(__dirname, '../proto')
));

app.use(function (err, req, res, next) {
    console.error(err.message);
    console.error(req.url);
    res.status(400).json({ error: 'You did something dumb I bet' });
});


const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on http://127.0.0.1:${port}`)
});