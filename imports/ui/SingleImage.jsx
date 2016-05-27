import React, { Component, PropTypes } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

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

    console.log(this.props.photo.longitude);
    console.log([this.props.photo.latitude, this.props.photo.longitude])
// 
    return (
			<div className="highlightedImage">
        <div className="offset" style={{height: offset}}>
        </div>
        <ReactCSSTransitionGroup transitionName="fade" transitionAppear={true} transitionEnterTimeout={2000} transitionLeaveTimeout={2000}>

        <div className="bigImage">
            <img key={this.props.photo._id + "_img"} src={"http://localhost:3022/" + this.props.photo.resized_uris["1280"]} />
        </div> 
        <div className="timelineMap">
          <Map key={this.props.photo._id + "_map"} center={[this.props.photo.latitude, this.props.photo.longitude]} zoom={12}>
            <TileLayer
              url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[this.props.photo.latitude, this.props.photo.longitude]}>

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