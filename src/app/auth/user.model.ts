export class UserModel {
  constructor(public id: string, public email: string,
              private userToken: string, public tokenExpirationDate: Date) {
  }

  get token(): string | null {
    if (!this.tokenExpirationDate || new Date() > this.tokenExpirationDate) {
      return null;
    }
    return this.userToken;
  }
}
