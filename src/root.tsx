import "./index.css";
import viteLogo from "/vite.svg";
import { getServerCounter, updateServerCounter } from "./action.tsx";
import reactLogo from "./assets/react.svg";
import { ClientCounter } from "./client.tsx";

const modules: any = import.meta.glob("./data/*.txt", {
  eager: true,
  query: "?raw",
});

export async function getStaticPaths() {
  return ["a", "b", "c", "d", "e", "f", "g"];
}

export function Root({ url }: { url: URL }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite + RSC</title>
      </head>
      <body>
        {url.pathname === "/" ? (
          <App />
        ) : ["/a", "/b", "/c", "/d", "/e", "/f", "/g"].includes(
            url.pathname
          ) ? (
          <Doc url={url} />
        ) : (
          <div>Not found</div>
        )}
      </body>
    </html>
  );
}

function Doc({ url }: { url: URL }) {
  return <div>{modules[`./data/${url.pathname.slice(1)}.txt`].default}</div>;
}

function App() {
  return (
    <div id="root">
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a
          href="https://react.dev/reference/rsc/server-components"
          target="_blank"
        >
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + RSC</h1>
      <div className="card">
        <ClientCounter />
      </div>
      <div className="card">
        <form action={updateServerCounter.bind(null, 1)}>
          <button>Server Counter: {getServerCounter()}</button>
        </form>
      </div>
      <ul className="read-the-docs">
        <li>
          Edit <code>src/client.tsx</code> to test client HMR.
        </li>
        <li>
          Edit <code>src/root.tsx</code> to test server HMR.
        </li>
        <li>
          Visit{" "}
          <a href="/?__rsc" target="_blank">
            <code>/?__rsc</code>
          </a>{" "}
          to view RSC stream payload.
        </li>
        <li>
          Visit{" "}
          <a href="/?__nojs" target="_blank">
            <code>/?__nojs</code>
          </a>{" "}
          to test server action without js enabled.
        </li>
      </ul>
    </div>
  );
}
