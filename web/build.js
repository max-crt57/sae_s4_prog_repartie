const esbuild = require('esbuild');

const watch = process.argv.includes('--watch');

const config = {
    entryPoints: ['ts/app.ts'],
    bundle: true,
    outfile: 'ts/app.js',
    platform: 'browser',
    format: 'iife',
    sourcemap: true
};

async function run() {
    if (watch) {
        const ctx = await esbuild.context(config);
        await ctx.watch();
        console.log("Watch activé");
    } else {
        await esbuild.build(config);
        console.log("Build terminé");
    }
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});