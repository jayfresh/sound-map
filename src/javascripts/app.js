// Sound Map App

$( document ).ready(function() {

	// vars

    var xPosition;
    var yPosition;
    var coordinates = [{x:0,y:0}];
    var velocity = 0.05; // higher = faster
    var totalDistance;
    
    var soundX = 100;
    var soundY = 100;

    var soundSources = [{x:200,y:200,url:'images/sound.mp3'},{x:300,y:300,url:'images/sound2.mp3'}];

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

	
	// Add Soundsource dots to map

	function addSoundSource(x,y) {
		$('.soundMap').append($('<div class="sound"></div>')
			.css({top: y, left: x, position: 'absolute'})
	    )
	}

	// Loop through soundsource array and put dots on map

	for (index = 0; index < soundSources.length; ++index) {
		addSoundSource(soundSources[index].x,soundSources[index].y);
	}


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
			progress: function() { // NB 'step' seems to do the same as progress ??

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
		volumeNode.gain.value = volumeLevel;
	}



	$( ".moveActor" ).on( "click", function(e) {
		// loop over coordinates array and move actor between dots

		for (index = 0; index < coordinates.length-1; ++index) {

		    currentX = coordinates[index].x;
		    nextX = coordinates[index+1].x;
			currentY = coordinates[index].y;
			nextY = coordinates[index+1].y;

		    // get distance to apply duration multiple (shorter distance = lower duration)
		    var distance = getDistance(currentX,currentY,nextX,nextY);

		    var time = distance/velocity;

		    moveActor('.mover', coordinates[index+1].x, coordinates[index+1].y, time);
		    
		}
	});

    // Web Audio API set up using buffer-loader.js )
	// code from http://www.html5rocks.com/en/tutorials/webaudio/intro/

    window.onload = init;
    var context;
    var bufferLoader;

    function init() {
      // Fix up prefixing
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();

      bufferLoader = new BufferLoader(
        context,
        [
          soundSources[0].url, // Would like this to be neater (eg. use a 'for' loop over soundSources object)
          soundSources[1].url,
        ],
        finishedLoading
        );

      bufferLoader.load();
    }


    // Declared these vars so the volume controls don't throw 'undefined' errors
    var gainNode,
    	gain,
    	value;


    function finishedLoading(bufferList) {
		for (index = 0; index < soundSources.length; ++index) {
			var source = context.createBufferSource();
			source.buffer = bufferList[index];


			// connect gain node - This doesn't appear to work
			var gainNode = context.createGain();
			source.connect(gainNode);
			gainNode.connect(context.destination);

			source.connect(context.destination);
			source.start(0);
			gainNode.gain.value = 0;
		}
    }

    // TEST: set volumes- These don't work

    document.querySelector('.setVolumeOne').addEventListener('click', function() {
    	gainNode.gain.value = 0;
    });

    document.querySelector('.setVolumeTwo').addEventListener('click', function() {
    	gainNode.gain.value = 0;
    });



});















	// Web Audio API handling - commented as using buffer-loader class above

	// from http://jsfiddle.net/5gfB3/83/ or http://creativejs.com/resources/web-audio-api-getting-started/ 

    /*var context, 
        soundSource, 
        soundBuffer;
        //url = 'images/sound.mp3';

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
    	
    	for (index = 0; index < soundSources.length; ++index) {
    		// addSoundSource(soundSources[index].x,soundSources[index].y);

    		// Note: this loads asynchronously
    		var request = new XMLHttpRequest();
    		request.open("GET", soundSources[index].url, true);
    		request.responseType = "arraybuffer";

    		// Our asynchronous callback
    		request.onload = function() {
    		    var audioData = request.response;
    		    audioGraph(audioData);
    		};
    		request.send();
    	}
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
    */








