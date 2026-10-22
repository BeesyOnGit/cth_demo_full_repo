import bcrypt from "bcrypt";

export async function hashPassword(password: string): Promise<string | false> {
    try {
        const saltRounds = 12;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        return hashedPassword;
    } catch (error) {
        console.log("🚀 ~ file: password.ts:5 ~ hashPAssword ~ error:", error);
        return false;
    }
}

export async function comparePassword({ password, hashedPassword }: { password: string; hashedPassword: string }): Promise<boolean> {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        console.log("🚀 ~ file: password.ts:16 ~ comparePassword ~ error:", error);
        return false;
    }
}
