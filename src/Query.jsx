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
    if (english_query.startsWith('Find', 0)) {
      var qstart = 'WITH';
    } else {
      var qstart = 'SELECT';
    }
    var prompt = `
### IQL table with properties
# restaurant_records(ROWID,Region,Ownership,Locale,Faculty_salary,Admission_rate,SAT_score_critical_reading,SAT_score_math,SAT_score_writing,ACT_score_english,ACT_score_math,ACT_score_writing,Pell_grant_rate,Federal_loan_rate,Median_debt,Students_with_any_loan,Completion_rate_4yr,Cost,Earnings_10_yrs_after_entry_percentile_10,Earnings_10_yrs_after_entry_percentile_90,Earnings_10_yrs_after_entry_mean,Earnings_10_yrs_after_entry_mean_female_students,Earnings_10_yrs_after_entry_mean_male_students,default_rate,Size,Ethnicity_white,Retention_rate,Share_25_older,Share_firstgeneration,Female_share,Married,Veteran,First_generation,Instructional_invest,Average_net_price)
)

# Queries are short programs in InferenceQL and SQL. Return queries in InferenceQL. InferenceQL is like SQL, but add adds keywords for probabilistic inference. It uses a model to do this.
# In the example, the data table is called restaurant_records and the model is called restaurant_record_generator.

# Show me 5 records all columns
SELECT * FROM restaurant_records LIMIT 5
# Show me 5 rows of the data
SELECT * FROM restaurant_records LIMIT 5

# Always SELECT the ROWID.
SELECT ROWID, Size FROM restaurant_records LIMIT 5

# Show me restauants similar to a hypothetical restaurant in Ciudad Victoria with a rating of 2.
SELECT
    ROWID,
    rating_service,
    rating_food,
    rating_overall,
    cuisine,
    open_late_Sunday,
    latitude,
    longitude,
    SIMILAR TO
            HYPOTHETICAL ROW (
              city = "Ciudad Victoria",
              rating_food = 2.0
            )
    IN CONTEXT OF rating_food
    UNDER restaurant_record_generator
    AS probability_similar
FROM restaurant_records
WHERE cuisine = "Japanese" OR cuisine IS NULL
ORDER BY probability_similar DESC
LIMIT 10
# ${english_query}
${qstart} `;
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      temperature: 0,
      max_tokens: 200,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ['#', ';'],
    });
    const output = qstart + response.data.choices[0].text;
    console.log('YYYYYY ---- Strict test ----- YYYYYY');
    console.log(output);
    console.log('YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');
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
