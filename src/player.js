import { GUIManager } from "./guiManager.js";
import { Car } from "./car.js"; 
import { audioManager } from "./main.js";

export class Player {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.guiManager = new GUIManager(scene);
    this.interactionNotification = this.guiManager.createNotif();
    this.isAnimating = false;
    this.isDriving = false;
    this.speed = 15;
    this.audioManager = audioManager;
    this.isJumping = false;
    this.car = new Car(scene, camera, this.isDriving);
    this.JUMP_COOLDOWN = 750;
    this.JUMP_POWER = 5.3;
    this.jumpTime = 0;

  }

  async createHero() {
    document.getElementById('numero').innerHTML = "2/2";
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
      this.scene,
      function (event) {
        if (event.lengthComputable) {
            let percentComplete = (event.loaded / event.total) * 100;
            updateLoadingBar(percentComplete);
        }
    });
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

  
  checkInteraction(inputMap) {

    // Réinitialisation de la notification
    this.guiManager.setNotif(this.interactionNotification, false);
    if (this.isDriving) return;

    var interactableObject = this.scene.getMeshByName("square");
    var carHitbox = this.car.carHitbox;
    // Vérification de l'interaction avec l'objet "square"
    if (interactableObject && interactableObject.isInteractable) {
      var distanceToObject = BABYLON.Vector3.Distance(
        this.heroBox.position,
        interactableObject.position
      );
      if (distanceToObject < 5) {
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
      if (distanceToCar < 5) {
        this.guiManager.setNotif(this.interactionNotification, true);
        if (inputMap["e"] || inputMap["E"]) {
          this.interactWithCar(carHitbox);
        }
      }
    }


    //Verifivation de l'intyeraction avec la boite au lettre "Post_box_1"
    this.postBox = this.scene.getMeshByName("Post_box_1");
    if (this.postBox) {
      var distanceToPostBox = BABYLON.Vector3.Distance(
        this.heroBox.position,
        this.postBox.getAbsolutePosition()
      );
      if (distanceToPostBox < 3 && !this.isDriving && !this.guiManager.isReading) {
        this.guiManager.setNotif(this.interactionNotification, true);
        if (inputMap["e"] || inputMap["E"]) {
          this.guiManager.showLetter("this.letterText");
        }
      }
    }

    // Vérification de l'interaction avec coffre "Sketchfab_model"
    this.sketchfab_model = this.scene.getTransformNodeByName("Chest");
    if (this.sketchfab_model) {
      var distanceToSketchfab = BABYLON.Vector3.Distance(
        this.heroBox.position,
        this.sketchfab_model.getAbsolutePosition()
      );
      this.scene.animationGroups.forEach((anim) => {
        if (anim.name === "ChestBody|Chest_Shake") {
          anim.start(false, 1, anim.from, anim.to, false);
        }
      });
      if (distanceToSketchfab < 3 && !this.isDriving && !this.guiManager.isReading) {
        this.guiManager.setNotif(this.interactionNotification, true);
        if (inputMap["e"] || inputMap["E"]) {

          //lancer l'animation "Chest_Up|Chest_Open_Close" uen seule fois
          this.scene.animationGroups.forEach((anim) => {
            if (anim.name === "Chest_Up|Chest_Open_Close") {
              anim.start(false, 1, anim.from, anim.to, false);
            }
            //dispose le coffre après 5 secondes
            setTimeout(() => {
              this.sketchfab_model.dispose();
            }, 5000);
          });
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
    var carHitbox = this.car.carHitbox;
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
    let deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;
    let isMoving = false;
    const forward = new BABYLON.Vector3(
      Math.sin(this.heroBox.rotation.y),
      0,
      Math.cos(this.heroBox.rotation.y)
    );

    this.checkInteraction(inputMap);

    if (this.isDriving) {
      if (inputMap["f"]|| inputMap["F"]) {
        this.exitCar();
      }
      this.car.move(inputMap, this.isDriving);
      return;
    }

    if (this.car.speed !== 0) {
      this.car.applyMovement();
      this.car.updateRotation2(inputMap);
    }
    this.raycast(this.heroBox);
    // Rotation du personnage avec Q et D
    if (inputMap["q"] || inputMap["Q"]) {
      this.heroBox.rotation.y -= 5.3 * deltaTime;
    }
    if (inputMap["d"] || inputMap["D"]) {
      this.heroBox.rotation.y += 5.3 * deltaTime;
    }

    // gestoin du mouvement et des animations de course
    if (inputMap["s"] || inputMap["S"] || inputMap["z"] || inputMap["Z"]) {
      let directionMultiplier = inputMap["s"] || inputMap["S"] ? 1 : -1;
      this.heroBox.moveWithCollisions(
        forward.scale(this.speed * directionMultiplier * deltaTime)
      );
      let runningAnimation =
        inputMap["s"] || inputMap["S"] ? "Back" : "Running";
      if (!this.isAnimating || this.currentAnimation !== runningAnimation) {
        this.startAnimation(runningAnimation);
        if (!this.isJumping) {
          this.audioManager.playSound("run");
        }
        this.isAnimating = true;
      }
      isMoving = true;
    }

    if (this.isJumping) {
      this.jumpTime += deltaTime;
      if (this.jumpTime <= this.JUMP_COOLDOWN) {
        // Appliquer la force de saut multipliée par deltaTime
        this.heroBox.position.y += this.JUMP_POWER * deltaTime;
      } else {
        this.isJumping = false;
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


function updateLoadingBar(percent) {
  const loadingBar = document.getElementById("loadingBarFill");
  if (loadingBar) {
      // Mise à jour directe de la largeur de la barre de chargement
      loadingBar.style.width = `${percent}%`; // Définit la largeur en fonction du pourcentage de chargement
  }
}
