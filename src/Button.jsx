import React from 'react';
import PropTypes from 'prop-types';

export const Button = React.forwardRef(({ label, onClick, ...props }, ref) => {
  var ref = ref || React.useRef();
  return (
    <button
      type="button"
      className="
        bg-transparent
        border
        border:blue-500
        font-bold
        hover:bg-blue-500
        hover:text-white
        px-4
        py-2
        rounded
        text-blue-700
      "
      onClick={onClick}
      ref={ref}
      {...props}
    >
      {label}
    </button>
  );
});

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

Button.defaultProps = {
  onClick: undefined,
};
