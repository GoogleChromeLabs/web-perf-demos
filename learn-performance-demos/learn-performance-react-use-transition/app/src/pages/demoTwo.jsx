import * as React from "react";

import Search from "../components/searchOptimized";

export default function DemoTwo() {
  const [initial, setInitial] = React.useState([]);

  React.useEffect(() => {
    // fetch and store the data in memory
    const initial = fetch(
      "https://cdn.glitch.global/4e458c4e-d71c-4d34-abec-2df68f83a5d9/data.json?v=1698334284289",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => setInitial(data));
  }, []);

  return (
    <div className="wrapper">
      <h2>
        Concurrent Mode with <code>useTransition</code>
      </h2>
      <p>
        This demo features a <code>Search</code> component that filters a list
        of 6000 records on each <code>keyup</code> and returns the most relevant
        30 results. This will cause the main thread to block while React updates
        and renders the components.
      </p>
      <div className="demo">
        <Search data={initial} />
      </div>
      <p>
        If you observe the performance tab, you can notice the interaction
        duration is much shorter than in the previous demo.
      </p>
      <p>
        <img
          src="https://cdn.glitch.global/4e458c4e-d71c-4d34-abec-2df68f83a5d9/Learn%20Performance%20-%20React%20Concurrent%20Mode%20-%20useTransition.png?v=1698395069750"
          alt="Chrome DevTools Performance panel showing a Keyboard interaction and two long tasks."
          width="891"
          height="481"
          loading="lazy"
        />
      </p>
      <p>
        In the performance panel above, the <i>Keyboard</i> interaction is no
        longer bound to the long task and the browser yields to the main thread
        almost immediately. This makes the user interface feel snappy and
        responsive.
      </p>
      <p>
        <details>
          <summary>View Source Code</summary>
          <pre>
            <code>{`export default function Search({ data }) {
  const [isPending, startTransition] = React.useTransition();
  const [searchTerm, setSearchTerm] = React.useState();
  
  const handleKeyUp = React.useCallback((n) => {
    startTransition(() => {
      setSearchTerm(n.target.value.toLowerCase());
    })
  });

  return (
    <>
      <div className="input-pane">
        <input
          type="text"
          onKeyUp={handleKeyUp}
        />
      </div>
      <SearchResults searchTerm={searchTerm} data={data} isPending={isPending} />
    </>
  );
}`}</code>
          </pre>
        </details>
      </p>
    </div>
  );
}
