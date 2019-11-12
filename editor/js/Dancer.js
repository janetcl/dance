class Position {
  constructor(x, y, z, t) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.time = t;
  }
}

class Dancer {

  constructor(name) {
    this.positions = [];
    this.name = name;

    this.geometry = new THREE.BoxGeometry(1, 2, 1);
    this.material = new THREE.MeshLambertMaterial({ color: 0xff0000});
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.x = 0;
    this.mesh.position.y = 0;
    this.mesh.position.z = 0;
  }

  updateName(name) {
    this.name = name;
  }

  updateColor(color) {
    this.mesh.material.color.set(color);
  }

  clearPositions() {
    this.positions = [];
  }

  addPosition(pos) {
    // Filter existing positions to make sure each time has only one position
    this.positions = this.positions.filter(function(position, index, arr){
        return position !== pos.time;
    });
    // Push new position onto dancer's positions
    this.positions.push(pos);
    // Sort all positions in time order
    this.positions.sort(function(a, b) {return a.time - b.time});
  }

  // Removes the position at time t from the dancer's positions
  removePosition(t) {
    console.log(this.positions);
    this.positions = this.positions.filter(function(position, index, arr){
        return position.time !== t;
    });
    console.log(this.positions);
  }

  // Returns the position at time t if it exists
  getPosition(t) {
    var i;
    for (i = 0; i < this.positions.length; i++) {
      if (this.positions[i].time === t) {
        console.log(this.positions[i]);
        return this.positions[i];
      }
    }
    return;
  }

  setPosition(pos) {
    this.mesh.position.x = pos.x;
    this.mesh.position.y = pos.y;
    this.mesh.position.z = pos.z;
  }

}

class Stage {

  constructor() {
    this.dancers = [];
  }

  addDancer(dan) {
    var i;
    // Check to make sure the dancer does not already exist onstage
    for (i = 0; i < this.dancers.length; i++) {
      if (this.dancers[i] === dan) {
        console.log(this.dancers[i]);
        return;
      }
    }
    this.dancers.push(dan);
  }

  removeDancer(dan) {
    console.log(this.dancers);
    this.dancers = this.dancers.filter(function(dancer, index, arr){
        return dancer !== dan;
    });
    console.log(this.dancers);
  }

  play() {
    var i;
    for (i = 0; i < this.dancers.length; i++) {
      const d = this.dancers[i];
      console.log(d.name);
      var j;
      for (j = 0; j < d.positions.length; j++) {
        console.log(d.positions[j]);
      }
    }
    return;
  }

  clearDancers() {
    this.dancers = [];
  }

}

// Iterate through every dancer at a given time t, check if you have to update the position
// Go to the hashmap, for every time t in the map, update hte positions of the dancers at that time

var width = window.innerWidth;
var height = window.innerHeight;
var viewAngle = 45;
var nearClipping = 0.1;
var farClipping = 9999;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( viewAngle, width / height, nearClipping, farClipping );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( width, height );
document.body.appendChild( renderer.domElement );

// var cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
// var cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
// var cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
// var coneGeometry = new THREE.ConeGeometry( 0.5, 1, 4 );
// var coneMaterial = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
// var cone = new THREE.Mesh( coneGeometry, coneMaterial );
// var sphereGeometry = new THREE.SphereGeometry( 0.5, 8, 8 );
// var sphereMaterial = new THREE.MeshLambertMaterial( { color: 0x0000ff } );
// var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
// cube.position.x = -2
// cube.position.z = -5;
// cone.position.z = -5;
// sphere.position.z = -5;
// sphere.position.x = 2;
// cube.position.z = -5;
// scene.add(cube);
// scene.add(cone);
// scene.add(sphere);

const loader = new THREE.TextureLoader();
var janet = new Dancer("Janet");
janet.updateColor(0x293fff);
var j1 = new Position(-2, 0, -5, 0);
var j2 = new Position(2, 0, -5, 250);
janet.addPosition(j1);
janet.addPosition(j2);
var geometry = new THREE.BoxGeometry(1, 2, 1);
var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: loader.load('files/janet.jpg')});
var janetMesh = new THREE.Mesh(geometry, material);
janetMesh.position.x = j1.x;
janetMesh.position.y = j1.y;
janetMesh.position.z = j1.z;
scene.add(janetMesh);

var phillip = new Dancer("Phillip");
phillip.updateColor(0xf8f833);
var p1 = new Position(2, 0, -3, 0);
var p2 = new Position(-2, 0, -3, 150);
var p3 = new Position(-2, 0, -10, 250);
phillip.addPosition(p1);
phillip.addPosition(p2);
phillip.addPosition(p3);
var geometry = new THREE.BoxGeometry(1, 2, 1);
var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: loader.load('files/yoon.jpg')});
var phillipMesh = new THREE.Mesh(geometry, material);
phillipMesh.position.x = p1.x;
phillipMesh.position.y = p1.y;
phillipMesh.position.z = p1.z;
scene.add(phillipMesh);

var s = new Stage();
s.addDancer(janet);
s.addDancer(phillip);
var dancers = {[janet.name]: janetMesh, [phillip.name]: phillipMesh};
s.play();

var light = new THREE.PointLight(0xFFFFFF);
light.position.x = 0;
light.position.y = 10;
light.position.z = 0;
light.intensity = 1;
scene.add(light);

// Add the stage
var geometry = new THREE.PlaneGeometry( 30, 20, 5, 2 );
var material = new THREE.MeshBasicMaterial({
  color: 0xFF8844,
  map: loader.load('files/stage.jpg'),
  side: THREE.DoubleSide,
});
var floor = new THREE.Mesh( geometry, material );
floor.rotation.x = Math.PI / 2;
floor.position.z = -10;
floor.position.y = -1;
scene.add( floor );

// Set the camera and orbit controls
camera.position.z = 6;
camera.position.y = 3;
var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0, -2 );

var axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

var dancerPos = [];
var i;
// prepare for every single dancer, interpolate their path from a to b
for (i = 0; i < s.dancers.length; i++) {
  var d = s.dancers[i];
  var newDancerPosObj = {Dancer: d}
  var j;
  for (j = 0; j < d.positions.length - 1; j++) {
    var firstPosX = d.positions[j].x;
    var firstPosY = d.positions[j].y;
    var firstPosZ = d.positions[j].z;
    var firstTime = d.positions[j].time;
    var secondPosX = d.positions[j+1].x;
    var secondPosY = d.positions[j+1].y;
    var secondPosZ = d.positions[j+1].z;
    var secondTime = d.positions[j+1].time;
    var k;
    for (k = firstTime; k < secondTime; k++) {
      newDancerPosObj[k] =
      {
        x: ((secondPosX - firstPosX) * (k - firstTime) / (secondTime - firstTime)) + firstPosX,
        y: ((secondPosY - firstPosY) * (k - firstTime) / (secondTime - firstTime)) + firstPosY,
        z: ((secondPosZ - firstPosZ) * (k - firstTime) / (secondTime - firstTime)) + firstPosZ,
      };
    }
  }
  dancerPos.push(newDancerPosObj);
}
console.log(dancerPos);

var lightAngle = 0;
var t = 0;
function animate() {
  var i;
  for (i = 0; i < dancerPos.length; i++) {
    var d = dancerPos[i].Dancer;
    if (dancerPos[i][t] != null) {
      dancers[d.name].position.x = dancerPos[i][t].x;
      dancers[d.name].position.y = dancerPos[i][t].y;
      dancers[d.name].position.z = dancerPos[i][t].z;
    }
  }
  t += 1;
  lightAngle += 5;
  if (lightAngle > 360) { lightAngle = 0;};
  light.position.x = 5 * Math.cos(lightAngle * Math.PI / 180);
  light.position.z = 5 * Math.sin(lightAngle * Math.PI / 180);
  requestAnimationFrame( animate );
  controls.update();
  renderer.render( scene, camera );
}

animate();
