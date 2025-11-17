import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface ApiKeyModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: Readonly<ApiKeyModalProps>) {
	const { data: session } = useSession();
	const [currentKey, setCurrentKey] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isRegenerating, setIsRegenerating] = useState(false);
	const [copySuccess, setCopySuccess] = useState(false);

	const generateKeyMutation = api.key.generateKey.useMutation();
	const regenerateKeyMutation = api.key.regenerateKey.useMutation();

	useEffect(() => {
		if (session?.user?.id) {
			const storedKey = localStorage.getItem(
				`litellm-api-key-${session.user.id}`,
			);
			setCurrentKey(storedKey);
		}
	}, [session]);

	const handleGenerateKey = async () => {
		if (!session?.user?.id) return;

		setIsGenerating(true);
		try {
			const result = await generateKeyMutation.mutateAsync({
				key_alias: `admin-${session.user.id}`,
			});
			setCurrentKey(result.key);
			localStorage.setItem(`litellm-api-key-${session.user.id}`, result.key);
		} catch (error) {
			console.error("Failed to generate API key:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleRegenerateKey = async () => {
		if (!currentKey) return;

		setIsRegenerating(true);
		try {
			const result = await regenerateKeyMutation.mutateAsync({});
			setCurrentKey(result.key);
			localStorage.setItem(`litellm-api-key-${session?.user?.id}`, result.key);
		} catch (error) {
			console.error("Failed to regenerate API key:", error);
		} finally {
			setIsRegenerating(false);
		}
	};

	const handleCopyKey = async () => {
		if (!currentKey) return;

		try {
			await navigator.clipboard.writeText(currentKey);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		} catch (error) {
			console.error("Failed to copy API key:", error);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-slate-900">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-semibold text-lg text-slate-900 dark:text-white">
						API Key Management
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
						aria-label="Close modal"
					>
						<svg
							className="h-6 w-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<div className="space-y-4">
					{currentKey ? (
						<div>
							<label
								htmlFor="api-key-input"
								className="block font-medium text-slate-700 text-sm dark:text-slate-300"
							>
								Current API Key
							</label>
							<div className="mt-1 flex items-center space-x-2">
								<input
									id="api-key-input"
									type="text"
									value={currentKey}
									readOnly
									className="flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
								/>
								<button
									type="button"
									onClick={handleCopyKey}
									className={`rounded-md px-3 py-2 text-sm transition-colors ${
										copySuccess
											? "bg-green-500 text-white"
											: "bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
									}`}
								>
									{copySuccess ? "Copied!" : "Copy"}
								</button>
							</div>
						</div>
					) : (
						<p className="text-slate-600 text-sm dark:text-slate-400">
							No API key generated yet.
						</p>
					)}

					<div className="flex space-x-2">
						{!currentKey ? (
							<button
								type="button"
								onClick={handleGenerateKey}
								disabled={isGenerating}
								className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-sm text-white hover:bg-primary/90 disabled:opacity-50"
							>
								{isGenerating ? "Generating..." : "Generate API Key"}
							</button>
						) : (
							<button
								type="button"
								onClick={handleRegenerateKey}
								disabled={isRegenerating}
								className="flex-1 rounded-md bg-red-500 px-4 py-2 font-medium text-sm text-white hover:bg-red-600 disabled:opacity-50"
							>
								{isRegenerating ? "Regenerating..." : "Regenerate API Key"}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
