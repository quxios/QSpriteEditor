const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

const root = path.join(__dirname, '../');
process.env.PRODUCTION = path.extname(root) === '.asar';
let settingsPath = path.join(root,  '../winData.json');

let win;
let help;
let winData = {
  width: 900,
  height: 500
}

function start () {
  fs.readFile(settingsPath, 'utf8', (err, data) => {
    if (!err) {
      winData = Object.assign(winData, JSON.parse(data));
      winData.width = Math.max(winData.width, 900);
      winData.height = Math.max(winData.height, 500);
    }
    createWindow();
  })
}

function createWindow () {
  win = new BrowserWindow({
    resizable: true,
    width: winData.width,
    height: winData.height,
    minWidth: 900,
    minHeight: 500,
    webPreferences: {
      devTools: (process.argv || []).indexOf('--dev') !== -1
    }
  })
  win.setMenu(null);
  win.loadURL(url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true
  }))
  if (!isNaN(winData.x) && !isNaN(winData.y)) {
    win.setPosition(winData.x, winData.y);
  }
  win.on('closed', () => {
    const data = JSON.stringify(winData, null, 2);
    fs.writeFileSync(settingsPath, data);
    win = null;
    if (help) help.close();
  })
  win.on('resize', (e) => {
    [winData.width, winData.height] = win.getSize();
    win.webContents.send('resize', ...win.getContentSize());
  })
  win.on('move', (e) => {
    [winData.x, winData.y] = win.getPosition();
  })
  win.webContents.openDevTools({
    detach: true
  })
  win.webContents.once('devtools-opened', () => {
    win.focus();
  })
}

function createHelp() {
  help = new BrowserWindow({
    show: false,
    width: 350,
    height: 500,
    resizable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    useContentSize: true
  })
  help.setMenu(null);
  help.loadURL(url.format({
    pathname: path.join(__dirname, '../help.html'),
    protocol: 'file:',
    slashes: true
  }))
  const x = Math.floor(win.getPosition()[0] + Math.abs(win.getSize()[0] - 350) / 2);
  const y = Math.floor(win.getPosition()[1] + Math.abs(win.getSize()[1] - 500) / 2);
  help.setPosition(x, y);
  help.once('ready-to-show', () => {
    help.show();
  })
  help.on('closed', () => {
    help = null;
  })
}

app.on('ready', start);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  if (win === null) {
    start();
  }
})

ipcMain.on('getContentSize', (e) => {
  e.returnValue = win.getContentSize();
})

ipcMain.on('getDefaultPath', (e) => {
  e.returnValue = winData.defaultPath || '';
})

ipcMain.on('setDefaultPath', (e, path) => {
  winData.defaultPath = path;
})

ipcMain.on('openHelp', () => {
  createHelp();
})
