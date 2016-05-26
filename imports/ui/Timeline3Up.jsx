import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
 import { Photos } from '../api/photos.js';
import Timeline from './Timeline.jsx';

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

var DatePicker = require('react-datepicker');

class Timeline3Up extends Component {
  constructor(props) {
    super(props);

    this.state = {left: true};
  }

  // leaving these as separate functions for possibility of future animation?
  previousDate() {
    this.setState({left: true});


    let newDate = moment(this.props.date.valueOf() - 1000*60*60*24);

    FlowRouter.go('/timeline/' + newDate.format('YYYY-MM-DD'));
  }

  nextDate() {
    this.setState({left: false});

    let newDate = moment(this.props.date.valueOf() + 1000*60*60*24);

    FlowRouter.go('/timeline/' + newDate.format('YYYY-MM-DD'));
  }

  newDate(date) {
    FlowRouter.go('/timeline/' + date.format('YYYY-MM-DD'));
  }

  render() {
    var bound0 = moment(this.props.date.valueOf() - 2*1000*60*60*24);
    var bound1 = moment(this.props.date.valueOf() - 1000*60*60*24);
    var bound2 = this.props.date;
    var bound3 = moment(this.props.date.valueOf() + 1000*60*60*24);
    var bound4 = moment(this.props.date.valueOf() + 2*1000*60*60*24);
    var bound5 = moment(this.props.date.valueOf() + 3*1000*60*60*24);

    return (
      <div className="container">
        <header>
          <h1>Timeline</h1>
          <div className="pagination">
            <button className="left" onClick={this.previousDate.bind(this)}>
              <img src="/icons/left.png" />
            </button>
            <div className="datePicker">
              <DatePicker selected={this.props.date} onChange={this.newDate.bind(this)} popoverAttachment="top center" popoverTargetAttachment="bottom center" popoverTargetOffset="10px 0"/>
            </div>
            <button className="right" onClick={this.nextDate.bind(this)}>
              <img src="/icons/right.png" />
            </button>
          </div>
        </header>
        <main>
          <div className="timelines"> 
            <ReactCSSTransitionGroup ref="timelineTransitionGroup" transitionName={this.state.left ? "slide-left" : "slide-right"} transitionAppear={true} transitionEnterTimeout={500} transitionLeaveTimeout={500}>
              <Timeline key={bound1.valueOf()} photos={this.props.photos} startDate={bound1} endDate={bound2} />
              <Timeline key={bound2.valueOf()} photos={this.props.photos} startDate={bound2} endDate={bound3} />
              <Timeline key={bound3.valueOf()} photos={this.props.photos} startDate={bound3} endDate={bound4} />
            </ReactCSSTransitionGroup>
          </div>
        </main>
      </div>
    );
  }
}

Timeline3Up.propTypes = {
  photos: PropTypes.array.isRequired,
  date: PropTypes.object.isRequired
};
 
export default createContainer(() => {
  return {
    photos: Photos.find({}).fetch(),
  };

}, Timeline3Up);