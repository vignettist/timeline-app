import React, { Component, PropTypes } from 'react';

import Spacer from './Spacer.jsx';
import PhotoFaces from './PhotoFaces.jsx';

// Task component - represents a single todo item
export default class TimelineNoDupes extends Component {
  render() {
    let imageList = [];

    let startDate = this.props.startDate;
    let endDate = this.props.endDate;

    let ourPhotos = this.props.photos.filter(function BetweenDates(photo) {
      return ((photo.datetime.utc_timestamp >= startDate) && (photo.datetime.utc_timestamp  < endDate))
    });

    imageList = ourPhotos.map(function(obj) {
      return (<div key={obj._id + "_wrapper"} className="photoBlock">
            <PhotoFaces key={obj._id + "_photoBlock"} photo={obj} size={"640"} displayDuplicates={true}/>
          </div>);
    })

    return (
      <div className="timeline">
        <h2>{this.props.startDate.format("ddd, MMM Do YYYY")}</h2>
        {imageList}
      </div>
    );
  }
}
 
TimelineNoDupes.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photos: PropTypes.array.isRequired,
  startDate: PropTypes.object.isRequired,
  endDate: PropTypes.object.isRequired,
};
