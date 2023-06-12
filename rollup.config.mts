import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import packageJson from './package.json' assert { type: 'json' };

const dependencyPkgName = "katex";
const dependencyVersion = /[0-9.]+$/.exec(
    packageJson.devDependencies[dependencyPkgName]
)[0];

/**
 * @param format Either 'module' or 'system'.
 * @param target Either 'es5' or 'es2015'
 * @returns 
 */
function createConfig(format: 'module' | 'system', target: 'es5' | 'es2015', minify: boolean) {
    const configDir = (format === "module" ? "esm" : format) + "/" + target;
    const plugins = [
        resolve({
            exportConditions: target === "es2015" ? ["es2015"] : undefined,
        }),
        commonjs()
    ];
    if (minify) {
        plugins.push(terser());
    }
    const banner = `/**
 * ${packageJson.name}@${packageJson.version} is a "${format}" format for ${dependencyPkgName}@${dependencyVersion}
 * © 2023 ${packageJson.author}
 * Released under the ${packageJson.license} License.
 */
`.trim();

    return {
        input: {
            // The key, "name", is used to generate the output file folder and file name in conjunction with entryFileNames.
            // The value is the path to the source code.
            "index": "./src/katex.js",
            "contrib/auto-render/index": "./src/katex-contrib-auto-render.js",
            "contrib/mhchem/index": "./src/katex-contrib-mchem.js",
        },
        output: [
            {
                // Placing the output in a "dist" folder makes it easier to clean up, but is also a bit less elegant to consume.
                dir: `${configDir}`,
                entryFileNames: `[name]${minify ? ".min" : ""}.js`,
                chunkFileNames: `shared${minify ? ".min" : ""}.js`,
                format,
                sourcemap: true,
                banner,
            }
        ],
        plugins
    };
}

export default [
    createConfig("module", "es5", false),
    createConfig("module", "es2015", false),
    createConfig("system", "es5", false),
    createConfig("system", "es2015", false),
    createConfig("module", "es5", true),
    createConfig("module", "es2015", true),
    createConfig("system", "es5", true),
    createConfig("system", "es2015", true),
];