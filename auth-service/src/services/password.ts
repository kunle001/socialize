import bcrypt from 'bcrypt'

export class Password {
  static async toHash(password: string) {
    const hashedPassword = await bcrypt.hash(password, 12)
    return hashedPassword;
  }

  static async compare(hashedPassword: string, suppliedPassword: string) {
    const isMatch = await bcrypt.compare(suppliedPassword, hashedPassword);
    return isMatch;
  }
}
