import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { LogicalImages } from '../api/photos.js';


var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

export class Face extends Component {
  constructor(props) {
      super(props);
  }

  componentDidMount() {

  }

  render() {
    console.log(this.props.photo);

    if (this.props.photo.length > 0) {
      let photos = this.props.photo.map(function(img) {        
            return (<div className="bigImage">
                <img key={img._id + "_img"} src={"http://localhost:3022/" + img.resized_uris["1280"]} />
            </div> );
          });

      return (<div>{photos}</div>          
          );       
    } else {
      return <div></div>
    }
  }
}
 
Face.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photo: PropTypes.array.isRequired,
};

export default createContainer(() => {
  return {
    photo: LogicalImages.find({}).fetch(),
  };

}, Face);