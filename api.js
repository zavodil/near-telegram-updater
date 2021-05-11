const fetch = require('node-fetch');
const Twitter = require('twitter-lite');
const TelegramBot = require('node-telegram-bot-api');

module.exports = {
    LoadData: async (request) => {
        return new Promise((resolve, reject) => {
            fetch("https://rest.nearapi.org/view", {
                method: 'POST',
                body: JSON.stringify(request),
                headers: {'Content-Type': 'application/json'}
            })
                .then((content) => {
                    try {
                        resolve(content.json());
                    } catch (err) {
                        reject(err)
                    }
                });
        });
    },

    sendMessage: async (text, bot_options) => {
        if (bot_options.type === "telegram") {
            const bot = new TelegramBot(bot_options.token);
            return await bot.sendMessage(bot_options.chat_id, text, {parse_mode: "HTML"});
        }
        if (bot_options.type === "twitter") {
            const client = new Twitter(bot_options);
            text = bot_options.before_tweet + text + text.after_tweet;
            return await client.post('statuses/update', {status: text.replace(/<[^>]*>?/gm, '')})
        }
    }
};