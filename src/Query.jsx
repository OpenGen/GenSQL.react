import PropTypes from 'prop-types';
import React from 'react';
import { Button, Paper, Space, Textarea } from '@mantine/core';
import { DataTable } from './DataTable';
import { ArrowBackUp, Database } from 'tabler-icons-react';
import { useInputState } from '@mantine/hooks';

const usePrevious = (value) => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const Query = (props) => {
  const [queryValue, setQueryValue] = useInputState(props.initialQuery || "");
  const [queryResult, setQueryResult] = React.useState();

  const buttonRef = React.useRef();
  const textAreaRef = React.useRef();

  const handleExecute = () => { setQueryResult(props.execute(queryValue)); };
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
    <Paper
      p="sm"
      radius="sm"
      shadow="md"
      withBorder
    >
      <Textarea
        autosize
        disabled={queryResult !== undefined}
        onChange={setQueryValue}
        onKeyPress={onKeyPress}
        placeholder={props.placeholder}
        ref={textAreaRef}
        styles={{input: {fontFamily: "monospace"}}}
        value={queryValue}
      />
      {queryResult
       ? <Button leftIcon={<ArrowBackUp/>} mt="md" ref={buttonRef} variant="default" onClick={handleReset}>Reset</Button>
       : <Button leftIcon={<Database/>} mt="md" ref={buttonRef} variant="default" onClick={handleExecute}>Execute</Button>}
      {queryResult && <Space h="md" />}
      {queryResult &&
       <DataTable
         columns={queryResult.columns}
         pagination={false}
         rows={queryResult.data}
       />}
    </Paper>
  );
};

Query.propTypes = {
  execute: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  initialQuery: PropTypes.string,
};
