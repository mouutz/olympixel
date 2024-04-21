import { GUIManager } from "./guiManager.js";
import { Car } from "./car.js"; // Importez la classe Car

export class Player {
  constructor(scene, camera, audioManager) {
    this.scene = scene;
    this.camera = camera;
    this.guiManager = new GUIManager(scene);
    this.interactionNotification = this.guiManager.createNotif();
    this.isAnimating = false;
    this.isDriving = false;
    this.speed = 0.15;
    this.audioManager = audioManager;
    this.isJumping = false;
    this.car = new Car(scene, camera, audioManager);
    this.JUMP_COOLDOWN = 750;
    this.JUMP_POWER = 0.05;
    this.jumpTime = 0;

    this.river = scene.getMeshByName("Bridge_Tile_1.001");
    this.yacht = scene.getMeshByName("Yacht_1");
    this.yacht2 = scene.getMeshByName("Yacht_2");
    this.boat2 = scene.getMeshByName("Boat_2__1_");
    this.ambulance = scene.getMeshByName("Ambulance_1__2_");
  }

  async createHero() {
    this.heroBox = BABYLON.MeshBuilder.CreateBox(
      "heroBox",
      { width: 1, height: 2, depth: 1 },
      this.scene
    );
    this.heroBox.position = new BABYLON.Vector3(18, 1.5, 3.5);
    this.heroBox.isVisible = false;
    this.heroBox.checkCollisions = true;

    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "assets/models/",
      "perso.glb",
      this.scene
    );
    this.animations = result.animationGroups;
    let heroModel = result.meshes[0];
    heroModel.parent = this.heroBox;
    heroModel.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
    heroModel.position.y = -0.85;
    this.hero = heroModel;

    this.startAnimation("Idle");
    this.scene.hero = this;

    await this.car.createCar();
    return this.heroBox;
  }

  updateEnvironmentSounds(hero_position) {
    var river_position = this.river.getAbsolutePosition();
    var yacht_position = this.yacht.getAbsolutePosition();
    var yacht2_position = this.yacht2.getAbsolutePosition();
    var boat2_position = this.boat2.getAbsolutePosition();
    var ambulance_position = this.ambulance.getAbsolutePosition();

    if (this.river && this.yacht && this.boat2 && this.yacht2) {
      var D_hero_river = BABYLON.Vector3.Distance(
        hero_position,
        river_position
      );
      var D_hero_yacht = BABYLON.Vector3.Distance(
        hero_position,
        yacht_position
      );

      var D_hero_yacht2 = BABYLON.Vector3.Distance(
        hero_position,
        yacht2_position
      );

      var D_hero_boat2 = BABYLON.Vector3.Distance(
        hero_position,
        boat2_position
      );

      if (
        D_hero_river < 50 ||
        D_hero_yacht < 50 ||
        D_hero_boat2 < 50 ||
        D_hero_yacht2 < 30
      ) {
        this.audioManager.playSound("river");
        this.audioManager.stopSound("city");
      } else {
        this.audioManager.stopSound("river");
        this.audioManager.playSound("city");
      }
    } else {
      this.audioManager.playSound("city");
    }

    if (this.ambulance) {
      var D_hero_ambu = BABYLON.Vector3.Distance(
        hero_position,
        ambulance_position
      );

      if (D_hero_ambu < 30) {
        this.audioManager.playSound("ambulance");
      } else {
        this.audioManager.stopSound("ambulance");
      }
    }
  }
  checkInteraction(inputMap) {
    var interactableObject = this.scene.getMeshByName("square");
    var carHitbox = this.scene.getMeshByName("carHitbox");

    // Réinitialisation de la notification
    this.guiManager.setNotif(this.interactionNotification, false);

    // Vérification de l'interaction avec l'objet "square"
    if (interactableObject && interactableObject.isInteractable) {
      var distanceToObject = BABYLON.Vector3.Distance(
        this.heroBox.position,
        interactableObject.position
      );
      if (distanceToObject < 5 && !this.isDriving) {
        this.guiManager.setNotif(this.interactionNotification, true);
        if (inputMap["e"] || inputMap["E"]) {
          setTimeout(() => {
            window.location.href = "page2.html";
          }, 1000);
        }
      }
    }

    // Vérification de l'interaction avec la voiture "carHitbox"
    if (carHitbox) {
      var distanceToCar = BABYLON.Vector3.Distance(
        this.heroBox.position,
        carHitbox.position
      );
      if (distanceToCar < 5 && !this.isDriving) {
        this.guiManager.setNotif(this.interactionNotification, true);
        if (inputMap["e"] || inputMap["E"]) {
          this.interactWithCar(carHitbox);
        }
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

    this.audioManager.stopSound("run");
    this.audioManager.stopSound("jump");

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
      leftSideOffset.rotateByQuaternionAroundPointToRef(
        BABYLON.Quaternion.FromEulerVector(carHitbox.rotation),
        BABYLON.Vector3.Zero(),
        leftSideOffset
      );
      var exitPosition = carHitbox.position.add(leftSideOffset);

      this.heroBox.position = exitPosition;
      this.heroBox.rotation.y = carHitbox.rotation.y;
      this.hero.rotation.y = carHitbox.rotation.y;
    }
    this.audioManager.stopSound("drive0");
    this.audioManager.stopSound("drive1");
    this.audioManager.stopSound("caridle");
    
    this.startAnimation("Idle");

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
      const excludedNames = [
        "Male_shorts",
        "Male_shoes",
        "Male_tshirt",
        "Male_body",
        "Male_hair",
      ];
      return (
        item &&
        item !== heroBox &&
        !excludedNames.includes(item.name) &&
        item.name !== "skyBox"
      );
    });

    if (pickInfo.hit && pickInfo.pickedMesh) {
      var groundPosition = pickInfo.pickedPoint;
      var heroHeightOffset = 1;
      if (groundPosition.y < 2) {
        var adjustmentSpeed = 0.05;
      } else {
        var adjustmentSpeed = 1;
      }
      var targetY = groundPosition.y + heroHeightOffset;
      heroBox.position.y += (targetY - heroBox.position.y) * adjustmentSpeed;
    }
  }

  move(inputMap) {
    let deltaTime = this.scene.getEngine().getDeltaTime();
    let hero_position = this.heroBox.getAbsolutePosition();
    let isMoving = false;
    const forward = new BABYLON.Vector3(
      Math.sin(this.heroBox.rotation.y),
      0,
      Math.cos(this.heroBox.rotation.y)
    );

    this.updateEnvironmentSounds(hero_position);
    this.checkInteraction(inputMap);

    if (this.isDriving) {
      if (inputMap["f"]) {
        this.exitCar();
      }
      this.car.move(inputMap, this.audioManager); // gestion du mouvement en voiture

      return;
    }

    if(this.car.speed !== 0){
      this.car.applyMovement();
    }
    this.raycast(this.heroBox);
    // Rotation du personnage avec Q et D
    if (inputMap["q"] || inputMap["Q"]) {
      this.heroBox.rotation.y -= 0.04;
    }
    if (inputMap["d"] || inputMap["D"]) {
      this.heroBox.rotation.y += 0.04;
    }

    // gestoin du mouvement et des animations de course
    if (inputMap["s"] || inputMap["S"] || inputMap["z"] || inputMap["Z"]) {
      let directionMultiplier = inputMap["s"] || inputMap["S"] ? 1 : -1;
      this.heroBox.moveWithCollisions(
        forward.scale(this.speed * directionMultiplier)
      );
      let runningAnimation =
        inputMap["s"] || inputMap["S"] ? "Back" : "Running";
      if (!this.isAnimating || this.currentAnimation !== runningAnimation) {
        this.startAnimation(runningAnimation);
        if(!this.isJumping){
        this.audioManager.playSound("run");
        }
        this.isAnimating = true;
      }
      isMoving = true;
    }

    
    if (this.isJumping) {
      this.jumpTime += deltaTime;
      if (this.jumpTime <= this.JUMP_COOLDOWN/2) {
        // Continue la montée si le temps de montée n'est pas écoulé
        this.heroBox.position.y += this.verticalSpeed;
    }
  }

  
    // gestion du saut pendant la course
    if (inputMap[" "]) {
      if (this.isJumping) return;
      
      this.audioManager.stopSound("run");
      this.startAnimation("Jump");
      this.audioManager.playSound("jump");
      this.isJumping = true;
      this.jumpTime = 0;
      this.verticalSpeed = this.JUMP_POWER;
      
      setTimeout(() => {
        this.isAnimating = false;
        this.isJumping = false;
        this.startAnimation("Idle");
      }, this.JUMP_COOLDOWN); // Durée estimée de l'animation de saut
    }


    // Interaction
    if (inputMap["e"] || (inputMap["E"] && !this.isAnimating)) {
      this.startAnimation("Interact");
      setTimeout(() => {
        if (!isMoving) {
          this.startAnimation("Idle");
          this.isAnimating = false;
        }
      }, 3000); // Durée estimée de l'animation d'interaction
    }

    // Revenir à l'animation "Idle" si aucune touche n'est pressée et que le joueur n'est plus en animation
    if (
      !isMoving &&
      this.isAnimating &&
      this.currentAnimation !== "Jump" &&
      this.currentAnimation !== "Interact"
    ) {
      this.audioManager.stopSound("run");
      this.stopAnimation(this.currentAnimation);
      this.startAnimation("Idle");
      this.isAnimating = false;
    }
  }

  startAnimation(animationName) {
    if (this.isJumping) return;
    const animation = this.animations.find(
      (anim) => anim.name === animationName
    );
    if (animation) {
      this.animations.forEach((anim) => anim.stop());
      animation.start(true);
      this.currentAnimation = animationName; // Mise à jour de l'animation actuelle
    }
  }

  stopAnimation(animationName) {
    const animation = this.animations.find(
      (anim) => anim.name === animationName
    );
    if (animation) {
      animation.stop();
    }
  }

  setCamera(camera) {
    this.camera = camera;
  }
}
