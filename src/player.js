// player.js
import { GUIManager } from "./guiManager.js";
import { Car } from "./car.js";
import { audioManager, hideMinimap } from "./main.js";
import { playLabyrinthe } from "./labyrinthe.js"; // Importer playLabyrinthe
import { createCarIndicator } from './indicateur.js';

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
    this.JUMP_POWER = 0.05;
    this.jumpTime = 0;
    this.rings = [];
    this.teleportCooldown = 2000;
    this.lastTeleportTime = 0;
    this.hideMinimap = hideMinimap;
    this.readedLetter = false;
    this.closetoFlame = false;
    this.lastToggleTime = 0;
    this.carInteractionLock = false;
    this.carIndicator = createCarIndicator(scene, this.car);
    this.carIndicator.isVisible = true;
    this.indicatorVisible = true;
    this.isInLabyrinth = false;
  }

  async createHero() {
    document.getElementById("numero").innerHTML = "2/2";
    this.heroBox = BABYLON.MeshBuilder.CreateBox(
      "heroBox",
      { width: 1, height: 2, depth: 1 },
      this.scene
    );
    this.heroBox.position = new BABYLON.Vector3(26.8, 1.74, 56.48);
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
      }
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

  checkInteraction(inputMap) {
    // Réinitialisation de la notification
    this.guiManager.setNotif(this.interactionNotification, false);
    const currentTime = Date.now();
    const toggleCooldown = 500;


    if (inputMap["i"] || inputMap["I"]) {
      if (currentTime - this.lastToggleTime > toggleCooldown) {
        this.guiManager.showCommandsLetter();
        this.lastToggleTime = currentTime;
      }
    }

    if (inputMap["o"] || inputMap["O"]) {
      if (currentTime - this.lastToggleTime > toggleCooldown && !this.isInLabyrinth) {
        this.indicatorVisible = !this.indicatorVisible;
        this.indicateur.setEnabled(this.indicatorVisible);
        this.lastToggleTime = currentTime;
      }
    }

    if (this.isDriving) return;

    var Portal = this.scene.getMeshByName("Object_4.005");
    Portal.isInteractable = true;
    
    // Vérification de l'interaction avec l'objet "portal"
    if (Portal && Portal.isInteractable) {
      var distanceToObject = BABYLON.Vector3.Distance(
        this.heroBox.position,
        Portal.getAbsolutePosition()
      );

      if (distanceToObject < 5 ) {
        this.guiManager.setNotif(this.interactionNotification, true, "'E' pour entrer dans le portail");
        if (inputMap["e"] || inputMap["E"]) {
          this.isInLabyrinth = true;
          
          playLabyrinthe(this.scene, this.camera, this.heroBox, this.audioManager,this);
          hideLoadingScreen();
        }
      }
    }
    var carHitbox = this.car.carHitbox;
    // Vérification de l'interaction avec la voiture "carHitbox"
    if (carHitbox) {
      var distanceToCar = BABYLON.Vector3.Distance(
        this.heroBox.position,
        carHitbox.position
      );
      if (distanceToCar < 5) {
        this.guiManager.setNotif(this.interactionNotification, true, "'E' pour entrer dans la voiture");
        if ((inputMap["e"] || inputMap["E"]) && !this.carInteractionLock) {
          this.carInteractionLock = true; // Verrouiller l'interaction avec la voiture
          this.interactWithCar(carHitbox);
          this.carIndicator.setEnabled(false)
          setTimeout(() => {
            this.carInteractionLock = false; // Déverrouiller après un court délai
          }, 500); // Délai de 500 ms pour éviter les doubles interactions
        }
      }
    }

    //Verifivation de l'intyeraction avec la boite au lettre "Post_box_1"
    this.postBox = this.scene.getMeshByName("Post_box_1");
    this.postBox_position = this.postBox.getAbsolutePosition();
    //console.log(this.readedLetter);
    if (this.postBox) {
      var distanceToPostBox = BABYLON.Vector3.Distance(
        this.heroBox.position,
        this.postBox.getAbsolutePosition()
      );
      if (this.readedLetter == false) {
        if(this.indicatorVisible == true){
         this.indicateur.setEnabled(true);
        }
        this.indicateur.setTarget(this.postBox_position);
      }
      if (
        distanceToPostBox < 3 &&
        !this.isDriving &&
        !this.guiManager.isReading
      ) {
        this.guiManager.setNotif(this.interactionNotification, true , "'E' pour lire la lettre");
        if (inputMap["e"] || inputMap["E"]) {
          this.guiManager.showLetter();
          this.readedLetter = true;
        }
      }
    }

    // Vérification de l'interaction avec coffre "Sketchfab_model"

    // Tableau des coffres et des couleurs associées
    const coffres = [
      { name: "Chest", color: "red" },
      { name: "Chest.001", color: "blue" },
      { name: "Chest.002", color: "yellow" },
      { name: "Chest.003", color: "black" },
      { name: "Chest.004", color: "green" },
    ];

    // Fonction pour mettre à jour l'indicateur
    const updateIndicateur = () => {
      // Vérifie si tous les anneaux ont été récupérés
      const allRingsCollected = coffres.every((coffre) =>
        this.rings.includes(coffre.color)
      );

      if (allRingsCollected) {
        // Si tous les anneaux ont été récupérés, pointer vers "portal"
        const portalMesh = this.scene.getMeshByName("Object_4.005");
        if (portalMesh) {
          this.indicateur.setTarget(portalMesh.getAbsolutePosition());
        }
      } else {
        // Sinon, pointer vers le prochain coffre non récupéré
        for (let i = 0; i < coffres.length; i++) {
          if (!this.rings.includes(coffres[i].color)) {
            const nextCoffre = this.scene.getTransformNodeByName(
              coffres[i].name
            );
            if (nextCoffre) {
              this.indicateur.setTarget(nextCoffre.getAbsolutePosition());
              break;
            }
          }
        }
      }
    };

    // Boucle à travers chaque coffre
    coffres.forEach((coffre) => {
      const sketchfab_model = this.scene.getTransformNodeByName(coffre.name);

      if (sketchfab_model) {
        const distanceToSketchfab = BABYLON.Vector3.Distance(
          this.heroBox.position,
          sketchfab_model.getAbsolutePosition()
        );

        this.scene.animationGroups.forEach((anim) => {
          if (anim.name === "ChestBody|Chest_Shake") {
            anim.start(false, 1, anim.from, anim.to, false);
          }
        });

        if (distanceToSketchfab < 3 && !this.guiManager.isReading && this.readedLetter && !this.isDriving) {
          // Si on a déjà récupéré l'anneau de la couleur du coffre, on ne peut plus interagir
          if (this.rings.includes(coffre.color)) return;

          this.guiManager.setNotif(this.interactionNotification, true, "'E' pour ouvrir le coffre");
          if (inputMap["e"] || inputMap["E"]) {
            // Vérifier si la lettre a été lue
            if (this.readedLetter) {
              // Récupérer l'anneau de la couleur du coffre
              this.recupererAnneaux(coffre.color);
              this.audioManager.playSound("collect");

              // Lancer l'animation "Chest_Up|Chest_Open_Close" une seule fois
              this.scene.animationGroups.forEach((anim) => {
                if (anim.name === "Chest_Up|Chest_Open_Close") {
                  anim.start(false, 1, anim.from, anim.to, false);
                }
                // Dispose le coffre après 5 secondes
                setTimeout(() => {
                  sketchfab_model.dispose();
                  updateIndicateur(); // Mettre à jour l'indicateur après avoir disposé du coffre
                }, 5000);
              });
            }
          }
        }
      }
    });

    // Initialiser l'indicateur au début si la lettre a été lue
    if (this.readedLetter) {
      updateIndicateur();
    }

    

    // Vérification de l'interaction avec la flamme olympique
    const flame = this.scene.getTransformNodeByName("Torch");
    if (flame) {
      const distanceToFlame = BABYLON.Vector3.Distance(
        this.heroBox.position,
        flame.getAbsolutePosition()
      );

      if (distanceToFlame < 3 && !this.guiManager.isReading) {
        this.guiManager.setNotif(this.interactionNotification, true, "'E' pour récupérer la Flamme olympique");
        this.closetoFlame = true;
        if (inputMap["e"] || inputMap["E"]) {
          this.audioManager.playSound("endgame");
          //redirection vers la scene de fin page html apres 5 secondes
          setTimeout(() => {
            window.location.href = "outro.html";
          }
          , 5000);

        }
      } else {
        this.closetoFlame = false;
      }
    }
  }



  isCloseToFlame() {
    return this.closetoFlame;
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
    this.carIndicator.setEnabled(true)
    this.carIndicator.isVisible = true;
    

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
      this.guiManager.setNotif(this.interactionNotification, true, "'E' pour sortir de la voiture");
      if ((inputMap["e"] || inputMap["E"]) && !this.carInteractionLock) {
        this.exitCar();
        this.carInteractionLock = true; // Activer le verrouillage
        setTimeout(() => {
          this.carInteractionLock = false; // Désactiver le verrouillage après un délai
        }, 500); // Ajustez le délai selon vos besoins
      }
      this.car.move(inputMap, this.isDriving);
      return;
    }

    if (this.car.speed !== 0) {
      this.car.applyMovement();
      this.car.updateRotation(inputMap);
    }
    this.raycast(this.heroBox);
    // Rotation du personnage avec Q et D
    
    if (inputMap["q"] || inputMap["Q"] || inputMap["a"] || inputMap["A"]) {
      this.heroBox.rotation.y -= 5.3 * deltaTime;
    }
    if (inputMap["d"] || inputMap["D"]) {
      this.heroBox.rotation.y += 5.3 * deltaTime;
    }

    // gestoin du mouvement et des animations de course
    if (inputMap["s"] || inputMap["S"] || inputMap["z"] || inputMap["Z"] || inputMap["w"] || inputMap["W"]) {
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

    if ((inputMap["b"] || inputMap["B"]) && (inputMap["n"] || inputMap["N"])) {
      this.teleportRandomly();
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

  recupererAnneaux(color) {
    const ring = document.querySelector(`.ring.${color}`);
    this.rings.push(color);
    if (ring) {
      ring.classList.add("animate");
      ring.classList.remove("nonCollected");

      // Définir la couleur collectée pour l'anneau
      let collectedColor;
      switch(color) {
        case 'blue':
          collectedColor = '#0078d0';
          break;
        case 'yellow':
          collectedColor = '#FFB114';
          break;
        case 'black':
          collectedColor = 'black';
          break;
        case 'green':
          collectedColor = '#00A651';
          break;
        case 'red':
          collectedColor = '#F0282D';
          break;
        default:
          collectedColor = '#5f5f5f'; // Couleur par défaut si non collecté
      }

      // Appliquer la couleur collectée en tant que variable CSS
      document.documentElement.style.setProperty(`--ring-${color}-color`, collectedColor);

      // Remove the animation class and add the collected class after the animation is complete
      ring.addEventListener(
        "animationend",
        function () {
          ring.classList.remove("animate");
          ring.classList.add("collected");
        },
        { once: true }
      );
    } else {
      console.error(`No ring found with the color: ${color}`);
    }
  }


  teleportRandomly() {
    const currentTime = Date.now();
    if (currentTime - this.lastTeleportTime < this.teleportCooldown) {
      return; // Si le cooldown n'est pas terminé, ne fait rien
    }

    const radius = 5; // Rayon de téléportation
    const randomAngle = Math.random() * 2 * Math.PI;
    const offsetX = radius * Math.cos(randomAngle);
    const offsetZ = radius * Math.sin(randomAngle);

    this.heroBox.position.addInPlace(new BABYLON.Vector3(offsetX, 0, offsetZ));

    this.lastTeleportTime = currentTime; // Mise à jour du dernier temps de téléportation
  }
}

function updateLoadingBar(percent) {
  const loadingBar = document.getElementById("loadingBarFill");
  if (loadingBar) {
    // Mise à jour directe de la largeur de la barre de chargement
    loadingBar.style.width = `${percent}%`; // Définit la largeur en fonction du pourcentage de chargement
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    loadingScreen.style.display = "none";
  }
}



