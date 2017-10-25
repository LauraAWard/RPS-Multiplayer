$(window).on( "load", function() { //make sure window has finished loading

	var playerName;
	var newPlayer;
	var player1;
	var player2;
	var playerArray = [];
	var playerID;
	var playerIDRef = null;
	var playerStatus;
	var rpsGame;
	var player1Ref;
	var player2Ref;
	var turnRef;
	var chatRef;
	var dbSnapshot;
	var playerCount = 0;
	var maxPlayers = 2;
	var gameFull = false;
	var iAmPlaying = false;
	var denied = false;
	var player1Selected = false;
	var player2Selected = false;
	var player1Choice = "unknown";
	var player2Choice = "unknown";

	//Player object constructor
	function playerObj(name, wins, losses) {
		this.name = name;
		this.wins = wins;
		this.losses = losses;
		this.choice = "unknown";

	};
	//game object constructor
	function gameObj() {
		this.player1 = new playerObj("new1",0,0);
		this.player2 = new playerObj("new2",0,0);
		this.chat = [];
		this.players = [];
		this.turn = 1;

		this.setP1Name = function(name) {
			this.player1.name = name;
		};
		
		this.getP1Name = function() {
			return this.player1.name;
		};

		this.setP2Name = function(name) {
			this.player2.name = name;
		};
		
		this.getP2Name = function() {
			return this.player2.name;
		};

		this.setP1Wins = function(wins) {
			this.player1.wins = wins;
		};
		
		this.getP1Wins = function() {
			return this.player1.wins;
		};

		this.setP2Wins = function(wins) {
			this.player2.wins = wins;
		};
		
		this.getP2Wins = function() {
			return this.player2.wins;
		};

		this.setP1Losses = function(losses) {
			this.player1.losses = losses;
		};
		
		this.getP1Losses = function() {
			return this.player1.losses;
		};

		this.setP2Losses = function(losses) {
			this.player2.losses = losses;
		};
		
		this.getP2Losses = function() {
			return this.player2.losses;
		};

		this.setP1Choice = function(choice) {
			this.player1.choice = choice;
		};
		
		this.getP1Choice = function() {
			return this.player1.choice;
		};

		this.setP2Choice = function(choice) {
			this.player2.choice = choice;
		};
		
		this.getP2Choice = function() {
			return this.player2.choice;
		};

		this.setTurn = function(turn) {
			this.turn = turn;
		};
		
		this.getTurn = function() {
			return this.turn;
		};

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
	
	var rpsDBRef = rpsDatabase.ref();

	//this is used to trigger disconnects
	var rpsDBStatus = rpsDatabase.ref(".info/connected");

	//listens for changes to database
	rpsDBRef.on("value", function(snapshot) {
		playerCount = getPlayerCount();

		//if player disconnected: create message in chat, remove turn from DB
		if (playerCount < maxPlayers && snapshot.child("turn").exists()) {
			if (playerID === "1") {
				playerStatus = rpsGame.getP2Name() + " has disconnected.";
				$("#chat-box").append(playerStatus);
				//hide player2 scores, etc when it's player1's turn
				$(".player2Scores").hide();
				$("#player1Msg").hide();
				$(".btn").hide();
				$("#gameMsg").html("Waiting for new player to join.");
			}
			else if (playerID === "2") {
				playerStatus = rpsGame.getP1Name() + " has disconnected.";
				$("#chat-box").append(playerStatus);
				//hide player1 scores, etc when it's player2's turn
				$(".player1Scores").hide();
				$("#player2Msg").hide();
				$(".btn").hide();
				$("#gameMsg").html("Waiting for new player to join.");
			}//this triggers a message to a third player that there is an opening when someone disconnects
			else if (iAmPlaying === false && denied === true) {
				$("#gameMsg").html("A player has left the game, enter your name and click start to join.");
			}
			rpsDatabase.ref("turn").remove();
			gameFull = false;

		} //none of the rest of these updates should occur for anyone other than the two players
		if  (iAmPlaying === true) {

			//if player connected: create message in chat, update game object
			if (playerCount === maxPlayers && gameFull === false) {
				if (playerID === "1") {
					var tempName = snapshot.child("players/2").val().name;
					playerStatus = tempName + " has joined the game.";
				$("#chat-box").append(playerStatus);
				$(".player2Scores").show();
				}
				else if (playerID === "2") {
					var tempName = snapshot.child("players/1").val().name;
					playerStatus = tempName + " has joined the game.";
				$("#chat-box").append(playerStatus);
				$(".player1Scores").show();
				}
			gameFull = true;
			$("#gameMsg").html("Beginning gameplay.");
			}
			//if turn = 1, update player1 msg: Your turn, update player2 msg: Waiting
			if (snapshot.child("turn").exists()) {
				var tempTurnVal = snapshot.val().turn;
				if (parseInt(tempTurnVal) === 3 && gameFull === true) {
					getDBData();
					rpsGame.setTurn(1);
					updateDB();
				}
				if (parseInt(tempTurnVal) === 1 && gameFull === true) {
					var tempName = snapshot.child("players/1").val().name;
					$("#player1Msg").html("It's your turn, " + tempName + ".");
					$("#player2Msg").html("Waiting for " + tempName + "...");
				//only player 1 should see choice buttons during his turn
					toggleChoiceButtons("1");
					toggleMessages();
				}
				//if turn = 2, update player2 msg: Your turn, update player1 msg: Waiting
				if (parseInt(tempTurnVal) === 2 && gameFull === true) {
					var tempName = snapshot.child("players/2").val().name;
					$("#player1Msg").html("Waiting for " + tempName + "...");
					$("#player2Msg").html("It's your turn, " + tempName + ".");
				//only player 2 should see choice buttons during his turn
					toggleChoiceButtons("2");
					toggleMessages();
				}
			}

			//always update wins/losses on the page
			if (snapshot.child("players/1").exists()) {
				$("#player1Wins").html("Player 1 wins: " + snapshot.child("players/1").val().wins);
				$("#player1Losses").html("Player 1 losses: " + snapshot.child("players/1").val().losses);
			}
			if (snapshot.child("players/2").exists()) {
				$("#player2Wins").html("Player 2 wins: " + snapshot.child("players/2").val().wins);
				$("#player2Losses").html("Player 2 losses: " + snapshot.child("players/2").val().losses);
			}

			//if chat updated, draw down and display last chat from array
			if (snapshot.child("chat").exists()) {
				rpsDBRef.on("child_added", function(snapshot) {
  
				      $("#chat-box").val($("#chat-box").val() + snapshot.val());
				  });
			};

			//always push data to game object, as backup for disconnects
			getDBData();
		}
		
		  // If any errors are experienced, log them to console.
		}, function(errorObject) {
		  console.log("The read failed: " + errorObject.code);
	});
	//this hides & unhides the choice buttons so theyre only visible during turn
	function toggleChoiceButtons(val) {
		var currentTurn = val;
		console.log("toggle buttons");
		console.log("currentturn" + currentTurn);
		console.log("playerID" + playerID);
		if (currentTurn === playerID) {
			$(".player" + playerID + "-choice").show();
		}
		else {
			$(".player" + playerID + "-choice").hide();
			$(".player" + currentTurn + "-choice").hide();
		}
	};
	//this ensures that the individualized game status messages show to the correct player
	function toggleMessages() {

		if (playerID === "1") {
			$("#player1Msg").show();
			$("#player2Msg").hide();
		}
		else if (playerID === "2") {
			$("#player2Msg").show();
			$("#player1Msg").hide();
		}
	};

	//this determines which character will be #1 and #2 based on login order, and sends initial data to DB
	function createPlayer() {

	console.log("Create Player");
	
	newPlayer = new playerObj(playerName, 0, 0);

	rpsDBRef.once("value", function(snapshot) {

	    if (snapshot.child("players").exists()) {
	    	console.log("players exists");
	    	if (snapshot.child("players/1").exists()) {
	    		console.log("player1 exists");
	    		playerID = "2";
	    		//this is used for disconnect process
	    		playerIDRef = rpsDatabase.ref("players/2");
	    		rpsGame.player2 = newPlayer;
	      	}
	    	else if (snapshot.child("players/2").exists()) {
	    		playerID = "1";
	    		//this is used for disconnect process
	    		playerIDRef = rpsDatabase.ref("players/1");
	    		rpsGame.player1 = newPlayer;
	      	}
			rpsGame.players.push(rpsGame.player1, rpsGame.player2); 
			rpsGame.setTurn(1);
	    	iAmPlaying = true;
			rpsDBRef.set({
				players: {
					1: rpsGame.player1, 
					2: rpsGame.player2 
					}, 
				turn: rpsGame.getTurn()
		      	});
		    gameFull = true;
		    $("#gameMsg").html("Welcome " + playerName + ", you are the second player to join the game.");		
	    }
	    else {
    		playerID = "1";
    		playerIDRef = rpsDatabase.ref("players/1");
    		rpsGame.player1 = newPlayer;
    		rpsGame.players.push(player1);//unnecessary?
    		rpsDBRef.set({
      				players: {
	      				1: rpsGame.player1                                                                                        
      				}
			}); 
			gameFull = false;
	    	iAmPlaying = true;
			$("#gameMsg").html("Welcome " + playerName + ", you are the first player to join the game.");				
	    }

    
	    //listens for player status
		rpsDBStatus.on("value", function(snap) {
  		
	  		if (snap.val() === true) {

	    		// When I disconnect, remove me from database
	    		playerIDRef.onDisconnect().remove();
	    		console.log(rpsGame.players.length);
	  		}
		});
		});

	};

	//listener for chat
    $("#submit-button").on("click", function(event) {
    var	tempChat = $("#chat-input").val().trim();
    	
    rpsGame.chat.push(tempChat);

		rpsDBRef.push({
			chat: tempChat
		});

   			updateDB();

	});

	function initGame() {
			
		rpsGame = new gameObj();

		getDBData();

	};

	//download current database data and feed into gam object
	function getDBData() {

		rpsDBRef.once("value", function(snapshot) {
			
			
			if (snapshot.child("players/1").exists()) {

		    	rpsGame.player1 = snapshot.child("players/1").val();
				player1Ref = rpsDatabase.ref("players/1");
		    }
			
			if (snapshot.child("players/2").exists()) {

		    	rpsGame.player2 = snapshot.child("players/2").val();
				player2Ref = rpsDatabase.ref("players/2");
		    }
			
			if (snapshot.child("turn").exists()) {

		    	rpsGame.setTurn(parseInt(snapshot.val().turn));
				turnRef = rpsDatabase.ref("turn");
		    }
			
			if (snapshot.child("chat").exists()) {
		    	var tempChat = snapshot.val().chat;
		    	var lastChatIndex = tempChat.length - 1;
		    	rpsGame.chat.push(tempChat[lastChatIndex]);
		    	// rpsGame.chat.push(snapshot.child("chat").val());
				// console.log(rpsGame.getChat());
				chatRef = rpsDatabase.ref("chat");
		    }
		    
		 });

	};
	//used to determine when there are disconnects/reconnects, and if there are already 2 players
	function getPlayerCount() {

		var count = 0;

		rpsDBRef.once("value", function(snapshot) {
			

			if (snapshot.child("players/1").exists()) {
		    	count++;
		    }
			
			if (snapshot.child("players/2").exists()) {
		    	count++;
		    }
		    
		 });

		return count;

	};
	//listener for R P S selection buttons
    $(".btn").on("click", function(event) {

    	getDBData();

    	if ($(this).hasClass("player1-choice")) {
    		player1Choice = $(this).val();
    		$("#player1Select").html("You chose " + player1Choice);
    		if (playerID === "1") {
    			rpsGame.setP1Choice(player1Choice);
    			player1Selected = true;
    		}
    	}
    	if ($(this).hasClass("player2-choice")) {
    		player2Choice = $(this).val();
			$("#player2Select").html("You chose " + player2Choice);    		
    		if (playerID === "2") {
	    		rpsGame.setP2Choice(player2Choice);
	    		player2Selected = true;
    		}
   		}

   			updateDB();

    		updateTurn();
 

	});
    //increase turn count after each turn, but start over at one after each round
	function updateTurn() {

		getDBData();
		
		rpsDBRef.once("value", function(snapshot) {
		var tempTurn = parseInt(snapshot.val().turn);

    	if (tempTurn === 2 && playerID === "2"  && player2Selected === true) {
    		tempTurn++;
    	}
		if (tempTurn === 1 && playerID === "1"  && player1Selected === true) {
    		tempTurn++;
    	}

  		rpsGame.setTurn(tempTurn);
		updateDB();
		//if turn > 2, reset turn counter
     	if (tempTurn > 2) {
    		evaluateWinner();
		}
	
 	});
   		
   	};
   	//determine which player won at end of round, or if tie
	function evaluateWinner() {
		getDBData();
		var	temp1choice;
		var	temp2choice;
		var	temp1wins;
		var	temp2wins;
		var	temp1losses;
		var	temp2losses;
		var	tempp1name;
		var	tempp2name;

			//had issue with endless loop of accelerating counters, now they don't count at all
			rpsDBRef.on("value", function(snapshot) {			
			
			temp1choice = snapshot.child("players/1").val().choice;
			console.log(temp1choice);
			temp2choice = snapshot.child("players/2").val().choice;
			console.log(temp2choice);
			temp1wins = parseInt(snapshot.child("players/1").val().wins);
			console.log(temp1wins);
			temp2wins = parseInt(snapshot.child("players/2").val().wins);
			console.log(temp2wins);
			temp1losses = parseInt(snapshot.child("players/1").val().losses);
			console.log(temp1losses);
			temp2losses = parseInt(snapshot.child("players/2").val().losses);
			console.log(temp2losses);
			tempp1name = snapshot.child("players/1").val().name;
			console.log(tempp1name);
			tempp2name = snapshot.child("players/2").val().name;
			console.log(tempp2name);
		});

			if (temp1choice === "rock" && temp2choice === "paper") {
				temp2wins++;
				temp1losses++;
				rpsGame.setP2Wins(temp2wins++);
				rpsGame.setP1Losses(temp1losses++);
				$("#resultMsg").html(tempp2name + " wins!");
			}
			else if (temp1choice === "rock" && temp2choice === "scissors") {
				rpsGame.setP1Wins(temp1wins++);
				rpsGame.setP2Losses(temp2losses++);
				$("#resultMsg").html(tempp1name + " wins!");
			}
			else if (temp1choice === "paper" && temp2choice === "scissors") {
			rpsGame.setP2Wins(temp2wins++);
				rpsGame.setP1Losses(temp1losses++);
				$("#resultMsg").html(tempp2name + " wins!");	
			}
			else if (temp1choice === "paper" && temp2choice === "rock") {
				rpsGame.setP1Wins(temp1wins++);
				rpsGame.setP2Losses(temp2losses++);
				$("#resultMsg").html(tempp1name + " wins!");	
			}
			else if (temp1choice === "scissors" && temp2choice === "rock") {
				rpsGame.setP2Wins(temp2wins++);
				rpsGame.setP1Losses(temp1losses++);
				$("#resultMsg").html(tempp2name + " wins!");	
			}
			else if (temp1choice === "scissors" && temp2choice === "paper") {
				rpsGame.setP1Wins(temp1wins++);
				rpsGame.setP2Losses(temp2losses++);
				$("#resultMsg").html(tempp1name + " wins!");	
			}
			else {
				$("#resultMsg").html("You tied!");

			}

			updateDB();
		//this is reset by R P S button click event
	    player1Selected = false;
    	player2Selected = false;
		
		
		updateDB();
		toggleChoiceButtons();
	};
	//load data into firebase from game object
	function updateDB() {
		console.log("update DB");
		
			rpsDBRef.set({
			players: {
				1: rpsGame.player1, 
				2: rpsGame.player2 
				}, 
			turn: rpsGame.getTurn()
	      	});



	};
	//hide all buttons on start (except form buttons)	
	$(".btn").hide();

    //event listener on the start button
    $("#start-button").on("click", function(event) {
        
        //prevent the start button from opening new page
        event.preventDefault();
        
        //get the player name from the text box entry
        playerName = $("#name-input").val().trim();
        console.log(playerName);

        //check player count - gate to prevent third parties from joining
        playerCount = getPlayerCount();
        if (playerCount === maxPlayers) {
			$("#gameMsg").html("Sorry " + playerName + ", but there are already two players.");
			denied = true; // if someone tried to play but was rejected, this flag will trigger an alert
        }

        else {
        
      
        initGame();
        createPlayer();
        toggleChoiceButtons();
        toggleMessages();
        
        }
    });















});