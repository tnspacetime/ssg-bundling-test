# Vite + SSG + RSC + Cloudflare Workers 

This repo demonstrates ssg in a rsc environment that can be deployed on cloudflare, based on 
[examples/starter](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc/examples/starter) integrated with [`@cloudflare/vite-plugin`](https://github.com/cloudflare/workers-sdk/tree/main/packages/vite-plugin-cloudflare) and [ssg](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc/examples/ssg). 

It adds a special build command that shakes off static sources from the rsc bundle, helping the bundle to say small. 

```sh
# run dev server
npm run dev

# build for production and preview
npm run build
npm run preview
npm run release
```
