import React from 'react';
import { Spinner } from '../src/Spinner';
import './tailwind.css';

export default {
  title: 'Example/Spinner',
  component: Spinner,
};

const Template = (args) => <Spinner {...args} />;

export const Basic = Template.bind({});
Basic.args = {
};
