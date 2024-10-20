import { appId, channelName, certificate } from "./data";

const RtcTokenBuilder = require("./RtcTokenBuilder2").RtcTokenBuilder;
const RtcRole = require("./RtcTokenBuilder2").Role;

const role = RtcRole.PUBLISHER;
const tokenExpirationInSecond = 3600;
const privilegeExpirationInSecond = 3600

export function generateToken(uid) {
  const tokenWithUid = RtcTokenBuilder.buildTokenWithUid(
    appId,
    certificate,
    channelName,
    uid,
    role,
    tokenExpirationInSecond,
    privilegeExpirationInSecond
  );
  return tokenWithUid;
}
