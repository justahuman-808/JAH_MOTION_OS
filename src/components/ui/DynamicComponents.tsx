"use client";

import dynamic from "next/dynamic";

export const DynamicSnippetLibrary = dynamic(() => import("./SnippetLibrary").then(m => m.SnippetLibrary), { ssr: false });
export const DynamicWorkflowDiagram = dynamic(() => import("./WorkflowDiagram").then(m => m.WorkflowDiagram), { ssr: false });
export const DynamicKineticTypography = dynamic(() => import("./KineticTypography").then(m => m.KineticTypography), { ssr: false });
export const DynamicGrainOverlay = dynamic(() => import("./GrainOverlay").then(m => m.GrainOverlay), { ssr: false });
