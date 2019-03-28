import { config } from "dotenv";
import { Translate } from "@google-cloud/translate";
import { readJson, writeJson, mkdirp } from "fs-extra";
import { dot, object } from "dot-object";
import { join } from "path";
import { languages } from "./languages";
import Fraud from "fraud";

config();
const googleTranslate = new Translate({
  projectId: process.env.PROJECT_ID,
  key: process.env.API_KEY
});

let fraud: Fraud;
const init = async (directory: string = ".cache/auto-i18n") => {
  if (fraud) return fraud;
  await mkdirp(directory);
  fraud = new Fraud({
    directory
  });
  await fraud.init();
  return fraud;
};

const translate = async (
  term: string,
  lang: string,
  directory?: string,
  forceUpdate: boolean = false,
  detailed: boolean = false
) => {
  const fraud = await init(directory);
  if (!languages.includes(lang)) throw new Error(`invalid language: ${lang}`);
  const cacheKey = `${lang}_${term}`;
  let exists = await fraud.exists(cacheKey);
  if (forceUpdate) exists = false;
  const detailResult = (text: string, from: string) =>
    detailed ? { text, from } : text;
  if (exists) {
    return detailResult(<string>await fraud.read(cacheKey), "cache");
  } else {
    const translation = await googleTranslate.translate(term, lang);
    if (!translation.length || !translation[0])
      throw new Error("unable to translate from api");
    const word =
      (term.charAt(0) === term.charAt(0).toUpperCase()) ?
        (translation.charAt(0).toUpperCase() + translation.slice(1)) :
        translation[0];
    await fraud.create(cacheKey, word);
    return detailResult(word, "api");
  }
};

const translateObject = async (
  originalObject: any,
  lang: string,
  directory?: string
) => {
  const dotted = dot(originalObject);
  for (let key of Object.keys(dotted)) {
    dotted[key] = await translate(dotted[key], lang, directory);
  }
  object(dotted);
  return dotted;
};

const translateFileSingle = async (
  fileUrl: string,
  lang: string[],
  write: boolean = false,
  from: string = "en",
  directory?: string
) => {
  let contents = await readJson(fileUrl);
  let isSingleFile = true;
  Object.keys(contents).forEach(key => {
    if (!languages.includes(key)) isSingleFile = false;
  });
  if (!isSingleFile) throw new Error("not single translation file");
  for (let singleLang of lang) {
    contents[singleLang] = await translateObject(
      contents[from],
      singleLang,
      directory
    );
  }
  if (write) await writeJson(fileUrl, contents);
  return contents;
};

const translateFile = async (
  fileUrl: string,
  lang: string,
  write: boolean = false,
  from: string = "en",
  directory?: string
) => {
  let contents = await readJson(fileUrl);
  let isSingleFile = true;
  Object.keys(contents).forEach(key => {
    if (!languages.includes(key)) isSingleFile = false;
  });
  if (isSingleFile) {
    contents = await translateFileSingle(
      fileUrl,
      [lang],
      write,
      from,
      directory
    );
  } else {
    contents = await translateObject(contents, lang, directory);
  }
  if (write) await writeJson(fileUrl, contents);
  return contents;
};

const generate = async (
  fileUrl: string,
  lang: string[],
  directory?: string
) => {
  for (let singleLang of lang) {
    const translated = await translateFile(
      fileUrl,
      singleLang,
      false,
      undefined,
      directory
    );
    writeJson(join(fileUrl, "..", `${singleLang}.json`), translated);
  }
};

export {
  translate,
  translateObject,
  translateFile,
  translateFileSingle,
  generate
};
