const JSONdb = require('simple-json-db');
const TelegramBot = require('node-telegram-bot-api');
const nearApi = require('near-api-js');
const logger = require('./logger');
const api = require('./api');
const BN = require('bn.js');

const FRAC_DIGITS = 5;
const index_amount = 0;
const index_account_id = 1
const index_message_id = 2;

module.exports = {
    LoadBets: async (bot_options) => {
        const contract = "c.nearbet.near";
        const bot = new TelegramBot(bot_options.token);
        const db = new JSONdb(`${__dirname}/storage/${contract}.json`);

        let request = {
            "contract": contract,
            "rpc_node": "https://rpc.mainnet.near.org",
            "method": "get_top_bets",
            "params": {
                "from_key": null,
                "limit": 1000
            }
        };

        api.LoadData(request)
            .then(async (data) => {
                const storage = db.storage.data || [];

                const storage_prepared = storage.reduce((acc, item) => {
                    acc[item[index_account_id]] = item;
                    return acc;
                }, []);

                let storageUpdated = false;
                for (let index of Object.keys(data)) {
                    let bet = data[index];

                    const bet_account_id = bet[index_account_id];
                    const alreadySent = (storage_prepared.hasOwnProperty(bet_account_id)
                        && Number(storage_prepared[bet_account_id][index_message_id]) > 0);

                    if (!alreadySent) {
                        const text = module.exports.FormatBet(bet);
                        if (!!text) {
                            bet[index_message_id] = await bot.sendMessage(bot_options.chat_id, text, {parse_mode: "HTML"})
                                .then(response => {
                                    logger.Info(`Message_id ${response.message_id} sent for ${contract} / account ${bet_account_id}`);
                                    return response.message_id;
                                })
                                .catch(err => {
                                    logger.Error(`Message failed account ${bet_account_id}. Contract ${contract} [chat: ${bot_options.chat_id}]. Error: ${err.message}`);
                                    return 0;
                                });

                            storage[index] = bet;

                            if (!storageUpdated)
                                storageUpdated = true;
                        } else {
                            logger.Error(`Message generation error for ${contract} / index ${index}`);
                        }
                    } else {
                        let amount_difference = new BN(bet[index_amount]).sub(new BN(storage_prepared[bet_account_id][index_amount]));
                        if (!amount_difference.isZero()) {
                            amount_difference = amount_difference.toString(10);
                            let text = module.exports.FormatBet(bet);
                            if (!!text) {
                                text += "\n\nUpdated: " + new Date().toLocaleString("ru")
                                    + " (" + (amount_difference > 0 ? "+" : "")
                                    + nearApi.utils.format.formatNearAmount(amount_difference, FRAC_DIGITS).replace(",", "") + "Ⓝ)";

                                bet[index_message_id] = await bot.deleteMessage(bot_options.chat_id, storage_prepared[bet_account_id][index_message_id])
                                    .then(() => {
                                        logger.Info(`Message_id ${storage_prepared[bet_account_id][index_message_id]} removed for ${contract} / account ${bet_account_id}`);
                                        return 0;
                                    })
                                    .catch(err => {
                                        logger.Error(`Message remove failed account ${bet_account_id}. Contract ${contract} [chat: ${bot_options.chat_id}]. Error: ${err.message}`);
                                        return 0;
                                    });

                                const new_message_id = await bot.sendMessage(bot_options.chat_id, text, {parse_mode: "HTML"})
                                    .then(response => {
                                        logger.Info(`Message_id ${response.message_id} recreated for ${contract} / account ${bet_account_id}`);
                                        return response.message_id;
                                    })
                                    .catch(err => {
                                        logger.Error(`Message recreate failed for account  ${bet_account_id}. Contract ${contract} [chat: ${bot_options.chat_id}]. Error: ${err.message}`);
                                        return 0;
                                    });

                                if (new_message_id)
                                    bet[index_message_id] = new_message_id;

                                storage[index] = bet;

                                if (!storageUpdated)
                                    storageUpdated = true;
                            }
                        }
                    }
                }

                if (storageUpdated) {
                    db.JSON({data: storage});
                    db.sync();
                }
                process.exit(0)

            })
            .catch(err => {
                logger.Error(`RPC / REST API error for ${contract}: ${err.message}`);
                process.exit(1);
            })
    },

    FormatBet: (bet) => {
        try {
            const amount = nearApi.utils.format.formatNearAmount(bet[index_amount], FRAC_DIGITS).replace(",", "");
            return `Bid: <code>${bet[index_account_id]}</code>\n` +
                `https://near.bet/#/bid/${bet[index_account_id]}\n` +
                `Price: <strong>${amount} Ⓝ</strong>`;
        } catch (err) {
            logger.Error("FormatBet Error: " + err);
        }
    }
};