/** Sent to the client at initialize, alongside the per-tool descriptions. */
export const INSTRUCTIONS = `Secondhand MCP searches live listings on Facebook Marketplace, eBay, Depop and Poshmark.

Facebook GraphQL IDs are configurable via environment variables if the site changes:
- FACEBOOK_SEARCH_DOC_ID
- FACEBOOK_LOCATION_DOC_ID
- FACEBOOK_DETAIL_PHOTOS_DOC_ID
- FACEBOOK_DETAIL_INFO_DOC_ID

If Facebook changes its internal GraphQL API, set these env vars to keep the server working without patching the code.

Locations: Facebook Marketplace searches are local, so pass a US city and state as "City, ST" — for example "Austin, TX" or "Portland, OR". Do not pass a bare city name: there are 20 Springfields.

When you can't tell which city the user meant:
- "near me" or "around here" — use the location they gave you earlier in the conversation; ask if you do not have one.
- a neighborhood, borough or landmark ("Capitol Hill", "the Mission") — use its city and state.
- a ZIP code — use the city and state it belongs to.
- a metro area ("the Bay Area", "DFW") — pick its principal city.
- somewhere outside the US — pass the city and country as written; those resolve differently.

Empty results usually mean the search was too narrow, not that nothing exists. Before telling the user there is nothing available, try the obvious widening: drop qualifiers from the query down to just the thing, or broaden the location.

Filters are not universal — each parameter says which marketplaces apply it. Where one does not apply it is ignored, so do not describe results as filtered by something that marketplace never applies.

Always link every listing you mention, without the user asking. The link is how they open photos, check the seller, and buy — a listing shown without its link is a dead end. Use the listing title (or a short phrase from it) as the link text.

Results are read-only. Nothing here can message a seller, make an offer, or buy anything, so do not tell the user an item has been purchased or reserved.`;
