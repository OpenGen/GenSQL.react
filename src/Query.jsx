import { Editor } from "./Editor";
import PropTypes from 'prop-types';
import React from 'react';
import { ArrowBackUp, Database } from 'tabler-icons-react';
import { Button, Paper, Space } from '@mantine/core';
import { DataTable } from './DataTable';

const usePrevious = (value) => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const Query = (props) => {
  const [queryValue, setQueryValue] = React.useState(props.initialQuery || "");
  const [queryResult, setQueryResult] = React.useState();

  const buttonRef = React.useRef();
  const editorRef = React.useRef();

  const handleExecute = () => { setQueryResult(props.execute(queryValue)); };
  const handleReset = () => { setQueryResult(); };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      event.stopPropagation();
      handleExecute();
    }
  };

  const previousQueryResult = usePrevious(queryResult);
  React.useEffect(() => {
    if (!queryResult && previousQueryResult) {
      editorRef.current.focus();
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
      <Editor
        code={queryValue}
        disabled={Boolean(queryResult)}
        onKeyDown={onKeyDown}
        ref={editorRef}
        setCode={setQueryValue}
      />
      {queryResult
       ? <Button leftIcon={<ArrowBackUp/>} mt="md" ref={buttonRef} variant="default" onClick={handleReset}>Reset</Button>
       : <Button leftIcon={<Database/>} mt="md" ref={buttonRef} variant="default" onClick={handleExecute}>Execute</Button>}
      {queryResult && <Space h="md" />}
      {queryResult &&
       <DataTable
         columns={queryResult.columns}
         pagination={false}
         rows={queryResult.rows}
       />}
    </Paper>
  );
};

Query.propTypes = {
  execute: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  initialQuery: PropTypes.string,
};
