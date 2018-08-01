// Sound Map App
var soundSources = [{x:200,y:200,url:'images/sound.mp3'},{x:300,y:300,url:'images/sound2.mp3'}];

$(document).ready(function() {

	// vars
	var xPosition;
	var yPosition;
	var coordinates = [{x:0,y:0}];
  var velocity = 0.05; // higher = faster
  var totalDistance;
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

	$(".soundMap").on("click", function(e) {
		getClickPosition(e);
		plotDot(xPosition,yPosition,"dot");
		addPositionToArray(xPosition,yPosition);
	});

	// Add dot to sound map

	function plotDot(x,y) {
		$('.soundMap').append(
			$('<div class="dot" draggable="true"></div>')
			.css({top: y, left: x, position: 'absolute'})
			);
	}
	
	function clearDots() {
		$('.soundMap div.dot').remove();
	}
	
	// Add Soundsource dots to map

	function addSoundSource(x,y) {
		$('.soundMap').append(
			$('<div class="sound"></div>')
			.css({top: y, left: x, position: 'absolute'})
			);
		var svg = document.getElementsByTagName('svg')[0],
		circle;
		if(!svg) {
			var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.width = 400;
			svg.height = 400;
			document.getElementsByClassName('soundMap')[0].appendChild(svg);
		}
		circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circle.setAttribute("cx", x);
		circle.setAttribute("cy", y);
		circle.setAttribute("r", maxAudibleDistance);
		svg.appendChild(circle);
	}

	// Loop through soundsource array and put dots on map

	for (index = 0; index < soundSources.length; index++) {
		addSoundSource(soundSources[index].x,soundSources[index].y);
	}

	// put click positions into array

	function addPositionToArray(xPosition, yPosition) {
		var point = {x: xPosition, y: yPosition};
		coordinates.push(point);
		printCoordinates(xPosition, yPosition);
	}

	// functions to display data

	function printCoordinates() {
		$('.coordinates').empty();
		coordinates.forEach(function(coordinate) {
			$('.coordinates').append($("<p>x = " + coordinate.x + ", y = " + coordinate.y + "</p>"));
		});
	}

	function printDistance(distance) {
		$('.results').append($("<p>Distance = " + distance + "</p>"));
	}

	// run getDistance onClick

	$(".getDistance").on("click", function(e) {

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
				var position = getPosition(this),
				distance,
				soundSource,
				  index; // use a counter that's inside this scope so it doesn't mess with the global counter

				// get distance from actor to position of each sound
				for(index = 0; index<soundSources.length; index++) {
					soundSource = soundSources[index];
					distance = getDistance(soundSource.x,soundSource.y,position.x,position.y);

    			// set distance maximum 
    			if (distance > maxAudibleDistance) {
    				distance = maxAudibleDistance;
    			}

  				// control volume with distance
  				setVolume(distance, index);
  			}
			},
			complete: function() {
				// after finishing a run, reduce coordinates to only last point
				coordinates = [coordinates[coordinates.length - 1]];
				clearDots();
				printCoordinates();
				$('.moveActor').attr('disabled', null);
			}
  	});
	}

	// Set Volume using distance for a sound source
	function setVolume(distance, sourceIndex) {
		// equation courtesy of @jayfresh: y = 1 - x/100
		volumeLevel = 1 - (distance / maxAudibleDistance);
		soundSources[sourceIndex].gainNode.gain.value = volumeLevel;
	}

	$(".moveActor").on("click", function(e) {
		$(this).attr('disabled', 'disabled');
		// loop over coordinates array and move actor between dots
    // coordinates starts with an entry at 0,0
    for (index = 0; index < coordinates.length-1; index++) {
    	currentX = coordinates[index].x;
    	nextX = coordinates[index+1].x;
    	currentY = coordinates[index].y;
    	nextY = coordinates[index+1].y;

	    // get distance to apply duration multiple (shorter distance = lower duration)
	    var distance = getDistance(currentX,currentY,nextX,nextY);
	    var time = distance/velocity;
	    moveActor('.mover', nextX, nextY, time);
		}
	});
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

function finishedLoading(bufferList) {
	console.log('finishedLoading');
	$(".moveActor").html('Go!');
	for (var index = 0; index < soundSources.length; index++) {

		var source = context.createBufferSource();
		source.buffer = bufferList[index];

		// connect gain node between source and destination
		var gainNode = context.createGain();
		source.connect(gainNode);
		gainNode.connect(context.destination);
		// set initial volume
		gainNode.gain.value = 0;
		source.start();

    // save the source and gainNode onto the sourceSource
    // to have separately controlable gain nodes for each sound
    soundSources[index].source = source;
    soundSources[index].gainNode = gainNode;
  }
}

// load map behaviour, called by callback in API script tag
function initMap () {
	// The location of the forum at Pompeii
	var pompeii = {lat: 40.7494616, lng: 14.4846853};
	// The map, centered at Pompeii
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 19,
		center: pompeii,
		mapTypeId: 'hybrid',
		disableDefaultUI: true
	});
	// The marker, positioned at Uluru
	// var marker = new google.maps.Marker({position: uluru, map: map});
}

// TEST: set volumes to 0

document.querySelector('.setVolumeOne').addEventListener('click', function() {
	soundSources[0].gainNode.gain.value = 0;
});

document.querySelector('.setVolumeTwo').addEventListener('click', function() {
	soundSources[1].gainNode.gain.value = 0;
});

// drag handling: from http://jsfiddle.net/HtubL/57/ (doesn't work)

var container  = $('.soundMap');   // The element dots can be dragged within
var draggables = $('.dot'); // The dots


// Loop through and pass to our super function
for(var i = 0, l = draggables.length; i < l; ++i)
    makeDraggable(draggables[i], container); 


function makeDraggable(draggable, container){
  // In case you don't want to have a container
  var container = container || window;
  // So we know what to do on mouseup:
  // At this point we're not sure the user wants to drag
  var dragging  = false;

      // The movement listener and position modifier
      function dragHandler(moveEvent){
      	moveEvent.preventDefault();

      	dragging        = true;

          // Ascertain where the mouse is
          var coordinates = [
          moveEvent.clientX,
          moveEvent.clientY
          ];

          // Style properties we need to apply to the element 
          var styleValues = {
          	position : 'absolute',
          	left     : coordinates[0] + 'px',
          	top      : coordinates[1] + 'px'
          };

          // Apply said styles
          for(property in styleValues){
          	if(styleValues.hasOwnProperty(property)){
          		draggable.style[property] = styleValues[property];
          	}
          }
      }

      function dropHandler(upEvent){
      // Only interfere if we've had a drag event
      if(dragging === true){
          // We don't want the button click event to fire!
          upEvent.preventDefault();

          // We don't want to listen for drag and drop until this is clicked again
          container.removeEventListener('mousemove', dragHandler, false);
          draggable.removeEventListener('mouseup',   dropHandler, false);

          dragging = false;
      }
  }

  // Where all the fun happens
  draggable.addEventListener('mousedown', function dragListener(downEvent){
  	console.log("dragging!");
  	downEvent.preventDefault();

      // The drag event
      container.addEventListener('mousemove', dragHandler, false);

      // The end of drag, if dragging occurred
      draggable.addEventListener('mouseup',   dropHandler, false);
  }, false);
}

















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
