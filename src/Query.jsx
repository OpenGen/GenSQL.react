import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'antd';
import { Card } from 'antd';
import { Input } from 'antd';
import { Option } from 'antd';
import { Select } from 'antd';
import { Space } from 'antd';
import { Table } from 'antd';

const { TextArea } = Input;

const select = (
  <Select defaultValue=".com" className="select-after">
    <Option value=".com">.com</Option>
    <Option value=".jp">.jp</Option>
    <Option value=".cn">.cn</Option>
    <Option value=".org">.org</Option>
  </Select>
);

export const Query = (props) => {
  const [query, setQuery] = React.useState();
  const [result, setResult] = React.useState();
  const [focus, setFocus] = React.useState(undefined);

  const buttonRef = React.useRef();
  const textAreaRef = React.useRef();

  const onChange = (event) => { setQuery(event.target.value); }

  const execute = () => {
    setResult(props.execute(query));
    setFocus(false);
    buttonRef.current.focus();
    textAreaRef.current.blur();
  };
  const queryButton = (<Button ref={buttonRef} onClick={execute}>Execute</Button>);

  const reset = () => {
    setResult();
    setFocus(true);
  };
  const resetButton = (<Button ref={buttonRef} onClick={reset}>Reset</Button>);

  const button = (result !== undefined) ? resetButton : queryButton;

  const sorter = (column) => (a, b) => {
    if (typeof(a[column]) === "string" && typeof(b[column]) === "string") {
      return a[column] > b[column] ? 1 : a[column] < b[column] ? -1 : 0;
    } else {
      return a[column] - b[column];
    }
  }

  var table;
  if (result !== undefined) {
    const columns = result.columns.map((column, index) => {
      return {
        title: column,
        dataIndex: column,
        key: index,
        sorter: sorter(column)
      };
    });
    const dataSource = result.data.map((datum, index) => {
      return { key: index, ...datum };
    });
    table = (
      <Table
        bordered
        columns={columns}
        dataSource={dataSource}
        size="small"
        sortDirections={["ascend", "descend"]}
        tableLayout="auto"
      />
    );
  }

  React.useEffect(() => {
    if (textAreaRef.current && focus) {
      textAreaRef.current.focus({
        cursor: 'all',
      });
      setFocus(false);
    }
  });

  const onKeyPress = (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      execute();
    }
  };

  return (
    <Card>
      <Space
        direction="vertical"
        size="middle"
        style={{ display: "flex" }}
      >
        <TextArea
          autoSize
          defaultValue={query}
          disabled={result !== undefined}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={props.placeholder}
          ref={textAreaRef}
        />
        {button}
        {table}
      </Space>
    </Card>
  );
};

Query.propTypes = {
  execute: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
