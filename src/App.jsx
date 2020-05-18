import React from 'react';
import { createUseStyles } from 'react-jss';

import Dropdown from './Dropdown';

const makeid = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * 62));
  }

  return result;
};

const list = Array.from(new Array(100)).map(() => {
  const id = makeid();
  return { name: id, value: id };
});

const useStyles = createUseStyles({
  container: {
    display: 'flex',
    padding: '10rem',
  },
});

const App = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Dropdown multiselect options={list} />
    </div>
  );
};

export default App;
