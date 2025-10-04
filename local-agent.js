// local-agent.js

const tf = require('@tensorflow/tfjs');

async function getAIResponse(input) {
    // Load local model
    const model = await tf.loadLayersModel('https://<MODEL_URL>');
    // Make prediction
    const prediction = await model.predict(input);
    return prediction.text;
}

module.exports = getAIResponse;