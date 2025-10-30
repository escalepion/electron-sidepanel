// src/sidebar/sidebar.js
console.log("Sidebar script loaded.");
// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Sidebar script loaded.222");
  document.body.addEventListener("mouseenter", () => {
    if (window.electronAPI && window.electronAPI.notifyMouseEnter) {
      window.electronAPI.notifyMouseEnter();
    }
  });

  document.body.addEventListener("mouseleave", () => {
    if (window.electronAPI && window.electronAPI.notifyMouseLeave) {
      window.electronAPI.notifyMouseLeave();
    }
  });

  const notesButton = document.getElementById("open-notes");
  const calcButton = document.getElementById("open-calc"); // Not: 'calculator' widget'ını henüz eklemedik

  if (notesButton) {
    notesButton.addEventListener("click", () => {
      // Use the exposed API from preload.mjs
      if (window.electronAPI && window.electronAPI.openWidget) {
        window.electronAPI.openWidget("notes");
      } else {
        console.error("electronAPI is not available!");
      }
    });
  }

  if (calcButton) {
    calcButton.addEventListener("click", () => {
      // 'calculator' için bir sinyal gönderebiliriz,
      // ancak main.mjs'deki 'allowedWidgets' listesine eklemeliyiz.
      window.electronAPI.openWidget("calculator");
      console.warn(
        "Calculator widget is not yet implemented in main.mjs allowlist."
      );
    });
  }
});
