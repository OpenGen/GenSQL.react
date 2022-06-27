import React, { useState } from 'react';
import Editor from '../src/Editor';

export default {
  title: 'Editor',
  component: Editor,
  argTypes: {},
};

function Template({ code, disabled, onKeyDown }) {
  const [codeValue, setCode] = useState(code);
  return (
    <Editor
      code={codeValue}
      disabled={disabled}
      onKeyDown={onKeyDown}
      setCode={setCode}
    />
  );
}

Template.propTypes = Editor.propTypes;
Template.defaultProps = Editor.defaultProps;

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
