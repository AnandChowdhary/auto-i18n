# 🌐 Auto I18N

[![Travis CI](https://img.shields.io/travis/AnandChowdhary/auto-i18n.svg)](https://travis-ci.org/AnandChowdhary/auto-i18n)
[![Coverage Status](https://coveralls.io/repos/github/AnandChowdhary/auto-i18n/badge.svg?branch=master&v=2)](https://coveralls.io/github/AnandChowdhary/auto-i18n?branch=master)
[![GitHub](https://img.shields.io/github/license/anandchowdhary/auto-i18n.svg)](https://github.com/AnandChowdhary/auto-i18n/blob/master/LICENSE)
![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/AnandChowdhary/auto-i18n.svg)
![NPM type definitions](https://img.shields.io/npm/types/auto-i18n.svg)
[![NPM](https://img.shields.io/npm/v/auto-i18n.svg)](https://www.npmjs.com/package/auto-i18n)

[![NPM](https://nodei.co/npm/auto-i18n.png)](https://www.npmjs.com/package/auto-i18n)

Auto I18N is a package which automagically translate your JSON files, objects, or strings using Google Translate. It's automating your internationalization.

## ⭐ Usage

Add the dependency from NPM:

```bash
npm install auto-i18n
```

Import the modules you require from the package:

```js
import * from "auto-i18n";
```

And then configure your Project ID and API key as environment variables (see [Configuration](#configuration)).

### Translating words

To translate a single phrase:

```js
import { translate } from "auto-i18n";
const hello = await translate("Hello!", "fr"); // Bonjour!
```

For every function, can also use promises:

```js
translate("Hello!", "nl")
  .then(translation => {
      console.log(translation); // Hallo!
  })
  .catch(error => {
      console.log("Got an error", error);
  });
```

### Translating objects

To translate an entire object:

```js
import { translateObject } from "auto-i18n";
const translateMe = {
    hello: "Hello",
    world: ["world", "earth"]
};
const translated = await translateObject(translateMe, "es");
console.log(translated);
/* { hello: "Hola",
     world: ["mundo", "tierra"] } */
```

### Translating a single-translation file

A single translation file is a JSON file which contains keys for language codes and terms under each key. You can write one for English like this, for example:

File `en.json`:

```json
{
    "en": {
        "greeting": "Hello!",
        "question": "How are you?"
    }
}
```

To translate it, use the `translateFileSingle` function:

```js
import { translateFileSingle } from "auto-i18n";
import path from "path"; // Node.js path helper
const filePath = path.join(__dirname, "en.json");
const translated = await translateFileSingle(filePath, ["fr", "nl", "es"]);
console.log(translated);
```

This is what `translated` looks like:

```json
{
    "en": {
        "greeting": "Hello!",
        "question": "How are you?"
    },
    "fr": {
        "greeting": "Bonjour!",
        "question": "Comment vas-tu?"
    },
    "nl": {
        "greeting": "Hallo!",
        "question": "Hoe gaat het met je?"
    },
    "es": {
        "greeting": "Hola!",
        "question": "¿Cómo estás?"
    }
}
```

You can also write the file directly by supplying the third parameter as `true`:

```js
await translateFileSingle(filePath, ["fr", "nl", "es"], true);
```

### Translation a regular JSON file

If you have a JSON file which is not a single-translation-file, you can also translate it:

```js
await translateFile(
    "en.json", /* File path */
    "nl", /* Language code (single) */
    false /* Overwrite the file with translation? */
);
```

### Generated translated files

If you have a JSON file (e.g., `en.json`), you can also generate corresponding language files:

```js
await generate(
    "en.json", /* File path */
    ["nl", "fr", "es"], /* Languages */
);
```

## 💡 Notes

### Caching

Auto I18N uses local caching powered by [Fraud](https://github.com/AnandChowdhary/fraud) to decrease API usage and therefore billing. A caching directory, `.cache/auto-i18n` is used, which should be added to your `.gitignore`. You can overwrite this directory as a parameter in each function.

### Configuration

Auto I18N uses the Google Cloud Translation API, for which an API key and Project ID are required. These should be available as environment variables in your `.env` file. For example:

```dotenv
PROJECT_ID = "google-cloud-project-id"
API_KEY = "google-cloud-api-key"
```

The library will automatically read them from the `.env` file, as long as it's in your project root directory.

## 🛠️ Development

Install dependencies:

```bash
yarn
```

Compile Typescript to ES6 before publishing to NPM:

```bash
yarn build
```

## 📝 License

MIT
