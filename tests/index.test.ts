import {
  translate,
  translateObject,
  translateFile,
  generate,
  translateFileSingle
} from "../index";
import { readJson, writeJson, mkdirp } from "fs-extra";
import { join } from "path";

test("translate a word", async () => {
  const translated = <string>await translate("hello", "fr");
  expect(translated.toLowerCase().trim()).toBe("bonjour");
});

test("invalid language would fail", () => {
  translate("hello", "xx")
    .then(() => {
      throw new Error("did not fail");
    })
    .catch(error => expect(error.message).toBe("invalid language: xx"));
});

test("invalid api request", () => {
  translate("", "fr", undefined, true)
    .then(() => {
      throw new Error("did not fail");
    })
    .catch(error => expect(error.message).toBe("unable to translate from api"));
});

test("translating an object", async () => {
  interface i {
    [index: string]: string;
  }
  const translated = <i>await translateObject({ hello: "hello" }, "fr");
  expect(translated.hello.toLowerCase().trim()).toBe("bonjour");
});

test("translating a more complicated object", async () => {
  interface i {
    [index: string]: any;
  }
  const translated = <i>await translateObject(
    {
      hello: {
        world: ["hello"]
      }
    },
    "fr"
  );
  expect(translated.hello.world[0].toLowerCase().trim()).toBe("bonjour");
});

test("translation comes from cache", async () => {
  const translated = <string>await translate("hello", "fr");
  const translatedFromCache = <any>(
    await translate("hello", "fr", undefined, undefined, true)
  );
  expect(translatedFromCache.from).toBe("cache");
});

test("translation comes from cache", async () => {
  const translated = <string>await translate("hello", "fr");
  const translatedFromApi = <any>(
    await translate("hello", "fr", undefined, true, true)
  );
  expect(translatedFromApi.from).toBe("api");
});

test("translate a regular file", async () => {
  const dirPath = join(__dirname, "test-cache");
  const filePath = join(dirPath, "test-1.json");
  await mkdirp(dirPath);
  await writeJson(filePath, { hello: "hello" });
  const translated = <any>await translateFile(filePath, "fr");
  expect(translated.hello.toLowerCase().trim()).toBe("bonjour");
});

test("translate a single file with many languages", async () => {
  const dirPath = join(__dirname, "test-cache");
  const filePath = join(dirPath, "test-2.json");
  await mkdirp(dirPath);
  await writeJson(filePath, { en: { hello: "hello" } });
  const translated = <any>await translateFile(filePath, "fr");
  expect(translated.fr.hello.toLowerCase().trim()).toBe("bonjour");
});

test("invalid single file would fail", async () => {
  const dirPath = join(__dirname, "test-cache");
  const filePath = join(dirPath, "test-3.json");
  await mkdirp(dirPath);
  await writeJson(filePath, { hello: "hello" });
  translateFileSingle(filePath, ["fr"])
    .then(() => {
      throw new Error("did not fail");
    })
    .catch(error => expect(error.message).toBe("not single translation file"));
});

test("write single file with many languages", async () => {
  const dirPath = join(__dirname, "test-cache");
  const filePath = join(dirPath, "test-4.json");
  await mkdirp(dirPath);
  await writeJson(filePath, { en: { hello: "hello" } });
  <any>await translateFileSingle(filePath, ["fr"], true);
  const translated = await readJson(join(filePath, "..", "fr.json"));
  expect(translated.hello.toLowerCase().trim()).toBe("bonjour");
});

test("save a translated file", async () => {
  const dirPath = join(__dirname, "test-cache");
  const filePath = join(dirPath, "test-5.json");
  await mkdirp(dirPath);
  await writeJson(filePath, { hello: "hello" });
  <any>await translateFile(filePath, "fr", true);
  const translated = await readJson(join(filePath, "..", "fr.json"));
  expect(translated.hello.toLowerCase().trim()).toBe("bonjour");
});

test("generate translations", async () => {
  const dirPath = join(__dirname, "test-cache");
  const filePath = join(dirPath, "en.json");
  await mkdirp(dirPath);
  await writeJson(filePath, { hello: "hello" });
  <any>await generate(filePath, ["nl", "de"]);
  const translated = await readJson(join(filePath, "..", "nl.json"));
  expect(translated.hello.toLowerCase().trim()).toBeDefined();
});
