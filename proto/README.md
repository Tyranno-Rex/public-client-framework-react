# Protocol Buffers (.proto files)

This directory contains `.proto` files copied from the server.

## Generate gRPC-Web Client Code

```bash
npm run proto:generate
```

This will:
1. Clean the `src/packages/grpc/generated` directory
2. Generate TypeScript/JavaScript files from `.proto` files
3. Create gRPC-Web client stubs

## Generated Files Location

`src/packages/grpc/generated/`

## Requirements

- `protoc` must be installed on your system
  - macOS: `brew install protobuf`
  - Linux: `apt-get install protobuf-compiler`
  - Windows: Download from https://github.com/protocolbuffers/protobuf/releases

## Sync Proto Files from Server

```bash
cp ../public-server-framework-springboot/src/main/proto/*.proto proto/
```
