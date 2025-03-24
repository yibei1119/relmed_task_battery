// Create a requirement document for the questionnaires
const fs = require('fs');

// Load questionnaire object-generating functions
const questionnaires = require('../questionnaires.js')

// Function to extract questionnaire data
function extractQuestionnaireData(questionnaireFunc, name) {
    const questionnaire = questionnaireFunc(1, 1);
    
    // Extract scale if likert
    const scale = "scale" in questionnaire ? Object.entries(questionnaire.scale)
    .map(([key, value]) => value === '' ? key : `${key}: ${value}`)
    .join(", ") : null;
    
    // Extract items
    let items;
    if (questionnaire.type === jsPsychSurveyTemplate) {
        items = questionnaire.items.map((item, index) => (
            {
                variable_name: `${name}_Q${index}`,
                type: "Likert",
                text: item,
                possible_values: `0-${questionnaire.scale.length}`
            }
        ))
    } else {
        if (questionnaire.type !== jsPsychSurveyMultiChoice) {
            throw new Error("Expecting multiple choice plugin");
        }

        items = questionnaire.questions.map((item, index) => (
            {
                variable_name: `${name}_Q${index}`,
                type: "Multiple choice",
                text: item.prompt,
                possible_values: item.options.join(", ")
            }
        ))
    }
    
    return {
        scale: scale,
        items: items,
        name: name
    }
}

// Extract questionnaires
let extracted_quests = {};
for (let [key, func] of Object.entries(questionnaires)) {
    extracted_quests[key] = extractQuestionnaireData(func, key);
}

// Function to generate HTML table per questionnaire
function generateTableHTML(extracted_questionnaire) {

    // Unpack attributes
    const items = extracted_questionnaire.items;
    const scale = extracted_questionnaire.scale;
    const name = extracted_questionnaire.name;
    
    // Check if there are any cells that can be merged
    const same_values = items.every(obj => obj.possible_values === items[0].possible_values);
    const same_type = items.every(obj => obj.type === items[0].type);

    let preamble = `<h2>${name}</h2>`

    if (scale !== null){
        preamble += `<p>Likert scale text: ${scale}</p>`
    }

    let table = "<table border='1'><tr><th>Variable Name</th><th>Type</th><th>Item text</th><th>Possible values</th></tr>";

    // Add first row separately with row span if cells need to merge
    if (same_values || same_type){
        first_row = items.shift()
        table += `<tr>
            <td>${first_row.variable_name}</td>
            ${same_type ? `<td rowspan = "${items.length}">${first_row.type}</td>` : "<td>" + first_row.type + "</td>"}
            <td>${first_row.text}</td>
            ${same_values ? `<td rowspan = "${items.length}">${first_row.possible_values}</td>` : "<td>" + first_row.possible_values + "</td>"}
        </tr>`
    }

    // Add rest of rows
    items.forEach(row => {
        table += `<tr>
            <td>${row.variable_name}</td>
            <td>${row.type}</td>
            <td>${row.text}</td>
            <td>${row.possible_values}</td>
        </tr>`;
    });
    table += "</table>";
    return preamble + table;
}

// Generate HTML
let htmlContent = "<h1>RELMED trial 1 questionnaire requirements</h1>";

htmlContent += extracted_quests.map(generateTableHTML).join('<br>\n');

fs.writeFileSync("questionnaire_table.html", htmlContent);

console.log("✅ Generated requirements table for questionnaires!");
