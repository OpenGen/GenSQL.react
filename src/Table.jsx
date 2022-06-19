import React from 'react';
import PropTypes from 'prop-types';

const TableCell = ({ value }) => {
  return (
    <td className="px-3 py-2 border-r last:border-r-0">{value}</td>
  );
};

const TableRow = ({ headers, row }) => {
  const tableCells = headers.map((header, index) => {
    const value = row[header];
    return (<TableCell key={index} value={value} />);
  });

  return (
    <tr className="border-b">
      {tableCells}
    </tr>
  );
};

const TableBody = ({ headers, data }) => {
  const tableRows = data.map((row, index) => {
    return (<TableRow key={index} headers={headers} row={row} />);
  });
  return (
    <tbody>
      {tableRows}
    </tbody>
  );
}

const TableHeaderCell = ({ value }) => {
  return (
    <th className="px-3 py-2 border-r last:border-r-0">
      {value}
    </th>
  );
};

const TableHeader = ({ headers }) => {
  const cells = headers.map((value, index) => {
    return (<TableHeaderCell key={index} value={value} />);
  });

  return (
    <thead className="border-b last:border-b-0">
      <tr className="border-b">
        {cells}
      </tr>
    </thead>
  );
};

export const Table = ({ headers, data }) => {
  return (
    <table className="table-min border">
      <TableHeader headers={headers} />
      <TableBody headers={headers} data={data} />
    </table>
  );
};

Table.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired
};
