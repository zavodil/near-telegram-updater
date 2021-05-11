process.env.NTBA_FIX_319 = 1;
const sputnik = require('./sputnik');

const app = async () => {
	const bot_options = {
		token: '12345678901:AAKfrtfrBv-Fert-DFelfjew8cjwi3FwkeU', // replace the value below with the Telegram token you receive from @BotFather
		chat_id: -1234567890123, // replace with your chat_id
	};

	await sputnik.LoadDao("your_dao.sputnikdao.near", bot_options, 0);
	await nearbet.LoadBets(bot_options);
};

app();