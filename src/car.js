import { audioManager } from "./main.js";
export class Car {
    constructor(scene, camera, isDriving) {
        this.scene = scene;
        this.camera = camera;
        this.carHitbox = null;
        this.speed = 0;
        this.acceleration = 0.005;
        this.deceleration = 0.002;
        this.maxSpeed = 0.30;
        this.rotationRate = 0.02;
        this.rotationVelocity = 0;
        this.rotationDeceleration = 0.01;
        this.rotationAcceleration = 0.0003;
        this.audioManager = audioManager;
        this.isDriving = isDriving;
        
    }

    async createCar() {
        const carObject = this.scene.getMeshByName("Caruse");
        if (!carObject) return null;

        carObject.checkCollisions = false;
        this.carHitbox = BABYLON.MeshBuilder.CreateBox("carHitbox", { width: 2, height: 2, depth:5 }, this.scene);
        this.carHitbox.position = new BABYLON.Vector3(19, 1.5, 10);
        this.carHitbox.isVisible = false;
        this.carHitbox.checkCollisions = true;
        carObject.setParent(this.carHitbox);
        carObject.position = new BABYLON.Vector3(0, -0.85, 0);
        this.carObjet = carObject;

        this.audioManager.sounds.drive1.attachToMesh(this.carHitbox);
        this.audioManager.sounds.drive0.attachToMesh(this.carHitbox);
        this.audioManager.sounds.caridle.attachToMesh(this.carHitbox);

        return this.carHitbox;
    }

    move(inputMap, isDriving) {
        this.isDriving = isDriving;
        const hasInput = Object.keys(inputMap).some(k => inputMap[k]);
        if (hasInput) {
            this.updateSpeed(inputMap);
            this.updateRotation(inputMap);
        }
        this.rotationVelocity *= (1 - this.rotationDeceleration);
        this.applyMovement();
    }
    

    //fonction qui lance le son quand la voiture avance et s'arrete
    carsoud(){
        if(this.speed > 0){
                this.audioManager.playSound("drive0",this.isDriving);
                this.audioManager.stopSound("drive1");
                this.audioManager.stopSound("caridle");
            }
         else if(this.speed < 0){
           
                this.audioManager.playSound("drive1", this.isDriving);
                this.audioManager.stopSound("drive0");
                this.audioManager.stopSound("caridle");
          }
         else if(this.speed === 0){
           
                this.audioManager.playSound("caridle", this.isDriving);
                this.audioManager.stopSound("drive0");
                this.audioManager.stopSound("drive1");

        }   
    }
    


    updateSpeed(inputMap) {
        if (inputMap["s"] || inputMap["S"]) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
            
            
        } else if (inputMap["z"] || inputMap["Z"]) {
            this.speed = Math.max(this.speed - this.acceleration, -this.maxSpeed);
        }
    }

    updateRotation(inputMap) {
        console.log(this.rotationVelocity);
        if (this.speed !== 0) {
            //si on avance
            if(this.speed < 0) {
            if (inputMap["q"] || inputMap["Q"]) {
                this.carHitbox.rotation.y -= this.rotationRate;
                if(this.rotationVelocity > -this.rotationRate*1.5){
                    this.rotationVelocity += -this.rotationAcceleration;
                }
            } else if (inputMap["d"] || inputMap["D"]) {
                this.carHitbox.rotation.y += this.rotationRate;
                if(this.rotationVelocity < this.rotationRate*1.5){
                    this.rotationVelocity += this.rotationAcceleration;
                }
            }
        }
        //si on recule
        else{
            if (inputMap["q"] || inputMap["Q"]) {
                this.carHitbox.rotation.y += this.rotationRate;
                if(this.rotationVelocity < this.rotationRate*1.5){
                    this.rotationVelocity += this.rotationAcceleration;
                }
            } else if (inputMap["d"] || inputMap["D"]) {
                this.carHitbox.rotation.y -= this.rotationRate;
                if(this.rotationVelocity > -this.rotationRate*1.5){
                this.rotationVelocity += -this.rotationAcceleration;
                }

            }
        }
    }
}

updateRotation2() {
 

    // Appliquer la décélération en tout temps
    if (Math.abs(this.rotationVelocity) < 0.0005) { // Un seuil pour arrêter complètement la rotation
        this.rotationVelocity = 0;
    } else {
        this.rotationVelocity *= (1 - this.rotationDeceleration);
    }

    // Appliquer la rotation accumulée
    this.carHitbox.rotation.y += this.rotationVelocity;
}


    applyMovement() {
        const forward = new BABYLON.Vector3(Math.sin(this.carHitbox.rotation.y), 0, Math.cos(this.carHitbox.rotation.y));
        this.carHitbox.moveWithCollisions(forward.scale(this.speed));
        this.applyDeceleration();
        this.carsoud();
        this.raycast();
    }

    applyDeceleration() {
        this.isDriving ? this.deceleration = 0.002 : this.deceleration = 0.002;
        if (this.speed > 0) {
            this.speed = Math.max(this.speed - this.deceleration, 0);
        } else if (this.speed < 0) {
            this.speed = Math.min(this.speed + this.deceleration, 0);
        }
    }

    raycast() {
        var ray = new BABYLON.Ray(this.carHitbox.position, new BABYLON.Vector3(0, -1, 0)); 
        var pickInfo = this.scene.pickWithRay(ray, (item) => {
            const excludedNames =  ["heroBox","Male_shorts", "Male_shoes","Male_tshirt" ,"Male_body","Male_hair"];
            return item && item !== this.carHitbox && item !== this.carObjet && !excludedNames.includes(item?.name) && item.name !== "skyBox";
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
