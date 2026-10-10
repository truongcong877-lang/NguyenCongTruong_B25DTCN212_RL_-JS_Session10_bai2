const students = [
  {
    studentCode: "SV001",
    fullName: "Nguyễn Văn An"
  },
  {
    studentCode: "SV002",
    fullName: "Trần Thị Bình"
  },
  {
    studentCode: "SV003",
    fullName: "Lê Văn Cường"
  }
];

const circulationLogs = [
  {
    logId: "LOG001",
    studentCode: "SV001",
    bookIsbn: "ISBN001",
    status: "BORROWING",
    borrowDate: "2026-10-01",
    dueDate: "2026-10-05",
    returnDate: null,
    fineAmount: 0,
    finePaid: false,
    completedAt: null
  },
  {
    logId: "LOG002",
    studentCode: "SV002",
    bookIsbn: "ISBN002",
    status: "BORROWING",
    borrowDate: "2026-10-02",
    dueDate: "2026-10-06",
    returnDate: null,
    fineAmount: 0,
    finePaid: false,
    completedAt: null
  },
  {
    logId: "LOG003",
    studentCode: "SV003",
    bookIsbn: "ISBN003",
    status: "RETURNED",
    borrowDate: "2026-08-01",
    dueDate: "2026-08-10",
    returnDate: "2026-08-12",
    fineAmount: 10000,
    finePaid: true,
    completedAt: "2026-08-12"
  }
];

const dailyDate = "2026-10-10";
let totalFineCollected = 0;

const findStudent = (studentCode) => {
  return students.find(student => student.studentCode === studentCode);
};

const findLog = (logId) => {
  return circulationLogs.find(log => log.logId === logId);
};

const printLogs = () => {
  console.log("==============================================================");
  console.log("             BÁO CÁO NHẬT KÝ MƯỢN TRẢ THƯ VIỆN");
  console.log("==============================================================");

  console.table(circulationLogs.map(log => ({
    logId: log.logId,
    studentCode: log.studentCode,
    bookIsbn: log.bookIsbn,
    status: log.status,
    fineAmount: log.fineAmount,
    finePaid: log.finePaid
  })));
};

console.log("NGÀY VẬN HÀNH:", dailyDate);

// 1. CREATE: Mượn sách mới
console.log("\n--- 1. TIẾP NHẬN YÊU CẦU MƯỢN SÁCH ---");

const newStudentCode = "SV001";
const newBookIsbn = "ISBN004";
const newLogId = "LOG004";

if (findStudent(newStudentCode)) {
  if (!findLog(newLogId)) {
    circulationLogs.push({
      logId: newLogId,
      studentCode: newStudentCode,
      bookIsbn: newBookIsbn,
      status: "BORROWING",
      borrowDate: dailyDate,
      dueDate: "2026-10-17",
      returnDate: null,
      fineAmount: 0,
      finePaid: false,
      completedAt: null
    });

    console.log("Mượn sách thành công:", newLogId);
  } else {
    console.log("Mã nhật ký đã tồn tại.");
  }
} else {
  console.log("Mã sinh viên không hợp lệ.");
}

printLogs();

// 2. UPDATE: Trả sách và tính phí
console.log("\n--- 2. XỬ LÝ TRẢ SÁCH ---");

const returnLogId = "LOG001";
const returnStatus = "RETURNED";
const actualReturnDate = "2026-10-10";

const returnLog = findLog(returnLogId);

if (returnLog && returnLog.status === "BORROWING") {
  returnLog.returnDate = actualReturnDate;

  if (returnStatus === "LOST") {
    returnLog.status = "LOST";
    returnLog.fineAmount = 200000;
  } else if (returnStatus === "RETURNED") {
    returnLog.status = "RETURNED";

    const dueDate = new Date(returnLog.dueDate);
    const returnDate = new Date(actualReturnDate);
    const lateDays = Math.max(
      0,
      Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24))
    );

    returnLog.fineAmount = lateDays * 5000;
  }

  returnLog.completedAt = dailyDate;

  console.log("Trạng thái:", returnLog.status);
  console.log("Tiền phạt phải thu:", returnLog.fineAmount, "VNĐ");
} else {
  console.log("Không tìm thấy giao dịch đang mượn hợp lệ.");
}

printLogs();

// 3. UPDATE: Quyết toán tiền phạt
console.log("\n--- 3. QUYẾT TOÁN TIỀN PHẠT ---");

const settlementLogId = "LOG001";
const settlementLog = findLog(settlementLogId);

if (
  settlementLog &&
  (settlementLog.status === "RETURNED" || settlementLog.status === "LOST") &&
  !settlementLog.finePaid
) {
  settlementLog.finePaid = true;
  totalFineCollected += settlementLog.fineAmount;

  console.log("Đã thu:", settlementLog.fineAmount, "VNĐ");
} else {
  console.log("Giao dịch không cần quyết toán hoặc đã quyết toán.");
}

printLogs();

// 4. DELETE: Xóa nhật ký đã hoàn tất quá 30 ngày
console.log("\n--- 4. DỌN DẸP NHẬT KÝ CŨ ---");

const currentDate = new Date(dailyDate);
let deletedLogs = 0;

for (let i = circulationLogs.length - 1; i >= 0; i--) {
  const log = circulationLogs[i];

  if (
    (log.status === "RETURNED" || log.status === "LOST") &&
    log.finePaid === true &&
    log.completedAt !== null
  ) {
    const completedDate = new Date(log.completedAt);
    const elapsedDays = Math.floor(
      (currentDate - completedDate) / (1000 * 60 * 60 * 24)
    );

    if (elapsedDays > 30) {
      circulationLogs.splice(i, 1);
      deletedLogs++;
    }
  }
}

console.log("Số nhật ký đã xóa:", deletedLogs);
printLogs();

// 5. READ: Báo cáo tổng kết cuối ngày
console.log("\n--- 5. BÁO CÁO TỔNG KẾT CUỐI NGÀY ---");

let borrowingCount = 0;
let returnedCount = 0;
let lostCount = 0;
let outstandingFine = 0;

for (let i = 0; i < circulationLogs.length; i++) {
  const log = circulationLogs[i];

  if (log.status === "BORROWING") {
    borrowingCount++;
  } else if (log.status === "RETURNED") {
    returnedCount++;
  } else if (log.status === "LOST") {
    lostCount++;
  }

  if (!log.finePaid) {
    outstandingFine += log.fineAmount;
  }
}

console.log("==============================================================");
console.log("           TỔNG KẾT LƯU CHUYỂN THƯ VIỆN");
console.log("==============================================================");
console.log("Ngày báo cáo:", dailyDate);
console.log("Tổng nhật ký còn lưu:", circulationLogs.length);
console.log("Số sách đang được mượn:", borrowingCount);
console.log("Số giao dịch đã trả:", returnedCount);
console.log("Số giao dịch mất sách:", lostCount);
console.log("Tiền phạt thu trong ngày:", totalFineCollected, "VNĐ");
console.log("Tiền phạt chưa thu:", outstandingFine, "VNĐ");
console.log("==============================================================")