import {mount} from 'react-mounter';
import Timeline3Up from '../imports/ui/Timeline3Up.jsx';
import SingleTimeline from '../imports/ui/SingleTimeline.jsx';
import Calendar from '../imports/ui/Calendar.jsx';
import Story from '../imports/ui/Story.jsx';
import Face from '../imports/ui/Face.jsx';
import ClusterCalendar from '../imports/ui/ClusterCalendar.jsx';
import ClusterTimeline from '../imports/ui/ClusterTimeline.jsx';

FlowRouter.route('/', {
  action() {
    FlowRouter.go('/timeline/2015-01-01');
  }
});

FlowRouter.route('/calendar/', {
	action() {
		FlowRouter.go('/calendar/2015-01-01');
	}
});

FlowRouter.route('/clusters/', {
	action() {
		FlowRouter.go('/clusters/2015-01-01');
	}
})

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
		this.register('single_photo', Meteor.subscribe('single_photo', new Meteor.Collection.ObjectID(params.imageId)));
    	this.register('photos', Meteor.subscribe('photos_near', new Meteor.Collection.ObjectID(params.imageId)));
    	this.register('photosNearby', Meteor.subscribe('photos_nearby', new Meteor.Collection.ObjectID(params.imageId)));
    },

    action: function(params) {
		mount(SingleTimeline, {imageId: new Meteor.Collection.ObjectID(params.imageId)})
    }
});

FlowRouter.route('/image/:imageId/face/:facen', {
	name: 'faceView',

	subscriptions: function(params) {
		this.register('single_photo', Meteor.subscribe('single_photo', new Meteor.Collection.ObjectID(params.imageId)));
    	this.register('faces_like', Meteor.subscribe('faces_like', new Meteor.Collection.ObjectID(params.imageId), params.facen))
    },

    action: function(params) {
		mount(Face, {imageId: new Meteor.Collection.ObjectID(params.imageId), facen: params.facen})
    }
});

FlowRouter.route('/calendar/:date', {
	name: 'calendarView',

	subscriptions: function(params) {
		let date = moment(params.date);

		let monthDate = date.clone().startOf("month");
		let startDate = date.clone().startOf("month").add(0, "w").day("Sunday");
		let endDate = date.clone().endOf("month").add(1, "w").day("Saturday");

		this.register('months_photos', Meteor.subscribe('photos', new Date(startDate), new Date(endDate)));
	},

	action: function(params) {
		mount(Calendar, {date: moment(params.date)})
	}
});

FlowRouter.route('/clusters/:date', {
	name: 'clusterView',

	subscriptions: function(params) {
		let date = moment(params.date);
		let startDate = date.clone().subtract(4, "d");
		let endDate = date.clone().add(4, "d");

		this.register('clusters', Meteor.subscribe('clusters', new Date(startDate), new Date(endDate)));
		this.register('cluster_photos', Meteor.subscribe('cluster_photos', new Date(startDate), new Date(endDate)));
	},

	action: function(params) {
		mount(ClusterCalendar, {date: moment(params.date)})
	}
});

FlowRouter.route('/story', {
	name: 'storyView',

	subscriptions: function(params) {
		this.register('stories', Meteor.subscribe('stories'));
		this.register('story_photos', Meteor.subscribe('story_photos'));
	},

	action: function(params) {
		mount(Story);
	}
});

FlowRouter.route('/cluster/:clusterid', {
	name: 'clusterDebugView',

	subscriptions: function(params) {
		this.register('single_cluster_photos', Meteor.subscribe('single_cluster_photos', new Meteor.Collection.ObjectID(params.clusterid)));
	},

	action: function(params) {
		mount(ClusterTimeline)
	}
});