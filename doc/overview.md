# High-level overview

This module has one job:

> Take in crypto-currency and perhaps other finaincial data from web-based APIs and aggregate them into a single,
unified binary messaging system (gRPC), as well as a REST-based service for applications that can't run gRPC

The main server implementation is written in node.js. This is because most (all?) of the cryptocurrency exchange APIs
present their data in JSON, and as a result, the performance bottleneck is unlikely to be the aggregator. 
There are also lots of great libraries written in node.js (CCXT, GTT) to aggregate this data.

The REST server is automatically generated from the gRPC server, and is implemented in Go, using 
[gRPC-gateway](https://github.com/grpc-ecosystem/grpc-gateway).

# Installation instructions

## gRPC server

To install all the node.js dependencies and build the server stubs, run

```bash
$ npm install
$ npm run build
```

## REST server installation

To generate the reverse proxy REST server, you need to have the following installed on your system first:

### ProtocolBuffers 3.0.0-beta-3 or later.

```sh
mkdir tmp
cd tmp
git clone https://github.com/google/protobuf
cd protobuf
./autogen.sh
./configure
make
make check
sudo make install
```

### Go library dependencies

```sh
go get -u github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway
go get -u github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger
go get -u github.com/golang/protobuf/protoc-gen-go
```

### Generate the proxy server

`$ npm run build`

