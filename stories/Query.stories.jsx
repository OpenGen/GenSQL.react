import React from 'react';
import { Query } from '../src/Query';

export default {
  title: 'Example/Query',
  component: Query,
  argTypes: {
  },
};

const Template = (args) => <Query {...args} />;

const execute = (_s) => {
  return {
    columns: ["name", "age", "color"],
    data: [
      {name: "Disco", age: 16, color: "brown"},
      {name: "Henry", age: 14, color: "orange"},
      {name: "Zelda", age: 13, color: "black"},
    ]
  }
}

export const Placeholder = Template.bind({});
Placeholder.args = {
  execute: execute,
  placeholder: "Enter a query",
};

export const Value = Template.bind({});
Value.args = {
  execute: execute,
  initialQuery: "SELECT * FROM data",
};
