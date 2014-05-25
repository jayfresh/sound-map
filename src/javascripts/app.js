$( document ).ready(function() {

// vars

    var distance;
    var xPosition;
    var yPosition;
    var coordinates = new Array();

// function to get distance between two points

function getDistance(x1,y1,x2,y2) {

	// pythagoras / a2 + b2 = c2

	var distance = (y2-y1)*(y2-y1)+(x2-x1)*(x2-x1);
	var distance = Math.sqrt(distance);
	console.log("getDistance() var (pre-return) "+distance);	

	printDistance(distance);

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

	// To-do: tidy this up- why does coordinates[coordinates.length-1].x not work???
	var ultimateX = coordinates[endOfArray].x;
	var penultimateX = coordinates[adjacentToEndOfArray].x;

	var ultimateY = coordinates[endOfArray].y;
	var penultimateY = coordinates[adjacentToEndOfArray].y;

	getDistance(penultimateX, penultimateY, ultimateX, ultimateY);

	// why does this not get the (distance) var returned from the getDistance() func????

	console.log("the returned var = "+distance);

});


});




