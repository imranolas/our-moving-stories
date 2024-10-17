const grok = require("groq");
const BlocksToMarkdown = require("@sanity/block-content-to-markdown");
const client = require("../utils/sanity-client");

async function get() {
  // get settings by id
  const query = grok`*[_type == "settings" && _id == "settings"] `;

  const settings = await client.fetch(query);

  return settings[0];
}

module.exports = get;
