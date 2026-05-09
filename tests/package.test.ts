const packageJson = require("../package.json");

test("declares modules needed by production installs", () => {
  expect(packageJson.dependencies).toHaveProperty("dotenv");
  expect(packageJson.dependencies).toHaveProperty("mkdirp");
  expect(packageJson.devDependencies || {}).not.toHaveProperty("dotenv");
});
