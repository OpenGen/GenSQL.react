import PropTypes from 'prop-types';
import React from 'react';
import { ArrowBackUp, Database } from 'tabler-icons-react';
import { Button, Paper, Space } from '@mantine/core';
/* eslint-disable import/no-named-default */
import { default as Input } from './HighlightInput';
// import { default as Input } from './PrismInput';
import DataTable from './DataTable';

const usePrevious = (value) => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default function Query({ execute, initialQuery }) {
  const [queryValue, setQueryValue] = React.useState(initialQuery || '');
  const [queryResult, setQueryResult] = React.useState();

  const buttonRef = React.useRef();
  const editorRef = React.useRef();

  const handleExecute = () => {
    setQueryResult(execute(queryValue));
  };
  const handleReset = () => {
    setQueryResult();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && event.shiftKey) {
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
    <Paper p="sm" radius="sm" shadow="md" withBorder>
      <Input
        disabled={Boolean(queryResult)}
        onChange={setQueryValue}
        onKeyDown={onKeyDown}
        ref={editorRef}
        value={queryValue}
      />
      {queryResult ? (
        <Button
          leftIcon={<ArrowBackUp />}
          mt="md"
          ref={buttonRef}
          variant="default"
          onClick={handleReset}
        >
          Reset
        </Button>
      ) : (
        <Button
          leftIcon={<Database />}
          mt="md"
          ref={buttonRef}
          variant="default"
          onClick={handleExecute}
        >
          Execute
        </Button>
      )}
      {queryResult && <Space h="md" />}
      {queryResult && (
        <DataTable
          columns={queryResult.columns}
          pagination={false}
          rows={queryResult.rows}
        />
      )}
    </Paper>
  );
}

Query.propTypes = {
  execute: PropTypes.func.isRequired,
  initialQuery: PropTypes.string,
};

Query.defaultProps = {
  initialQuery: undefined,
};
