"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

type NewSessionButtonProps = {
    scriptId: string;
}

export default function NewSessionButton({ scriptId } : NewSessionButtonProps) {
    const router = useRouter();
    const createNewSession = useMutation(trpc.session.createNewSession.mutationOptions({
        onSuccess: (data) => {
            router.push(`/interview/${data}`)
        },
        onError: (error) => {
            toast(error.message);
        }
    }));

    const onClick = async () => {
        await createNewSession.mutateAsync(scriptId);``
    }

    return (
        <Button 
        className="w-full flex-1" 
        disabled={createNewSession.isPending}
        onClick={onClick}
        >
            Начать сессию
        </Button>
    );
}