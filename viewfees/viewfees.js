// ==========================================================
// ZENOVA
// VIEW OFFICE FEES
// ==========================================================

import { db } from "../firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const accessScreen =
    document.getElementById("accessScreen");

const portal =
    document.getElementById("portal");

const officePassword =
    document.getElementById("officePassword");

const togglePassword =
    document.getElementById("togglePassword");

const unlockButton =
    document.getElementById("unlockButton");

const accessError =
    document.getElementById("accessError");


const searchInput =
    document.getElementById("searchInput");

const recordsList =
    document.getElementById("recordsList");

const emptyState =
    document.getElementById("emptyState");

const loadingState =
    document.getElementById("loadingState");


const recordCount =
    document.getElementById("recordCount");

const totalCollected =
    document.getElementById("totalCollected");


// ==========================================================
// DATA
// ==========================================================

let feeRecords = [];


// ==========================================================
// PASSWORD
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
// UNLOCK
// ==========================================================

unlockButton.addEventListener(
    "click",
    async () => {

        const password =
            officePassword.value.trim();


        if(!password){

            showError(
                "Please enter the office password."
            );

            return;

        }


        if(password !== OFFICE_PASSWORD){

            showError(
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
                <span>Loading...</span>
            `;


            accessScreen.style.display =
                "none";

            portal.style.display =
                "block";


            await loadFeeRecords();


        }

        catch(error){

            console.error(
                "Fee records error:",
                error
            );


            accessScreen.style.display =
                "flex";

            portal.style.display =
                "none";


            showError(
                "Unable to load fee records. Check Firestore permissions."
            );

        }

        finally{

            unlockButton.disabled =
                false;

            unlockButton.innerHTML = `
                <i class="ri-lock-unlock-line"></i>
                <span>View Fee Records</span>
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
// LOAD FEE RECORDS
// ==========================================================

async function loadFeeRecords(){

    loadingState.style.display =
        "block";

    recordsList.innerHTML = "";

    emptyState.style.display =
        "none";


    feeRecords = [];


    // ------------------------------------------------------
    // First load students
    // ------------------------------------------------------

    const studentsSnapshot =
        await getDocs(
            collection(
                db,
                "students"
            )
        );


    // ------------------------------------------------------
    // Load official fee record for each student
    // ------------------------------------------------------

    for(
        const studentDoc
        of studentsSnapshot.docs
    ){

        const student =
            studentDoc.data();


        const feeRef =
            doc(
                db,
                "officeFees",
                studentDoc.id
            );


        const feeSnapshot =
            await getDoc(
                feeRef
            );


        // Only show students who have
        // an office fee record.

        if(
            feeSnapshot.exists()
        ){

            feeRecords.push({

                studentId:
                    studentDoc.id,

                student:
                    student,

                fee:
                    feeSnapshot.data()

            });

        }

    }


    loadingState.style.display =
        "none";


    updateStatistics();

    renderRecords();

}


// ==========================================================
// STATISTICS
// ==========================================================

function updateStatistics(){

    recordCount.textContent =
        feeRecords.length;


    let total = 0;


    feeRecords.forEach(
        (record) => {

            total +=
                Number(
                    record.fee.totalPaid
                ) || 0;

        }
    );


    totalCollected.textContent =
        "₹" +
        total.toLocaleString(
            "en-IN"
        );

}


// ==========================================================
// SEARCH
// ==========================================================

searchInput.addEventListener(
    "input",
    () => {

        renderRecords();

    }
);


// ==========================================================
// RENDER
// ==========================================================

function renderRecords(){

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered =
        feeRecords.filter(
            (record) => {

                const student =
                    record.student;


                const fee =
                    record.fee;


                const name =
                    String(
                        student.name ||
                        fee.studentName ||
                        ""
                    ).toLowerCase();


                const email =
                    String(
                        student.email ||
                        fee.studentEmail ||
                        ""
                    ).toLowerCase();


                const phone =
                    String(
                        student.phone ||
                        ""
                    ).toLowerCase();


                return (
                    name.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search)
                );

            }
        );


    if(filtered.length === 0){

        recordsList.innerHTML = "";

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    recordsList.innerHTML =
        filtered
            .map(
                (record) =>
                    createRecordCard(
                        record
                    )
            )
            .join("");

}


// ==========================================================
// RECORD CARD
// ==========================================================

function createRecordCard(
    record
){

    const student =
        record.student;

    const fee =
        record.fee;


    const name =
        escapeHTML(
            student.name ||
            fee.studentName ||
            "Unnamed Student"
        );


    const email =
        escapeHTML(
            student.email ||
            fee.studentEmail ||
            "—"
        );


    const phone =
        escapeHTML(
            student.phone ||
            "—"
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


    const advance =
        Number(
            fee.advancePaid
        ) || 0;


    const first =
        Number(
            fee.firstInstallment
        ) || 0;


    const second =
        Number(
            fee.secondInstallment
        ) || 0;


    const total =
        Number(
            fee.totalPaid
        ) ||
        advance +
        first +
        second;


    return `

        <div class="record-card">


            <!-- HEADER -->

            <div class="record-header">

                <div class="student-info">

                    <div class="student-avatar">

                        <i class="ri-user-3-line"></i>

                    </div>

                    <div>

                        <h3>
                            ${name}
                        </h3>

                        <p>
                            ${email}
                            •
                            ${phone}
                        </p>

                    </div>

                </div>


                <div class="locked">

                    <i class="ri-lock-fill"></i>

                    LOCKED

                </div>

            </div>



            <!-- STUDENT META -->

            <div class="student-meta">

                <div>

                    <small>
                        CLASS
                    </small>

                    <strong>
                        ${className}
                    </strong>

                </div>


                <div>

                    <small>
                        COURSE
                    </small>

                    <strong>
                        ${course}
                    </strong>

                </div>


                <div>

                    <small>
                        COMBINATION
                    </small>

                    <strong>
                        ${combination}
                    </strong>

                </div>

            </div>



            <!-- FEES -->

            <div class="fee-list">


                <!-- ADVANCE -->

                <div class="fee-row">

                    <div class="fee-row-left">

                        <strong>
                            Advance Paid
                        </strong>

                        <span>
                            Paid during admission
                        </span>

                    </div>

                    <div class="fee-row-right">

                        <strong>
                            ₹${advance.toLocaleString("en-IN")}
                        </strong>

                        <span>
                            ${formatDate(
                                fee.advancePaidDate
                            )}
                        </span>

                    </div>

                </div>



                <!-- FIRST -->

                <div class="fee-row">

                    <div class="fee-row-left">

                        <strong>
                            1st Installment
                        </strong>

                        <span>
                            First installment
                        </span>

                    </div>

                    <div class="fee-row-right">

                        <strong>
                            ₹${first.toLocaleString("en-IN")}
                        </strong>

                        <span>
                            ${formatDate(
                                fee.firstInstallmentDate
                            )}
                        </span>

                    </div>

                </div>



                <!-- SECOND -->

                <div class="fee-row">

                    <div class="fee-row-left">

                        <strong>
                            2nd Installment
                        </strong>

                        <span>
                            Second installment
                        </span>

                    </div>

                    <div class="fee-row-right">

                        <strong>
                            ₹${second.toLocaleString("en-IN")}
                        </strong>

                        <span>
                            ${formatDate(
                                fee.secondInstallmentDate
                            )}
                        </span>

                    </div>

                </div>


            </div>



            <!-- TOTAL -->

            <div class="record-total">

                <span>
                    TOTAL OFFICIAL FEE PAID
                </span>

                <strong>
                    ₹${total.toLocaleString("en-IN")}
                </strong>

            </div>


        </div>

    `;

}


// ==========================================================
// DATE FORMAT
// ==========================================================

function formatDate(
    date
){

    if(!date){

        return "—";

    }


    try{

        const parts =
            String(date).split("-");


        if(parts.length === 3){

            return (
                parts[2] +
                "/" +
                parts[1] +
                "/" +
                parts[0]
            );

        }


        return date;

    }

    catch(error){

        return "—";

    }

}


// ==========================================================
// ERROR
// ==========================================================

function showError(
    message
){

    accessError.textContent =
        message;

    accessError.classList.add(
        "show"
    );

}


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
