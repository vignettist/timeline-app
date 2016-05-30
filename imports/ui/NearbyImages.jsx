import React, { Component, PropTypes } from 'react';
import { Map, Marker, Polyline, TileLayer } from 'react-leaflet';

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

export default class NearbyImages extends Component {
  constructor(props) {
      super(props);
  }
  render() {
    return (
			<div className="nearbyImages">
       {this.props.photos.map(function(img) {
          return <img src={"http://localhost:3022/" + img.resized_uris["160"]} />
       })}
      </div>);       
  }
}
 
NearbyImages.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photo: PropTypes.object.isRequired,
  photos: PropTypes.array.isRequired,
};