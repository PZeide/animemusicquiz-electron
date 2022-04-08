import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from "electron";

export function setupApplicationMenu(window: BrowserWindow) {
  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: "Edit",
      submenu: [
        {
          label: "Cut",
          accelerator: "CmdOrCtrl+X",
          role: "cut",
        },
        {
          label: "Copy",
          accelerator: "CmdOrCtrl+C",
          role: "copy",
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+V",
          role: "paste",
        },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          role: "selectAll",
        },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Toggle Full Screen",
          accelerator: process.platform === "darwin" ? "Ctr+Command+F" : "F11",
          click: () => {
            if (window) window.setFullScreen(!window.isFullScreen());
          },
        },
      ],
    },
  ];

  // Enable Cmd+Q to quit for macOS
  if (process.platform === "darwin") {
    const quitMenuItem: MenuItemConstructorOptions = {
      label: "Quit",
      accelerator: "CmdOrCtrl+Q",
      click: () => {
        app.quit();
      },
    };

    menuTemplate.push(quitMenuItem);
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}
