import React from 'react';
import { Table } from '../src/Table';
import './tailwind.css';

export default {
  title: 'Example/Table',
  component: Table,
};

const Template = (args) => <Table {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  headers: ["name", "age", "color"],
  data: [
    {name: "Disco", age: 16, color: "brown"},
    {name: "Henry", age: 15, color: "orange"},
    {name: "Zelda", age: 13, color: "black"}
  ]
};
