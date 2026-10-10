import { LocationCoordinates } from '../../types.js';

const DOC_ID_ENV_NAMES = {
  LOCATION: 'FACEBOOK_LOCATION_DOC_ID',
  SEARCH: 'FACEBOOK_SEARCH_DOC_ID',
  DETAIL_PHOTOS: 'FACEBOOK_DETAIL_PHOTOS_DOC_ID',
  DETAIL_INFO: 'FACEBOOK_DETAIL_INFO_DOC_ID',
} as const;

const DEFAULT_DOC_IDS = {
  LOCATION: '5585904654783609',
  SEARCH: '27517490627932547',
  DETAIL_PHOTOS: '10059604367394414',
  DETAIL_INFO: '26090240497332612',
} as const;

function getDocId(envName: string, fallback: string): string {
  const value = process.env[envName];
  return value && value.trim() ? value.trim() : fallback;
}

export const LOCATION_DOC_ID = getDocId(DOC_ID_ENV_NAMES.LOCATION, DEFAULT_DOC_IDS.LOCATION);
export const SEARCH_DOC_ID = getDocId(DOC_ID_ENV_NAMES.SEARCH, DEFAULT_DOC_IDS.SEARCH);
export const DETAIL_PHOTOS_DOC_ID = getDocId(
  DOC_ID_ENV_NAMES.DETAIL_PHOTOS,
  DEFAULT_DOC_IDS.DETAIL_PHOTOS
);
export const DETAIL_INFO_DOC_ID = getDocId(
  DOC_ID_ENV_NAMES.DETAIL_INFO,
  DEFAULT_DOC_IDS.DETAIL_INFO
);

export const DEFAULT_RADIUS_MILES = 25;
const MAX_RADIUS_MILES = 500;
const KM_PER_MILE = 1.609;
export const API_PAGE_SIZE = 24;

// Max price value Facebook uses as "no upper limit"
const MAX_PRICE_SENTINEL = 214748364700;

export interface PriceBounds {
  minPrice?: number;
  maxPrice?: number;
}

export function clampRadius(radiusMiles: number | undefined): number {
  if (!radiusMiles || radiusMiles <= 0) return DEFAULT_RADIUS_MILES;
  return Math.min(radiusMiles, MAX_RADIUS_MILES);
}

export function locationVariables(query: string): string {
  return JSON.stringify({
    params: {
      caller: 'MARKETPLACE',
      page_category: ['CITY', 'SUBCITY', 'NEIGHBORHOOD', 'POSTAL_CODE'],
      query,
    },
  });
}

// Facebook's own client sends every field below; leaving the newer ones
// out makes the query return data-less story stubs.
export function searchVariables(
  query: string,
  coords: LocationCoordinates,
  limit: number,
  { minPrice, maxPrice }: PriceBounds,
  radiusMiles: number = DEFAULT_RADIUS_MILES
): string {
  return JSON.stringify({
    buyLocation: { latitude: coords.latitude, longitude: coords.longitude },
    contextual_data: null,
    count: Math.min(limit, API_PAGE_SIZE),
    cursor: null,
    params: {
      bqf: {
        callsite: 'COMMERCE_MKTPLACE_WWW',
        query,
      },
      browse_request_params: {
        commerce_enable_local_pickup: true,
        commerce_enable_shipping: true,
        commerce_search_and_rp_available: true,
        commerce_search_and_rp_category_id: [],
        commerce_search_and_rp_condition: null,
        commerce_search_and_rp_ctime_days: null,
        filter_location_latitude: coords.latitude,
        filter_location_longitude: coords.longitude,
        filter_price_lower_bound: minPrice ?? 0,
        filter_price_upper_bound: maxPrice ?? MAX_PRICE_SENTINEL,
        filter_radius_km: Math.round(radiusMiles * KM_PER_MILE),
      },
      custom_request_params: {
        browse_context: null,
        contextual_filters: [],
        referral_code: null,
        referral_ui_component: null,
        saved_search_strid: null,
        search_vertical: 'C2C',
        seo_url: null,
        serp_landing_settings: { virtual_category_id: '' },
        surface: 'SEARCH',
        virtual_contextual_filters: [],
      },
    },
    savedSearchID: null,
    savedSearchQuery: query,
    scale: 2,
    shouldDeferNonCritical: false,
    shouldIncludePopularSearches: false,
    topicPageParams: { location_id: null, url: null },
    __relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider: true,
  });
}

export function searchPageUrl(
  pageId: string,
  query: string,
  { minPrice, maxPrice }: PriceBounds,
  radiusMiles: number
): string {
  const search = new URLSearchParams({ query });
  if (minPrice != null) search.set('minPrice', String(minPrice));
  if (maxPrice != null) search.set('maxPrice', String(maxPrice));
  search.set('radius', String(Math.round(radiusMiles)));
  return `https://www.facebook.com/marketplace/${pageId}/search?${search.toString()}`;
}

export function detailPhotosVariables(listingId: string): string {
  return JSON.stringify({ targetId: listingId });
}

export function detailInfoVariables(listingId: string): string {
  return JSON.stringify({
    targetId: listingId,
    scale: 2,
    feedbackSource: 56,
    feedLocation: 'MARKETPLACE_MEGAMALL',
    referralCode: 'marketplace_top_picks',
    enableJobEmployerActionBar: false,
    enableJobSeekerActionBar: false,
    useDefaultActor: false,
    __relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider: false,
    __relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider: false,
    __relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider: false,
    __relay_internal__pv__CometUFIShareActionMigrationrelayprovider: true,
    __relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider: false,
    __relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider: true,
    __relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider: true,
    __relay_internal__pv__IsWorkUserrelayprovider: false,
    __relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider: false,
  });
}
