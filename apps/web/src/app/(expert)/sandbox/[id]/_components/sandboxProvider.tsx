"use client";

import { createContext, useContext } from "react";
import { useSandbox } from "../_hooks/useSandbox";

type SandboxProviderProps = {
	children: React.ReactNode;
	scriptId: string;
};

type SandboxContextValue = ReturnType<typeof useSandbox>;

const SandboxContext = createContext<SandboxContextValue | null>(null);

export function SandboxProvider({ children, scriptId }: SandboxProviderProps) {
	const value = useSandbox(scriptId);

	return (
		<SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>
	);
}

export function useSandboxContext() {
	const context = useContext(SandboxContext);

	if (!context) {
		throw new Error("useSandboxContext must be used within SandboxProvider");
	}

	return context;
}
