import { db } from "../firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* =========================
   PASSWORD
========================= */

const OFFICE_PASSWORD = "123456";


/* =========================
   ELEMENTS
========================= */

const loginScreen =
    document.getElementById("loginScreen");

const mainPage =
    document.getElementById("mainPage");

const password =
    document.getElementById("password");

const loginBtn =
    document.getElementById("loginBtn");

const loginError =
    document.getElementById("loginError");

const studentsTable =
    document.getElementById("studentsTable");

const studentCount =
    document.getElementById("studentCount");

const searchInput =
    document.getElementById("searchInput");

const paymentModal =
    document.getElementById("paymentModal");

const closeModal =
    document.getElementById("closeModal");

const modalStudentName =
    document.getElementById("modalStudentName");

const modalStudentCourse =
    document.getElementById("modalStudentCourse");

const modalTotalFee =
    document.getElementById("modalTotalFee");

const modalTotalPaid =
    document.getElementById("modalTotalPaid");

const modalBalance =
    document.getElementById("modalBalance");

const paymentMessage =
    document.getElementById("paymentMessage");

const savePaymentBtn =
    document.getElementById("savePaymentBtn");


const paymentInputs = {

    advanceAmount:
        document.getElementById("advanceAmount"),

    advanceDate:
        document.getElementById("advanceDate"),

    firstAmount:
        document.getElementById("firstAmount"),

    firstDate:
        document.getElementById("firstDate"),

    secondAmount:
        document.getElementById("secondAmount"),

    secondDate:
        document.getElementById("secondDate"),

    thirdAmount:
        document.getElementById("thirdAmount"),

    thirdDate:
        document.getElementById("thirdDate"),

    fourthAmount:
        document.getElementById("fourthAmount"),

    fourthDate:
        document.getElementById("fourthDate")

};


let students = [];
let feeRecords = [];
let selectedStudent = null;


/* =========================
   LOGIN
========================= */

loginBtn.addEventListener("click", login);

password.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        login();
    }

});


function login() {

    if (password.value.trim() === OFFICE_PASSWORD) {

        loginScreen.style.display = "none";
        mainPage.style.display = "block";

        loadData();

    } else {

        loginError.textContent =
            "Incorrect password.";

        password.value = "";
        password.focus();

    }

}


/* =========================
   LOAD DATA
========================= */

async function loadData() {

    studentsTable.innerHTML = `
        <tr>
            <td colspan="8" class="loading">
                Loading students...
            </td>
        </tr>
    `;


    try {

        const [
            studentsSnapshot,
            feeSnapshot,
            officeSnapshot
        ] = await Promise.all([

            getDocs(
                collection(db, "students")
            ),

            getDocs(
                collection(db, "feeRecords")
            ),

            getDocs(
                collection(db, "officeFees")
            )

        ]);


        students = [];

        studentsSnapshot.forEach(document => {

            students.push({
                id: document.id,
                ...document.data()
            });

        });


        feeRecords = [];

        feeSnapshot.forEach(document => {

            feeRecords.push({
                id: document.id,
                ...document.data()
            });

        });


        /*
         * Office payment records
         */

        const officeRecords = {};

        officeSnapshot.forEach(document => {

            officeRecords[document.id] =
                document.data();

        });


        students =
            students.map(student => ({

                ...student,

                adminFee:
                    feeRecords.find(
                        fee =>
                            fee.id === student.id
                    ) || null,

                officeFee:
                    officeRecords[student.id] || null

            }));


        studentCount.textContent =
            students.length;


        displayStudents(students);


    } catch (error) {

        console.error(error);

        studentsTable.innerHTML = `
            <tr>
                <td colspan="8" class="loading">
                    Unable to load students.
                </td>
            </tr>
        `;

    }

}


/* =========================
   DISPLAY STUDENTS
========================= */

function displayStudents(data) {

    if (!data.length) {

        studentsTable.innerHTML = `
            <tr>
                <td colspan="8" class="loading">
                    No students found.
                </td>
            </tr>
        `;

        return;
    }


    studentsTable.innerHTML =
        data.map((student, index) => {

            const name =
                student.name ||
                student.fullName ||
                "Unnamed Student";


            const course =
                [
                    student.course,
                    student.combination
                ]
                .filter(Boolean)
                .join(" • ") || "-";


            /*
             * IMPORTANT:
             *
             * College sees ONLY:
             *
             * Trust Contribution + Student Payable
             *
             * No breakup is displayed.
             */

            const admin =
                student.adminFee || {};


            const totalFee =
                Number(
                    admin.trustContribution || 0
                ) +
                Number(
                    admin.studentPayable || 0
                );


            const office =
                student.officeFee || {};


            const totalPaid =
                calculateTotalPaid(office);


            const balance =
                Math.max(
                    totalFee - totalPaid,
                    0
                );


            let status = "Pending";

            if (totalFee > 0 && balance === 0) {
                status = "Paid";
            }


            return `

                <tr>

                    <td>${index + 1}</td>

                    <td class="student-name">
                        ${escapeHTML(name)}
                    </td>

                    <td>
                        ${escapeHTML(course)}
                    </td>

                    <td class="amount">
                        ${formatMoney(totalFee)}
                    </td>

                    <td class="amount">
                        ${formatMoney(totalPaid)}
                    </td>

                    <td class="balance">
                        ${formatMoney(balance)}
                    </td>

                    <td>

                        <span class="status ${
                            status === "Paid"
                                ? "paid"
                                : "pending"
                        }">

                            ${status}

                        </span>

                    </td>

                    <td>

                        <button
                            class="action-btn"
                            data-id="${student.id}"
                        >

                            ${
                                student.officeFee
                                    ? "Edit Fees"
                                    : "Add Fees"
                            }

                        </button>

                    </td>

                </tr>

            `;

        }).join("");


    document
        .querySelectorAll(".action-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openPaymentModal(
                        button.dataset.id
                    )
            );

        });

}


/* =========================
   OPEN PAYMENT
========================= */

function openPaymentModal(id) {

    selectedStudent =
        students.find(
            student => student.id === id
        );


    if (!selectedStudent) {
        return;
    }


    const name =
        selectedStudent.name ||
        selectedStudent.fullName ||
        "Student";


    const course =
        [
            selectedStudent.course,
            selectedStudent.combination
        ]
        .filter(Boolean)
        .join(" • ") || "Course";


    const admin =
        selectedStudent.adminFee || {};


    /*
     * College-facing total:
     *
     * Trust Contribution
     * +
     * Student Payable
     */

    const totalFee =
        Number(
            admin.trustContribution || 0
        ) +
        Number(
            admin.studentPayable || 0
        );


    const office =
        selectedStudent.officeFee || {};


    modalStudentName.textContent = name;

    modalStudentCourse.textContent = course;

    modalTotalFee.textContent =
        formatMoney(totalFee);


    fillPaymentFields(office);


    updatePaymentSummary(totalFee);


    paymentMessage.className =
        "payment-message";

    paymentMessage.textContent = "";


    savePaymentBtn.textContent =
        selectedStudent.officeFee
            ? "Save Changes"
            : "Save Fee Details";


    paymentModal.classList.add("show");

}


/* =========================
   FILL EXISTING
========================= */

function fillPaymentFields(data) {

    paymentInputs.advanceAmount.value =
        data.advancePaid || "";

    paymentInputs.advanceDate.value =
        data.advancePaidDate || "";


    paymentInputs.firstAmount.value =
        data.firstInstallment || "";

    paymentInputs.firstDate.value =
        data.firstInstallmentDate || "";


    paymentInputs.secondAmount.value =
        data.secondInstallment || "";

    paymentInputs.secondDate.value =
        data.secondInstallmentDate || "";


    paymentInputs.thirdAmount.value =
        data.thirdInstallment || "";

    paymentInputs.thirdDate.value =
        data.thirdInstallmentDate || "";


    paymentInputs.fourthAmount.value =
        data.fourthInstallment || "";

    paymentInputs.fourthDate.value =
        data.fourthInstallmentDate || "";

}


/* =========================
   CALCULATE PAID
========================= */

function getCurrentTotalPaid() {

    return (

        getNumber(
            paymentInputs.advanceAmount.value
        )

        +

        getNumber(
            paymentInputs.firstAmount.value
        )

        +

        getNumber(
            paymentInputs.secondAmount.value
        )

        +

        getNumber(
            paymentInputs.thirdAmount.value
        )

        +

        getNumber(
            paymentInputs.fourthAmount.value
        )

    );

}


function calculateTotalPaid(data) {

    return (

        Number(data.advancePaid || 0)

        +

        Number(data.firstInstallment || 0)

        +

        Number(data.secondInstallment || 0)

        +

        Number(data.thirdInstallment || 0)

        +

        Number(data.fourthInstallment || 0)

    );

}


/* =========================
   SUMMARY
========================= */

function updatePaymentSummary(totalFee) {

    const totalPaid =
        getCurrentTotalPaid();


    const balance =
        Math.max(
            totalFee - totalPaid,
            0
        );


    modalTotalPaid.textContent =
        formatMoney(totalPaid);

    modalBalance.textContent =
        formatMoney(balance);

}


Object.values(paymentInputs)
    .forEach(input => {

        input.addEventListener(
            "input",
            () => {

                if (!selectedStudent) {
                    return;
                }


                const admin =
                    selectedStudent.adminFee || {};


                const totalFee =
                    Number(
                        admin.trustContribution || 0
                    )
                    +
                    Number(
                        admin.studentPayable || 0
                    );


                updatePaymentSummary(totalFee);

            }
        );

    });


/* =========================
   SAVE PAYMENT
========================= */

savePaymentBtn.addEventListener(
    "click",
    savePayment
);


async function savePayment() {

    if (!selectedStudent) {
        return;
    }


    const admin =
        selectedStudent.adminFee || {};


    const totalFee =
        Number(
            admin.trustContribution || 0
        )
        +
        Number(
            admin.studentPayable || 0
        );


    if (totalFee <= 0) {

        showPaymentMessage(
            "No fee structure has been set for this student.",
            "error"
        );

        return;
    }


    const advance =
        getNumber(
            paymentInputs.advanceAmount.value
        );

    const first =
        getNumber(
            paymentInputs.firstAmount.value
        );

    const second =
        getNumber(
            paymentInputs.secondAmount.value
        );

    const third =
        getNumber(
            paymentInputs.thirdAmount.value
        );

    const fourth =
        getNumber(
            paymentInputs.fourthAmount.value
        );


    const totalPaid =
        advance +
        first +
        second +
        third +
        fourth;


    if (totalPaid > totalFee) {

        showPaymentMessage(
            "Total paid cannot be greater than the total fee.",
            "error"
        );

        return;
    }


    savePaymentBtn.disabled = true;

    savePaymentBtn.textContent =
        "Saving...";


    try {

        await setDoc(

            doc(
                db,
                "officeFees",
                selectedStudent.id
            ),

            {

                studentId:
                    selectedStudent.id,

                studentName:
                    selectedStudent.name ||
                    selectedStudent.fullName ||
                    "",

                studentEmail:
                    selectedStudent.email ||
                    "",


                /*
                 * Total fee shown to office
                 */

                totalFee:
                    totalFee,


                /* Payments */

                advancePaid:
                    advance,

                advancePaidDate:
                    paymentInputs.advanceDate.value || "",


                firstInstallment:
                    first,

                firstInstallmentDate:
                    paymentInputs.firstDate.value || "",


                secondInstallment:
                    second,

                secondInstallmentDate:
                    paymentInputs.secondDate.value || "",


                thirdInstallment:
                    third,

                thirdInstallmentDate:
                    paymentInputs.thirdDate.value || "",


                fourthInstallment:
                    fourth,

                fourthInstallmentDate:
                    paymentInputs.fourthDate.value || "",


                totalPaid:
                    totalPaid,

                balance:
                    Math.max(
                        totalFee - totalPaid,
                        0
                    ),


                status:
                    totalPaid >= totalFee
                        ? "Paid"
                        : "Pending",


                updatedAt:
                    serverTimestamp()

            },

            {
                merge: true
            }

        );


        showPaymentMessage(
            "Fee details saved successfully.",
            "success"
        );


        /*
         * Reload everything after save
         */

        await loadData();


        setTimeout(() => {

            paymentModal.classList.remove(
                "show"
            );

        }, 800);


    } catch (error) {

        console.error(
            "Payment save error:",
            error
        );

        showPaymentMessage(
            "Unable to save fee details: " +
            error.message,
            "error"
        );

    }


    savePaymentBtn.disabled = false;

    savePaymentBtn.textContent =
        "Save Changes";

}


/* =========================
   CLOSE
========================= */

closeModal.addEventListener(
    "click",
    () => {

        paymentModal.classList.remove(
            "show"
        );

    }
);


paymentModal.addEventListener(
    "click",
    event => {

        if (event.target === paymentModal) {

            paymentModal.classList.remove(
                "show"
            );

        }

    }
);


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    () => {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        const filtered =
            students.filter(student => {

                const name =
                    (
                        student.name ||
                        student.fullName ||
                        ""
                    ).toLowerCase();


                const email =
                    (
                        student.email ||
                        ""
                    ).toLowerCase();


                return (
                    name.includes(search) ||
                    email.includes(search)
                );

            });


        displayStudents(filtered);

    }
);


/* =========================
   MESSAGE
========================= */

function showPaymentMessage(
    text,
    type
) {

    paymentMessage.textContent = text;

    paymentMessage.className =
        "payment-message show " + type;

}


/* =========================
   NUMBER
========================= */

function getNumber(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? Math.max(number, 0)
        : 0;

}


/* =========================
   MONEY
========================= */

function formatMoney(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN");

}


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}
