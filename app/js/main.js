const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')

const root = path.join(__dirname, '../')
process.env.PRODUCTION = path.extname(root) === '.asar'
let settingsPath = path.join(root,  '../winData.json')

let win
let winData = {
  width: 1000,
  height: 600
}

function start () {
  fs.readFile(settingsPath, 'utf8', (err, data) => {
    if (!err) {
      winData = Object.assign(winData, JSON.parse(data))
    }
    createWindow();
  })
}

function createWindow () {
  win = new BrowserWindow({
    resizable: true,
    webPreferences: {
      devTools: (process.argv || []).indexOf('--dev') !== -1
    }
  })
  win.loadURL(url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.setMenu(null)
  win.setContentSize(winData.width, winData.height)
  if (winData.x && winData.y) {
    win.setPosition(winData.x, winData.y)
  }

  win.on('closed', () => {
    let data = JSON.stringify(winData, null, '  ')
    fs.writeFileSync(settingsPath, data)
    win = null
  })

  win.on('resize', (e) => {
    [winData.width, winData.height] = win.getContentSize()
    win.webContents.send('resize', ...win.getContentSize())
  })

  win.on('move', (e) => {
    [winData.x, winData.y] = win.getPosition()
  })

  win.openDevTools()
}

app.on('ready', start)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    start()
  }
})

ipcMain.on('getContentSize', (e) => {
  e.returnValue = win.getContentSize()
})
