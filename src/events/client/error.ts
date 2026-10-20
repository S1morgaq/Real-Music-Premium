import { logger } from "../../lib/logger";

export default {
  name: "error",
  execute(error: Error) {
    logger.error({ error }, "Discord client error");
  }
};
