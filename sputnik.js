const JSONdb = require('simple-json-db');
const nearApi = require('near-api-js');
const logger = require('./logger');
const api = require('./api');


const FRAC_DIGITS = 5;

module.exports = {
    LoadDao: async (contract, bot_options, records_skipped) => {
        console.log(`Loading ${contract} / ${bot_options.type}...`);
        const db = new JSONdb(`${__dirname}/storage/${bot_options.type}_${contract}.json`);

        let request = {
            "contract": contract,
            "rpc_node": "https://rpc.mainnet.near.org",
            "method": "get_proposals",
            "params": {
                "from_index": 0,
                "limit": 1000
            }
        };

        api.LoadData(request)
            .then(async (data) => {
                const storage = db.storage.data || [];

                let storageUpdated = false;
                for (let index of Object.keys(data)) {
                    if (records_skipped && index <= records_skipped)
                        continue;

                    const alreadySent = Object.keys(storage).length > index && storage[index].hasOwnProperty("message_id") && (Number(storage[index].message_id) > 0);
                    if (!alreadySent) {
                        let proposal = data[index];
                        const text = module.exports.FormatProposal(contract, proposal, index);
                        if (!!text) {
                            proposal.message_id = await api.sendMessage(text, bot_options)
                                .then(response => {
                                    logger.Info(`Message sent for ${contract} / index ${index}`);
                                    if (bot_options.type === "telegram")
                                        return response.message_id;
                                    else if (bot_options.type === "twitter")
                                        return response.id;
                                    else
                                        logger.Error(`Unknown bot type ${bot_options.type}`);
                                })
                                .catch(err => {
                                    logger.Error(`Message failed index ${index}. Contract ${contract} [chat: ${bot_options.chat_id}]. Error: ${err.message}`);
                                    return 0;
                                });

                            storage[index] = proposal;

                            if (!storageUpdated)
                                storageUpdated = true;
                        } else {
                            logger.Error(`Message generation error for ${contract} / index ${index}`);
                        }
                    }
                }

                if (storageUpdated) {
                    db.JSON({data: storage});
                    db.sync();
                }
            })
            .catch(err => {
                logger.Error(`RPC / REST API error for ${contract}: ${err.message}`);
            })
    },

    FormatProposal: (contract, proposal, index) => {
        try {
            let msg = `Type: <strong>${proposal.kind.type}</strong>`;
            if (proposal.kind.amount) {
                const amount = nearApi.utils.format.formatNearAmount(proposal.kind.amount, FRAC_DIGITS).replace(",", "");
                msg += `. Amount ${amount}`;
            }

            let url = `https://sputnik.fund/#/${contract}/${index}`;
            msg += '\n' + url + '\n';

            if (proposal.status === "Success")
                msg += "??? Proposal Succeed\n";
            else if (proposal.status === "Fail")
                msg += "??? Proposal Failed\n";

            msg += `${proposal.description}\n` +
                `Proposer: <code>${proposal.proposer}</code>\n` +
                `Target: <code>${proposal.target}</code>`;
            return msg;
        } catch (err) {
            logger.Error("FormatProposal Error: " + err);
        }
    }
};