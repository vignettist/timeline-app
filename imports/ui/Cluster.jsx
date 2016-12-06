import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters} from '../api/photos.js';
import ClusterMap from './ClusterMap.jsx';

export default class Cluster extends Component {

       

  render() {
    if (this.props.cluster.photos.length > 1) {

      var best_images = this.props.photos.sort(function(a,b) {
        return (a.interest_score < b.interest_score);
      }).slice(0,3);

      var render_images = best_images.map(function(img) {
        return(<img src={'http://localhost:3022/' + img.resized_uris["320"]} />
          );
      });

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
          <div className="cluster-num-photos">
            {this.props.cluster.photos.length} photos
          </div>
          {location_block}
        </div>
        <div className="cluster-images">
          {render_images}
        </div>
        <div className="cluster-map">
          <ClusterMap cluster={this.props.cluster} photos={this.props.photos}/>
        </div>
        </div>);
    } else {
      return <div style={{backgroundImage: 'url(http://localhost:3022/' + this.props.photos[0].resized_uris["320"] + ')'}}></div>;
    }

   }
 
}
 
Cluster.propTypes = {
  cluster: PropTypes.object.isRequired,
  photos: PropTypes.array.isRequired
};