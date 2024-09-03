const axios = require('axios');
const { handleError, serialize } = require('../api-util/sdk'); // Assuming you have these helpers
require('dotenv').config();

module.exports = (req, res) => {
  const { manufacturer, model, productFamily } = req.body;
  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  if (!productFamily || !model) {
    return res.status(400).json({ error: 'Please provide both product family and model.' });
  }

  const sdk = {
    generateDescription: (productFamily, model) => {
      const openAiUrl = 'https://api.openai.com/v1/chat/completions';

      const requestData = {
        model: 'gpt-4o',
        messages: [
          {
            role: "system",
            content: "You are a professional copywriter for a hire marketplace."
          },
          {
            role: "user",
            content: `Write a description for a hire marketplace listing for a ${productFamily}, the ${manufacturer} - ${model}. Don't include specs, pricing etc, as that is displayed elsewhere. Do not create a title, just a single paragraph description.`
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      };

      return axios.post(openAiUrl, requestData, { headers });
    }
  };

  sdk.generateDescription(productFamily, model)
    .then(response => {
      const description = response.data.choices[0].message.content.trim();

      res
        .status(200)
        .set('Content-Type', 'application/json')
        .send({ data: { description } })
        .end();
    })
    .catch(e => {
      handleError(res, e);
    });
};
