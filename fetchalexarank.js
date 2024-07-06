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