
module.exports = function (socket, authenticationServer) {
	socket.on('login', function(data) {
		//TODO: verify data

		if(!data.username) {
			socket.emit('loginresponse', { success: false, response:"Username/email is empty."});
			return;
		}
		
		if(!data.password) {
			socket.emit('loginresponse', { success: false, response:"Password is empty."});
			return;
		}
		
		authenticationServer._db.collection('users', function(err, collectionref) { 
			if(err)
				console.log(err);
				
			if(validateEmail(data.username)) {
				//username is email
				collectionref.findOne({"email":data.username}, function(err, doc) {
					if(err)
						console.log(err);
					if(doc) {
						onUserReceived(doc, data);
					}
					else {
						socket.emit('loginresponse', { success: false, response:"User with specified email does not exist."});
						return;
					}
				});
			} else if(validateUsername(data.username)) {
				//username is email
				collectionref.findOne({"username":data.username}, function(err, doc) {
					if(err)
						console.log(err);
					if(doc) {
						onUserReceived(doc, data);
					}
					else {
						socket.emit('loginresponse', { success: false, response:"User with specified username does not exist."});
						return;
					}
				});
			}
			else {
				socket.emit('loginresponse', { success: false, response:"Invalid username/email."});
				return;
			}
		});
	});
	
	var onUserReceived = function(user, data) {
		if(user) {
			// User with email found, check password match
			if(user["password"] == data.password) {
				authenticationServer.setSocketAuthenticated(socket, true);
				socket.emit('loginresponse', { success: true, response:"You have been logged in."});
				return;
			}
			else {
				socket.emit('loginresponse', { success: false, response:"Password does not match."});
				return;
			}
		}
		else {
			socket.emit('loginresponse', { success: false, response:"Internal error."});
			return;
		}
	}.bind(this);
}