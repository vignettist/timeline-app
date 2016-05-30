import { Mongo } from 'meteor/mongo';
 
export const Photos = new Mongo.Collection('images');

if (Meteor.isServer) {
	// let start = new Date('2014-12-20T00:01:00Z');
	// let end = new Date('2015-01-06T00:01:00Z');
	
	Meteor.publish('single_photo', function singlePhotoPublication(imageId) {
		photo = Photos.find({'_id': imageId});
		return photo;
	})


	Meteor.publish('photos', function photoPublication(startDate, endDate) {
		return Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}});
	});

	Meteor.publish('photos_near', function photosNearPublication(imageId) {
		let photo = Photos.find({'_id': imageId}).fetch();
		let photoDate = photo[0].datetime.utc_timestamp;

		let startDate = new Date(photoDate.getTime() - 2*1000*60*60*24);
		let endDate = new Date(photoDate.getTime() + 3*1000*60*60*24);

		return Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}});
	});

	Meteor.publish('photos_nearby', function photosNearbyPhoto(imageId) {
		let photo = Photos.find({'_id': imageId}).fetch();
		let photoLat = photo[0].latitude;
		let photoLon = photo[0].longitude;

		let nearbyPhotos = Photos.find({'latitude': {$gte: photoLat-0.05, $lt: photoLat+0.05}, 'longitude': {$gte: photoLon-0.05, $lt: photoLon+0.05}});

		return nearbyPhotos;
	})
}