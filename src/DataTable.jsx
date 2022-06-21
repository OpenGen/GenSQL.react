import PropTypes from 'prop-types';
import React from 'react';
import { Table } from '@mantine/core';

export const DataTable = (props) => {
  const tds = props.rows.map((row, index) => {
    const cells = props.columns.map((column, index) => (<td key={index}>{row[column]}</td>));
    return (
      <tr key={index}>
        {cells}
      </tr>
    );
  });

  const trs = props.columns.map((column, index) => (<th key={index}>{column}</th>));

  return (
    <Table striped style={{display: "block"}}>
      <thead>{trs}</thead>
      <tbody>{tds}</tbody>
    </Table>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string),
  rows: PropTypes.arrayOf(PropTypes.object),
};
