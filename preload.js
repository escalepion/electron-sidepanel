// preload.mjs
const { contextBridge, ipcRenderer } = require("electron");

// Best Practice: Sadece ihtiyaç duyulan fonksiyonları güvenli bir şekilde
// render sürecindeki 'window' objesine ('electronAPI' adıyla) expose et.
contextBridge.exposeInMainWorld("electronAPI", {
  /**
   * Sends a request to the main process to open a widget window.
   * @param {string} widgetName - The name of the widget to open.
   */
  openWidget: (widgetName) => {
    ipcRenderer.send("open-widget", widgetName);
  },
  notifyMouseEnter: () => {
    ipcRenderer.send("sidebar-mouse-enter");
  },

  // YENİ: Ana sürece farenin çıktığını bildir
  notifyMouseLeave: () => {
    ipcRenderer.send("sidebar-mouse-leave");
  },
});
