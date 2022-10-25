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
### IQL table with properties
# data(SalaryUSD, Gender, Ethnicity, YearsCodeProfessional, Background)
# Stackoverflow Developer Survey
# Explore the developer records
SELECT * FROM developer_records LIMIT 5
# Show me developers' salary, gender, and ethnicity
SELECT SalaryUSD, Gender, Ethnicity FROM developer_records
# List the 10 most frequent gender and ethnicity pairs
SELECT
  COUNT(*) AS n,
  Gender,
  Ethnicity
FROM developer_records
GROUP BY Gender, Ethnicity
ORDER BY n DESC
LIMIT 10
# Show me the probability of developers' salaries given their gender
SELECT
  SalaryUSD,
  Gender,
  PROBABILITY OF SalaryUSD
    UNDER developer_record_generator
      GIVEN Gender
        AS probability_salary
FROM developer_records
# Show me the probability of developers' salaries given their ethnicity
SELECT
  SalaryUSD,
  Ethnicity,
  PROBABILITY OF SalaryUSD
    UNDER developer_record_generator
      GIVEN Ethnicity
        AS probability_salary
FROM developer_records
# Show me developers gender, ethnicity, and how likely they are to be underpaid based on their experience and background
  SELECT
    PROBABILITY OF SalaryUSD >  SalaryUSD
      UNDER developer_record_generator
        GIVEN YearsCodeProfessional AND Background
        AS probability_underpaid,
    Gender,
    Ethnicity
    FROM
    SELECT * FROM developer_records
# ${message}
SELECT `;
    const models = await openai.listModels();

    const response = await openai.createCompletion({
      model: 'text-davinci-002',
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
