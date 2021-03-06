import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters} from '../api/photos.js';
import ReactDOM from 'react-dom';
import { Map, Marker, Polyline, TileLayer, Polygon } from 'react-leaflet';
import {UserBar} from './UserBar.jsx';

var Slider = require('rc-slider');

export class ClusterOverview extends Component {

  constructor(props) {
    super(props);

    this.state = {
      startDate: new moment(new Date(2014, 10, 1, 0, 0, 0, 0)),
      date: new moment(new Date(2014, 10, 1, 0, 0, 0, 0)),
      mapBounds: [[-70, -180], [70, 180]]
    };
  }

  nextDate() {
    this.setState({date: this.state.date.add(1, 'd')});
  }

  setDate(val) {
    var date = new moment(this.props.clusters[0].start_time.utc_timestamp);
    date.add(val, 'd');

    this.setState({date: date});
  }

  formatDate(val, index) {
    var date = new moment(this.props.clusters[0].start_time.utc_timestamp);
    date.add(val, 'd');

    return date.format("MMM Do YYYY");
  }

  goTo(date) {
    console.log("goto");
    console.log(date);

    var d = new moment(date);
    FlowRouter.go('/clusters/' + d.format('YYYY-MM-DD'));
  }

  zoomAll() {
    this.setState({mapBounds: [[-70, -180], [70, 180]]});
  }

  zoomToClusters() {
    var bounds = [];

    for (var i = 0; i < this.props.clusters.length; i++) {
        var c = this.props.clusters[i];

        var start_time = new moment(c.start_time.utc_timestamp);
        var time_difference = moment.duration(start_time.diff(this.state.date));
        var opacity = Math.min(0.5, 24.0 / Math.abs(time_difference.asHours()));

        var reversed_coords = c.boundary.coordinates.map(function(co) {
          return [co[1], co[0]];
        });

        if (opacity > 0.2) {
          // find bounding box of convex hull
          var min = reversed_coords.reduce(function(b1, b2) {
            return [Math.min(b1[0], b2[0]), Math.min(b1[1], b2[1])];
          });

          var max = reversed_coords.reduce(function(b1, b2) {
            return [Math.max(b1[0], b2[0]), Math.max(b1[1], b2[1])];
          });

          bounds.push(max);
          bounds.push(min);
        }
      }

      if (bounds.length > 0) {
        boundsUpper = bounds.reduce(function(b1, b2) {
          return [Math.min(b1[0], b2[0]), Math.min(b1[1], b2[1])];
        });

        boundsLower = bounds.reduce(function(b1, b2) {
          return [Math.max(b1[0], b2[0]), Math.max(b1[1], b2[1])];
        });
      } else {
        boundsLower = [-70, -180];
        boundsUpper = [70, 180];
      }

      this.setState({mapBounds: [boundsLower, boundsUpper]});
  }

  argSort(test) {
    var len = test.length;
    var indices = new Array(len);
    for (var i = 0; i < len; ++i) indices[i] = i;
    indices.sort(function (a, b) { return test[a] < test[b] ? -1 : test[a] > test[b] ? 1 : 0; });
    return indices;
  }

  render() {
    var cluster_map_elements = [];

    if (FlowRouter.subsReady()) {
      var start_date = new moment(this.props.clusters[0].start_time.utc_timestamp);
      var end_date = new moment(this.props.clusters[this.props.clusters.length-1].start_time.utc_timestamp);
      var slider_length = Math.round(moment.duration(end_date.diff(start_date)).asDays());

      var bounds = [];
      var opacities = [];

      for (var i = 0; i < this.props.clusters.length; i++) {
        var c = this.props.clusters[i];

        var start_time = new moment(c.start_time.utc_timestamp);
        var time_difference = moment.duration(start_time.diff(this.state.date));
        var opacity = Math.min(0.5, 24.0 / Math.abs(time_difference.asHours()));
        opacities.push(opacity);
      }

      var sorted_order = this.argSort(opacities);

      for (var j = 0; j < this.props.clusters.length; j++) {
        var i = sorted_order[j];

        var c = this.props.clusters[i];

        var start_time = new moment(c.start_time.utc_timestamp);
        var time_difference = moment.duration(start_time.diff(this.state.date));
        var opacity = Math.min(0.5, 24.0 / Math.abs(time_difference.asHours()));
        opacities.push(opacity);

        var reversed_coords = c.boundary.coordinates.map(function(co) {
          return [co[1], co[0]];
        });

        if (opacity > 0.1) {
          cluster_map_elements.push(<Polygon key={c._id._str + "_polygon"} positions={reversed_coords} color="#000000" weight={1} fillColor="#0000FF" fillOpacity={opacity} opacity={opacity+0.2} onClick={this.goTo.bind(this, c.start_time.utc_timestamp)} />);
        } else {
          cluster_map_elements.push(<Polygon key={c._id._str + "_polygon"} positions={reversed_coords} color="#000000" weight={1} fillColor="#0000FF" fillOpacity={opacity} opacity={opacity+0.2} />);
        }

        if (i < this.props.clusters.length-1) {
          cluster_map_elements.push(<Polyline
            key={c._id._str + "_polyline"}
            positions={[[this.props.clusters[i].centroid.coordinates[1], this.props.clusters[i].centroid.coordinates[0]], [this.props.clusters[i+1].centroid.coordinates[1], this.props.clusters[i+1].centroid.coordinates[0]]]} 
            opacity={opacity} />);
        }
      }

      return <div className="overview">
            <UserBar />
            <div className="overview-map">
              <Map key="cluster-overview-map" bounds={this.state.mapBounds}>
                <TileLayer
                  url = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
                  subdomains='abcd'
                />
                {cluster_map_elements}
              </Map>
            </div>
            <div className="overview-controls">
              <div className="overview-slider">
                <div className="start-date">
                  {start_date.format("MMM Do YYYY")}
                </div>
                <Slider key="cluster-overview-slider" onChange={this.setDate.bind(this)} max={slider_length} tipFormatter={this.formatDate.bind(this)}/>
                <div className="end-date">
                  {end_date.format("MMM Do YYYY")}
                </div>
                <div className="buttons">
                  <button onClick={this.zoomToClusters.bind(this)} >
                    <img src="/icons/Collapse-52.png" title="Zoom in to highlighted areas"/>
                  </button>
                  <button onClick={this.zoomAll.bind(this)} >
                    <img src="/icons/Expand-52.png" title="Zoom out to all" />
                  </button>
                </div>
              </div>
              </div>
            </div>

    } else {
      return <div className="overview">
        <UserBar />
        <div className="loading">Loading</div>
        </div>
    }
  }
}
 
ClusterOverview.propTypes = {
  clusters: PropTypes.array.isRequired
};

export default createContainer(() => {
  return {
    clusters: Clusters.find({}, {sort: {"start_time.utc_timestamp": 1}}).fetch()
  };

}, ClusterOverview);
