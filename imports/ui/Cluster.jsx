import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters} from '../api/photos.js';
import ClusterMap from './ClusterMap.jsx';

export default class Cluster extends Component {

  render() {
          console.log(this.props.cluster['_id']);

    if (this.props.photos.length > 1) {

      var cluster = this.props.cluster;

      var render_images = this.props.photos.map(function(img,i) {
        return(<img key={cluster._id._str + "_photo_" + i} src={'http://localhost:3022/' + Meteor.user().username + '/' + img.resized_uris["320"]} />
          );
      });

      var location_text = [];

      if (this.props.cluster.location.length > 1) {
        if (this.props.cluster.location[0].length > 1) {
          this.props.cluster.location.slice(0,-1).map(function(l, i) {
            if (i == 0) {
              location_text.push(<span key={"location" + this.props.cluster._id._str + i} className="location"><a href="#">{l}</a></span>)
            } else {
              location_text.push(<span key={"location" + this.props.cluster._id._str + i} className="location">, <a href="#">{l}</a></span>)
            }
          }, this);

          location_text.push(<span key={"location" + this.props.cluster._id._str + "last"} className="location"> and <a href="#">{this.props.cluster.location.slice(-1,this.props.cluster.location.length)}</a></span>)
        } else {
          location_text.push(<span key={"location" + this.props.cluster._id._str} className="location"><a href="#">{this.props.cluster.location}</a></span>);
        }
      }

      if (location_text.length > 0) {
        var location_block = (<div key="location-end-block" className="cluster-location">in {location_text}</div>);
      } else {
        var location_block = [];
      }

      if ('title' in this.props.cluster) {
        var title = <div className="cluster-title">
            "{this.props.cluster.title}"
           </div>;
      } else {
        var title = [];
      }

      var cluster_icons = [];

      if ('conversation_id' in this.props.cluster) {
        cluster_icons.push(<img src="/icons/chat.png" />);
      }

      return (<div className="cluster">
        <div className="cluster-icons">
          { cluster_icons }
        </div>
        <div className="cluster-description">
          {title}
          <div className={"cluster-num-photos" + ('title' in this.props.cluster ? " small" : "")} >
            {this.props.cluster.photos.length} photos<br />
            {Math.round(this.props.cluster.distance)} kilometers
          </div>
          {location_block}
        </div>
        <div className="cluster-images">
          {render_images}
        </div>
        <div className="cluster-map">
          <ClusterMap cluster={this.props.cluster} photos={this.props.photos} offset={true} height={this.props.height} width={this.props.width}/>
        </div>
        <div className="cluster-overlay">
        </div>
        </div>);
    } else {
      return <div style={{backgroundImage: 'url(http://localhost:3022/' + Meteor.user().username + '/' + this.props.photos[0].resized_uris["320"] + ')'}}></div>;
    }
  }
}
 
Cluster.propTypes = {
  cluster: PropTypes.object.isRequired,
  photos: PropTypes.array.isRequired,
  height: PropTypes.number,
  width: PropTypes.number
};