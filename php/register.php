<?php
	$username = !empty($_POST["username"]) ? $_POST["username"] : "";
	$email = !empty($_POST["email"]) ? $_POST["email"] : "";
	$password = !empty($_POST["password"]) ? $_POST["password"] : "";

	if(empty($username) || empty($email) || empty($password)) {
		echo("Invalid input." . $username . " " . $email . " " . $password);
		exit;
	}
	
	
	//TODO: CHECK INPUT VALIDITY
	
	try {
		// a new MongoDB connection
		$conn = new Mongo('localhost');
	
		$db = $conn->digminer;
	
		$collection = $db->users;
	
        $array = array('username' => $username);
        $document = $collection->findOne( $array );
		if(!empty($document)) {
        	echo("Username is taken.");
      	} else {
			// Username is not taken
			$array = array('email' => $email);
        	$document = $collection->findOne( $array );
			if(!empty($document)) {
				echo("Email is in use.");
			} else {
				// Email is not in use
				$user = array(
                        'username' => $username,
                        'email' => $email,
                        'password' => $password
                        );

        		$collection->insert($user);
				echo("Account created!");
				
			}
		}
		
		$conn->close();
	}
	catch ( MongoConnectionException $e )
	{
		echo $e->getMessage();
	}
	catch ( MongoException $e )
	{
		echo $e->getMessage();
	}
?>