const { test, expect } = require('@playwright/test');
const fs = require('fs');
const url = require('url');


const BASE_URL = "https://huyslab.github.io/relmed_trial1/experiment.html?RELMED_PID=test";  // Update with your URL

const task_sessions = ["wk0", "wk2", "wk4", "wk24", "wk28"]
const quest_sessions = ["wk6", "wk8", "wk52"]
const task_tasks = ["pilt-to-test", "reversal", 'control', "wm"]

const PARAMS = [
    "&session=screening&task=screening",
].concat(
    task_sessions.flatMap(s => task_tasks.map(t => `&session=${s}&task=${t}`))
).concat(
    task_sessions.map(s => `&session=${s}&task=quests`)
).concat(
    quest_sessions.map(s => `&session=${s}&task=quests`)
);

let results = [];

test.describe("Website Load Test", () => {
    for (const param of PARAMS) {
        test(`Loading ${BASE_URL}${param}`, async ({ page }) => {
            let messageReceived = false;

            // Navigate to the page with the URL parameter
            const response = await page.goto(`${BASE_URL}${param}`, { waitUntil: 'load', timeout: 5000 });

            let passed = response.ok();
            if (passed) {
                const messagePromise = new Promise(resolve => {
                    page.on('console', msg => {
                        if (msg.text().includes("load_successful")) {
                            resolve(true);
                        }
                    });
                });

                const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(false), 3000));

                passed = await Promise.race([messagePromise, timeoutPromise]);
            }

            // Extract parameters from the URL
            const params = new URLSearchParams(param);
            const session = params.get("session") || "N/A";
            const task = params.get("task") || "N/A";

            results.push({ session, task, passed });

            // Save results after each test
            fs.writeFileSync("loading-test-results.json", JSON.stringify(results, null, 2));

            expect(passed).toBeTruthy();
        });
    }
});
