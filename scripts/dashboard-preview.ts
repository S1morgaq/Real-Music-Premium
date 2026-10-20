import "dotenv/config";
import { MusicClient } from "../src/client/MusicClient";
import { startDashboardServer } from "../src/services/dashboardServer";

const client = new MusicClient();
startDashboardServer(client);

console.log("Dashboard preview ready: http://127.0.0.1:3100");
