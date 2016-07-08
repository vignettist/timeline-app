import React, { Component, PropTypes } from 'react';
import { Map, Marker, Polyline, TileLayer } from 'react-leaflet';

import Photo from './Photo.jsx'

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

export default class TinyTimeline extends Component {
  constructor(props) {
      super(props);
  }
  render() {
    return (
			<div className="tinyTimeline">
        <span>
          <span className="ellipsis">&hellip;</span>
          <span className="tinyTimelineLabel">{moment(this.props.highlightedPhoto.datetime.utc_timestamp).format("M/D/YYYY")}</span>
        </span>
        {this.props.photos.map(function(img) {
          if (img._id === this.props.highlightedPhoto._id) {
            return(<div className="nearbyPhoto"><Photo photos={[img]} size="160" displayDuplicates={false} /></div>);
          } else {
            return(<div className="otherPhoto"><Photo photos={[img]} size="160" displayDuplicates={false} /></div>)
          }
        }, this)}
        <span>
          <span className="ellipsis">&hellip;</span>
        </span>
      </div>);       
  }
}
 

TinyTimeline.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  highlightedPhoto: PropTypes.object.isRequired,
  photos: PropTypes.array.isRequired,
};