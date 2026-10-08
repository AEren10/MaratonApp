import { STORY_SHARE } from "./storyShareOutcome.js";

const ANDROID_PERMISSIONLESS_WRITE_API = 30;

function supportsPermissionlessWrite(platform, platformVersion) {
  return platform === "android" && Number(platformVersion) >= ANDROID_PERMISSIONLESS_WRITE_API;
}

export async function saveCapturedStoryToGallery({
  uri,
  platform,
  platformVersion,
  requestWritePermission,
  createAsset,
}) {
  let permission;
  try {
    permission = await requestWritePermission();
  } catch {
    return STORY_SHARE.FAILED;
  }

  if (!permission?.granted && !supportsPermissionlessWrite(platform, platformVersion)) {
    return STORY_SHARE.PERMISSION_DENIED;
  }

  try {
    await createAsset(uri);
    return STORY_SHARE.SAVED;
  } catch {
    return STORY_SHARE.FAILED;
  }
}
