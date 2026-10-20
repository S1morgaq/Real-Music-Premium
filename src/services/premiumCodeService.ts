import { Premium, PremiumCode } from "../database/models/Premium";

export async function redeemPremiumCode(codeInput: string, userId: string, guildId?: string | null): Promise<"invalid" | "used" | "ok"> {
  const code = codeInput.trim().toUpperCase();
  const premiumCode = await PremiumCode.findOne({ code });
  if (!premiumCode) return "invalid";
  if (premiumCode.redeemedAt) return "used";

  const targetId = premiumCode.type === "guild" ? guildId : userId;
  if (!targetId) return "invalid";

  await Premium.findOneAndUpdate(
    { targetId, type: premiumCode.type },
    { targetId, type: premiumCode.type, expiresAt: premiumCode.expiresAt },
    { upsert: true }
  );

  premiumCode.redeemedBy = userId;
  premiumCode.redeemedFor = targetId;
  premiumCode.redeemedAt = new Date();
  await premiumCode.save();

  return "ok";
}

export async function seedPremiumCodes(codes: string[], type: "user" | "guild" = "user"): Promise<void> {
  await Promise.all(
    codes.map((code) =>
      PremiumCode.updateOne(
        { code: code.toUpperCase() },
        { $setOnInsert: { code: code.toUpperCase(), type } },
        { upsert: true }
      )
    )
  );
}
