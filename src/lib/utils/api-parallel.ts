import { z } from 'zod';

/**
 * Type-safe parallel fetch utility for executing multiple async functions in parallel
 *
 * @example
 * ```typescript
 * const [user, posts, comments] = await parallelFetch([
 *   () => fetchUser(userId),
 *   () => fetchPosts(userId),
 *   () => fetchComments(userId),
 * ]);
 * ```
 */
// export async function parallelFetch<T extends readonly unknown[]>(
//   requests: { [K in keyof T]: () => Promise<T[K]> }
// ): Promise<T> {
//   return Promise.all(requests.map((request) => request())) as Promise<T>;
// }

/**
 * Parallel API fetch utility for fetching multiple API routes simultaneously
 *
 * @example
 * ```typescript
 * const [stats, categories, user] = await parallelApiFetch([
 *   '/api/home/stats',
 *   '/api/categories',
 *   '/api/user/profile',
 * ]);
 * ```
 */
export async function parallelApiFetch(endpoints: string[]): Promise<unknown[]> {
  const responses = await Promise.all(
    endpoints.map((endpoint) =>
      fetch(endpoint, {
        cache: 'no-store', // Always fetch fresh data
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
        }
        return res.json();
      })
    )
  );

  return responses;
}

/**
 * Type-safe parallel API fetch with Zod validation
 *
 * @example
 * ```typescript
 * const statsSchema = z.object({ currentStreak: z.number() });
 * const categoriesSchema = z.array(z.object({ id: z.string() }));
 *
 * const [stats, categories] = await parallelApiFetchWithTypes([
 *   { url: '/api/home/stats', validator: statsSchema },
 *   { url: '/api/categories', validator: categoriesSchema },
 * ]);
 * ```
 */
export async function parallelApiFetchWithTypes<
  T extends Array<{ url: string; validator?: z.ZodSchema }>
>(
  requests: T
): Promise<{
  [K in keyof T]: T[K] extends { validator: z.ZodSchema<infer U> }
    ? U
    : T[K] extends { validator?: undefined }
      ? unknown
      : unknown;
}> {
  const responses = await Promise.all(
    requests.map(async ({ url, validator }) => {
      const response = await fetch(url, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }

      const data = await response.json();

      if (validator) {
        return validator.parse(data);
      }

      return data;
    })
  );

  return responses as {
    [K in keyof T]: T[K] extends { validator: z.ZodSchema<infer U> }
      ? U
      : T[K] extends { validator?: undefined }
        ? unknown
        : unknown;
  };
}

/**
 * Parallel fetch with error handling
 * Continues even if some requests fail, returning errors in the results
 *
 * @example
 * ```typescript
 * const results = await parallelFetchWithErrors([
 *   () => fetchUser(userId),
 *   () => fetchPosts(userId),
 * ]);
 *
 * results.forEach((result) => {
 *   if (result.success) {
 *     console.log(result.data);
 *   } else {
 *     console.error(result.error);
 *   }
 * });
 * ```
 */
export async function parallelFetchWithErrors<T extends readonly unknown[]>(
  requests: { [K in keyof T]: () => Promise<T[K]> }
): Promise<{
  [K in keyof T]: { success: true; data: T[K] } | { success: false; error: Error };
}> {
  const results = await Promise.allSettled(
    requests.map((request) => request())
  );

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return { success: true as const, data: result.value };
    } else {
      return { success: false as const, error: result.reason as Error };
    }
  }) as {
    [K in keyof T]: { success: true; data: T[K] } | { success: false; error: Error };
  };
}

