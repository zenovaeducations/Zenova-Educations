import { db } from "../firebase-config.js";

import {
    collection,
    getDocs,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// =====================================================
// PASSWORD
// =====================================================

const PASSWORD = "123456";


// =====================================================
// DATA
// =====================================================

let students = [];


// =====================================================
// ELEMENT HELPER
// =====================================================

function el(id) {
    return document.getElementById(id);
}


// =====================================================
// LOGIN ELEMENTS
// =====================================================

const loginScreen = el("loginScreen");
const mainPage = el("mainPage");
const passwordInput = el("password");
const loginBtn = el("loginBtn");
const loginError = el("loginError");


// =====================================================
// PAGE ELEMENTS
// =====================================================

const searchInput = el("searchInput");
const refreshBtn = el("refreshBtn");
const studentsTable = el("studentsTable");
const tableFooter = el("tableFooter");
const emptyMessage = el("emptyMessage");


// =====================================================
// LOGIN
// =====================================================

if (loginBtn) {
    loginBtn.addEventListener("click", login);
}

if (passwordInput) {
    passwordInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            login();
        }

    });
}


function login() {

    const password =
        passwordInput?.value.trim() || "";


    if (password === PASSWORD) {

        if (loginScreen) {
            loginScreen.style.display = "none";
        }

        if (mainPage) {
            mainPage.style.display = "block";
        }

        if (loginError) {
            loginError.textContent = "";
        }

        loadData();

    } else {

        if (loginError) {
            loginError.textContent =
                "Incorrect password.";
        }

        if (passwordInput) {
            passwordInput.value = "";
            passwordInput.focus();
        }
    }
}


// =====================================================
// LOAD DATA
// =====================================================

async function loadData() {

    if (studentsTable) {

        studentsTable.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    Loading fee details...
                </td>
            </tr>
        `;

    }


    if (emptyMessage) {
        emptyMessage.style.display = "none";
    }


    try {

        // =================================================
        // LOAD FEE RECORDS
        // =================================================

        const feeSnapshot =
            await getDocs(
                collection(db, "feeRecords")
            );


        // =================================================
        // LOAD OFFICE FEES
        // =================================================

        const officeSnapshot =
            await getDocs(
                collection(db, "officeFees")
            );


        // =================================================
        // OFFICE PAYMENT LOOKUP
        // =================================================

        const officePayments = {};


        officeSnapshot.forEach((docSnap) => {

            const data = docSnap.data();


            officePayments[docSnap.id] = {

                totalPaid:
                    Number(data.totalPaid || 0)

            };

        });


        // =================================================
        // BUILD STUDENT ARRAY
        // =================================================

        students = [];


        feeSnapshot.forEach((docSnap) => {

            const data = docSnap.data();

            const studentId = docSnap.id;


            // ---------------------------------------------
            // TRUST CONTRIBUTION
            // ---------------------------------------------

            const trustContribution =
                Number(
                    data.trustContribution || 0
                );


            // ---------------------------------------------
            // STUDENT PAYABLE
            // ---------------------------------------------

            const studentPayable =
                Number(
                    data.studentPayable || 0
                );


            // ---------------------------------------------
            // REFERENCE TOTAL FEES
            //
            // THIS IS YOUR EDITABLE VALUE.
            //
            // It is saved ONLY as:
            //
            // referenceTotalFees
            // ---------------------------------------------

            const referenceTotalFees =
                Number(
                    data.referenceTotalFees || 0
                );


            // ---------------------------------------------
            // ACTUAL PAID
            //
            // Comes ONLY from officeFees
            // ---------------------------------------------

            const officeRecord =
                officePayments[studentId];


            const totalPaid =
                officeRecord
                    ? Number(
                        officeRecord.totalPaid || 0
                    )
                    : 0;


            // ---------------------------------------------
            // REFERENCE BALANCE
            // ---------------------------------------------

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

        });


        // =================================================
        // DISPLAY
        // =================================================

        renderTable(students);

        updateSummary(students);

    } catch (error) {

        console.error(
            "Fee reference error:",
            error
        );


        if (studentsTable) {

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

        }


        alert(
            "Could not load fee details.\n\n" +
            error.message
        );
    }
}


// =====================================================
// RENDER TABLE
// =====================================================

function renderTable(list) {

    if (!studentsTable) {
        return;
    }


    studentsTable.innerHTML = "";


    if (tableFooter) {
        tableFooter.innerHTML = "";
    }


    if (!list || list.length === 0) {

        if (emptyMessage) {
            emptyMessage.style.display = "block";
        }

        return;
    }


    if (emptyMessage) {
        emptyMessage.style.display = "none";
    }


    list.forEach((student, index) => {

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
                    data-id="${escapeAttribute(student.id)}"
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

    });


    // =================================================
    // REFERENCE FEE INPUT
    // =================================================

    document
        .querySelectorAll(".reference-fee-input")
        .forEach((input) => {

            input.addEventListener(
                "change",
                async function () {

                    const id =
                        this.dataset.id;


                    let value =
                        Number(
                            this.value || 0
                        );


                    if (value < 0) {
                        value = 0;
                        this.value = 0;
                    }


                    await saveReferenceFee(
                        id,
                        value
                    );

                }
            );


            input.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        event.preventDefault();

                        this.blur();

                    }

                }
            );

        });


    // =================================================
    // GRAND TOTAL
    // =================================================

    if (tableFooter) {

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
            footerRow
        );
    }
}


// =====================================================
// SAVE REFERENCE TOTAL FEES
// =====================================================

async function saveReferenceFee(id, value) {

    try {

        /*
         * ONLY THIS FIELD IS UPDATED:
         *
         * referenceTotalFees
         *
         * NOTHING IN officeFees IS TOUCHED.
         */


        await updateDoc(

            doc(
                db,
                "feeRecords",
                id
            ),

            {
                referenceTotalFees: value
            }

        );


        // =================================================
        // UPDATE LOCAL DATA
        // =================================================

        const student =
            students.find(
                item => item.id === id
            );


        if (student) {

            student.referenceTotalFees =
                value;


            student.balance =
                value -
                student.totalPaid;

        }


        // =================================================
        // REFRESH DISPLAY
        // =================================================

        const filtered =
            getFilteredStudents();


        renderTable(filtered);

        updateSummary(filtered);


        console.log(
            "Reference Total Fees saved:",
            value
        );

    } catch (error) {

        console.error(
            "Reference Total Fees error:",
            error
        );


        alert(
            "Could not save Reference Total Fees.\n\n" +
            error.message
        );


        // Get the saved value again

        await loadData();
    }
}


// =====================================================
// SEARCH
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const filtered =
                getFilteredStudents();


            renderTable(filtered);

            updateSummary(filtered);

        }
    );

}


function getFilteredStudents() {

    const search =
        searchInput?.value
            .trim()
            .toLowerCase() || "";


    if (!search) {
        return students;
    }


    return students.filter((student) => {

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

    });
}


// =====================================================
// REFRESH
// =====================================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        loadData
    );

}


// =====================================================
// SUMMARY
// =====================================================

function updateSummary(list) {

    const totals =
        calculateTotals(list);


    // ---------------------------------------------
    // STUDENT COUNT
    // ---------------------------------------------

    const studentCount =
        el("studentCount");

    if (studentCount) {

        studentCount.textContent =
            students.length;

    }


    // ---------------------------------------------
    // TRUST
    // ---------------------------------------------

    const totalTrust =
        el("totalTrust");

    if (totalTrust) {

        totalTrust.textContent =
            formatMoney(
                totals.trust
            );

    }


    // ---------------------------------------------
    // STUDENT PAYABLE
    // ---------------------------------------------

    const totalStudentPayable =
        el("totalStudentPayable");

    if (totalStudentPayable) {

        totalStudentPayable.textContent =
            formatMoney(
                totals.studentPayable
            );

    }


    // ---------------------------------------------
    // REFERENCE TOTAL
    // ---------------------------------------------

    const totalReferenceFees =
        el("totalReferenceFees");


    if (totalReferenceFees) {

        totalReferenceFees.textContent =
            formatMoney(
                totals.reference
            );

    }


    // ---------------------------------------------
    // TOTAL PAID
    // ---------------------------------------------

    const totalPaid =
        el("totalPaid");


    if (totalPaid) {

        totalPaid.textContent =
            formatMoney(
                totals.paid
            );

    }


    // ---------------------------------------------
    // TOTAL BALANCE
    // ---------------------------------------------

    const totalBalance =
        el("totalBalance");


    if (totalBalance) {

        totalBalance.textContent =
            formatMoney(
                totals.balance
            );

    }
}


// =====================================================
// CALCULATE TOTALS
// =====================================================

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


// =====================================================
// MONEY
// =====================================================

function formatMoney(amount) {

    return (
        "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN")
    );
}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// ATTRIBUTE ESCAPE
// =====================================================

function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
