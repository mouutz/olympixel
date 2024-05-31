import { createScene, createCamera, createMinimap, setHauteur, setIsMinimapAgrandi } from "./scene.js";
import { createIndicateur } from './indicateur.js';
import { Player } from "./player.js";
import { GUIManager } from './guiManager.js';
import { GameAudioManager } from './audio.js';

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
let divFps = document.getElementById("fps");
let menu = document.getElementById("menu");
let isMenuDisplayed = true;

if (engine.audioEngine) {
  engine.audioEngine.useCustomUnlockedButton = true;
}
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
---------Creation Skybox-------
-----------------------------*/
const setupSkybox = (scene) => {
  
  var skyboxMaterial = new BABYLON.SkyMaterial("skyMaterial", scene);
  skyboxMaterial.backFaceCulling = false;

  // Créer la mesh Skybox
  var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
  skybox.material = skyboxMaterial;

  return skyboxMaterial;
};

const skyboxMaterial = setupSkybox(scene);
const adjustSkyboxSetting = (property, value) => {
  const animation = new BABYLON.Animation("skyAnimation", property, 30, 
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  
  const keys = [
    { frame: 0, value: skyboxMaterial[property] },
    { frame: 30, value: value }
  ];
  
  animation.setKeys(keys);
  
  scene.beginDirectAnimation(skyboxMaterial, [animation], 0, 30, false);
};
adjustSkyboxSetting("inclination", 0); // jour
//adjustSkyboxSetting("inclination", -0.5); //nuit

/* ---------------------------
----Gestion audio----
-----------------------------*/

export const audioManager = new GameAudioManager(scene);
audioManager.loadSounds();



/* ---------------------------
---------Ajout du logo "i"-------
-----------------------------*/
const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

const container = new BABYLON.GUI.StackPanel();
container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
container.width = "200px";
container.isVertical = false;
container.paddingTop = "0px";
container.paddingLeft = "10px";
const textBlock = new BABYLON.GUI.TextBlock();
textBlock.text = "Contrôles";
textBlock.color = "white";
textBlock.fontSize = "20px";
textBlock.paddingright = "10px";
container.addControl(textBlock);

const iKeyIndicator = new BABYLON.GUI.Image("iKey", "assets/images/key_i.png");
iKeyIndicator.width = "50px";
iKeyIndicator.height = "50px";
container.addControl(iKeyIndicator);



advancedTexture.addControl(container);







/* ---------------------------
---------Creation joueur-------
-----------------------------*/

const heroPlayer = new Player(scene,camera);

const hero = await heroPlayer.createHero();
scene.audioListenerPositionProvider =  () => hero.getAbsolutePosition();
/* ---------------------------
---------Creation Camera-------
-----------------------------*/

var camera = await createCamera(scene, canvas, hero);
camera.layerMask = 0x0FFFFFFF;
heroPlayer.setCamera(camera);

var minimap = await createMinimap(scene,canvas, hero);
minimap.layerMask = 0x10000000 | 0x0FFFFFFF;




scene.activeCameras.push(camera);
scene.activeCameras.push(minimap);

const viewportNormal = new BABYLON.Viewport(0.02, 0.81, 0.15, 0.15);
const viewportAgrandi = new BABYLON.Viewport(0, 0, 1, 1); 

let minimapAgrandie = false;

export function hideMinimap() {
  const minimapCanvas = document.getElementById("minimapCanvas");
  if (minimapCanvas) {
    minimapCanvas.style.display = 'none';
  }
  if (scene.activeCameras.includes(minimap)) {
    const index = scene.activeCameras.indexOf(minimap);
    scene.activeCameras.splice(index, 1);
  }
}



hideLoadingScreen();
/* ---------------------------
----Creation indicateur objectif----
-----------------------------*/
var fleche = createIndicateur(scene, hero);
heroPlayer.indicateur = fleche;

fleche.setEnabled(false);


// Positionner l'objectif	
//fleche.setTarget(new BABYLON.Vector3(42, 5, 49));

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
  if(isMenuDisplayed){
    return;
  }
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


  if (inputMap["m"] || inputMap["M"] || inputMap[","] || inputMap[";"]) {
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
    inputMap[","] = false;
    inputMap[";"] = false;
}

}


function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    console.log("Hiding loading screen");
    loadingScreen.style.display = 'none'
  }
  menu.style.display = "block";
}






if (document.readyState !== 'loading') {
  initMainMenu();
} else {
  document.addEventListener('DOMContentLoaded', function () {
      initMainMenu();
  });
}

function initMainMenu() {  const menu = document.getElementById("menu");
  const mainMenu = document.querySelector(".button-container");
  const graphicOptions = document.querySelector(".graphic-options");
  const playButton = document.getElementById("playButton");
  const backButton = document.getElementById("backButton");


  const highQualityButton = document.getElementById("highQualityButton");
  const lowQualityButton = document.getElementById("lowQualityButton");


  const quality = localStorage.getItem("quality");


  const defaultQuality = quality && (quality === "low" || quality === "high") ? quality : "high";


  lowQualityButton.classList.remove("selected");
  highQualityButton.classList.remove("selected");


  if (defaultQuality === "low") {
      lowQualityButton.classList.add("selected");
  } else {
      highQualityButton.classList.add("selected");
  }


  playButton.addEventListener("click", function() {
      menu.style.display = "none";
      graphicOptions.style.display = "none";
      canvas.classList.remove("menu-active");
      canvas.focus();
      isMenuDisplayed = false;
  });

  backButton.addEventListener("click", function() {
      mainMenu.style.display = "flex";
      graphicOptions.style.display = "none";
  });

  // Gestion de la sélection des options graphiques
  const graphicOptionsButton = document.getElementById("graphicOptionsButton");
  const backButtonOptions = document.getElementById("backButtonOptions");

  graphicOptionsButton.addEventListener("click", () => {
      graphicOptions.style.display = "block";
      mainMenu.style.display = "none";
  });

  lowQualityButton.addEventListener("click", () => {
      highQualityButton.classList.remove("selected");
      lowQualityButton.classList.add("selected");
      localStorage.setItem("quality", "low");
      window.location.reload();
  });

  highQualityButton.addEventListener("click", () => {
      lowQualityButton.classList.remove("selected");
      highQualityButton.classList.add("selected");
      localStorage.setItem("quality", "high");
      window.location.reload();
  });

  backButtonOptions.addEventListener("click", () => {
      graphicOptions.style.display = "none";
      mainMenu.style.display = "flex";
  });
}

export {engine}

