import { Mongo } from 'meteor/mongo';
 
export const Photos = new Mongo.Collection('images');

if (Meteor.isServer) {
	// let start = new Date('2014-12-20T00:01:00Z');
	// let end = new Date('2015-01-06T00:01:00Z');
	
	Meteor.publish('photos', function photoPublication(startDate, endDate) {
		// console.log(Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}}).fetch())
		return Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}});
	});

	Meteor.publish('photos_near', function photosNearPublication(imageId) {
		photo = Photos.find({'_id': imageId}).fetch();
		photoDate = photo[0].datetime.utc_timestamp;

		startDate = new Date(photoDate.getTime() - 2*1000*60*60*24);
		endDate = new Date(photoDate.getTime() + 3*1000*60*60*24);

		console.log(startDate);
		console.log(endDate);

		return Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}});
	});
}