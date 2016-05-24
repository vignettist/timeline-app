import {mount} from 'react-mounter';
import App from '../imports/ui/App.jsx';

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
		mount(App, {date: moment(params.date)})
	}
});

FlowRouter.route('/blog/:postId', {
    name: 'blogPost',
    action: function(params) {
        console.log("This is my blog post:", params.postId);
    }
});