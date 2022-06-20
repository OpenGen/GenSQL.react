import PropTypes from 'prop-types';
import React from 'react';
import { Button, Card, Form, Input, Table } from 'antd';

const { TextArea } = Input;

export const Query = (props) => {
  const [query, setQuery] = React.useState(props.value);
  const [result, setResult] = React.useState();
  const [focus, setFocus] = React.useState(undefined);

  const buttonRef = React.useRef();
  const textAreaRef = React.useRef();

  const onChange = (event) => { setQuery(event.target.value); }

  const handleExecute = () => {
    setResult(props.execute(query));
    setFocus(false);
    buttonRef.current.focus();
  };

  const handleReset = () => {
    setResult();
    setFocus(true);
  };

  const queryButton = (<Button type="primary" ref={buttonRef} onClick={handleExecute}>Execute</Button>);
  const resetButton = (<Button type="primary" ref={buttonRef} onClick={handleReset}>Reset</Button>);

  const button = (result !== undefined) ? resetButton : queryButton;

  var table;
  if (result !== undefined) {
    const columns = result.columns.map((column, index) => {
      return {
        title: column,
        dataIndex: column,
        key: index,
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
        style={{ display: "inline-block", marginTop: 24 }}
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
  value: PropTypes.string,
};
