import * as React from "react";
import { Switch, Route, Router } from "wouter";
import Home from "../pages/home";
import DemoOne from "../pages/demoOne";
import DemoTwo from "../pages/demoTwo";
import DemoThree from "../pages/demoThree";

export default () => (
  <Switch>
    <Route path="/" component={Home} />
    <Route path="/1" component={DemoOne} />
    <Route path="/2" component={DemoTwo} />
    <Route path="/3" component={DemoThree} />
  </Switch>
);
