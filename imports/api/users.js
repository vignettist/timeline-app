import { Mongo } from 'meteor/mongo';

if (Meteor.isServer) {
	Meteor.publish('all_users', function (){ 
	  return Meteor.users.find({});
	});
}