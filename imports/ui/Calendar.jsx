import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Day from './Day.jsx';
import { Photos } from '../api/photos.js';

var DayNames = React.createClass({
    render: function() {
        return <div className="week names">
            <span className="day">Sun</span>
            <span className="day">Mon</span>
            <span className="day">Tue</span>
            <span className="day">Wed</span>
            <span className="day">Thu</span>
            <span className="day">Fri</span>
            <span className="day">Sat</span>
        </div>;
    }
});

var Week = React.createClass({
    render: function() {
        var days = [],
            date = this.props.date,
            month = this.props.month;

        for (var i = 0; i < 7; i++) {
            let startDate = date.clone().startOf("day");
            let endDate = date.clone().add(1,"d").startOf("day");

            let days_photos = this.props.photos.filter(function(value) {
              let timestamp = moment(value.datetime.utc_timestamp).utcOffset(value.datetime.tz_offset/60);
              return (timestamp > startDate) && (timestamp < endDate);
            })


            days.push(<Day name={date.format("dd").substring(0, 1)} number={date.date()} isCurrentMonth={date.month() == month.month()} isToday={date.isSame(new Date(), "day")} date={date} photos={days_photos} total_num_photos={this.props.photos.length}/>);
            date = date.clone();
            date.add(1, "d");

        }

        return <div className="week" key={days[0].toString()}>
            {days}
        </div>
    }
});

export default class Calendar extends Component {
  previous() {
    FlowRouter.go('/calendar/' + this.props.date.add(-1, "M").format('YYYY-MM-DD'));
  }

  next() {
    FlowRouter.go('/calendar/' + this.props.date.add(+1, "M").format('YYYY-MM-DD'));
  }

  render() {
    if (FlowRouter.subsReady()) {
      return <div className="bigCalendarWrapper">
          <div className="bigCalendar">
          <div className="header">
              <button className="left" onClick={this.previous.bind(this)}>
                <img src="/icons/left.png" />
              </button>
              {this.renderMonthLabel()}
              <button className="right" onClick={this.next.bind(this)}>
              <img src="/icons/right.png" />
            </button>
          </div>
          <DayNames />
          {this.renderWeeks()}
      </div></div>;
    } else {
      return <div className="bigCalendarWrapper">Loading</div>
    }
  }

  renderWeeks() {
      var weeks = [],
          done = false,
          date = this.props.date.clone().startOf("month").day("Sunday"),
          monthIndex = date.month(),
          count = 0;

      while (!done) {
          weeks.push(<Week key={date.toString()} date={date.clone()} month={this.props.date} photos={this.props.months_photos}/>);
          date.add(1, "w");
          done = count++ > 2 && monthIndex !== date.month();
          monthIndex = date.month();
      }

      return weeks;
  }

  renderMonthLabel() {
      return <span>{this.props.date.format("MMMM, YYYY")}</span>;
  }
}
 
Calendar.propTypes = {
  date: PropTypes.object.isRequired,
  months_photos: PropTypes.array.isRequired,
};

export default createContainer(() => {
  return {
    months_photos: Photos.find({}).fetch(),
  };

}, Calendar);
