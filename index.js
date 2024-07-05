import express from "express";
import { scrapData } from "./scrap";
const cheerio = require("cheerio");
import { scrapAllData } from "./scrapAnalytics";
const cors = require("cors");
const app = express();
const fs = require("fs");
const path = require("path");
const csvWriter = require("csv-write-stream");
const apiUrl = "http://gh-export.us/webstats/siteinfo/";
app.use(cors());
app.listen(3001);
app.get("/", (req, res) => {
  res.send("Welcome to the Scraper API");
});
app.get("/get-scrapped-data", async (req, res) => {
  try {
    const scrappedResult = await scrapData(
      "https://ecomeye.com/best-online-clothes-shopping-sites-in-pakistan/"
    );
    res.send(scrappedResult);
  } catch (err) {
    console.log({ err });
    throw new Error("Something went wrong!");
  }
});

app.get("/get-analytics-page", async (req, res) => {
  const { url } = req.query; // Extract the 'url' query parameter

  try {
    // Extract the host name from the URL
    const hostName = url; // Get the full hostname (e.g., zarashahjahan.com)
    const mainHostName = hostName.split(".")[0]; // Extract the main part of the hostname (e.g., zarashahjahan)
    console.log("Host Name:", mainHostName);

    // Simulated function to fetch HTML data from the provided URL
    let analyticsPage = await scrapAllData(url);

    // Load the HTML data using Cheerio
    const $ = cheerio.load(analyticsPage);

    // Remove unnecessary elements
    $("aside").remove();
    $("header").remove();

    // Remove the <p> tag with the specified class and its nested <a> tag
    $("p.my-6.text-xs.font-semibold.text-gray-600.dark\\:text-gray-400").each(
      (i, el) => {
        $(el).find("a").remove();
        $(el).remove();
      }
    );
    //Alexa Rank
    // Extract additional text array
    const additionalText1Array = $(
      "p.text-lg.font-semibold.text-gray-700.dark\\:text-gray-200"
    )
      .map((i, el) => $(el).text().trim())
      .get();
    // console.log('Extracted additionalText1Array:', additionalText1Array);

    // Map values from additionalText1Array to variables
    const alexaRank = additionalText1Array[0] || "";
    const dailyPageviewsPerVisitor = additionalText1Array[1] || "";
    const dailyTimeOnSite = additionalText1Array[2] || "";
    const bounceRate = additionalText1Array[3] || "";
    const searchTraffic = additionalText1Array[4] || "";
    const totalSitesLinkingIn = additionalText1Array[5] || "";
    //Stores AlexaRank Data in object
    const additionalDataObject = {
      alexaRank,
      dailyPageviewsPerVisitor,
      dailyTimeOnSite,
      bounceRate,
      searchTraffic,
      totalSitesLinkingIn,
    };

    console.log("Stored additional data object:", additionalDataObject);

    //visitors Data
    const visitorsData = [];
    $("table.w-full.whitespace-no-wrap")
      .first()
      .find("tbody tr")
      .each((index, element) => {
        const country = $(element).find("p.font-semibold").text().trim();
        const traffic = $(element).find("td.px-4.py-3.text-sm").text().trim();
        visitorsData.push(`${country}: ${traffic}`);
      });
    console.log("Extracted visitorsData:", visitorsData);
    //Alexa Ranking
    const AlexaRanking = [];
    $("table.w-full.whitespace-no-wrap")
      .eq(1)
      .find("tbody tr")
      .each((index, element) => {
        const country = $(element)
          .find("td.px-4.py-3 .font-semibold")
          .text()
          .trim();
        const alexaRank = $(element).find("td.px-4.py-3.text-sm").text().trim();
        AlexaRanking.push({ country, alexaRank });
      });
    console.log("Extracted table data:", AlexaRanking);

    // Function to fetch data from the HTML table and store it in an object(top keywords)
    const fetchTableData = () => {
      const tableData = [];

      // Get all rows of the table body
      $("table.w-full.whitespace-no-wrap")
        .eq(2)
        .find("tbody tr")
        .each((index, element) => {
          const keyword = $(element)
            .find("td.px-4.py-3 .font-semibold")
            .text()
            .trim();
          const searchTraffic = $(element)
            .find("td.px-4.py-3.text-sm")
            .text()
            .trim();

          tableData.push({ keyword, searchTraffic });
        });

      return tableData;
    };

    const topKeywordsData = fetchTableData();
    console.log("Extracted topKeywordsData:", topKeywordsData);
    // Function to fetch data from the "Similar Sites" table and store it in an object
    const fetchSimilarSitesData = () => {
      const tableData = [];

      $("table.w-full.whitespace-no-wrap")
        .eq(-7)
        .find("tbody tr")
        .each((index, element) => {
          const site = $(element)
            .find("td.px-4.py-3 .font-semibold a")
            .attr("href");
          const alexaRank = $(element)
            .find("td.px-4.py-3.text-sm")
            .text()
            .trim();

          tableData.push({ site, alexaRank });
        });

      return tableData;
    };

    const similarSitesData = fetchSimilarSitesData();
    console.log("Extracted similarSitesData:", similarSitesData);
    // Function to fetch data from the provided HTML table (Referal Sites )
    const ReferalSites = (html) => {
      const $ = cheerio.load(html);
      const tableData = [];

      // Select all rows in the table body
      $("table.w-full.whitespace-no-wrap")
        .last()
        .find("tbody tr")
        .each((index, element) => {
          const website = $(element)
            .find("td.px-4.py-3 .font-semibold a")
            .attr("href");
          const ReferalSite = parseInt(
            $(element).find("td.px-4.py-3.text-sm").eq(0).text().trim(),
            10
          );

          tableData.push({ website, ReferalSite });
        });

      return tableData;
    };
    // Call the Referal Sites function to fetch data from the provided table HTML
    const ReferalSitesData = ReferalSites(analyticsPage);
    console.log("Extracted ReferalSitesData:", ReferalSitesData);

    // Update paths to local assets
    $(
      'link[href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap"]'
    ).attr("href", "/assets/css/tailwind.output.css");
    $(
      'script[src="https://cdn.jsdelivr.net/npm/alpinejs@2.8.2/dist/alpine.min.js"]'
    ).attr("src", "/assets/js/alpine.min.js");
    $(
      'script[src="https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js"]'
    ).attr("src", "/assets/js/Chart.min.js");
    $(
      'link[href="https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.css"]'
    ).attr("href", "/assets/css/Chart.min.css");
    $('script[src="init-alpine.js"]').attr("src", "/assets/js/init-alpine.js");

    // Ensure chart containers are visible
    $(".chartjs-size-monitor").each((i, el) => {
      $(el).find("div").css("display", "block");
    });
    const webUrl = "http://192.168.137.1:3001/get-scrapped-data";
    // Replace image addresses for specific elements
    const imagePaths = [
      "assets/img/alexa_rank.png",
      "assets/img/daily_time.png",
      "assets/img/bounce_rate.png",
      "assets/img/search_traffic.png",
      "assets/img/linking_sites.png",
      "assets/img/page_views.png",
    ];
    const newImagePaths = [
      "http://gh-export.us/webstats/siteinfo/assets/img/alexa_rank.png",
      "http://gh-export.us/webstats/siteinfo/assets/img/daily_time.png",
      "http://gh-export.us/webstats/siteinfo/assets/img/bounce_rate.png",
      "http://gh-export.us/webstats/siteinfo/assets/img/search_traffic.png",
      "http://gh-export.us/webstats/siteinfo/assets/img/linking_sites.png",
      "http://gh-export.us/webstats/siteinfo/assets/img/page_views.png",
    ];

    imagePaths.forEach((oldSrc, index) => {
      $(`img[src="${oldSrc}"]`).attr("src", newImagePaths[index]);
    });
    // Send the modified HTML as a response
    analyticsPage = $.html();
    res.json(analyticsPage);
  } catch (err) {
    console.error("Error scraping data:", err);
    res.status(500).send("Something went wrong!");
  }
});
