import PropTypes from 'prop-types';
import React from 'react';
import { Button, Card, Form, Input, Table } from 'antd';

const { TextArea } = Input;

const tableColumns = (columns) => (
  columns.map((column, index) => ({
    title: column,
    dataIndex: column,
    key: index,
  }))
);

const tableDataSource = (data) => (
  data.map((datum, index) => ({ key: index, ...datum }))
);

const usePrevious = (value) => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const QueryButton = React.forwardRef((props, ref) => {
  if (props.result) {
    return <Button type="primary" ref={ref} onClick={props.handleReset}>Reset</Button>
  } else {
    return <Button type="primary" ref={ref} onClick={props.handleExecute}>Execute</Button>;
  }
});

export const Query = (props) => {
  const [query, setQuery] = React.useState(props.value);
  const [result, setResult] = React.useState();

  const buttonRef = React.useRef();
  const textAreaRef = React.useRef();

  const onChange = (event) => { setQuery(event.target.value); }

  const handleExecute = () => { setResult(props.execute(query)); };
  const handleReset = () => { setResult(); };

  var table;
  if (result) {
    const columns = tableColumns(result.columns);
    const dataSource = tableDataSource(result.data);

    table = (
      <Table
        bordered
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        style={{ display: "inline-block", marginTop: 24 }}
        tableLayout="auto"
      />
    );
  }

  // Focus botton when gaining results, focus textarea when losing results.
  const previousResult = usePrevious(result);
  React.useEffect(() => {
    if (!result && previousResult) {
      textAreaRef.current.focus({ cursor: "all" });
    } else if (result && !previousResult) {
      buttonRef.current.focus();
    }
  }, [result, previousResult]);

  const onKeyPress = (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      handleExecute();
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
          <QueryButton
            result={result}
            handleExecute={handleExecute}
            handleReset={handleReset}
            ref={buttonRef}
          />
        </Form.Item>
      </Form>
      {table}
    </Card>
  );
};

Query.propTypes = {
  execute: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
};
