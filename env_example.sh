# Network RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR-PROJECT-ID
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
POLYGON_RPC_URL=https://polygon-rpc.com

# Private Keys (NEVER commit real keys to git)
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
MAINNET_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# API Keys for verification and gas reporting
ETHERSCAN_API_KEY=ABC123DEF456
ARBISCAN_API_KEY=ABC123DEF456
POLYGONSCAN_API_KEY=ABC123DEF456
COINMARKETCAP_API_KEY=b54bcf4d-1bca-4e8e-9a24-22ff2c3d462d

# Oracle-specific configurations
ORACLE_UPDATE_INTERVAL=300000  # 5 minutes in milliseconds
PRICE_DEVIATION_THRESHOLD=500  # 5% in basis points
HEARTBEAT_INTERVAL=3600000     # 1 hour in milliseconds

# Data source configurations
CHAINLINK_NODE_URL=https://your-chainlink-node.com
API_AGGREGATOR_URL=https://your-api-aggregator.com
FALLBACK_PRICE_SOURCE=https://api.coingecko.com/api/v3

# Monitoring and alerting
ALERT_EMAIL=alerts@yourproject.com
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your-webhook

# Security settings
MULTI_SIG_WALLET=0x0000000000000000000000000000000000000000
EMERGENCY_PAUSE_THRESHOLD=1000  # 10% in basis points
MAX_GAS_PRICE=100000000000      # 100 gwei

# Testing
REPORT_GAS=true
FORKING_ENABLED=false
FORK_BLOCK_NUMBER=18000000

# Production flags
IS_PRODUCTION=false
ENABLE_MONITORING=true
ENABLE_AUTO_UPDATES=false