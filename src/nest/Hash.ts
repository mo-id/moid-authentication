import * as bcrypt from "bcrypt";

export class Hash {
  public static compare(
    firstHash: string,
    secondHash: string
  ): Promise<boolean> {
    return bcrypt.compare(firstHash, secondHash);
  }

  public static async compute(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
