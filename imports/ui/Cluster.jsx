import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters} from '../api/photos.js';
import ClusterMap from './ClusterMap.jsx';

export default class Cluster extends Component {

       

  render() {

    if (this.props.cluster.times.length > 1) {
      var location_text = [];

      if (this.props.cluster.location.length > 1) {
        if (this.props.cluster.location[0].length > 1) {
          this.props.cluster.location.slice(0,-1).map(function(l, i) {
            if (i == 0) {
              location_text.push(<span className="location"><a href="#">{l}</a></span>)
            } else {
              location_text.push(<span className="location">, <a href="#">{l}</a></span>)
            }
          });

          location_text.push(<span className="location"> and <a href="#">{this.props.cluster.location.slice(-1,this.props.cluster.location.length)}</a></span>)
        } else {
          location_text.push(<span className="location"><a href="#">{this.props.cluster.location}</a></span>);
        }
      }

      if (location_text.length > 0) {
        var location_block = (<div className="cluster-location">in {location_text}</div>);
      } else {
        var location_block = [];
      }

      return (<div className="cluster">
        <div className="cluster-description">

          {location_block}
        </div>
        <div className="cluster-images">
        </div>
        <div className="cluster-map">
        </div>
        </div>);   

    } else {
      return <div></div>
    }
 
}
}
 
Cluster.propTypes = {
  cluster: PropTypes.object.isRequired,
};