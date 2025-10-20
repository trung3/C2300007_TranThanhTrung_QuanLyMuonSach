// app/services/loan.service.js
const { ObjectId } = require("mongodb");

class LoanService {
  constructor(db) {
    this.loans = db.collection("loans");
    this.books = db.collection("books");
    this.readers = db.collection("readers");
    this.employees = db.collection("employees"); // có thể chưa dùng

    // index hay dùng
    this.loans.createIndex({ readerId: 1, status: 1 }).catch(() => {});
    this.loans.createIndex({ bookId: 1, status: 1 }).catch(() => {});
  }

  async find(filter = {}) {
    return this.loans.find(filter).toArray();
  }

  async findById(id) {
    return this.loans.findOne({ _id: new ObjectId(id) });
  }

  async currentBorrowedCount(bookId) {
    return this.loans.countDocuments({
      bookId: new ObjectId(bookId),
      status: "borrowing",
    });
  }

  // MƯỢN SÁCH
  async borrow({ bookId, readerId, employeeId, borrowDate }) {
    const _bookId = new ObjectId(bookId);
    const _readerId = new ObjectId(readerId);
    const _employeeId = employeeId ? new ObjectId(employeeId) : null;

    // kiểm tra tồn tại
    const book = await this.books.findOne({ _id: _bookId });
    if (!book) throw new Error("Không tìm thấy sách");
    const reader = await this.readers.findOne({ _id: _readerId });
    if (!reader) throw new Error("Không tìm thấy độc giả");

    // kiểm tra số lượng còn
    const borrowed = await this.currentBorrowedCount(_bookId);
    const qty = Number(book.qty ?? 0);
    if (borrowed >= qty) {
      throw new Error("Sách đã hết (out of stock)");
    }

    const loanDoc = {
      bookId: _bookId,
      readerId: _readerId,
      createdBy: _employeeId,
      borrowDate: borrowDate ? new Date(borrowDate) : new Date(),
      returnDate: null,
      status: "borrowing",
      createdAt: new Date(),
    };

    const { insertedId } = await this.loans.insertOne(loanDoc);
    return this.findById(insertedId);
  }

  // TRẢ SÁCH
  async returnLoan(loanId) {
    const r = await this.loans.findOneAndUpdate(
      { _id: new ObjectId(loanId), status: "borrowing" },
      { $set: { status: "returned", returnDate: new Date() } },
      { returnDocument: "after" }
    );
    return r.value; // null nếu không thấy
  }

  // Danh sách ĐANG MƯỢN (join sách + độc giả)
 
 
listBorrowing() {
  return this.loans
    .aggregate([
      { $match: { status: "borrowing" } },
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $lookup: {
          from: "readers",
          localField: "readerId",
          foreignField: "_id",
          as: "reader",
        },
      },
      { $unwind: "$book" },
      { $unwind: "$reader" },
      // ✅ map status sang tiếng Việt
      {
        $addFields: {
          statusText: {
            $cond: [
              { $eq: ["$status", "borrowing"] },
              "Đang mượn",
              "Đã trả"
            ]
          }
        }
      },
      {
        $project: {
          borrowDate: 1,
          readerName: "$reader.fullName",
          bookTitle: "$book.title",
          statusText: 1,
        }
      },
      { $sort: { borrowDate: -1 } },
    ])
    .toArray();
}

 // Danh sách ĐÃ TRẢ (history) + số ngày mượn
listHistory() {
  return this.loans.aggregate([
    { $match: { status: "returned" } },
    { $lookup: { from: "books",   localField: "bookId",   foreignField: "_id", as: "book" } },
    { $lookup: { from: "readers", localField: "readerId", foreignField: "_id", as: "reader" } },
    { $unwind: "$book" },
    { $unwind: "$reader" },
    // statusText + daysBorrowed
    {
      $addFields: {
        statusText: "Đã trả",
        daysBorrowed: {
            $let:{
                vars:{
                     rawDays: {
            $dateDiff: {
              startDate: "$borrowDate",
              endDate: "$returnDate",
              unit: "day"
            }
          }
        },
        in: {
          $cond: [
            { $lte: ["$$rawDays", 0] },
            1,            // nếu 0 hoặc âm → tính là 1
            "$$rawDays"
          ]
        }
      }      
            }  
      }
    },
    {
      $project: {
        bookTitle: "$book.title",
        readerName: "$reader.fullName",
        borrowDate: 1,
        returnDate: 1,
        statusText: 1,
        daysBorrowed: 1
      }
    },
    { $sort: { returnDate: -1 } }
  ]).toArray();
}

 
}

module.exports = LoanService;
