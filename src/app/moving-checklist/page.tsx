import Link from "next/link";
import type { Metadata } from "next";
import MovingChecklist from "@/components/MovingChecklist";

export const metadata: Metadata = { title: "London moving checklist", description: "An interactive moving checklist to help organise dates, access, belongings and moving-day essentials." };

export default function MovingChecklistPage() {
  return <><section className="page-hero"><div className="container"><div className="breadcrumbs"><Link href="/">Home</Link> / Moving checklist</div><div className="eyebrow">Your moving checklist</div><h1>Get organised for moving day</h1><p>Work through these planning reminders at your own pace. Adapt them to your move, property and schedule.</p></div></section><section className="section"><div className="container"><MovingChecklist /></div></section></>;
}
