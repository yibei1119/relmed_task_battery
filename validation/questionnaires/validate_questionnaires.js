// Create a requirement document for the questionnaires
const fs = require('fs');

// Create placeholders for jsPsych plugins instead of loading them
global.jsPsychInstructions = "placeholder";
global.jsPsychSurveyTemplate = "placeholder";
global.jsPsychSurveyMultiChoice = "placeholder";

// Placeholder for window
global.window = {
    session: "wk0",
    task: "quests"
};

// Placeholder for document
global.document = {
    getElementById: () => {}
}

// Load questionnaire object-generating functions
const questionnaires = require('../../questionnaires.js')

// Function to extract questionnaire data
function extractQuestionnaireData(questionnaireFunc, name) {
    const questionnaire = questionnaireFunc(1, 1);
        
    // Extract items
    let items;
    if ("items" in questionnaire) {
        items = questionnaire.items.map((item, index) => (
            {
                variable_name: `${name}_Q${index}`,
                type: "Likert",
                text: item,
                possible_values: Object.entries(questionnaire.scale)
                .map(([key, value]) => value === '' ? key : `${key}: ${value}`)
                .join("<br>")
            }
        ))
    } else {
        items = questionnaire.questions.map((item, index) => (
            {
                variable_name: `${name}_Q${index}`,
                type: "Multiple choice",
                text: item.prompt,
                possible_values: item.options.join("<br>")
            }
        ))
    }

    // Collect extra items
    if ("before_finish" in questionnaire){
        let extra_item = questionnaire.before_finish({responses: {}});

        extra_item.variable_name = name + "_" + extra_item.variable_name;

        items.push(
            extra_item
        );
    }
    
    return {
        items: items,
        name: name
    }
}

// Extract questionnaires
let extracted_quests = [];
for (let [key, func] of Object.entries(questionnaires)) {
    extracted_quests.push(extractQuestionnaireData(func, key));
}

// Function to generate HTML table per questionnaire
function generateTableHTML(extracted_questionnaire) {

    // Unpack attributes
    const items = extracted_questionnaire.items;
    const name = extracted_questionnaire.name;
    
    // Check if there are any cells that can be merged
    const same_values = items.every(obj => obj.possible_values === items[0].possible_values);
    const same_type = items.every(obj => obj.type === items[0].type);

    let preamble = `<h3>${name}</h3>`

    let table = "<table border='1'><tr><th>Question ID</th><th>Type</th><th>Question text</th><th>Possible values</th></tr>";

    // Add first row separately with row span if cells need to merge
    if (same_values || same_type){
        first_row = items.shift()
        table += `<tr>
            <td>${first_row.variable_name}</td>${same_type ? `<td rowspan = "${items.length + 1}">${first_row.type}</td>` : "<td>" + first_row.type + "</td>"}<td>${first_row.text}</td>${same_values ? `<td rowspan = "${items.length + 1}">${first_row.possible_values}</td>` : "<td>" + first_row.possible_values + "</td>"}
        </tr>`
    }

    // Add rest of rows
    items.forEach(row => {
        table += `<tr>
            <td>${row.variable_name}</td>${same_type ? "" : "<td>" + row.type + "</td>"}<td>${row.text}</td>${same_values ? "" : "<td>" + row.possible_values + "</td>"}
        </tr>`;
    });
    table += "</table>";
    return preamble + table;
}

// Generate HTML
let htmlContent = "<h2>Questionnaire requirements</h2>";

htmlContent += extracted_quests.map(generateTableHTML).join('<br>\n');

fs.writeFileSync("questionnaire_table.html", htmlContent);

console.log("✅ Generated requirements table for questionnaires!");