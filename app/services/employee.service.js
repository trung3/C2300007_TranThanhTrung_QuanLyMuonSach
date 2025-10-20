const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

class EmployeeService {
  constructor(db) {
    this.col = db.collection("employees");
    this.col.createIndex({ code: 1 }, { unique: true }).catch(() => {});
  }

  findByCode(code) { return this.col.findOne({ code }); }

  async create({ code, fullName, password, role = "staff" }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const doc = { code, fullName, passwordHash, role, createdAt: new Date() };
    const { insertedId } = await this.col.insertOne(doc);
    return this.col.findOne({ _id: insertedId }, { projection: { passwordHash: 0 } });
  }
}

module.exports = EmployeeService;
