#!/bin/bash

CUR_DIR=$(pwd)
BUILD_DIR=$CUR_DIR/build
LOCAL_BIN=$CUR_DIR/node_modules/.bin

# Create directories if they don't exist
if [ ! -d "$BUILD_DIR/node" ]; then mkdir -p $BUILD_DIR/node; fi
if [ ! -d "$BUILD_DIR/node/google/api" ]; then mkdir -p $BUILD_DIR/node/google/api; fi
if [ ! -d "$BUILD_DIR/web" ]; then mkdir -p $BUILD_DIR/web; fi

cd proto
# Generate the protos.
$LOCAL_BIN/grpc_tools_node_protoc -I/usr/local/include -I. \
       -I$GOPATH/src \
       -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
       --js_out=import_style=commonjs,binary:$BUILD_DIR/node \
       --grpc_out=$BUILD_DIR/node \
       --plugin=protoc-gen-grpc=$LOCAL_BIN/grpc_tools_node_protoc_plugin \
       session.proto
echo "Node interface files created"

# Generate the swagger file which describes the REST API in detail.
$LOCAL_BIN/grpc_tools_node_protoc -I/usr/local/include -I. \
       -I$GOPATH/src \
       -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
       --swagger_out=logtostderr=true:$BUILD_DIR/web \
       session.proto
echo "Swagger definition created"

cd $CUR_DIR
## Compile 3rd party proto files
cd $GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis
$LOCAL_BIN/grpc_tools_node_protoc -I/usr/local/include -I. \
       -I$GOPATH/src \
       -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
       --js_out=import_style=commonjs,binary:$BUILD_DIR/node \
       ./google/api/annotations.proto \
       ./google/api/http.proto
echo "Google API files compiled"
cd $CUR_DIR