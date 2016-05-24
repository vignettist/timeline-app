import React, { Component, PropTypes } from 'react';
 
// Task component - represents a single todo item
export default class Photo extends Component {
  render() {
    return (
      <img src={"http://localhost:3022/" + this.props.photo.filename} className="timeline"/>
    );
  }
}
 
Photo.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photo: PropTypes.object.isRequired,
};
