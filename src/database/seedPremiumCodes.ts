import { connectMongo } from "./mongo";
import { seedPremiumCodes } from "../services/premiumCodeService";

export const infinityPremiumCodes = [
  "INF-7QK9-LM2P-X4VA",
  "INF-B3T6-N8HY-Z2CD",
  "INF-R5WJ-9PQS-M7KE",
  "INF-X2DA-6VNL-Q9RT",
  "INF-M8CU-4KZP-H3YB",
  "INF-P6YN-R2WX-V8LS",
  "INF-Z9HE-T5QM-C4NA",
  "INF-L4SA-X7DP-K6RJ",
  "INF-H2VC-M9TB-P5QW",
  "INF-Q8RD-C3LY-N6XZ"
];

if (require.main === module) {
  connectMongo()
    .then(() => seedPremiumCodes(infinityPremiumCodes))
    .then(() => {
      console.log(`Seeded ${infinityPremiumCodes.length} infinity premium codes.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
