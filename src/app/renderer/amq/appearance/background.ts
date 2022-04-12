import * as path from "path";
import log from "electron-log";
import { getType } from "mime";
import * as Mousetrap from "mousetrap";
import { insertStylesheetFile } from "@app/renderer/amq/stylesheet";
import { publicPath } from "@app/common/utils";
import { BackgroundCollection, config, store } from "@app/common/config";
import { StoreChangeUnsubscribe } from "@app/common/store";

const backgroundStylesheetId = "appearance-background";

let imageContainer: HTMLDivElement;
let videoContainer: HTMLVideoElement;

let currentState: {
  collectionName: string;
  collection: BackgroundCollection;
  fileIndex: number;
  rotationTimer: NodeJS.Timer | null;
  tempUnsubscribes: StoreChangeUnsubscribe[];
} | null = null;

function initCollection(collectionName: string) {
  const collection = config.appearance.background.collections[collectionName];
  if (collection === undefined) {
    log.warn(`Cannot find background collection ${collectionName}.`);
    return;
  }

  currentState = {
    collectionName: collectionName,
    collection: collection,
    fileIndex: 0,
    rotationTimer: null,
    tempUnsubscribes: [],
  };

  listenCollectionChange();

  updateRotationTimer();
  updateBlur();
  updateGameBackground();
}

function listenCollectionChange() {
  if (currentState === null) return;

  const collectionPath = `appearance.background.collections.${currentState.collectionName}`;

  currentState.tempUnsubscribes.push(
    store.onChange(`${collectionPath}.files`, () => {
      if (currentState === null) return;
      // Completely reinit the collection if files changed
      cleanupCollection();
      initCollection(currentState.collectionName);
    }),
    store.onChange(`${collectionPath}.rotationTime`, () => {
      if (currentState === null) return;
      updateRotationTimer();
    }),
    store.onChange(`${collectionPath}.blur`, () => {
      if (currentState === null) return;
      updateBlur();
    })
  );
}

function updateGameBackground() {
  if (currentState === null) return;
  const file = currentState.collection.files[currentState.fileIndex];
  if (file === undefined) return;

  if (file === "$default") {
    imageContainer.classList.toggle("hidden", false);
    videoContainer.classList.toggle("hidden", true);
    imageContainer.style.backgroundImage =
      "url(https://animemusicquiz.com/img/backgrounds/normal/bg-x1.jpg)";
    return;
  }

  // To force the browser to update the background image whether the url changes or not
  const salt = Date.now();
  const url = `amq-electron://background?collection=${currentState.collectionName}&file=${currentState.fileIndex}&salt=${salt}`;

  const type = getType(file) ?? "unknown";
  if (type.startsWith("image")) {
    imageContainer.classList.toggle("hidden", false);
    videoContainer.classList.toggle("hidden", true);
    imageContainer.style.backgroundImage = `url(${url})`;
  } else if (type.startsWith("video")) {
    videoContainer.classList.toggle("hidden", false);
    imageContainer.classList.toggle("hidden", true);
    videoContainer.src = url;
  } else {
    log.warn(`Unknown file type: ${type}.`);
    return;
  }
}

function updateRotationTimer() {
  if (currentState === null) return;

  if (currentState.rotationTimer !== null) {
    clearInterval(currentState.rotationTimer);
    currentState.rotationTimer = null;
  }

  if (currentState.collection.rotationTime > 0) {
    currentState.rotationTimer = setInterval(() => {
      nextCollectionFile();
    }, currentState.collection.rotationTime * 1000);
  }
}

function updateBlur() {
  if (currentState === null) return;
  document.documentElement.style.setProperty(
    "--background-blur",
    `${currentState.collection.blur}px`
  );
}

function cleanupCollection() {
  if (currentState === null) return;

  currentState.tempUnsubscribes.forEach((unsubscribe) => unsubscribe());
  if (currentState.rotationTimer) clearInterval(currentState.rotationTimer);
  currentState = null;
}

function nextCollectionFile() {
  if (currentState === null) return;

  currentState.fileIndex = (currentState.fileIndex + 1) % currentState.collection.files.length;
  updateGameBackground();
}

function previousCollectionFile() {
  if (currentState === null) return;

  currentState.fileIndex =
    (currentState.fileIndex + currentState.collection.files.length - 1) %
    currentState.collection.files.length;
  updateGameBackground();
}

function listenKeys() {
  Mousetrap.bind("pageup", () => {
    nextCollectionFile();
    return false;
  });

  Mousetrap.bind("pagedown", () => {
    previousCollectionFile();
    return false;
  });
}

function createContainers() {
  imageContainer = document.createElement("div");
  imageContainer.id = "background-image-container";
  imageContainer.classList.add("hidden");

  videoContainer = document.createElement("video");
  videoContainer.id = "background-video-container";
  videoContainer.muted = true;
  videoContainer.autoplay = true;
  videoContainer.loop = true;
  videoContainer.classList.add("hidden");

  const mainContainer = document.querySelector("#mainContainer");
  mainContainer?.appendChild(imageContainer);
  mainContainer?.appendChild(videoContainer);
}

export async function setupBackground() {
  await insertStylesheetFile(
    backgroundStylesheetId,
    path.join(publicPath, "amq/styles/background.css")
  ).catch(() => log.warn("Unable to inject background stylesheet."));
  createContainers();

  initCollection(config.appearance.background.current);
  listenKeys();

  store.onChange("appearance.background.current", (newValue: string | undefined) => {
    cleanupCollection();
    if (newValue !== undefined) initCollection(newValue);
  });
}
