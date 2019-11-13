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
    this.potentialPose = null;

    this.geometry = new THREE.BoxGeometry(1, 2, 1);
    this.material = new THREE.MeshLambertMaterial({ color: 0xff0000});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
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

  addPotentialPos(pos) {
    this.potentialPose = pos;
  }

  addPosition(pos) {
    // Filter existing positions to make sure each time has only one position
    this.positions = this.positions.filter(function(position, index, arr){
        return position.time !== pos.time;
    });
    // Push new position onto dancer's positions
    this.positions.push(pos);
    // Sort all positions in time order
    this.positions.sort(function(a, b) {return a.time - b.time});
  }

  // Removes the position at time t from the dancer's positions
  removePosition(t) {
    this.positions = this.positions.filter(function(position, index, arr){
        return position.time !== t;
    });
  }

  // Returns the position at time t if it exists
  getPosition(t) {
    var i;
    for (i = 0; i < this.positions.length; i++) {
      if (this.positions[i].time === t) {
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
        return;
      }
    }
    this.dancers.push(dan);
  }

  removeDancer(dan) {
    this.dancers = this.dancers.filter(function(dancer, index, arr){
        return dancer !== dan;
    });
  }

  getDancer(threeJSPose) {
    var i;
    for (i = 0; i < this.dancers.length; i++) {
      if ((Math.abs(this.dancers[i].positions[0].x - threeJSPose.x) < 1) &&
      (Math.abs(this.dancers[i].positions[0].y - threeJSPose.y) < 1) &&
      (Math.abs(this.dancers[i].positions[0].z - threeJSPose.z) < 1)) {
        return this.dancers[i];
      }
      var len = this.dancers[i].positions.length;
      if ((Math.abs(this.dancers[i].positions[len - 1].x - threeJSPose.x) < 1) &&
      (Math.abs(this.dancers[i].positions[len - 1].y - threeJSPose.y) < 1) &&
      (Math.abs(this.dancers[i].positions[len - 1].z - threeJSPose.z) < 1)) {
        return this.dancers[i];
      }
    }
    return;
  }

  play() {
    var i;
    for (i = 0; i < this.dancers.length; i++) {
      const d = this.dancers[i];
      var j;
      for (j = 0; j < d.positions.length; j++) {
      }
    }
    return;
  }

  clearDancers() {
    this.dancers = [];
  }

}

var danceDesigner = {
  scene: null, camera: null, renderer: null, movingDancer: null,
  controls: null, loader: null, container: null, light: null,
  plane: null, selection: null, offset: new THREE.Vector3(),
  raycaster: new THREE.Raycaster(), dancerPos: [], s: null,
  dancersArr: [], dancers: {}, maxT: null,
  init: function() {
    this.scene = new THREE.Scene();
    var width = window.innerWidth;
    var height = window.innerHeight;
    var viewAngle = 45;
    var nearClipping = 0.1;
    var farClipping = 9999;
    this.camera = new THREE.PerspectiveCamera( viewAngle, width / height, nearClipping, farClipping );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( width, height );
    document.body.appendChild( this.renderer.domElement );

    // Prepare container
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.container.appendChild(this.renderer.domElement);

    // Events
    document.addEventListener('mousedown', this.onDocumentMouseDown, false);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('mouseup', this.onDocumentMouseUp, false);

    this.loader = new THREE.TextureLoader();
    var janet = new Dancer("Janet");
    janet.updateColor(0x293fff);
    var j1 = new Position(-2, 0, -5, 0);
    // var j2 = new Position(2, 0, -5, 250);
    janet.addPosition(j1);
    // janet.addPosition(j2);
    var geometry = new THREE.BoxGeometry(1, 2, 1);
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.loader.load('files/janet.jpg')});
    var janetMesh = new THREE.Mesh(geometry, material);
    janetMesh.position.x = j1.x;
    janetMesh.position.y = j1.y;
    janetMesh.position.z = j1.z;
    this.scene.add(janetMesh);

    var phillip = new Dancer("Phillip");
    phillip.updateColor(0xf8f833);
    var p1 = new Position(2, 0, -3, 0);
    // var p2 = new Position(-2, 0, -3, 150);
    // var p3 = new Position(-2, 0, -10, 250);
    phillip.addPosition(p1);
    // phillip.addPosition(p2);
    // phillip.addPosition(p3);
    var geometry = new THREE.BoxGeometry(1, 2, 1);
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.loader.load('files/yoon.jpg')});
    var phillipMesh = new THREE.Mesh(geometry, material);
    phillipMesh.position.x = p1.x;
    phillipMesh.position.y = p1.y;
    phillipMesh.position.z = p1.z;
    this.scene.add(phillipMesh);

    this.s = new Stage();
    this.s.addDancer(janet);
    this.s.addDancer(phillip);
    this.maxT = 0;
    this.dancers = {[janet.name]: janetMesh, [phillip.name]: phillipMesh};
    this.dancersArr = [janetMesh, phillipMesh];
    this.s.play();

    var spotLight = new THREE.SpotLight( {color: 0xffffff, intensity: 0.1});
    spotLight.position.set( -1, 60, 20 );
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;
    spotLight.target = phillipMesh;
    this.scene.add( spotLight );

    var spotLightJanet = new THREE.SpotLight( {color: 0xffffff, intensity: 0.1});
    spotLightJanet.position.set( -3, 50, 20 );
    spotLightJanet.castShadow = true;
    spotLightJanet.shadow.mapSize.width = 1024;
    spotLightJanet.shadow.mapSize.height = 1024;
    spotLightJanet.shadow.camera.near = 500;
    spotLightJanet.shadow.camera.far = 4000;
    spotLightJanet.shadow.camera.fov = 30;
    spotLightJanet.target = janetMesh;
    this.scene.add( spotLightJanet );

    this.light = new THREE.PointLight(0xFFFFFF);
    this.light.position.x = 0;
    this.light.position.y = 10;
    this.light.position.z = 0;
    this.light.intensity = 1;
    this.scene.add(this.light);

    // Add the stage
    var geometry = new THREE.PlaneGeometry( 30, 20, 5, 2 );
    var material = new THREE.MeshBasicMaterial({
      color: 0xFF8844,
      map: this.loader.load('files/stage.jpg'),
      side: THREE.DoubleSide,
    });
    var floor = new THREE.Mesh( geometry, material );
    floor.rotation.x = Math.PI / 2;
    floor.position.z = -10;
    floor.position.y = -1;
    this.scene.add( floor );

    // Set the camera and orbit controls
    this.camera.position.z = 8;
    this.camera.position.y = 3;
    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.controls.target.set( 0, 0, -2 );

    var axesHelper = new THREE.AxesHelper( 5 );
    this.scene.add( axesHelper );

    // Plane, that helps to determinate an intersection position
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({color: 0xffffff, visible: false}));
    this.plane.rotation.x = Math.PI / 2;
    this.plane.position.z = -10;
    this.plane.position.y = -1;
    this.scene.add(this.plane);
  },
  onDocumentMouseDown: function (event) {
    // Get mouse position
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    // Get 3D vector from 3D mouse position using 'unproject' function
    var vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(danceDesigner.camera);
    // Set the raycaster position
    danceDesigner.raycaster.set( danceDesigner.camera.position, vector.sub( danceDesigner.camera.position ).normalize() );
    // Find all intersected objects
    var intersects = danceDesigner.raycaster.intersectObjects(danceDesigner.dancersArr);
    if (intersects.length > 0) {
      // Disable the controls
      danceDesigner.controls.enabled = false;
      // Set the selection - first intersected object
      danceDesigner.selection = intersects[0].object;
      danceDesigner.movingDancer = danceDesigner.s.getDancer(intersects[0].object.position);
      // Calculate the offset
      var intersects = danceDesigner.raycaster.intersectObject(danceDesigner.plane);
      danceDesigner.offset.copy(intersects[0].point).sub(danceDesigner.plane.position);
    }
  },
  onDocumentMouseMove: function (event) {
    event.preventDefault();
    // Get mouse position
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    // Get 3D vector from 3D mouse position using 'unproject' function
    var vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(danceDesigner.camera);
    // Set the raycaster position
    danceDesigner.raycaster.set( danceDesigner.camera.position, vector.sub( danceDesigner.camera.position ).normalize() );
    if (danceDesigner.selection) {
      // Check the position where the plane is intersected
      var intersects = danceDesigner.raycaster.intersectObject(danceDesigner.plane);
      // Reposition the object based on the intersection point with the plane
      danceDesigner.selection.position.copy(intersects[0].point.sub(danceDesigner.offset));
      newPosThreeVector = intersects[0].point.sub(danceDesigner.offset);
      // Find the dancer based on the initial pose
      if (danceDesigner.movingDancer) {
        if (newPosThreeVector) {
          var newPos = new Position(newPosThreeVector.x, newPosThreeVector.y, newPosThreeVector.z, 0);
          danceDesigner.movingDancer.addPotentialPos(newPos);
        }
      }
    } else {
      // Update position of the plane if need
      var intersects = danceDesigner.raycaster.intersectObjects(danceDesigner.dancersArr);
      if (intersects.length > 0) {
        danceDesigner.plane.position.copy(intersects[0].object.position);
        danceDesigner.plane.lookAt(danceDesigner.camera.position);
      }
    }
  },
  onDocumentMouseUp: function (event) {
    // Enable the controls
    danceDesigner.controls.enabled = true;
    danceDesigner.selection = null;
  }
};
var t = 0;
var lightAngle = 0;
var play = false;
function animate() {
  if (play) {
    if (danceDesigner.maxT === 0) {
      play = false;
    }
    var i;
    for (i = 0; i < danceDesigner.dancerPos.length; i++) {
      var d = danceDesigner.dancerPos[i].Dancer;
      if (danceDesigner.dancerPos[i][t] != null) {
        danceDesigner.dancers[d.name].position.x = danceDesigner.dancerPos[i][t].x;
        danceDesigner.dancers[d.name].position.y = danceDesigner.dancerPos[i][t].y;
        danceDesigner.dancers[d.name].position.z = danceDesigner.dancerPos[i][t].z;
      }
    }
    t += 1;
    if (t === danceDesigner.maxT) {
      play = false;
    }
    lightAngle += 5;
    if (lightAngle > 360) { lightAngle = 0;};
    danceDesigner.light.position.x = 5 * Math.cos(lightAngle * Math.PI / 180);
    danceDesigner.light.position.z = 5 * Math.sin(lightAngle * Math.PI / 180);
  }
  requestAnimationFrame( animate );
  render();
  update();
}
// Render the scene
function render(lightAngle, t) {
  if (danceDesigner.renderer) {
    danceDesigner.renderer.render(danceDesigner.scene, danceDesigner.camera);
  }
}
// Update controls and stats
function update() {
  document.getElementById("Time").innerHTML = "Time: " + t;
  danceDesigner.controls.update();
}

// Play the sequence only once the user has pressed play.
var buttons = document.getElementsByTagName("button");
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener("click", onButtonClick, false);
};
document.getElementById("Time").innerHTML = "Time: " + t;
var newPosThreeVector = null;
function onButtonClick(event) {
  if (event.target.id === "addKeyFrame") {
    danceDesigner.maxT += 50;
    for (i = 0; i < danceDesigner.s.dancers.length; i++) {
      var dancerMesh = danceDesigner.dancers[danceDesigner.s.dancers[i].name];
      var newPos = new Position(dancerMesh.position.x, dancerMesh.position.y, dancerMesh.position.z, danceDesigner.maxT);
      danceDesigner.s.dancers[i].addPosition(newPos);
    }
    console.log(danceDesigner.s.dancers);
  } else if (event.target.id === "clear") {
    for (i = 0; i < danceDesigner.s.dancers.length; i++) {
      danceDesigner.s.dancers[i].positions = [];
      var dancerMesh = danceDesigner.dancers[danceDesigner.s.dancers[i].name];
      var newPos = new Position(dancerMesh.position.x, dancerMesh.position.y, dancerMesh.position.z, 0);
      danceDesigner.s.dancers[i].addPosition(newPos);
    }
    danceDesigner.maxT = 0;
  } else if (event.target.id === "play") {
    // for (i = 0; i < danceDesigner.s.dancers.length; i++) {
    //   var potentialPose = danceDesigner.s.dancers[i].potentialPose;
    //   if (potentialPose) {
    //     danceDesigner.s.dancers[i].addPosition(potentialPose);
    //     danceDesigner.s.dancers[i].potentialPose = null;
    //   }
    // }
    play = false;
    danceDesigner.dancerPos = [];
    var i;
    // prepare for every single dancer, interpolate their path from a to b
    for (i = 0; i < danceDesigner.s.dancers.length; i++) {
      var d = danceDesigner.s.dancers[i];
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
      danceDesigner.dancerPos.push(newDancerPosObj);
    }
    t = 0;
    lightAngle = 0;
    play = true;
  }
}

// Initialize lesson on page load
function initializeLesson() {
  danceDesigner.init();
  animate(0, 0);
}
if (window.addEventListener)
  window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
