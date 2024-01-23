export class Player {

  //On donne la scene 
 constructor(scene) {
   this.scene = scene;
 }


 //Vitesse du hero
 speed = 0.3;

 async createHero() {
  // Créer une hitbox pour le héros
  this.heroBox = BABYLON.MeshBuilder.CreateBox("heroBox", { width: 0.5, height: 1, depth: 0.5 }, this.scene);
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

  let heroModel = result.meshes[0];
  heroModel.parent = this.heroBox;  // Attacher le modèle à la hitbox
  heroModel.scaling = new BABYLON.Vector3(1.5,1.5,1.5);  // Redimensionner le modèle
  heroModel.position.y = -1;  // Ajuster la position du modèle dans la hitbox
  
  // Stocker le modèle pour des références ultérieures
  this.hero = heroModel;

  return this.heroBox;  // Retourner la hitbox comme référence principale du héros
}


raycast() {
  // Raycast pour ajuster la hauteur du héros
  var ray = new BABYLON.Ray(this.heroBox.position, new BABYLON.Vector3(0, -1, 0));
  var pickInfo = this.scene.pickWithRay(ray, (item) => item !== this.heroBox);

  if (pickInfo.hit && pickInfo.pickedMesh) {
      var groundPosition = pickInfo.pickedPoint;
      var heroHeightOffset = 1;
      this.heroBox.position.y = groundPosition.y + heroHeightOffset;
  }
}

move(inputMap) {
  // Logique de rotation
  if (inputMap["q"] || inputMap["Q"]) {
    this.heroBox.rotation.y -= 0.02;
  }
  if (inputMap["d"] || inputMap["D"]) {
    this.heroBox.rotation.y += 0.02;
  }

  console.log(this.heroBox.position);
  // Calculer le vecteur avant
  var forward = new BABYLON.Vector3(Math.sin(this.heroBox.rotation.y), 0, Math.cos(this.heroBox.rotation.y));

  // Mouvement vers l'avant ou l'arrière
  var forwardDelta = forward.scale((inputMap["s"] || inputMap["S"] ? this.speed : 0) -(inputMap["z"] || inputMap["Z"] ? this.speed : 0));

  // Appliquer le déplacement
  this.heroBox.moveWithCollisions(forwardDelta);
  this.raycast();

// Ajustement de la hauteur avec un raycast
/*var heroBottom = this.heroBox.position.y - (this.heroBox.scaling.y / 2); // Position du bas de la hitbox
var rayOrigin = new BABYLON.Vector3(this.heroBox.position.x, heroBottom + 1, this.heroBox.position.z); // Légèrement au-dessus du bas de la hitbox
var ray = new BABYLON.Ray(rayOrigin, new BABYLON.Vector3(0, -1, 0)); // Rayon descendant

var pickInfo = this.scene.pickWithRay(ray, (item) => item != this.heroBox);
if (pickInfo.hit) {
  var groundPosition = pickInfo.pickedPoint;
  var heroNewY = groundPosition.y + (this.heroBox.scaling.y / 1.2); // Ajuster pour que le bas de la hitbox touche le sol
  this.heroBox.position.y = heroNewY;
}*/

}
}