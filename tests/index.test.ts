import { translate } from "../index";

test("translate a word", async () => {
    const translated = await translate("hello", "fr");
    expect(translated.toLowerCase().trim()).toBe("bonjour");
});
