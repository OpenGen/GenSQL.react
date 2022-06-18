import React from 'react';
import PropTypes from 'prop-types';
import './tailwind.css';

export const TextArea = React.forwardRef((props, ref) => {
  var ref = ref || React.useRef();

  const [value, setValue] = React.useState(props.defaultValue);

  const onChange = (event) => {
    if (props.onChange !== undefined) props.onChange(event);
    setValue(event.target.value);
  };

  React.useLayoutEffect(() => {
    if (ref.current) {
      ref.current.style.height = "inherit"; // shrink on delete
      const height = Math.max(32, ref.current.scrollHeight)
      ref.current.style.height = `${height}px`;
    }
  }, [value]);

  return (
    <textarea
      className="
        border
        border-slate-300
        border-solid
        disabled:bg-slate-100
        font-mono
        min-w-full
        overflow-hidden
        px-3
        py-2
        resize-none
      "
      disabled={props.disabled}
      onChange={onChange}
      onKeyPress={props.onKeyPress}
      placeholder={props.placeholder}
      ref={ref}
      rows={props.rows}
      value={value}
    />
  );
});

TextArea.propTypes = {
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
  placeholder: PropTypes.string,
  resize: PropTypes.bool,
  rows: PropTypes.number,
}

TextArea.defaultProps = {
  rows: 1,
}
