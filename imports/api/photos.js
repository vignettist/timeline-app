import { Mongo } from 'meteor/mongo';
 
export const Photos = new Mongo.Collection('images');

if (Meteor.isServer) {
	// let start = new Date('2014-12-20T00:01:00Z');
	// let end = new Date('2015-01-06T00:01:00Z');
	
	Meteor.publish('photos', function photoPublication(startDate, endDate) {
		return Photos.find({'time': { $gte: startDate, $lt: endDate}});
	});
}