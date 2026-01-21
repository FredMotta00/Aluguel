
try {
    console.log('Starting module load test...');
    const start = Date.now();
    require('./functions/lib/index.js');
    console.log(`Module loaded successfully in ${Date.now() - start}ms`);
} catch (error) {
    console.error('Failed to load module:', error);
    process.exit(1);
}
