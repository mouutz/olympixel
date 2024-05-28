export class GUIManager {
  constructor(scene) {
      this.scene = scene;
      this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
      this._isReading = false;
  }

  get isReading() {
    return this._isReading;
}


set isReading(value) {
    this._isReading = value;
}

  createNotif() {
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
      rect.addControl(text1);

      rect.isVisible = false;
      return rect;
  }

  setNotif(notification, isVisible) {
      notification.isVisible = isVisible;
  }

  showLetter(text) {
    if (this._isReading) return;
    this._isReading = true;
      const letterPanel = new BABYLON.GUI.Rectangle();
      letterPanel.width = 0.5;
      letterPanel.height = 0.75;
      letterPanel.cornerRadius = 20;
      letterPanel.color = "black";
      letterPanel.thickness = 2;
      letterPanel.background = "white";
      this.advancedTexture.addControl(letterPanel);

      const textBlock = new BABYLON.GUI.TextBlock();
      textBlock.text = text;
      textBlock.color = "black";
      textBlock.fontSize = 24;
      letterPanel.addControl(textBlock);

      const closeButton = BABYLON.GUI.Button.CreateSimpleButton("closeButton", "Fermer");
      closeButton.width = 0.2;
      closeButton.height = "40px";
      closeButton.color = "white";
      closeButton.cornerRadius = 20;
      closeButton.background = "black";
      closeButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      closeButton.top = "-20px";
      letterPanel.addControl(closeButton);

      this.scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
          letterPanel.isVisible = false;
          //dispose of the letter panel
          letterPanel.dispose();
          this._isReading = false;
          

        }
      });

      return letterPanel;
  }

  showCommandsLetter() {
    if (this.commandsPanel) {
      this.commandsPanel.dispose();
      this.commandsPanel = null;
      this._isReading = false;
      return;
    }

    const commandsText = `
      Commandes du jeu :
      - Z (W) : Avancer
      - S : Reculer
      - Q (A) : Tourner à gauche
      - D : Tourner à droite
      - E : Interagir
      - E : Entrer & Sortir de la voiture
      - Espace : Sauter
      - M : Agrandir/Réduire la minimap
      - I : Afficher cette aide
      - B+N : teleportation si vous etes bloqué
    `;
    this._isReading = true;
    this.commandsPanel = new BABYLON.GUI.Rectangle();
    this.commandsPanel.width = 0.5;
    this.commandsPanel.height = 0.75;
    this.commandsPanel.cornerRadius = 20;
    this.commandsPanel.color = "black";
    this.commandsPanel.thickness = 2;
    this.commandsPanel.background = "white";
    this.advancedTexture.addControl(this.commandsPanel);

    const textBlock = new BABYLON.GUI.TextBlock();
    textBlock.text = commandsText;
    textBlock.color = "black";
    textBlock.fontSize = 24;
    this.commandsPanel.addControl(textBlock);

   

   

  }
}
