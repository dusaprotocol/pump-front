# Duser Pump Interface

## Running

### Fill environment variables

Create `.env` file following `.env.example` schema:

- `GH_ACCESS_TOKEN` is your GitHub access token (necessary for the TradingView chart library). Request an access [here](https://www.tradingview.com/advanced-charts/)
- `VITE_API` is the URL of the [backend](https://github.com/dusaprotocol/pump-backend) API
- `VITE_DUSA_API` is the URL of the Dusa API (necessary for charts once the bonding curve completes)

### Install dependencies

```sh
pnpm install
```
