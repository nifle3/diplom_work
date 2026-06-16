import type { ValidationError } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

interface FormFieldWrapperProps {
	label: string;
	errors: ValidationError[];
	isTouched?: boolean;
	children: React.ReactNode;
}

export function FormFieldWrapper({
	label,
	errors,
	isTouched,
	children,
}: FormFieldWrapperProps) {
	const invalid = isTouched && errors.length > 0;

	return (
		<Field data-invalid={invalid}>
			<FieldLabel>{label}</FieldLabel>
			{children}
			{invalid && <FieldError errors={errors} />}
		</Field>
	);
}
