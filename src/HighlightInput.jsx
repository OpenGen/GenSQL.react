import 'highlight.js/styles/github.css';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import { Code } from '@mantine/core';
import { useEditable } from 'use-editable';

const language = ({ regex }) => {
  const COMMA = {
    scope: 'punctuation',
    match: /,/,
    relevance: 0,
  };

  const KEYWORDS = [
    'and',
    'as',
    'asc',
    'by',
    'desc',
    'from',
    'group',
    'limit',
    'or',
    'order',
    'select',
    'where',
  ];

  const LITERALS = ['true', 'false', 'NULL'];

  const OPERATORS = ['>', '>=', '=', '<=', '<'];

  const OPERATOR = {
    className: 'operator',
    match: regex.either(...OPERATORS),
  };

  const STRING = {
    className: 'string',
    match: /"(?:[^"]*)+"/,
  };

  const VARIABLE = {
    className: 'variable',
    match: /(?<=VAR\s+)[^0-9\s][\w\-_?.]*\b/,
  };

  const NUMBER = {
    scope: 'number',
    match: /\b-?[0-9]+\.?(?:[0-9]+)?\b/,
  };

  const SCALAR = {
    begin: /(?<=\b(SELECT|WHERE|ORDER\s+BY|LIMIT)\b)/,
    end: /(?=\b(FROM|ORDER)\b)/,
    keywords: {
      built_in: [
        'and',
        'by',
        'conditioned',
        'density',
        'generate',
        'given',
        'of',
        'or',
        'probability',
        'under',
        'var',
      ],
    },
    contains: [COMMA, NUMBER, OPERATOR, STRING, VARIABLE],
  };

  return {
    name: 'IQL',
    aliases: ['iql'],
    case_insensitive: true,
    keywords: {
      keyword: KEYWORDS,
      literal: LITERALS,
    },
    contains: [COMMA, SCALAR],
  };
};

hljs.registerLanguage('iql', language);
hljs.configure({ languages: ['iql', 'sql'] });

const HighlightInput = React.forwardRef(
  ({ disabled, indentation, onChange, onKeyDown, value }, forwardedRef) => {
    const ref = forwardedRef ?? useRef();

    useEditable(ref, onChange, { disabled, indentation });

    const handleKeyDown = (event, ...params) => {
      if (onKeyDown) onKeyDown(event, ...params);
      if (event.key === 'Backspace' && event.altKey) {
        // Without this only one character is deleted.
        event.stopPropagation();
      }
    };

    const { value: innerHTML } = hljs.highlight(value, { language: 'iql' });

    return (
      <pre>
        <Code
          className="hljs"
          onKeyDown={handleKeyDown}
          ref={ref}
          style={{
            background: 'lightgrey',
            display: 'block',
            padding: '10px',
            whiteSpace: 'pre-wrap',
          }}
          dangerouslySetInnerHTML={{ __html: innerHTML }}
        ></Code>
      </pre>
    );
  }
);
HighlightInput.displayName = 'HighlightInput';
export default HighlightInput;

HighlightInput.propTypes = {
  disabled: PropTypes.bool,
  indentation: PropTypes.number,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  value: PropTypes.string,
};

HighlightInput.defaultProps = {
  disabled: false,
  indentation: 2,
  onChange: undefined,
  onKeyDown: undefined,
  value: '',
};
