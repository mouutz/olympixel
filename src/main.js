import { createScene, createCamera, createMinimap, setHauteur, setIsMinimapAgrandi } from "./scene.js";
import { createIndicateur } from './indicateur.js';
import { Player } from "./player.js";
import { GUIManager } from './guiManager.js';
import { GameAudioManager } from './audio.js';

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
let divFps = document.getElementById("fps");


/* ---------------------------
---------Creation scene-------
-----------------------------*/

var scene = await createScene(engine);
let mode = "nuit"

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
----Gestion audio----
-----------------------------*/

const audioManager = new GameAudioManager(scene);
audioManager.loadSounds();

/* ---------------------------
---------Creation joueur-------
-----------------------------*/

const heroPlayer = new Player(scene,camera, audioManager);

const hero = await heroPlayer.createHero();
/* ---------------------------
---------Creation Camera-------
-----------------------------*/

var camera = await createCamera(scene, canvas, hero);
camera.layerMask = 0x0FFFFFFF;

var minimap = await createMinimap(scene,canvas, hero);
minimap.layerMask = 0x10000000 | 0x0FFFFFFF;

scene.activeCameras.push(camera);
scene.activeCameras.push(minimap);

const viewportNormal = new BABYLON.Viewport(0.02, 0.81, 0.15, 0.15);
const viewportAgrandi = new BABYLON.Viewport(0, 0, 1, 1); 

let minimapAgrandie = false;


/* ---------------------------
----Creation indicateur objectif----
-----------------------------*/
var fleche = createIndicateur(scene, hero);

// Positionner l'objectif	
fleche.setTarget(new BABYLON.Vector3(42, 5, 49));

/* ---------------------------f
----Creation GUI----
-----------------------------*/
const guiManager = new GUIManager(scene);


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
  scene.render()
  handleMinimap();
  heroPlayer.move(inputMap);
  divFps.innerHTML = engine.getFps().toFixed() + " fps";

  //changeLight()

});



/* ---------------------------
---------Cycle jour nuit-------
-----------------------------*/

const changeLight = function (op) {
  var light = scene.lights[0]
  if(mode == "nuit"){
    if(scene.lights[0].intensity == 1  ||scene.lights[0].intensity>1) {mode="jour"}
      light.intensity +=0.0001
  }
  else{
    if(scene.lights[0].intensity==0.02 ||scene.lights[0].intensity<0.02 ){mode="nuit"}
    light.intensity -=0.0001
}
}

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
--------Marqueur du Joueur-------
-----------------------------*/

const createPlayerMarker = function () {
// Création de l'anneau
var anneau = BABYLON.MeshBuilder.CreateTorus("anneau", {
  diameter: 8,   
  thickness: 3, 
  tessellation: 32
}, scene);

// Matériau rouge pour l'anneau
var materialRouge = new BABYLON.StandardMaterial("matRouge", scene);
materialRouge.diffuseColor = new BABYLON.Color3(1, 0, 0);
materialRouge.specularColor = new BABYLON.Color3(0, 0, 0);
anneau.material = materialRouge;
//no relfection on the material 
anneau.material.reflectionTexture = null;

    // Mettre à jour la position de l'anneau pour qu'il suive le héros
    scene.onBeforeRenderObservable.add(() => {
      anneau.position.x = hero.getAbsolutePosition().x;
      anneau.position.z = hero.getAbsolutePosition().z;
      // La hauteur (y) peut rester constante ou être ajustée si nécessaire
  });

// Positionner l'anneau
anneau.position = new BABYLON.Vector3(hero.position.x, hero.position.y + 0.1, hero.position.z);
anneau.layerMask = 0x10000000;
}

const removePlayerMarker = function () {
  var anneau = scene.getMeshByName("anneau");
  if (anneau) {
      anneau.dispose();  // Supprime le mesh de la scène
  }
}


const handleMinimap = function () {


  if (inputMap["m"] || inputMap["M"]) {
    if (!minimapAgrandie) {
        minimap.viewport = viewportAgrandi;
        minimapAgrandie = true;
        setHauteur(300)
        setIsMinimapAgrandi(true);
        createPlayerMarker();
    } else {
        minimap.viewport = viewportNormal;
        minimapAgrandie = false;
        setHauteur(50)
        setIsMinimapAgrandi(false);
        removePlayerMarker();
    }

    inputMap["m"] = false;
    inputMap["M"] = false;
}

}
