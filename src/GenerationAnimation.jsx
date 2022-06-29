import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Box, Slider } from '@mantine/core';
import { VegaLite } from 'react-vega';
import PrismInput from './PrismInput';

const spec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  mark: 'bar',
  data: { name: 'table' },
  transform: [
    {
      calculate: "datum.Purpose + ', ' + datum.Country_of_Operator",
      as: 'group',
    },
    {
      aggregate: [{ op: 'count', field: 'group', as: 'count' }],
      groupby: ['group'],
    },
    {
      window: [{ op: 'row_number', field: '', as: 'tag_rank' }],
      sort: [{ field: 'count', order: 'descending' }],
    },
    {
      filter: 'datum.tag_rank <= 10',
    },
  ],
  encoding: {
    y: {
      field: 'group',
      sort: '-x',
      title: 'Purpose, Country_of_Operator',
    },
    x: {
      type: 'quantitative',
      field: 'count',
      title: 'Count_Purpose',
    },
  },
};

export default function GenerationAnimation({ min, rows }) {
  const [limit, setLimit] = useState(1);

  const query = `SELECT COUNT(*) AS Count_Purpose, Purpose, Country_of_Operator FROM
  (SELECT * FROM
    GENERATE Country_of_Operator, Purpose
    UNDER baseline_model
    GIVEN Class_of_Orbit = "GEO" AND Dry_mass_kg = 500
  LIMIT ${limit})
GROUP BY Purpose, Country_of_Operator
ORDER BY Count_Purpose DESC
LIMIT 10`;

  const limitedRows = rows.slice(0, limit);
  const max = rows.length;

  return (
    <>
      <Slider
        max={max}
        min={min}
        marks={[
          { value: min, label: min },
          { value: max, label: max },
        ]}
        mb="xl"
        onChange={setLimit}
      />
      <PrismInput mt="xl" disabled value={query} />
      <Box mt="md">
        <VegaLite actions={false} data={{ table: limitedRows }} spec={spec} />
      </Box>
    </>
  );
}

GenerationAnimation.propTypes = {
  min: PropTypes.number,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      Purpose: PropTypes.string,
      Country_of_Operator: PropTypes.string,
    })
  ).isRequired,
};

GenerationAnimation.defaultProps = {
  min: 1,
};
