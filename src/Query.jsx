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

export const Query = (props) => {
  const [query, setQuery] = React.useState(props.initialQuery);
  const [queryResult, setQueryResult] = React.useState();

  const buttonRef = React.useRef();
  const textAreaRef = React.useRef();

  const handleExecute = () => { setQueryResult(props.execute(query)); };
  const handleReset = () => { setQueryResult(); };

  const onKeyPress = (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      handleExecute();
    }
  };

  const previousQueryResult = usePrevious(queryResult);
  React.useEffect(() => {
    if (!queryResult && previousQueryResult) {
      textAreaRef.current.focus({ cursor: "all" });
    } else if (queryResult && !previousQueryResult) {
      buttonRef.current.focus();
    }
  }, [queryResult, previousQueryResult]);

  return (
    <Card>
      <Form layout="horizontal">
        <Form.Item>
          <TextArea
            autoSize
            defaultValue={query}
            disabled={queryResult !== undefined}
            onChange={(event) => setQuery(event.target.value)}
            onKeyPress={onKeyPress}
            placeholder={props.placeholder}
            ref={textAreaRef}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0}}>
          {queryResult
           ? <Button type="primary" ref={buttonRef} onClick={handleReset}>Reset</Button>
           : <Button type="primary" ref={buttonRef} onClick={handleExecute}>Execute</Button>}
        </Form.Item>
      </Form>
      {queryResult &&
       <Table
         bordered
         columns={tableColumns(queryResult.columns)}
         dataSource={tableDataSource(queryResult.data)}
         pagination={false}
         size="small"
         style={{ display: "inline-block", marginTop: 24 }}
         tableLayout="auto"
       />}
    </Card>
  );
};

Query.propTypes = {
  execute: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  initialQuery: PropTypes.string,
};
