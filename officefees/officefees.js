// ==========================================================
// ZENOVA EDUCATIONS
// OFFICE FEES PORTAL
// ==========================================================

import { db } from "../firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const accessScreen =
    document.getElementById("accessScreen");

const officePortal =
    document.getElementById("officePortal");

const officePassword =
    document.getElementById("officePassword");

const togglePassword =
    document.getElementById("togglePassword");

const unlockButton =
    document.getElementById("unlockButton");

const accessError =
    document.getElementById("accessError");


const studentSearch =
    document.getElementById("studentSearch");

const studentResults =
    document.getElementById("studentResults");

const studentCount =
    document.getElementById("studentCount");


const selectedStudentCard =
    document.getElementById(
        "selectedStudentCard"
    );

const feeSection =
    document.getElementById(
        "feeSection"
    );


const selectedStudentName =
    document.getElementById(
        "selectedStudentName"
    );

const selectedStudentInfo =
    document.getElementById(
        "selectedStudentInfo"
    );

const selectedClass =
    document.getElementById(
        "selectedClass"
    );

const selectedCourse =
    document.getElementById(
        "selectedCourse"
    );

const selectedCombination =
    document.getElementById(
        "selectedCombination"
    );


const alreadyLocked =
    document.getElementById(
        "alreadyLocked"
    );

const saveFeeButton =
    document.getElementById(
        "saveFeeButton"
    );


const advanceAmount =
    document.getElementById(
        "advanceAmount"
    );

const advanceDate =
    document.getElementById(
        "advanceDate"
    );


const firstAmount =
    document.getElementById(
        "firstAmount"
    );

const firstDate =
    document.getElementById(
        "firstDate"
    );


const secondAmount =
    document.getElementById(
        "secondAmount"
    );

const secondDate =
    document.getElementById(
        "secondDate"
    );


const totalFee =
    document.getElementById(
        "totalFee"
    );


// ==========================================================
// DATA
// ==========================================================

let allStudents = [];

let selectedStudent = null;

let selectedStudentFeeLocked = false;


// ==========================================================
// OFFICE PASSWORD
// ==========================================================

const OFFICE_PASSWORD = "123456";


// ==========================================================
// PASSWORD VISIBILITY
// ==========================================================

togglePassword.addEventListener(
    "click",
    () => {

        if(
            officePassword.type === "password"
        ){

            officePassword.type = "text";

            togglePassword.innerHTML =
                `<i class="ri-eye-off-line"></i>`;

        }
        else{

            officePassword.type = "password";

            togglePassword.innerHTML =
                `<i class="ri-eye-line"></i>`;

        }

    }
);


// ==========================================================
// UNLOCK OFFICE
// ==========================================================

unlockButton.addEventListener(
    "click",
    async () => {

        const password =
            officePassword.value.trim();


        if(!password){

            showAccessError(
                "Please enter the office password."
            );

            return;

        }


        if(
            password !== OFFICE_PASSWORD
        ){

            showAccessError(
                "Incorrect office password."
            );

            officePassword.value = "";

            officePassword.focus();

            return;

        }


        try{

            unlockButton.disabled = true;

            unlockButton.innerHTML = `
                <i class="ri-loader-4-line"></i>
                <span>Loading Students...</span>
            `;


            await loadStudents();


            accessScreen.style.display =
                "none";

            officePortal.style.display =
                "block";


            // IMPORTANT:
            // Show ALL students immediately.

            renderStudentResults();


            studentSearch.focus();

        }

        catch(error){

            console.error(
                "Office portal error:",
                error
            );

            showAccessError(
                "Unable to load student records. Check Firestore permissions."
            );

        }

        finally{

            unlockButton.disabled = false;

            unlockButton.innerHTML = `
                <i class="ri-lock-unlock-line"></i>
                <span>Enter Office Portal</span>
            `;

        }

    }
);


// ==========================================================
// ENTER PASSWORD WITH ENTER KEY
// ==========================================================

officePassword.addEventListener(
    "keydown",
    (event) => {

        if(event.key === "Enter"){

            unlockButton.click();

        }

    }
);


// ==========================================================
// LOAD ALL STUDENTS
// ==========================================================

async function loadStudents(){

    const snapshot =
        await getDocs(
            collection(
                db,
                "students"
            )
        );


    allStudents = [];


    snapshot.forEach(
        (document) => {

            allStudents.push({

                id: document.id,

                ...document.data()

            });

        }
    );


    // Alphabetical order

    allStudents.sort(
        (a,b) => {

            const nameA =
                String(
                    a.name || ""
                ).toLowerCase();

            const nameB =
                String(
                    b.name || ""
                ).toLowerCase();

            return nameA.localeCompare(
                nameB
            );

        }
    );


    studentCount.textContent =
        allStudents.length;

}


// ==========================================================
// SEARCH
// ==========================================================

studentSearch.addEventListener(
    "input",
    () => {

        renderStudentResults();

    }
);


// ==========================================================
// RENDER ALL / SEARCHED STUDENTS
// ==========================================================

function renderStudentResults(){

    const search =
        studentSearch.value
            .trim()
            .toLowerCase();


    const results =
        allStudents.filter(
            (student) => {

                // No search:
                // show EVERY student.

                if(!search){

                    return true;

                }


                const name =
                    String(
                        student.name || ""
                    ).toLowerCase();

                const email =
                    String(
                        student.email || ""
                    ).toLowerCase();

                const phone =
                    String(
                        student.phone || ""
                    ).toLowerCase();

                const school =
                    String(
                        student.schoolName || ""
                    ).toLowerCase();


                return (
                    name.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search) ||
                    school.includes(search)
                );

            }
        );


    if(results.length === 0){

        studentResults.innerHTML = `

            <div class="no-students">

                <i class="ri-user-search-line"></i>

                <strong>
                    No students found
                </strong>

                <span>
                    Try another name or phone number.
                </span>

            </div>

        `;

        return;

    }


    studentResults.innerHTML =
        results
            .map(
                (student) =>
                    createStudentResult(
                        student
                    )
            )
            .join("");


    document
        .querySelectorAll(
            ".student-result"
        )
        .forEach(
            (element) => {

                element.addEventListener(
                    "click",
                    () => {

                        const id =
                            element.dataset.id;


                        const student =
                            allStudents.find(
                                (item) =>
                                    item.id === id
                            );


                        if(student){

                            selectStudent(
                                student
                            );

                        }

                    }
                );

            }
        );

}


// ==========================================================
// STUDENT RESULT CARD
// ==========================================================

function createStudentResult(
    student
){

    const name =
        escapeHTML(
            student.name ||
            "Unnamed Student"
        );


    const email =
        escapeHTML(
            student.email ||
            "No email"
        );


    const className =
        escapeHTML(
            student.joiningClass ||
            "—"
        );


    const course =
        escapeHTML(
            student.course ||
            "—"
        );


    const combination =
        escapeHTML(
            student.combination ||
            "—"
        );


    return `

        <div
            class="student-result"
            data-id="${student.id}">

            <div class="student-result-icon">

                <i class="ri-user-3-line"></i>

            </div>


            <div class="student-result-info">

                <strong>
                    ${name}
                </strong>

                <span>
                    ${className}
                    •
                    ${course}
                    ${combination !== "—"
                        ? " • " + combination
                        : ""}
                </span>

                <small>
                    ${email}
                </small>

            </div>


            <i class="ri-arrow-right-s-line"></i>

        </div>

    `;

}


// ==========================================================
// SELECT STUDENT
// ==========================================================

async function selectStudent(
    student
){

    selectedStudent =
        student;


    studentSearch.value =
        student.name || "";


    studentResults.innerHTML =
        "";


    selectedStudentName.textContent =
        student.name || "—";


    selectedStudentInfo.textContent =
        student.email ||
        student.phone ||
        "—";


    selectedClass.textContent =
        student.joiningClass ||
        "—";


    selectedCourse.textContent =
        student.course ||
        "—";


    selectedCombination.textContent =
        student.combination ||
        "—";


    selectedStudentCard.style.display =
        "block";


    feeSection.style.display =
        "block";


    await checkExistingOfficeFee(
        student.id
    );


    feeSection.scrollIntoView({
        behavior:"smooth",
        block:"start"
    });

}


// ==========================================================
// CHECK OFFICE FEE RECORD
// ==========================================================

async function checkExistingOfficeFee(
    studentId
){

    try{

        const feeRef =
            doc(
                db,
                "officeFees",
                studentId
            );


        const snapshot =
            await getDoc(
                feeRef
            );


        if(
            snapshot.exists()
        ){

            const data =
                snapshot.data();


            if(
                data.locked === true
            ){

                selectedStudentFeeLocked =
                    true;


                fillExistingFees(
                    data
                );


                lockFeeForm();


                return;

            }

        }


        selectedStudentFeeLocked =
            false;


        clearFeeFields();

        unlockFeeForm();

    }

    catch(error){

        console.error(
            "Fee record check error:",
            error
        );

        alert(
            "Unable to check official fee record."
        );

    }

}


// ==========================================================
// FILL EXISTING RECORD
// ==========================================================

function fillExistingFees(
    data
){

    advanceAmount.value =
        data.advancePaid ?? "";


    advanceDate.value =
        data.advancePaidDate ?? "";


    firstAmount.value =
        data.firstInstallment ?? "";


    firstDate.value =
        data.firstInstallmentDate ?? "";


    secondAmount.value =
        data.secondInstallment ?? "";


    secondDate.value =
        data.secondInstallmentDate ?? "";


    calculateTotal();

}


// ==========================================================
// LOCK FEE FORM
// ==========================================================

function lockFeeForm(){

    alreadyLocked.style.display =
        "flex";


    const fields = [

        advanceAmount,
        advanceDate,

        firstAmount,
        firstDate,

        secondAmount,
        secondDate

    ];


    fields.forEach(
        (field) => {

            field.disabled = true;

        }
    );


    saveFeeButton.disabled =
        true;


    saveFeeButton.innerHTML = `
        <i class="ri-lock-fill"></i>
        <span>Fee Record Locked</span>
    `;

}


// ==========================================================
// UNLOCK NEW FEE FORM
// ==========================================================

function unlockFeeForm(){

    alreadyLocked.style.display =
        "none";


    const fields = [

        advanceAmount,
        advanceDate,

        firstAmount,
        firstDate,

        secondAmount,
        secondDate

    ];


    fields.forEach(
        (field) => {

            field.disabled = false;

        }
    );


    saveFeeButton.disabled =
        false;


    saveFeeButton.innerHTML = `
        <i class="ri-lock-2-line"></i>
        <span>Save & Lock Fee Record</span>
    `;

}


// ==========================================================
// CLEAR FEE FIELDS
// ==========================================================

function clearFeeFields(){

    advanceAmount.value = "";

    advanceDate.value = "";

    firstAmount.value = "";

    firstDate.value = "";

    secondAmount.value = "";

    secondDate.value = "";

    calculateTotal();

}


// ==========================================================
// TOTAL CALCULATION
// ==========================================================

[
    advanceAmount,
    firstAmount,
    secondAmount

].forEach(
    (input) => {

        input.addEventListener(
            "input",
            calculateTotal
        );

    }
);


function calculateTotal(){

    const advance =
        Number(
            advanceAmount.value
        ) || 0;


    const first =
        Number(
            firstAmount.value
        ) || 0;


    const second =
        Number(
            secondAmount.value
        ) || 0;


    const total =
        advance +
        first +
        second;


    totalFee.textContent =
        "₹" +
        total.toLocaleString(
            "en-IN"
        );

}


// ==========================================================
// SAVE OFFICIAL FEE
// ==========================================================

saveFeeButton.addEventListener(
    "click",
    async () => {

        if(!selectedStudent){

            alert(
                "Please select a student."
            );

            return;

        }


        if(selectedStudentFeeLocked){

            alert(
                "This fee record is already locked."
            );

            return;

        }


        const advance =
            Number(
                advanceAmount.value
            ) || 0;


        const first =
            Number(
                firstAmount.value
            ) || 0;


        const second =
            Number(
                secondAmount.value
            ) || 0;


        const total =
            advance +
            first +
            second;


        // --------------------------------------
        // DATE VALIDATION
        // --------------------------------------

        if(
            advance > 0 &&
            !advanceDate.value
        ){

            alert(
                "Please enter the advance paid date."
            );

            advanceDate.focus();

            return;

        }


        if(
            first > 0 &&
            !firstDate.value
        ){

            alert(
                "Please enter the 1st installment paid date."
            );

            firstDate.focus();

            return;

        }


        if(
            second > 0 &&
            !secondDate.value
        ){

            alert(
                "Please enter the 2nd installment paid date."
            );

            secondDate.focus();

            return;

        }


        // --------------------------------------
        // CONFIRM
        // --------------------------------------

        const confirmed =
            confirm(
                "Once saved, this official fee record cannot be edited. Continue?"
            );


        if(!confirmed){

            return;

        }


        try{

            saveFeeButton.disabled =
                true;


            saveFeeButton.innerHTML = `
                <i class="ri-loader-4-line"></i>
                <span>Saving...</span>
            `;


            const feeRef =
                doc(
                    db,
                    "officeFees",
                    selectedStudent.id
                );


            // ----------------------------------
            // FINAL CHECK
            // ----------------------------------

            const existing =
                await getDoc(
                    feeRef
                );


            if(
                existing.exists() &&
                existing.data().locked === true
            ){

                alert(
                    "This student's official fee record has already been locked."
                );


                await checkExistingOfficeFee(
                    selectedStudent.id
                );


                return;

            }


            // ----------------------------------
            // SAVE
            // ----------------------------------

            await setDoc(
                feeRef,
                {

                    studentId:
                        selectedStudent.id,

                    studentName:
                        selectedStudent.name || "",

                    studentEmail:
                        selectedStudent.email || "",

                    advancePaid:
                        advance,

                    advancePaidDate:
                        advanceDate.value || null,

                    firstInstallment:
                        first,

                    firstInstallmentDate:
                        firstDate.value || null,

                    secondInstallment:
                        second,

                    secondInstallmentDate:
                        secondDate.value || null,

                    totalPaid:
                        total,

                    locked:
                        true,

                    savedAt:
                        serverTimestamp()

                }
            );


            // ----------------------------------
            // LOCK LOCALLY
            // ----------------------------------

            selectedStudentFeeLocked =
                true;


            lockFeeForm();


            alert(
                "Official fee record saved and locked successfully."
            );

        }

        catch(error){

            console.error(
                "Fee save error:",
                error
            );


            alert(
                "Unable to save official fee record."
            );


            saveFeeButton.disabled =
                false;


            saveFeeButton.innerHTML = `
                <i class="ri-lock-2-line"></i>
                <span>Save & Lock Fee Record</span>
            `;

        }

    }
);


// ==========================================================
// HTML SAFETY
// ==========================================================

function escapeHTML(
    value
){

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


// ==========================================================
// ACCESS ERROR
// ==========================================================

function showAccessError(
    text
){

    accessError.textContent =
        text;

    accessError.classList.add(
        "show"
    );

}


// ==========================================================
// INITIAL
// ==========================================================

calculateTotal();
