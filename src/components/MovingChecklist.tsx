"use client";

import { useState } from "react";

const items = [
  "Confirm your moving date and both addresses",
  "Create an inventory of furniture and belongings",
  "Check parking, loading access, stairs and lifts",
  "Ask building management about moving requirements",
  "Arrange boxes and label them by room",
  "Set aside documents, keys and daily essentials",
  "Confirm agreed services and written quotation",
  "Prepare access and pathways for moving day",
];

export default function MovingChecklist() {
  const [checked, setChecked] = useState<boolean[]>(items.map(() => false));
  const complete = checked.filter(Boolean).length;
  return <div className="checklist-panel"><div className="checklist-progress"><span>{complete} of {items.length} complete</span><div><i style={{ width: `${complete / items.length * 100}%` }} /></div></div><ul>{items.map((item, index) => <li key={item}><label><input type="checkbox" checked={checked[index]} onChange={(event) => setChecked((current) => current.map((value, i) => i === index ? event.target.checked : value))} /><span>{item}</span></label></li>)}</ul><p className="disclaimer">Checklist progress is stored only in this page session and is not saved to an account.</p></div>;
}
