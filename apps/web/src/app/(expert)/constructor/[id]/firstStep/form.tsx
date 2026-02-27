"use client";

import { useForm } from "@tanstack/react-form";
import type { SubmitEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group";

const formSchema = z.object({
	title: z.string().min(5).max(50),
	description: z.string().max(500),
});

export default function FirstStepForm() {
	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {},
	});

	const onSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		form.handleSubmit();
	};

	return (
		<form onSubmit={onSubmit}>
			<FieldGroup>
				<form.Field
					name="title"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Название сценария</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="Название сценария"
									autoComplete="off"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="description"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Описание</FieldLabel>
								<InputGroup>
									<InputGroupTextarea
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										rows={10}
										className="min-h-24 resize-none"
										aria-invalid={isInvalid}
									/>
									<InputGroupAddon align="block-end">
										<InputGroupText className="tabular-nums">
											{field.state.value.length}/100 characters
										</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</FieldGroup>
		</form>
	);
}
