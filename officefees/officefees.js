// ==========================================================
// ZENOVA + BEST INTERNATIONAL PU COLLEGE
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


const studentView =
    document.getElementById("studentView");

const feeView =
    document.getElementById("feeView");

const studentSearch =
    document.getElementById("studentSearch");

const studentResults =
    document.getElementById("studentResults");

const studentCount =
    document.getElementById("studentCount");


const backButton =
    document.getElementById("backButton");


const selectedName =
    document.getElementById("selectedName");

const selectedContact =
    document.getElementById("selectedContact");

const selectedClass =
    document.getElementById("selectedClass");

const selectedCourse =
    document.getElementById("selectedCourse");

const selectedCombination =
    document.getElementById("selectedCombination");


const lockStatus =
    document.getElementById("lockStatus");

const lockedMessage =
    document.getElementById("lockedMessage");

const editFeesButton =
    document.getElementById("editFeesButton");

const saveChangesButton =
    document.getElementById("saveChangesButton");

const cancelEditButton =
    document.getElementById("cancelEditButton");


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

let existingFeeData = null;

let editing = false;


// ==========================================================
// PASSWORD
// ==========================================================

const OFFICE_PASSWORD = "123456";


// ==========================================================
// PASSWORD SHOW / HIDE
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
// OFFICE LOGIN
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


            studentView.style.display =
                "block";

            feeView.style.display =
                "none";


            renderStudents();


        }
        catch(error){

            console.error(
                "Student loading error:",
                error
            );

            showAccessError(
                "Unable to load students. Check Firestore permissions."
            );

        }
        finally{

            unlockButton.disabled = false;

            unlockButton.innerHTML = `
                <i class="ri-login-box-line"></i>
                Enter Office Portal
            `;

        }

    }
);


// ==========================================================
// ENTER KEY
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
            collection(
                db,
                "students"
            )
        );


    allStudents = [];


    snapshot.forEach(
        (studentDoc) => {

            allStudents.push({

                id:
                    studentDoc.id,

                ...studentDoc.data()

            });

        }
    );


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
    renderStudents
);


// ==========================================================
// RENDER STUDENTS
// ==========================================================

function renderStudents(){

    const search =
        studentSearch.value
            .trim()
            .toLowerCase();


    const filtered =
        allStudents.filter(
            (student) => {

                if(!search){

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

            }
        );


    if(filtered.length === 0){

        studentResults.innerHTML = `

            <div class="no-students">

                <i class="ri-user-search-line"></i>

                <br>

                No students found.

            </div>

        `;

        return;

    }


    studentResults.innerHTML =
        filtered
            .map(
                createStudentHTML
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

                            openStudent(
                                student
                            );

                        }

                    }
                );

            }
        );

}


// ==========================================================
// STUDENT HTML
// ==========================================================

function createStudentHTML(
    student
){

    const name =
        escapeHTML(
            student.name ||
            "Unnamed Student"
        );


    const phone =
        escapeHTML(
            student.phone ||
            "No phone"
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


            <div class="student-avatar-small">

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
                    ${phone}
                </small>

            </div>


            <i class="ri-arrow-right-s-line"></i>


        </div>

    `;

}


// ==========================================================
// OPEN STUDENT
// ==========================================================

async function openStudent(
    student
){

    selectedStudent =
        student;


    editing = false;


    studentView.style.display =
        "none";


    feeView.style.display =
        "block";


    selectedName.textContent =
        student.name ||
        "Unnamed Student";


    selectedContact.textContent =
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


    await loadStudentFee(
        student.id
    );


    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}


// ==========================================================
// LOAD STUDENT FEE
// ==========================================================

async function loadStudentFee(
    studentId
){

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


    if(snapshot.exists()){

        existingFeeData =
            snapshot.data();


        fillFeeData(
            existingFeeData
        );


        setLockedView();

    }
    else{

        existingFeeData =
            null;


        clearFeeFields();

        setNewRecordView();

    }

}


// ==========================================================
// FILL FEE
// ==========================================================

function fillFeeData(
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
// NEW RECORD
// ==========================================================

function setNewRecordView(){

    editing = true;


    lockStatus.style.display =
        "none";


    lockedMessage.style.display =
        "none";


    editFeesButton.style.display =
        "none";


    enableFields();


    saveChangesButton.style.display =
        "flex";


    cancelEditButton.style.display =
        "none";

}


// ==========================================================
// LOCKED RECORD
// ==========================================================

function setLockedView(){

    editing = false;


    lockStatus.style.display =
        "flex";


    lockedMessage.style.display =
        "flex";


    editFeesButton.style.display =
        "flex";


    saveChangesButton.style.display =
        "none";


    cancelEditButton.style.display =
        "none";


    disableFields();

}


// ==========================================================
// ENABLE
// ==========================================================

function enableFields(){

    [

        advanceAmount,
        advanceDate,

        firstAmount,
        firstDate,

        secondAmount,
        secondDate

    ].forEach(
        (field) => {

            field.disabled = false;

        }
    );

}


// ==========================================================
// DISABLE
// ==========================================================

function disableFields(){

    [

        advanceAmount,
        advanceDate,

        firstAmount,
        firstDate,

        secondAmount,
        secondDate

    ].forEach(
        (field) => {

            field.disabled = true;

        }
    );

}


// ==========================================================
// EDIT FEES
// ==========================================================

editFeesButton.addEventListener(
    "click",
    () => {

        editing = true;


        enableFields();


        editFeesButton.style.display =
            "none";


        lockedMessage.style.display =
            "none";


        saveChangesButton.style.display =
            "flex";


        cancelEditButton.style.display =
            "block";


        advanceAmount.focus();

    }
);


// ==========================================================
// CANCEL EDIT
// ==========================================================

cancelEditButton.addEventListener(
    "click",
    () => {

        if(existingFeeData){

            fillFeeData(
                existingFeeData
            );

        }


        editing = false;


        setLockedView();

    }
);


// ==========================================================
// BACK
// ==========================================================

backButton.addEventListener(
    "click",
    () => {

        selectedStudent =
            null;

        existingFeeData =
            null;

        editing =
            false;


        feeView.style.display =
            "none";


        studentView.style.display =
            "block";


        studentSearch.value =
            "";


        renderStudents();


        window.scrollTo({
            top:0,
            behavior:"smooth"
        });

    }
);


// ==========================================================
// TOTAL
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
// SAVE / UPDATE
// ==========================================================

saveChangesButton.addEventListener(
    "click",
    async () => {

        if(!selectedStudent){

            alert(
                "No student selected."
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


        // --------------------------------------------------
        // DATE VALIDATION
        // --------------------------------------------------

        if(
            advance > 0 &&
            !advanceDate.value
        ){

            alert(
                "Enter the advance paid date."
            );

            return;

        }


        if(
            first > 0 &&
            !firstDate.value
        ){

            alert(
                "Enter the 1st installment paid date."
            );

            return;

        }


        if(
            second > 0 &&
            !secondDate.value
        ){

            alert(
                "Enter the 2nd installment paid date."
            );

            return;

        }


        const confirmed =
            confirm(
                existingFeeData
                    ? "Update this official fee record?"
                    : "Save this official fee record?"
            );


        if(!confirmed){

            return;

        }


        try{

            saveChangesButton.disabled =
                true;


            saveChangesButton.innerHTML = `
                <i class="ri-loader-4-line"></i>
                Saving...
            `;


            const feeRef =
                doc(
                    db,
                    "officeFees",
                    selectedStudent.id
                );


            // ------------------------------------------------
            // SAVE
            // ------------------------------------------------

            await setDoc(
                feeRef,
                {

                    studentId:
                        selectedStudent.id,

                    studentName:
                        selectedStudent.name ||
                        "",

                    studentEmail:
                        selectedStudent.email ||
                        "",

                    advancePaid:
                        advance,

                    advancePaidDate:
                        advanceDate.value ||
                        null,

                    firstInstallment:
                        first,

                    firstInstallmentDate:
                        firstDate.value ||
                        null,

                    secondInstallment:
                        second,

                    secondInstallmentDate:
                        secondDate.value ||
                        null,

                    totalPaid:
                        total,

                    locked:
                        true,

                    savedAt:
                        serverTimestamp()

                }
            );


            // ------------------------------------------------
            // UPDATE LOCAL DATA
            // ------------------------------------------------

            existingFeeData = {

                studentId:
                    selectedStudent.id,

                studentName:
                    selectedStudent.name ||
                    "",

                studentEmail:
                    selectedStudent.email ||
                    "",

                advancePaid:
                    advance,

                advancePaidDate:
                    advanceDate.value ||
                    null,

                firstInstallment:
                    first,

                firstInstallmentDate:
                    firstDate.value ||
                    null,

                secondInstallment:
                    second,

                secondInstallmentDate:
                    secondDate.value ||
                    null,

                totalPaid:
                    total,

                locked:
                    true

            };


            fillFeeData(
                existingFeeData
            );


            setLockedView();


            alert(
                "Fee record saved successfully."
            );

        }
        catch(error){

            console.error(
                "Fee save error:",
                error
            );


            alert(
                "Unable to save fee record. Check Firestore permissions."
            );

        }
        finally{

            saveChangesButton.disabled =
                false;


            saveChangesButton.innerHTML = `
                <i class="ri-save-3-line"></i>
                Save Changes
            `;

        }

    }
);


// ==========================================================
// ERROR
// ==========================================================

function showAccessError(
    message
){

    accessError.textContent =
        message;

    accessError.classList.add(
        "show"
    );

}


// ==========================================================
// HTML ESCAPE
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
// INITIAL
// ==========================================================

calculateTotal();
