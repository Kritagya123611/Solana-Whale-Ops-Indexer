import { thresholds, dbConfig, discordConfig } from '../../config/config';

interface Transaction {
    tx_signature: string;
  timestamp: string;
  wallet_from: string;
  wallet_to: string;
  token: string;
  amount: number;
  type?: string;
  memo?: string;
}

const filterTransaction = (transaction: Transaction) => {
    if(transaction.amount>=thresholds.whaleUSD){
        return true;
    }
    return false;
}