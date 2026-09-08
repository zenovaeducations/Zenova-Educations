import { db } from "../firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ======================================
// SETTINGS
// ======================================

const PASSWORD = "123456";


// ======================================
// VARIABLES
// ======================================

let students = [];


// ======================================
// ELEMENTS
// ======================================

const loginScreen =
    document.getElementById("loginScreen");

const mainPage =
    document.getElementById("mainPage");

const passwordInput =
    document.getElementById("password");

const loginBtn =
    document.getElementById("loginBtn");

const loginError =
    document.getElementById("loginError");

const searchInput =
    document.getElementById("searchInput");

const refreshBtn =
    document.getElementById("refreshBtn");

const studentsTable =
    document.getElementById("studentsTable");

const tableFooter =
    document.getElementById("tableFooter");

const emptyMessage =
    document.getElementById("emptyMessage");


// ======================================
// LOGIN
// ======================================

loginBtn.addEventListener("click", login);

passwordInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {
            login();
        }

    }
);


function login() {

    if (
        passwordInput.value.trim() === PASSWORD
    ) {

        loginScreen.style.display = "none";

        mainPage.style.display = "block";

        loginError.textContent = "";

        loadFeeReference();

    } else {

        loginError.textContent =
            "Incorrect password.";

        passwordInput.value = "";

        passwordInput.focus();
    }
}


// ======================================
// LOAD DATA
// ======================================

async function loadFeeReference() {

    studentsTable.innerHTML = `
        <tr>
            <td colspan="7" class="loading">
                Loading fee details...
            </td>
        </tr>
    `;

    try {

        /*
         * IMPORTANT:
         *
         * feeRecords = original fee structure
         *
         * officeFees = actual money collected
         *
         * We NEVER write anything on this page.
         */

        const feeRecordsSnapshot =
            await getDocs(
                collection(db, "feeRecords")
            );


        const officeFeesSnapshot =
            await getDocs(
                collection(db, "officeFees")
            );


        // ==================================
        // CREATE OFFICE PAYMENT LOOKUP
        // ==================================

        const officePayments = {};

        officeFeesSnapshot.forEach(
            (documentSnapshot) => {

                const data =
                    documentSnapshot.data();

                officePayments[
                    documentSnapshot.id
                ] = {

                    totalPaid:
                        Number(data.totalPaid || 0)

                };

            }
        );


        // ==================================
        // CREATE STUDENT LIST
        // ==================================

        students = [];


        feeRecordsSnapshot.forEach(
            (documentSnapshot) => {

                const data =
                    documentSnapshot.data();

                const studentId =
                    documentSnapshot.id;


                // ----------------------------
                // FEE STRUCTURE
                // ----------------------------

                const trustContribution =
                    Number(
                        data.trustContribution || 0
                    );

                const studentPayable =
                    Number(
                        data.studentPayable || 0
                    );


                /*
                 * ACTUAL TOTAL COLLEGE FEE
                 *
                 * Trust Contribution
                 * +
                 * Student Payable
                 */

                const actualTotalFee =
                    trustContribution +
                    studentPayable;


                // ----------------------------
                // PAID FROM OFFICE
                // ----------------------------

                const officeRecord =
                    officePayments[studentId];


                const totalPaid =
                    officeRecord
                        ? Number(
                            officeRecord.totalPaid || 0
                        )
                        : 0;


                // ----------------------------
                // BALANCE
                // ----------------------------

                const balance =
                    actualTotalFee -
                    totalPaid;


                students.push({

                    id: studentId,

                    studentName:
                        data.studentName || "",

                    studentEmail:
                        data.studentEmail || "",

                    trustContribution,

                    studentPayable,

                    actualTotalFee,

                    totalPaid,

                    balance

                });

            }
        );


        renderStudents(students);

        updateSummary(students);


    } catch (error) {

        console.error(
            "Fee reference loading error:",
            error
        );

        studentsTable.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="loading"
                >
                    Could not load fee details.
                </td>
            </tr>
        `;

        alert(
            "Could not load fee details.\n\n" +
            error.message
        );
    }
}


// ======================================
// RENDER
// ======================================

function renderStudents(list) {

    studentsTable.innerHTML = "";

    tableFooter.innerHTML = "";


    if (!list.length) {

        emptyMessage.style.display =
            "block";

        return;
    }


    emptyMessage.style.display =
        "none";


    list.forEach(
        (student, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td class="student-name">
                    ${escapeHTML(
                        student.studentName
                    )}
                </td>


                <td class="money">
                    ${formatMoney(
                        student.trustContribution
                    )}
                </td>


                <td class="money">
                    ${formatMoney(
                        student.studentPayable
                    )}
                </td>


                <td class="money">
                    ${formatMoney(
                        student.actualTotalFee
                    )}
                </td>


                <td class="paid">
                    ${formatMoney(
                        student.totalPaid
                    )}
                </td>


                <td class="balance">
                    ${formatMoney(
                        student.balance
                    )}
                </td>

            `;


            studentsTable.appendChild(row);
        }
    );


    // ==================================
    // FOOTER TOTAL
    // ==================================

    const totals =
        calculateTotals(list);


    const footerRow =
        document.createElement("tr");


    footerRow.innerHTML = `

        <td></td>

        <td>
            GRAND TOTAL
        </td>

        <td>
            ${formatMoney(
                totals.trust
            )}
        </td>

        <td>
            ${formatMoney(
                totals.studentPayable
            )}
        </td>

        <td>
            ${formatMoney(
                totals.actualFee
            )}
        </td>

        <td>
            ${formatMoney(
                totals.paid
            )}
        </td>

        <td>
            ${formatMoney(
                totals.balance
            )}
        </td>

    `;


    tableFooter.appendChild(footerRow);
}


// ======================================
// SUMMARY
// ======================================

function updateSummary(list) {

    const totals =
        calculateTotals(list);


    document.getElementById(
        "studentCount"
    ).textContent = students.length;


    document.getElementById(
        "totalTrust"
    ).textContent =
        formatMoney(totals.trust);


    document.getElementById(
        "totalStudentPayable"
    ).textContent =
        formatMoney(
            totals.studentPayable
        );


    document.getElementById(
        "totalActualFee"
    ).textContent =
        formatMoney(
            totals.actualFee
        );


    document.getElementById(
        "totalPaid"
    ).textContent =
        formatMoney(
            totals.paid
        );


    document.getElementById(
        "totalBalance"
    ).textContent =
        formatMoney(
            totals.balance
        );
}


// ======================================
// CALCULATE TOTALS
// ======================================

function calculateTotals(list) {

    return list.reduce(
        (total, student) => {

            total.trust +=
                Number(
                    student.trustContribution || 0
                );

            total.studentPayable +=
                Number(
                    student.studentPayable || 0
                );

            total.actualFee +=
                Number(
                    student.actualTotalFee || 0
                );

            total.paid +=
                Number(
                    student.totalPaid || 0
                );

            total.balance +=
                Number(
                    student.balance || 0
                );

            return total;

        },
        {
            trust: 0,
            studentPayable: 0,
            actualFee: 0,
            paid: 0,
            balance: 0
        }
    );
}


// ======================================
// SEARCH
// ======================================

searchInput.addEventListener(
    "input",
    function () {

        const value =
            this.value
                .trim()
                .toLowerCase();


        if (!value) {

            renderStudents(students);

            return;
        }


        const filtered =
            students.filter(
                (student) => {

                    return (

                        String(
                            student.studentName || ""
                        )
                        .toLowerCase()
                        .includes(value)

                        ||

                        String(
                            student.studentEmail || ""
                        )
                        .toLowerCase()
                        .includes(value)

                    );

                }
            );


        renderStudents(filtered);
    }
);


// ======================================
// REFRESH
// ======================================

refreshBtn.addEventListener(
    "click",
    () => {

        loadFeeReference();

    }
);


// ======================================
// MONEY FORMAT
// ======================================

function formatMoney(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN");
}


// ======================================
// HTML ESCAPE
// ======================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
