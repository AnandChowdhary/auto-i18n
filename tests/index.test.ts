import { translate, translateFile } from "../index";
import { join } from "path";

test("translate a word", async () => {
    const translated = await translate("hello", "fr");
    expect(translated.toLowerCase().trim()).toBe("bonjour");
});

test("translating a file", async () => {
    const filePath = join(__dirname, "example.json");
    const translated = await translateFile(filePath, "fr");
    expect(translated.fr).toBeDefined();
});
