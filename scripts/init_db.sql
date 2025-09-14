CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_signature VARCHAR NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    wallet_from VARCHAR,
    wallet_to VARCHAR,
    token VARCHAR,
    amount NUMERIC,
    type VARCHAR,
    memo TEXT,
    risk_score FLOAT,
    alerted BOOLEAN DEFAULT FALSE
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    alert_type VARCHAR,
    timestamp TIMESTAMP,
    status VARCHAR
);
