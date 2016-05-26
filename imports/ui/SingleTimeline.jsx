import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
 
import { Photos } from '../api/photos.js';

import Timeline from './Timeline.jsx';
import SingleImage from './SingleImage.jsx';

var DatePicker = require('react-datepicker');

class SingleTimeline extends Component {
  constructor(props) {
    super(props);
  }

  goBack() {
    FlowRouter.go('/timeline/' + this.format('YYYY-MM-DD'))
  }

  // componentDidMount() {
  //   console.log("componentdidMount");
  //   let positionOffset = $("#" + highlightedImage._id._str + "_img_id").offset();
  //   console.log(positionOffset);
  // }

  render() {
    let targetId = this.props.imageId;

    let highlightedImage = this.props.photos.filter(function filter(img) {
      return (img._id._str == targetId._str);
    });
    if (highlightedImage.length > 0) {

      highlightedImage = highlightedImage[0];
      
      var targetDate = moment(highlightedImage.datetime.utc_timestamp);
      targetDate.hour(0);
      targetDate.minute(0);
      targetDate.second(1);

      var bound2 = targetDate;
      var bound3 = moment(targetDate.valueOf() + 1000*60*60*24);
      let topOffset = parseInt(FlowRouter.getQueryParam("top"));

      return (
        <div className="container">
          <header>
            <h1>Timeline</h1>
            <div className="pagination">
              <button className="left" onClick={this.goBack.bind(targetDate)}>
                <img src="/icons/back.png" />
              </button>
            </div>
          </header>
          <main>
            <div className="timelines">
              <span>
                <Timeline key={bound2.valueOf()} photos={this.props.photos} startDate={bound2} endDate={bound3} />
                <SingleImage key={highlightedImage._id + "_bigimg"} photo={highlightedImage} topOffset={topOffset}/>
              </span>
            </div>
          </main>
        </div>
      );
    } else {
      console.log('waiting');
      return(<div></div>);
    }

  }
}

SingleTimeline.propTypes = {
  photos: PropTypes.array.isRequired,
  imageId: PropTypes.object.isRequired
};
 
export default createContainer(() => {
  return {
    photos: Photos.find({}).fetch(),
  };

}, SingleTimeline);