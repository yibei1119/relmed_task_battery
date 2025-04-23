const fs = require("fs");
const path = require("path");

// Load test results (ensure correct path)
const resultsFile = path.join(__dirname, "../loading-test-results.json");
const readmeFile = path.join(__dirname, "../README.md");

if (!fs.existsSync(resultsFile)) {
    console.error("Error: loading-test-results.json not found!");
    process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsFile, "utf8"));

// Format results into a Markdown table
let resultTable = "| Session | Task | Chromium | Firefox | WebKit |\n|---------|------|----------|---------|--------|\n";
results.forEach(({ session, task, chromium, webkit, firefox }) => {
    const chromiumStatus = chromium ? "✅ Success" : "❌ Failed";
    const firefoxStatus = firefox ? "✅ Success" : "❌ Failed";
    const webkitStatus = webkit ? "✅ Success" : "❌ Failed";
    resultTable += `| ${session} | ${task} | ${chromiumStatus} | ${firefoxStatus} | ${webkitStatus} |\n`;
});

// Read current README
let readme = fs.readFileSync(readmeFile, "utf8");

// Replace the existing test results section (or add it)
const marker = "<!-- LOADING-TEST-RESULTS -->";
const newSection = `${marker}\n\n### 🧪 Can all tasks load?\n\n${resultTable}\n${marker}`;

if (readme.includes(marker)) {
    readme = readme.replace(new RegExp(`${marker}[\\s\\S]*${marker}`), newSection);
} else {
    readme += `\n\n${newSection}`;
}

// Write updated README
fs.writeFileSync(readmeFile, readme);
console.log("✅ README updated successfully!");
