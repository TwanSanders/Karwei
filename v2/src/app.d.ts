declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('$lib/domain/types').User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
