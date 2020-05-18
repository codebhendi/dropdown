import React, { Component } from 'react';

// Root component to handle user check and routing of all compoennt.
class App extends Component {
  constructor(props) {
    super(props);

    this.state = { loading: true, user: null };
  }

  render = () => {

    return (
      <>
        Hello World
      </>
    );
  }
}

App.propTypes = {};

export default App;
