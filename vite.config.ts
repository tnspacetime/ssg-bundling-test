import { cloudflare } from "@cloudflare/vite-plugin";
import rsc from "@vitejs/plugin-rsc";
import react from "@vitejs/plugin-react";
import { defineConfig, type ResolvedConfig, type Plugin } from "vite";
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { Readable } from "node:stream";
const RSC_POSTFIX = "_.rsc";

export default defineConfig({
  clearScreen: false,
  assetsInclude: ["**/*.txt"],
  build: {
    minify: false,
    emptyOutDir: process.env.BUILD_PHASE === "ssg",
  },
  define: {
    "process.env.BUILD_PHASE": JSON.stringify(
      process.env.BUILD_PHASE || "runtime"
    ),
  },

  plugins: [
    react(),
    rsc({
      entries: {
        client: "./src/framework/entry.browser.tsx",
        ssr: "./src/framework/entry.ssr.tsx",
      },
      serverHandler: false,
      loadModuleDevProxy: true,
    }),
    cloudflare({
      configPath: "./wrangler.jsonc",
      viteEnvironment: {
        name: "rsc",
      },
    }),
    rscSsgPlugin(),
    {
      name: "prune-glob-data",
      apply: "build",
      enforce: "pre",
      transform(code, id) {
        // If NOT in SSG phase, and the file is in /src/ (ignoring node_modules)
        if (process.env.BUILD_PHASE !== "ssg" && id.includes("/src/")) {
          // Find 'import.meta.glob(...)' and replace it with '{}'
          return {
            code: code.replace(/import\.meta\.glob\s*\([\s\S]*?\)/g, "{}"),
            map: null,
          };
        }
      },
    },
  ],
  environments: {
    client: {
      build: {
        emptyOutDir: process.env.BUILD_PHASE === "ssg",
      },
    },
    rsc: {
      build: {
        rollupOptions: {
          // ensure `default` export only in cloudflare entry output
          preserveEntrySignatures: "exports-only",
        },
      },
      optimizeDeps: {
        include: ["turbo-stream"],
      },
    },
    ssr: {
      keepProcessEnv: false,
      build: {
        // build `ssr` inside `rsc` directory so that
        // wrangler can deploy self-contained `dist/rsc`
        outDir: "./dist/rsc/ssr",
      },
      resolve: {
        noExternal: true,
      },
    },
  },
});

function rscSsgPlugin(): Plugin[] {
  return [
    {
      name: "rsc-ssg",
      config: {
        order: "pre",
        handler(_config, env) {
          return {
            appType: env.isPreview ? "mpa" : undefined,
            rsc: {
              serverHandler: env.isPreview ? false : undefined,
            },
          };
        },
      },
      buildApp: {
        async handler(builder) {
          if (process.env.BUILD_PHASE === "ssg") {
            await renderStatic(builder.config);
          }
        },
      },
    },
  ];
}

async function renderStatic(config: ResolvedConfig) {
  // import server entry
  const entryPath = path.join(config.environments.rsc.build.outDir, "index.js");
  const entry: typeof import("./src/framework/entry.rsc") = await import(
    pathToFileURL(entryPath).href
  );

  // entry provides a list of static paths
  const staticPaths = await entry.getStaticPaths();

  // render rsc and html
  const baseDir = config.environments.client.build.outDir;
  for (const staticPatch of staticPaths) {
    config.logger.info("[vite-rsc:ssg] -> " + staticPatch);
    const { html, rsc } = await entry.handleSsg(
      new Request(new URL(staticPatch, "http://ssg.local"))
    );
    await writeFileStream(
      path.join(baseDir, normalizeHtmlFilePath(staticPatch)),
      html
    );
    await writeFileStream(path.join(baseDir, staticPatch + RSC_POSTFIX), rsc);
  }
}

async function writeFileStream(filePath: string, stream: ReadableStream) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, Readable.fromWeb(stream as any));
}

function normalizeHtmlFilePath(p: string) {
  if (p.endsWith("/")) {
    return p + "index.html";
  }
  return p + ".html";
}
