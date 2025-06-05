const { test, expect } = require('@playwright/test');
const fs = require('fs');
const url = require('url');

const BASE_URL = "http://127.0.0.1:3000/experiment.html?RELMED_PID=simulate";

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

// Results file path
const RESULTS_FILE = 'simulation-test-results.json';

// Initialize or load results
function getResults() {
    try {
        if (fs.existsSync(RESULTS_FILE)) {
            return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
        }
    } catch (e) {
        console.error('Error reading results file:', e);
    }

    // Initialize new results array if file doesn't exist or is invalid
    return PARAMS.map(param => {
        const params = new URLSearchParams(param);
        const session = params.get("session") || "N/A";
        const task = params.get("task") || "N/A";
        return {
            session,
            task,
            chromium: null,
            firefox: null,
            webkit: null
        };
    });
}

// Update a single result and save
function updateResult(session, task, browser, passed) {
    const results = getResults();
    const resultIndex = results.findIndex(
        item => item.session === session && item.task === task
    );

    if (resultIndex !== -1) {
        results[resultIndex][browser] = passed;
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    }
}

// Create initial results file if it doesn't exist
if (!fs.existsSync(RESULTS_FILE)) {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(getResults(), null, 2));
}

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

                test.setTimeout(1200000);

                // Navigate to the page with the URL parameter
                let passed = false;
                try {
                    const response = await page.goto(`${BASE_URL}${param}`, { waitUntil: 'load', timeout: 5000 });

                    passed = response.ok();
                    if (passed) {
                        const messagePromise = new Promise(resolve => {
                            page.on('console', async msg => {

                                let messageText = '';

                                try {
                                    // Try to get text directly first (works in Chromium)
                                    messageText = msg.text();
                                    console.log(`Console message from ${session}/${task} on ${browserType}:`, messageText);

                                    // Check if we got a JSHandle string (Firefox case)
                                    if (messageText.includes('JSHandle@') || messageText === '[object Object]') {
                                        throw new Error('JSHandle detected, use fallback');
                                    }
                                } catch (e) {
                                    // Firefox/WebKit fallback - handle JSHandle objects
                                    try {
                                        const args = msg.args();
                                        if (args.length > 0) {
                                            // Get the first argument (the log message)
                                            const firstArg = await args[0].jsonValue();

                                            // If there are multiple arguments, try to get the data object
                                            if (args.length > 1) {
                                                const dataArg = await args[1].jsonValue();
                                                messageText = `${firstArg} ${JSON.stringify(dataArg)}`;
                                            } else {
                                                messageText = typeof firstArg === 'object' ? JSON.stringify(firstArg) : String(firstArg);
                                            }
                                        }
                                    } catch (e2) {
                                        console.warn(`Could not extract console message: ${e2}`);
                                        messageText = '';
                                    }
                                }

                                // Check if the message contains "endTask"
                                if (messageText && messageText.includes("endTask")) {
                                    console.log(`End task message received for ${session}/${task} on ${browserType}`);
                                    resolve(true);
                                }
                            });
                        });

                        const errorPromise = new Promise(resolve => {
                            page.on('pageerror', error => {
                                console.error(`JavaScript error detected in ${session}/${task} on ${browserType}:`, error.message);
                                resolve(false);
                            });
                        });

                        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(false), 4000 * 60));

                        passed = await Promise.race([messagePromise, errorPromise, timeoutPromise]);
                    }
                } catch (e) {
                    passed = false;
                    console.error(`Error loading ${session}/${task} in ${browserType}:`, e);
                }

                // Update the result file
                updateResult(session, task, browserType, passed);

                expect(passed).toBeTruthy();
            });
        }
    });
}
