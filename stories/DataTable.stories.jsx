import React from 'react';
import DataTable from '../src/DataTable';

export default {
  title: 'DataTable',
  component: DataTable,
  argTypes: {
  },
};

function Template(args) {
  return <DataTable {...args} />;
}

const columns = ['name', 'age', 'color'];
const rows = [
  { name: 'Disco', age: 16, color: 'brown' },
  { name: 'Henry', age: 14, color: 'orange' },
  { name: 'Zelda', age: 13, color: 'black' },
];

export const Basic = Template.bind({});
Basic.args = {
  columns,
  rows,
};
