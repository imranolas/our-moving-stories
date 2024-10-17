const grok = require("groq");
const client = require("../utils/sanity-client");

async function get() {
  // Expand the person reference to get the full document
  const query = grok`*[_type == "event"] {
  ...,
  venue-> 
} | order(startDate desc)`;

  const venue = await client.fetch(query);
  return venue;
}

module.exports = get;
