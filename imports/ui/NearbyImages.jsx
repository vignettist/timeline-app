import React, { Component, PropTypes } from 'react';
import { Map, Marker, Polyline, TileLayer } from 'react-leaflet';

import TinyTimeline from './TinyTimeline.jsx';


var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

export default class NearbyImages extends Component {
  constructor(props) {
      super(props);
  }

  render() {
    var lat = this.props.lat;
    var lon = this.props.lon;

    if ((this.props != 'undefined')) {
      let sortedPhotos = this.props.photos.slice(0);

      sortedPhotos.sort(function(a,b) {
        let dA = Math.pow(a.latitude - lat,2) + Math.pow(a.longitude - lon,2);
        let dB = Math.pow(b.latitude - lat,2) + Math.pow(b.longitude - lon,2);
        return (dA - dB);
      });

      let timeSortedPhotos = this.props.photos.slice(0);
      timeSortedPhotos.sort(function(a,b) {
        return a.datetime.utc_timestamp.getTime() - b.datetime.utc_timestamp.getTime();
      })

      let timelineList = [];
      let renderedDates = [];
      let i = 0;
      let n = 0;

      while ((n < 6) && (i < 6*5)) {
        let photoIndex = timeSortedPhotos.indexOf(sortedPhotos[i]);

        if (photoIndex > -1) {
          if(renderedDates.indexOf(timeSortedPhotos[photoIndex].datetime.utc_timestamp.toDateString()) < 0) {

            timelineList.push(<TinyTimeline key={timeSortedPhotos[photoIndex]._id._str + "_tinytimeline"} photos={timeSortedPhotos.slice(photoIndex-2, photoIndex+3)} highlightedPhoto={timeSortedPhotos[photoIndex]} />);
            renderedDates.push(timeSortedPhotos[photoIndex].datetime.utc_timestamp.toDateString());
            n = n + 1;
          }
        }

        i = i + 1;
      }

      return (
  			<div className="nearbyTimelines">
          <h2>Nearby images</h2>
          {timelineList}
        </div>);       
    } else {
      return (<div className="nearbyTimelines">
          <h2>Loading nearby timelines...</h2>
          </div>);
    }
  }
}
 
NearbyImages.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  photos: PropTypes.array.isRequired,
};