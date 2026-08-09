// ==========================================================
// ZENOVA EDUCATIONS
// STUDENT VIEW PANEL
// view.js
// NO PASSWORD HASH
// ==========================================================

import { db } from "../firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ==========================================================
// PASSWORD SCREEN
// ==========================================================

const passwordScreen =
    document.getElementById("passwordScreen");

const studentsApp =
    document.getElementById("studentsApp");

const passwordForm =
    document.getElementById("passwordForm");

const viewPassword =
    document.getElementById("viewPassword");

const passwordError =
    document.getElementById("passwordError");

const continueButton =
    document.getElementById("continueButton");

const togglePassword =
    document.getElementById("togglePassword");


// ==========================================================
// SHOW / HIDE PASSWORD
// ==========================================================

togglePassword.addEventListener("click", () => {

    if (viewPassword.type === "password") {

        viewPassword.type = "text";

        togglePassword.innerHTML =
            '<i class="ri-eye-off-line"></i>';

    } else {

        viewPassword.type = "password";

        togglePassword.innerHTML =
            '<i class="ri-eye-line"></i>';

    }

});


// ==========================================================
// PASSWORD VERIFICATION
// ==========================================================

passwordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        passwordError.textContent = "";

        const password =
            viewPassword.value.trim();


        if (!password) {

            passwordError.textContent =
                "Please enter the password.";

            return;

        }


        try {

            continueButton.disabled = true;

            continueButton.innerHTML =
                "Checking...";


            // ------------------------------------------
            // GET PASSWORD FROM FIRESTORE
            // ------------------------------------------

            const accessRef =
                doc(
                    db,
                    "viewSettings",
                    "access"
                );


            const accessSnapshot =
                await getDoc(accessRef);


            if (!accessSnapshot.exists()) {

                passwordError.textContent =
                    "Password settings not found.";

                return;

            }


            const accessData =
                accessSnapshot.data();


            const storedPassword =
                accessData.password;


            if (!storedPassword) {

                passwordError.textContent =
                    "Password has not been configured.";

                return;

            }


            // ------------------------------------------
            // CHECK PASSWORD
            // ------------------------------------------

            if (password === storedPassword) {

                // PASSWORD CORRECT

                passwordScreen.style.display =
                    "none";

                studentsApp.style.display =
                    "block";

                document.body.style.overflow =
                    "";


                // Load students only after
                // successful password verification

                await loadStudents();


            } else {

                // PASSWORD WRONG

                passwordError.textContent =
                    "Incorrect password.";

                viewPassword.value = "";

                viewPassword.focus();

            }

        }

        catch (error) {

            console.error(
                "Password verification error:",
                error
            );

            passwordError.textContent =
                "Unable to verify password.";

        }

        finally {

            continueButton.disabled = false;

            continueButton.innerHTML =
                `Continue
                 <i class="ri-arrow-right-line"></i>`;

        }

    }
);


// ==========================================================
// STUDENT ELEMENTS
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


// ==========================================================
// MODAL
// ==========================================================

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

        studentList.innerHTML = `
            <div class="loading">

                <div class="loader"></div>

                <p>Loading students...</p>

            </div>
        `;


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
                    Check your Firestore permissions.
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


    const filteredStudents =
        students.filter((student) => {


            // ------------------------------------------
            // CLASS FILTER
            // ------------------------------------------

            if (
                currentFilter !== "all" &&
                student.joiningClass !== currentFilter
            ) {

                return false;

            }


            // ------------------------------------------
            // SEARCH
            // ------------------------------------------

            if (!search) {

                return true;

            }


            const name =
                String(
                    student.name || ""
                ).toLowerCase();


            const phone =
                String(
                    student.phone || ""
                ).toLowerCase();


            const email =
                String(
                    student.email || ""
                ).toLowerCase();


            const school =
                String(
                    student.schoolName || ""
                ).toLowerCase();


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


    // ------------------------------------------
    // NO RESULTS
    // ------------------------------------------

    if (
        filteredStudents.length === 0
    ) {

        studentList.innerHTML = "";

        noResults.style.display =
            "block";

        return;

    }


    noResults.style.display =
        "none";


    // ------------------------------------------
    // STUDENT CARDS
    // ------------------------------------------

    studentList.innerHTML =
        filteredStudents
            .map(
                (student) =>
                    createStudentCard(student)
            )
            .join("");


    // ------------------------------------------
    // CLICK STUDENT
    // ------------------------------------------

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

                        openStudentModal(
                            student
                        );

                    }

                }
            );

        });

}


// ==========================================================
// STUDENT CARD
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


    const district =
        student.district ||
        "";


    return `

        <div
            class="student-card"
            data-id="${escapeAttribute(student.id)}">

            <img
                src="${escapeAttribute(photo)}"
                alt="Student">

            <div class="student-info">

                <h3>
                    ${escapeHTML(name)}
                </h3>

                <p>
                    ${escapeHTML(className)}
                    ${
                        combination
                            ? " • " +
                              escapeHTML(combination)
                            : ""
                    }
                </p>

                <small>
                    ${escapeHTML(course)}
                    ${
                        district
                            ? " • " +
                              escapeHTML(district)
                            : ""
                    }
                </small>

            </div>

            <div class="student-arrow">

                <i class="ri-arrow-right-s-line"></i>

            </div>

        </div>

    `;

}


// ==========================================================
// FILTERS
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
// OPEN STUDENT MODAL
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


    // PERSONAL

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


    // ACADEMIC

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


    // ADDRESS

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


    // FEES

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


    // STATUS

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


    // SHOW

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
// ESCAPE
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
// IMPORTANT
// ==========================================================

// DO NOT call loadStudents() here.
//
// Students will only be loaded after the
// correct password is entered.
