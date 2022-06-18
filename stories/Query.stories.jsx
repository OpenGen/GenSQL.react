import React from 'react';

import { Query } from './Query';

export default {
  title: 'Example/Query',
  component: Query,
  argTypes: {
  },
};

const Template = (args) => <Query {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  execute: (_s) => {
    return {
      columns: ["name", "age", "color"],
      data: [
        {name: "Disco", age: 16, color: "brown"},
        {name: "Henry", age: 14, color: "orange"},
        {name: "Zelda", age: 13, color: "black"},
      ],
    }
  },
  placeholder: "SELECT * FROM data",
};
