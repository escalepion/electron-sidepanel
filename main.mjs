// main.mjs
import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ES Modules'de __dirname alternatifi
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Widget pencerelerini takip etmek için bir referans tutabiliriz (opsiyonel)
let sidebarWindow = null;
let widgetWindows = new Set();

// --- Konfigürasyon ---
const SIDEBAR_WIDTH_COLLAPSED = 10; // Gizliyken (veya kenardayken) genişlik
const SIDEBAR_WIDTH_EXPANDED = 200; // Açıkken genişlik

/**
 * Creates the main sidebar window.
 */
function createSidebarWindow() {
  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;
  const SIDEBAR_WIDTH = 90; // Sidebar width in pixels

  sidebarWindow = new BrowserWindow({
    width: SIDEBAR_WIDTH_COLLAPSED, // Başlangıçta dar
    height: screenHeight,
    x: screenWidth - SIDEBAR_WIDTH_COLLAPSED, // Sağ kenara yapışık (dar)
    y: 0,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  sidebarWindow.webContents.openDevTools({ mode: "detach" });

  sidebarWindow.loadFile("src/sidebar/sidebar.html");

  sidebarWindow.on("closed", () => {
    sidebarWindow = null;
  });
}

/**
 * Creates a new floating widget window.
 * @param {string} widgetName - The name of the widget (e.g., 'notes')
 */
function createWidgetWindow(widgetName) {
  // Best Practice: Güvenlik için sadece izin verilen widget'ları aç
  const allowedWidgets = ["notes"];
  if (!allowedWidgets.includes(widgetName)) {
    console.error(`Attempted to open an invalid widget: ${widgetName}`);
    return;
  }

  const widgetWindow = new BrowserWindow({
    width: 300,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    // Parent ayarlamak, ana pencere kapanınca widget'ın da kapanmasını sağlar (opsiyonel)
    // parent: sidebarWindow,
    webPreferences: {
      // Bu pencerelerin Node.js'e ihtiyacı yok
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  widgetWindow.loadFile(
    path.join(__dirname, `src/widgets/${widgetName}/${widgetName}.html`)
  );
  widgetWindows.add(widgetWindow);
  widgetWindow.on("closed", () => {
    widgetWindows.delete(widgetWindow);
  });

  // Widget'ı takip listesine ekle
  widgetWindows.add(widgetWindow);

  // Pencere kapandığında listeden çıkar
  widgetWindow.on("closed", () => {
    widgetWindows.delete(widgetWindow);
  });
}

// --- App Lifecycle ---

app.whenReady().then(createSidebarWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createSidebarWindow();
  }
});

// --- IPC Communication ---

// Best Practice: Render sürecinden (sidebar.js) gelen 'open-widget' isteğini dinle
ipcMain.on("open-widget", (event, widgetName) => {
  console.log(`Received request to open widget: ${widgetName}`);
  createWidgetWindow(widgetName);
});

ipcMain.on("sidebar-mouse-enter", () => {
  console.log("Mouse entered sidebar");
  if (!sidebarWindow) return;

  const { height: screenHeight, width: screenWidth } =
    screen.getPrimaryDisplay().workAreaSize;

  // setBounds kullanarak hem boyutu hem de pozisyonu GÜNCELLE
  // Animasyonlu olması için animate: true (Windows ve macOS'te çalışır)
  sidebarWindow.setBounds(
    {
      width: SIDEBAR_WIDTH_EXPANDED,
      height: screenHeight,
      x: screenWidth - SIDEBAR_WIDTH_EXPANDED, // X pozisyonunu sola çek
      y: 0,
    },
    true
  ); // animate: true
});

ipcMain.on("sidebar-mouse-leave", () => {
  if (!sidebarWindow) return;

  const { height: screenHeight, width: screenWidth } =
    screen.getPrimaryDisplay().workAreaSize;

  // Tekrar daralt
  sidebarWindow.setBounds(
    {
      width: SIDEBAR_WIDTH_COLLAPSED,
      height: screenHeight,
      x: screenWidth - SIDEBAR_WIDTH_COLLAPSED, // X pozisyonunu sağa it
      y: 0,
    },
    true
  ); // animate: true
});
