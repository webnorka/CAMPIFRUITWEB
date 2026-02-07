/**
 * D4 — Structured Error Reporting
 *
 * Centralises all error logging with structured context.
 * In DEV  → pretty-prints to console with colour coding.
 * In PROD → could POST to an endpoint (future-proofed).
 */

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

/**
 * Report an error with structured context.
 * @param {Error|string} error  — the error object or message
 * @param {{ component?: string, action?: string, meta?: object }} ctx
 */
export function reportError(error, ctx = {}) {
    const payload = {
        ts: new Date().toISOString(),
        component: ctx.component || 'unknown',
        action: ctx.action || 'unknown',
        message: error instanceof Error ? error.message : String(error),
        ...(error instanceof Error && isDev ? { stack: error.stack } : {}),
        ...(ctx.meta ? { meta: ctx.meta } : {}),
    };

    if (isDev) {
        console.error(
            `%c[${payload.component}] %c${payload.action}`,
            'color: #e74c3c; font-weight: bold',
            'color: #f39c12',
            payload.message,
            ctx.meta || '',
        );
    } else {
        // Production: structured log (could POST to endpoint in future)
        console.error(JSON.stringify(payload));
    }

    return payload;
}

/**
 * React hook that returns a scoped reporter for a specific component.
 * Usage: const report = useErrorReporter('ProductsContext');
 *        report('fetchProducts', error, { id: 42 });
 */
export function useErrorReporter(componentName) {
    return (action, error, meta) =>
        reportError(error, { component: componentName, action, meta });
}
