import React from 'react';
import { Query } from '../src/Query';

export default {
  title: 'Query',
  component: Query,
  argTypes: {
  },
};

const Template = (args) => <Query {...args} />;

const execute = (_s) => {
  return {
    columns: ["name", "age", "color"],
    rows: [
      {name: "Disco", age: 16, color: "brown"},
      {name: "Henry", age: 14, color: "orange"},
      {name: "Zelda", age: 13, color: "black"},
    ]
  }
};

export const Empty = Template.bind({});
Empty.args = {
  execute: execute,
};

export const Populated = Template.bind({});
Populated.args = {
  execute: execute,
  initialQuery: "SELECT * FROM data",
};
