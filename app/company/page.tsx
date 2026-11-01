import type { Metadata } from "next";
import CompanyMap from "@/components/company/CompanyMap";
import "@/styles/company.css";
import "@/styles/sketch.css";

export const metadata: Metadata = {
  title: "Company map · Zariva.AI",
  description: "How Zariva.AI runs: six practices, thirty jobs, the AI agents behind them and the points where a person approves.",
};

export default function CompanyPage() {
  return <CompanyMap />;
}
