// HelloPoint1.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform vec4 u_FragColor;
  uniform vec3 u_LightPos;
  uniform vec3 u_SpotLightPos;
  uniform vec3 u_CameraPos;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_WhichTexture;
  uniform bool u_LightOnOff;
  uniform bool u_SpotLightOn;
  uniform vec3 u_SpotLightDir;
  uniform float u_SpotLightAng;
  void main() {
    vec4 wallTexture = texture2D(u_Sampler0, v_UV);
    vec4 bush = texture2D(u_Sampler1, v_UV);
    vec4 grassTexture = texture2D(u_Sampler2, v_UV);

    if (u_WhichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_WhichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_WhichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_WhichTexture == 0) {
      //gl_FragColor = 0.5 * bodyTexture + 0.5 * u_FragColor;
      gl_FragColor = wallTexture;
    } else if (u_WhichTexture == 1) {
      gl_FragColor = bush;
    } else if (u_WhichTexture == 2) {
      gl_FragColor = grassTexture;
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }

    float specular = 0.0;
    vec3 diffuse = vec3(0.0, 0.0, 0.0);
    vec3 ambient = vec3(0.0, 0.0, 0.0);
    vec3 sdiffuse = vec3(0.0, 0.0, 0.0);
    vec3 sambient = vec3(0.0, 0.0, 0.0);
    float sspecular = 0.0;

    if (u_LightOnOff) {

      vec3 lightVector = u_LightPos - vec3(v_VertPos);
      float r = length(lightVector);
      //if (r < 1.0) {
      //  gl_FragColor = vec4(1,0,0,1);
      //} else if (r < 2.0) {
      //  gl_FragColor = vec4(0,1,0,1);
      //}

      //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

      // N dot L
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float NdotL = max(dot(N,L), 0.0);

      // Reflection
      vec3 R = reflect(-L, N);

      // eye
      vec3 E = normalize(u_CameraPos-vec3(v_VertPos));

      // Specular
      specular = pow(max(dot(E,R), 0.0), 50.0);

      diffuse = vec3(gl_FragColor) * NdotL;
      ambient = vec3(gl_FragColor) * 0.3;
    }
    
    if (u_SpotLightOn) {
      // spotlight -------------------------------------------------
      vec3 SpotLightVector = u_SpotLightPos - vec3(v_VertPos);
      vec3 spotlightDir = normalize(u_SpotLightDir);
      float ang = dot(normalize(SpotLightVector), -normalize(u_SpotLightDir));

      if (ang > cos(radians(u_SpotLightAng))) {
        // N dot L
        vec3 sL = normalize(SpotLightVector);
        vec3 sN = normalize(v_Normal);
        float sNdotL = max(dot(sN,sL), 0.0);

        // Reflection
        vec3 sR = reflect(-sL, sN);

        // eye
        vec3 sE = normalize(u_CameraPos-vec3(v_VertPos));

        // Specular
        sspecular = pow(max(dot(sE,sR), 0.0), 50.0);

        sdiffuse = vec3(gl_FragColor) * sNdotL;
        
      }
      ambient = vec3(gl_FragColor) * 0.3;
    }

    if (u_SpotLightOn || u_LightOnOff) {
      if (u_WhichTexture == -3) {
        gl_FragColor = vec4(diffuse+ambient+sdiffuse, 1.0);
      } else {
        gl_FragColor = vec4(specular+diffuse+ambient+sdiffuse+sspecular, 1.0);
      }
    }

  }`

// Global Vars
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_WhichTexture;
let u_ModelMatrix;
let u_NormalMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_LightPos;
let u_SpotLightPos;
let u_CameraPos;
let u_LightOnOff;
let u_SpotLightOn;
let u_SpotLightAng;
let u_SpotLightDir;

// global UI elements
let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0-g_startTime;
let g_animation = false;
let g_poke = false;
let g_pokeStart = 0;

// global animation angles
let g_frontLegAngle = 0;
let g_backLegAngle = 0;
let g_frontKneeAngle = 0;
let g_backKneeAngle = 0;
let g_frontHoofAngle = 0;
let g_bodyAngle = 0;
let g_tailAngle = 70;
let g_bodyY = 0;

// camera
let g_camera;
let g_cameraPos;

// map
let g_map = new Map()

// light
let g_view_normals = false;
let g_light_on_off = true;
let g_light_motion = true;
let g_lightPos = [0,1.5,0];

let g_spotLightOn = true;
let g_SpotLightPos = [1,4,0];
let g_SpotLightDir = [-g_SpotLightPos[0], -g_SpotLightPos[1], -g_SpotLightPos[2]]

// Sets up WebGL
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer:true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

// Connects js vars to GLSL vars in shaders
function connectVarsToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_LightPos
  u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
  if (!u_LightPos) {
    console.log('Failed to get the storage location of u_LightPos');
    return;
  }

  // Get the storage location of u_SpotLightPos
  u_SpotLightPos = gl.getUniformLocation(gl.program, 'u_SpotLightPos');
  if (!u_SpotLightPos) {
    console.log('Failed to get the storage location of u_SpotLightPos');
    return;
  } 

  // Get the storage location of u_SpotLightDir
  u_SpotLightDir = gl.getUniformLocation(gl.program, 'u_SpotLightDir');
  if (!u_SpotLightDir) {
    console.log('Failed to get the storage location of u_SpotLightDir');
    return;
  } 

  // Get the storage location of u_SpotLightAng
  u_SpotLightAng = gl.getUniformLocation(gl.program, 'u_SpotLightAng');
  if (!u_SpotLightAng) {
    console.log('Failed to get the storage location of u_SpotLightAng');
    return;
  } 

  // Get the storage location of u_CameraPos
  u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
  if (!u_CameraPos) {
    console.log('Failed to get the storage location of u_CameraPos');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  // Get the storage location of u_sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  // Get the storage location of u_WhichTexture
  u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
  if (!u_WhichTexture) {
    console.log('Failed to get the storage location of u_WhichTexture');
    return false;
  }

  // Get the storage location of u_LightOnOff
  u_LightOnOff = gl.getUniformLocation(gl.program, 'u_LightOnOff');
  if (!u_LightOnOff) {
    console.log('Failed to get the storage location of u_LightOnOff');
    return false;
  }

  // Get the storage location of u_SpotLightOn
  u_SpotLightOn = gl.getUniformLocation(gl.program, 'u_SpotLightOn');
  if (!u_SpotLightOn) {
    console.log('Failed to get the storage location of u_SpotLightOn');
    return false;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  return;
}

function initTextures() {
  // create image object
  var image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }

  var image3 = new Image();
  if(!image3) {
    console.log('Failed to create the image object');
    return false;
  }

  // register the event handler to be called on loading an image
  image.onload = function() { sendImageToTEXTURE0(image);};
  // tell the browser to load an image
  image.src = 'wall.jpg';

  image2.onload = function() { sendImageToTEXTURE1(image2);};
  image2.src = 'bush.jpg';

  image3.onload = function() { sendImageToTEXTURE2(image3); };
  image3.src = 'grass.jpg';
  return true;
}

function sendImageToTEXTURE0(image) {
  // create texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create a texture object');
    return false;
  }

  // flip image y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // bind the texture obj to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // set the texture params
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler0, 0);

  // console.log('finished loadTexture');
}

function sendImageToTEXTURE1(image) {
  // create texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create a texture object');
    return false;
  }

  // flip image y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit1
  gl.activeTexture(gl.TEXTURE1);
  // bind the texture obj to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // set the texture params
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler1, 1);

  //console.log('finished loadTexture');
}

function sendImageToTEXTURE2(image) {
  // create texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create a texture object');
    return false;
  }

  // flip image y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit1
  gl.activeTexture(gl.TEXTURE2);
  // bind the texture obj to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // set the texture params
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler2, 2);

  console.log('finished loadTexture');
}

// Extract mouse coords and return WebGL coords
function convertCoordinatesEventToGL(ev) {

  var x = ev.clientX; // Get mouse x position
  var y = ev.clientY; // Get mouse y position
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2) / (canvas.width / 2);
  y = (canvas.height/2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function addActionsForHtmlUI() {
  // Animation Buttons
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();}});

  document.getElementById('SpotLightSlideX').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_SpotLightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('SpotLightSlideY').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_SpotLightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('SpotLightSlideZ').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_SpotLightPos[2] = this.value/100; renderAllShapes();}});

  document.getElementById('LightOn').onclick = function() {g_light_on_off = true; renderAllShapes()}
  document.getElementById('LightOff').onclick = function() {g_light_on_off = false; renderAllShapes()}

  document.getElementById('SpotLightOn').onclick = function() {g_spotLightOn = true; renderAllShapes()}
  document.getElementById('SpotLightOff').onclick = function() {g_spotLightOn = false; renderAllShapes()}

  document.getElementById('SpotLightOn').onclick = function() {g_spotLightOn = true; renderAllShapes()}
  document.getElementById('SpotLightOff').onclick = function() {g_spotLightOn = false; renderAllShapes()}

  document.getElementById('MotionOn').onclick = function() {g_light_motion = true; renderAllShapes()}
  document.getElementById('MotionOff').onclick = function() {g_light_motion = false; renderAllShapes()}

  document.getElementById('NormalsOn').onclick = function() {g_view_normals = true; renderAllShapes()}
  document.getElementById('NormalsOff').onclick = function() {g_view_normals = false; renderAllShapes()}
}

function sendTextToHTML(text) {
  const output = document.getElementById('output');
  output.textContent = text;
}

function UpdateAnimationAngles() {

  if (g_light_motion) g_lightPos[0] = Math.cos(g_seconds);

  if (g_poke) {
    let speed = 2;
    if (g_seconds - g_pokeStart < 3/speed) {

      g_bodyAngle = 117*((g_seconds - g_pokeStart)*1.037*speed);
      g_bodyY = 2*Math.sin((g_seconds -g_pokeStart)*1.047*speed)

      g_frontLegAngle = 40*Math.sin((g_seconds - g_pokeStart)*1.05*speed);
      g_backLegAngle = -40*Math.sin((g_seconds - g_pokeStart)*1.05*speed);

      g_tailAngle = -90*Math.sin((g_seconds - g_pokeStart) * 1.05 * speed) + 70;

    } else {
      g_bodyAngle = 0;
      g_bodyY = 0;
      g_tailAngle = 70;
      g_poke = false;
    }
    return;
  }

  speed = 5;
  dAng_dTime = g_frontLegAngle;
  if (g_animation) {
    g_bodyAngle = 7*Math.sin(g_seconds * speed);
    g_tailAngle = -1.5*g_bodyAngle + 70;
    g_frontLegAngle = 30*Math.sin(g_seconds * speed);
    g_backLegAngle = -g_frontLegAngle - 10;
    dAng_dTime = dAng_dTime - g_frontLegAngle;

    if (dAng_dTime >= 0) {
      if (g_frontLegAngle > 1) {
        g_frontKneeAngle = -2*g_frontLegAngle;
      } else if (g_frontLegAngle < 1 && g_frontLegAngle > -1) {
        g_frontKneeAngle = 0;
      } else {
        g_frontKneeAngle = 2*g_frontLegAngle;
      }
    } else {
      g_frontKneeAngle = -60;
    }

    if (dAng_dTime <= 0) {
      if (g_frontLegAngle > 1) {
        g_backKneeAngle = -2*g_frontLegAngle;
      } else if (g_frontLegAngle < 1 && g_frontLegAngle > -1) {
        g_backKneeAngle = 0;
      } else {
        g_backKneeAngle = 2*g_frontLegAngle;
      }
    } else {
      g_backKneeAngle = -60;
    }

  }
}

function UpdateCameraPosition() {
  if (g_keysDown[87]) {
    g_camera.moveForward();
  }
  
  if (g_keysDown[65]) {
    g_camera.moveLeft();
  }

  if (g_keysDown[83]) {
    g_camera.moveBackward();
  }

  if (g_keysDown[68]) {
    g_camera.moveRight();
  }

  if (g_keysDown[81]) {
    g_camera.panLeft();
  }

  if (g_keysDown[69]) {
    g_camera.panRight();
  }
}

// Render all shapes defined by buffers onto canvas
function renderAllShapes() {
  // check time for performance check
  var start = performance.now();

  // pass projection matrix
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projMat.elements);
  // pass view matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMat.elements);
  // pass light on/ff
  gl.uniform1i(u_LightOnOff, g_light_on_off);
  // pass spotlight on/off
  gl.uniform1i(u_SpotLightOn, g_spotLightOn);
  // pass spotlight dir
  gl.uniform3f(u_SpotLightDir, g_SpotLightDir[0], g_SpotLightDir[1], g_SpotLightDir[2])
  // pass spotlight ang
  gl.uniform1f(u_SpotLightAng, 30)

  // Clear Canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // colors
  let groundColor = [.3, .7, .3, 1];
  let skyColor = [.53, .81, 1, 1];

  // sky
  var skyM = new Matrix4();
  skyM.scale(-100, -100, -100);
  skyM.translate(-.5, -.5, -.5);
  var sky = new Cube(skyM, skyColor, -3);
  sky.render();

  let tex = 0;
  // ground
  if (g_view_normals) {
    tex = -3
  } else {
    tex = 2
  }
  var groundM = new Matrix4();
  groundM.translate(-25, -.65, -25);
  groundM.scale(50, .001, 50);
  var ground = new Cube(groundM, groundColor, tex);
  ground.render();

  // test cube
  var cubeM = new Matrix4();
  cubeM.translate(.5,-.5,0);
  var cube = new Cube(cubeM, [1,1,1,1], tex);
  cube.render()

  if (g_view_normals) {
    tex = -3
  } else {
    tex = -2
  }
  // test sphere
  var sphereM = new Matrix4();
  sphereM.translate(-.5, .2, 0);
  var sphere = new Sphere(sphereM, [1,1,1,1], tex);
  sphere.render()

  // light
  gl.uniform3f(u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_SpotLightPos, g_SpotLightPos[0], g_SpotLightPos[1], g_SpotLightPos[2]);

  var lightM = new Matrix4();
  lightM.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  lightM.scale(-.1,-.1,-.1);
  lightM.translate(-.5, -.5, -.5);
  var light = new Cube(lightM, [2,2,0,1])
  light.render()

  var spotLightM = new Matrix4();
  spotLightM.translate(g_SpotLightPos[0], g_SpotLightPos[1], g_SpotLightPos[2]);
  spotLightM.scale(.1,.1,.1);
  spotLightM.translate(-.5, -.5, -.5);
  var spotLight = new Cube(spotLightM, [2,2,0,1])
  spotLight.render()

  // camera
  gl.uniform3f(u_CameraPos, g_cameraPos[0], g_cameraPos[1], g_cameraPos[2])

  // performance check
  var duration = performance.now() - start;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration));
}

// registers mouse click and pushes inputed values to buffers
function handleOnClick(ev) {
  if (ev.buttons != 1) {
    return;
  }
  
  let [x, y] = convertCoordinatesEventToGL(ev);

  //g_globalXAngle = x*90;
  //g_globalYAngle = y*90;

  renderAllShapes();
}

// keep track of currently down  keys
let g_keysDown = {}

// handles when a keyboard key is pressed
function handleOnKeyDown(ev) {
  // store keys pressed
  g_keysDown[ev.keyCode] = true;
}

// handles if a keyboard key is unpressed
function handleOnKeyUp(ev) {
  g_keysDown[ev.keyCode] = false;
}

function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;

  UpdateAnimationAngles();

  UpdateCameraPosition();

  renderAllShapes();

  requestAnimationFrame(tick);
}

function main() {

  setupWebGL();
  connectVarsToGLSL();
  addActionsForHtmlUI();
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // camera
  g_camera = new Camera();
  g_cameraPos = g_camera.eye.elements;

  canvas.onmousedown = handleOnClick;
  canvas.onmousemove = handleOnClick;
  canvas.onmousemove = g_camera.onMove;
  document.addEventListener('keydown', handleOnKeyDown);
  document.addEventListener('keyup', handleOnKeyUp);

  requestAnimationFrame(tick);
}