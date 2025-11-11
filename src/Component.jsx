import PropTypes from 'prop-types';

function Component(props) {

    console.log(props);

    return (
      <div>{props.a}</div>
    )
  }
  
  Component.propTypes = {
    a: PropTypes.any
  };

  export default Component
  