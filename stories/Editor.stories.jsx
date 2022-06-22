import React, { useRef, useState } from 'react';
import { Editor } from '../src/Editor';

export default {
  title: 'Editor',
  component: Editor,
  argTypes: {
  },
};

const Template = ({code, ...props}) => {
  var [code, setCode] = useState(props.code ?? "");
  return (
    <Editor code={code} setCode={setCode} {...props} />
  );
};

export const Basic = Template.bind({});
Basic.args = {
  code: "SELECT * FROM data;",
};
