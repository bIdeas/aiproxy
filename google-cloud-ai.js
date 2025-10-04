// google-cloud-ai.js

const {Aiplatform} = require('@google-cloud/aiplatform');

const aiPlatform = new Aiplatform();

async function getAIResponse(input) {
    const response = await aiPlatform.predict({
        endpoint: 'https://<ENDPOINT>.aiplatform.googleapis.com/v1beta1/projects/<PROJECT_ID>/locations/<LOCATION>/endpoints/<ENDPOINT_ID>',
        instances: [{ text: input }],
    });
    return response.predictions[0].text;
}

module.exports = getAIResponse;