import { translate, translateObject, translateFile } from "../index";
import { join } from "path";

test("translate a word", async () => {
  const translated = await translate("hello", "fr");
  expect(translated.toLowerCase().trim()).toBe("bonjour");
});

test("invalid language would fail", () => {
  translate("hello", "xx")
    .then(() => {
      throw new Error("did not fail");
    })
    .catch(error => expect(error.message).toBe("invalid language: xx"));
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

test("translating a file", async () => {
  const filePath = join(__dirname, "example.json");
  const translated = await translateFile(filePath, "fr");
  expect(translated.fr).toBeDefined();
});
