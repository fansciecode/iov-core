const packageJson = require("./package.json");

module.exports = {
  src: ["./src"],
  out: "docs",
  exclude: "**/*.spec.ts",
  target: "es6",
  name: `${packageJson.name} Documentation`,
  readme: "api.md",
  mode: "file",
  excludePrivate: true,
  excludeNotExported: true,
  // this pulls in all dependencies
  includeDeclarations: true,
  // TODO: tweak this so we can ignore non iov (mono-repo) imports
  excludeExternals: false,
  externalPattern: "^((?!iov).)*$",
}
