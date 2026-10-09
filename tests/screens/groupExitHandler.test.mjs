import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const handlerSource = readFileSync(
  new URL("../../src/screens/league/groupExitHandler.js", import.meta.url),
  "utf8"
);
const controllerSource = readFileSync(
  new URL("../../src/screens/league/useGroupsController.js", import.meta.url),
  "utf8"
);

test("useGroupsController delegates doLeave to handleGroupExit", () => {
  assert.match(controllerSource, /import\s*\{\s*handleGroupExit\s*\}\s*from\s*["']\.\/groupExitHandler["']/);
  // Grup Modal'inin icinden cagrilinca oradaki uyari kullanilir (alertFn).
  assert.match(controllerSource, /handleGroupExit\(\{\s*group:\s*g,\s*user,\s*showAlert:\s*alertFn \|\| showAlert,\s*setSelected,\s*loadGroups\s*\}\)/);
});

test("groupExitHandler distinguishes sole admin from admin with members", () => {
  assert.match(handlerSource, /const\s+isAdmin\s*=/);
  assert.match(handlerSource, /memberCount\s*<=\s*1/);
  assert.match(handlerSource, /showAlert\(\s*["']Grubu kapat["']/);
  assert.match(handlerSource, /showAlert\(\s*["']Grup Yöneticisisin["']/);
});

test("groupExitHandler wires both deleteGroup and leaveGroup", () => {
  assert.match(handlerSource, /deleteGroup\(group\.id\)/);
  assert.match(handlerSource, /leaveGroup\(group\.id,\s*user\?\.id\)/);
  assert.match(handlerSource, /"Yöneticiliği devret"/);
  assert.match(handlerSource, /transferGroupAdmin\(group\.id,\s*targetId\)/);
});

