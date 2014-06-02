$( document ).ready(function() {

// vars

    var xPosition;
    var yPosition;
    var coordinates = new Array();
    var velocity = 0.1; // higher = slower
    var totalDistance;

// function to get distance between two points

function getDistance(x1,y1,x2,y2) {

	var distance = (y2-y1)*(y2-y1)+(x2-x1)*(x2-x1); // pythagoras:  a2 + b2 = c2
	var distance = Math.sqrt(distance);

	return (distance); // not working???
	
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
 	plotDot(xPosition,yPosition);
 	addPositionToArray(xPosition,yPosition);
 });

// Add dot to sound map

function plotDot(x,y) {
	$('.soundMap').append($('<div class="dot"></div>')
		.css({top: y, left: x, position: 'absolute'})
    )
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
	$(actor).animate({'top': toY, 'left': toX },duration);
}

$( ".moveActor" ).on( "click", function(e) {
	// loop over coordinates array and move actor between dots
	/* coordinates.forEach(function(coordinate) {
	    moveActor('.mover', coordinate.x, coordinate.y, moveSpeed);
	}); */

	for (index = 0; index < coordinates.length; ++index) {

		// to-do: this doesn't account for the end of the array when checking distances

	    currentX = coordinates[index].x;
	    nextX = coordinates[index+1].x;
		currentY = coordinates[index].y;
		nextY = coordinates[index+1].y;

	    // get distance to apply duration multiple (shorter distance = lower duration)
	    var distance = getDistance(currentX,currentY,nextX,nextY);

	    getTotalDistance();
	    moveActor('.mover', coordinates[index].x, coordinates[index].y, distance/velocity);
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


// smaller distance = shorter duration

// speed = 10
// distance = 20
// distance = 100

// time = distance / velocity












});




