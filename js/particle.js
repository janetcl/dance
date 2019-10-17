function Particle(x, y, z, mass) {
  this.position = new THREE.Vector3(); // position
  this.previous = new THREE.Vector3(); // previous
  this.original = new THREE.Vector3(); // original
  initParameterizedPosition(x, y, this.position);
  initParameterizedPosition(x, y, this.previous);
  initParameterizedPosition(x, y, this.original);

  this.netForce = new THREE.Vector3(); // net force acting on particle
  this.mass = mass; // mass of the particle
}

Particle.prototype.lockToOriginal = function() {
  this.position.copy(this.original);
  this.previous.copy(this.original);
};

Particle.prototype.lock = function() {
  this.position.copy(this.previous);
  this.previous.copy(this.previous);
};

Particle.prototype.addForce = function(force) {
  // ----------- STUDENT CODE BEGIN ------------
  // Add the given force to the particle's total netForce.
  // ----------- Our reference solution uses 1 lines of code.
  this.netForce.add(force);
  // ----------- STUDENT CODE END ------------
};

Particle.prototype.integrate = function(deltaT) {
  // ----------- STUDENT CODE BEGIN ------------
  // Perform Verlet integration on this particle with the provided
  // timestep deltaT.
  //
  // You need to:
  // (1) Save the old (i.e. current) position into this.previous.
  // (2) Compute the new position of this particle using Verlet integration,
  //     and store it into this.position.
  // (3) Reset the net force acting on the particle (i.e. make it (0, 0, 0) again).
  // ----------- Our reference solution uses 13 lines of code.

  // save the old position
  let oldPrevious = this.previous.clone();
  this.previous = this.position.clone();

  // compute new position
  let secondTerm = new THREE.Vector3(0.0, 0.0, 0.0);
  secondTerm.subVectors(this.previous, oldPrevious);
  secondTerm.multiplyScalar(1.0 - DAMPING);
  let thirdTerm = this.netForce.multiplyScalar(1.0 * deltaT * deltaT / this.mass);

  this.position = new THREE.Vector3(0.0, 0.0, 0.0);
  this.position.addVectors(this.previous, secondTerm);
  this.position.add(thirdTerm);

  // reset the net force
  this.netForce = new THREE.Vector3(0.0, 0.0, 0.0);

  // ----------- STUDENT CODE END ------------
};

Particle.prototype.handleFloorCollision = function() {
  // ----------- STUDENT CODE BEGIN ------------
  // Handle collision of this particle with the floor.
  // ----------- Our reference solution uses 3 lines of code.
  if (this.position.y < GROUND_Y) {
    this.position.setY(GROUND_Y);
  }
  // ----------- STUDENT CODE END ------------
};

Particle.prototype.handleSphereCollision = function() {
  if (sphere.visible) {
    // ----------- STUDENT CODE BEGIN ------------
    // Handle collision of this particle with the sphere.
    let posFriction = new THREE.Vector3();
    let posNoFriction = new THREE.Vector3();
    // ----------- Our reference solution uses 28 lines of code.

    if (spherePosition.clone().sub(this.position).length() <= sphereSize) {
      let newVec = this.position.clone();
      newVec.sub(spherePosition);
      newVec.normalize();
      newVec.multiplyScalar(sphereSize);
      posNoFriction.addVectors(newVec, spherePosition);

      if (spherePosition.clone().sub(this.previous).length() > sphereSize) {
        posFriction = this.previous.clone();
        posFriction.add(spherePosition);
        posFriction.sub(prevSpherePosition);

        this.position.copy(posFriction.multiplyScalar(friction));
        this.position.add(posNoFriction.multiplyScalar(1.0 - friction));
      } else {
        this.position.copy(posNoFriction);
      }
    }

    // ----------- STUDENT CODE END ------------
  }
};

Particle.prototype.handleBoxCollision = function() {
  if (box.visible) {
    // ----------- STUDENT CODE BEGIN ------------
    // Handle collision of this particle with the axis-aligned box.
    let posFriction = new THREE.Vector3();
    let posNoFriction = new THREE.Vector3();
    // ----------- Our reference solution uses 61 lines of code.

    // check if the particle is in the box
    if (boundingBox.containsPoint(this.position)) {

      // compute posNoFriction
      let minx = boundingBox.min.x;
      let miny = boundingBox.min.y;
      let minz = boundingBox.min.z;
      let maxx = boundingBox.max.x;
      let maxy = boundingBox.max.y;
      let maxz = boundingBox.max.z;

      let minLength = Number.POSITIVE_INFINITY;

      if (Math.abs(this.position.x - minx) < minLength) {
        minLength = this.position.x - minx;
        posNoFriction = new THREE.Vector3(minx, this.position.y, this.position.z);
      }
      if (Math.abs(this.position.y - miny) < minLength) {
        minLength = this.position.y - miny;
        posNoFriction = new THREE.Vector3(this.position.x, miny, this.position.z);
      }
      if (Math.abs(this.position.z - minz) < minLength) {
        minLength = this.position.z - minz;
        posNoFriction = new THREE.Vector3(this.position.x, this.position.y, minz);
      }

      if (Math.abs(maxx - this.position.x) < minLength) {
        minLength = maxx - this.position.x;
        posNoFriction = new THREE.Vector3(maxx, this.position.y, this.position.z);
      }
      if (Math.abs(maxy - this.position.y) < minLength) {
        minLength = maxy - this.position.y;
        posNoFriction = new THREE.Vector3(this.position.x, maxy, this.position.z);
      }
      if (Math.abs(maxz - this.position.z) < minLength) {
        minLength = maxz - this.position.z;
        posNoFriction = new THREE.Vector3(this.position.x, this.position.y, maxz);
      }

      // case where point was previously inside the box
      if (boundingBox.containsPoint(this.previous)) {
        posFriction = this.previous.clone();
        this.position.copy(posFriction.multiplyScalar(friction));
        this.position.add(posNoFriction.multiplyScalar(1.0 - friction));
      } else {
        this.position = posNoFriction;
      }

    }


    // ----------- STUDENT CODE END ------------
  }
};
