import {mount} from 'react-mounter';
import Calendar from '../imports/ui/Calendar/Calendar.jsx';
import Face from '../imports/ui/Face.jsx';
import ClusterCalendar from '../imports/ui/ClusterCalendar.jsx';
import ClusterTimeline from '../imports/ui/ClusterTimeline.jsx';
import ClusterOverview from '../imports/ui/ClusterOverview.jsx';
import ClusterConversation from '../imports/ui/ClusterConversation.jsx';
import Compose from '../imports/ui/Compose.jsx';
import Login from '../imports/ui/Login.jsx';
import Home from '../imports/ui/Home.jsx';

const login = FlowRouter.group({
	triggersEnter: [
		(context, redirect) => {
			if (Meteor.userId() || Meteor.loggingIn()) {
				redirect('/');
			}
		}
	]
});

const loggedIn = FlowRouter.group({
    triggersEnter: [
        (context, redirect) => {
        	if ((!Meteor.loggingIn()) && (!Meteor.userId())) {
        		route = FlowRouter.current();
        		if (!(route.route.name == 'login')) {
        			redirect('/login');
        		}
        	}
        }
    ]
});

loggedIn.route('/', {
  name: 'home',

  subscriptions: function(params) {
  	// all people
  	// all places
  	this.register('clusters_with_stories', Meteor.subscribe('clusters_with_stories'));
  	this.register('stories', Meteor.subscribe('stories'));
  },

  action: function(params) {
  	mount(Home);
  }
});

loggedIn.route('/calendar/', {
	action() {
		FlowRouter.go('/calendar/2015-01-01');
	}
});

loggedIn.route('/clusters/', {
	action() {
		FlowRouter.go('/clusters/2015-01-01');
	}
});

loggedIn.route('/image/:imageId/face/:facen', {
	name: 'faceDebugView',

	subscriptions: function(params) {
    },

    action: function(params) {
		mount(Face, {imageId: new Meteor.Collection.ObjectID(params.imageId), facen: Number(params.facen)})
    }
});

loggedIn.route('/calendar/:date', {
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

loggedIn.route('/clusters/:date', {
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

loggedIn.route('/cluster/:clusterid', {
	name: 'clusterDebugView',

	subscriptions: function(params) {
		this.register('single_cluster_photos', Meteor.subscribe('single_cluster_photos', new Meteor.Collection.ObjectID(params.clusterid)));
		this.register('cluster', Meteor.subscribe('cluster', new Meteor.Collection.ObjectID(params.clusterid)));
	},

	action: function(params) {
		mount(ClusterTimeline)
	}
});

loggedIn.route('/conversation/:clusterid', {
	name: 'clusterConversationView',

	subscriptions: function(params) {
		this.register('cluster', Meteor.subscribe('cluster', new Meteor.Collection.ObjectID(params.clusterid)));
		this.register('conversation_from_cluster', Meteor.subscribe('conversation_from_cluster', new Meteor.Collection.ObjectID(params.clusterid)));
		this.register('single_cluster_photos', Meteor.subscribe('single_cluster_photos', new Meteor.Collection.ObjectID(params.clusterid)));
		this.register('single_cluster_places', Meteor.subscribe('single_cluster_places', new Meteor.Collection.ObjectID(params.clusterid)));
		this.register('single_cluster_story_no_changes', Meteor.subscribe('single_cluster_story_no_changes', new Meteor.Collection.ObjectID(params.clusterid)));
	},

	action: function(params) {
		mount(ClusterConversation)
	}
});

loggedIn.route('/compose/:clusterid', {
	name: 'clusterComposeView',

	subscriptions: function(params) {
		this.register('cluster', Meteor.subscribe('cluster', new Meteor.Collection.ObjectID(params.clusterid)));
		this.register('conversation_from_cluster', Meteor.subscribe('conversation_from_cluster', new Meteor.Collection.ObjectID(params.clusterid)));
		this.register('single_cluster_photos', Meteor.subscribe('single_cluster_photos', new Meteor.Collection.ObjectID(params.clusterid)));
		this.register('single_cluster_places', Meteor.subscribe('single_cluster_places', new Meteor.Collection.ObjectID(params.clusterid)));
		this.register('single_cluster_story', Meteor.subscribe('single_cluster_story', new Meteor.Collection.ObjectID(params.clusterid)));
	},

	action: function(params) {
		mount(Compose)
	}
});

loggedIn.route('/overview', {
	name: 'clusterOverview',

	subscriptions: function(params) {
		this.register('clusters', Meteor.subscribe('clusters', new Date(2013, 01, 01, 0, 0, 0, 0), new Date(2018, 01, 01, 0, 0, 0, 0)));
	},

	action: function(params) {
		mount(ClusterOverview);
	}
});

login.route('/login', {
	name: 'login',

	subscriptions: function(params) {
		this.register('all_users', Meteor.subscribe('all_users'));
	},

	action: function(params) {
		mount(Login);
	}
});