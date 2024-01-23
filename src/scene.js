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
    "city3.glb",
    scene
  );

  result.meshes.forEach((mesh) => {
      mesh.checkCollisions = true;
  });


  
  var square = BABYLON.MeshBuilder.CreateBox("square", {size: 4}, scene);
  square.position = new BABYLON.Vector3(42, 3, 49);
  square.rotation.x = Math.PI / 2;

  var redMaterial = new BABYLON.StandardMaterial("redMat", scene);
  redMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red
  square.material = redMaterial;
  square.isInteractable = true;
  return scene;
};


let hauteur = 50;
let isMinimapAgrandi = false;

export const setHauteur = function (y) {
  hauteur = y;
}

export const setIsMinimapAgrandi = function (bool) {
  isMinimapAgrandi = bool;
}

export const createCamera = async function (scene, canvas, hero) {
  // Configuration de la caméra
  var camera = new BABYLON.FollowCamera(
    "followCam",
    new BABYLON.Vector3(0, 10, -10),
    scene
  );
  camera.lockedTarget = hero;
  camera.heightOffset = 15;
  camera.radius = 20;
  camera.rotationOffset = 0;
  camera.cameraAcceleration = 0.05;
  camera.maxCameraSpeed = 20;
  camera.checkCollisions = true;
  camera.applyGravity = true;
  scene.activeCamera.attachControl(canvas, true);

  camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0);

  //camera.inputs.clear();
  return camera;
};

export const createMinimap = function (scene,canvas,hero) {
    var camera = new BABYLON.ArcRotateCamera("topDownCam", 0, Math.PI / 2, 10, hero.position, scene);
    camera.attachControl(canvas, true);

    // La caméra reste au-dessus du héros, mais ne change pas de rotation
    scene.onBeforeRenderObservable.add(() => {
      if(isMinimapAgrandi){
        camera.setPosition(new BABYLON.Vector3(0, hauteur, 0));
        camera.setTarget(BABYLON.Vector3.Zero());
      }
      else{
        camera.setPosition(new BABYLON.Vector3(hero.position.x, hauteur, hero.position.z));
        camera.setTarget(hero.position);
      }
    });

    //position de la camera à l'ecran
    camera.viewport = new BABYLON.Viewport(0.02, 0.81, 0.15, 0.15);

    return camera;

}
