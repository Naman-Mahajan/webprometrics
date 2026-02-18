/**
 * CommonJS Entry Point for LiteSpeed Web Server
 * 
 * LiteSpeed requires a CommonJS module as entry point.
 * This wrapper loads the ES Module server dynamically.
 */

(async () => {
    try {
        console.log('[LSWS Wrapper] Loading ES Module server...');
        
        // Dynamically import the ES Module
        const app = await import('./server.js');
        
        console.log('[LSWS Wrapper] Server module loaded successfully');
        
        // Export for LiteSpeed
        module.exports = app;
    } catch (error) {
        console.error('[LSWS Wrapper] Failed to load server module:', error);
        process.exit(1);
    }
})();
