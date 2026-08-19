// ==========================================================
// ZENOVA EDUCATIONS
// EDIT PROFILE
// editprofile.js
// ==========================================================

import { auth, db } from "../firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const profileForm =
    document.getElementById("profileForm");

const saveButton =
    document.getElementById("saveButton");

const message =
    document.getElementById("message");

const photoInput =
    document.getElementById("photoInput");

const profilePreview =
    document.getElementById("profilePreview");

const photoName =
    document.getElementById("photoName");


// ==========================================================
// CURRENT USER
// ==========================================================

let currentUser = null;

let currentStudentData = {};

let selectedPhoto = null;


// ==========================================================
// AUTH
// ==========================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "../";

        return;

    }

    currentUser = user;

    await loadProfile();

});


// ==========================================================
// LOAD PROFILE
// ==========================================================

async function loadProfile(){

    try{

        const studentRef =
            doc(
                db,
                "students",
                currentUser.uid
            );

        const snapshot =
            await getDoc(studentRef);


        if(!snapshot.exists()){

            window.location.href =
                "../onboarding/";

            return;

        }


        currentStudentData =
            snapshot.data();


        fillForm(currentStudentData);

    }

    catch(error){

        console.error(
            "Profile loading error:",
            error
        );

        showMessage(
            "Unable to load your profile.",
            "error"
        );

    }

}


// ==========================================================
// FILL FORM
// ==========================================================

function fillForm(data){

    setValue(
        "name",
        data.name
    );

    setValue(
        "phone",
        data.phone
    );

    setValue(
        "dob",
        data.dob
    );

    setValue(
        "fatherName",
        data.fatherName
    );

    setValue(
        "motherName",
        data.motherName
    );


    // Academic

    setValue(
        "schoolName",
        data.schoolName
    );

    setValue(
        "sslcPercentage",
        data.sslcPercentage
    );

    setValue(
        "sslcMedium",
        data.sslcMedium
    );

    setValue(
        "sslcRegisterNumber",
        data.sslcRegisterNumber
    );


    // Locked

    setValue(
        "joiningClass",
        data.joiningClass
    );

    setValue(
        "course",
        data.course
    );

    setValue(
        "combination",
        data.combination
    );


    // Address

    setValue(
        "state",
        data.state
    );

    setValue(
        "district",
        data.district
    );

    setValue(
        "taluk",
        data.taluk
    );

    setValue(
        "village",
        data.village
    );

    setValue(
        "pincode",
        data.pincode
    );

    setValue(
        "fullAddress",
        data.fullAddress
    );


    // Photo

    if(data.photo){

        profilePreview.src =
            data.photo;

    }

}


// ==========================================================
// PHOTO PREVIEW
// ==========================================================

photoInput.addEventListener(
    "change",
    (event) => {

        const file =
            event.target.files[0];

        if(!file){

            return;

        }


        // Limit to 5 MB

        if(
            file.size >
            5 * 1024 * 1024
        ){

            showMessage(
                "Profile photo must be below 5 MB.",
                "error"
            );

            photoInput.value = "";

            return;

        }


        selectedPhoto = file;

        photoName.textContent =
            file.name;


        const reader =
            new FileReader();


        reader.onload =
            (e) => {

                profilePreview.src =
                    e.target.result;

            };


        reader.readAsDataURL(file);

    }
);


// ==========================================================
// SAVE PROFILE
// ==========================================================

profileForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if(!currentUser){

            return;

        }


        try{

            saveButton.disabled = true;

            saveButton.innerHTML = `
                <i class="ri-loader-4-line"></i>
                <span>Saving...</span>
            `;


            // ----------------------------------
            // GET VALUES
            // ----------------------------------

            const updatedData = {

                name:
                    getValue("name"),

                phone:
                    getValue("phone"),

                dob:
                    getValue("dob"),

                fatherName:
                    getValue("fatherName"),

                motherName:
                    getValue("motherName"),


                schoolName:
                    getValue("schoolName"),

                sslcPercentage:
                    getNumber("sslcPercentage"),

                sslcMedium:
                    getValue("sslcMedium"),

                sslcRegisterNumber:
                    getValue("sslcRegisterNumber"),


                state:
                    getValue("state"),

                district:
                    getValue("district"),

                taluk:
                    getValue("taluk"),

                village:
                    getValue("village"),

                pincode:
                    getValue("pincode"),

                fullAddress:
                    getValue("fullAddress"),

                updatedAt:
                    serverTimestamp()

            };


            // ----------------------------------
            // PHOTO
            // ----------------------------------

            /*
              For now the photo preview works locally.
              The existing Firebase Storage upload can
              be connected here once we standardize
              the Storage path.
            */

            if(selectedPhoto){

                showMessage(
                    "Profile details saved. Photo upload will be connected to Storage next.",
                    "success"
                );

            }


            // ----------------------------------
            // UPDATE FIRESTORE
            // ----------------------------------

            const studentRef =
                doc(
                    db,
                    "students",
                    currentUser.uid
                );


            await updateDoc(
                studentRef,
                updatedData
            );


            currentStudentData = {
                ...currentStudentData,
                ...updatedData
            };


            if(!selectedPhoto){

                showMessage(
                    "Profile updated successfully.",
                    "success"
                );

            }


            // ----------------------------------
            // BUTTON
            // ----------------------------------

            saveButton.innerHTML = `
                <i class="ri-check-line"></i>
                <span>Saved Successfully</span>
            `;


            setTimeout(() => {

                window.location.href =
                    "../student/";

            }, 1200);

        }

        catch(error){

            console.error(
                "Profile update error:",
                error
            );


            showMessage(
                "Unable to save changes. Please try again.",
                "error"
            );


            saveButton.disabled = false;

            saveButton.innerHTML = `
                <i class="ri-save-3-line"></i>
                <span>Save Changes</span>
            `;

        }

    }
);


// ==========================================================
// HELPERS
// ==========================================================

function getValue(id){

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


function getNumber(id){

    const value =
        getValue(id);

    if(value === ""){

        return null;

    }

    return Number(value);

}


function setValue(id,value){

    const element =
        document.getElementById(id);

    if(!element){

        return;

    }

    element.value =
        value !== undefined &&
        value !== null
            ? value
            : "";

}


function showMessage(text,type){

    message.textContent =
        text;

    message.className =
        `message ${type}`;

              }
