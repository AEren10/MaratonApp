import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const tokensSrc = readFileSync("src/themes/tokens.js", "utf8");

test("input typography tokens in tokens.js do not specify lineHeight", () => {
  const inputTokenKeys = [
    "input",
    "inputMedium",
    "inputSemiBold",
    "inputCaption",
    "inputTable",
    "inputHeading",
    "inputTopic",
    "inputStat",
  ];

  for (const key of inputTokenKeys) {
    const re = new RegExp(`${key}:\\s*\\{([^}]+)\\}`, "m");
    const match = tokensSrc.match(re);
    assert.ok(match, `${key} must be defined in tokens.js`);
    const props = match[1];
    assert.doesNotMatch(props, /lineHeight/, `${key} must NOT define lineHeight (causes iOS descender clipping)`);
    assert.match(props, /fontFamily/, `${key} must define fontFamily`);
    assert.match(props, /fontSize/, `${key} must define fontSize`);
  }
});

test("Input component uses TYPOGRAPHY.input and does not apply lineHeight", () => {
  const inputSrc = readFileSync("src/components/design/Input.js", "utf8");
  assert.match(inputSrc, /TYPOGRAPHY\.input/);
  assert.doesNotMatch(inputSrc, /lineHeight/);
});

test("Group components use input typography without lineHeight", () => {
  const editCard = readFileSync("src/screens/groups/components/GroupInfoEditCard.js", "utf8");
  assert.match(editCard, /TYPOGRAPHY\.inputMedium/);

  const joinInput = readFileSync("src/screens/groups/components/JoinCodeInput.js", "utf8");
  assert.match(joinInput, /TYPOGRAPHY\.inputStat/);
});
