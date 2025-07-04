import * as React from "react";

import SearchResults from "./searchResultsYield";

export default function Search({ data }) {
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
          id="search"
          type="text"
          placeholder="Search..."
          autoComplete="off"
          onKeyUp={handleKeyUp}
        />
      </div>
      <SearchResults searchTerm={searchTerm} data={data} isPending={isPending} />
    </>
  );
}
