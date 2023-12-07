//Fonction pour creer la scene
export const createScene = async function (engine) {
  var scene = new BABYLON.Scene(engine);
  scene.collisionsEnabled = true;
  scene.gravity = new BABYLON.Vector3(0, -0.9, 0); // Gravité de la scène

  // Configuration de la lumière
  var light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 1;

  // Chargement de la scène (ville) et activation des collisions
  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "assets/models/",
    "city2.glb",
    scene
  );
  result.meshes.forEach((mesh) => {
    mesh.checkCollisions = true;
  });


  

  return scene;
};

//Fonction pour creer la camera
export const createCamera = async function (scene, canvas, hero) {
  // Configuration de la caméra
  var camera = new BABYLON.FollowCamera(
    "followCam",
    new BABYLON.Vector3(0, 10, -10),
    scene
  );
  camera.lockedTarget = hero;
  camera.heightOffset = 25;
  camera.radius = 50;
  camera.rotationOffset = 0;
  camera.cameraAcceleration = 0.05;
  camera.maxCameraSpeed = 20;
  camera.checkCollisions = true;
  camera.applyGravity = true;
  scene.activeCamera.attachControl(canvas, true);

  camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0);


  return camera;
};


export const createMinimap = function (scene, canvas, hero, minX, maxX, minZ, maxZ) {
  var camera = new BABYLON.ArcRotateCamera("topDownCam", 0, Math.PI / 2, 10, hero.position, scene);
  camera.attachControl(canvas, true);

  // Mettre à jour la position de la caméra en fonction des limites de la carte
  scene.onBeforeRenderObservable.add(() => {
      var x = Math.max(minX, Math.min(hero.position.x, maxX));
      var z = Math.max(minZ, Math.min(hero.position.z, maxZ));

      camera.setPosition(new BABYLON.Vector3(x, 80, z));
  });

  camera.viewport = new BABYLON.Viewport(0.02, 0.81, 0.18, 0.18);
  console.log(camera.position);
  return camera;
}
