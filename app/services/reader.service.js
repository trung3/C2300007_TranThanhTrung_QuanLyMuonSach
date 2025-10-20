// app/services/reader.service.js
const { ObjectId } = require("mongodb");

class ReaderService {
  constructor(db) {
    this.collection = db.collection("readers");
    this.collection.createIndex({ code: 1 }, { unique: true }).catch(() => {});
    this.collection.createIndex({ fullName: "text" }).catch(() => {});
  }

  find(filter = {}) {
    return this.collection.find(filter).toArray();
  }

  findById(id) {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async create(payload) {
    const doc = {
      code: payload.code,                  // unique, bắt buộc
      fullName: payload.fullName,          // bắt buộc
      gender: Number(payload.gender ?? 1), // 0 | 1 (0 = nữ, 1 = nam)
      dob: payload.dob ? new Date(payload.dob) : null,  // "YYYY-MM-DD"
      address: payload.address ?? "",
      phone: payload.phone ?? "",
      createdAt: new Date(),
    };
    const { insertedId } = await this.collection.insertOne(doc);
    return this.findById(insertedId);
  }

  async update(id, payload) {
    const $set = {};
    if (payload.fullName !== undefined) $set.fullName = payload.fullName;
    if (payload.gender !== undefined)   $set.gender = Number(payload.gender);
    if (payload.dob !== undefined)      $set.dob = payload.dob ? new Date(payload.dob) : null;
    if (payload.address !== undefined)  $set.address = payload.address;
    if (payload.phone !== undefined)    $set.phone = payload.phone;

    if (Object.keys($set).length === 0) return this.findById(id);

    const r = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set }
    );
    if (r.matchedCount === 0) return null;
    return this.findById(id);
  }

  delete(id) {
    return this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = ReaderService;
