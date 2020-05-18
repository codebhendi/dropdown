import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { List } from 'react-virtualized';
import { createUseStyles } from 'react-jss';

import closeIcon from './assets/close.svg';

const useStyles = createUseStyles({
  input: {
    margin: 0,
    maxWidth: '100%',
    padding: '.67857143em 1em',
    border: '1px solid rgba(34,36,38,.15)',
    color: 'rgba(0,0,0,.87)',
    borderRadius: '.3rem',
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: 35,
  },
  results: {
    display: (props) => (props.open ? 'flex' : 'none'),
    visibility: (props) => (props.open ? 'visible' : 'hidden'),
    width: '100%',
    position: 'absolute',
    top: '100%',
    left: 0,
    border: '1px solid rgba(34,36,38,.15)',
    marginTop: '.5em',
    zIndex: 998,
    '& > div': { maxWidth: '100%', width: '100%' },
    '& > div > div': { maxWidth: '100%', width: '100%' },
  },
  resultsVisible: {
    display: 'flex',
    visibility: 'visible',
  },
  result: {
    cursor: 'pointer',
    '& > div': {
      padding: '.67857143em 1em',
      borderBottom: '1px solid rgba(34,36,38,.15)',
      color: 'rgba(0,0,0,.87)',
      fontSize: '0.8rem',
    },
    backgroundColor: '#fff',
    color: 'white',
  },
  closeIcon: {
    cursor: 'pointer',
    height: '100%',
    position: 'absolute',
    display: 'flex',
    bottom: 0,
    right: 10,
    '& > img': {
      height: '10px',
      width: 'auto',
      margin: 'auto',
    },
  },
  selected: {
    backgroundColor: 'pink',
  },
});


const rowRenderer = (classes, options, changeValue, fieldValue) => ({ key, index, style }) => {
  const selected = (fieldValue.map ? fieldValue : [fieldValue])
    .find((d) => d === options[index].value);

  return (
    <div
      className={`${classes.result} ${selected && classes.selected}`}
      key={key}
      style={style}
      onClick={changeValue(options[index].value)}
    >
      <div>
        {options[index].name}
      </div>
    </div>
  );
};

const Dropdown = ({
  placeholder, label, value, onChange, multiselect, options,
}) => {
  const [fieldValue, setValue] = useState(multiselect && value === '' ? [] : value);
  const [open, setOpen] = useState();
  const containerRef = useRef();

  const classes = useStyles({ open });

  const handleVisibility = (flag) => (event) => {
    event.preventDefault();

    if (!flag && containerRef && containerRef.current.contains(event.target)) {
      return;
    }

    setOpen(flag);
  };

  const changeValue = (selectValue) => (event) => {
    event.preventDefault();

    if (multiselect) {
      if (!fieldValue.find((d) => d === selectValue)) {
        setValue(fieldValue.concat(selectValue));
      } else {
        setValue(fieldValue.filter((d) => d !== selectValue));
      }
      return;
    }

    setValue(selectValue);
    setOpen(false);
  };

  const handleChange = (event) => {
    event.preventDefault();

    if (onChange) onChange(event);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleVisibility(false));

    return () => {
      document.removeEventListener('mousedown', handleVisibility(false));
    };
  });

  const clearValue = (event) => {
    event.preventDefault();
    setValue(multiselect ? [] : '');
  };

  useEffect(() => {
    if (multiselect) setValue([]);
    else setValue('');
  }, [multiselect]);

  return (
    <div className={classes.inputContainer} ref={containerRef}>
      <label htmlFor="input">{label}</label>
      <div className={classes.inputIcon}>
        <input
          name="dropdown"
          onChange={handleChange}
          className={classes.input}
          onFocus={handleVisibility(true)}
          value={fieldValue}
          placeholder={placeholder}
        />
        <div className={classes.closeIcon} onClick={clearValue}>
          <img src={closeIcon} alt="close dropdown" />
        </div>
      </div>
      <div className={classes.results}>
        <List
          width={300}
          height={300}
          rowCount={options.length}
          rowHeight={35}
          rowRenderer={rowRenderer(classes, options, changeValue, fieldValue)}
        />
      </div>
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  multiselect: PropTypes.bool,
};

Dropdown.defaultProps = {
  options: [],
  value: '',
  onChange: null,
  placeholder: 'Please select a value',
  label: 'Input',
  multiselect: false,
};

export default Dropdown;
