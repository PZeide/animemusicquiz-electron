import {app, Menu, MenuItemConstructorOptions} from "electron";

const menuTemplate: MenuItemConstructorOptions[] = [
    {
        label: "Edit",
        submenu: [
            {
                label: "Cut",
                accelerator: "CmdOrCtrl+X",
                role: "cut"
            },
            {
                label: "Copy",
                accelerator: "CmdOrCtrl+C",
                role: "copy"
            },
            {
                label: "Paste",
                accelerator: "CmdOrCtrl+V",
                role: "paste"
            },
            {
                label: "Select All",
                accelerator: "CmdOrCtrl+A",
                role: "selectAll"
            },
        ]
    },
    {
        label: "View",
        submenu: [
            {
                label: "Toggle Full Screen",
                accelerator: process.platform === "darwin" ? "Ctr+Command+F" : "F11",
                click: () => {
                    if (browserWindow)
                        browserWindow.setFullScreen(!browserWindow.isFullScreen());
                }
            }
        ]
    }
];

// Enable Cmd+Q to quit for macOS
if (process.platform === "darwin") {
    const quitMenuItem: MenuItemConstructorOptions = {
        label: "Quit",
        accelerator: "CmdOrCtrl+Q",
        click: () => {
            app.quit()
        }
    };

    menuTemplate.push(quitMenuItem);
}

export function setupApplicationMenu() {
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}