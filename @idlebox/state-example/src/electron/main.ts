import { resolve } from 'path';
import { app, BrowserWindow } from 'electron';
import { createMaster, ElectronIPCMain } from '../../../state/dist/state-public';
import { createMainLogic } from '../share/share.main';

const store = createMaster();
createMainLogic(store);

app.on('ready', () => {
	const win1 = new BrowserWindow({
		title: 'window 1',
		webPreferences: {
			devTools: true,
			nodeIntegration: true,
			preload: resolve(__dirname, `child1.cjs`),
		},
	});

	const win2 = new BrowserWindow({
		title: 'window 2',
		webPreferences: {
			devTools: true,
			nodeIntegration: true,
			preload: resolve(__dirname, `child2.cjs`),
		},
	});

	store.attach(new ElectronIPCMain('child1', win1));
	store.attach(new ElectronIPCMain('child2', win2));

	load(win1);
	load(win2);
});

function load(win: BrowserWindow) {
	win.webContents.openDevTools({ mode: 'right', activate: false });

	//const js = resolve(__dirname, `child${win.id}.cjs`);
	const html = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
		</head>
		<body>
			<h1>This is window ${win.id}</h1>
		</body>
		</html>
  `;
	win.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(html), { baseURLForDataURL: 'base:/' });
}
