const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// 🟢 Community forked nut-js packages
const { keyboard, Key, mouse, Button, straightTo, Point } = require('@nut-tree-fork/nut-js');

// You DO NOT need to configure plugins manually in the forked version
// It uses the bundled `@nut-tree-fork/libnut` as backend automatically

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    }
  });

  win.loadURL(`http://${window.location.hostname}:5173`);
}

app.whenReady().then(createWindow);

// 💓 Heartbeat from frontend
ipcMain.on('heartbeat-from-frontend', (event) => {
  console.log('💓 Received heartbeat from frontend');
  event.sender.send('heartbeat-from-backend', 'from backend');
});

// ⌨️ Keyboard input simulation
ipcMain.on('keyboard-input', async (_, payload) => {
  const { key, isSpecial } = payload;
  console.log('Received key:', key, 'Special:', isSpecial);

  try {
    if (isSpecial && Key[key]) {
      await keyboard.tapKey(Key[key]);
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
      await mouse.move(straightTo(new Point(data.x, data.y)));
    }
  } catch (err) {
    console.error('Mouse action failed:', err);
  }
});
A