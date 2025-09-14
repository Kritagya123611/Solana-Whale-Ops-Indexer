import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import pool from "../db";
import { isWhaleTransfer } from "../filters/transactionFilter";
import "dotenv/config";

const PROTO_PATH = path.resolve(__dirname, "../../protos/geyser.proto");
const YELLOWSTONE_GRPC = "yellowstone.solana.com:443"; // example endpoint

// Load proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const geyserProto: any = grpc.loadPackageDefinition(packageDefinition).geyser;

// Create gRPC client
const client = new geyserProto.Geyser(
  YELLOWSTONE_GRPC,
  grpc.credentials.createSsl()
);

// Map incoming transaction to DB schema
const mapTransaction = (txInfo: any) => ({
  tx_signature: txInfo.signature.toString("base58") || "", // signature is bytes
  timestamp: Date.now().toString(), // geyser doesn't send timestamp directly, so approximate
  wallet_from: txInfo.transaction?.message?.accountKeys?.[0]?.toString("base58") || "",
  wallet_to: txInfo.transaction?.message?.accountKeys?.[1]?.toString("base58") || "",
  token: "SOL", // for now assume SOL, later parse SPL transfers
  amount: 0, // would need parsing from `meta.pre_balances` and `meta.post_balances`
  memo: "", // can extract from instructions if memo program
});

// Subscribe to transactions
export const subscribeToTransactions = () => {
  const call = client.Subscribe();

  // Send initial request: only care about transactions
  call.write({
    transactions: {
      default: {}, // subscribe to all txs (you can filter later)
    },
    commitment: "FINALIZED", // or CONFIRMED
  });

  call.on("data", async (update: any) => {
    if (update.transaction) {
      try {
        const mappedTx = mapTransaction(update.transaction);

        if (isWhaleTransfer(mappedTx)) {
          await pool.query(
            `INSERT INTO transactions (tx_signature, timestamp, wallet_from, wallet_to, token, amount, type, memo)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
              mappedTx.tx_signature,
              mappedTx.timestamp,
              mappedTx.wallet_from,
              mappedTx.wallet_to,
              mappedTx.token,
              mappedTx.amount,
              "whale",
              mappedTx.memo,
            ]
          );
          console.log("Whale transaction stored:", mappedTx.tx_signature);
        }
      } catch (err) {
        console.error("Error processing transaction:", err);
      }
    }
  });

  call.on("error", (err: any) => {
    console.error("Stream error:", err);
    setTimeout(subscribeToTransactions, 5000);
  });

  call.on("end", () => {
    console.log("Stream ended. Reconnecting...");
    setTimeout(subscribeToTransactions, 5000);
  });
};

// Start the subscription
subscribeToTransactions();
