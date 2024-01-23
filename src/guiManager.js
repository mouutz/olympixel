export class GUIManager {
    constructor(scene) {
      this.scene = scene;
      this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
    }
  
    createNotif() {
      var text1 = new BABYLON.GUI.TextBlock();
      text1.text = "Appuyez sur 'E' pour interagir";
      text1.color = "white";
      text1.fontSize = 24;
      text1.isVisible = false; // Cache le texte par défaut
      this.advancedTexture.addControl(text1);
      return text1;
    }
  
    setNotif(notification, isVisible) {
      notification.isVisible = isVisible;
    }
  }
  