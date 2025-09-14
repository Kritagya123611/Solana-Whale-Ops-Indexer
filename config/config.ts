export const thresholds = {
  whaleUSD: 1_000_000,        
  highFrequencyTx: 5,
  alertCooldown: 60,
};

export const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'whale_ops',
  password: 'password',
  port: 5432,
};

export const discordConfig = {
  webhookURL: process.env.DISCORD_WEBHOOK || '', 
};

export const twitterConfig = {
  apiKey: process.env.TWITTER_API_KEY || '',
  apiSecret: process.env.TWITTER_API_SECRET || '',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
  accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
};
