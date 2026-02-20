import { Actor } from 'apify';

await Actor.init();

console.log("Actor started");

const input = await Actor.getInput();
console.log("Input:", input);

await Actor.pushData({ success: true });

await Actor.exit();
