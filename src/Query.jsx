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
# data(Remote_work_status, Education, Years_coding, Years_coding_professionally, Developer_type, Org_size, Purchase_influence, Country, Attitude_towards_Blockchain, Age, Gender, Trans, Sexuality, Ethnicity, Independent_contributor_or_manager, Work_experience, I_have_interactions_outside_team, Knowledge_silos_prevent_me_sharing_ideas, Information_available_in_my_org, I_find_answers_with_existing_resources, I_know_what_resource_to_use_to_find_information, I_often_answer_questions_repeatedly, Waiting_on_answers_disrupts_my_workflow, Involved_in_hiring, Use_learning_resources_provided_by_employer, Employer_gives_time_to_learn_skills, Salary_USD, Books_Physical_media, On_the_job_training, Coding_Bootcamp, Friend_or_family_member, Colleague, Learned_coding_in_school, Hackathons_virtual_or_in-person, Interactive_tutorial, Certification_videos, Technical_documentation, Blogs, Auditory_material, Video-based_Online_Courses, Online_books, Online_forum, Programming_Games, Written-based_Online_Courses, Stack_Overflow, Written_Tutorials, Coding_sessions_live_or_recorded, Online_challenges, How-to_videos, Skillsoft, Udacity, edX, Coursera, Pluralsight, Codecademy, Udemy, Lua, PowerShell, Java, Kotlin, Groovy, Julia, Ruby, SAS, SQL, Solidity, C, Swift, Elixir, MATLAB, Rust, Objective-C, Python, Assembly, Clojure, VBA, COBOL, TypeScript, Bash_Shell, JavaScript, PHP, F_sharp, Perl, Fortran, Haskell, HTML_CSS, C_plusplus, C_sharp, Dart, R, Delphi, Scala, LISP, Go, DynamoDB, Redis, Cloud_Firestore, PostgreSQL, Neo4j, Microsoft_SQL_Server, Couchbase, Firebase_Realtime_Database, IBM_DB2, MongoDB, Elasticsearch, SQLite, Oracle, MySQL, Cassandra, MariaDB, OVH, Microsoft_Azure, Google_Cloud, AWS, OpenStack, Oracle_Cloud_Infrastructure, Heroku, Linode, IBM_Cloud_or_Watson, Colocation, Firebase, Managed_Hosting, VMware, DigitalOcean, Phoenix, Angular_dot_js, FastAPI, Laravel, Svelte, Django, Angular, Gatsby, Symfony, Play_Framework, Ruby_on_Rails, Nuxt_dot_js, Flask, jQuery, Blazor, Deno, Next_dot_js, Vue_dot_js, Fastify, ASP_dot_NET_Core_, ASP_dot_NET, Drupal, Node_dot_js, Express, React_dot_js, Flutter, Hugging_Face_Transformers, Cordova, Capacitor, Apache_Spark, GTK, Tidyverse, NumPy, Xamarin, Keras, Apache_Kafka, Ionic, Qt, Pandas, Hadoop, Torch_PyTorch, _dot_NET, TensorFlow, Scikit-learn, React_Native, Spring, Electron, Chef, npm, Unreal_Engine, Docker, Flow, Pulumi, Unity_3D, Kubernetes, Terraform, Ansible, Puppet, Yarn, Homebrew, GoLand, Atom, CLion, Eclipse, RStudio, Rider, Nano, Visual_Studio, IPython_Jupyter, Emacs, IntelliJ, PhpStorm, Sublime_Text, Qt_Creator, TextMate, Webstorm, Neovim, Xcode, RAD_Studio, Android_Studio, RubyMine, NetBeans, PyCharm, Vim, Spyder, Notepad_plusplus, Visual_Studio_Code, WSL, Windows, Linux-based, macOS, BSD, SVN, Git, Mercurial, I_have_a_concentration_or_memory_disorder, I_have_a_mood_or_emotional_disorder, I_have_learning_differences, I_have_an_autism_spectrum_disorder, I_have_anxiety_disorder)
In this data table "Yes" always starts with a capital "Y"
In this data table "No" always starts with a capital "N"
# Stackoverflow Developer Survey
#### Data queries
# Explore the developer records
SELECT * FROM developer_records LIMIT 5
# Show the salary, age, and years coding for developers in the datatable that have experience with Clojure, JavaScript and Python.
SELECT
Salary_USD,
Age,
Years_coding
FROM developer_records
WHERE
Clojure = "Yes" AND JavaScript = "Yes" AND Python = "Yes"
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
      GIVEN Clojure="Yes" AND Python="Yes" AND Salary_USD < 150000
LIMIT 4
# show the distribution of salary, age, and experience for developers in the database that have experience with Clojure, JavaScript and Python.

### Probability queries
# How likely is it that developers who know Python and Rust know Clojure?
SELECT
  PROBABILITY OF Clojure="Yes"
    UNDER developer_record_generator
      GIVEN Python="Yes" AND Rust="Yes"
        AS likelihood
FROM developer_records LIMIT 1

# How likely is it that developers data know Python and Java know Clojure and SQL?
SELECT
  PROBABILITY OF Clojure="Yes" AND SQL="Yes"
    UNDER developer_record_generator
      GIVEN Python="Yes" AND Java="Yes"
        AS likelihood
FROM developer_records LIMIT 1


# How likely is it that developers data know Python and Java know Clojure and SQL?
SELECT
  PROBABILITY OF Clojure="Yes" AND SQL="Yes"
    UNDER developer_record_generator
      GIVEN Python="Yes" AND Java="Yes"
        AS likelihood
FROM developer_records LIMIT 1

# Show me developers' salary, gender, and ethnicity
SELECT Salary_USD, Gender, Ethnicity FROM developer_records
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
  Salary_USD,
  Gender,
  PROBABILITY OF Salary_USD
    UNDER developer_record_generator
      GIVEN Gender
        AS probability_salary
FROM developer_records
# Show me the probability of developers' salaries given their ethnicity
SELECT
  Salary_USD,
  Ethnicity,
  PROBABILITY OF Salary_USD
    UNDER developer_record_generator
      GIVEN Ethnicity
        AS probability_salary
FROM developer_records
# Show me developers gender, ethnicity, and how likely they are to be underpaid based on their experience and background
  SELECT
    PROBABILITY OF Salary_USD >  Salary_USD
      UNDER developer_record_generator
        GIVEN Years_coding_professionally AND Background
        AS probability_underpaid,
    Gender,
    Ethnicity
    FROM
    SELECT * FROM developer_records
# ${english_query}
SELECT `;
    const response = await openai.createCompletion({
      model: 'code-cushman-001',
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
