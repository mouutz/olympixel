export class Car {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.carHitbox = null;
        this.speed = 0;
        this.acceleration = 0.005;
        this.deceleration = 0.003;
        this.maxSpeed = 0.25;
        this.rotationRate = 0.02;
    }

    async createCar() {
        const carObject = this.scene.getMeshByName("Caruse");
        if (!carObject) return null;

        carObject.checkCollisions = false;
        this.carHitbox = BABYLON.MeshBuilder.CreateBox("carHitbox", { width: 2, height: 2, depth:5 }, this.scene);
        this.carHitbox.position = new BABYLON.Vector3(19, 1.5, 40);
        this.carHitbox.isVisible = true;
        this.carHitbox.checkCollisions = true;
        carObject.setParent(this.carHitbox);
        carObject.position = new BABYLON.Vector3(0, -0.85, 0);
        this.carObjet = carObject;

        return this.carHitbox;
    }

    move(inputMap) {
        const hasInput = Object.keys(inputMap).some(k => inputMap[k]);
        if (hasInput) {
            this.updateSpeed(inputMap);
            this.updateRotation(inputMap);
        }

        this.applyMovement();
    }

    updateSpeed(inputMap) {
        if (inputMap["s"] || inputMap["S"]) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else if (inputMap["z"] || inputMap["Z"]) {
            this.speed = Math.max(this.speed - this.acceleration, -this.maxSpeed);
        }
    }

    updateRotation(inputMap) {
        if (this.speed !== 0) {
            if (inputMap["q"]) {
                this.carHitbox.rotation.y -= this.rotationRate;
            } else if (inputMap["d"]) {
                this.carHitbox.rotation.y += this.rotationRate;
            }
        }
    }

    applyMovement() {
        const forward = new BABYLON.Vector3(Math.sin(this.carHitbox.rotation.y), 0, Math.cos(this.carHitbox.rotation.y));
        this.carHitbox.moveWithCollisions(forward.scale(this.speed));
        this.applyDeceleration();
        this.raycast();
    }

    applyDeceleration() {
        if (this.speed > 0) {
            this.speed = Math.max(this.speed - this.deceleration, 0);
        } else if (this.speed < 0) {
            this.speed = Math.min(this.speed + this.deceleration, 0);
        }
    }

    raycast() {
        var ray = new BABYLON.Ray(this.carHitbox.position, new BABYLON.Vector3(0, -1, 0)); 
        var pickInfo = this.scene.pickWithRay(ray, (item) => {
            const excludedNames = ["Male_shorts", "Male_shoes", "heroBox", "Male_tshirt", "Male_body"];
            return item && item !== this.carHitbox && item !== this.carObjet && !excludedNames.includes(item?.name);
          });
        if (pickInfo.hit && pickInfo.pickedMesh) {
            var groundPosition = pickInfo.pickedPoint;
            var carHeightOffset = 1; 
            var targetY = groundPosition.y + carHeightOffset;
            if(groundPosition.y<2){
                var adjustmentSpeed = 0.05;
              }
            else if(groundPosition.y<-1){
                var adjustmentSpeed = 0.005;
              }
              else{
                var adjustmentSpeed = 1;
              }
            this.carHitbox.position.y += (targetY - this.carHitbox.position.y)*adjustmentSpeed
        }
    }
    
}
