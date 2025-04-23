const { test, expect } = require('@playwright/test');
const fs = require('fs');
const url = require('url');

const BASE_URL = "https://huyslab.github.io/relmed_trial1/experiment.html?RELMED_PID=test";

const task_sessions = ["wk0", "wk2", "wk4", "wk24", "wk28"];
const quest_sessions = ["wk6", "wk8", "wk52"];
const task_tasks = ["pilt-to-test", "reversal", 'control', "wm"];

const PARAMS = [
    "&session=screening&task=screening",
].concat(
    task_sessions.flatMap(s => task_tasks.map(t => `&session=${s}&task=${t}`))
).concat(
    task_sessions.map(s => `&session=${s}&task=quests`)
).concat(
    quest_sessions.map(s => `&session=${s}&task=quests`)
);

// Define browsers to test with
const browsers = ['chromium', 'firefox', 'webkit'];

// Initialize combined results array
let combinedResults = [];

// Initialize results array
for (const param of PARAMS) {
    const params = new URLSearchParams(param);
    const session = params.get("session") || "N/A";
    const task = params.get("task") || "N/A";
    combinedResults.push({
        session,
        task,
        chromium: null,
        firefox: null,
        webkit: null
    });
}

// Save the results function
function saveResults() {
    fs.writeFileSync('loading-test-results.json', JSON.stringify(combinedResults, null, 2));
}

// Initialize empty file
saveResults();

for (const browserType of browsers) {
    // Create a test fixture for this browser type at the top level
    const browserTest = test.extend({ browserName: browserType });
    
    browserTest.describe(`Website Load Test in ${browserType}`, () => {
        for (let i = 0; i < PARAMS.length; i++) {
            const param = PARAMS[i];
            const params = new URLSearchParams(param);
            const session = params.get("session") || "N/A";
            const task = params.get("task") || "N/A";
            
            browserTest(`Loading ${session}/${task} in ${browserType}`, async ({ page }) => {
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

                // Update the combined results
                const resultIndex = combinedResults.findIndex(
                    item => item.session === session && item.task === task
                );
                
                if (resultIndex !== -1) {
                    combinedResults[resultIndex][browserType] = passed;
                    saveResults();
                }

                expect(passed).toBeTruthy();
            });
        }
    });
}
