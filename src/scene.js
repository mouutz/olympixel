//Fonction pour creer la scene
export const createScene = async function (engine) {
  var scene = new BABYLON.Scene(engine);
  scene.collisionsEnabled = true;
  // Configuration de la lumière
  var light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 1;

  let quality = localStorage.getItem("quality");
  let map = "heigh_map.glb"; //HIGH PAR DEFAUT
  if (quality === "high") {
    map = "heigh_map.glb";
  }
  else if (quality === "low") {
    map = "city_low2.glb";
  }

  console.log(quality);
  // Chargement de la scène (ville) et activation des collisions
  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "assets/models/",
    map,
    scene,
    function (event) {
      if (event.lengthComputable) {
          let percentComplete = (event.loaded / event.total) * 100;
          updateLoadingBar(percentComplete);
      }
  } );

  result.meshes.forEach((mesh) => {
    mesh.checkCollisions = true;
  });


  //debug layer pour voir les collisions
  //scene.debugLayer.show();

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
  camera.heightOffset = 5;
  camera.radius = 12;
  camera.rotationOffset = 0;
  camera.cameraAcceleration = 0.05;
  camera.maxCameraSpeed = 20;
  camera.checkCollisions = true;
  camera.applyGravity = true;
  scene.activeCamera.attachControl(canvas, true);

  camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0);

  //lock camera
  //camera.inputs.clear();
  return camera;
};

export const createMinimap = function (scene, canvas, hero) {
  var camera = new BABYLON.ArcRotateCamera("topDownCam", 0, Math.PI / 2, 10, hero.position, scene);
  camera.attachControl(canvas, true);

  // La caméra reste au-dessus du héros, mais ne change pas de rotation
  scene.onBeforeRenderObservable.add(() => {
    if (isMinimapAgrandi) {
      camera.setPosition(new BABYLON.Vector3(0, hauteur, 0));
      camera.setTarget(BABYLON.Vector3.Zero());
    }
    else {
      camera.setPosition(new BABYLON.Vector3(hero.getAbsolutePosition().x, hauteur, hero.getAbsolutePosition().z));
      camera.setTarget(hero.getAbsolutePosition());
    }
  });

  //position de la camera à l'ecran
  camera.viewport = new BABYLON.Viewport(0.02, 0.81, 0.15, 0.15);

  return camera;

}

function updateLoadingBar(percent) {
  const loadingBar = document.getElementById("loadingBarFill");
  if (loadingBar) {
      // Mise à jour directe de la largeur de la barre de chargement
      loadingBar.style.width = `${percent}%`; // Définit la largeur en fonction du pourcentage de chargement
  }
}

