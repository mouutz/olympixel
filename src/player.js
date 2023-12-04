export class Player {

   //On donne la scene 
  constructor(scene) {
    this.scene = scene;
  }

  //Creation hero
  hero = this.createHero();
  //Vitesse du hero
  speed = 0.75;

  createHero() {
    // Création du personnage (héros)
    var hero = BABYLON.MeshBuilder.CreateSphere(
      "hero",
      { diameter: 2 },
      this.scene
    );
    hero.position = new BABYLON.Vector3(28, 1.5, 3.5);
    hero.checkCollisions = true;
    hero.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
    hero.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

    return hero;
  }

  update() {}
}
