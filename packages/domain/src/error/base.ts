export class DomainError<T = unknown> extends Error {
	payload?: T;

	constructor(message: string, payload: T) {
		super(message);
		this.payload = payload;
		Object.setPrototypeOf(this, DomainError.prototype);
	}
}
