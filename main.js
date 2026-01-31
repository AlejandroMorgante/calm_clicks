const { app, BrowserWindow, screen, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let win;
const overlayState = {
  alwaysOnTop: true,
  clickThrough: false,
};

function applyOverlayState() {
  if (!win) return;
  win.setAlwaysOnTop(overlayState.alwaysOnTop, 'screen-saver');
  win.setIgnoreMouseEvents(overlayState.clickThrough, { forward: true });
}

function broadcastOverlayState() {
  if (!win) return;
  win.webContents.send('overlay-state', { ...overlayState });
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    title: 'Pelotitas Overlay',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  applyOverlayState();
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    overlayState.alwaysOnTop = !overlayState.alwaysOnTop;
    applyOverlayState();
    broadcastOverlayState();
  });
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    overlayState.clickThrough = !overlayState.clickThrough;
    applyOverlayState();
    broadcastOverlayState();
  });
  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    app.quit();
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle('overlay:get-state', () => ({ ...overlayState }));
ipcMain.handle('overlay:set-always-on-top', (_event, value) => {
  overlayState.alwaysOnTop = Boolean(value);
  applyOverlayState();
  broadcastOverlayState();
  return { ...overlayState };
});
ipcMain.handle('overlay:set-click-through', (_event, value) => {
  overlayState.clickThrough = Boolean(value);
  applyOverlayState();
  broadcastOverlayState();
  return { ...overlayState };
});
ipcMain.handle('overlay:quit', () => {
  app.quit();
});
