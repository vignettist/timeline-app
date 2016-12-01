import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters, Photos} from '../api/photos.js';
import Cluster from './Cluster.jsx';
import ReactDOM from 'react-dom';
import PhotoFaces from './PhotoFaces.jsx';

export class ClusterTimeline extends Component {

  constructor(props) {
    super(props);
  }

  render() {
   
   console.log(this.props.photos);

   var photo_list = this.props.photos.map(function(img) {
    var t = new moment(img.datetime.utc_timestamp).utcOffset(img.datetime.tz_offset/60);
    console.log(img);

    return (<div className="cluster-debug-row">
      <div className="cluster-debug-info">
        <div className="cluster-debug-time">
          {t.format("h:mm:ss a dddd, MMM D YYYY")}
        </div>
        <div className="cluster-debug-faces">
          {img.openfaces.length} faces
        </div>
      </div>
      <PhotoFaces photo={img} displayDuplicates={false} size="640" />
    </div>);
   })

    return (
        <div className="cluster-debug-timeline">
          {photo_list}
        </div>
    );
  }

}
 
ClusterTimeline.propTypes = {
  // story_photos: PropTypes.array.isRequired,
  photos: PropTypes.array.isRequired
};

export default createContainer(() => {
  return {
    photos: Photos.find({}).fetch()
  };

}, ClusterTimeline);
