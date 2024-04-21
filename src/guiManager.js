export class GUIManager {
  constructor(scene) {
    this.scene = scene;
    this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
  }

  createNotif() {
    // Créer un rectangle comme arrière-plan pour le texte
    var rect = new BABYLON.GUI.Rectangle();
    rect.width = 0.3;
    rect.height = "60px";
    rect.cornerRadius = 5;
    rect.color = "white";
    rect.thickness = 1;
    rect.background = "black";
    rect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; 
    rect.top = "-40px";
    this.advancedTexture.addControl(rect);

    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Appuyez sur 'E' pour interagir";
    text1.color = "white";
    text1.fontSize = 24;
    text1.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER; // Centrer le texte verticalement
    rect.addControl(text1); // Ajoute le texte au rectangle

    rect.isVisible = false; // Cache le rectangle (et le texte) par défaut

    return rect; // Retourne le rectangle au lieu du texte
}

  setNotif(notification, isVisible) {
    
    notification.isVisible = isVisible;
}
}