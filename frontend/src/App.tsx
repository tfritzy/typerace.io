import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import type { DbConnection, Person } from "../module_bindings";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import { TypeBox } from "./components/TypeBox";

function App() {
  const [count, setCount] = useState(0);

  const conn = useSpacetimeDB<DbConnection>();
  const { rows: persons, state } = useTable<DbConnection, Person>("person");

  return (
    <>
      <TypeBox phrase="the quick red fox jumps over the brown fence." />
    </>
  );
}

export default App;
