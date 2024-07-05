import { launch } from 'puppeteer';

export async function scrapData(url) {
    const browser = await launch();
    const page = await browser.newPage();
    await page.goto(url);

    const result = await page.evaluate(() => {
        const olElement = document.querySelectorAll('ol')[0];
        if (!olElement) return null;

        const listItems = olElement.querySelectorAll('li');
        const extractedData = [];
        
        listItems.forEach(li => {
            const h3Text = li.querySelector('h3') ? li.querySelector('h3').textContent.trim() : '';
            const imgSrc = li.querySelector('figure img') ? li.querySelector('figure img').src : '';
            const liTexts = Array.from(li.querySelectorAll('ul li')).map(li => li.textContent.trim());

            // extractedData.push({ h3Text, imgSrc, liTexts });
            if(h3Text!=''){
                extractedData.push({ h3Text,liTexts,imgSrc });}
        });

        return extractedData;
    });

    return result;
}


