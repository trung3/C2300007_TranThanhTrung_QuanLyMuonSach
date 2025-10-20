// app/services/publisher.service.js
const { ObjectId } = require("mongodb");

class PublisherService {
  constructor(db) {
    this.collection = db.collection("publishers");
    // Tạo index unique cho "code"
    this.collection.createIndex({ code: 1 }, { unique: true }).catch(() => {});
  }

  find(filter = {}) {
    return this.collection.find(filter).toArray();
  }

  findById(id) {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async create(payload) {
    const doc = {
      code: payload.code,
      name: payload.name,
      address: payload.address ?? "",
      createdAt: new Date(),
    };
    const result = await this.collection.insertOne(doc);
    return await this.findById(result.insertedId);
  }

  async update(id, payload) {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name: payload.name, address: payload.address } },
      { returnDocument: "after" }
    );
    return result.value;
  }

  delete(id) {
    return this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = PublisherService;
