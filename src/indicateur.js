function createIndicateur(scene, hero) {
    var arrow = new BABYLON.TransformNode("arrow", scene);

    // Créer la pointe de la flèche
    var cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {
        diameterTop: 0,
        height: 0.75,
        diameterBottom: 0.675,
        tessellation: 8
    }, scene);
    cylinder.rotation.x = Math.PI / 2;
    cylinder.position.z += 1;

    // Créer la tige de la flèche
    var line = BABYLON.MeshBuilder.CreateCylinder("line", {
        diameterTop: 0.3,
        height: 1.2,
        diameterBottom: 0.06,
        tessellation: 8
    }, scene);
    line.rotation.x = Math.PI / 2;
    line.position.z += 0.275 / 2;

    // Matériau pour la flèche
    var materialFlèche = new BABYLON.StandardMaterial("matFlèche", scene);
    cylinder.material = materialFlèche;
    line.material = materialFlèche;

    // Attacher les éléments à l'arrow
    cylinder.parent = arrow;
    line.parent = arrow;

    // Position initiale de la flèche
    arrow.position = new BABYLON.Vector3(hero.position.x, hero.position.y + 2, hero.position.z);

    // Objectif initial
    var objectif = new BABYLON.Vector3(0, 0, 0);

    // Fonction pour orienter la flèche vers l'objectif
    scene.onBeforeRenderObservable.add(() => {
        arrow.position = new BABYLON.Vector3(hero.position.x, hero.position.y + 2, hero.position.z);
        updateArrowColor(cylinder,line, objectif, arrow.position);
        arrow.lookAt(objectif);
    });

    // Fonction pour changer la cible
    arrow.setTarget = function (newTarget) {
        objectif = newTarget;
    };

    return arrow;
}


function updateArrowColor(cylinder, line, targetPosition, arrowPosition) {
    var distance = BABYLON.Vector3.Distance(arrowPosition, targetPosition);
    var color;
    if (distance > 80) {
        color = new BABYLON.Color3(1, 0, 0); // Rouge
    } else if (distance > 30) {
        color = new BABYLON.Color3(1, 0.647, 0); // Orange
    } else {
        color = new BABYLON.Color3(0, 1, 0); // Vert
    }
    cylinder.material.diffuseColor = color;
    line.material.diffuseColor = color;}


export { createIndicateur };
