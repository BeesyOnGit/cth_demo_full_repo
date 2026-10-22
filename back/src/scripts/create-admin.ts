// Creates (or resets) an admin account, e.g. on a fresh database:
//   docker compose exec -e ADMIN_PASSWORD='...' app node dist/scripts/create-admin.js admin@example.com "Full Name"
// Dev: ADMIN_PASSWORD='...' npx ts-node src/scripts/create-admin.ts admin@example.com "Full Name"
import mongoose from "mongoose";
import { config } from "../config/index";
import { EmployeeModel } from "../features/employee/model";
import { RoleModel } from "../features/role/model";
import { hashPassword } from "../utils/password";

const run = async () => {
    const [email, fullName = "Administrator"] = process.argv.slice(2);
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password || password.length < 8) {
        console.error('Usage: ADMIN_PASSWORD=<8+ chars> node dist/scripts/create-admin.js <email> ["Full Name"]');
        process.exit(1);
    }

    await mongoose.connect(config.mongodbUri);

    const role = (await RoleModel.findOne({ code: "ADMIN" })) ?? (await RoleModel.create({ code: "ADMIN", label: "Administrateur", permissions: [] }));
    const passwordHash = await hashPassword(password);
    if (!passwordHash) throw new Error("Could not hash the password");

    const existing = await EmployeeModel.findOne({ email: email.toLowerCase() });
    if (existing) {
        await EmployeeModel.updateOne({ _id: existing._id }, { passwordHash, isAdmin: true, isActive: true });
        console.log(`Admin ${email} updated`);
    } else {
        const _id = new mongoose.Types.ObjectId();
        await EmployeeModel.create({ _id, fullName, email, passwordHash, roleId: role._id, isAdmin: true, createdBy: _id, updatedBy: _id });
        console.log(`Admin ${email} created`);
    }

    await mongoose.disconnect();
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
