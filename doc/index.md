# RPC-Crypto messaging protocol

## General messages

### Notification
General information or notification messages from the server

## Session management messages
When connecting to a RPC-Crypto server, we will make use of the concept of a _session_. Every session between server
and client will be assigned a unique ID.

See the [full session message specification](../gRPC/session.proto).

### Session creation

A client initiates or re-established a RPC-Crypto session by sending a `SessionCreate` message to the RPC server. 
If necessary, the server will authenticate the client and create a new session for the client. It will respond with a 
`SessionCreateResponse` message, or a `SessionError` message if the session could not be created.

RPC-Crypto uses TLS/SSL encryption for all messages. Read the [setup guide](./setup_guide.md) for instruction on how to 
configure your client. 

### Session status
A `SessionStatusRequest` message will elicit a `SessionStatusResponse` message that provides the following information 
to the client:
* session id
* message id of last message sent by server
* message id of last message received from client

### Closing a session
Either party can gracefully end a session by sending a `SessionCloseRequest` message. No response is required.

### Heartbeat message
A very simple "keep-alive" message with a simple "I'm here" response. Can be send from either party.

## Error messages
These messages relay error information from the data source.

### SessionError
A communication error for the session has ocurred. You could receive a `SessionError` message if:
* Invalid authentication details were provided when creating a session.
* A session reconnection attempt failed, due to a timeout, or other reasons. 


## Exchange messages
Messages from crypto-currency exchanges, such as market info, trade instructions, order books etc.
The message format are unified using the [ccxt](https://github.com/ccxt/ccxt/wiki/Manual) scheme.

### Public messages
These messages do not require authentication.

### Private messages
These messages require authentication for the exchange in question (this is unrelated to the authentication between
the RPC server and client).

## Financial messages
Finance-related messages, such as exchange-rate data.

## Inter-process messages
These messages relay information that is typically RPC-Crypto specific. 



