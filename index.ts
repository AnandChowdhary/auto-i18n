import { config } from "dotenv";
import { Translate } from "@google-cloud/translate";
import { readJson, writeJson } from "fs-extra";
import { dot, object } from "dot-object";
import { languages } from "./languages";

config();
const googleTranslate = new Translate({
  projectId: process.env.PROJECT_ID,
  key: process.env.API_KEY
});

const translate = async (term: string, lang: string) => {
  if (!languages.includes(lang)) throw new Error(`invalid language: ${lang}`);
  const translation = await googleTranslate.translate(term, lang);
  if (translation.length) return translation[0];
  throw new Error("unable to translate term");
};

const translateObject = async (originalObject: any, lang: string) => {
  const dotted = dot(originalObject);
  for (let key of Object.keys(dotted)) {
    dotted[key] = await translate(dotted[key], lang);
  }
  object(dotted);
  return dotted;
};

const translateFile = async (
  fileUrl: string,
  lang: string,
  from: string = "en",
  write: boolean = false
) => {
  if (!languages.includes(lang)) throw new Error(`invalid language: ${lang}`);
  const contents = await readJson(fileUrl);
  let isSingleLanguageFile = true;
  Object.keys(contents).forEach(key => {
    if (!languages.includes(key)) isSingleLanguageFile = false;
  });
  if (isSingleLanguageFile) {
    // Add new key to the translated file
  } else {
    // Generate a lang.json file
  }
  contents[lang] = { example: true };
  if (write) await writeJson(fileUrl, contents);
  // console.log("Returning", JSON.stringify(contents));
  return contents;
};

export { translate, translateObject, translateFile };
