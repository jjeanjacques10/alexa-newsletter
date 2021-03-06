const { GoogleSpreadsheet } = require('google-spreadsheet')
const cheerio = require('cheerio')
const creds = require('./client_secret.json');
const uuid = require('uuid-random');


async function getNews() {
    const doc = new GoogleSpreadsheet('1Q21v72WDgpdSaF3qu5SjUulHSBIKTzds0lOrI3xsPTM')

    await doc.useServiceAccountAuth(creds);

    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();

    // Get last news
    return cleanText(rows[(rows.length - 1)].Message);
}

function cleanText(email) {

    email = email.split('</p>');

    var paragraphs = email.map(paragraph => {
        const $ = cheerio.load(paragraph)
        var news = $('p').text();
        var title = $('strong').text();

        //news = news.replace(title, '');
        news = news.replace(/\.(?!\d)/g, '. ');
        const regex = /(Confere lá:\s+Link Afiliado)|:\s+Link Afiliado/gi;

        return [title, news.replace(regex, '')];
    })

    return buildJson(paragraphs)
}

function buildJson(news) {
    return news.map((newsItem, index) => {
        var date = new Date();

        if (newsItem[1] != '') {
            return {
                "uid": uuid(),
                "updateDate": new Date(date.getTime() - (1000 * index)).toISOString(),
                "titleText": newsItem[0],
                "mainText": newsItem[1],
                "redirectionUrl": 'https://filipedeschamps.com.br/newsletter'
            }
        }
    }).filter((newsItem) => newsItem != null);
}

module.exports = getNews();