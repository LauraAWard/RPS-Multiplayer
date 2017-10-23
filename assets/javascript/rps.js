$(window).on( "load", function() { //make sure window has finished loading

	var playerName;
	var newPlayer;
	var player1;
	var player2;
	var playerArray = [];
	var playerID;
	var playerIDRef;
	var playerStatus;
	var rpsGame;

	function playerObj(name, wins, losses) {
		this.name = name;
		this.wins = wins;
		this.losses = losses;

	};

	function gameObj(player) {
		// this.chat = [];
		this.players = [player];
		// this.turn;

	};
  // Initialize Firebase
	var config = {
	    apiKey: "AIzaSyCSqiXdN16l6se6eD1nF_RMuez6D6rfPkA",
	    authDomain: "rps-game-e3f03.firebaseapp.com",
	    databaseURL: "https://rps-game-e3f03.firebaseio.com",
	    projectId: "rps-game-e3f03",
	    storageBucket: "rps-game-e3f03.appspot.com",
	    messagingSenderId: "510517290824"
	};
  
  	firebase.initializeApp(config);

	var rpsDatabase = firebase.database();

	var rpsDBStatus = rpsDatabase.ref(".info/connected");
	// rpsDBStatus.OnDisconnect().set(false);
	// console.log(rpsDBStatus);
	// var connectedRef = firebase.database().ref('.info/connected');


	rpsDatabase.ref().on("value", function(snapshot) {
		console.log("data changed");
		if (snapshot.child("players").exists()) {
		    if (!snapshot.child("players/2").exists() && snapshot.child("turn").exists()) {
		    	playerStatus = player2.name + " has disconnected.";
			    console.log(playerStatus);
			    rpsDatabase.ref("turn").remove();
		    	$("#gameMsg").html("Waiting for new player to join.");
	
		    }
		    else if (!snapshot.child("players/1").exists() && snapshot.child("turn").exists()) {

		    	playerStatus = player1.name + " has disconnected.";
		    	console.log(playerStatus);
		    	rpsDatabase.ref("turn").remove();
		    	// player1 = player2;
		    	// rpsDatabase.ref().set({
		     //  				players: {
			    //   				1: player1, 
		     //  					}, 
				   //  });
		    	 $("#gameMsg").html("Waiting for new player to join.");
		    }
		}
		// rpsDBStatus.OnDisconnect().set(false);
		// console.log(rpsDBStatus);
		
		  // If any errors are experienced, log them to console.
		}, function(errorObject) {
		  console.log("The read failed: " + errorObject.code);
	});

	function startGame() {

		console.log("Game Started");

		var ref = firebase.database().ref();
		ref.once("value", function(snapshot) {
		  console.log("database: " + snapshot.val());
		    if (snapshot.child("players").exists()) {
		    	console.log("players exists");
		    	if (snapshot.child("players/1").exists() && snapshot.child("players/2").exists()) {
		    		$("#gameMsg").html("Sorry " + playerName + ", but there are already two players.");
		    	}
		    	else if (snapshot.child("players/1").exists()) {
		    		playerID = "2";
		    		playerIDRef = rpsDatabase.ref("players/2");
		    		//make a new function getPlayerData(id)
		    		var tempSnap = snapshot.child("players/1");
		    		var tempName = tempSnap.val().name;
		    		var tempWins = tempSnap.val().wins;
		    		var tempLosses = tempSnap.val().losses;
		    		player1 = new playerObj(tempName, tempWins, tempLosses);
		    		// rpsGame = new gameObj(player1);
		    		//--------------------------------------------
		    		player2 = newPlayer;
		    		// rpsGame.push(player2);
		    		playerArray.push(player1, player2); //unnecessary?
		    		rpsDatabase.ref().set({
		      			// rpsGame: {
		      				players: {
			      				1: player1, //unnecessary?
			      				2: player2
		      					}, 
		      				turn: 1
		      				// }
				      	});
		      		$("#gameMsg").html("Welcome " + playerName + ", you are the second player to join the game.");		
		      	}
		    	else if (snapshot.child("players/2").exists()) {
		    		playerID = "1";
		    		playerIDRef = rpsDatabase.ref("players/1");
		    		//make a new function getPlayerData(id)
		    		var tempSnap = snapshot.child("players/2");
		    		var tempName = tempSnap.val().name;
		    		var tempWins = tempSnap.val().wins;
		    		var tempLosses = tempSnap.val().losses;
		    		player2 = new playerObj(tempName, tempWins, tempLosses);
		    		// rpsGame = new gameObj(player1);
		    		//--------------------------------------------
		    		player1 = newPlayer;
		    		// rpsGame.push(player2);
		    		playerArray.push(player1, player2); //unnecessary?
		    		rpsDatabase.ref().set({
		      			// rpsGame: {
		      				players: {
			      				1: player1, 
			      				2: player2 //unnecessary?
		      					}, 
		      				turn: 1
		      				// }
				      	});
		      		$("#gameMsg").html("Welcome " + playerName + ", you are the second player to join the game.");		
		      	}
		    }
		    else {
		    		playerID = "1";
		    		playerIDRef = rpsDatabase.ref("players/1");
		    		player1 = newPlayer;
		    		// rpsGame = new gameObj(player1);
		    		playerArray.push(player1);//unnecessary?
		    		rpsDatabase.ref().set({
		      			// rpsGame: {
		      				players: {
		      					1: player1
		      				}
		      			// } 
					}); 
					$("#gameMsg").html("Welcome " + playerName + ", you are the first player to join the game.");				
		    }
		    
		 });

		rpsDBStatus.on("value", function(snap) {
  		
			console.log(snap.val());

	  		if (snap.val() === true) {

	  		// 	playerStatus = playerName + " is online.";
	  		// 	rpsDatabase.ref().set({
			  //     	chat: playerStatus
					// });

	    // When I disconnect, remove this device
	    		playerIDRef.onDisconnect().remove();
	    		// rpsDatabase.ref("turn").remove();
	    // When I disconnect, update the last time I was seen online
	    // 		rpsDatabase.ref().onDisconnect().set({
			  //     	chat: playerStatus
					// });
	  		}
		});
      

	};



    //event listener on the start button
    $("#start-button").on("click", function(event) {
        
        //prevent the start button from opening new page
        event.preventDefault();
        
        //get the player name from the text box entry
        playerName = $("#name-input").val().trim();
        console.log(playerName);

        newPlayer = new playerObj(playerName, 0, 0);


        startGame();
        
    });















});