import crypto from "crypto";

export const createHash = (text) => {
  return crypto.createHash("md5").update(text).digest("hex");
};