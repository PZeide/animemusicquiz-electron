import * as Sentry from "@sentry/electron";

const dsn = "https://8aa85a039b8340c68723375d00e9c447@o1049693.ingest.sentry.io/6037486";

export function setupAnalytics() {
    Sentry.init({
        dsn: dsn
    });
}