import { DomainError } from "./base";

export class FileTooLargeError extends DomainError {
    constructor(message: string, payload: string) {
        super(message, payload);
        this.name = "FileTooLarge";
        Object.setPrototypeOf(this, FileTooLargeError.prototype);
    }
}