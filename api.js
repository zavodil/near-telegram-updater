const fetch = require('node-fetch');

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
};