import {mount} from 'react-mounter';
import Calendar from '../imports/ui/Calendar/Calendar.jsx';
import Story from '../imports/ui/Story.jsx';
import Face from '../imports/ui/Face.jsx';
import ClusterCalendar from '../imports/ui/ClusterCalendar.jsx';
import ClusterTimeline from '../imports/ui/ClusterTimeline.jsx';
import ClusterOverview from '../imports/ui/ClusterOverview.jsx';

FlowRouter.route('/', {
  action() {
    FlowRouter.go('/clusters/2015-08-01');
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
});

FlowRouter.route('/image/:imageId', {
	name: 'imageConversationView',

	subscriptions: function(params) {
    	this.register('faces_like', Meteor.subscribe('faces_like', new Meteor.Collection.ObjectID(params.imageId), params.facen))
    },

    action: function(params) {
		mount(Face, {imageId: new Meteor.Collection.ObjectID(params.imageId), facen: params.facen})
    }
});


FlowRouter.route('/image/:imageId/face/:facen', {
	name: 'faceDebugView',

	subscriptions: function(params) {
    },

    action: function(params) {
    	console.log("mounting image");
		// mount(Face, {imageId: new Meteor.Collection.ObjectID(params.imageId), facen: params.facen})
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
		mount(Calendar, {date: moment.utc(params.date)})
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
		mount(ClusterCalendar, {date: moment.utc(params.date)})
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
		this.register('cluster', Meteor.subscribe('cluster', new Meteor.Collection.ObjectID(params.clusterid)));
	},

	action: function(params) {
		mount(ClusterTimeline)
	}
});

FlowRouter.route('/overview', {
	name: 'clusterOverview',

	subscriptions: function(params) {
		this.register('clusters', Meteor.subscribe('clusters', new Date(2013, 01, 01, 0, 0, 0, 0), new Date(2018, 01, 01, 0, 0, 0, 0)));
	},

	action: function(params) {
		mount(ClusterOverview);
	}
})