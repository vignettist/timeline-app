import React, { Component, PropTypes } from 'react';
import { Map, Marker, Polyline, TileLayer } from 'react-leaflet';

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

export default class SingleImage extends Component {
  constructor(props) {
      super(props);
  }

  componentDidMount() {
    if ("topOffset" in this.props) {
      offset = this.props.topOffset - 100;
      $("html, body").animate({scrollTop: offset}, 500, "swing");
    }
  }

  render() {
    let offset=0;

    if ("topOffset" in this.props) {
      offset = this.props.topOffset - 100;
    }

    let positions = this.props.photos.map(function(img) {
      return ([img.latitude, img.longitude]);
    })

    positions = positions.filter(function(pos) {
      return ((pos[0] !== "null") && (pos[1] !== "null"));
    })

    return (
			<div className="highlightedImage">
        <div className="offset" style={{height: offset}}>
        </div>
        <ReactCSSTransitionGroup transitionName="fade" transitionAppear={true} transitionEnterTimeout={2000} transitionLeaveTimeout={2000}>

        <div className="bigImage">
            <img key={this.props.photo._id + "_img"} src={"http://localhost:3022/" + this.props.photo.resized_uris["1280"]} />
        </div> 
        <div className="timelineMap">
          <Map key={this.props.photo._id + "_map"} center={[this.props.photo.latitude, this.props.photo.longitude]} zoom={13}>
            <TileLayer
              url='http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
              attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              subdomains='abcd'
            />
            <Marker position={[this.props.photo.latitude, this.props.photo.longitude]}>
            <Polyline positions={positions} />
            </Marker>
          </Map>
        </div>
        </ReactCSSTransitionGroup>

      </div>);       
  }
}
 
SingleImage.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photo: PropTypes.object.isRequired,
  topOffset: PropTypes.number.isOptional,
  photos: PropTypes.array.isRequired,
};