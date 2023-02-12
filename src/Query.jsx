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
# college_records(ROWID,Region,Ownership,Locale,Faculty_salary,Admission_rate,SAT_score_critical_reading,SAT_score_math,SAT_score_writing,ACT_score_english,ACT_score_math,ACT_score_writing,Pell_grant_rate,Federal_loan_rate,Median_debt,Students_with_any_loan,Completion_rate_4yr,Cost,Earnings_10_yrs_after_entry_percentile_10,Earnings_10_yrs_after_entry_percentile_90,Earnings_10_yrs_after_entry_mean,Earnings_10_yrs_after_entry_mean_female_students,Earnings_10_yrs_after_entry_mean_male_students,default_rate,Size,Ethnicity_white,Retention_rate,Share_25_older,Share_firstgeneration,Female_share,Married,Veteran,First_generation,Instructional_invest,Average_net_price)

# Queries are short programs in InferenceQL and SQL. Return queries in InferenceQL. InferenceQL is like SQL, but add adds keywords for probabilistic inference. It uses a model to do this.
# In the example, the data table is called college_records and the model is called college_record_generator.

# Show me 5 records.
SELECT * FROM college_records LIMIT 5
# Show me 5 rows of the data
SELECT * FROM college_records LIMIT 5

# Always SELECT the ROWID.
SELECT ROWID, Size FROM college_records LIMIT 5

# Show me colleges where Size is smaller than 7000, median student debt is smaller than 10000 and which are in a cityl
SELECT
    ROWID,
    SAT_score_math,
    Admission_rate,
    Size,
    Median_debt,
    Instructional_invest,
    Locale
FROM college_records
WHERE
    Size < 70000 AND
    Median_debt < 10000 AND
    Instructional_invest > 50000 AND (
        Locale = "City: Small" OR
        Locale = "City: Midsize" OR
        Locale = "City: Large"
    )
----

# Scalar expressions evaluate to scalar values. A scalar value refers to a single value. The values of cells in tables are scalar values. The expressions that follow the SELECT keyword are scalar expressions.

# One example of a scalar expression is SIMILARITY TO. SIMILARITY TO compares rows. Rows can be indexed with names. SIMILARITY TO also works with HYPOTHETICAL ROWs. Such rows don't exist in the data table.

# Show me colleges that are similar to a hypothetical college in a midsize city, with a size of 8000 students and a median debt of 10000 dollars and investment in teaching 600000 in the context of institutional investment.
SELECT
    ROWID,
    SAT_score_math,
    Admission_rate,
    Size,
    Median_debt,
    Instructional_invest,
    Locale,
    SIMILAR TO
            HYPOTHETICAL ROW (
              Locale = "City: Midsize",
              Size = 8000,
              Median_debt = 10000,
              Instructional_invest = 60000
            )
    IN CONTEXT OF Instructional_invest
    UNDER college_record_generator
    AS probability_similar
FROM college_records
ORDER BY probability_similar DESC
LIMIT 10


Show me colleges that are similar to MIT, Harvard, Duke and Yale in the contest of institutional investment.
SELECT
    ROWID,
    SAT_score_math,
    Admission_rate,
    Size,
    Median_debt,
    Instructional_invest,
    Locale,
    SIMILAR TO
      "Massachusetts Institute of Technology",
      "Harvard University",
      "Duke University",
      "Yale University"
    IN CONTEXT OF Instructional_invest
    UNDER college_record_generator
    AS probability_similar
FROM (
    SELECT *
    FROM college_records
    WHERE Admission_rate > 0.1 AND (
        Locale = "City: Small" OR
        Locale = "City: Midsize" OR
        Locale = "City: Large")
    )
ORDER BY probability_similar DESC
LIMIT 10

#Show me colleges that are similar to MIT, Harvard, Duke and Yale in the contest of institutional investment but are not similar to Gallaudet University and Yeshiva University.

SELECT
    ROWID,
    SAT_score_math,
    Admission_rate,
    Size,
    Median_debt,
    Instructional_invest,
    Locale,
    SIMILAR TO
        (
            "Massachusetts Institute of Technology",
            "Harvard University",
            "Duke University",
            "Yale University"
            IN CONTEXT OF Instructional_invest
        )
        AND ( NOT
            "Gallaudet University",
            "Yeshiva University"
            IN CONTEXT OF SAT_score_math
        )
    UNDER college_record_generator
    AS probability_similar
FROM (
    SELECT *
    FROM college_records
    WHERE Admission_rate > 0.1 AND (
        Locale = "City: Small" OR
        Locale = "City: Midsize" OR
        Locale = "City: Large")
    )
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
