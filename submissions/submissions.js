// ==========================================================
// ZENOVA EDUCATIONS
// SEPARATE SUBMISSION FORM
// submissions.js
// ==========================================================

import { db } from "../firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const form =
    document.getElementById("submissionForm");

const nameInput =
    document.getElementById("name");

const phoneInput =
    document.getElementById("phone");

const villageInput =
    document.getElementById("village");

const submitButton =
    document.getElementById("submitButton");

const totalSubmissions =
    document.getElementById("totalSubmissions");

const successMessage =
    document.getElementById("successMessage");

const viewButton =
    document.getElementById("viewButton");

const viewSection =
    document.getElementById("viewSection");

const closeView =
    document.getElementById("closeView");

const submissionList =
    document.getElementById("submissionList");

const noSubmissions =
    document.getElementById("noSubmissions");

const searchInput =
    document.getElementById("searchInput");


// ==========================================================
// DATA
// ==========================================================

let submissions = [];


// ==========================================================
// LOAD TOTAL
// ==========================================================

async function loadSubmissions(){

    try{

        const submissionsRef =
            collection(db, "submissions");

        const q =
            query(
                submissionsRef,
                orderBy("submittedAt", "desc")
            );

        const snapshot =
            await getDocs(q);

        submissions = [];

        snapshot.forEach((document) => {

            submissions.push({
                id: document.id,
                ...document.data()
            });

        });

        updateTotal();

        renderSubmissions();

    }

    catch(error){

        console.error(
            "Error loading submissions:",
            error
        );

        // If the collection is empty or the
        // timestamp index is not ready, still
        // try a normal collection read.

        try{

            const snapshot =
                await getDocs(
                    collection(db, "submissions")
                );

            submissions = [];

            snapshot.forEach((document) => {

                submissions.push({
                    id: document.id,
                    ...document.data()
                });

            });

            updateTotal();

            renderSubmissions();

        }

        catch(secondError){

            console.error(
                "Fallback loading error:",
                secondError
            );

        }

    }

}


// ==========================================================
// UPDATE TOTAL
// ==========================================================

function updateTotal(){

    totalSubmissions.textContent =
        submissions.length;

}


// ==========================================================
// SUBMIT FORM
// ==========================================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            nameInput.value.trim();

        const phone =
            phoneInput.value.trim();

        const village =
            villageInput.value.trim();


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if(!name){

            nameInput.focus();

            return;

        }


        if(!/^[0-9]{10}$/.test(phone)){

            alert(
                "Please enter a valid 10-digit phone number."
            );

            phoneInput.focus();

            return;

        }


        if(!village){

            villageInput.focus();

            return;

        }


        try{

            submitButton.disabled = true;

            submitButton.innerHTML = `
                <i class="ri-loader-4-line"></i>
                <span>Submitting...</span>
            `;


            // --------------------------------------
            // CREATE NEW DOCUMENT
            // --------------------------------------

            await addDoc(
                collection(db, "submissions"),
                {

                    name: name,

                    phone: phone,

                    village: village,

                    submittedAt:
                        serverTimestamp()

                }
            );


            // --------------------------------------
            // SUCCESS
            // --------------------------------------

            showSuccess();


            // --------------------------------------
            // CLEAR FORM
            // --------------------------------------

            form.reset();


            // --------------------------------------
            // RELOAD DATA
            // --------------------------------------

            await loadSubmissions();


            // --------------------------------------
            // FOCUS NEXT ENTRY
            // --------------------------------------

            nameInput.focus();


        }

        catch(error){

            console.error(
                "Submission error:",
                error
            );

            alert(
                "Unable to submit. Please try again."
            );

        }

        finally{

            submitButton.disabled = false;

            submitButton.innerHTML = `
                <i class="ri-check-line"></i>
                <span>Submit</span>
            `;

        }

    }
);


// ==========================================================
// SUCCESS MESSAGE
// ==========================================================

function showSuccess(){

    successMessage.classList.add("show");


    setTimeout(() => {

        successMessage.classList.remove(
            "show"
        );

    }, 2500);

}


// ==========================================================
// VIEW BUTTON
// ==========================================================

// ==========================================================
// VIEW ACCESS
// ==========================================================

const accessOverlay =
    document.getElementById("accessOverlay");

const accessClose =
    document.getElementById("accessClose");

const unlockButton =
    document.getElementById("unlockButton");

const accessNumber =
    document.getElementById("accessNumber");

const accessPassword =
    document.getElementById("accessPassword");

const accessError =
    document.getElementById("accessError");


// ==========================================================
// VIEW BUTTON
// ==========================================================

viewButton.addEventListener(
    "click",
    () => {

        accessOverlay.classList.add(
            "active"
        );

        accessNumber.focus();

    }
);


// ==========================================================
// CLOSE ACCESS
// ==========================================================

accessClose.addEventListener(
    "click",
    () => {

        closeAccessModal();

    }
);


accessOverlay.addEventListener(
    "click",
    (event) => {

        if(
            event.target === accessOverlay
        ){

            closeAccessModal();

        }

    }
);


// ==========================================================
// UNLOCK
// ==========================================================

unlockButton.addEventListener(
    "click",
    async () => {

        const number =
            accessNumber.value.trim();

        const password =
            accessPassword.value;


        if(!number || !password){

            showAccessError(
                "Please enter both number and password."
            );

            return;

        }


        /*
         * TEMPORARY ACCESS CREDENTIALS
         *
         * Change these before testing.
         *
         * IMPORTANT:
         * This is only suitable for testing.
         * Because this is client-side JavaScript,
         * it is NOT secure for production.
         */

        const allowedNumber =
            "9999999999";

        const allowedPassword =
            "123456";


        if(
            number !== allowedNumber ||
            password !== allowedPassword
        ){

            showAccessError(
                "Incorrect number or password."
            );

            return;

        }


        unlockButton.disabled = true;

        unlockButton.innerHTML = `
            <i class="ri-loader-4-line"></i>
            <span>Opening...</span>
        `;


        try{

            await loadSubmissions();


            accessOverlay.classList.remove(
                "active"
            );

            accessNumber.value = "";

            accessPassword.value = "";

            accessError.classList.remove(
                "show"
            );


            viewSection.style.display =
                "block";


            viewSection.scrollIntoView({
                behavior:"smooth",
                block:"start"
            });

        }

        catch(error){

            console.error(error);

            showAccessError(
                "Unable to load submissions."
            );

        }

        finally{

            unlockButton.disabled = false;

            unlockButton.innerHTML = `
                <i class="ri-lock-unlock-line"></i>
                <span>Unlock View</span>
            `;

        }

    }
);


// ==========================================================
// ENTER KEY
// ==========================================================

accessPassword.addEventListener(
    "keydown",
    (event) => {

        if(event.key === "Enter"){

            unlockButton.click();

        }

    }
);


// ==========================================================
// ERROR
// ==========================================================

function showAccessError(text){

    accessError.textContent =
        text;

    accessError.classList.add(
        "show"
    );

}


// ==========================================================
// CLOSE MODAL
// ==========================================================

function closeAccessModal(){

    accessOverlay.classList.remove(
        "active"
    );

    accessNumber.value = "";

    accessPassword.value = "";

    accessError.classList.remove(
        "show"
    );

}


// ==========================================================
// CLOSE VIEW
// ==========================================================

closeView.addEventListener(
    "click",
    () => {

        viewSection.style.display =
            "none";

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });

    }
);


// ==========================================================
// SEARCH
// ==========================================================

searchInput.addEventListener(
    "input",
    () => {

        renderSubmissions();

    }
);


// ==========================================================
// RENDER SUBMISSIONS
// ==========================================================

function renderSubmissions(){

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered =
        submissions.filter(
            (submission) => {

                const name =
                    String(
                        submission.name || ""
                    ).toLowerCase();

                const phone =
                    String(
                        submission.phone || ""
                    ).toLowerCase();

                const village =
                    String(
                        submission.village || ""
                    ).toLowerCase();


                return (
                    name.includes(search) ||
                    phone.includes(search) ||
                    village.includes(search)
                );

            }
        );


    if(filtered.length === 0){

        submissionList.innerHTML = "";

        noSubmissions.style.display =
            "block";

        return;

    }


    noSubmissions.style.display =
        "none";


    submissionList.innerHTML =
        filtered
            .map(
                (submission, index) =>
                    createSubmissionCard(
                        submission,
                        index
                    )
            )
            .join("");

}


// ==========================================================
// CREATE CARD
// ==========================================================

function createSubmissionCard(
    submission,
    index
){

    const name =
        escapeHTML(
            submission.name || "—"
        );

    const phone =
        escapeHTML(
            submission.phone || "—"
        );

    const village =
        escapeHTML(
            submission.village || "—"
        );


    const time =
        formatTimestamp(
            submission.submittedAt
        );


    return `

        <div class="submission-card">

            <div class="submission-number">
                ${index + 1}
            </div>

            <div class="submission-info">

                <h3>
                    ${name}
                </h3>

                <p>
                    <i class="ri-phone-line"></i>
                    ${phone}
                </p>

                <p>
                    <i class="ri-map-pin-line"></i>
                    ${village}
                </p>

            </div>

            <div class="submission-time">

                <small>
                    Submitted
                </small>

                <strong>
                    ${time}
                </strong>

            </div>

        </div>

    `;

}


// ==========================================================
// FORMAT FIREBASE TIMESTAMP
// ==========================================================

function formatTimestamp(timestamp){

    if(!timestamp){

        return "Just now";

    }


    try{

        const date =
            timestamp.toDate();


        return date.toLocaleString(
            "en-IN",
            {
                day:"2-digit",
                month:"short",
                year:"numeric",

                hour:"2-digit",
                minute:"2-digit",

                hour12:true
            }
        );

    }

    catch(error){

        return "—";

    }

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
// START
// ==========================================================

loadSubmissions();
