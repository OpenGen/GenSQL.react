import React from 'react';

import { Spinner } from './Spinner';

export default {
  title: 'Example/Spinner',
  component: Spinner,
};

const Template = (args) => <Spinner {...args} />;

export const Basic = Template.bind({});
Basic.args = {
};
