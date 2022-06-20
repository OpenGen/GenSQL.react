import PropTypes from 'prop-types';
import React from 'react';
import { Button, Card, Form, Input, Space, Table } from 'antd';

const { TextArea } = Input;

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
  const queryButton = (<Button type="primary" ref={buttonRef} onClick={execute}>Execute</Button>);

  const reset = () => {
    setResult();
    setFocus(true);
  };
  const resetButton = (<Button type="primary" ref={buttonRef} onClick={reset}>Reset</Button>);

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
        pagination={false}
        size="small"
        sortDirections={["ascend", "descend"]}
        style={{ marginTop: 24 }}
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
      <Form layout="horizontal">
        <Form.Item>
          <TextArea
            autoSize
            defaultValue={query}
            disabled={result !== undefined}
            onChange={onChange}
            onKeyPress={onKeyPress}
            placeholder={props.placeholder}
            ref={textAreaRef}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0}}>
          {button}
        </Form.Item>
      </Form>
      {table}
    </Card>
  );
};

Query.propTypes = {
  execute: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
