import React, { Component, PropTypes } from 'react';
 
import Spacer from './Spacer.jsx';
import Photo from './Photo.jsx';

// Task component - represents a single todo item
export default class Timeline extends Component {
  render() {
    let imageList = [];

    let startDate = this.props.startDate;
    let endDate = this.props.endDate;

    let ourPhotos = this.props.photos.filter(function BetweenDates(photo) {
      return ((photo.time >= startDate) && (photo.time < endDate))
    });

    for (let i = 0; i < ourPhotos.length; i++) {
      if (i < (ourPhotos.length-1)) {
        let height = Math.max(5, 8*Math.log2((ourPhotos[i+1].time - ourPhotos[i].time)/1000));

        imageList.push(
          <div key={ourPhotos[i]._id + "_wrapper"} className="photoBlock">
            <Photo key={ourPhotos[i]._id + "_img"} photo={ourPhotos[i]} />
            <Spacer key={ourPhotos[i]._id + "_spacer"} height={height} date={ourPhotos[i].time} />
          </div>
        );
      } else {
        imageList.push(<Photo key={ourPhotos[i]._id} photo={ourPhotos[i]} />)
      }
    }

    return (
      <div className="timeline">
        <h2>{this.props.startDate.format("ddd, MMM Do YYYY")}</h2>
        {imageList}
      </div>
    );
  }
}
 
Timeline.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photos: PropTypes.array.isRequired,
  startDate: PropTypes.object.isRequired,
  endDate: PropTypes.object.isRequired,
};
