import { Mongo } from 'meteor/mongo';
 
export const Photos = new Mongo.Collection('images');
export const LogicalImages = new Mongo.Collection('logical_images');
export const Stories = new Mongo.Collection('stories');
export const Clusters = new Mongo.Collection('clusters');
export const ClustersTest = new Mongo.Collection('clusters_test');

// export const Similarity = new Mongo.Collection('Similarity');

if (Meteor.isServer) {
	// let start = new Date('2014-12-20T00:01:00Z');
	// let end = new Date('2015-01-06T00:01:00Z');
	
	Meteor.publish('single_photo', function singlePhotoPublication(imageId) {
		photo = Photos.find({'_id': imageId});
		return photo;
	})

	Meteor.publish('photos', function photoPublication(startDate, endDate) {
		return Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}}, 
			{fields: 
				{'datetime': 1, 'geolocation': 1, 'longitude': 1, 'latitude': 1, 'interest_score': 1, 'resized_uris': 1, 'original_uri': 1, 'syntactic_fingerprint': 1, 'openfaces': 1}});
	});

	Meteor.publish('photos_location', function photoPublication(startDate, endDate) {
		return Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}}, {fields: {'datetime': 1, 'geolocation': 1}});
	});

	Meteor.publish('photos_near', function photosNearPublication(imageId) {
		let photo = Photos.find({'_id': imageId}).fetch();
		let photoDate = photo[0].datetime.utc_timestamp;

		let startDate = new Date(photoDate.getTime() - 2*1000*60*60*24);
		let endDate = new Date(photoDate.getTime() + 3*1000*60*60*24);

		return Photos.find({'datetime.utc_timestamp': { $gte: startDate, $lt: endDate}},
			{'datetime': 1, 'geolocation': 1, 'longitude': 1, 'latitude': 1, 'interest_score': 1, 'resized_uris': 1, 'original_uri': 1, 'syntactic_fingerprint': 1});
	});

	Meteor.publish('faces_like', function photosWithFacesLike(imageId, facen) {
		let photo = LogicalImages.find({'_id': imageId}).fetch();
		var face = photo[0].openfaces[facen].rep;

		var aggregate = LogicalImages.aggregate( [ {$project: {'datetime': 1, 'resized_uris': 1, 'openfaces': 1}}, { $unwind : "$openfaces" } ], {"allowDiskUse": true} );
		var similarity = [];

		for (var i = 0; i < aggregate.length; i++) {
			var sim = 0;
			for (var j = 0; j < aggregate[i].openfaces.rep.length; j++) {
	            sim += Math.pow(aggregate[i].openfaces.rep[j] - face[j],2);
		    }

			similarity.push({'_id': aggregate[i]._id.toString(), 'similarity': sim});
		}

		similarity.sort(function(a,b) { return a.similarity - b.similarity});

		// similarity is now a javascript list of _ids and similarity values
		// sort by similarity value and do a query on the five most similar images
		// return that query

		var idquery = [];

		for (var i = 1; i <= 5; i++ ) {
			idquery.push({'_id': new Meteor.Collection.ObjectID(similarity[i]._id)});
		}

		return LogicalImages.find({$or: idquery}, {fields: {'datetime': 1, 'latitude': 1, 'longitude': 1, 'resized_uris': 1, 'interest_score': 1}});

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
	
		return Photos.find({$or: dateQuery}, {fields: {
			'datetime': 1, 'geolocation': 1, 'longitude': 1, 'latitude': 1, 'interest_score': 1, 'resized_uris': 1, 'original_uri': 1, 'syntactic_fingerprint': 1
		}});
	});

	Meteor.publish('stories', function allStories() {
		return Stories.find({});
	});

	Meteor.publish('clusters', function clustersByDate(startDate, endDate) {
		return Clusters.find({$and: [{'start_time.utc_timestamp': { $lt: endDate}}, {'end_time.utc_timestamp': {$gte: startDate}}]}, {fields: {'locations': 0, 'photos': 0, 'start_location': 0, 'end_location': 0}});
	});

	Meteor.publish('clusters_test', function clustersByDate(startDate, endDate) {
		return ClustersTest.find({$and: [{'start_time.utc_timestamp': { $lt: endDate}}, {'end_time.utc_timestamp': {$gte: startDate}}]});
	});

	Meteor.publish('cluster', function clusterById(id) {
		return Clusters.find({'_id': id});
	})

	Meteor.publish('cluster_photos', function clusterPhotosByDate(startDate, endDate) {

		// shitty left join. this should be denormalized, in all likelihood
		let clusters = Clusters.find({$and: [{'start_time.utc_timestamp': { $lt: endDate}}, {'end_time.utc_timestamp': {$gte: startDate}}]}).fetch();
		var id_or_statement = [];

		for (var i = 0; i < clusters.length; i++) {
			let photo_ids = clusters[i].photos;

			for (var j = 0; j < photo_ids.length; j++) {
				id_or_statement.push({'_id': photo_ids[j]});
			}
		}

		return LogicalImages.find({$or: id_or_statement}, {fields: {'datetime': 1, 'latitude': 1, 'longitude': 1, 'resized_uris': 1, 'interest_score': 1, 'openfaces': 1, 'geolocation': 1, 'size': 1}});
	});

	Meteor.publish('story_photos', function storyPhotos() {
		let story = Stories.find({}).fetch()[0];
		let photos = story.images_used;

		return Photos.find({'_id': {$in: photos}});
	});

	Meteor.publish('single_cluster_photos', function clusterPhotos(clusterId) {
		let cluster = Clusters.find({'_id': clusterId}).fetch();
		let id_or_statement = [];
		let photo_ids = cluster[0].photos;

		for (var j = 0; j < photo_ids.length; j++) {
			id_or_statement.push({'_id': photo_ids[j]});
		}

		return LogicalImages.find({$or: id_or_statement}, {fields: {'datetime': 1, 'latitude': 1, 'longitude': 1, 'resized_uris': 1, 'interest_score': 1, 'openfaces': 1, 'all_photos': 1, 'geolocation': 1, 'size': 1}});
	})
}