import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";

type ModalWindowProps = {
	header: string;
	description: string;
	actionName: string;
	children: React.ReactNode;
	action: () => void;
	asChild?: boolean;
};

export function Modal({
	header,
	description,
	actionName,
	children,
	action,
	asChild,
}: ModalWindowProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild={asChild}>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{header}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Отмена</AlertDialogCancel>
					<AlertDialogAction onClick={action}>{actionName}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
