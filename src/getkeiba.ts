/**
 * getkeiba.ts
 *
 * getkeiba - Getting keiba data from netkeiba. -
**/

'use strict';

/// Constants
// name space
import { myConst, myUrls, mySelectors, myRaces } from './consts/globalvariables';

/// Modules
import * as path from 'node:path'; // path
import { existsSync } from 'node:fs'; // file system
import { readFile, writeFile } from 'node:fs/promises'; // filesystem
import { BrowserWindow, app, ipcMain, Tray, Menu, nativeImage } from 'electron'; // electron
import NodeCache from "node-cache"; // for cache
import axios from 'axios'; // http communication
import ELLogger from './class/ElLogger'; // logger
import { Scrape } from './class/ElScrapeCore0719'; // custom Scraper
import Dialog from './class/ElDialog0721'; // dialog
import CSV from './class/ElCsv0414'; // aggregator
import MKDir from './class/ElMkdir0414'; // mdkir
/// Variables
let globalRootPath: string; // root path
// production
if (!myConst.DEVMODE) {
  globalRootPath = path.resolve();
  // development
} else {
  globalRootPath = path.join(__dirname, '..');
}
// desktop path
const dir_home =
  process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] ?? '';
const dir_desktop = path.join(dir_home, 'Desktop');
// log level
const loglevel: string = myConst.LOG_LEVEL ?? 'all';
// loggeer instance
const logger: ELLogger = new ELLogger(myConst.COMPANY_NAME, myConst.APP_NAME, loglevel);
// scraper
const scraper = new Scrape(logger);
// mkdir
const mkdirManager = new MKDir(logger);
// aggregator
const csvMaker = new CSV(myConst.CSV_ENCODING, logger);
// cache
const cacheMaker: NodeCache = new NodeCache();
// dialog
const dialogMaker: Dialog = new Dialog(logger);

/// interfaces
// window option
interface windowOption {
  width: number; // window width
  height: number; // window height
  defaultEncoding: string; // default encode
  webPreferences: Object; // node
}

/*
 main
*/
// main window
let mainWindow: any = null;
// quit flg
let isQuiting: boolean;

// make window
const createWindow = async (): Promise<void> => {
  try {
    // window options
    const windowOptions: windowOption = {
      width: myConst.WINDOW_WIDTH, // window width
      height: myConst.WINDOW_HEIGHT, // window height
      defaultEncoding: myConst.DEFAULT_ENCODING, // encoding
      webPreferences: {
        nodeIntegration: false, // node
        contextIsolation: true, // isolate
        preload: path.join(__dirname, 'preload.js'), // preload
      }
    }
    // Electron window
    mainWindow = new BrowserWindow(windowOptions);
    // hide menubar
    mainWindow.setMenuBarVisibility(false);
    // load index.html
    await mainWindow.loadFile(path.join(__dirname, '..', 'www', 'index.html'));
    // ready
    mainWindow.once('ready-to-show', async () => {
      // dev mode
      if (!app.isPackaged) {
        //mainWindow.webContents.openDevTools();
      }
    });

    // minimize and stay on tray
    mainWindow.on('minimize', (event: any): void => {
      // cancel double click
      event.preventDefault();
      // hide window
      mainWindow.hide();
      // return false
      event.returnValue = false;
    });

    // close
    mainWindow.on('close', (event: any): void => {
      // not quitting
      if (!isQuiting) {
        // except for apple
        if (process.platform !== 'darwin') {
          // quit
          app.quit();
          // return false
          event.returnValue = false;
        }
      }
    });

    // when close
    mainWindow.on('closed', (): void => {
      // destryo window
      mainWindow.destroy();
    });

  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage('error', `${e.message}`);
    }
  }
};

// enable sandbox
app.enableSandbox();

// avoid double ignition
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  // show error message
  dialogMaker.showmessage('error', 'Double ignition. break.');
  // close app
  app.quit();
}

// ready
app.on('ready', async () => {
  logger.info('app: electron is ready');
  // make window
  createWindow();
  // menu label
  let displayLabel: string = '';
  // close label
  let closeLabel: string = '';
  // txt path
  const languageTxtPath: string = path.join(__dirname, "..", "assets", "language.txt");
  // not exists
  if (!existsSync(languageTxtPath)) {
    logger.debug('app: making txt ...');
    // make txt file
    await writeFile(languageTxtPath, 'japanese');
  }
  // get language
  const language = await readFile(languageTxtPath, "utf8");
  logger.debug(`language is ${language}`);
  // switch on language
  if (language == 'japanese') {
    // set menu label
    displayLabel = '表示';
    // set close label
    closeLabel = '閉じる';
  } else {
    // set menu label
    displayLabel = 'show';
    // set close label
    closeLabel = 'close';
  }
  // cache
  cacheMaker.set('language', language);
  // app icon
  const icon: Electron.NativeImage = nativeImage.createFromPath(
    path.join(globalRootPath, 'assets/keiba128.ico')
  );
  // tray
  const mainTray: Electron.Tray = new Tray(icon);
  // contextMenu
  const contextMenu: Electron.Menu = Menu.buildFromTemplate([
    // show
    {
      label: displayLabel,
      click: () => {
        mainWindow.show();
      },
    },
    // close
    {
      label: closeLabel,
      click: () => {
        isQuiting = true;
        app.quit();
      },
    },
  ]);
  // set contextMenu
  mainTray.setContextMenu(contextMenu);
  // show on double click
  mainTray.on('double-click', () => mainWindow.show());
});

// activated
app.on('activate', async () => {
  // no window
  if (BrowserWindow.getAllWindows().length === 0) {
    // reboot
    createWindow();
  }
});

// quit button
app.on('before-quit', () => {
  // flg on
  isQuiting = true;
});

// closed
app.on('window-all-closed', () => {
  logger.info('app: close app');
  // quit
  app.quit();
});


/*
 IPC
*/
// ready
ipcMain.on("beforeready", async (_, __) => {
  logger.info("app: beforeready app");
  // language
  const language = cacheMaker.get('language') ?? '';
  // be ready
  mainWindow.send("ready", language);
});

// config
ipcMain.on('config', async (_, arg: any) => {
  logger.info('app: config app');
  // language
  const language = cacheMaker.get('language') ?? '';
  // goto config page
  await mainWindow.loadFile(path.join(__dirname, '..', 'www', 'config.html'));
  // language
  mainWindow.send('confready', language);
});

// save
ipcMain.on('save', async (_, arg: any) => {
  logger.info('app: save config');
  // language
  const language: string = String(arg.language);
  // txt path
  const languageTxtPath: string = path.join(globalRootPath, "assets", "language.txt");
  // make txt file
  await writeFile(languageTxtPath, language);
  // cache
  cacheMaker.set('language', language);
  // goto config page
  await mainWindow.loadFile(path.join(__dirname, '..', 'www', 'index.html'));
  // language
  mainWindow.send('topready', language);
});

// top
ipcMain.on('top', async (_, arg: any) => {
  logger.info('app: top');
  // goto config page
  await mainWindow.loadFile(path.join(__dirname, '..', 'www', 'index.html'));
  // language
  const language = cacheMaker.get('language') ?? '';
  // language
  mainWindow.send('topready', language);
});

// exit
ipcMain.on('exitapp', async () => {
  try {
    logger.info('ipc: exit mode');
    // selection
    const selected: number = dialogMaker.showQuetion('question', 'exit', 'exit? data is exposed');

    // when yes
    if (selected == 0) {
      // close
      app.quit();
    }

  } catch (e: unknown) {
    logger.error(e);
  }
});

// get horse sire
ipcMain.on('sire', async (event: any, arg: any) => {
  try {
    logger.info('sire: getsire mode');
    // success Counter
    let successCounter: number = 0;
    // fail Counter
    let failCounter: number = 0;
    // status message
    let statusmessage: string;
    // finish message
    let endmessage: string;
    // result array
    let resultArray: any[] = [];
    // selector array
    const selectorArray: string[] = [mySelectors.TURF_SELECTOR, mySelectors.TURF_WIN_SELECTOR, mySelectors.DIRT_SELECTOR, mySelectors.DIRT_WIN_SELECTOR, mySelectors.TURF_DIST_SELECTOR, mySelectors.DIRT_DIST_SELECTOR];
    // language
    const language = cacheMaker.get('language') ?? '';
    // stallion data
    const stallionData: any = await httpsPost(`${myConst.DEFAULT_URL}/horse/getstallion`, {});
    // extract first column
    const horses: string[] = stallionData.map((item: any) => item.horsename);
    // extract second column
    const urls: string[] = stallionData.map((item: any) => item.url);
    // initialize
    await scraper.init();
    logger.debug('sire: initialize end');

    // loop words
    for (let i: number = 0; i < urls.length; i++) {
      try {
        // empty array
        let tmpObj: any = {
          horse: '', // horse name
          turf: '', // turf ratio
          turfwin: '', // turf win
          dirt: '', // dirt ratio
          dirtwin: '', // dirt win
          turfdistanse: '', // turf average distance
          dirtdistanse: '', // dirt average distance
        };
        // url
        const sireUrl: string = myUrls.SIRE_BASE_URL + urls[i];
        // insert horse name
        tmpObj.horse = horses[i];
        // goto page
        await scraper.doGo(sireUrl);
        // wait for selector
        await scraper.doWaitFor(3000);
        logger.debug(`sire: goto ${sireUrl}`);
        // send totalWords
        event.sender.send('total', { len: urls.length, place: horses[i] });
        // switch on language
        if (language == 'japanese') {
          // set finish message
          statusmessage = '種牡馬産駒成績取得中...';
        } else {
          // set finish message
          statusmessage = 'Getting crops results...';
        }
        // URL
        event.sender.send('statusUpdate', {
          status: statusmessage,
          target: tmpObj.horse
        });

        // get data
        for (let j: number = 0; j < selectorArray.length; j++) {
          try {
            // check selector
            if (await scraper.doCheckSelector(selectorArray[j])) {
              // wait for selector
              await scraper.doWaitFor(200);
              // acquired data
              const scrapedData: string = await scraper.doSingleEval(selectorArray[j], 'textContent');

              // data exists
              if (scrapedData != '') {
                tmpObj[myRaces.HORSE_SCRAPE_COLUMNS[j]] = scrapedData;
              }
              // wait for 100ms
              await scraper.doWaitFor(200);

            } else {
              logger.debug('sire: no selector');
            }

          } catch (err: unknown) {
            logger.error(err);
          }
        }
        // add to result array
        resultArray.push(tmpObj);
        // increment success
        successCounter++;

      } catch (error: unknown) {
        logger.error(error);
        // increment fail
        failCounter++;

      } finally {
        // send success
        event.sender.send('success', successCounter);
        // send fail
        event.sender.send('fail', failCounter);
      }
    }
    logger.debug('sire: making csv ...');
    // today date
    const formattedDate: string = 'sire_' + getNowDate();
    // file path
    const filePath: string = path.join(dir_desktop, formattedDate + '.csv');
    // make csv
    await csvMaker.makeCsvData(resultArray, myRaces.HORSE_CSV_COLUMNS, filePath);
    // switch on language
    if (language == 'japanese') {
      // set finish message
      endmessage = myConst.FINISHED_MESSAGE_JA;
    } else {
      // set finish message
      endmessage = myConst.FINISHED_MESSAGE_EN;
    }
    // end message
    dialogMaker.showmessage('info', endmessage);
    logger.info('sire: getsire completed.');

  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

/*
 Functions
*/
// post communication
const httpsPost = async (
  hostname: string,
  data: any,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    // post
    axios
      .post(hostname, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response: any) => {
        // data
        const targetData: any = response.data;

        // recieved data
        if (targetData != 'error') {
          // complete
          resolve(targetData);
        } else {
          // error
          throw new Error('data is invalid');
        }
      })
      .catch((err: unknown) => {
        logger.error(err);
        // error
        if (err instanceof Error) {
          // error message
          dialogMaker.showmessage('error', err.message);
          // reject
          reject('httpsPost error');
        }
      });
  });
};

// error
ipcMain.on('error', async (_, arg: any) => {
  logger.info('ipc: error mode');
  // show error
  dialogMaker.showmessage('error', `${arg})`);
});

/*
 Functions
*/
// get now date
const getNowDate = (): string => {
  // get now time
  return new Date().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replaceAll('/', '-');
}
