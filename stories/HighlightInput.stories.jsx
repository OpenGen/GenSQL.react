import 'highlight.js/styles/github.css';
import React, { useState } from 'react';
import HighlightInput from '../src/HighlightInput';

export default {
  title: 'HighlightInput',
  component: HighlightInput,
  argTypes: {},
};

function Template({ disabled, error, value }) {
  const [valueState, setValueState] = useState(value);

  const setValueStateWrapper = (valuee) => {
    setValueState(valuee);
  };

  return (
    <HighlightInput
      disabled={disabled}
      error={error}
      value={valueState}
      onChange={setValueStateWrapper}
    />
  );
}

Template.propTypes = HighlightInput.propTypes;
Template.defaultProps = HighlightInput.defaultProps;

export const Empty = Template.bind({});
Empty.args = {
  value: '',
};

export const SingleLine = Template.bind({});
SingleLine.args = {
  value: 'SELECT * FROM data;',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  value: 'SELECT * FROM data;',
};

export const Error = Template.bind({});
Error.args = {
  error: true,
  value: 'SELECT * FROM data;',
};

export const MultiLine = Template.bind({});
MultiLine.args = {
  value: `SELECT *
FROM data
WHERE x > 0
LIMIT 10`,
};

export const ProbabilityOf = Template.bind({});
ProbabilityOf.args = {
  value: `SELECT
  Period_minutes,
  Class_of_Orbit,

  PROBABILITY DENSITY OF VAR Period_minutes
  UNDER satellites_model
  CONDITIONED BY VAR Class_of_Orbit="GEO"
FROM satellites`,
};

export const Given = Template.bind({});
Given.args = {
  value: `SELECT *
FROM
  GENERATE x
  UNDER model
  GIVEN y = "Hello, world!"`,
};

export const Aggregation = Template.bind({});
Aggregation.args = {
  value: `SELECT
  COUNT(Period_minutes) AS count,
  AVG(Period_minutes) AS avg,
  STD(Period_minutes) AS std,
  MEDIAN(Period_minutes) AS median
FROM satellites`,
};

export const TableLiteral = Template.bind({});
TableLiteral.args = {
  value: `SELECT
  PROBABILITY OF Period_minutes = 100
  UNDER satellites_model AS prob
FROM (dummy) VALUES ("dummyval")`,
};
