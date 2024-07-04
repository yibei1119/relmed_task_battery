const axios = require('axios');
const https = require('https');

exports.handler = async (event) => {
    const REDCAP_API_URL = 'https://redcap.slms.ucl.ac.uk/api/';
    const API_TOKEN = process.env.REDCAP_API_TOKEN;

    const data = JSON.parse(event.body);

    const payload = {
        token: API_TOKEN,
        content: 'record',
        action: 'import',
        format: 'json',
        type: 'flat',
        overwriteBehavior: 'normal',
        forceAutoNumber: 'true',
        data: data
    };

    try {
        const response = await axios.post(REDCAP_API_URL, payload);
        return {
            statusCode: 200,
            body: JSON.stringify({ status: 'success', message: 'Data submitted successfully' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ status: 'error', message: 'Failed to submit data', error: error.message })
        };
    }
};

