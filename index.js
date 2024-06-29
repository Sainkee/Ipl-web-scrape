import puppeteer from "puppeteer";
import fs from "fs/promises"; // Using fs/promises for async file operations
import { fileURLToPath } from 'url';
import { dirname } from 'path';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the IPL stats page
    await page.goto("https://www.iplt20.com/stats/");

    // Set screen size (optional)
    await page.setViewport({ width: 1080, height: 1024 });

    // Wait for the "View All" button to load
    const viewAllButtonSelector = "a[ng-click='showAllBattingStatsList()']";
    await page.waitForSelector(viewAllButtonSelector);

    // Click the "View All" button to load all batting stats
    await page.evaluate((selector) => {
      document.querySelector(selector).click();
    }, viewAllButtonSelector);

    // Wait for the table rows to load after clicking "View All"
    await page.waitForSelector(".st-table.statsTable > tbody > tr");

    // Extract data from the table
    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        ".st-table.statsTable > tbody > tr"
      );
      const stats = [];
      rows.forEach((row) => {
        const cols = row.querySelectorAll("td");
        const playerStat = {
          position: cols[0]?.innerText.trim(),
          player: cols[1]?.innerText.trim(),
          runs: cols[2]?.innerText.trim(),
          fours: cols[3]?.innerText.trim(),
          sixes: cols[4]?.innerText.trim(),
          centuries: cols[5]?.innerText.trim(),
          fifties: cols[6]?.innerText.trim(),
        };
        stats.push(playerStat);
      });
      return stats;
    });
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // Write data to a JSON file
    const filePath = `${__dirname}/data.json`;
    console.log(filePath);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`Data successfully written to ${filePath}`);
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await browser.close(); // Close the browser
  }
})();
