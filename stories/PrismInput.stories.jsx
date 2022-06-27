import React, { useState } from 'react';
import PrismInput from '../src/PrismInput';

export default {
  title: 'PrismInput',
  component: PrismInput,
  argTypes: {},
};

function Template({ code, disabled, onKeyDown }) {
  const [codeValue, setCode] = useState(code);
  return (
    <PrismInput
      code={codeValue}
      disabled={disabled}
      onKeyDown={onKeyDown}
      setCode={setCode}
    />
  );
}

Template.propTypes = PrismInput.propTypes;
Template.defaultProps = PrismInput.defaultProps;

export const Empty = Template.bind({});
Empty.args = {
  code: '',
};

export const SingleLine = Template.bind({});
SingleLine.args = {
  code: 'SELECT * FROM data;',
};

export const MultiLine = Template.bind({});
MultiLine.args = {
  code: 'SELECT *\nFROM data\nWHERE x > 0;',
};
