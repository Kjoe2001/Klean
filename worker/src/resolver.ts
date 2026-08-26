/* ============================================================================
 * The resolver boundary.
 *
 * Everything downstream of this file — branding, encoding, storage, credits —
 * is implemented and works. This file defines the ONE thing the pipeline needs
 * and does not ship: turning a post URL into a playable media file on disk.
 *
 * Zelvoo does not include a resolver implementation. You supply one, and the
 * choice carries real consequences you own:
 *
 *   - Fetching media from YouTube, Meta, TikTok and LinkedIn is against those
 *     platforms' terms of service. They block datacentre IPs aggressively and
 *     change their delivery constantly, so any implementation is a maintenance
 *     commitment, not a one-off.
 *   - Whatever this returns gets your logo burned into it and handed to a user.
 *     If the source was not theirs to reuse, Zelvoo's mark is the one on it.
 *     The rights acknowledgement recorded at intake is what you will point to.
 *
 * Two shapes fit behind this interface:
 *   1. A local extraction binary you run yourself (you wear the blocking, the
 *      IP reputation, and the upkeep).
 *   2. A third-party extraction API (you rent it; their terms sit between you
 *      and the platform, and they carry the operational burden).
 *
 * Implement resolve() for whichever you pick and register it in getResolver().
 * ==========================================================================*/

export type Quality = '1080p' | '720p' | '480p' | 'audio';

export interface ResolveRequest {
  url: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'linkedin';
  quality: Quality;
  /** Reject anything longer than this, in seconds. */
  maxDurationS: number;
  /** Directory the resolver may write into. Cleaned up by the caller. */
  workDir: string;
  /** Aborts when the job is cancelled or the worker shuts down. */
  signal: AbortSignal;
}

export interface ResolveResult {
  /** Absolute path to the downloaded media file. */
  filePath: string;
  /** Container/extension, e.g. 'mp4', 'webm', 'm4a'. */
  ext: string;
  title?: string;
  durationS?: number;
  width?: number;
  height?: number;
}

/** Failure codes the studio knows how to explain to a user. Anything a
 *  resolver throws that is not one of these is reported as 'resolver'. */
export type ResolveErrorCode =
  | 'unavailable'   // private, deleted, geo- or age-restricted
  | 'unsupported'   // a post type this resolver cannot handle
  | 'too_long'      // exceeds maxDurationS
  | 'blocked'       // the platform refused this request (IP block, challenge)
  | 'resolver';     // anything else

export class ResolveError extends Error {
  code: ResolveErrorCode;
  constructor(code: ResolveErrorCode, message: string) {
    super(message);
    this.name = 'ResolveError';
    this.code = code;
  }
}

export interface VideoResolver {
  readonly name: string;
  resolve(req: ResolveRequest): Promise<ResolveResult>;
}

/* -------------------------------------------------------------------------
 * Shipped default: refuses every job, loudly and cheaply.
 *
 * Jobs fail with error_code='resolver', the worker refunds the credit, and the
 * studio shows "Could not retrieve this video. Credit refunded." Nothing is
 * silently broken and no user is charged while this is the active resolver.
 * ---------------------------------------------------------------------- */
class NullResolver implements VideoResolver {
  readonly name = 'none';
  async resolve(_req: ResolveRequest): Promise<ResolveResult> {
    throw new ResolveError(
      'resolver',
      'No resolver is configured. Set RESOLVER and implement one in src/resolver.ts.',
    );
  }
}

/* -------------------------------------------------------------------------
 * Your implementations go here.
 *
 * A local-binary adapter looks roughly like:
 *
 *   class LocalResolver implements VideoResolver {
 *     readonly name = 'local';
 *     async resolve(req: ResolveRequest): Promise<ResolveResult> {
 *       // 1. spawn your extraction tool with req.url and a format matching
 *       //    req.quality, writing into req.workDir, honouring req.signal
 *       // 2. probe the output for duration; throw ResolveError('too_long')
 *       //    if it exceeds req.maxDurationS
 *       // 3. map the tool's failure output onto ResolveErrorCode so the studio
 *       //    can explain it — private/deleted -> 'unavailable', a challenge or
 *       //    429 -> 'blocked'
 *       // 4. return { filePath, ext, title, durationS, width, height }
 *     }
 *   }
 *
 * An API adapter is the same contract: POST req.url to RESOLVER_ENDPOINT with
 * RESOLVER_API_KEY, stream the response body to a file under req.workDir, and
 * map their error codes onto ResolveErrorCode.
 * ---------------------------------------------------------------------- */

export function getResolver(): VideoResolver {
  const kind = (process.env.RESOLVER || 'none').toLowerCase();

  switch (kind) {
    case 'none':
      return new NullResolver();

    case 'local':
    case 'api':
      throw new Error(
        `RESOLVER=${kind} is selected but no implementation is registered. ` +
        'Implement it in src/resolver.ts and return it from getResolver().',
      );

    default:
      throw new Error(`Unknown RESOLVER "${kind}". Expected one of: none, local, api.`);
  }
}
