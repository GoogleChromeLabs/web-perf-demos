import * as React from "react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="wrapper">
      <h2>Welcome</h2>
      <div>
        <p>
          Welcome to this demo - part of the{" "}
          <a href="https://web.dev/learn/performance/">
            web.dev Learn Performance
          </a>{" "}
          series. During this demo we will be covering React's Concurrent Mode.
        </p>
        <p>
          The source code for this demo
          <a href="https://github.com/GoogleChromeLabs/web-perf-demos/tree/main/learn-performance-demos/learn-performance-react-use-transition">
            is available on GitHub</a>.
        </p>
        <p>
          Use the pane on the left to navigate through the different demos, or
          click the <i>Start</i> button below.
        </p>
      </div>
    </div>
  );
}
