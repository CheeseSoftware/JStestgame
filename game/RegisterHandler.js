
module.exports = function (socket, server) {
	socket.on('register', function(data) {
		//TODO: verify data
		
		if(!data.username || !validateUsername(data.username)) {
			socket.emit('registerresponse', { success: false, response:"Username is invalid. It has to be between 3-20 normal characters."});
			return;
		}
		
		if(!data.email || !validateEmail(data.email)) {
			socket.emit('registerresponse', { success: false, response:"Email is invalid."});
			return;
		}
		
		if(!data.password) {
			socket.emit('registerresponse', { success: false, response:"Password is empty."});
			return;
		}
		
		server.db.collection('users', function(err, collectionref) { 
			if(err)
				console.log(err);			
			collectionref.findOne({"username":data.username}, function(err, doc) {
				if(err)
					console.log(err);
				if(doc) {
					socket.emit('registerresponse', { success: false, response:"A user already exists with username \"" + data.username + "\""});
				}
				else {
					collectionref.findOne({"email":data.email}, function(err, doc) {
					if(err)
						console.log(err);
					if(doc) {
						socket.emit('registerresponse', { success: false, response:"A user already exists with email \"" + data.email + "\""});
						return;
					}
					else {
						var doc = {"username":data.username, "email":data.email, "password":data.password};
						collectionref.insert(doc, function (err, result) {
							if(err)
								console.log(err);
							else
								socket.emit('registerresponse', { success: true, response:"User has been created."});
						});
					}
				});
				}
			});
		});
	});
}