import { db } from "../firebase-config.js";

import {
    collection,
    getDocs,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ========================================
// PASSWORD
// ========================================

const PASSWORD = "123456";


// ========================================
// DATA
// ========================================

let students = [];


// ========================================
// ELEMENTS
// ========================================

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


// ========================================
// LOGIN
// ========================================

loginBtn.addEventListener(
    "click",
    login
);


passwordInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {
            login();
        }

    }
);


function login() {

    const password =
        passwordInput.value.trim();


    if (password === PASSWORD) {

        loginScreen.style.display =
            "none";

        mainPage.style.display =
            "block";

        loginError.textContent = "";

        loadData();

    } else {

        loginError.textContent =
            "Incorrect password.";

        passwordInput.value = "";

        passwordInput.focus();
    }
}


// ========================================
// LOAD DATA
// ========================================

async function loadData() {

    studentsTable.innerHTML = `
        <tr>
            <td colspan="7" class="loading">
                Loading fee details...
            </td>
        </tr>
    `;


    try {

        // ==================================
        // FEE RECORDS
        // ==================================

        const feeSnapshot =
            await getDocs(
                collection(db, "feeRecords")
            );


        // ==================================
        // OFFICE FEES
        // ==================================

        const officeSnapshot =
            await getDocs(
                collection(db, "officeFees")
            );


        // ==================================
        // OFFICE PAYMENT LOOKUP
        // ==================================

        const officePayments = {};


        officeSnapshot.forEach(
            (documentSnapshot) => {

                const data =
                    documentSnapshot.data();


                officePayments[
                    documentSnapshot.id
                ] = {

                    totalPaid:
                        Number(
                            data.totalPaid || 0
                        )

                };

            }
        );


        // ==================================
        // BUILD STUDENT DATA
        // ==================================

        students = [];


        feeSnapshot.forEach(
            (documentSnapshot) => {

                const data =
                    documentSnapshot.data();


                const studentId =
                    documentSnapshot.id;


                // --------------------------------
                // TRUST CONTRIBUTION
                // --------------------------------

                const trustContribution =
                    Number(
                        data.trustContribution || 0
                    );


                // --------------------------------
                // STUDENT PAYABLE
                // --------------------------------

                const studentPayable =
                    Number(
                        data.studentPayable || 0
                    );


                // --------------------------------
                // REFERENCE TOTAL FEES
                //
                // THIS IS THE VALUE YOU EDIT.
                //
                // IMPORTANT:
                // It is NOT officeFees.totalFee.
                // --------------------------------

                const referenceTotalFees =
                    Number(
                        data.referenceTotalFees || 0
                    );


                // --------------------------------
                // ACTUAL FEES PAID
                //
                // ONLY FROM OFFICE PORTAL
                // --------------------------------

                const officeRecord =
                    officePayments[studentId];


                const totalPaid =
                    officeRecord
                        ? Number(
                            officeRecord.totalPaid || 0
                        )
                        : 0;


                // --------------------------------
                // REFERENCE BALANCE
                //
                // Reference Total Fees
                // MINUS
                // Actual Fees Paid
                // --------------------------------

                const balance =
                    referenceTotalFees -
                    totalPaid;


                students.push({

                    id: studentId,

                    studentName:
                        data.studentName || "",

                    studentEmail:
                        data.studentEmail || "",

                    trustContribution,

                    studentPayable,

                    referenceTotalFees,

                    totalPaid,

                    balance

                });

            }
        );


        renderTable(
            students
        );


        updateSummary(
            students
        );


    } catch (error) {

        console.error(
            "Error loading fee reference:",
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


// ========================================
// RENDER TABLE
// ========================================

function renderTable(list) {

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


                <td>

                    <input
                        type="number"
                        class="reference-fee-input"
                        data-id="${student.id}"
                        value="${student.referenceTotalFees}"
                        min="0"
                        step="1"
                        placeholder="Enter fee"
                    >

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


    // ====================================
    // REFERENCE FEE INPUT EVENTS
    // ====================================

    document
        .querySelectorAll(
            ".reference-fee-input"
        )
        .forEach(
            (input) => {

                input.addEventListener(
                    "change",
                    async function () {

                        const id =
                            this.dataset.id;


                        const value =
                            Number(
                                this.value || 0
                            );


                        await saveReferenceFee(
                            id,
                            value
                        );

                    }
                );


                input.addEventListener(
                    "keydown",
                    function (event) {

                        if (
                            event.key === "Enter"
                        ) {

                            event.preventDefault();

                            this.blur();

                        }

                    }
                );

            }
        );


    // ====================================
    // FOOTER TOTAL
    // ====================================

    const totals =
        calculateTotals(list);


    const footer =
        document.createElement("tr");


    footer.innerHTML = `

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
                totals.reference
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


    tableFooter.appendChild(
        footer
    );
}


// ========================================
// SAVE REFERENCE TOTAL FEES
// ========================================

async function saveReferenceFee(
    id,
    value
) {

    try {

        /*
         * VERY IMPORTANT:
         *
         * We save ONLY:
         *
         * referenceTotalFees
         *
         * We DO NOT touch:
         *
         * officeFees.totalFee
         *
         * officeFees.totalPaid
         *
         * studentPayable
         *
         * trustContribution
         */


        await updateDoc(
            doc(
                db,
                "feeRecords",
                id
            ),
            {

                referenceTotalFees:
                    value

            }
        );


        // ==================================
        // UPDATE LOCAL DATA
        // ==================================

        const student =
            students.find(
                (item) =>
                    item.id === id
            );


        if (student) {

            student.referenceTotalFees =
                value;


            student.balance =
                value -
                student.totalPaid;
        }


        // ==================================
        // REFRESH DISPLAY
        // ==================================

        renderTable(
            getFilteredStudents()
        );


        updateSummary(
            getFilteredStudents()
        );


        console.log(
            "Reference Total Fees saved:",
            id,
            value
        );


    } catch (error) {

        console.error(
            "Reference fee save error:",
            error
        );


        alert(
            "Could not save Reference Total Fees.\n\n" +
            error.message
        );


        // Reload original saved value

        loadData();
    }
}


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    () => {

        const filtered =
            getFilteredStudents();


        renderTable(
            filtered
        );


        updateSummary(
            filtered
        );

    }
);


function getFilteredStudents() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!search) {

        return students;
    }


    return students.filter(
        (student) => {

            const name =
                String(
                    student.studentName || ""
                )
                .toLowerCase();


            const email =
                String(
                    student.studentEmail || ""
                )
                .toLowerCase();


            return (
                name.includes(search) ||
                email.includes(search)
            );

        }
    );
}


// ========================================
// REFRESH
// ========================================

refreshBtn.addEventListener(
    "click",
    () => {

        loadData();

    }
);


// ========================================
// SUMMARY
// ========================================

function updateSummary(list) {

    const totals =
        calculateTotals(list);


    document.getElementById(
        "studentCount"
    ).textContent =
        students.length;


    document.getElementById(
        "totalTrust"
    ).textContent =
        formatMoney(
            totals.trust
        );


    document.getElementById(
        "totalStudentPayable"
    ).textContent =
        formatMoney(
            totals.studentPayable
        );


    document.getElementById(
        "totalReferenceFees"
    ).textContent =
        formatMoney(
            totals.reference
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


// ========================================
// CALCULATE TOTALS
// ========================================

function calculateTotals(list) {

    return list.reduce(
        (totals, student) => {

            totals.trust +=
                Number(
                    student.trustContribution || 0
                );


            totals.studentPayable +=
                Number(
                    student.studentPayable || 0
                );


            totals.reference +=
                Number(
                    student.referenceTotalFees || 0
                );


            totals.paid +=
                Number(
                    student.totalPaid || 0
                );


            totals.balance +=
                Number(
                    student.balance || 0
                );


            return totals;

        },
        {
            trust: 0,
            studentPayable: 0,
            reference: 0,
            paid: 0,
            balance: 0
        }
    );
}


// ========================================
// MONEY FORMAT
// ========================================

function formatMoney(amount) {

    return (
        "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN")
    );
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
