# Alby Jim

Become "Uncle Jim" and create instant wallets that you can give to your community, friends or family. They get wallets powered by your Alby Hub's liquidity, without having to know the first thing about lightning or bitcoin.

Try the [demo server](https://alby-jim.fly.dev) or browse the [public index](https://getalby.github.io/jim-index/)

Powered by [Alby Hub](https://getalby.com)

App Connections have a 10 sat / 1% reserve to account for possible routing fees.

## API

### Create a new wallet

`POST /api/wallets`

returns:

```json
{
  "connectionSecret": "nostr+walletconnect://xxx?relay=yyy&secret=zzz&lud16=123456@alby-jim.fly.dev",
  "lightningAddress": "123456@alby-jim.fly.dev",
  "valueTag": "<podcast:value type=...</podcast:value>"
}
```

If a password is required, specify it in the `Authorization` header in the basic auth format, where the ID is an empty string. e.g. `"Authorization": "Basic OjEyMw=="` for password `123`.

### Get reserves

`GET /api/reserves`

returns:

```json
{
  "numApps": 4,
  "totalAppBalance": 114000,
  "numChannels": 1,
  "hasPublicChannels": false,
  "totalOutgoingCapacity": 4821836,
  "totalChannelCapacity": 198000000
}
```

### Get instance info

> See `.env.example` on how to set this info.

returns:

```json
{
  "name": "Uncle Jim Demo Server",
  "description": "This demo server shows how easy it is for new users to get a wallet. For demo purposes only - this server has a small amount of liquidity and will not be increased.",
  "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Bust_of_Satoshi_Nakamoto_in_Budapest.jpg/440px-Bust_of_Satoshi_Nakamoto_in_Budapest.jpg",
  "dailyWalletLimit": 10
}
```

`GET /api/info`

## Development

Copy .env.example to .env.local and update the ALBYHUB_URL and AUTH_TOKEN properties.

You can get the `ALBYHUB_URL` and `AUTH_TOKEN` by logging into Alby Hub and Going to settings -> Developer. If you use Alby Cloud, you'll also need to provide `ALBYHUB_NAME` to route requests to your hub.

Then, run the development server:

```bash
yarn
yarn db:migrate:dev
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Run on Fly

1. Get a fly account and install flyctl
2. Download the [fly.toml file](https://github.com/getAlby/jim/blob/master/hosting/fly.toml) and save it inside an empty folder.
3. Open fly.toml in a text editor and change the app name on line 6 to a unique one (e.g. app = 'my-awesome-app-name').
4. Open a terminal and navigate to the folder your fly.toml is in. Run `fly launch`
5. Set your fly secrets: `fly secrets set ALBYHUB_URL="your-albyhub-url.example.com" AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5c....RvM" BASE_URL="https://YOURAPPNAME.fly.dev"`.

> `BASE_URL` is the URL where you will host your Jim app.

> If you use Alby Cloud, you also need to set `ALBYHUB_NAME="YOUR_ALBYHUB_NAME"` to route requests to your specific hub.

> You can get the ALBYHUB_URL, AUTH_TOKEN and ALBYHUB_NAME by logging into Alby Hub and Going to settings -> Developer.

> Optionally set `NAME`, `DESCRIPTION` and `IMAGE` as additional secrets if you'd like to list your Jim instance on [Jim Index](https://getalby.github.io/jim-index/)

### Updating

1. Run `fly deploy`

## Features

- [x] One click wallet creation
- [x] Show balance
- [x] Topups
- [x] Open in Alby Extension
- [x] Open in default app
- [x] Copy NWC connection
- [x] show amount in custody, how many wallets created, last used
- [x] create NWC connection secrets via REST API
- [x] password protect
- [x] basic lightning addresses
- [x] podcasting value tag
- [x] daily wallet creation rate limit
- [x] scan QR
- [x] get Jim reserves and instance info via REST API
- [ ] daily record of reserves + charts
- [ ] per-connection limits (so one user cannot use all the liquidity provided by the service)
- [ ] extra open actions (Alby Account, Mobile Wallet, Web Wallet, Nostrudel?, ...) & instructions

## Warning

No responsibility is taken for loss of funds. Use at your own risk.

## Why was this created?

TLDR: make it easy to onboard new users without relying on large custodians.

With [Alby Hub](https://getalby.com) it's now super easy to run your own node in the cloud in minutes. But this is still a hurdle for some people. We want to onboard as many users to bitcoin and lightning as possible.

The easiest solution right now is custodial wallets. But they are giant honeypots and can be shut down at any time and more and more often are required to do KYC or stop operating in certain jurisdictions. They also often do not use open protocols, making it hard for developers to integrate with them.

Alby Jim is a custodial service, but it can be run by thousands of custodians - one per family, group or community.

These wallets can be created with **a single click** or **api call** making it incredibly easy for new wallets to be created by apps, without the app owner having to build a wallet into the app itself.

### How does this differ from E-cash mints like Cashu or Fedimint?

Alby Jim gives out NWC connections which interact with the lightning network directly rather than minting and melting e-cash tokens. There are pros and cons of both, this is just another option people can choose.

NWC is an amazing protocol that works in all environments and makes it super easy for developers to make lightning powered apps, and does not care which wallet a user uses. By making it easy for developers to create lightning apps, the hope is that many high quality apps are created, giving flexibility to users (Bring your own App, Bring your own Wallet) rather than being locked into closed ecosystems.

### Isn't this just like other subaccount software (LNbits User plugin, LNDHub)?

Yes. But Users receive NWC-powered wallets they can instantly plugin to many apps.
