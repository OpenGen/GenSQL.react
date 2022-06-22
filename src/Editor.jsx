import Highlight, { defaultProps } from "prism-react-renderer";
import PropTypes from 'prop-types';
import React, { useCallback } from "react";
import github from 'prism-react-renderer/themes/github';
import { Code } from '@mantine/core';
import { useEditable } from "use-editable";

export const Editor = React.forwardRef(({code, disabled, onKeyDown, setCode }, ref) => {
  const onChange = useCallback((code) => {
    // https://github.com/FormidableLabs/use-editable/issues/8#issuecomment-817390829
    setCode(code.slice(0, -1));
  }, [setCode]);

  useEditable(ref, onChange, {
    disabled: disabled,
    indentation: 2
  });

  return (
    <Highlight {...defaultProps} theme={github} code={code} language="sql">
      {({ className, style, tokens, getTokenProps }) => (
        <Code
          className={className}
          onKeyDown={onKeyDown}
          ref={ref}
          style={{padding: "10px", display: "block", ...style}}
        >
          {tokens.map((line, i) => (
            <React.Fragment key={i}>
              {line
               .filter((token) => !token.empty)
               .map((token, key) => (
                 <span {...getTokenProps({ token, key })} />
               ))}
              {"\n"}
            </React.Fragment>
          ))}
        </Code>
      )}
    </Highlight>
  );
});

Editor.propTypes = {
  code: PropTypes.string.isRequired,
  disabled: PropTypes.boolean,
  onKeyDown: PropTypes.func,
  setCode: PropTypes.func.isRequired,
};
