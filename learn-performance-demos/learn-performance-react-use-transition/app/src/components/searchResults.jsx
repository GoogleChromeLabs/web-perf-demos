import * as React from "react";

// compare similarity between two strings
// source: https://github.com/stephenjjbrown/string-similarity-js
const stringSimilarity = (
  str1,
  str2,
  substringLength = 2,
  caseSensitive = false
) => {
  if (!caseSensitive) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
  }

  if (str1.length < substringLength || str2.length < substringLength) return 0;

  const map = new Map();
  for (let i = 0; i < str1.length - (substringLength - 1); i++) {
    const substr1 = str1.substr(i, substringLength);
    map.set(substr1, map.has(substr1) ? map.get(substr1) + 1 : 1);
  }

  let match = 0;
  for (let j = 0; j < str2.length - (substringLength - 1); j++) {
    const substr2 = str2.substr(j, substringLength);
    const count = map.has(substr2) ? map.get(substr2) : 0;
    if (count > 0) {
      map.set(substr2, count - 1);
      match++;
    }
  }

  return (match * 2) / (str1.length + str2.length - (substringLength - 1) * 2);
};

// filter the results by search term
const filterResults = (data, searchTerm, limit) => {
  return data
    .sort((a, b) => {
      const aName = `${a.firstName} ${a.lastName}`;
      const bName = `${b.firstName} ${b.lastName}`;
      return (
        stringSimilarity(bName, searchTerm) -
        stringSimilarity(aName, searchTerm)
      );
    })
    .slice(0, limit);
};

export default function SearchResults({ searchTerm, data, isPending }) {
  const [results, setResults] = React.useState([]);
  React.useEffect(() => {
    if (data && data.length && searchTerm) {
      setResults(filterResults(data, searchTerm, 30));
    }
  }, [searchTerm, data]);

  return (
    <div className={`results-pane ${isPending ? "loading" : ""}`}>
      {results && Boolean(results.length) && (
        <ul id="list">
          {results.map((n) => (
            <li key={n._id}>
              {n.firstName} {n.lastName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
