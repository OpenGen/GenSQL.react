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
# data(Developer_ID,Age,Salary_USD,NumPy,Pandas,JavaScript,HTML_CSS,npm)
# In this data table "Yes" always starts with a capital "Y"
# In this data table "No" always starts with a capital "N"
# Queries are short programs in InferenceQL and SQL. Return queries in InferenceQL. InferenceQL is like SQL, but add adds keywords for probabilistic inference.
# Unlike SQL, queries often start with the WITH keyword.

# Reason about your output and remember that InferenceQL is not like SQL. Queries can start with the WITH keyword. 
# We create context with a WITH statement to modify the model.

# Stackoverflow Developer Survey
#### Data queries
# Show me the first 20 rows of the data
SELECT * FROM data LIMIT 20
# Explore the developer records
SELECT * FROM data LIMIT 5
#Rows are developers.
### Search/find queries
# Never use WHERE. InferenceQL can't handle WHERE.
# InferenceQL does not have the keyword IN.
# Questions or prompts that start with the word find need the WITH keyword.
# The WITH keyword has to appear at the top level of the Query.
# Never use WITH if it's not the first line of the query.
# The WITH keyword allows you to bind names to values for the lifetime of a query. This can be useful in situations where you want the same value to be used for every row in a table. One example is conditioning a model for use in a SELECT expression. Unlike in SQL, WITH is always to first keyword in a query. After the WITH binding, a column indicates the start of the SELECT query.
WITH (baseline_model CONDITIONED BY VAR NumPy = "Yes") AS search_model:
  SELECT PROBABILITY OF VAR Python = "Yes" UNDER search_model.
# WITH is also useful to find similar developers. For finding similar developers, we can incorporate a label into the model.
# Any query that incorporates a label needs to start with WITH INCORPORATE.
# A model expression that incorporated a label can be written as follows, where baseline_model in the model
INCORPORATE (1 = true, 2 = true) INTO baseline_model.
# Search queries are queries where users want to find similar developers. They always start with the word "find".
# Search queries start with the WITH keyword.
# Search queries incorporate information about sparse labels into the model, that is later used with a SELECT. The following is a beginning of a search query:
WITH INCORPORATE (1 = true, 2 = true) INTO baseline_model AS search_model:
# Search queries always provide labels of the form (x = true, y = true, ...).
# For example, find 10 developers that are similar to developers with ID 1 and ID 2
WITH INCORPORATE (1 = true, 2 = true) INTO baseline_model AS search_model:
    SELECT
        Age, Salary_USD, NumPy, Pandas, JavaScript, HTML_CSS, npm,
        PROBABILITY DENSITY OF VAR label = true
            UNDER search_model CONDITIONED BY
                VAR NumPy = NumPy AND
                VAR Pandas = Pandas AND
                VAR HTML_CSS = HTML_CSS AND
                VAR JavaScript = JavaScript AND
                VAR npm = npm
                    AS p FROM data
    ORDER BY p DESC
    LIMIT 10
# Find 10 developers that are similar to developers with ID 2 and ID 3
WITH INCORPORATE (2 = true, 3 = true) INTO baseline_model AS search_model:
    SELECT
        Age, Salary_USD, NumPy, Pandas, JavaScript, HTML_CSS, npm,
        PROBABILITY DENSITY OF VAR label = true
            UNDER search_model CONDITIONED BY
                VAR NumPy = NumPy AND
                VAR Pandas = Pandas AND
                VAR HTML_CSS = HTML_CSS AND
                VAR JavaScript = JavaScript AND
                VAR npm = npm
                    AS p FROM data
    ORDER BY p DESC
    LIMIT 10
# Find 10 developers that are similar to developers with ID 2, ID 3 and 4
WITH INCORPORATE (2 = true, 3 = true, 4 = true) INTO baseline_model AS search_model:
    SELECT
        Age, Salary_USD, NumPy, Pandas, JavaScript, HTML_CSS, npm,
        PROBABILITY DENSITY OF VAR label = true
            UNDER search_model CONDITIONED BY
                VAR NumPy = NumPy AND
                VAR Pandas = Pandas AND
                VAR HTML_CSS = HTML_CSS AND
                VAR JavaScript = JavaScript AND
                VAR npm = npm
                    AS p FROM data
    ORDER BY p DESC
    LIMIT 10
# Find 10 developers that are similar to developers with ID 10, ID 11 and 15
WITH INCORPORATE (10 = true, 11 = true, 15 = true) INTO baseline_model AS search_model:
    SELECT
        Age, Salary_USD, NumPy, Pandas, JavaScript, HTML_CSS, npm,
        PROBABILITY DENSITY OF VAR label = true
            UNDER search_model CONDITIONED BY
                VAR NumPy = NumPy AND
                VAR Pandas = Pandas AND
                VAR HTML_CSS = HTML_CSS AND
                VAR JavaScript = JavaScript AND
                VAR npm = npm
                    AS p FROM data
    ORDER BY p DESC
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
    console.log('XXXXXX ---- Strict test ----- XXXXXX');
    console.log(output);
    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
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
