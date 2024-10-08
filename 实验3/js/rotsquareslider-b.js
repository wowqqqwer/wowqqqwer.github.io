"use strict";

var canvas;
var gl;

var theta = 0.0;
var thetaLoc1;
var thetaLoc2;
var direction = 1;
var speed = 50;



function changeDir(){
	direction *= -1;
}

function initRotSquare(){
	canvas = document.getElementById( "rot-canvas" );
	gl = canvas.getContext("webgl2");
	if( !gl ){
		alert( "WebGL isn't available" );
	}

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.0, 0.0, 0.0, 0.0 );

	

	var vertices1 = new Float32Array([
		0,  0,  0,
		1,  0,  0,
		0,  0,  0,
		0.5,0.5,0,
		0,  0,  0,
		0,  0,  0,
	   -1,  0,  0,
	   0,  0,  0,
		-0.5,-0.5,0,
		0,  0,  0,
		0,  0,  0,
		0,  1,  0,
		0,  0,  0,
		-0.5,0.5,0,
		0,  0,  0,
		0,  0,  0,
		0,  -1,  0,
		0,  0,  0,
		0.5,-0.5,0,
	    0,  0,  0,
	]);

	
	
	var program1 = initShaders( gl, "rot-v-shader", "rot-f-shader" );
	gl.useProgram( program1 );	
		
	var bufferId1 = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId1 );
	gl.bufferData( gl.ARRAY_BUFFER, vertices1, gl.STATIC_DRAW );

	var vPosition1 = gl.getAttribLocation( program1, "vPosition" );
	gl.vertexAttribPointer( vPosition1, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition1 );

	thetaLoc1 = gl.getUniformLocation( program1, "theta" );

	document.getElementById( "speedcon" ).onchange = function( event ){
		speed = 100 - event.target.value;
	}
	renderSquare1();
	

}

function renderSquare1(){
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	// set uniform values
	theta += direction * 0.1;
	
	gl.uniform1f( thetaLoc1, theta );

	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 20 );

	// update and render
	setTimeout( function(){ requestAnimFrame( renderSquare1 ); }, speed );
}
