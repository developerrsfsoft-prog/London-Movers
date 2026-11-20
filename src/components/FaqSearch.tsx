"use client";

import { useEffect, useMemo, useState } from "react";

type Props = { items: string[][] };

export default function FaqSearch({ items }: Props) {
  const [faqItems, setFaqItems] = useState(items);
  const [directoryError, setDirectoryError] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    fetch("/api/content/faqs").then(async (response) => {
      if (!response.ok) throw new Error("Unable to refresh the FAQ directory.");
      const result = await response.json() as { records?: Array<{ question: string; answer: string }> };
      if (result.records) setFaqItems(result.records.map(({ question, answer }) => [question, answer]));
    }).catch((error: unknown) => setDirectoryError(error instanceof Error ? error.message : "Unable to refresh the FAQ directory."));
  }, []);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return faqItems.filter(([question, answer]) => !term || `${question} ${answer}`.toLowerCase().includes(term));
  }, [faqItems, query]);

  return <>
    <label className="faq-search"><span>Search questions</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “packing”, “parking” or “quote”" /></label>
    {directoryError && <p className="error-message" role="status">{directoryError} Showing the saved FAQ snapshot instead.</p>}
    <p className="faq-result-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "answer" : "answers"}</p>
    <div className="faq-list">{filtered.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}{filtered.length === 0 && <p className="faq-no-results">No matching answers. Try another search term or contact us with your question.</p>}</div>
  </>;
}
