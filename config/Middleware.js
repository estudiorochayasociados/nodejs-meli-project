const axios = require('axios');
const cron = require('node-cron');

exports.refreshToken = (async () => {
    await axios.get(process.env.URL + "/mercadolibre/refresh-token").then(r => { console.log(r.data) });
});

cron.schedule("* 10 * * * *", async () => {
    await this.refreshToken();
});