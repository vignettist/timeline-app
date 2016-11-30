import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters, Photos} from '../api/photos.js';
import Cluster from './Cluster.jsx';
import ReactDOM from 'react-dom';

export class ClusterTimeline extends Component {

  constructor(props) {
    super(props);
  }

  render() {
   
   console.log(this.props.photos);

   var photo_list = this.props.photos.map(function(img) {
    var t = new moment(img.datetime.utc_timestamp).utcOffset(img.datetime.tz_offset/60);

    return (<div class="cluster-debug-row">
      <div class="cluster-debug-image">
        <img src={'http://localhost:3022/' + img.resized_uris['640']} />
      </div>
      <div class="cluster-debug-time">
        {t.format("h:mm:ss a dddd, MMM D YYYY")}
        H: {t.hour()}
      </div>
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
