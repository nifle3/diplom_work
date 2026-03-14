import { DomainError } from "./base";

type Payload = {
    what: string;
    who: "postgres" | "s3";
}

export class StorageError extends DomainError<Payload> {
    constructor(message: string, payload: Payload) {
        super(message, payload);
        this.name = "StorageError";
        Object.setPrototypeOf(this, StorageError.prototype);
    }
}