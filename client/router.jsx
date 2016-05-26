import {mount} from 'react-mounter';
import Timeline3Up from '../imports/ui/Timeline3Up.jsx';
import SingleTimeline from '../imports/ui/SingleTimeline.jsx';


FlowRouter.route('/', {
  action() {
    FlowRouter.go('/timeline/2015-01-01');
  }
});

FlowRouter.route('/timeline/:date', {
	name: 'timeline',
	subscriptions: function(params) {
		let startDate = new Date(params.date);
		let endDate = new Date(params.date);
		startDate = new Date(startDate.getTime() - 2*1000*60*60*24);
		endDate = new Date(endDate.getTime() + 3*1000*60*60*24);

    	this.register('photos', Meteor.subscribe('photos', startDate, endDate));
    },
	action: function(params) {
		mount(Timeline3Up, {date: moment(params.date)})
	}
});

FlowRouter.route('/image/:imageId', {
	name: 'imageView',

	subscriptions: function(params) {
    	this.register('photos', Meteor.subscribe('photos_near', new Meteor.Collection.ObjectID(params.imageId)));
    },

    action: function(params) {
		mount(SingleTimeline, {imageId: new Meteor.Collection.ObjectID(params.imageId)})
    }
});