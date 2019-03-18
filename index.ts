import { config } from "dotenv";
config();

import { Translate } from "@google-cloud/translate";
const googleTranslate = new Translate({
  projectId: process.env.PROJECT_ID,
  key: process.env.API_KEY
});

const translate = async (term: string, lang: string) => {
  const translation = await googleTranslate.translate(term, lang);
  if (translation.length) return translation[0];
  throw new Error("unable to translate term");
};

export { translate };
