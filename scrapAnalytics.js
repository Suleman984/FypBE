import { launch } from 'puppeteer';

export async function scrapAllData(url) {
  const browser = await launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  const result = await page.evaluate(() => {
    return document.documentElement.innerHTML; // Get the whole HTML content of the page
  });

  await browser.close();
  // console.log(result)
  return result;
}
