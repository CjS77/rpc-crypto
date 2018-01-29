# High-level overview

This module has one job:

> Take in crypto-currency and perhaps other finaincial data from web-based APIs and aggregate them into a single,
unified binary messaging system (gRPC), as well as a REST-based service for applications that can't run gRPC

The main server implementation is written in node.js. This is because most (all?) of the cryptocurrency exchange APIs
present their data in JSON, and as a result, the performance bottleneck is unlikely to be the aggregator. 
There are also lots of great libraries written in node.js (CCXT, GTT) to aggregate this data.

# Installation instructions

## gRPC server

To install all the node.js dependencies and build the server stubs, run

```bash
$ npm install
$ npm run build
```

This will compile the `.proto` files for ther server and its dependencies and put the stubs/interfaces in the `build` directory. 
## REST server

For application that cannot read gRPC messages, there is a REST server implementation based on express.
The REST server dynamically generates endpoints in express from the proto file based on a fork of 
[grpc-dynamic-gateway](https://github.com/konsumer/grpc-dynamic-gateway).

To run the server, make sure that the gRPC server is running, and then run

```bash
$ node server/rest
``` 

