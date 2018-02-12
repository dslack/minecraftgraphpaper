 
YUI().use("node", "slider", "json", "dial", function(Y) {

var base = 0.4;
var baseSize = 0.2;

var bottomSide = {
	type: "geometry",

	/* Indices for first three faces
	 */
	indices : [
		16,17,18,
		16,18,19
	]
};

var topSide = {
	type: "geometry",
	indices: [
		8, 9,10,
        8,10,11
	]
};

var allExceptTopSides = {
	type: "geometry",
	indices: [
		0,1,2,
		0,2,3,
		4,5,6,
		4,6,7,
		12,13,14,
		12,14,15,
		16,17,18,
		16,18,19,
		20,21,22,
		20,22,23
	]
};

var customCube =  function() {
	return {
		type: "geometry",
		positions : [
			/* v0-v1-v2-v3 front
			 */
			baseSize, baseSize, baseSize,
			-baseSize, baseSize, baseSize,
			-baseSize,-baseSize, baseSize,
			baseSize,-baseSize, baseSize,
			/* v0-v3-v4-v5 right
			 */
			baseSize, baseSize, baseSize,
			baseSize,-baseSize, baseSize,
			baseSize,-baseSize,-baseSize,
			baseSize, baseSize,-baseSize,
			/* v0-v5-v6-v1 top
			 */
			baseSize, baseSize, baseSize,
			baseSize, baseSize,-baseSize,
			-baseSize, baseSize,-baseSize,
			-baseSize, baseSize, baseSize,
			/* v1-v6-v7-v2 left
			 */
			-baseSize, baseSize, baseSize,
			-baseSize, baseSize,-baseSize,
			-baseSize,-baseSize,-baseSize,
			-baseSize,-baseSize, baseSize,
			/* v7-v4-v3-v2 bottom
			 */
			-baseSize,-baseSize,-baseSize,
			baseSize,-baseSize,-baseSize,
			baseSize,-baseSize, baseSize,
			-baseSize,-baseSize, baseSize,
			/* v4-v7-v6-v5 back
			 */
			baseSize,-baseSize,-baseSize,
			-baseSize,-baseSize,-baseSize,
			-baseSize, baseSize,-baseSize,
			baseSize, baseSize,-baseSize
		],
		normals : [
			/* v0-v1-v2-v3 front
			 */
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			/* v0-v3-v4-v5 right
			 */
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			/* v0-v5-v6-v1 top
			 */
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,
			/* v1-v6-v7-v2 left
			 */
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			/* v7-v4-v3-v2 bottom
			 */
			0,1, 0,
			0,1, 0,
			0,1, 0,
			0,1, 0,
			/* v4-v7-v6-v5 back
			 */
			0, 0,1,
			0, 0,1,
			0, 0,1,
			0, 0,1
		],
		uv : [
			/* v0-v1-v2-v3 front
			 */
			baseSize, baseSize,
			0, baseSize,
			0, 0,
			baseSize, 0,
			/* v0-v3-v4-v5 right
			 */
			0, baseSize,
			0, 0,
			baseSize, 0,
			baseSize, baseSize,
			/* v0-v5-v6-v1 top
			 */
			baseSize, 0,
			baseSize, baseSize,
			0, baseSize,
			0, 0,
			/* v1-v6-v7-v2 left
			 */
			baseSize, baseSize,
			0, baseSize,
			0, 0,
			baseSize, 0,
			/* v7-v4-v3-v2 bottom
			 */
			0, 0,
			baseSize, 0,
			baseSize, baseSize,
			0, baseSize,
			/* v4-v7-v6-v5 back
			 */
			0, 0,
			baseSize, 0,
			baseSize, baseSize,
			0, baseSize
		]
	}
};
 
var cfg = {applyTo:"baseColor",
	blendMode: "multiply",
	minFilter: "linear",
	magFilter: "linear",
	wrapS: "repeat",
	wrapT: "repeat",
	isDepth: false,
	depthMode:"luminance",
	depthCompareMode: "compareRToTexture",
	depthCompareFunc: "lequal",
	flipY: false,
	width: 1,
	height: 1,
	internalFormat:"lequal",
	sourceFormat:"alpha",
	sourceType: "unsignedByte",
	scale: {x:4,y:4,z:4}
};
 function getImage(moreCfg) {
	var lclCfg = {};
	for (c in cfg) {
		lclCfg[c] = cfg[c];
	}
	for (c in moreCfg) {
		lclCfg[c] = moreCfg[c];
	}
	return lclCfg;
 }
 
	var groundImg = getImage({uri:"resources/images/grass.png", rotate: 0.0, translate: {x:0,y:0},scale:{x:200,y:200, z: 1}});
	var cobbleStoneImg = getImage({uri:"resources/images/cobblestone.png"});
	var woodImg = getImage({uri:"resources/images/lumber.png"});
	var vertTrackImg = getImage({uri:"resources/images/track.png"});
	var horizTrackImg = getImage({uri:"resources/images/track_horiz.png", });
	var grassImg = getImage({uri:"resources/images/grass.png"});
	var dirtImg = getImage({uri:"resources/images/dirt.png"});
	var sandstoneImg = getImage({uri:"resources/images/sandstone.png"});
	
	var stepImg = getImage({uri:"resources/images/stepTexture.png"});
	
var typeToImg = {"stone": cobbleStoneImg, "wood": woodImg, "vertTrack" : vertTrackImg, "horizTrack": horizTrackImg, "step": stepImg, "sandstone":sandstoneImg};
	
 var texture = function(image, nodes) {
	return {type:"texture", layers: [image], nodes: nodes};
 }

var cube = function(x,y,z) {
	return {type: "cube", xSize: x, ySize: y, zSize: z};
}

var inc = function(val) {
	return base + val;
}

var mul = function(val) {
	return base*val;
}

var translate = function(x,y,z, nodes) {
	return {type:"translate",
		x:x,
		y:y,
		z:z,
		nodes:nodes
	}
}

var scaleFn = function(x,y,z, nodes) {
	return {type: "scale",
		x: x,
		y: y,
		z : z,
		nodes: nodes
	}
}

var materialFn = function(alpha, nodes) {
	return {type: "material",
			baseColor:      { r: 1, g: 1, b:1 },
			specularColor:  { r:0.9, g: 0.9, b: 0.9 },
			specular:       0.9,
			shine:         6,
			nodes: nodes
	}
};

//Create Cubes..


var stdCube = cube(baseSize,baseSize,baseSize);

var cubes = {};
var max = 0;


var bottomCube = customCube();
bottomCube.nodes = [materialFn(1,[bottomSide])];

var grassCube = customCube();
grassCube.nodes = [texture(grassImg, [materialFn(1,[topSide])]), texture(dirtImg, [materialFn(1, [allExceptTopSides])])];

var halfCube = cube(baseSize, baseSize/2, baseSize);

var stepCube = customCube();
stepCube.nodes = [texture(stepImg, [halfCube])];

var dblStepCube = customCube();
dblStepCube.nodes = [texture(stepImg, [halfCube,translate(0,baseSize,0, [halfCube])])];

var data = Y.JSON.parse(localStorage.getItem('graphPaper'));
Y.Array.each(data, function(val, idx, arr) {
	var cubeType = stdCube;
	var y = (idx+1)*base;
	var data = Y.JSON.parse(val);
	for (c in data) {
		var item = data[c];
		//normalize the positions.....
		var x = item.pos.x/30;
		var z = item.pos.y/30;
		
		max = (max > x) ? max : x;
		max = (max > z) ? max : z;

		x -= 15;
		z -= 15;
		
		if (!cubes[item.type]) {
			cubes[item.type] = {type: "", cubes:[]};
		}
		
		if (item.type === 'vertTrack' || item.type === 'horizTrack') {
			cubeType = bottomCube;
		}
		else if (item.type === 'dirt') {
			cubeType = grassCube;
		}
		else if (item.type === 'step') {
			if (item.state === 'state1') {
				cubeType = stepCube;
			} else {
				cubeType = dblStepCube;
			}
		}
		else {
			cubeType = stdCube;
		}
		//We don't want the cubes exactly touching, as that causes bleed through...
		//So, we add a small margin to the Y value per level..
		//Level 1: 1.01, level 2 : 2.02, level 3: 3.03
		cubes[item.type].type = item.type;
		cubes[item.type].cubes.push(translate(mul(x), y+(y*.01), mul(z), [cubeType]));
	}
});


//var planarCube = texture(grass,[cube(max/2,baseSize,max/2)]);
var scaled =  scaleFn(100,.1,100, [stdCube]);
				
var totalCubes = [];			
totalCubes.push(texture(groundImg,[scaled]));

Y.Object.each(cubes, function(val,key) {
	var img = typeToImg[val.type];
	if (img) {
		totalCubes.push(texture(img, val.cubes));
	}
	else {
		Y.Array.each(val.cubes, function(val) { totalCubes.push(val);});
	}
});

							
							
var grassTxt = translate(0,0,0,totalCubes);


try {
SceneJS.createNode({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",

    nodes: [
        {
            type: "lookAt",
			id: "looking",
            eye : { x: 1.0, y: 0.0, z: -10},
            look : { x : 0.0, y : 0.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        //fovy : 45.0,
						fovy : 60.0,
                        aspect : 1.47,
						//aspect : 0,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [
                        {
                            type: "material",
                            baseColor:      { r: 1, g: 1, b:1 },
                            specularColor:  { r:1, g: 1.0, b: 1 },
                            specular:       0.5,
                            shine:          10.0,
							nodes: [
                                {
									type: "rotate",
									id: "pitch",
									angle: -47.0,
									x : 1.0,

									nodes: [
										{
											type: "rotate",
											id: "yaw",
											angle:180.0,
											y : 1.0,
											nodes: [
											grassTxt
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});
} catch (e) {
	alert(e.message);
}
/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

 var dial = new Y.Dial({ min:-220, max: 220, stepsPerRev: 100, value:30});
 dial.render("#canvasContainer div.rotate");
 
var yaw = 180;
var pitch = -47;
var zoom = -20;
var lastX;
var lastY;
var dragging = false;

var lookX = 0, lookY = 0;

var control = "move";

/* For texture animation
 */
var timeLast = (new Date()).getTime();

var canvas = document.getElementById("theCanvas");

var zoomEl = document.getElementById("zoom");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
	
	control = Y.one("#controls input[type=radio]:checked").get("value");
}

function mouseUp() {
    dragging = false;
}

function mouseMove(event) {
    if (dragging) {
		if (control === 'rotate') {
			yaw += (event.clientX - lastX) * 0.5;
			var newPitch = pitch + (event.clientY - lastY) * -0.5;
			if (newPitch <=-5 && newPitch >= -175) {
				pitch = newPitch;
			}
			Y.one("#log").set("innerHTML", "Pitch:" + pitch+", yaw:" +yaw);
			
		}
		else {
			lookX += (event.clientX - lastX)*-0.05;
			lookY += (event.clientY - lastY) *- 0.05;
		}
		lastX = event.clientX;
		lastY = event.clientY;
    }
}


canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

canvas.addEventListener('mousewheel', mouseWheel, true);

canvas.addEventListener('DOMMouseScroll', mouseWheel, true);

function mouseWheel(event) {
    var delta = 0;
    if (!event) event = window.event;
    if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
        if (window.opera) delta = -delta;
    } else if (event.detail) {
        delta = -event.detail / 3;
    }
	Y.one("#log").set("innerHTML", "Delta:" + delta);
	zoom += delta;
}


window.render = function() {
    SceneJS.withNode("pitch").set("angle", pitch);
    SceneJS.withNode("yaw").set("angle", yaw);
	SceneJS.withNode("looking")._targetNode.setEyeZ(zoom);
	SceneJS.withNode("looking")._targetNode.setLook({x:lookX, y:lookY, z:0});
    SceneJS.withNode("theScene").render();
};

SceneJS.bind("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.bind("reset", function() {
    window.clearInterval(pInterval);
});

var pInterval = setInterval("window.render()", 10);

});