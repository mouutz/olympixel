import { GUIManager } from "./guiManager.js";
import { Car } from "./car.js"; // Importez la classe Car

export class Player {

  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.guiManager = new GUIManager(scene);
    this.interactionNotification = this.guiManager.createNotif();
    this.isAnimating = false;
    this.isDriving = false;
    this.speed = 0.15;
    this.car = new Car(scene, camera); // Créez une instance de Car
    
  }
  

  async createHero() {
    this.heroBox = BABYLON.MeshBuilder.CreateBox("heroBox", { width: 5, height: 2, depth: 6 }, this.scene);
    this.heroBox.position = new BABYLON.Vector3(18, 1.5, 3.5);
    this.heroBox.isVisible = true;
    this.heroBox.checkCollisions = true;

    /*const result = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/models/", "perso.glb", this.scene);
    this.animations = result.animationGroups;
    let heroModel = result.meshes[0];
    heroModel.parent = this.heroBox;
    heroModel.scaling = new BABYLON.Vector3(1, 1, 1);
    heroModel.position.y = -0.85;
    this.hero = heroModel;*/

    // Ajoutez cette ligne pour rendre le héros accessible globalement via la scène
    this.scene.hero = this;

    await this.car.createCar(); // Initialisez la voiture ici

    return this.heroBox;
}


  checkInteraction(inputMap) {
    var interactableObject = this.scene.getMeshByName("square");
    if (interactableObject && interactableObject.isInteractable) {
      var distance = BABYLON.Vector3.Distance(this.heroBox.position, interactableObject.position);
      if (distance < 5) {
        this.guiManager.setNotif(this.interactionNotification, true);
        if (inputMap["e"] || inputMap["E"]) {
          setTimeout(() => { window.location.href = "page2.html"; }, 1000);
        }
      } else {
        this.guiManager.setNotif(this.interactionNotification, false);
      }
    }
  }

  checkInteractionCar(inputMap) {
    var carHitbox = this.scene.getMeshByName("carHitbox");
    if (carHitbox) {
        var distance = BABYLON.Vector3.Distance(this.heroBox.position, carHitbox.position);
        if (distance < 5) {
            this.guiManager.setNotif(this.interactionNotification, true);
            if (inputMap["e"] || inputMap["E"]) {
                this.interactWithCar(carHitbox);
            }
        } else {
            this.guiManager.setNotif(this.interactionNotification, false);
        }
    }
  }

  interactWithCar(carHitbox) {
    this.heroBox.position = carHitbox.position.clone();
    // rendre le hero transparent
    this.hero.isVisible = false;
    this.heroBox.isVisible = false;
    // Mettre le hero dans la voiture   
    this.heroBox.setParent(carHitbox);
    this.heroBox.rotationQuaternion = BABYLON.Quaternion.Identity();
    this.isDriving = true;
    
    //changer la hitbox du hero pour la hitbox de la voiture
    this.heroBox.checkCollisions = false;

    

    
    if (this.camera) {
      this.camera.lockedTarget = carHitbox;
    }
  }

  exitCar() {

    if (!this.isDriving) return; // Sortir seulement si le personnage est dans la voiture
    // Détacher le héros de la hitbox de la voiture et le rendre visible
    this.heroBox.setParent(null);
    this.heroBox.isVisible = false;

    this.heroBox.rotationQuaternion = null;
    this.heroBox.rotation.y = 0;

    this.heroBox.checkCollisions = true;
    
    // Positionner le héros à côté de la voiture
    var carHitbox = this.scene.getMeshByName("carHitbox");
    if (carHitbox) {
      var leftSideOffset = new BABYLON.Vector3(3, 0, 0); // 3 mètres sur le côté gauche
      leftSideOffset.rotateByQuaternionAroundPointToRef(BABYLON.Quaternion.FromEulerVector(carHitbox.rotation), BABYLON.Vector3.Zero(), leftSideOffset);
      var exitPosition = carHitbox.position.add(leftSideOffset);


      this.heroBox.position = exitPosition;
      this.heroBox.rotation.y = carHitbox.rotation.y;
      this.hero.rotation.y = carHitbox.rotation.y;

  }
    

    // Mettre à jour l'état du personnage
    this.isDriving = false;

    // Réinitialiser la cible de la caméra pour suivre le héros
    if (this.camera) {
        this.camera.lockedTarget = this.heroBox;
    }
    
}



  raycast(heroBox) {
    var ray = new BABYLON.Ray(heroBox.position, new BABYLON.Vector3(0, -1, 0));
    var pickInfo = this.scene.pickWithRay(ray, (item) => {
      const excludedNames = ["Male_shorts", "Male_shoes"];
      return item && item !== heroBox && !excludedNames.includes(item.name);
    });

    if (pickInfo.hit && pickInfo.pickedMesh) {
      var groundPosition = pickInfo.pickedPoint;
      var heroHeightOffset = 1;
      if(groundPosition.y<2){
        var adjustmentSpeed = 0.05;
      }
      else{
        var adjustmentSpeed = 1;
      }
      var targetY = groundPosition.y + heroHeightOffset;
      heroBox.position.y += (targetY - heroBox.position.y) * adjustmentSpeed;
    }
  }

  move(inputMap) {
  
    if (this.isDriving) {
      if(inputMap["f"]) {
        this.exitCar();
      }
      this.car.move(inputMap); // Déléguez le mouvement à la voiture

    } else {
      // Logique de rotation du héros
      if (inputMap["q"] || inputMap["Q"]) {
        this.heroBox.rotation.y -= 0.04;
      }
      if (inputMap["d"] || inputMap["D"]) {
        this.heroBox.rotation.y += 0.04;
      }

      this.heroBox.checkCollisions = false;


      var forward = new BABYLON.Vector3(Math.sin(this.heroBox.rotation.y), 0, Math.cos(this.heroBox.rotation.y));
      var isMoving = false;

      if (inputMap["s"] || inputMap["S"]) {
        var forwardDelta = forward.scale(this.speed);
        this.heroBox.moveWithCollisions(forwardDelta);
        /*if (!this.isAnimating) {
          this.startAnimation("CharacterArmature|Run_Back");
          this.isAnimating = true;
        }*/
        isMoving = true;
      } else if (inputMap["z"] || inputMap["Z"]) {
        var backwardDelta = forward.scale(-this.speed);
        this.heroBox.moveWithCollisions(backwardDelta);
        /*if (!this.isAnimating) {
          this.startAnimation("CharacterArmature|Run");
          this.isAnimating = true;
        }*/
        isMoving = true;
      }
      //quand j'appui sur  E la'animation intercat s'active 
      if (inputMap["e"] || inputMap["E"]) {
        /*if (!this.isAnimating) {
          this.startAnimation("CharacterArmature|Interact");
          this.isAnimating = true;
        }*/
        isMoving = true;
      }


      if (!isMoving && this.isAnimating) {
        //this.startAnimation("CharacterArmature|Idle_Neutral");
        this.isAnimating = false;
      }
      this.raycast(this.heroBox);
    }


    
    this.checkInteraction(inputMap);
    this.checkInteractionCar(inputMap);
  }

  startAnimation(animationName) {
    const animation = this.animations.find(anim => anim.name === animationName);
    if (animation) {
      this.animations.forEach(anim => anim.stop());
      animation.start(true);
    }
  }

  stopAnimation(animationName) {
    const animation = this.animations.find(anim => anim.name === animationName);
    if (animation) {
      animation.stop();
    }
  }
}
