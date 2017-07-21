import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters, Photos, LogicalImages} from '../api/photos.js';
import Cluster from './Cluster.jsx';
import ReactDOM from 'react-dom';
import DateBlock from './DateBlock.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';
import UserBar from './UserBar.jsx';

var DatePicker = require('react-datepicker');

export class ClusterCalendar extends Component {

  constructor(props) {
    super(props);

    this.handleScroll = this.handleScroll.bind(this);
    this.initial_mouse_pos = 0;
    this.initial_cluster_style = [];

    this.state = {
    };
  }

  previous() {
    FlowRouter.go('/clusters/' + this.props.date.add(-1, "d").format('YYYY-MM-DD'));
  }

  next() {
    FlowRouter.go('/clusters/' + this.props.date.add(+1, "d").format('YYYY-MM-DD'));
  }

  previousMonth() {
    FlowRouter.go('/clusters/' + this.props.date.add(-1, "month").format('YYYY-MM-DD'));
  }

  nextMonth() {
    FlowRouter.go('/clusters/' + this.props.date.add(+1, "month").format('YYYY-MM-DD'));
  }

  newDate(date) {
    FlowRouter.go('/clusters/' + date.format('YYYY-MM-DD'));
  }

  renderMonthLabel() {
    return this.props.date.format("MMMM YYYY")
  }

  handleScroll(event, template) {
    var scrollTop = $(window).scrollTop();

    if (scrollTop < window.innerHeight * 0.25) {
      window.scrollTo(0, scrollTop + 0.2 * window.innerHeight);
      this.previous();
    }

    if (scrollTop > window.innerHeight * .55) {
      window.scrollTo(0, scrollTop - 0.2 * window.innerHeight);
      this.next();
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    window.scrollTo(0, window.innerHeight*0.4);
  }

  goToCluster(e) {
    window.removeEventListener('scroll', this.handleScroll);
    FlowRouter.go('/conversation/' + e._id._str);
  }

  getHeightAndTop(e) {
    var start_date = this.props.date;

    var local_start = new moment(e.start_time.utc_timestamp).utcOffset(e.start_time.tz_offset/60);
    var local_end = new moment(e.end_time.utc_timestamp).utcOffset(e.end_time.tz_offset/60);

    var local_display_start = start_date.clone().utcOffset(e.start_time.tz_offset/60);

    var cluster_height = local_end.unix() - local_start.unix();
    cluster_height /= (60*60*24*5);
    cluster_height *= 100;

    // have to manually correct for time zones
    var top = local_start.unix() - local_display_start.clone().subtract(4, 'days').unix() + e.start_time.tz_offset;
    top /= (60*60*24);

    top *= 20;

    var zindex = (400 - (new moment(e.start_time.utc_timestamp).dayOfYear()))*24 - new moment(e.start_time.utc_timestamp).hour();

    return {height: cluster_height, top: top, zindex: zindex};
  }

  dragTop(cluster, event) {
    var mousePos = event.clientY + $(window).scrollTop();
    var mouseDiff = mousePos - this.initial_mouse_pos;

    var ght = this.getHeightAndTop(cluster);
    // console.log(ght);
    // var parent_height = this.clusters.clientHeight;
    var parent_height = $(window).height();
    var initial_top = parent_height * ght.top/100 - 10 + $(window).scrollTop();

    if ((mousePos < initial_top) && (mousePos > 0)) {
      this[cluster._id._str].style.top = "calc(" + ght.top.toString() + "vh - 10px + " + (mouseDiff).toString() + "px)";
      this[cluster._id._str].style.height = "calc(" + ght.height.toString() + "vh + 13px + " + (-mouseDiff).toString() + "px)"; 
      this[cluster._id._str].style.zIndex = 100000;
    }
  }

  dragTopStart(cluster, event) {
    this.initial_mouse_pos = event.clientY + $(window).scrollTop();
    var img = document.createElement("img");
    img.src = "/transparent.png";
    event.dataTransfer.setDragImage(img, 0, 0);
  }

  dragTopEnd(cluster, event) {
    var finalMousePos = event.clientY + $(window).scrollTop();
    var ght = this.getHeightAndTop(cluster);
    var parent_height = $(window).height();
    var initial_height = Math.max(100, parent_height * ght.height/100 + 13);
    var initial_top = parent_height * ght.top/100 - 10;

    var clusters_to_merge = [];

    for (var i = 0; i < this.props.clusters.length; i++) {
      var comparison_ght = this.getHeightAndTop(this.props.clusters[i]);

      var comparison_height = parent_height * comparison_ght.height/100 + 13;
      var comparison_top = parent_height * comparison_ght.top/100 - 10;
      var comparison_value = comparison_height/2 + comparison_top;

      if ((comparison_value < initial_top) && (comparison_value > finalMousePos)) {
        clusters_to_merge.push(this.props.clusters[i]._id._str);
      }
    }

    if (clusters_to_merge.length > 0) {
      clusters_to_merge.push(cluster._id._str);
      Meteor.call('clusters.mergeClusters', clusters_to_merge);
    }
    
    this[cluster._id._str].style.top = "calc(" + ght.top.toString() + "vh - 10px)";
    this[cluster._id._str].style.height = "calc(" + ght.height.toString() + "vh + 13px)"; 
    this[cluster._id._str].style.zIndex = ght.zindex;
  }

  dragBottom(cluster, event) {
    var mousePos = event.clientY + $(window).scrollTop();
    var mouseDiff = mousePos - this.initial_mouse_pos;

    var ght = this.getHeightAndTop(cluster);
    var parent_height = $(window).height();
    var initial_height = Math.max(100, parent_height * ght.height/100 + 13);
    var initial_bottom = parent_height * ght.top/100 - 10 + initial_height;

    // if ((mousePos > initial_bottom) && (mousePos < (parent_height + $(window).scrollTop))) {
    if (mouseDiff > 0) {
      this[cluster._id._str].style.height = "calc(" + ght.height.toString() + "vh + 13px + " + (mouseDiff).toString() + "px)"; 
      this[cluster._id._str].style.zIndex = 100000;
    }
  }

  dragBottomStart(cluster, event) {
    this.initial_mouse_pos = event.clientY + $(window).scrollTop();
    var img = document.createElement("img");
    img.src = "/transparent.png";
    event.dataTransfer.setDragImage(img, 0, 0);
  }

  dragBottomEnd(cluster, event) {
    console.log("dragBottomEnd");

    var finalMousePos = event.clientY + $(window).scrollTop();
    var ght = this.getHeightAndTop(cluster);
    var parent_height = $(window).height();
    var initial_height = Math.max(100, parent_height * ght.height/100 + 13);
    var initial_bottom = parent_height * ght.top/100 - 10 + initial_height;

    var clusters_to_merge = [];

    for (var i = 0; i < this.props.clusters.length; i++) {
      var comparison_ght = this.getHeightAndTop(this.props.clusters[i]);

      var comparison_height = parent_height * comparison_ght.height/100 + 13;
      var comparison_top = parent_height * comparison_ght.top/100 - 10;
      var comparison_value = comparison_height/2 + comparison_top;

      if ((comparison_value > initial_bottom) && (comparison_value < finalMousePos)) {
        clusters_to_merge.push(this.props.clusters[i]._id._str);
      }
    }

    if (clusters_to_merge.length > 0) {
      clusters_to_merge.push(cluster._id._str);
      Meteor.call('clusters.mergeClusters', clusters_to_merge);
    }
    
    this[cluster._id._str].style.top = "calc(" + ght.top.toString() + "vh - 10px)";
    this[cluster._id._str].style.height = "calc(" + ght.height.toString() + "vh + 13px)"; 
    this[cluster._id._str].style.zIndex = ght.zindex;
  }

  render() {
    console.log("re-rendering");
    console.log(this.props.clusters);

    var timespans = this.props.clusters.map(function(e) {
      var ght = this.getHeightAndTop(e);
      var cluster_height = ght.height;
      var top = ght.top;
      var zindex = ght.zindex;
      
      if (cluster_height > 0) {
        var event_styles = {height: "calc(" + cluster_height.toString() + "vh + 13px)", top: "calc(" + top.toString() + "vh - 10px)", zIndex: zindex};
      } else {
        var event_styles = {top: "calc(" + top.toString() + "% - 50px)", zIndex: zindex};
      }

      console.log(event_styles)
      if (e.photos.length > 1) {
        // This should be its own react component
        return (
          <div key={e._id._str}>
          <div className="event" style={event_styles} onClick={() => this.goToCluster.bind(this)(e)} ref={(input) => { this[e._id._str] = input; }}>
            <Cluster cluster={e} photos={e.top_images} width={window.innerWidth * 0.8} height={window.innerHeight * cluster_height / 100}/>
            <div className="cluster-top-dragger" draggable="true" onDrag={this.dragTop.bind(this, e)} onDragStart={this.dragTopStart.bind(this, e)} onDragEnd={this.dragTopEnd.bind(this, e)} ></div>
            <div className="cluster-bottom-dragger" draggable="true" onDrag={this.dragBottom.bind(this, e)} onDragStart={this.dragBottomStart.bind(this, e)} onDragEnd={this.dragBottomEnd.bind(this, e)}></div>
          </div>
          </div>);
      } else {
        return (<div key={e._id._str} >
          <div className="event-singleton" style={event_styles}>
            <Cluster cluster={e} photos={e.top_images}/>
          </div>
          </div>)
      }
    }, this);

    var date_grid = [];

    for (var i = -4; i <= 4; i++) {
      if (i < 0) {
        var modified_date = this.props.date.clone().subtract(math.abs(i), 'days');
      } else {
        var modified_date = this.props.date.clone().add(i ,'days');
      }

      // this should be its own react component
      // if (i == -2) {
      //   var addClass = "first";
      // } else {
        var addClass = "";
      // }

      date_grid.push(<DateBlock addClass={addClass} date={modified_date} />);
    }

    var CalendarButton = React.createClass({
      displayName: "ExampleCustomInput" ,
      propTypes: {
        onClick: React.PropTypes.func,
        value: React.PropTypes.string
      },
      render () {
        return (
          <button
          className="calendar-button-input"
          onClick={this.props.onClick}>
          <img src="/icons/Calendar-64.png" />
          </button>
        )
      }
    });

    return (
        <div className="cluster-root">
          <UserBar />
          <div className="nav">
            <div className="top">
              <button className="up" onClick={this.previousMonth.bind(this)}>
                <img src="/icons/doubleup.png" />
                <span className="hide">Previous month</span>
              </button>
              <button className="up" onClick={this.previous.bind(this)}>
                <img src="/icons/up.png" />
                <span className="hide">Previous day</span>
              </button>
            </div>
            <div className="middle">
              <DatePicker customInput={<CalendarButton />} selected={this.props.date} onChange={this.newDate.bind(this)} popoverAttachment="middle right" popoverTargetAttachment="middle left" popoverTargetOffset="0px 0px" forceShowMonthNavigation="true" />
            </div>
            <div className="bottom">
              <button className="down" onClick={this.next.bind(this)}>
                <img src="/icons/down.png" />
                <span className="hide">Next day</span>
              </button>
              <button className="down" onClick={this.nextMonth.bind(this)}>
                <img src="/icons/doubledown.png" />
                <span className="hide">Next month</span>
              </button>
            </div>
          </div>
          <div className="weekdays" ref={(input) => this.clusters = input}>
            <div className="grid">{date_grid}</div>
            <div key="clusters">{timespans}</div>
          </div>
        </div>
    );
  }

}
 
ClusterCalendar.propTypes = {
  clusters: PropTypes.array.isRequired,
  date: PropTypes.object.isRequired
  // photos: PropTypes.array.isRequired
};

export default createContainer(() => {
  return {
    clusters: Clusters.find({}).fetch()
    // photos: LogicalImages.find({}).fetch()
  };

}, ClusterCalendar);
