export class ProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileError";
  }
}

export class ProfileNotFoundError extends ProfileError {
  constructor() {
    super("Trader profile not found.");
    this.name = "ProfileNotFoundError";
  }
}

export class ProfileAlreadyExistsError extends ProfileError {
  constructor() {
    super("Trader profile already exists.");
    this.name = "ProfileAlreadyExistsError";
  }
}

export class InvalidProfileDataError extends ProfileError {
  constructor(message = "Trader profile data is invalid.") {
    super(message);
    this.name = "InvalidProfileDataError";
  }
}