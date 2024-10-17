const grok = require("groq");
const client = require("../utils/sanity-client");

async function getPages() {
  // Expand the person reference to get the full document
  const query = grok`*[_type == "page"] {
  ...,
  pageBuilder[] {
    ...,
    _type == "people" => {
      ...,
      people[]->
    }
  }
}`;

  const pages = await client.fetch(query);

  return pages;
}

module.exports = getPages;
