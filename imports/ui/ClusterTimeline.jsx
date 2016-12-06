import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters, Photos, LogicalImages} from '../api/photos.js';
import Cluster from './Cluster.jsx';
import ReactDOM from 'react-dom';
import PhotoFaces from './PhotoFaces.jsx';
import ClusterMap from './ClusterMap.jsx';

export class ClusterTimeline extends Component {

  constructor(props) {
    super(props);

    this.state = {
      zoomTo: -1
    }
  }

  // add state for zoomTo position
  // zoomTo = new prop on the ClusterMap

  handleScroll() {
    var scrollTop = $(window).scrollTop();
    var newZoomTo = Math.round(scrollTop/516);

    if (newZoomTo != this.state.zoomTo) {
      this.setState({zoomTo: newZoomTo});
      console.log(this.state);
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  render() {

 if (FlowRouter.subsReady()) {
    var photo_list = this.props.photos.map(function(img, i) {
      var t = new moment(img.datetime.utc_timestamp).utcOffset(img.datetime.tz_offset/60);
      var alternate_lists = [];

      if (img.all_photos.length > 0) {
        var alternate_lists = img.all_photos.map(function(img2) {
          return <PhotoFaces key={img2._id._str} photo={img2} displayDuplicates={false} size="320" />
        });
      }

      if (i == this.state.zoomTo) {
        var cluster_class = " highlighted";
      } else {
        var cluster_class = "";
      }

      console.log(img.geolocation);

      return (<div className={"cluster-debug-row" + cluster_class}>
          <div className="cluster-debug-info">
            <div className="cluster-debug-time">
              {t.format("h:mm:ss a dddd, MMM D YYYY")}
            </div>
            <div className="cluster-debug-faces">
              {img.openfaces.length} faces
            </div>
            <div className="cluster-debug-geo">
              {img.geolocation.results[1].formatted_address}
            </div>
          </div>

          <PhotoFaces photo={img} displayDuplicates={false} size="640" />

          <div className="cluster-debug-alternates">
            {alternate_lists}
          </div>
        </div>);
      }, this
    );

    if (this.props.cluster.length > 0) {
      var clustermap = (<ClusterMap cluster={this.props.cluster[0]} photos={this.props.photos} zoomTo={this.state.zoomTo} popup={true}/>);
    } else {
      var clustermap = [];
    }

   return (
    <div className="cluster-debug-timeline">
      <div className="cluster-debug-map">
        {clustermap}
      </div>
    {photo_list}
    </div>
    );
 } else {
  return <div className="loading">Loading</div>
 }
}

}

ClusterTimeline.propTypes = {
  photos: PropTypes.array.isRequired,
  cluster: PropTypes.object.isRequired
};

export default createContainer(() => {
  return {
    photos: LogicalImages.find({}).fetch(),
    cluster: Clusters.find({}).fetch()
  };

}, ClusterTimeline);
