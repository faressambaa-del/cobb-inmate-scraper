const { Actor } = require('apify');

Actor.init().then(async () => {
    console.log("Actor working");
    await Actor.pushData({ ok: true });
    await Actor.exit();
});
