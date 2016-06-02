import React, { Component, PropTypes } from 'react';

import Spacer from './Spacer.jsx';
import Photo from './Photo.jsx';

// Task component - represents a single todo item
export default class Timeline extends Component {
  render() {
    let imageList = [];

    let startDate = this.props.startDate;
    let endDate = this.props.endDate;

    let ourPhotos = this.props.photos.filter(function BetweenDates(photo) {
      return ((photo.datetime.utc_timestamp >= startDate) && (photo.datetime.utc_timestamp  < endDate))
    });

    function probability_of_duplicate(similarity, time_delay) {
      // magic numbers are a logistic regression to the training set
      p = math.exp(-3.5423 + 13.7986 * similarity + 0.1512 * time_delay) / (1 + math.exp(-3.5423 + 13.7986 * similarity + 0.1512 * time_delay))
      p = (1 - p);
      if (isNaN(p)) {
        p = 0;
      }
      return p;
    }

    function fingerprint_similarity(fingerprint1, fingerprint2) {
      return math.sqrt(math.sum(math.square(math.subtract(fingerprint1,fingerprint2))));
    }   

    let i = 0;

    while (i < (ourPhotos.length-1)) {
      let imgList = [];
      let dupe_prob = 1;

      if (i == 0) {
        imageList.push(
          <div key={startDate + "_init_time"} className="spacerText timelineStart">
            {moment(ourPhotos[0].datetime.utc_timestamp).utcOffset(ourPhotos[0].datetime.tz_offset/60).format("h:mm A")}
          </div>);
      }

      while ((dupe_prob > 0.2) && (i < ourPhotos.length-1)) {
        imgList.push(ourPhotos[i]);

        fingerprint_sim = fingerprint_similarity(ourPhotos[i+1].syntactic_fingerprint, ourPhotos[i].syntactic_fingerprint);
        time_delta = (Date.parse(ourPhotos[i+1].datetime.utc_timestamp) - Date.parse(ourPhotos[i].datetime.utc_timestamp))/1000;
        dupe_prob = probability_of_duplicate(fingerprint_sim, time_delta);

        i++;
      }

      let height = 0;

      if (i == ourPhotos.length-1) {
        imgList.push(ourPhotos[i]);
      } else {
        height = Math.max(5, 8*Math.log2((ourPhotos[i].datetime.utc_timestamp - ourPhotos[i-1].datetime.utc_timestamp)/1000));
      }

      let timestamp = moment(ourPhotos[i].datetime.utc_timestamp).utcOffset(ourPhotos[i].datetime.tz_offset/60);

      imageList.push(
          <div key={imgList[0]._id + "_wrapper"} className="photoBlock">
            <Photo key={imgList[0].id + "_photoBlock"} photos={imgList} size={"640"}/>
            {(height > 0) ? <Spacer key={ourPhotos[i]._id + "_spacer"} height={height} date={timestamp} /> : ''}
          </div>
      );
    }

    return (
      <div className="timeline">
        <h2>{this.props.startDate.format("ddd, MMM Do YYYY")}</h2>
        {imageList}
      </div>
    );
  }
}
 
Timeline.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photos: PropTypes.array.isRequired,
  startDate: PropTypes.object.isRequired,
  endDate: PropTypes.object.isRequired,
};
