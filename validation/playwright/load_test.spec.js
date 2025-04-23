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

// Results file path
const RESULTS_FILE = 'loading-test-results.json';

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
                // Navigate to the page with the URL parameter
                let passed = false;
                try {
                    const response = await page.goto(`${BASE_URL}${param}`, { waitUntil: 'load', timeout: 5000 });
                    
                    passed = response.ok();
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
