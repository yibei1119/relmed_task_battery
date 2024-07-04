// Save data to REDCap
function saveDataREDCap() {
    var jspsych_data = jsPsych.data.get().json();

    var redcap_record = JSON.stringify([{
        record_id: 1, // Mandatory, but ignored by REDcap
        prolific_pid: window.prolificPID,
        study_id: window.studyId,
        session_id: window.sessionId,
        start_time: window.startTime,
        exp_code_version: code_version,
        group: window.condition,
        jspsych_data: jspsych_data
    }])

    fetch('https://h6pgstm0f9.execute-api.eu-north-1.amazonaws.com/prod/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: redcap_record
    })
    .then(data => {
        if (data.status === 200) {
            console.log('Data successfully submitted to REDCap');
        } else {
            console.error('Error submitting data:', data.message);
        }
        return data.json()
    })
    .then(data => {
        console.log(data)
    }
    )
    .catch(error => {
        console.error('Error:', error);
    });
}