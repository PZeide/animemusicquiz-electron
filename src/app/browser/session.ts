import {session, CookiesSetDetails, Session} from "electron";
import log from "electron-log";

const cookieUrl = "https://animemusicquiz.com";

function dismissCookieConsent(amqSession: Session) {
    const cookieConsentCookie: CookiesSetDetails = {
        url: cookieUrl,
        path: "/",
        name: "cookieconsent_status",
        value: "dismiss"
    };

    amqSession.cookies.set(cookieConsentCookie)
        .catch(() => log.error("Unable to set cookie consent cookie."));
}

function patchSessionCookie(amqSession: Session) {
    amqSession.cookies.on("changed", (event, cookie, _cause, removed) => {
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
                expirationDate: date.getTime() / 1000
            }

            amqSession.cookies.remove(cookieUrl, cookie.name)
                .then(() => {
                    // Set new cookie only when old is removed
                    amqSession.cookies.set(sessionCookie)
                        .catch(() => log.error("Unable to patch session cookie."));
                })
                .catch(() => log.error("Unable to patch session cookie."));
        }
    });
}

export function setupSession() {
    const amqSession = session.defaultSession;

    dismissCookieConsent(amqSession);
    patchSessionCookie(amqSession);
}