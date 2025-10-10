/**
 * SDK Type Extensions
 * Extends types from @ahomevilla-hotel/node-sdk with additional fields
 */

import type { Location } from './location';

/**
 * Extend BranchDetail type to include location field
 */
declare module '@ahomevilla-hotel/node-sdk' {
  interface BranchDetail {
    /** Geographic location with coordinates and Place ID */
    location?: Location;
  }
}

export {};
