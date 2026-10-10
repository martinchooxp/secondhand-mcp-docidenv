# Secondhand MCP

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that lets AI assistants search secondhand marketplaces. Search Facebook Marketplace, eBay, Depop, and Poshmark for used and refurbished items — with filters, photos, and full listing details.

Works with Claude Desktop, Claude Code, Cursor, and other clients that run MCP servers locally.

## Supported Marketplaces

| Marketplace | Auth Required | Notes |
|-------------|---------------|-------|
| Facebook Marketplace | No | Location-based search |
| eBay | Yes (API keys) | Official Browse API |
| Depop | No | Requires Chrome installed |
| Poshmark | No | Requires Chrome installed |

## Setup

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "secondhand": {
      "command": "npx",
      "args": ["-y", "github:martinchooxp/secondhand-mcp-docidenv"],
      "env": {
        "EBAY_CLIENT_ID": "your-ebay-client-id",
        "EBAY_CLIENT_SECRET": "your-ebay-client-secret",
        "EBAY_MARKETPLACE_ID": "EBAY_US"
      }
    }
  }
}
```

### Claude Code

Add to `~/.claude/.mcp.json`:

```json
{
  "mcpServers": {
    "secondhand": {
      "command": "npx",
      "args": ["-y", "github:martinchooxp/secondhand-mcp-docidenv"],
      "env": {
        "EBAY_CLIENT_ID": "your-ebay-client-id",
        "EBAY_CLIENT_SECRET": "your-ebay-client-secret",
        "EBAY_MARKETPLACE_ID": "EBAY_US"
      }
    }
  }
}
```

This will automatically download and run the latest version directly from the GitHub repository.

### Depop & Poshmark / Chrome Requirement

Depop and Poshmark require a headless browser. If **Google Chrome or Chromium** is installed on your system, both are automatically enabled — no config needed. If Chrome isn't found, they are silently disabled and Facebook + eBay continue to work.

On macOS, the first time you search Depop or Poshmark, you may see a system prompt asking to allow Node.js to control Chrome. This is expected — puppeteer needs to launch Chrome in headless mode. Grant it and you're set.

The browser runs invisibly in the background and only launches when you actually search Depop or Poshmark.

## Configuration

### Choosing Marketplaces

By default all marketplaces are enabled. To limit which are active, set the `MARKETPLACES` env var (comma-separated):

```json
{
  "env": {
    "MARKETPLACES": "facebook,ebay"
  }
}
```

Valid values: `facebook`, `ebay`, `depop`, `poshmark`

### eBay API Keys

eBay uses the official [Browse API](https://developer.ebay.com/api-docs/buy/browse/overview.html). You need a free eBay developer account:

1. Create an account at [developer.ebay.com](https://developer.ebay.com)
2. Create an application to get a Client ID and Client Secret
3. Add them to your MCP config as `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET`

### eBay Marketplace / Region

By default the server targets the **US** eBay site. To search a different regional marketplace, set the `EBAY_MARKETPLACE_ID` environment variable:

```json
{
  "env": {
    "EBAY_MARKETPLACE_ID": "EBAY_DE"
  }
}
```

Common values:

| Value | Site |
|-------|------|
| `EBAY_US` | ebay.com (default) |
| `EBAY_DE` | ebay.de |
| `EBAY_GB` | ebay.co.uk |
| `EBAY_AU` | ebay.com.au |
| `EBAY_FR` | ebay.fr |
| `EBAY_IT` | ebay.it |
| `EBAY_ES` | ebay.es |
| `EBAY_CA` | ebay.ca |

The full list is available in the [eBay API docs](https://developer.ebay.com/api-docs/static/rest-request-components.html#marketpl).

### Facebook GraphQL doc_id Overrides

Facebook occasionally changes its internal GraphQL `doc_id` values. If Facebook Marketplace search or detail fetch stops working, you can override the built-in IDs with environment variables:

```json
{
  "env": {
    "FACEBOOK_SEARCH_DOC_ID": "27517490627932547",
    "FACEBOOK_LOCATION_DOC_ID": "5585904654783609",
    "FACEBOOK_DETAIL_PHOTOS_DOC_ID": "10059604367394414",
    "FACEBOOK_DETAIL_INFO_DOC_ID": "26090240497332612"
  }
}
```

If unset, the server uses the current built-in defaults. This allows you to keep the repo working without editing code when Facebook updates their internal API.

**Finding updated doc_id values:**

1. Open your browser DevTools and navigate to facebook.com/marketplace
2. Open the Console tab
3. Paste the script from `scripts/capture-detail-docid.js` and press Enter
4. Click on any listing to view its detail page
5. Watch the console — it will log all GraphQL requests with their `doc_id` values
6. Look for the ones marked as `[MATCH]` (with DESCRIPTION, PHOTOS, CONDITION)
7. Copy the `doc_id` values and set them as environment variables above

## Tools

### `search_marketplace`

Search for items across marketplaces.

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `query` | Yes | | Search terms |
| `marketplace` | No | `facebook` | `facebook`, `ebay`, `depop`, `poshmark`, or `all` |
| `location` | No | `san francisco` | City to search in (Facebook only) |
| `radiusMiles` | No | `25` | Search radius in miles, up to 500 (Facebook only) |
| `maxPrice` | No | | Maximum price |
| `minPrice` | No | | Minimum price |
| `limit` | No | `20` | Max results |
| `showSold` | No | `false` | Include sold items (Facebook only) |
| `includeImages` | No | `false` | Include image URLs in output |
| `sort` | No | `relevance` | Sort order (Depop, Poshmark): `relevance`, `newest`, `most_popular`, `price_low_to_high`, `price_high_to_low` |
| `condition` | No | | Item condition. eBay: `new`, `like_new`, `good`, `fair`. Depop: `new`, `like_new`, `excellent`, `good`, `fair`, `used`. Poshmark: `new` (NWT), `like_new` (NWOT), `good`, `fair`, `poor` |
| `category` | No | | Product category. Depop: `tops`, `bottoms`, `dresses`, `coats-jackets`, `footwear`, `accessories`, `bags`, `jewellery`, `activewear`, `swimwear`. Poshmark: `Jackets_&_Coats`, `Dresses`, `Tops_&_Blouses`, `Pants`, `Shoes`, `Accessories`, `Sweaters`, etc. |
| `brand` | No | | Brand filter (Poshmark only): e.g. `"Nike"`, `"Levi's"`, `"Gucci"` |
| `department` | No | | Department filter (Poshmark only): `Women`, `Men`, `Kids` |
| `sizes` | No | | Size filter (Depop, Poshmark): e.g. `["S", "M", "L"]` or `["US 9", "US 10"]` |
| `colors` | No | | Color filter (Depop, Poshmark): `black`, `white`, `red`, `blue`, `green`, `yellow`, `orange`, `pink`, `purple`, `brown`, `grey`, `cream`, `multi`, `silver`, `gold` |

**Data returned per marketplace:**

| Field | Facebook | eBay | Depop | Poshmark |
|-------|----------|------|-------|----------|
| Title | Yes | Yes | Yes | Yes |
| Price | Yes | Yes | Yes | Yes |
| Location | City | City, State | — | — |
| Condition | — | Yes | — | — |
| Photo count | 1 thumbnail | 1 thumbnail | 1 thumbnail | 1 thumbnail |
| Seller | Yes | Yes | — | — |

### `get_listing_details`

Get full details for a specific listing using an ID from search results.

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `listingId` | Yes | | Listing ID from search results |
| `marketplace` | No | `facebook` | `facebook`, `ebay`, `depop`, or `poshmark` |

**Data returned per marketplace:**

| Field | Facebook | eBay | Depop | Poshmark |
|-------|----------|------|-------|----------|
| Description | Yes | Yes | Yes | Yes |
| All photos | Yes | Yes | Yes | Yes |
| Location | City | City, State, Country | — | — |
| Seller | Name | Username | Username | Username |
| Delivery types | Yes | — | — | — |
| Shipping | Yes/No | Service codes | Yes/No | Always included |

### `list_marketplaces`

List all enabled marketplaces and their status.

### `search` / `fetch` (deep research)

Convenience pair following the [ChatGPT Deep Research tool contract](https://developers.openai.com/api/docs/guides/deep-research) — exact names, a single string argument each:

- `search(query)` — searches every enabled marketplace at once and returns `{ results: [{ id, title, text, url }] }`, where `id` is `marketplace:listingId`
- `fetch(id)` — returns full listing details for a `search` result ID as `{ id, title, text, url, metadata }`

Useful for research-style clients that expect these standard tool names; for filtered searches use `search_marketplace`.

## How It Works

**Facebook Marketplace** — Searches listings by location, radius, price, and query. Resolves city names to coordinates. No login or browser needed. Facebook serves non-browser callers a gated version of the search API, so the server falls back to scraping the public search page when needed.

**eBay** — Uses the official eBay Browse API with OAuth 2.0 client credentials. Tokens are cached and auto-refreshed. The target regional marketplace is controlled by `EBAY_MARKETPLACE_ID` (defaults to US).

**Depop** — Uses a headless browser to search listings with support for category, condition, size, and color filters. The browser instance is shared across requests.

**Poshmark** — Uses a headless browser to search listings with support for condition, size, color, sort, and price filters. Poshmark is not location-based — all items ship nationally.

## Development

### Getting Started

```bash
git clone https://github.com/martinchooxp/secondhand-mcp-docidenv.git
cd secondhand-mcp-docidenv
npm install
npm run build
```

### Running Locally

To run the server locally from this repo checkout:

```bash
npm run start
```

Or in development mode (with live reload):

```bash
npm run dev
```

### Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Adding a Marketplace

1. Create a new file in `src/marketplaces/`
2. Extend `BaseMarketplace` and implement `search()` and optionally `getListingDetails()`
3. Add the constructor to `allMarketplaces` in `src/marketplaces/index.ts`

## Limitations

- **Facebook**: May break if Facebook changes their frontend or GraphQL schema (use env vars to override doc_id values)
- **eBay**: Requires developer API keys (free tier available)
- **Depop**: Requires Chrome/Chromium installed; slower than Facebook/eBay (~5s per search)
- **Poshmark**: Requires Chrome/Chromium installed; no official API so relies on page scraping
- **Rate limiting**: Don't make too many requests too quickly

## License

MIT
