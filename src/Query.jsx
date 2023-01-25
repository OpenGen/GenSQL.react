import { ArrowBackUp, Database } from 'tabler-icons-react';
import {
  TextInput,
  Textarea,
  Button,
  Code,
  LoadingOverlay,
  Paper,
  Tabs,
} from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import React from 'react';
import PropTypes from 'prop-types';
import DataTable from './DataTable';
import HighlightInput from './HighlightInput';
import TextField from '@mui/material/TextField';
import PairPlot from './PairPlot';
import WorldMap from './WorldMap';

const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const useClearableState = (initialValue) => {
  const [value, setValue] = React.useState(initialValue);
  const clearValue = () => setValue();
  return [value, setValue, clearValue];
};

const useSwitch = (initialValue) => {
  const [value, setValue] = React.useState(initialValue);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);
  return [value, setTrue, setFalse];
};

const both =
  (f1, f2) =>
  (...args) => {
    f1.apply(this, args);
    f2.apply(this, args);
  };

export default function Query({ execute, initialQuery, statType }) {
  const [isLoading, setIsLoading, setNotLoading] = useSwitch(false);
  const [englishQueryValue, setEnglishQueryValue] = React.useState();
  const [queryValue, setQueryValue] = React.useState('');
  const [queryResult, setQueryResult, clearQueryResult] = useClearableState();
  const [errorValue, setErrorValue, clearErrorValue] = useClearableState();

  const buttonRef = React.useRef();
  const editorRef = React.useRef();

  async function english_to_iql(english_query) {
    var prompt = `
### IQL table with properties
# data(SalaryUSD, Gender, Ethnicity, YearsCodeProfessional, Background)
# Stackoverflow Developer Survey
# Explore the developer records
SELECT * FROM developer_records LIMIT 5
### Generate synthetic data
# All queries with GENERATE need to start with a SELECT.
# All queries with GENERATE need to end with LIMIT and a number.
# Show me four synthetic developer records.
SELECT * FROM GENERATE * UNDER developer_record_generator LIMIT 4
# Show me two synthetic developer records
SELECT * FROM GENERATE * UNDER developer_record_generator LIMIT 2
# Generate four synthetic developer records
SELECT * FROM GENERATE * UNDER developer_record_generator LIMIT 4
# Generate four female synthetic developer records
SELECT * FROM
  GENERATE *
    UNDER developer_record_generator
      GIVEN Gender="Woman"
LIMIT 4
# Generate synthetic developer records for developers who know Python and Clojure and who learn less than 150k
SELECT * FROM
  GENERATE *
    UNDER developer_record_generator
      GIVEN Clojure="yes" AND Python="yes" AND SalaryUSD < 150000
LIMIT 4
# How likely is it that developers who know Python and Rust know Clojure?
SELECT
  PROBABILITY OF Clojure="yes"
    UNDER developer_record_generator
      GIVEN Python="yes" AND Rust="yes"
        AS likelihood
FROM developer_records LIMIT 1

# How likely is it that developers data know Python and Java know Clojure and SQL?
SELECT
  PROBABILITY OF Clojure="yes" AND SQL="yes"
    UNDER developer_record_generator
      GIVEN Python="yes" AND Java="yes"
        AS likelihood
FROM developer_records LIMIT 1


# How likely is it that developers data know Python and Java know Clojure and SQL?
SELECT
  PROBABILITY OF Clojure="yes" AND SQL="yes"
    UNDER developer_record_generator
      GIVEN Python="yes" AND Java="yes"
        AS likelihood
FROM developer_records LIMIT 1

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
# ${english_query}
SELECT `;
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
    const output = 'SELECT ' + response.data.choices[0].text;
    console.log(output);
    setQueryValue(output);
    return output;
  }

  const handleExecute = () => {
    console.log(englishQueryValue);
    english_to_iql(englishQueryValue)
      .then(execute)
      .then(both(setQueryResult, clearErrorValue))
      .catch(both(setErrorValue, clearQueryResult))
      .finally(setNotLoading);
    setIsLoading();
  };

  const onKeyDown = getHotkeyHandler([
    ['mod+Enter', handleExecute],
    ['shift+Enter', handleExecute],
  ]);

  const mapShown =
    queryResult &&
    statType &&
    queryResult.columns.length === 2 &&
    queryResult.columns.map(statType).includes('quantitative') &&
    queryResult.columns.includes('Country_of_Operator');

  return (
    <Paper p="xs" radius="xs" shadow="md" withBorder>
      <Textarea
        // disabled={isLoading}
        // error={Boolean(errorValue)}
        placeholder="Insert your query here"
        onChange={(val) => setEnglishQueryValue(val.target.value)}
        onKeyDown={onKeyDown}
        // ref={editorRef}
        value={englishQueryValue}
        size="xl"
      />

      {errorValue && (
        <Code block color="red" mt="sm">
          {errorValue.message}
        </Code>
      )}

      <Button
        disabled={isLoading}
        loading={isLoading}
        leftIcon={<Database size={18} />}
        mt="sm"
        mr="sm"
        ref={buttonRef}
        variant="default"
        onClick={handleExecute}
      >
        Ask
      </Button>
      <p> </p>

      <HighlightInput
        disabled={isLoading}
        error={Boolean(errorValue)}
        onKeyDown={onKeyDown}
        ref={editorRef}
        value={queryValue}
      />

      {queryResult && (
        <Button
          leftIcon={<ArrowBackUp size={18} />}
          mt="sm"
          ref={buttonRef}
          variant="default"
          onClick={clearQueryResult}
        >
          Clear
        </Button>
      )}

      {queryResult && (
        <Tabs mt="sm" defaultValue="table">
          <Tabs.List>
            <Tabs.Tab value="table">Table</Tabs.Tab>
            <Tabs.Tab value="plots" disabled={!statType}>
              Plots
            </Tabs.Tab>
            <Tabs.Tab value="map" disabled={!mapShown}>
              Map
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="table">
            <div style={{ position: 'relative' }}>
              <LoadingOverlay visible={isLoading} transitionDuration={0} />
              <DataTable
                columns={queryResult.columns}
                pagination={false}
                rows={queryResult.rows}
              />
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="plots">
            {statType && (
              <PairPlot
                data={queryResult.rows}
                types={Object.fromEntries(
                  queryResult.columns
                    .map((col) => [col, statType(col)])
                    .filter(([col, type]) => col && type)
                )}
              />
            )}
          </Tabs.Panel>
          <Tabs.Panel value="map">
            {mapShown && (
              <WorldMap
                data={queryResult.rows}
                types={Object.fromEntries(
                  queryResult.columns
                    .map((col) => [col, statType(col)])
                    .filter(([col, type]) => col && type)
                )}
              />
            )}
          </Tabs.Panel>
        </Tabs>
      )}
    </Paper>
  );
}

Query.propTypes = {
  execute: PropTypes.func.isRequired,
  statType: PropTypes.func,
  initialQuery: PropTypes.string,
};

Query.defaultProps = {
  initialQuery: undefined,
  statType: undefined,
};
