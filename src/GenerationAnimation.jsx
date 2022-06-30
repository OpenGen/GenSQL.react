import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Box, Slider } from '@mantine/core';
import { VegaLite } from 'react-vega';
import PrismInput from './PrismInput';

const categoricals = ['Purpose', 'Country_of_Operator'];

const categoricalList = categoricals.join(', ');
const countAlias = `Count_${categoricals.join('_')}`;

const spec = (n) => {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    mark: 'bar',
    data: { name: 'table' },
    transform: [
      {
        calculate: categoricals
          .map((column) => `datum.${column}`)
          .join(" + ', ' + "),
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
        filter: `datum.tag_rank <= ${n}`,
      },
    ],
    encoding: {
      y: {
        field: 'group',
        sort: '-x',
        title: categoricalList,
      },
      x: {
        type: 'quantitative',
        field: 'count',
        title: countAlias,
      },
    },
  };
};

const query = (limit) => {
  return `SELECT COUNT(*) AS ${countAlias}, ${categoricalList} FROM
  (SELECT * FROM
    GENERATE ${categoricalList}
    UNDER baseline_model
    GIVEN Class_of_Orbit = "GEO" AND Dry_mass_kg = 500
  LIMIT ${limit})
GROUP BY Purpose, Country_of_Operator
ORDER BY ${countAlias} DESC
LIMIT 10`;
};
export default function GenerationAnimation({ n, min, rows }) {
  const [limit, setLimit] = useState(1);

  const limitedRows = rows.slice(0, limit);
  const max = rows.length;

  return (
    <>
      <PrismInput mt="xl" disabled value={query(limit)} />
      <Slider
        max={max}
        min={min}
        marks={[
          { value: min, label: min },
          { value: max, label: max },
        ]}
        mb="md"
        mt="md"
        onChange={setLimit}
      />
      <Box mt="md">
        <VegaLite
          actions={false}
          data={{ table: limitedRows }}
          spec={spec(n)}
        />
      </Box>
    </>
  );
}

GenerationAnimation.propTypes = {
  n: PropTypes.number,
  min: PropTypes.number,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      Purpose: PropTypes.string,
      Country_of_Operator: PropTypes.string,
    })
  ).isRequired,
};

GenerationAnimation.defaultProps = {
  n: 10,
  min: 1,
};
