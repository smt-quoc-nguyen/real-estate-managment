import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const clientRoot = new URL("../dist/client/", import.meta.url);

test("production bundle contains the academy application, not the empty scaffold", async () => {
  const assetNames = await readdir(new URL("assets/", clientRoot));
  const javascriptAsset = assetNames.find((name) => name.startsWith("index-") && name.endsWith(".js"));

  assert.ok(javascriptAsset, "expected Vite to emit an index JavaScript asset");

  const javascriptAssets = assetNames.filter((name) => name.endsWith(".js"));
  const bundle = (
    await Promise.all(
      javascriptAssets.map((name) => readFile(new URL(`assets/${name}`, clientRoot), "utf8")),
    )
  ).join("\n");
  assert.match(bundle, /PropertyOS Academy/);
  assert.match(bundle, /Tại sao Space là foundation/);
  assert.match(bundle, /Mở case thực tế/);
  assert.match(bundle, /Từ điển Property Management/);
  assert.match(bundle, /Hỗ trợ người mới/);
  assert.match(bundle, /CAM annual reconciliation/);
  assert.match(bundle, /Capstone: Office \+ Coworking digital twin/);
});
