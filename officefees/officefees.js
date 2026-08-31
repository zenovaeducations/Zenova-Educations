// ==========================================================
// ZENOVA EDUCATIONS
// OFFICE FEES PORTAL
// officefees.js
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

const selectedStudentCard =
    document.getElementById("selectedStudentCard");

const feeSection =
    document.getElementById("feeSection");

const selectedStudentName =
    document.getElementById("selectedStudentName");

const selectedStudentInfo =
    document.getElementById("selectedStudentInfo");

const selectedClass =
    document.getElementById("selectedClass");

const selectedCourse =
    document.getElementById("selectedCourse");

const selectedCombination =
    document.getElementById("selectedCombination");

const saveFeeButton =
    document.getElementById("saveFeeButton");

const alreadyLocked =
    document.getElementById("alreadyLocked");


// Fee fields

const advanceAmount =
    document.getElementById("advanceAmount");

const advanceDate =
    document.getElementById("advanceDate");

const firstAmount =
    document.getElementById("firstAmount");

const firstDate =
    document.getElementById("firstDate");

const secondAmount =
    document.getElementById("secondAmount");

const secondDate =
    document.getElementById("secondDate");

const totalFee =
    document.getElementById("totalFee");


// ==========================================================
// DATA
// ==========================================================

let allStudents = [];

let selectedStudent = null;

let selectedStudentFeeLocked = false;


// ==========================================================
// TEMPORARY OFFICE PASSWORD
// ==========================================================
//
// IMPORTANT:
// This is only for testing.
// Because this file is hosted on GitHub,
// this password can be inspected from JavaScript.
//
// We will move this to a proper secure Firebase
// authentication system before production.
// ==========================================================

const OFFICE_PASSWORD =
    "123456";


// ==========================================================
// PASSWORD TOGGLE
// ==========================================================

togglePassword.addEventListener(
    "click",
    () => {

        if(
            officePassword.type === "password"
        ){

            officePassword.type =
                "text";

            togglePassword.innerHTML =
                `<i class="ri-eye-off-line"></i>`;

        }
        else{

            officePassword.type =
                "password";

            togglePassword.innerHTML =
                `<i class="ri-eye-line"></i>`;

        }

    }
);


// ==========================================================
// UNLOCK PORTAL
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


        if(password !== OFFICE_PASSWORD){

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
                <span>Opening...</span>
            `;


            await loadStudents();


            accessScreen.style.display =
                "none";

            officePortal.style.display =
                "block";


            studentSearch.focus();

        }

        catch(error){

            console.error(error);

            showAccessError(
                "Unable to load student records."
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
// ENTER KEY FOR PASSWORD
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
// LOAD STUDENTS
// ==========================================================

async function loadStudents(){

    const snapshot =
        await getDocs(
            collection(db, "students")
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

}


// ==========================================================
// SEARCH STUDENTS
// ==========================================================

studentSearch.addEventListener(
    "input",
    () => {

        renderStudentResults();

    }
);


function renderStudentResults(){

    const search =
        studentSearch.value
            .trim()
            .toLowerCase();


    if(!search){

        studentResults.innerHTML = "";

        return;

    }


    const results =
        allStudents
            .filter(
                (student) => {

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

                    return (
                        name.includes(search) ||
                        email.includes(search) ||
                        phone.includes(search)
                    );

                }
            )
            .slice(0,10);


    if(results.length === 0){

        studentResults.innerHTML = `
            <div style="
                padding:15px;
                text-align:center;
                color:#888;
                font-size:10px;
            ">
                No student found
            </div>
        `;

        return;

    }


    studentResults.innerHTML =
        results
            .map(
                (student) =>
                    createStudentResult(student)
            )
            .join("");


    document
        .querySelectorAll(".student-result")
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

                            selectStudent(student);

                        }

                    }
                );

            }
        );

}


// ==========================================================
// STUDENT RESULT CARD
// ==========================================================

function createStudentResult(student){

    const name =
        escapeHTML(
            student.name || "Unnamed Student"
        );

    const email =
        escapeHTML(
            student.email || "No email"
        );

    const className =
        escapeHTML(
            student.joiningClass || "—"
        );


    return `

        <div
            class="student-result"
            data-id="${student.id}">

            <div class="student-result-icon">

                <i class="ri-user-line"></i>

            </div>

            <div class="student-result-info">

                <strong>
                    ${name}
                </strong>

                <span>
                    ${className} • ${email}
                </span>

            </div>

            <i class="ri-arrow-right-s-line"></i>

        </div>

    `;

}


// ==========================================================
// SELECT STUDENT
// ==========================================================

async function selectStudent(student){

    selectedStudent =
        student;


    // Hide search results

    studentResults.innerHTML = "";


    // Keep search field showing selected name

    studentSearch.value =
        student.name || "";


    // Student details

    selectedStudentName.textContent =
        student.name || "—";


    selectedStudentInfo.textContent =
        student.email ||
        student.phone ||
        "—";


    selectedClass.textContent =
        student.joiningClass || "—";


    selectedCourse.textContent =
        student.course || "—";


    selectedCombination.textContent =
        student.combination || "—";


    selectedStudentCard.style.display =
        "block";


    feeSection.style.display =
        "block";


    // Check official office fee record

    await checkExistingOfficeFee(
        student.id
    );


    feeSection.scrollIntoView({
        behavior:"smooth",
        block:"start"
    });

}


// ==========================================================
// CHECK EXISTING OFFICE FEE
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
            await getDoc(feeRef);


        if(snapshot.exists()){

            const data =
                snapshot.data();


            selectedStudentFeeLocked =
                data.locked === true;


            if(
                selectedStudentFeeLocked
            ){

                fillExistingFees(data);

                lockFeeForm();

                return;

            }

        }


        // No locked record

        selectedStudentFeeLocked =
            false;

        unlockFeeForm();

        clearFeeFields();

    }

    catch(error){

        console.error(
            "Office fee check error:",
            error
        );

        alert(
            "Unable to check this student's office fee record."
        );

    }

}


// ==========================================================
// FILL EXISTING FEES
// ==========================================================

function fillExistingFees(data){

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
// LOCK FORM
// ==========================================================

function lockFeeForm(){

    alreadyLocked.style.display =
        "flex";


    const inputs = [

        advanceAmount,
        advanceDate,

        firstAmount,
        firstDate,

        secondAmount,
        secondDate

    ];


    inputs.forEach(
        (input) => {

            input.disabled = true;

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
// UNLOCK FORM FOR NEW RECORD
// ==========================================================

function unlockFeeForm(){

    alreadyLocked.style.display =
        "none";


    const inputs = [

        advanceAmount,
        advanceDate,

        firstAmount,
        firstDate,

        secondAmount,
        secondDate

    ];


    inputs.forEach(
        (input) => {

            input.disabled = false;

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
// CLEAR FEES
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
// CALCULATE TOTAL
// ==========================================================

const feeInputs = [

    advanceAmount,
    firstAmount,
    secondAmount

];


feeInputs.forEach(
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
        total.toLocaleString("en-IN");

}


// ==========================================================
// SAVE OFFICE FEES
// ==========================================================

saveFeeButton.addEventListener(
    "click",
    async () => {

        if(!selectedStudent){

            alert(
                "Please select a student first."
            );

            return;

        }


        if(selectedStudentFeeLocked){

            alert(
                "This student's fee record is already locked."
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
        // VALIDATION
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
                "Once saved, these official fee details cannot be edited. Continue?"
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
            // FINAL EXISTENCE CHECK
            // ----------------------------------

            const existing =
                await getDoc(feeRef);


            if(existing.exists()){

                const existingData =
                    existing.data();


                if(
                    existingData.locked === true
                ){

                    alert(
                        "This student's fee record has already been locked."
                    );

                    await checkExistingOfficeFee(
                        selectedStudent.id
                    );

                    return;

                }

            }


            // ----------------------------------
            // SAVE OFFICIAL RECORD
            // ----------------------------------

            await setDoc(
                feeRef,
                {

                    studentId:
                        selectedStudent.id,

                    studentName:
                        selectedStudent.name || "",

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
            // SUCCESS
            // ----------------------------------

            selectedStudentFeeLocked =
                true;


            fillExistingFees({

                advancePaid:
                    advance,

                advancePaidDate:
                    advanceDate.value,

                firstInstallment:
                    first,

                firstInstallmentDate:
                    firstDate.value,

                secondInstallment:
                    second,

                secondInstallmentDate:
                    secondDate.value

            });


            lockFeeForm();


            alert(
                "Official fee record saved and locked successfully."
            );

        }

        catch(error){

            console.error(
                "Office fee save error:",
                error
            );

            alert(
                "Unable to save the official fee record."
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
// ACCESS ERROR
// ==========================================================

function showAccessError(text){

    accessError.textContent =
        text;

    accessError.classList.add(
        "show"
    );

}


// ==========================================================
// HTML SAFETY
// ==========================================================

function escapeHTML(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


// ==========================================================
// INITIAL TOTAL
// ==========================================================

calculateTotal();
