import { GUIManager } from "./guiManager.js";
import { Car } from "./car.js";
import { audioManager, hideMinimap } from "./main.js";

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
  }

  async createHero() {
    document.getElementById("numero").innerHTML = "2/2";
    this.heroBox = BABYLON.MeshBuilder.CreateBox(
      "heroBox",
      { width: 1, height: 2, depth: 1 },
      this.scene
    );
    this.heroBox.position = new BABYLON.Vector3(45.8, 1.74, 48.26);
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
    if (this.isDriving) return;

    var interactableObject = this.scene.getMeshByName("square");
    var carHitbox = this.car.carHitbox;
    // Vérification de l'interaction avec l'objet "square"
    if (interactableObject && interactableObject.isInteractable) {
      var distanceToObject = BABYLON.Vector3.Distance(
        this.heroBox.position,
        interactableObject.position
      );
      //console.log(this.heroBox.position);

      if (distanceToObject < 5 && this.rings.length === 5) {
        //Si on a deja recuperer l'anneau bleu on ne peut plus l'interagir
        if (this.rings.includes("blue")) return;
        this.guiManager.setNotif(this.interactionNotification, true);
        if (inputMap["e"] || inputMap["E"]) {
          this.playLabyrinthe();
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
    this.postBox_position = this.postBox.getAbsolutePosition();
    console.log(this.readedLetter);
    if (this.postBox) {
      var distanceToPostBox = BABYLON.Vector3.Distance(
        this.heroBox.position,
        this.postBox.getAbsolutePosition()
      );
      if (this.readedLetter == false) {
        this.indicateur.setEnabled(true);
        this.indicateur.setTarget(this.postBox_position);
      }
      if (
        distanceToPostBox < 3 &&
        !this.isDriving &&
        !this.guiManager.isReading
      ) {
        this.guiManager.setNotif(this.interactionNotification, true);
        if (inputMap["e"] || inputMap["E"]) {
          this.guiManager.showLetter("this.letterText");
          this.readedLetter = true;
        }
      }
    }

    // Vérification de l'interaction avec coffre "Sketchfab_model"

    // Tableau des coffres et des couleurs associées
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
      for (let i = 0; i < coffres.length; i++) {
        if (!this.rings.includes(coffres[i].color)) {
          const nextCoffre = this.scene.getTransformNodeByName(coffres[i].name);
          if (nextCoffre) {
            this.indicateur.setTarget(nextCoffre.getAbsolutePosition());
            break;
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

        if (distanceToSketchfab < 3 && !this.guiManager.isReading && this.readedLetter) {
          // Si on a déjà récupéré l'anneau de la couleur du coffre, on ne peut plus interagir
          if (this.rings.includes(coffre.color)) return;

          this.guiManager.setNotif(this.interactionNotification, true);
          if (inputMap["e"] || inputMap["E"]) {
            // Récupérer l'anneau de la couleur du coffre
            this.recupererAnneaux(coffre.color);

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
    });

    if (this.readedLetter) {
    updateIndicateur();}
  }

  async playLabyrinthe() {
    showLoadingScreen();
    this.heroBox.setAbsolutePosition(new BABYLON.Vector3(104.84, 1, 104.9));

    //desenable this.indicateur
    this.indicateur.setEnabled(false);
    this.hideMinimap();

    // Créer un mesh parent pour contenir tous les meshes du labyrinthe
    let mazeParent = new BABYLON.Mesh("mazeParent", this.scene);
    mazeParent.position = new BABYLON.Vector3(100, 0, 100); // Position du parent

    // Matrice représentant le labyrinthe (0 = espace vide, 1 = mur)
    const mazeMatrix = [
      [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0,
        0, 0, 1, 1, 1, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
        0, 0, 1, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
        0, 0, 1, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
        0, 0, 1, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
        0, 0, 1, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0,
        0, 0, 1, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 1, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 1, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 0, 1,
      ],
      [
        1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 1, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 1, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
        0, 1, 0, 0, 0, 1, 0, 0, 1,
      ],
      [
        1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 1,
      ],
      [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1,
      ],
    ];

    // Créer un sol
    let groundMaterial = new BABYLON.StandardMaterial(
      "groundMaterial",
      this.scene
    );
    groundMaterial.diffuseTexture = new BABYLON.Texture(
      "assets/Texture/floor.png",
      this.scene
    );

    const mazeWidth = mazeMatrix[0].length; // Largeur de la matrice
    const mazeHeight = mazeMatrix.length; // Hauteur de la matrice
    let ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: mazeWidth * 2, height: mazeHeight * 2 },
      this.scene
    );
    ground.position = new BABYLON.Vector3(mazeWidth - 1, 0, mazeHeight - 1); // Ajuster la position du sol
    ground.material = groundMaterial;
    ground.parent = mazeParent;
    ground.checkCollisions = true;

    // Créer un matériau avec une texture pour les murs
    let wallMaterial = new BABYLON.StandardMaterial("wallMaterial", this.scene);
    wallMaterial.diffuseTexture = new BABYLON.Texture(
      "assets/Texture/wall.png",
      this.scene
    );

    // Utiliser une fonction fléchée pour conserver le contexte de `this`
    const createWall = (x, z, width, depth) => {
      let wall = BABYLON.MeshBuilder.CreateBox(
        "wall",
        { height: 4, width: width, depth: depth },
        this.scene
      );
      wall.position = new BABYLON.Vector3(x, 2.5, z);
      wall.material = wallMaterial; // Appliquer la texture
      wall.checkCollisions = true;
      wall.parent = mazeParent;
      return wall;
    };

    // Générer les murs en fonction de la matrice
    for (let z = 0; z < mazeHeight; z++) {
      for (let x = 0; x < mazeWidth; x++) {
        if (mazeMatrix[z][x] === 1) {
          createWall(x * 2, z * 2, 2, 2); // Création de murs collés avec dimensions ajustées
        }
      }
    }

    mazeParent.scaling = new BABYLON.Vector3(1, 1, 1);

    // Positionner la caméra en hauteur pour une vue d'en haut
    this.camera.heightOffset = 30;
    this.camera.radius = 15;

    // Créer un effet de post-traitement pour limiter la vision autour du personnage
    var postProcess = new BABYLON.ImageProcessingPostProcess(
      "processing",
      1.0,
      this.camera
    );
    postProcess.vignetteWeight = 100;
    postProcess.vignetteStretch = 0;
    postProcess.vignetteColor = new BABYLON.Color4(0, 0, 0, 1); // Couleur noire pour la vignette
    postProcess.vignetteEnabled = true;

    hideLoadingScreen();
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
      if (inputMap["f"] || inputMap["F"]) {
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

function showLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    loadingScreen.style.display = "flex";
  }
}
