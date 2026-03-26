import { ChangeAvatarDialog } from "./changeAvatarDialog";
import { ChangeEmailDialog } from "./changeEmailDialog";
import { ChangePasswordDialog } from "./changePasswordDialog";

type ProfileSettingsDialogsProps = {
	email: string;
	image?: string | null;
	name: string;
};

export function ProfileSettingsDialogs({
	email,
	image,
	name,
}: ProfileSettingsDialogsProps) {
	return (
		<div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
			<ChangeAvatarDialog email={email} image={image} name={name} />
			<ChangeEmailDialog email={email} />
			<ChangePasswordDialog />
		</div>
	);
}
