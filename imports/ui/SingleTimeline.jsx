import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
 
import { Photos, NearbyPhotos } from '../api/photos.js';

import Timeline from './Timeline.jsx';
import SingleImage from './SingleImage.jsx';
import NearbyImages from './NearbyImages.jsx';


var DatePicker = require('react-datepicker');

class SingleTimeline extends Component {
  constructor(props) {
    super(props);
  }

  goBack() {
    FlowRouter.go('/timeline/' + this.format('YYYY-MM-DD'))
  }

  // componentDidMount() {
  //   console.log("componentdidMount");
  //   let positionOffset = $("#" + highlightedImage._id._str + "_img_id").offset();
  //   console.log(positionOffset);
  // }

  render() {
    let targetId = this.props.imageId;

    let highlightedImage = this.props.photos.filter(function filter(img) {
      return (img._id._str == targetId._str);
    });
    if (highlightedImage.length > 0) {

      highlightedImage = highlightedImage[0];
      
      var targetDate = moment(highlightedImage.datetime.utc_timestamp);
      targetDate.hour(0);
      targetDate.minute(0);
      targetDate.second(1);

      var bound2 = targetDate;
      var bound3 = moment(targetDate.valueOf() + 1000*60*60*24);
      let topOffset = parseInt(FlowRouter.getQueryParam("top"));

      return (
        <div className="container">
          <header>
            <h1>Timeline</h1>
            <div className="pagination">
              <button className="left" onClick={this.goBack.bind(targetDate)}>
                <img src="/icons/back.png" />
              </button>
            </div>
          </header>
          <main>
            <div className="timelines">
              <span>
                <Timeline key={bound2.valueOf()} photos={this.props.photos} startDate={bound2} endDate={bound3} />
                <SingleImage key={highlightedImage._id + "_bigimg"} photo={highlightedImage} photos={this.props.photos} topOffset={topOffset}/>
                <NearbyImages key={highlightedImage._id + "_nearbyimg"} photo={highlightedImage} photos={this.props.photosNearby} />
              </span>
            </div>
          </main>
        </div>
      );
    } else {
      console.log('waiting');
      return(<div></div>);
    }

  }
}

SingleTimeline.propTypes = {
  photos: PropTypes.array.isRequired,
  imageId: PropTypes.object.isRequired,
  photosNearby: PropTypes.array.isRequired,
};
 
export default createContainer(({ imageId }) => {
  if (FlowRouter.subsReady("single_photo")) {
    photo = Photos.find({'_id': imageId}).fetch();

    let photoLat = photo[0].latitude;
    let photoLon = photo[0].longitude;
    var nearbyPhotos = Photos.find({'latitude': {$gte: photoLat-0.05, $lt: photoLat+0.05}, 'longitude': {$gte: photoLon-0.05, $lt: photoLon+0.05}}).fetch();

    let photoDate = photo[0].datetime.utc_timestamp;
    let startDate = new Date(photoDate.getTime() - 2*1000*60*60*24);
    let endDate = new Date(photoDate.getTime() + 3*1000*60*60*24);
    var neartimePhotos = Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}}).fetch();

    return {
      photos: neartimePhotos,
      // we only want nearby photos that aren't already in the neartime selection
      photosNearby: nearbyPhotos.filter(function(nearbyPhoto) {
        return (neartimePhotos.map(function(neartimePhoto) {
          return neartimePhoto._id._str;
        }).indexOf(nearbyPhoto._id._str) < 0)
      }),
    };
  } else {
    return {
      photos: Photos.find({}).fetch(),
      photosNearby: Photos.find({}).fetch(),
    }
  }

}, SingleTimeline);