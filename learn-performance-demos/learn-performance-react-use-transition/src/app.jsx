import React, { useState, useEffect } from "react";
import { Router, Link } from "wouter";

import "./styles/styles.css";

import Nav from "./components/nav.jsx";
import PageRouter from "./components/router.jsx";

export default function Home() {
  return (
    <div className="content">
      <div className="title">
        <h1>Learn Performance - React Concurrent Mode</h1>
      </div>
      <Router>
        <Nav />
        <main>
          <PageRouter />
        </main>
      </Router>
    </div>
  );
}
