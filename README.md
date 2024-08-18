# Alby Jim

Become "Uncle Jim" and create instant wallets that you can give to your community, friends or family. They get wallets powered by your Alby Hub's liquidity, without having to know the first thing about lightning or bitcoin.

Try the [demo server](https://alby-jim.fly.dev) or browse the [public index](https://getalby.github.io/jim-index/)

Powered by [Alby Hub](https://getalby.com)

App Connections have a 10 sat / 1% reserve to account for possible routing fees.

## API

You can also create new wallets via the API. Simply do a POST request to `/api/wallets` which will return a JSON response like:

```json
{
  "connectionSecret": "nostr+walletconnect://xxx?relay=yyy&secret=zzz&lud16=123456@alby-jim.fly.dev",
  "lightningAddress": "123456@alby-jim.fly.dev"
}
```

If a password is required, specify it in the `Authorization` header in the basic auth format, where the ID is an empty string. e.g. `"Authorization": "Basic OjEyMw=="` for password `123`.

## Development

Copy .env.example to .env.local and update the ALBYHUB_URL, ALBYHUB_NAME, and AUTH_TOKEN properties.

You can get the ALBYHUB_URL, AUTH_TOKEN and ALBYHUB_NAME by logging into Alby Hub and Going to settings -> Developer. ALBYHUB_NAME is only needed for Alby Cloud-hosted Alby Hubs.

Then, run the development server:

```bash
yarn
yarn db:migrate:dev
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Run on Fly

> NOTE: it's recommended to use a separate Alby Hub instance if you wish to run Alby Jim.

1. Get a fly account and install flyctl
2. Clone or download this repository.
3. Update fly.toml to have a different app name
4. Open a terminal and navigate to the repository folder you cloned/downloaded. Run `fly launch`
5. Set your fly secrets: `fly secrets set ALBYHUB_URL="" ALBYHUB_NAME="" AUTH_TOKEN="" BASE_URL="https://YOURAPPNAME.fly.dev"`

You can get the ALBYHUB_URL, AUTH_TOKEN and ALBYHUB_NAME by logging into Alby Hub and Going to settings -> Developer. ALBYHUB_NAME is only needed for Alby Cloud-hosted Alby Hubs.

### Updating

1. Run `fly deploy`

## TODOs

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
- [ ] scan QR
- [ ] daily record of reserves + charts
- [ ] daily wallet creation rate limit
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
