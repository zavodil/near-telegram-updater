process.env.NTBA_FIX_319 = 1;
const sputnik = require('./sputnik');


const app = async () => {
	const telegram_bot_options = {
		type: 'telegram',
		token: '12345678901:AAKfrtfrBv-Fert-DFelfjew8cjwi3FwkeU', // replace the value below with the Telegram token you receive from @BotFather
		chat_id: -1234567890123, // replace with your chat_id
	};

	const twitter_bot_options = {
		type: 'twitter',
		before_tweet: "",
		after_tweet: "",
		subdomain: "api", // "api" is the default (change for other subdomains)
		version: "1.1", // version "1.1" is the default (change for other subdomains)
		consumer_key: "abc", // from Twitter.
		consumer_secret: "def", // from Twitter.
		access_token_key: "uvw", // from your User (oauth_token)
		access_token_secret: "xyz" // from your User (oauth_token_secret)
	};

	await sputnik.LoadDao("your_dao.sputnikdao.near", telegram_bot_options, 0);
	await sputnik.LoadDao("your_dao.sputnikdao.near", twitter_bot_options, 0);
	await nearbet.LoadBets(telegram_bot_options);
};

app();