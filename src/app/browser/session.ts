import { session, CookiesSetDetails, Session, ProtocolResponse } from "electron";
import log from "electron-log";
import { config } from "@app/common/config";

const cookieUrl = "https://animemusicquiz.com";

function dismissCookieConsent(amqSession: Session) {
  const cookieConsentCookie: CookiesSetDetails = {
    url: cookieUrl,
    path: "/",
    name: "cookieconsent_status",
    value: "dismiss",
  };

  amqSession.cookies
    .set(cookieConsentCookie)
    .catch((err) => log.error("Unable to set cookie consent cookie.", err));
}

function patchSessionCookie(amqSession: Session) {
  amqSession.cookies.on("changed", (event, cookie, cause, removed) => {
    if (!removed && cookie.session && cookie.name == "connect.sid") {
      log.info("Patching connection id cookie.");

      const date = new Date();
      // The cookie will stay for a long time
      date.setFullYear(date.getFullYear() + 5);

      const sessionCookie: CookiesSetDetails = {
        url: cookieUrl,
        name: cookie.name,
        path: "/",
        httpOnly: false,
        secure: true,
        sameSite: "strict",
        value: cookie.value,
        expirationDate: date.getTime() / 1000,
      };

      amqSession.cookies
        .remove(cookieUrl, cookie.name)
        .then(() => {
          // Set new cookie only when old is removed
          amqSession.cookies
            .set(sessionCookie)
            .catch((err) => log.error("Unable to patch session cookie.", err));
        })
        .catch((err) => log.error("Unable to patch session cookie.", err));
    }
  });
}

function routeBackgroundData(url: URL, callback: (response: ProtocolResponse) => void) {
  const parameters = url.searchParams;
  const collectionName = parameters.get("collection");
  if (collectionName === null) {
    callback({ statusCode: 400 });
    return;
  }

  const itemIndexParameter = parameters.get("file");
  if (itemIndexParameter === null) {
    callback({ statusCode: 400 });
    return;
  }

  const itemIndex = parseInt(itemIndexParameter);
  if (Number.isNaN(itemIndex)) {
    callback({ statusCode: 400 });
    return;
  }

  if (
    config.appearance.background.collections[collectionName] !== undefined &&
    config.appearance.background.collections[collectionName].files[itemIndex] !== undefined
  ) {
    const filePath = config.appearance.background.collections[collectionName].files[itemIndex];
    callback({ path: filePath });
  } else {
    callback({ statusCode: 404 });
  }
}

function setupAmqElectronProtocol(amqSession: Session) {
  // Protocol used to send file data to amq browser view
  amqSession.protocol.registerFileProtocol("amq-electron", (request, callback) => {
    const url = new URL(request.url);
    switch (url.host) {
      case "background":
        routeBackgroundData(url, callback);
        break;

      default:
        callback({ statusCode: 404 });
        break;
    }
  });
}

export function setupSession() {
  const amqSession = session.defaultSession;

  dismissCookieConsent(amqSession);
  patchSessionCookie(amqSession);
  setupAmqElectronProtocol(amqSession);
}
