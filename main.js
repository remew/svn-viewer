'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;

let mainWindow = null;

app.on('ready', createWindow);
app.on('activate', createWindow);

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

function createWindow() {
    if (mainWindow === null) {
        mainWindow = new BrowserWindow({width: 1280, height: 720});
        mainWindow.loadURL(`file://${__dirname}/index.html`);

        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    }
}

const exec = require('child_process').exec;

ipc.on('status-request', (e, arg) => {
    const cwd = arg.cwd || '~';
    exec('svn status', {cwd}, (error, stdout, stderr) => {
        e.sender.send('status-response', {error, stdout, stderr});
    });
});
ipc.on('diff-request', (e, arg) => {
    const cwd = arg.cwd || '~';
    const file = arg.file;
    exec(`svn diff ${file}`, {cwd}, (error, stdout, stderr) => {
        e.sender.send('diff-response', {error, stdout, stderr});
    });
});

