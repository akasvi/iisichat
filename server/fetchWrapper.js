async function getFetch() {
  const { default: fetch } = await import("node-fetch");
  return fetch;
}

module.exports = { getFetch };
