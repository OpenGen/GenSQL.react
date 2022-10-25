import React, { useState } from 'react';
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default function NaturalLanguage({
  task: { id, title, state },
  onArchiveTask,
  onPinTask,
}) {
  const [message, setMessage] = useState('');
  const [data, setData] = useState('');

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  async function handleClick() {
    var prompt = `
### IQL tables, with their properties:
# 
# data(health_status, age, smoker, household_size, race, exercise, BMI, care_covid_sought, respiratory_symptoms, gender, fever_symptoms)
# Behavior, Environment, And Treatments for COVID-19 (BEAT19) research study by xCures
# Behavior, Environment, And Treatments for COVID-19 (BEAT19) research study by xCures
# BEAT19 is an IRB-approved study designed to enable everyday people, regardless of their health status, to contribute directly to the development of coronavirus treatments. BEAT19 collected more than daily surveys of symptoms and outcomes from over 100,000 people across all 50 US states and several other countries. source: xCures press release
# 
# The full set of columns is:
# health_status, age, smoker, household_size, race, exercise, BMI, care_covid_sought, respiratory_symptoms, gender, fever_symptoms
# 
# Querying data
# 
# We will begin by asking IQL for all the data by executing a query and then viewing the results in a spreadsheet-like table. 
# 
# Show me all the data.
SELECT * FROM data;
# As in SQL, we can also ask for a specific set of columns, restrict the output via WHERE, order by certain columns via ORDER, and limit the rows that are returned to an initial segment via LIMIT.
# Query: Who are the 5 oldest former smokers along with their age and whether they exercise?
SELECT smoker, exercise, age FROM data
  WHERE smoker = "former"
  ORDER BY age ASC
  LIMIT 5;
# Which male participants with the highest body mass index have respiratory symptoms or fever?
SELECT BMI, gender, respiratory_symptoms, fever_symptoms FROM data
  WHERE gender = "male"
  AND (respiratory_symptoms = "yes" OR fever_symptoms = "yes")
  ORDER BY BMI DESC
  LIMIT 5;
#  B. Generating synthetic data
#  InferenceQL builds a model from the data, and allows the user to then ask questions about this model. We can use this model to generate synthetic data.
#  Query: Show age, body mass index, and the presence of respiratory symptoms for 100 synthetically generated patients:
SELECT * FROM (GENERATE age, BMI, respiratory_symptoms UNDER model) LIMIT 100;
#  Query: Generate age, body mass index, and the presence of respiratory symptoms for 20 synthetic patients where the BMI is at least 30.
SELECT * FROM (GENERATE age, BMI, respiratory_symptoms UNDER model
  WHERE BMI >= 30) LIMIT 20;
# Query: Which rows have conditional probability of the health status  given the BMI of lower than 0.05?
SELECT
 p, health_status, BMI, exercise
 FROM (SELECT (PROBABILITY DENSITY OF health_status UNDER model
    CONDITIONED by BMI AS p),
    health_status, BMI, exercise 
 FROM data ORDER BY p)
 WHERE p < 0.05
 LIMIT 20
# Query: ${message}
SELECT `;
    const models = await openai.listModels();

    const response = await openai.createCompletion({
      model: 'code-davinci-002',
      prompt: prompt,
      temperature: 0,
      max_tokens: 200,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ['#', ';'],
    });

    console.log(response.data.choices[0].text);
    var output = response.data.choices[0].text;

    setData('SELECT ' + output);
  }

  return (
    <div>
      <textarea
        id="text1"
        type="text"
        style={{ width: '500px', height: '70px' }}
        onChange={handleChange}
        value={message}
      />
      <button onClick={handleClick}>Run query</button>
      <pre>{data}</pre>
    </div>
  );
}
