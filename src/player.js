import { GUIManager } from "./guiManager.js";
export class Player {

  //On donne la scene 
 constructor(scene) {
   this.scene = scene;
   this.guiManager = new GUIManager(scene);
   this.interactionNotification = this.guiManager.createNotif();
   this.isAnimating = false;
 }


 //Vitesse du hero
 speed = 0.3;

 async createHero() {
  // Créer une hitbox pour le héros
  this.heroBox = BABYLON.MeshBuilder.CreateBox("heroBox", { width: 1, height: 2, depth: 1 }, this.scene);
  this.heroBox.position = new BABYLON.Vector3(18, 1.5, 3.5);
  this.heroBox.isVisible = false;
  this.heroBox.checkCollisions = true;

  // Importer le modèle 3D du héros
  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "assets/models/",
    "man.glb",
    this.scene
  );

  
  //On garde les animations
  this.animations = result.animationGroups;
  console.log(this.animations);


  let heroModel = result.meshes[0];
  heroModel.parent = this.heroBox;  // Attacher le modèle à la hitbox
  heroModel.scaling = new BABYLON.Vector3(1,1,1);  // Redimensionner le modèle
  heroModel.position.y = -0.85;  // Ajuster la position du modèle dans la hitbox
  
  // Stocker le modèle pour des références ultérieures
  this.hero = heroModel;

  return this.heroBox;  // Retourner la hitbox comme référence principale du héros
}

checkInteraction(inputMap) {
  var interactableObject = this.scene.getMeshByName("square");
  if (interactableObject && interactableObject.isInteractable) {
    var distance = BABYLON.Vector3.Distance(this.heroBox.position, interactableObject.position);
    if (distance < 5) {
      this.guiManager.setNotif(this.interactionNotification, true);
      if (inputMap["e"]) {
        window.location.href = "/test.html";
      }
    } else {
      this.guiManager.setNotif(this.interactionNotification, false);
    }
  }
}

raycast() {
  // Raycast pour ajuster la hauteur du héros
  var ray = new BABYLON.Ray(this.heroBox.position, new BABYLON.Vector3(0, -1, 0));
  var pickInfo = this.scene.pickWithRay(ray, (item) => item !== this.heroBox);

  if (pickInfo.hit && pickInfo.pickedMesh) {
      var groundPosition = pickInfo.pickedPoint;
      var heroHeightOffset = 1;
      var targetY = groundPosition.y + heroHeightOffset; // Déclarer targetY à l'intérieur du bloc if

      // Interpoler la position actuelle vers la position cible
      var lerpFactor = 0.1; // Ajuster cette valeur pour contrôler la vitesse de transition
      this.heroBox.position.y += (targetY - this.heroBox.position.y) * lerpFactor;
  }
}

move(inputMap) {
  // Logique de rotation
  if (inputMap["q"] || inputMap["Q"]) {
    this.heroBox.rotation.y -= 0.04;
  }
  if (inputMap["d"] || inputMap["D"]) {
    this.heroBox.rotation.y += 0.04;
  }

  // Calculer le vecteur avant
  var forward = new BABYLON.Vector3(Math.sin(this.heroBox.rotation.y), 0, Math.cos(this.heroBox.rotation.y));

  // Vérifier si le personnage est en mouvement
  var isMoving = false;

  // Mouvement vers l'arriere
  if (inputMap["s"] || inputMap["S"]) {
    var forwardDelta = forward.scale(this.speed);
    this.heroBox.moveWithCollisions(forwardDelta);
    if (!this.isAnimating) {
      this.startAnimation("CharacterArmature|Run_Back");
      this.isAnimating = true;
    }
    isMoving = true;
  } 
  // Mouvement vers l'avant
  else if (inputMap["z"] || inputMap["Z"]) {
    var backwardDelta = forward.scale(-this.speed);
    this.heroBox.moveWithCollisions(backwardDelta);
    if (!this.isAnimating) {
      this.startAnimation("CharacterArmature|Run");
      this.isAnimating = true;
    }
    isMoving = true;
  }

  // Si le personnage s'arrête, arrêter l'animation
  if (!isMoving && this.isAnimating) {
    this.startAnimation("CharacterArmature|Idle")
    
    this.isAnimating = false;
  }

  this.raycast();
  this.checkInteraction(inputMap);


}



  startAnimation(animationName) {
    const animation = this.animations.find(anim => anim.name === animationName);
    if (animation) {
      this.animations.forEach(anim => anim.stop()); // Arrêter toutes les autres animations
      animation.start(true);
    }
  }

  stopAnimation(animationNom) {
    // Arrêter l'animation de course
    const runAnim = this.animations.find(anim => anim.name === animationNom );
    if (runAnim) runAnim.stop();
  }

}