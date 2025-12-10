# Build stage
FROM rust:1.83-slim as builder

WORKDIR /app


RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*


COPY Cargo.toml Cargo.lock ./
COPY src ./src


RUN cargo build --release


RUN cargo install oura --version 2.0.0


FROM debian:bookworm-slim

WORKDIR /app


RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*


COPY --from=builder /app/target/release/cardano-explorer-backend .


COPY --from=builder /usr/local/cargo/bin/oura /usr/local/bin/oura


RUN oura --version


EXPOSE 8000


CMD ["./cardano-explorer-backend"]