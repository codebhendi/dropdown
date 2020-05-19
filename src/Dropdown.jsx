import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { List } from 'react-virtualized';
import { createUseStyles } from 'react-jss';
import _ from 'lodash';

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
    width: '100%',
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
    '& > div': { maxWidth: '100%', width: '100% !important' },
    '& > div > div': { maxWidth: '100% !important', width: '100% !important' },
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
      color: '#fff',
      fontSize: '0.9rem',
    },
    backgroundColor: '#25252585',
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
    padding: '0.2rem',
    '& > div': { backgroundColor: '#d2527f' },
  },
  chipContainer: {
    display: 'flex',
    flexFlow: 'wrap',
    position: 'relative',
  },
  chip: {
    backgroundColor: '#25252585',
    color: '#f1828d',
    fontSize: '0.85rem',
    padding: '0.2rem 0.5rem',
    margin: '0.1rem',
    cursor: 'pointer',
  },
});

// Function to render list components for virtualized list
// classes: object containing styles as class names
// options: array of objects from which data is rendered.
// changeValue: function to be called when clicked on a liss item to add to selected value.
// fieldValue: value or values which are selected right now.
// key: key of the element rendered.
// index: index of the element renered in the current render array.
// style: style for virtualization.
const rowRenderer = (classes, options, changeValue, fieldValue) => ({ key, index, style }) => {
  // check if the element is equal to or belongs in the selected array.
  const selected = (fieldValue.map ? fieldValue : [fieldValue])
    .find((d) => d === options[index].value);

  return (
    <div
      className={`${classes.result} ${selected ? classes.selected : ''}`}
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

// Functional component to render dropdown component.
// placeholder: Placeholder string to render on the input field.
// label: Label string for the input field.
// multiselect: Boolean to decide if this is a multi select dropdown.
// options: array of values that is to be rendered. This must contain two keys name and value.
const Dropdown = ({
  placeholder, label, multiselect, options,
}) => {
  const [fieldValue, setValue] = useState(multiselect ? [] : '');
  const [open, setOpen] = useState();
  const containerRef = useRef();
  const [filterOptions, setFilterOptions] = useState(null);
  const [filterValue, setFilterValue] = useState(null);
  const classes = useStyles({ open });

  // Function to control visibility of the dropdown option.
  // flag: Boolean to decide whether to show dropdown or not.
  const handleVisibility = (flag) => (event) => {
    event.preventDefault();

    // We will check if this event was called from inside the dropdown and will
    // not close the component if that is so.
    if (!flag && containerRef && containerRef.current.contains(event.target)) {
      return;
    }

    // Reset the filter parameters
    setFilterValue(null);
    setFilterOptions(null);

    setOpen(flag);
  };

  // Function to control the value that is stored in the dropdown
  // selectValue: value that is to be added or removed
  const changeValue = (selectValue) => (event) => {
    event.preventDefault();

    // If multiselect is true we will check if the new value belongs to the array of
    // selected values. If it is there remove it or else add it.
    if (multiselect) {
      if (!fieldValue.find((d) => d === selectValue)) {
        setValue(fieldValue.concat(selectValue));
      } else {
        setValue(fieldValue.filter((d) => d !== selectValue));
      }

      return;
    }

    // For single values we can just set the obtained value as our selected value.
    setValue(selectValue);
    setOpen(false);
  };

  // Function to control the filter option values.
  // filterString: value that the filter options are to be filtered with.
  const changeFilter = (filterString) => () => {
    // Check if we have options and filter string value is not empty.
    if (options && filterString) {
      // Filter the given list to get new filtered list
      setFilterOptions(options.filter((d) => (
        d.name.toLocaleLowerCase().indexOf(filterString.toLocaleLowerCase()) !== -1
      )));
    // If the filter value is empty we will reset our filtered array.
    } else if (!filterString) {
      setFilterOptions(options);
    }
  };

  // Function to control the filter value.
  const handleChange = (event) => {
    event.preventDefault();

    // We will first obtain the filter value from event target. Then we will obtain
    // a debounced call to change Filter which will re-create our filter options.
    const { value: v } = event.target;
    const debounced = _.debounce(changeFilter(v), 200);

    setFilterValue(v);
    debounced();
  };

  // Function to clear all selected values.
  const clearAllValues = (event) => {
    event.preventDefault();
    setValue(multiselect ? [] : '');
  };

  // Function to clear filter values.
  const clearFilterValue = (event) => {
    event.preventDefault();
    setFilterValue(null);
  };

  // Function to render value or values are selected using the dropdown.
  const renderValues = () => (
    multiselect ? (
      // Filter the values to be rendered from options using selected value.
      options.filter((d) => fieldValue.indexOf(d.value) > -1)
        .map((d) => (
          <span
            key={d.value}
            className={classes.chip}
            onClick={changeValue(d.value)}
          >
            {d.name}
          </span>
        ))
    ) : fieldValue
  );

  // Using use effect we will control the event listener we will add to our dropdown.
  // This allows us to decide if the user is clicking outside the dropdown which in
  // turn lets us close our dropdown.
  useEffect(() => {
    document.addEventListener('mouseup', handleVisibility(false));

    return () => {
      document.removeEventListener('mousedown', handleVisibility(false));
    };
  });

  // Using use effect we will reset the values that are selected as this can cause errors in
  // the component.
  useEffect(() => {
    if (multiselect) setValue([]);
    else setValue('');
  }, [multiselect]);

  return (
    <div className={classes.inputContainer} ref={containerRef}>
      <label htmlFor="input">{label}</label>
      <div className={classes.chipContainer}>
        {renderValues()}
        <button className={classes.closebutton} onClick={clearAllValues} type="button">
          clear
        </button>
      </div>
      <div className={classes.inputIcon}>
        <input
          name="dropdown"
          onChange={handleChange}
          className={classes.input}
          onFocus={!open ? handleVisibility(true) : undefined}
          value={filterValue || ''}
          placeholder={placeholder}
        />
        <div className={classes.closeIcon} onClick={clearFilterValue}>
          <img src={closeIcon} alt="clear filter values" />
        </div>
      </div>
      <div className={classes.results}>
        <List
          width={300}
          height={300}
          rowCount={(filterOptions || options).length}
          rowHeight={35}
          rowRenderer={rowRenderer(classes, filterOptions || options, changeValue, fieldValue)}
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
  placeholder: PropTypes.string,
  label: PropTypes.string,
  multiselect: PropTypes.bool,
};

Dropdown.defaultProps = {
  options: [],
  placeholder: 'Please select a value',
  label: 'Input',
  multiselect: false,
};

export default Dropdown;
