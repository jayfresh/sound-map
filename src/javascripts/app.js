$( document ).ready(function() {

// vars

    var xPosition;
    var yPosition;
    var coordinates = [{x:0,y:0}];
    var velocity = 0.05; // higher = faster
    var totalDistance;
    
    var soundX = 100;
    var soundY = 100;

    var maxAudibleDistance = 100;
    
    var volumeNode;

	// function to get distance between two points

	function getDistance(x1,y1,x2,y2) {

		var distance = (y2-y1)*(y2-y1)+(x2-x1)*(x2-x1); // pythagoras:  a2 + b2 = c2
		var distance = Math.sqrt(distance);

		return (distance);
		
	};

	// get Click Position

	function getClickPosition(e) {
	    var parentPosition = getPosition(e.currentTarget);
	    xPosition = e.clientX - parentPosition.x;
	    yPosition = e.clientY - parentPosition.y;
	    return(xPosition,yPosition);
	}
	 
	function getPosition(element) {
	     	var xPosition = 0;
	    	var yPosition = 0;
	    while (element) {
	        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
	        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
	        element = element.offsetParent;
	    }
	    return { x: xPosition, y: yPosition };
	}

	// create positions on soundMap

	 $( ".soundMap" ).on( "click", function(e) {
	 	getClickPosition(e);
	 	plotDot(xPosition,yPosition,"dot");
	 	addPositionToArray(xPosition,yPosition);
	 });

	// Add dot to sound map

	function plotDot(x,y) {
		$('.soundMap').append($('<div class="dot"></div>')
			.css({top: y, left: x, position: 'absolute'})
	    )
	}

	// Add Sound source dot to map - Test Code
	function addSoundSource(x,y) {
		$('.soundMap').append($('<div class="sound"></div>')
			.css({top: y, left: x, position: 'absolute'})
	    )
	}
	addSoundSource(soundX,soundY);


	// put click positions into array

	function addPositionToArray(xPosition, yPosition) {
		var point = {x: xPosition, y: yPosition};
		coordinates.push(point);
		printCoordinates(xPosition, yPosition);
	}

	// functions to display data

	function printCoordinates(xPosition, yPosition) {
		$('.coordinates').append($("<p>x = " + xPosition + ", y = " + yPosition + "</p>"));
	}

	function printDistance(distance) {
		$('.results').append($("<p>Distance = " + distance + "</p>"));
	}

	// run getDistance onClick

	$( ".getDistance" ).on( "click", function(e) {

		// set up vars to deal with getting the last 2 objects in the array
		var endOfArray = coordinates.length-1;
		var adjacentToEndOfArray = coordinates.length-2;

		var ultimateX = coordinates[endOfArray].x;
		var penultimateX = coordinates[adjacentToEndOfArray].x;

		var ultimateY = coordinates[endOfArray].y;
		var penultimateY = coordinates[adjacentToEndOfArray].y;
		
		var distance = getDistance(penultimateX, penultimateY, ultimateX, ultimateY);

		printDistance(distance);
	});

	// function to move a point to a coordinate
	function moveActor(actor, toX, toY, duration) {
		$(actor).animate({
			'top': toY, 
			'left': toX 
		}, {
			duration: duration,
			easing: "linear",
			/*
			complete: function() {
				console.log('complete!');
			},
			step: function() {
				console.log('step!');
			},
			*/
			progress: function() {
				// get position of actor
				var position = getPosition(this);

				// get distance from actor to another position 
				var distance = getDistance(soundX,soundY,position.x,position.y);
				// set distance maximum 
				if (distance > maxAudibleDistance) {
					distance = maxAudibleDistance;
				}

				// control volume with distance
				setVolume(distance);
			}
		});
	}

	// Set Volume using distance
	function setVolume(distance) {

		// equation courtesy of @jayfresh: y = 1 - x/100 
		volumeLevel = 1 - (distance / maxAudibleDistance);
		// console.log ('volume: ',volumeLevel,' distance: ',distance);

		// console.log('running setVolume');

		volumeNode.gain.value = volumeLevel;
	}



	$( ".moveActor" ).on( "click", function(e) {
		// loop over coordinates array and move actor between dots
		/* coordinates.forEach(function(coordinate) {
		    moveActor('.mover', coordinate.x, coordinate.y, moveSpeed);
		}); */

		for (index = 0; index < coordinates.length-1; ++index) {

		    currentX = coordinates[index].x;
		    nextX = coordinates[index+1].x;
			currentY = coordinates[index].y;
			nextY = coordinates[index+1].y;

		    // get distance to apply duration multiple (shorter distance = lower duration)
		    var distance = getDistance(currentX,currentY,nextX,nextY);

		    var time = distance/velocity;

		    //getTotalDistance();
		    moveActor('.mover', coordinates[index+1].x, coordinates[index+1].y, time);
		    
		}
	});

	function getTotalDistance() {
		console.log('running totalDistance!');
		var totalDistance;
		for (index = 0; index < coordinates.length; ++index) {
		    currentX = coordinates[index].x;
		    nextX = coordinates[index+1].x;
			currentY = coordinates[index].y;
			nextY = coordinates[index+1].y;
		    var distance = getDistance(currentX,currentY,nextX,nextY);
		    totalDistance =+ distance;
		}
		console.log('totalDistance: ' + totalDistance);
	}

	// Web Audio API handling, from http://jsfiddle.net/5gfB3/83/ or http://creativejs.com/resources/web-audio-api-getting-started/ 

    var context, 
        soundSource, 
        soundBuffer,
        url = 'images/sound.mp3';

    // Step 1 - Initialise the Audio Context (tests for browser compatibility)
    function init() {
        if (typeof AudioContext !== "undefined") {
            context = new AudioContext();
        } else if (typeof webkitAudioContext !== "undefined") {
            context = new webkitAudioContext();
        } else {
            throw new Error('AudioContext not supported. :(');
        }
    }

    // Step 2: Load our Sound using XHR
    function startSound() {
        // Note: this loads asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        // Our asynchronous callback
        request.onload = function() {
            var audioData = request.response;
            audioGraph(audioData);
        };
        request.send();
    }

    // Tell the source when to start (ie. now)
    function playSound() {
        soundSource.noteOn(context.currentTime);
    }

    function stopSound() {
        soundSource.noteOff(context.currentTime);
    }

    // Events for the play/stop bottons
    document.querySelector('.play').addEventListener('click', startSound);
    document.querySelector('.stop').addEventListener('click', stopSound);
    
    // Testing asynchronous volume control
    document.querySelector('.setVolume').addEventListener('click', function() {
    	volumeNode.gain.value = 0.5;
    });
	


    // audioGraph configuration
    function audioGraph(audioData) {
        soundSource = context.createBufferSource();
        soundBuffer = context.createBuffer(audioData, true);
        soundSource.buffer = soundBuffer;

        volumeNode = context.createGainNode();

        //Set the volume
        volumeNode.gain.value = 0.1;
        // console.log(volumeNode.gain.value);

        // Wiring
        soundSource.connect(volumeNode);
        volumeNode.connect(context.destination);

        // Finally
        playSound(soundSource);
    }


    init();











});




