const { app, BrowserWindow, ipcMain, desktopCapturer, session, screen } = require('electron');
const path = require('path');

// 🟢 Community forked nut-js packages
const { keyboard, Key, mouse, Button, straightTo, Point } = require('@nut-tree-fork/nut-js');
app.commandLine.appendSwitch("enable-features", "WebRTCPipeWireCapturer"); // for Linux


// You DO NOT need to configure plugins manually in the forked version
// It uses the bundled `@nut-tree-fork/libnut` as backend automatically

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: false,
      media: true,
      preload: path.join(__dirname, 'preload.cjs'),
    }
  });

  // win.loadURL(`http://localhost:5173`);
  win.loadURL(`https://jomeet.vldo.in/`);
  // win.loadFile('file:///home/thianesh/projects/context_bridge_ui/dist/index.html')
}

let sources
let bounds
let MIN_X
let MIN_Y
let MAX_X
let MAX_Y

app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_, __, cb) => cb(true));
  createWindow();

  const display_details = screen.getPrimaryDisplay()
  bounds = display_details.bounds
  console.log("Bounds", bounds)
  MIN_X = bounds.x;
  MIN_Y = bounds.y;
  MAX_X = bounds.x + bounds.width  - 1;
  MAX_Y = bounds.y + bounds.height - 1;
  
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
      // console.log("Got the source", sources)
      callback({ video: sources[0], audio: 'loopback' })
    })
  }, { useSystemPicker: true })

});

// 💓 Heartbeat from frontend
ipcMain.on('heartbeat-from-frontend', (event) => {
  // console.log('💓 Received heartbeat from frontend');
  event.sender.send('heartbeat-from-backend', 'from backend');
});


ipcMain.on("get-screen", (event)=> {
  console.log(sources)
  return sources
} )


// ⌨️ Keyboard input simulation
ipcMain.on('keyboard-input', async (_, payload) => {
  const { key, isSpecial } = payload;
  // console.log('Received key:', key, 'Special:', isSpecial);

  try {
    if (isSpecial && Key[key]) {
      await keyboard.type(Key[key]);
    } else {
      await keyboard.type(key);
    }
  } catch (err) {
    console.error('Keyboard input failed:', err);
  }
});

// 🖱️ Mouse input simulation
ipcMain.on('mouse-input', async (_, { type, data }) => {
  console.log("mouse event", data)
  try {
    if (type === 'left_click') {
      await mouse.click(Button.LEFT);
    } else if (type === 'right_click') {
      await mouse.click(Button.RIGHT);
    } else if (type === 'move' && data) {
      const cur = await mouse.getPosition();
      let nextX = cur.x + data.x;
      let nextY = cur.y + data.y;
      nextX = Math.min(Math.max(nextX, MIN_X), MAX_X);
      nextY = Math.min(Math.max(nextY, MIN_Y), MAX_Y);

      // console.log("Result movement,", (nextX, nextY) )
      // console.log("Input all values,", nextX, nextY, cur.x, data.x, MIN_X, MAX_X)
      await mouse.move([new Point(nextX, nextY)]);
    }
  } catch (err) {
    console.error('Mouse action failed:', err);
  }
});