import * as Sentry from "@sentry/electron";
import { isPackaged } from "@app/common/utils";
import { config } from "@app/common/config";

const dsn = "https://8aa85a039b8340c68723375d00e9c447@o1049693.ingest.sentry.io/6037486";

export function setupAnalytics() {
  Sentry.init({
    dsn: dsn,
    beforeSend(event) {
      if (isPackaged && config.general.analytics) return event;
      return null;
    },
  });
}
