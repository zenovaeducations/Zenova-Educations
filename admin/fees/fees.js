import { db } from "../../firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* =========================
   ELEMENTS
========================= */

const studentSearch =
    document.getElementById("studentSearch");

const studentList =
    document.getElementById("studentList");

const selectedStudentSection =
    document.getElementById("selectedStudentSection");

const feeSection =
    document.getElementById("feeSection");

const selectedName =
    document.getElementById("selectedName");

const selectedEmail =
    document.getElementById("selectedEmail");

const selectedCourse =
    document.getElementById("selectedCourse");

const studentAvatar =
    document.getElementById("studentAvatar");

const collegeFee =
    document.getElementById("collegeFee");

const trustContribution =
    document.getElementById("trustContribution");

const scholarship =
    document.getElementById("scholarship");

const displayCollegeFee =
    document.getElementById("displayCollegeFee");

const displayTrust =
    document.getElementById("displayTrust");

const displayScholarship =
    document.getElementById("displayScholarship");

const studentPayable =
    document.getElementById("studentPayable");

const saveBtn =
    document.getElementById("saveBtn");

const message =
    document.getElementById("message");


let students = [];

let selectedStudent = null;


/* =========================
   LOAD STUDENTS
========================= */

loadStudents();


async function loadStudents() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "students")
            );

        students = [];

        snapshot.forEach(document => {

            students.push({
                id: document.id,
                ...document.data()
            });

        });

        displayStudents(students);

    } catch (error) {

        console.error(error);

        studentList.innerHTML = `
            <div class="loading">
                Unable to load students.
            </div>
        `;

    }

}


/* =========================
   DISPLAY STUDENTS
========================= */

function displayStudents(data) {

    if (data.length === 0) {

        studentList.innerHTML = `
            <div class="loading">
                No students found.
            </div>
        `;

        return;
    }


    studentList.innerHTML =
        data.map(student => {

            const name =
                student.name ||
                student.fullName ||
                "Unnamed Student";

            const email =
                student.email || "-";


            return `

                <button
                    class="student-item"
                    data-id="${student.id}"
                >

                    <div class="student-mini-avatar">
                        ${escapeHTML(
                            name.charAt(0).toUpperCase()
                        )}
                    </div>

                    <div class="student-info">

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                        <div class="student-email">
                            ${escapeHTML(email)}
                        </div>

                    </div>

                </button>

            `;

        }).join("");


    document
        .querySelectorAll(".student-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => selectStudent(button.dataset.id)
            );

        });

}


/* =========================
   SELECT STUDENT
========================= */

async function selectStudent(id) {

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


    selectedName.textContent = name;

    selectedEmail.textContent =
        selectedStudent.email || "-";


    selectedCourse.textContent =
        [
            selectedStudent.course,
            selectedStudent.combination
        ]
        .filter(Boolean)
        .join(" • ") || "Course not specified";


    studentAvatar.textContent =
        name.charAt(0).toUpperCase();


    selectedStudentSection.classList.remove(
        "hidden"
    );

    feeSection.classList.remove(
        "hidden"
    );


    /* Clear previous values */

    collegeFee.value = "";
    trustContribution.value = "";
    scholarship.value = "";


    updateCalculation();


    /* Check if fee already exists */

    try {

        const feeDoc =
            await getDocs(
                collection(db, "feeRecords")
            );


        const existing =
            feeDoc.docs.find(
                document =>
                    document.id === selectedStudent.id
            );


        if (existing) {

            const data =
                existing.data();


            collegeFee.value =
                data.totalCollegeFee || "";

            trustContribution.value =
                data.trustContribution || "";

            scholarship.value =
                data.scholarship || "";

            updateCalculation();

        }

    } catch (error) {

        console.log(
            "No previous fee record loaded."
        );

    }


    feeSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================
   CALCULATION
========================= */

[
    collegeFee,
    trustContribution,
    scholarship
].forEach(input => {

    input.addEventListener(
        "input",
        updateCalculation
    );

});


function updateCalculation() {

    const college =
        Number(collegeFee.value) || 0;

    const trust =
        Number(trustContribution.value) || 0;

    const scholarshipAmount =
        Number(scholarship.value) || 0;


    let payable =
        college -
        trust -
        scholarshipAmount;


    if (payable < 0) {
        payable = 0;
    }


    displayCollegeFee.textContent =
        formatMoney(college);

    displayTrust.textContent =
        "− " + formatMoney(trust);

    displayScholarship.textContent =
        "− " + formatMoney(scholarshipAmount);

    studentPayable.textContent =
        formatMoney(payable);

}


/* =========================
   SAVE
========================= */

saveBtn.addEventListener(
    "click",
    saveFee
);


async function saveFee() {

    if (!selectedStudent) {

        showMessage(
            "Please select a student first.",
            "error"
        );

        return;
    }


    const college =
        Number(collegeFee.value) || 0;

    const trust =
        Number(trustContribution.value) || 0;

    const scholarshipAmount =
        Number(scholarship.value) || 0;


    if (college <= 0) {

        showMessage(
            "Please enter the total college fee.",
            "error"
        );

        collegeFee.focus();

        return;
    }


    if (trust + scholarshipAmount > college) {

        showMessage(
            "Trust contribution and scholarship cannot exceed the college fee.",
            "error"
        );

        return;
    }


    const payable =
        college -
        trust -
        scholarshipAmount;


    saveBtn.disabled = true;

    saveBtn.textContent =
        "Saving...";


    try {

        await setDoc(
            doc(
                db,
                "feeRecords",
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


                totalCollegeFee:
                    college,

                trustContribution:
                    trust,

                scholarship:
                    scholarshipAmount,

                studentPayable:
                    payable,


                totalPaid:
                    0,

                balance:
                    payable,

                status:
                    payable === 0
                        ? "Paid"
                        : "Pending",


                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        showMessage(
            "Fee structure saved successfully.",
            "success"
        );


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to save fee structure.",
            "error"
        );

    }


    saveBtn.disabled = false;

    saveBtn.textContent =
        "Save Fee Structure";

}


/* =========================
   SEARCH
========================= */

studentSearch.addEventListener(
    "input",
    () => {

        const search =
            studentSearch.value
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

function showMessage(text, type) {

    message.textContent = text;

    message.className =
        "message " + type;

}


/* =========================
   MONEY
========================= */

function formatMoney(amount) {

    return "₹" +
        Number(amount).toLocaleString(
            "en-IN"
        );

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
