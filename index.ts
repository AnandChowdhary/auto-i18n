import { config } from "dotenv";
import { Translate } from "@google-cloud/translate";
import { readJson, writeJson } from "fs-extra";

config();
const googleTranslate = new Translate({
  projectId: process.env.PROJECT_ID,
  key: process.env.API_KEY
});

const translate = async (term: string, lang: string) => {
  const translation = await googleTranslate.translate(term, lang);
  if (translation.length) return translation[0];
  throw new Error("unable to translate term");
};

const translateFile = async (
  fileUrl: string,
  lang: string,
  write: boolean = false
) => {
  const contents = await readJson(fileUrl);
  contents[lang] = { example: true };
  if (write) await writeJson(fileUrl, contents);
  return contents;
};

export { translate, translateFile };
