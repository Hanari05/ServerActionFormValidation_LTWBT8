const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

function loadTs(relativePath, overrides = {}) {
  const filename = path.resolve(__dirname, "..", relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = (id) => Object.hasOwn(overrides, id) ? overrides[id] : originalRequire(id);
  loaded._compile(compiled, filename);
  return loaded.exports;
}

async function main() {
  const validation = loadTs("lib/validations/feedback.ts");
  const { feedbackSchema, countContentChars } = validation;
  let checks = 0;
  const validPhone = "0912345678";
  const validContent = "Dịch vụ rất tốt, nhân viên nhiệt tình!";
  for (const [content, expected] of [
    ["", false], ["   ", false], ["a".repeat(20), false], ["a".repeat(21), true],
    ["  " + "a".repeat(20) + "  ", false], ["a".repeat(1000), true],
    ["a".repeat(1001), false], ["👍🏽".repeat(20), false], ["👍🏽".repeat(21), true],
    ["👨‍👩‍👧‍👦".repeat(20), false], ["👨‍👩‍👧‍👦".repeat(21), true],
    ["a\u0301".repeat(21), true], [validContent, true],
  ]) {
    assert.equal(feedbackSchema.safeParse({ content, phone: validPhone }).success, expected);
    checks++;
  }
  for (const emoji of ["😀", "👍🏽", "👨‍👩‍👧‍👦", "🇻🇳", "a\u0301"]) {
    assert.equal(countContentChars(emoji), 1);
    checks++;
  }
  for (const [phone, expected] of [
    ["", false], ["123", false], ["091234567", false], ["09123456789", false],
    ["0112345678", false], ["+840912345678", false], ["0912abc678", false],
    [validPhone, true], ["091 234 5678", true], ["0912.345.678", true],
    ["0912-345-678", true], ["+84912345678", true], ["84912345678", true],
    ["02412345678", true], ["02812345678", true], ["02031234567", true],
    ["+842412345678", true], ["842812345678", true], ["+842031234567", true],
    ["0241234567", false], ["024123456789", false], ["02001234567", false],
    ["+8402412345678", false], ["024abc45678", false],
  ]) {
    assert.equal(feedbackSchema.safeParse({ content: validContent, phone }).success, expected, phone);
    checks++;
  }
  const invalid = feedbackSchema.safeParse({ content: "short", phone: "123" });
  assert.equal(invalid.success, false);
  assert.ok(invalid.error.flatten().fieldErrors.content);
  assert.ok(invalid.error.flatten().fieldErrors.phone);
  checks++;

  const saved = [];
  let failWrite = false;
  const { submitFeedbackAction } = loadTs("app/actions/feedback.ts", {
    "@/lib/validations/feedback": validation,
    "@/lib/data/feedback": { insertFeedback: async (data) => {
      if (failWrite) throw new Error("Simulated database outage");
      saved.push(data);
    } },
  });
  const rejected = await submitFeedbackAction({ content: "a".repeat(20), phone: "123" });
  assert.equal(rejected.status, "error");
  assert.ok(rejected.fieldErrors.content && rejected.fieldErrors.phone);
  assert.equal(saved.length, 0);
  assert.equal((await submitFeedbackAction(null)).status, "error");
  checks += 2;
  assert.equal((await submitFeedbackAction({ content: "  " + validContent + "  ", phone: "0912 345 678" })).status, "success");
  assert.deepEqual(saved[0], { content: validContent, phone: validPhone });
  checks++;
  failWrite = true;
  const failed = await submitFeedbackAction({ content: validContent, phone: validPhone });
  assert.equal(failed.status, "error");
  assert.ok(failed.formError);
  assert.equal(failed.formSuccess, undefined);
  checks++;

  let queryArgs;
  const { insertFeedback } = loadTs("lib/data/feedback.ts", {
    "server-only": {},
    "@/lib/server/db": { getPool: () => ({ query: async (...args) => { queryArgs = args; } }) },
  });
  const quotedContent = "Khách hàng góp ý: ' hãy cải thiện dịch vụ.";
  await insertFeedback({ content: quotedContent, phone: validPhone });
  assert.equal(queryArgs[0], "INSERT INTO feedbacks (content, phone) VALUES ($1, $2)");
  assert.deepEqual(queryArgs[1], [quotedContent, validPhone]);
  checks++;
  console.log(`PASS: ${checks} checks of Zod, Unicode, phone formats, server validation and database errors. Database writes are mocked in this suite.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
