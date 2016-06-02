import React, { Component, PropTypes } from 'react';
import { Map, Marker, Polyline, TileLayer } from 'react-leaflet';

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

export default class SingleImage extends Component {
  constructor(props) {
      super(props);
  }

  componentDidMount() {
    if ("topOffset" in this.props) {
      offset = this.props.topOffset - 100;
      $("html, body").animate({scrollTop: offset}, 500, "swing");
    }
  }

  render() {
    let offset=0;

    if ("topOffset" in this.props) {
      offset = this.props.topOffset - 100;
    }

    let positions = this.props.photos.map(function(img) {
      return ([img.latitude, img.longitude]);
    })

    positions = positions.filter(function(pos) {
      return ((pos[0] !== "null") && (pos[1] !== "null"));
    })

    return (        
        <div className="bigImage">
            <img key={this.props.photo._id + "_img"} src={"http://localhost:3022/" + this.props.photo.resized_uris["1280"]} />
        </div> 
        );       
  }
}
 
SingleImage.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photo: PropTypes.object.isRequired,
  topOffset: PropTypes.number.isOptional,
  photos: PropTypes.array.isRequired,
};