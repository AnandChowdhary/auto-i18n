jest.mock("@google-cloud/translate", () => {
  const translations: { [language: string]: { [term: string]: string } } = {
    de: { hello: "hallo", world: "welt" },
    fr: { hello: "bonjour", world: "monde" },
    nl: { hello: "hallo", world: "wereld" },
  };

  return {
    Translate: jest.fn().mockImplementation(() => ({
      translate: jest.fn(async (term: string, language: string) => {
        if (!term) return [];
        return [
          translations[language]?.[term.toLowerCase()] || `${term}-${language}`,
        ];
      }),
    })),
  };
});

import {
  translate,
  translateObject,
  translateFile,
  generate,
  translateFileSingle,
} from "../index";
import { readJson, writeJson, mkdirp, remove } from "fs-extra";
import { join } from "path";

const testRoot = join(__dirname, "..", ".cache", "tests");
const translationCache = join(testRoot, "translations");

beforeAll(async () => {
  await remove(testRoot);
  await mkdirp(testRoot);
});

test("translate a word", async () => {
  const translated = <string>(
    await translate("hello", "fr", translationCache, true)
  );
  expect(translated.toLowerCase().trim()).toBe("bonjour");
});

test("invalid language would fail", async () => {
  await expect(translate("hello", "xx", translationCache)).rejects.toThrow(
    "invalid language: xx"
  );
});

test("invalid api request", async () => {
  await expect(translate("", "fr", translationCache, true)).rejects.toThrow(
    "unable to translate from api"
  );
});

test("translating an object", async () => {
  interface i {
    [index: string]: string;
  }
  const translated = <i>(
    await translateObject({ hello: "hello" }, "fr", translationCache)
  );
  expect(translated.hello.toLowerCase().trim()).toBe("bonjour");
});

test("translating a more complicated object", async () => {
  interface i {
    [index: string]: any;
  }
  const translated = <i>await translateObject(
    {
      hello: {
        world: ["hello"],
      },
    },
    "fr",
    translationCache
  );
  expect(translated.hello.world[0].toLowerCase().trim()).toBe("bonjour");
});

test("translation comes from cache", async () => {
  await translate("hello", "fr", translationCache, true);
  const translatedFromCache = <any>(
    await translate("hello", "fr", translationCache, false, true)
  );
  expect(translatedFromCache.from).toBe("cache");
});

test("translation can be forced to refresh from api", async () => {
  await translate("hello", "fr", translationCache, true);
  const translatedFromApi = <any>(
    await translate("hello", "fr", translationCache, true, true)
  );
  expect(translatedFromApi.from).toBe("api");
});

test("translate a regular file", async () => {
  const dirPath = join(testRoot, "files");
  const filePath = join(dirPath, "test-1.json");
  await mkdirp(dirPath);
  await writeJson(filePath, { hello: "hello" });
  const translated = <any>(
    await translateFile(filePath, "fr", false, "en", translationCache)
  );
  expect(translated.hello.toLowerCase().trim()).toBe("bonjour");
});

test("translate a single file with many languages", async () => {
  const dirPath = join(testRoot, "files");
  const filePath = join(dirPath, "test-2.json");
  await mkdirp(dirPath);
  await writeJson(filePath, { en: { hello: "hello" } });
  const translated = <any>(
    await translateFile(filePath, "fr", false, "en", translationCache)
  );
  expect(translated.fr.hello.toLowerCase().trim()).toBe("bonjour");
});

test("invalid single file would fail", async () => {
  const dirPath = join(testRoot, "files");
  const filePath = join(dirPath, "test-3.json");
  await mkdirp(dirPath);
  await writeJson(filePath, { hello: "hello" });
  await expect(
    translateFileSingle(filePath, ["fr"], false, "en", translationCache)
  ).rejects.toThrow("not single translation file");
});

test("write single file with many languages", async () => {
  const dirPath = join(testRoot, "files");
  const filePath = join(dirPath, "test-4.json");
  await mkdirp(dirPath);
  await writeJson(filePath, { en: { hello: "hello" } });
  <any>(
    await translateFileSingle(filePath, ["fr"], true, "en", translationCache)
  );
  const translated = await readJson(filePath);
  expect(translated.fr.hello.toLowerCase().trim()).toBe("bonjour");
});

test("save a translated file", async () => {
  const dirPath = join(testRoot, "files");
  const filePath = join(dirPath, "test-5.json");
  await mkdirp(dirPath);
  await writeJson(filePath, { hello: "hello" });
  <any>await translateFile(filePath, "fr", true, "en", translationCache);
  const translated = await readJson(filePath);
  expect(translated.hello.toLowerCase().trim()).toBe("bonjour");
});

test("generate translations", async () => {
  const dirPath = join(testRoot, "files");
  const filePath = join(dirPath, "en.json");
  await mkdirp(dirPath);
  await writeJson(filePath, { hello: "hello" });
  <any>await generate(filePath, ["nl", "de"], translationCache);
  const translated = await readJson(join(filePath, "..", "nl.json"));
  expect(translated.hello.toLowerCase().trim()).toBe("hallo");
});
