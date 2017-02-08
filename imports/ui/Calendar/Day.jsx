import React, { Component, PropTypes } from 'react';

export default class Day extends Component {
  goToTimeline() {
    FlowRouter.go('/timeline/' + this.props.date.format('YYYY-MM-DD'))
  }

  render() {
    let numPhotos = this.props.photos.length;

    let places = [];

    for (var i = 0; i < numPhotos; i++) {
      let geolocation = this.props.photos[i].geolocation.results;

      if (geolocation.length > 0) {
        for (var j = 0; j < geolocation[0].address_components.length; j++) {
          if (geolocation[0].address_components[j].types[0] == "locality") {
            places.push(geolocation[0].address_components[j].long_name);
          }
        }
      }

    }

    places = _.uniq(places);
    let intensity = "";

    if (numPhotos == 0) {
      intensity = "empty";
    } else if (numPhotos < this.props.total_num_photos/60) {
      intensity = "light";
    } else if (numPhotos < this.props.total_num_photos/30) {
      intensity = "moderate";
    } else if (numPhotos < this.props.total_num_photos/15) {
      intensity = "high";
    } else {
      intensity = "extreme";
    }

    return(
      <span key={this.props.date.toString()} className={"day " + intensity  + (this.props.isToday ? " today" : "") + (this.props.isCurrentMonth ? "" : " different-month")} onClick={this.goToTimeline.bind(this)}>
        {this.props.number}
        <ul>
          {places.map(function(place) {
            return (<li>{place}</li>);
          }, this)}
        </ul>
      </span>
    );
  }
}
 
Day.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  date: PropTypes.object.isRequired,
  isToday: PropTypes.bool.isRequired,
  isCurrentMonth: PropTypes.bool.isRequired,
  number: PropTypes.number.isRequired,
  photos: PropTypes.array.isRequired,
  total_num_photos: PropTypes.number.isRequired
};
