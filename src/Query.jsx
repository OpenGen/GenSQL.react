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
  apiKey: 'XXX',
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

export default function Query({
  execute,
  initialQuery,
  statType,
  dataTableName,
  modelName,
  columns,
  rowsMeaning,
}) {
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
InferenceQL is a language very similar to SQL but which support keywords for probabilistic inference.
It uses a model to do this.
In the following, we'll give examples of InferenceQL queries. Variables are indicated with
[]. We differentiate the following variables:
[n] is a positive integer.
[data] is a data table name in the database.
[column] is a column name in a data table.
[model] is a model name.
[model-expr] is a model expression involving a [model].
[value] is a possible cell value for a table.
[rows] are rows in the datatable, they executing the model returns such a row. They have
inhere meaning defined below.


Show the data table
SELECT * FROM [data]
# Show [column] and [column] from the [data]
SELECT [column], [column] FROM [table]
# Show [n] rows from the [data]
SELECT * FROM [table] LIMIT [n]
# Show [n] rows from the [data]
SELECT * FROM [table] LIMIT [n]
# Show [n] rows from the [data] where column is [value]
SELECT * FROM [table] WHERE [column LIMIT] [n]
# SELECT queries can use aggregators on any [column]. Simple aggregators are:
AVG
MEDIAN
MIN
MAX
SUM
What's the average [column] in the [data]
SELECT AVG([column]) FROM [data]
# The PERCENTILE-IN aggregator also takes parameter
SELECT PERCENTILE-IN([column], [value]) FROM [data]
# The GENERATE expression evaluates to a table of samples from a model. It returns synthetic
data. The tables returned by GENERATE are infinite. A query comprised of a GENERATE expression will run forever. In order to view the output if a GENERATE expression you should limit its output by wrapping it with a SELECT that includes a LIMIT clause.
# Generate [n] synthetic rows
SELECT *
FROM
  GENERATE
  *
  UNDER [model]
LIMIT [n]
# Generate [n] synthetic values for [column]
SELECT *
FROM
  GENERATE
  [column]
  UNDER [model]
LIMIT [n]
# Generate a few synthetic [rows] for [column]
SELECT *
FROM
  GENERATE
  [column]
  UNDER [model]
LIMIT [n]
# Because tables returned by GENERATE are infinite you need to SELECT them first before using an aggregator on generated data. This can be ensured by using an extra SELECT and parentheses.
What's the median of bar in a synthetic population of 100 [rows]?
SELECT MEDIAN([column]) FROM (
    SELECT *
        FROM
          GENERATE
          [column]
          UNDER [model]
    LIMIT [n]
)

# Model expression evaluate to a models. The use the keyword GIVEN.
You can use it to condition models to ensure column values in returned synthetic agrees
with constrains affecting the  [value]s the generated data can take.

Generate synthetic data with [column] being [value] and [column] > [value].
SELECT *
FROM
  GENERATE
  [column]
  UNDER [model]
  GIVEN [column] = [value] AND [column] > [value]
LIMIT [n]
# Only return a single InferenceQL query consisting of valid InferenceQL code. Don't return any prose.
Do not any code returned with the ; character.

In this database, there is one data table called ${dataTableName}.
In this database, there is one model called ${modelName}
In the records table, there are ${
      columns.length
    } columns, called: ${columns.join(', ')}

${rowsMeaning}

Replace any variables with these values. Users may refer to these values with synomyms but queries need to have the exact values including the correct capitalization.
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
    console.log(output);
    console.log(dataTableName);
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
