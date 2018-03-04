import * as electron from 'electron';
import * as fs from 'fs';

import * as _ from 'lodash';
import * as defaultMenu from 'electron-default-menu';

import {initialize} from './mainThreadServices';

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let logFilePath = '';

function createWindow() {
    logFilePath = _.last(process.argv);

    if (!fs.existsSync((logFilePath))) {
        console.log('Cannot find the log file. Please specify on the command line');
        return;
    } else {
        console.log(`File is ${logFilePath}`);
    }

    initialize(logFilePath);

    const menu = defaultMenu(app, electron.shell);

    electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(shrinkMenu(menu)));

    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

function shrinkMenu(menu: any) {
    menu[0].submenu = _.filter(menu[0].submenu, (e) => {
         return e.label != 'Undo' && e.label!= 'Redo' && e.label != 'separator';
    });

    return menu.splice(0, menu.length - 1);
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
