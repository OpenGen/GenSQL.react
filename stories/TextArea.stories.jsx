import React from 'react';

import { TextArea } from './TextArea';

export default {
  title: 'Example/TextArea',
  component: TextArea,
  argTypes: {
  },
};

const Template = (args) => <TextArea {...args} />;

export const Basic = Template.bind({});
Basic.args = {};

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: "SELECT * FROM data"
};

export const DefaultValue = Template.bind({});
DefaultValue.args = {
  defaultValue: "SELECT * FROM data"
};
