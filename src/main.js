<<<<<<< HEAD
import { createScene, createCamera, createMinimap, setHauteur } from "./scene.js";
=======
import { createScene, createCamera, createMinimap } from "./scene.js";
>>>>>>> f1482c7ac3c1abca128313aee207e2ca012a36aa
import { Player } from "./player.js";

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

/* ---------------------------
---------Creation scene-------
-----------------------------*/

var scene = await createScene(engine);

/* -----------------------------------------------
---------murs invisibles autour de la carte-------
-------------------------------------------------*/

let minX = Number.POSITIVE_INFINITY;
let maxX = Number.NEGATIVE_INFINITY;
let minZ = Number.POSITIVE_INFINITY;
let maxZ = Number.NEGATIVE_INFINITY;

scene.meshes.forEach(mesh => {
    let boundingBox = mesh.getBoundingInfo().boundingBox;
    minX = Math.min(minX, boundingBox.minimumWorld.x);
    maxX = Math.max(maxX, boundingBox.maximumWorld.x);
    minZ = Math.min(minZ, boundingBox.minimumWorld.z);
    maxZ = Math.max(maxZ, boundingBox.maximumWorld.z);
});

let width = maxX - minX;
let depth = maxZ - minZ;

function createWall(position, size) {
  var wall = BABYLON.MeshBuilder.CreateBox("wall", size, scene);
  wall.position = position;
  wall.isVisible = false;
  wall.checkCollisions = true;
  return wall;
}

createWall(new BABYLON.Vector3(minX+33, 0, -16), {width: 1, height: 50, depth: depth});
createWall(new BABYLON.Vector3(maxX, 0, -16), {width: 1, height: 50, depth: depth});
createWall(new BABYLON.Vector3(0, 0, minZ), {width: width, height: 50, depth: 1});
createWall(new BABYLON.Vector3(0, 0, maxZ), {width: width, height: 50, depth: 2.5});



/* ---------------------------
---------Creation joueur-------
-----------------------------*/

const heroPlayer = new Player(scene);
const hero = heroPlayer.hero;

/* ---------------------------
---------Creation Camera-------
-----------------------------*/

var camera = await createCamera(scene, canvas, hero);

var minimap = await createMinimap(scene,canvas, hero);

scene.activeCameras.push(camera);
scene.activeCameras.push(minimap);

const viewportNormal = new BABYLON.Viewport(0.02, 0.81, 0.15, 0.15);
const viewportAgrandi = new BABYLON.Viewport(0.1, 0.1, 0.8, 0.8); 

let minimapAgrandie = false;


/* ---------------------------
----Gestion entrée clavier----
-----------------------------*/

var inputMap = {};
scene.actionManager = new BABYLON.ActionManager(scene);
scene.actionManager.registerAction(
  new BABYLON.ExecuteCodeAction(
    BABYLON.ActionManager.OnKeyDownTrigger,
    function (evt) {
      inputMap[evt.sourceEvent.key] = true;
    }
  )
);
scene.actionManager.registerAction(
  new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (
    evt
  ) {
    inputMap[evt.sourceEvent.key] = false;
  })
);



/* ---------------------------
---------Loop principale-------
-----------------------------*/

engine.runRenderLoop(function () {
 
  handleMinimap();
  playerMoove();

});

/* ---------------------------
--------Deplacer Joueur-------
-----------------------------*/

const playerMoove = function () {
  // Vitesse du personnage
  var heroSpeed = heroPlayer.speed;

  // Calcul du déplacement relatif à la caméra
  var forward = camera.getForwardRay().direction;

  var right = BABYLON.Vector3.Cross(forward, new BABYLON.Vector3(0, 1, 0));

  var forwardDelta = forward.scaleInPlace(
    (inputMap["z"] || inputMap["Z"] ? heroSpeed : 0) -
      (inputMap["s"] || inputMap["S"] ? heroSpeed : 0)
  );
  var rightDelta = right.scaleInPlace(
    (inputMap["q"] || inputMap["Q"] ? heroSpeed : 0) -
      (inputMap["d"] || inputMap["D"] ? heroSpeed : 0)
  );

  var deltaMove = forwardDelta.addInPlace(rightDelta);

  // Appliquer le déplacement relatif
  hero.moveWithCollisions(deltaMove);

  // Ajustement de la hauteur avec un raycast (comme avant)
  var ray = new BABYLON.Ray(hero.position, new BABYLON.Vector3(0, -1, 0));
  var pickInfo = scene.pickWithRay(ray, function (item) {
    return item != hero;
  });
  if (pickInfo.pickedMesh) {
    var groundPosition = pickInfo.pickedPoint;
    hero.position.y = groundPosition.y + 1.5;
  }
};

createScene().then(function (createdScene) {
  // Débogueur
  /*createdScene.debugLayer.show({
    overlay: true,
    globalRoot: document.getElementById("debugLayer"),
  });*/
});

window.addEventListener("resize", function () {
  engine.resize();
});


/* ---------------------------
--------Agrandir Minimap-------
-----------------------------*/

const handleMinimap = function () {
  if (scene.activeCamera) {
    scene.render();
  }

  if (inputMap["m"] || inputMap["M"]) {
    if (!minimapAgrandie) {
        minimap.viewport = viewportAgrandi;
        minimapAgrandie = true;
        setHauteur(300)
    } else {
        minimap.viewport = viewportNormal;
        minimapAgrandie = false;
        setHauteur(60)
    }

    inputMap["m"] = false;
    inputMap["M"] = false;
}
}
