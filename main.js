import { Actor } from 'apify';
import got from 'got';
import * as cheerio from 'cheerio';

await Actor.init();

const input = await Actor.getInput();
const name = input?.name;

if (!name) {
    throw new Error("Missing 'name' in input.");
}

const searchUrl = `http://inmate-search.cobbsheriff.org/inquiry.asp?soid=&inmate_name=${encodeURIComponent(name)}&serial=&qry=In Custody`;

const searchResponse = await got(searchUrl, {
    headers: {
        'User-Agent': 'Mozilla/5.0'
    }
});

const $ = cheerio.load(searchResponse.body);

let inmates = [];

$('table tr').each((i, row) => {
    const cols = $(row).find('td');

    if (cols.length > 6) {
        const soid = $(cols[6]).text().trim();
        if (soid) {
            inmates.push({
                name: $(cols[1]).text().trim(),
                dob: $(cols[2]).text().trim(),
                race: $(cols[3]).text().trim(),
                sex: $(cols[4]).text().trim(),
                location: $(cols[5]).text().trim(),
                soid
            });
        }
    }
});

for (const inmate of inmates) {

    await new Promise(r => setTimeout(r, 2000)); // polite delay

    const bookingUrl = `http://inmate-search.cobbsheriff.org/InmDetails.asp?soid=${inmate.soid}`;

    const bookingResponse = await got(bookingUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    });

    const $$ = cheerio.load(bookingResponse.body);

    inmate.bookingDetails = {
        arrestDate: $$('td:contains("Arrest Date/Time")').next().text().trim(),
        bookingStarted: $$('td:contains("Booking Started")').next().text().trim(),
        bookingComplete: $$('td:contains("Booking Complete")').next().text().trim(),
        height: $$('td:contains("Height")').next().text().trim(),
        weight: $$('td:contains("Weight")').next().text().trim(),
        hair: $$('td:contains("Hair")').next().text().trim(),
        eyes: $$('td:contains("Eyes")').next().text().trim()
    };
}

await Actor.pushData(inmates);
await Actor.exit();
