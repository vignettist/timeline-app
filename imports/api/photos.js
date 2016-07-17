import { Mongo } from 'meteor/mongo';
 
export const Photos = new Mongo.Collection('images');
export const Stories = new Mongo.Collection('stories');

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

	Meteor.publish('photos_location', function photoPublication(startDate, endDate) {
		return Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}}, {fields: {'datetime': 1, 'geolocation': 1}});
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

		let nearbyPhotos = Photos.find({'latitude': {$gte: photoLat-0.025, $lt: photoLat+0.025}, 'longitude': {$gte: photoLon-0.025, $lt: photoLon+0.025}});

		let uniqueDates = _.uniq(Photos.find({'latitude': {$gte: photoLat-0.025, $lt: photoLat+0.025}, 'longitude': {$gte: photoLon-0.25, $lt: photoLon+0.025}}, {
			    sort: {'datetime.utc_timestamp': 1}, fields: {'datetime.utc_timestamp': true}
			}).fetch().map(function(x) {
			    return x.datetime.utc_timestamp.toDateString();
			}), true);

		var dateQuery = [];

		for(var i = 0; i < uniqueDates.length; i++) {
			dateQuery.push({'datetime.utc_timestamp': {$gte: new Date(new Date(uniqueDates[i]).getTime() - new Date(uniqueDates[i]).getTimezoneOffset()*60*1000 - 0*1000*60*60*24), $lt: new Date(new Date(uniqueDates[i]).getTime() - new Date(uniqueDates[i]).getTimezoneOffset()*60*1000 + 1000*60*60*24)}});			
		}
	
		return Photos.find({$or: dateQuery});
	});

	Meteor.publish('stories', function allStories() {
		return Stories.find({});
	});

	Meteor.publish('story_photos', function storyPhotos() {
		let story = Stories.find({}).fetch()[0];
		let photos = story.images_used;
		console.log(Photos.find({'_id': {$in: photos}}).fetch());

		return Photos.find({'_id': {$in: photos}});
	});
}