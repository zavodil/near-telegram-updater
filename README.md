#### Update social channels with live NEAR blockchain data 

Build uses: 
* [NEAR REST API Server](https://github.com/near-examples/near-rest-api-server)
* [NEAR Blockchain](https://near.org)
* [Sputnik DAO contracts](https://github.com/near-daos/sputnik-dao-contract)
* [NEAR Bet contracts](https://github.com/Kouprin/accounts-marketplace)

#### Installation guide:
* Clone this repo
* Run `npm i`
* Add `app.js` to the cron job

Telegram:
* Update `telegram_bot_options` object in `app.js` with `token` and `chat_id` from Telegram

Twitter:
* Update `twitter_bot_options` object in `app.js` with 4 access keys using [Dev Dashboard](https://developer.twitter.com/en) values

#### FAQ:

**How to configure a telegram channel for updates:**
 
 * Create a new bot using [@BotFather](https://t.me/BotFather), store `token` in the app
 * Create a channel and add this bot as administrator with access to messages 
 * Forward any message wrote on behalf of the channel to [@getidsbot](https://t.me/getidsbot) and find `Origin chat` / `id` field. Negative long integer is your `chat_id`, store it in the app   

**How to add a cron job:**

Add a cron task to check updates every minute. 

`*/1 * * * * root /usr/local/bin/node /path/to/your/application/app.js`