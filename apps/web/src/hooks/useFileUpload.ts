"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

type UploadOptions = {
	folder: "avatars" | "scripts";
};

export function useFileUpload() {
	const [isUploading, setIsUploading] = useState(false);

	const getUrlMutation = useMutation(trpc.file.getUploadLink.mutationOptions());

	const uploadFile = async (
		file: File,
		options: UploadOptions,
	): Promise<string> => {
		try {
			setIsUploading(true);

			const { url, key } = await getUrlMutation.mutateAsync({
				filename: file.name,
				contentType: file.type,
				folder: options.folder,
			});

			const response = await fetch(url, {
				method: "PUT",
				body: file,
				headers: {
					"Content-Type": file.type,
				},
			});

			if (!response.ok) {
				throw new Error(`Ошибка при загрузке в S3: ${response.statusText}`);
			}

			return key;
		} catch (error) {
			console.error("Ошибка в useFileUpload:", error);
			throw error;
		} finally {
			setIsUploading(false);
		}
	};

	return {
		uploadFile,
		isUploading,
	};
}
