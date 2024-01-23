export class Player {

  //On donne la scene 
 constructor(scene) {
   this.scene = scene;
 }


 //Vitesse du hero
 speed = 0.3;

 async createHero() {
  const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "", 
      "assets/models/", 
      "man.glb", 
      this.scene
  );

  this.hero = result.meshes[0];

  // Configuration initiale du héros
  
  this.hero.position = new BABYLON.Vector3(28, 0.7, 3.5);
  this.hero.checkCollisions = true;
  this.hero.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
  this.hero.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

}
}