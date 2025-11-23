"use client";

import React from "react";
import { Layout } from "@/components/layout/Layout";
import { PositionsView } from "./components/PositionsView";
import { Position } from "@/types";
import { useRouter } from "next/navigation";

export default function PositionsPage() {
  const router = useRouter();

  const handleViewApplicants = (position: Position) => {
    router.push(`/hiring/applicants?position=${position.reqId}`);
  };

  return (
    <Layout>
      <PositionsView onViewApplicants={handleViewApplicants} />
    </Layout>
  );
}
//
