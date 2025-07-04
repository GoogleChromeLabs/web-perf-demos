import * as React from "react";

import Search from "../components/searchYield";

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
      <h2>Yielding and Concurrent Mode</h2>
      <p>
        In the previous example—even if React is yielding to the main thread
        while processing the state changes—interacting with the page when the
        page is processing the <code>filterResults</code> long task will result
        in an unresponsive UI.
      </p>
      <p>
        This demo, in addition to using <code>useTransition</code>, yields every
        50 milliseconds while processing <code>filterResults</code>. This allows
        the browser to break down the long task into smaller tasks and handle
        user input and render critical updates.
      </p>
      <div className="demo">
        <Search data={initial} />
      </div>
      <p>
        If you observe the performance tab, you can observe that the{" "}
        <code>filterResults</code> function is spread over multiple tasks and
        the browser yields to the main thread immediately after user
        interaction.
      </p>
      <p>
        <img
          src="https://cdn.glitch.global/4e458c4e-d71c-4d34-abec-2df68f83a5d9/Learn%20Performance%20-%20React%20Concurrent%20Mode%20-%20Yielding.png?v=1698399464526"
          alt="Chrome DevTools Performance panel showing a Keyboard interaction and two long tasks."
          width="891"
          height="481"
          loading="lazy"
        />
      </p>
      <p>
        In the performance panel above, the <i>filterResults</i> function is
        processed over two tasks.
      </p>
      <details>
        <summary>View Source Code</summary>
        <pre>
          <code>{`function yieldToMain() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
          
// filter and limit the results by search term
const filterResults = async (data, searchTerm, limit) => {
  // set a 50ms deadline
  let deadline = performance.now() + 50;

  const sortedData = await Promise.all(
    data.map(async (n) => {
      // yield every 50ms
      if (performance.now() >= deadline) {
        // update the deadline
        deadline = performance.now() + 50;

        await yieldToMain();
      }

      const name = n.firstName + " " n.lastName;
      return { ...n, similarityScore: stringSimilarity(name, searchTerm) };
    })
  );

  return sortedData
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
};`}</code>
        </pre>
      </details>
    </div>
  );
}
