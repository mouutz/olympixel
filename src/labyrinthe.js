// labyrinthe.js
import { hideMinimap } from "./main.js";
let postProcess;


export async function playLabyrinthe(scene, camera, heroBox, audioManager,player) {
  heroBox.setAbsolutePosition(new BABYLON.Vector3(104.84, 1, 104.9));

  // stoper  tout les sons
  audioManager.stopAllSounds();
  //jouer le son du labyrinthe
  audioManager.playSound("maze"); 
  audioManager.sounds.maze.setVolume(0.07);

  // Désactiver la minimap

  hideMinimap();

  // Créer un mesh parent pour contenir tous les meshes du labyrinthe
  let mazeParent = new BABYLON.Mesh("mazeParent", scene);
  mazeParent.position = new BABYLON.Vector3(100, 0, 100); // Position du parent

  // Matrice représentant le labyrinthe (0 = espace vide, 1 = mur)
  const mazeMatrix = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  //importer la flamme olympique a recuperer et postionner un android prercis 
  let flame = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/models/", "Torch.glb", scene);
  flame.meshes[0].position = new BABYLON.Vector3(136.80610995966498, 1, 128.77082909029104);
  flame.meshes[0].scaling = new BABYLON.Vector3(3, 3, 3);


  // Créer un sol
  let groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseTexture = new BABYLON.Texture("assets/Texture/floor.png", scene);

  const mazeWidth = mazeMatrix[0].length; // Largeur de la matrice
  const mazeHeight = mazeMatrix.length; // Hauteur de la matrice
  let ground = BABYLON.MeshBuilder.CreateGround("ground", { width: mazeWidth * 2, height: mazeHeight * 2 }, scene);
  ground.position = new BABYLON.Vector3(mazeWidth - 1, 0, mazeHeight - 1); // Ajuster la position du sol
  ground.material = groundMaterial;
  ground.parent = mazeParent;
  ground.checkCollisions = true;

  // Créer un matériau avec une texture pour les murs
  let wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
  wallMaterial.diffuseTexture = new BABYLON.Texture("assets/Texture/wall.png", scene);

  // Utiliser une fonction fléchée pour conserver le contexte de `this`
  const createWall = (x, z, width, depth) => {
    let wall = BABYLON.MeshBuilder.CreateBox("wall", { height: 4, width: width, depth: depth }, scene);
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
  camera.heightOffset = 30;
  camera.radius = 15;

  console.log(player.isCloseToFlame())

  postProcess = new BABYLON.ImageProcessingPostProcess(
    "processing",
    1.0,
    camera
  );
  postProcess.vignetteWeight = 100;
  postProcess.vignetteStretch = 0;
  postProcess.vignetteColor = new BABYLON.Color4(0, 0, 0, 1); // Couleur noire pour la vignette
  postProcess.vignetteEnabled = true;

  // Vérifier périodiquement l'état de closetoFlame
  scene.onBeforeRenderObservable.add(() => {
    if (player.isCloseToFlame()) {
      postProcess.vignetteEnabled = false;
    } else {
      postProcess.vignetteEnabled = true;
    }
  });
}

