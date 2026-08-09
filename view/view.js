// ==========================================================
// ZENOVA EDUCATIONS
// STUDENT VIEW PANEL
// view.js
// ==========================================================

import { db } from "../firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const studentList =
    document.getElementById("studentList");

const totalStudents =
    document.getElementById("totalStudents");

const resultCount =
    document.getElementById("resultCount");

const searchInput =
    document.getElementById("searchInput");

const noResults =
    document.getElementById("noResults");

const filterButtons =
    document.querySelectorAll(".filter-btn");


// MODAL

const modalOverlay =
    document.getElementById("modalOverlay");

const closeModal =
    document.getElementById("closeModal");


// ==========================================================
// DATA
// ==========================================================

let students = [];

let currentFilter = "all";


// ==========================================================
// LOAD STUDENTS
// ==========================================================

async function loadStudents() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "students")
            );

        students = [];

        snapshot.forEach((document) => {

            students.push({

                id: document.id,

                ...document.data()

            });

        });


        totalStudents.textContent =
            students.length;

        renderStudents();

    }

    catch (error) {

        console.error(
            "Error loading students:",
            error
        );

        studentList.innerHTML = `
            <div class="no-results">

                <i class="ri-error-warning-line"></i>

                <h3>Unable to load students</h3>

                <p>
                    Please check your Firebase connection
                    and Firestore permissions.
                </p>

            </div>
        `;

    }

}


// ==========================================================
// RENDER STUDENTS
// ==========================================================

function renderStudents() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    let filteredStudents =
        students.filter((student) => {

            // --------------------------------------
            // CLASS FILTER
            // --------------------------------------

            if (
                currentFilter !== "all" &&
                student.joiningClass !== currentFilter
            ) {

                return false;

            }


            // --------------------------------------
            // SEARCH
            // --------------------------------------

            if (!search) {

                return true;

            }


            const name =
                String(student.name || "")
                    .toLowerCase();

            const phone =
                String(student.phone || "")
                    .toLowerCase();

            const email =
                String(student.email || "")
                    .toLowerCase();

            const school =
                String(student.schoolName || "")
                    .toLowerCase();


            return (
                name.includes(search) ||
                phone.includes(search) ||
                email.includes(search) ||
                school.includes(search)
            );

        });


    resultCount.textContent =
        `${filteredStudents.length} ${
            filteredStudents.length === 1
                ? "student"
                : "students"
        }`;


    // --------------------------------------
    // NO RESULTS
    // --------------------------------------

    if (filteredStudents.length === 0) {

        studentList.innerHTML = "";

        noResults.style.display =
            "block";

        return;

    }


    noResults.style.display =
        "none";


    // --------------------------------------
    // STUDENT CARDS
    // --------------------------------------

    studentList.innerHTML =
        filteredStudents.map(
            (student) => createStudentCard(student)
        ).join("");


    // --------------------------------------
    // CARD CLICK
    // --------------------------------------

    document
        .querySelectorAll(".student-card")
        .forEach((card) => {

            card.addEventListener(
                "click",
                () => {

                    const id =
                        card.dataset.id;

                    const student =
                        students.find(
                            (item) =>
                                item.id === id
                        );

                    if (student) {

                        openStudentModal(student);

                    }

                }
            );

        });

}


// ==========================================================
// CREATE STUDENT CARD
// ==========================================================

function createStudentCard(student) {

    const photo =
        student.photo ||
        "../assets/images/profile.png";


    const name =
        student.name ||
        "Student";


    const className =
        student.joiningClass ||
        "—";


    const combination =
        student.combination ||
        "";


    const course =
        student.course ||
        "";


    const location =
        student.district ||
        "";


    return `

        <div
            class="student-card"
            data-id="${student.id}">

            <img
                src="${escapeAttribute(photo)}"
                alt="Student">

            <div class="student-info">

                <h3>
                    ${escapeHTML(name)}
                </h3>

                <p>
                    ${escapeHTML(className)}
                    ${combination
                        ? " • " + escapeHTML(combination)
                        : ""}
                </p>

                <small>
                    ${escapeHTML(course)}
                    ${location
                        ? " • " + escapeHTML(location)
                        : ""}
                </small>

            </div>

            <div class="student-arrow">

                <i class="ri-arrow-right-s-line"></i>

            </div>

        </div>

    `;

}


// ==========================================================
// FILTER BUTTONS
// ==========================================================

filterButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(
                (item) => {

                    item.classList.remove(
                        "active"
                    );

                }
            );


            button.classList.add(
                "active"
            );


            currentFilter =
                button.dataset.filter;


            renderStudents();

        }
    );

});


// ==========================================================
// SEARCH
// ==========================================================

searchInput.addEventListener(
    "input",
    () => {

        renderStudents();

    }
);


// ==========================================================
// OPEN MODAL
// ==========================================================

function openStudentModal(student) {

    const photo =
        student.photo ||
        "../assets/images/profile.png";


    document.getElementById(
        "modalPhoto"
    ).src = photo;


    document.getElementById(
        "modalName"
    ).textContent =
        student.name || "—";


    document.getElementById(
        "modalEmail"
    ).textContent =
        student.email || "—";


    // --------------------------------------
    // PERSONAL
    // --------------------------------------

    setText(
        "modalPhone",
        student.phone
    );

    setText(
        "modalDOB",
        student.dob
    );

    setText(
        "modalFather",
        student.fatherName
    );

    setText(
        "modalMother",
        student.motherName
    );


    // --------------------------------------
    // ACADEMIC
    // --------------------------------------

    setText(
        "modalSchool",
        student.schoolName
    );

    setText(
        "modalPercentage",
        student.sslcPercentage !== undefined
            ? `${student.sslcPercentage}%`
            : "—"
    );

    setText(
        "modalMedium",
        student.sslcMedium
    );

    setText(
        "modalRegister",
        student.sslcRegisterNumber
    );

    setText(
        "modalClass",
        student.joiningClass
    );

    setText(
        "modalCourse",
        student.course
    );

    setText(
        "modalCombination",
        student.combination
    );


    // --------------------------------------
    // ADDRESS
    // --------------------------------------

    setText(
        "modalState",
        student.state
    );

    setText(
        "modalDistrict",
        student.district
    );

    setText(
        "modalTaluk",
        student.taluk
    );

    setText(
        "modalVillage",
        student.village
    );

    setText(
        "modalPincode",
        student.pincode
    );

    setText(
        "modalAddress",
        student.fullAddress
    );


    // --------------------------------------
    // FEES
    // --------------------------------------

    const fee =
        student.fee || {};


    document.getElementById(
        "modalAdvance"
    ).textContent =
        formatCurrency(
            fee.advancePaid
        );


    document.getElementById(
        "modalInstallment"
    ).textContent =
        formatCurrency(
            fee.firstInstallment
        );


    document.getElementById(
        "modalTotal"
    ).textContent =
        formatCurrency(
            fee.totalPaid
        );


    // --------------------------------------
    // STATUS
    // --------------------------------------

    document.getElementById(
        "modalOnboarding"
    ).textContent =
        student.onboardingCompleted === true
            ? "Completed ✓"
            : "Pending";


    document.getElementById(
        "modalFeeStatus"
    ).textContent =
        student.feeCompleted === true
            ? "Completed ✓"
            : "Pending";


    // --------------------------------------
    // SHOW MODAL
    // --------------------------------------

    modalOverlay.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";

}


// ==========================================================
// CLOSE MODAL
// ==========================================================

function closeStudentModal() {

    modalOverlay.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";

}


closeModal.addEventListener(
    "click",
    closeStudentModal
);


modalOverlay.addEventListener(
    "click",
    (event) => {

        if (
            event.target === modalOverlay
        ) {

            closeStudentModal();

        }

    }
);


// ==========================================================
// ESCAPE KEY
// ==========================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeStudentModal();

        }

    }
);


// ==========================================================
// HELPERS
// ==========================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {

        return;

    }

    element.textContent =
        value !== undefined &&
        value !== null &&
        value !== ""
            ? value
            : "—";

}


function formatCurrency(amount) {

    const value =
        Number(amount) || 0;

    return "₹" +
        value.toLocaleString("en-IN");

}


// ==========================================================
// BASIC HTML SAFETY
// ==========================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================================
// START
// ==========================================================

loadStudents();
