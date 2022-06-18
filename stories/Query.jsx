import PropTypes from 'prop-types';
import React from 'react';
import { Button } from './Button';
import { Table } from './Table';
import { TextArea } from './TextArea';
import './tailwind.css';

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
  const queryButton = (<Button label="Execute" ref={buttonRef} onClick={execute} />);

  const reset = () => {
    setResult();
    setFocus(true);
  };
  const resetButton = (<Button label="Reset" ref={buttonRef} onClick={reset} />);

  const button = (result !== undefined) ? resetButton : queryButton;

  var table;
  if (result !== undefined) {
    table = (<Table headers={result.columns} data={result.data} />);
  }

  React.useEffect(() => {
    if (textAreaRef.current && focus) {
      textAreaRef.current.focus();
      textAreaRef.current.select();
      setFocus(false);
    }
  });

  const onKeyPress = (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      execute();
    }
  };

  return (
    <div className="border px-3 py-3 rounded resize-none space-y-3">
      <TextArea
        defaultValue={query}
        disabled={result !== undefined}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={props.placeholder}
        ref={textAreaRef}
        rows={1}
      />
      {button}
      {table}
    </div>
  );
};

Query.propTypes = {
  execute: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
