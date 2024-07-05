import express from 'express';
import { scrapData } from './scrap';
const cheerio = require('cheerio');
import { scrapAllData } from './scrapAnalytics';
const cors = require("cors");
const app = express();
const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-write-stream');
const apiUrl = 'http://gh-export.us/webstats/siteinfo/';
app.use(cors());

app.listen(3001);

app.get('/', (req, res) => {
    res.send('Welcome to the Scraper API');
});

app.get('/get-scrapped-data', async (req, res) => {
    try {
        const scrappedResult = await scrapData('https://ecomeye.com/best-online-clothes-shopping-sites-in-pakistan/');
        res.send(scrappedResult);
    } catch (err) {
        console.log({ err });
        throw new Error("Something went wrong!");
    }
});

app.get('/get-analytics-page', async (req, res) => {
    const { url } = req.query; // Extract the 'url' query parameter
    
    try {
        // Extract the host name from the URL
        const hostName = url; // Get the full hostname (e.g., zarashahjahan.com)
        const mainHostName = hostName.split('.')[0]; // Extract the main part of the hostname (e.g., zarashahjahan)
        console.log('Host Name:', mainHostName);

        // Simulated function to fetch HTML data from the provided URL
        let analyticsPage = await scrapAllData(url);

        // Load the HTML data using Cheerio
        const $ = cheerio.load(analyticsPage);

        // Remove unnecessary elements
        $('aside').remove();
        $('header').remove();

        // Extract additional text array
        const additionalText1Array = $('p.text-lg.font-semibold.text-gray-700.dark\\:text-gray-200').map((i, el) => $(el).text().trim()).get();
        console.log('Extracted additionalText1Array:', additionalText1Array);

        // Map values from additionalText1Array to variables
        const alexaRank = additionalText1Array[0] || '';
        const dailyPageviewsPerVisitor = additionalText1Array[1] || '';
        const dailyTimeOnSite = additionalText1Array[2] || '';
        const bounceRate = additionalText1Array[3] || '';
        const searchTraffic = additionalText1Array[4] || '';
        const totalSitesLinkingIn = additionalText1Array[5] || '';

        // Extract visitorsData from the table
        const visitorsData = [];
        $('table.w-full.whitespace-no-wrap').first().find('tbody tr').each((index, element) => {
            const country = $(element).find('p.font-semibold').text().trim();
            const traffic = $(element).find('td.px-4.py-3.text-sm').text().trim();
            visitorsData.push(`${country}: ${traffic}`);
        });
        console.log('Extracted visitorsData:', visitorsData);

        // Concatenate visitorsData into a single string
        const visitorsDataString = visitorsData.join('; ');

        // Prepare data for CSV
        const analyticsData = [
            hostName,
            alexaRank,
            dailyPageviewsPerVisitor,
            dailyTimeOnSite,
            bounceRate,
            searchTraffic,
            totalSitesLinkingIn,
            visitorsDataString // Combined visitor data as a single string
        ];

        console.log('Data to be written to CSV:', analyticsData);

        // Define the path to the CSV file
        const csvFilePath = path.join(__dirname, 'analytics_data.csv');

        // Check if the CSV file already exists
        const fileExists = fs.existsSync(csvFilePath);

        // Create a CSV writer stream
        const writer = csvWriter({
            headers: [
                "Host Name", "Alexa Rank", "Daily Pageviews per Visitor", "Daily Time on Site", "Bounce Rate",
                "Search Traffic", "Total Sites Linking In", "Visitors Data"
            ],
            sendHeaders: !fileExists
        });

        // Write the analytics data and visitors data to the CSV file
        writer.pipe(fs.createWriteStream(csvFilePath, { flags: 'a' }));
        writer.write({
            "Host Name": hostName,
            "Alexa Rank": alexaRank,
            "Daily Pageviews per Visitor": dailyPageviewsPerVisitor,
            "Daily Time on Site": dailyTimeOnSite,
            "Bounce Rate": bounceRate,
            "Search Traffic": searchTraffic,
            "Total Sites Linking In": totalSitesLinkingIn,
            "Visitors Data": visitorsDataString
        });

        writer.end();

        // Send the modified HTML as a response
        analyticsPage = $.html();
        res.json(analyticsPage);

    } catch (err) {
        console.error('Error scraping data:', err);
        res.status(500).send('Something went wrong!');
    }
});
