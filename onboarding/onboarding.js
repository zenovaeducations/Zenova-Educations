// ==========================================================
// ZENOVA EDUCATIONS
// ONBOARDING.JS
// PART 1
// ==========================================================

import { auth, db } from "../firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ==========================================================
// GLOBAL VARIABLES
// ==========================================================

let currentStep = 1;
let currentUser = null;

// ==========================================================
// DOM ELEMENTS
// ==========================================================

const form = document.getElementById("onboardingForm");

const progressFill = document.getElementById("progressFill");
const progressValue = document.getElementById("progressValue");
const stepText = document.getElementById("stepText");

const steps = document.querySelectorAll(".form-step");

// Google Profile
const studentPhoto = document.getElementById("studentPhoto");
const displayName = document.getElementById("displayName");
const displayEmail = document.getElementById("displayEmail");

// Readonly Inputs
const fullName = document.getElementById("fullName");
const email = document.getElementById("email");

// ==========================================================
// FIREBASE LOGIN CHECK
// ==========================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "../";

        return;

    }

    currentUser = user;

    loadGoogleProfile(user);

    await checkExistingProfile();

});

// ==========================================================
// LOAD GOOGLE PROFILE
// ==========================================================

function loadGoogleProfile(user) {

    displayName.textContent = user.displayName || "";

    displayEmail.textContent = user.email || "";

    fullName.value = user.displayName || "";

    email.value = user.email || "";

    if (user.photoURL) {

        studentPhoto.src = user.photoURL;

    }

}

// ==========================================================
// CHECK IF PROFILE ALREADY EXISTS
// ==========================================================

async function checkExistingProfile() {

    try {

        const studentRef = doc(db, "students", currentUser.uid);

        const snapshot = await getDoc(studentRef);

        if (snapshot.exists()) {

            // Already completed onboarding
            window.location.href = "../fee/";

        }

    }

    catch (error) {

        console.error("Profile check failed:", error);

    }

}

// ==========================================================
// SHOW STEP
// ==========================================================

function showStep(step) {

    steps.forEach((item) => {

        item.classList.remove("active");

    });

    document
        .getElementById(`step${step}`)
        .classList.add("active");

    currentStep = step;

    updateProgress();

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

// ==========================================================
// UPDATE PROGRESS BAR
// ==========================================================

function updateProgress() {

    const percentage = currentStep * 25;

    progressFill.style.width = percentage + "%";

    progressValue.textContent = percentage + "%";

    stepText.textContent = `Step ${currentStep} of 4`;

}

// ==========================================================
// SMALL HELPERS
// ==========================================================

function nextStep() {

    if (currentStep < 4) {

        showStep(currentStep + 1);

    }

}

function previousStep() {

    if (currentStep > 1) {

        showStep(currentStep - 1);

    }

}

// ==========================================================
// INITIALIZE
// ==========================================================

showStep(1);
// ==========================================================
// PART 2
// FORM ELEMENTS & VALIDATION
// ==========================================================

// ---------- Step 1 ----------

const phone = document.getElementById("phone");
const dob = document.getElementById("dob");
const fatherName = document.getElementById("fatherName");
const motherName = document.getElementById("motherName");

// ---------- Step 2 ----------

const schoolName = document.getElementById("schoolName");
const sslcPercentage = document.getElementById("sslcPercentage");
const sslcRegisterNumber = document.getElementById("sslcRegisterNumber");
const sslcMedium = document.getElementById("sslcMedium");
const joiningClass = document.getElementById("joiningClass");
const course = document.getElementById("course");
const combination = document.getElementById("combination");

// ---------- Step 3 ----------

const state = document.getElementById("state");
const district = document.getElementById("district");
const taluk = document.getElementById("taluk");
const village = document.getElementById("village");
const pincode = document.getElementById("pincode");
const fullAddress = document.getElementById("fullAddress");

// ==========================================================
// BUTTONS
// ==========================================================

const nextStep1 = document.getElementById("nextStep1");
const nextStep2 = document.getElementById("nextStep2");
const nextStep3 = document.getElementById("nextStep3");

const backStep2 = document.getElementById("backStep2");
const backStep3 = document.getElementById("backStep3");
const backStep4 = document.getElementById("backStep4");

// ==========================================================
// COURSE → COMBINATION
// ==========================================================

course.addEventListener("change", () => {

    combination.innerHTML =
        '<option value="">Select Combination</option>';

    if (course.value === "Science") {

        combination.innerHTML +=
            '<option value="PCMB">PCMB</option>';

        combination.innerHTML +=
            '<option value="PCMC">PCMC</option>';

    }

    if (course.value === "Commerce") {

        combination.innerHTML +=
            '<option value="CEBA">CEBA</option>';

    }

});

// ==========================================================
// VALIDATION HELPERS
// ==========================================================

function isEmpty(input) {

    return input.value.trim() === "";

}

function markError(input) {

    input.classList.add("error");

}

function clearError(input) {

    input.classList.remove("error");

}

function validatePhone(phoneNumber) {

    return /^[6-9]\d{9}$/.test(phoneNumber);

}

function validatePincode(pin) {

    return /^\d{6}$/.test(pin);

}

// ==========================================================
// STEP 1 VALIDATION
// ==========================================================

function validateStep1() {

    let valid = true;

    const inputs = [

        phone,

        dob,

        fatherName,

        motherName

    ];

    inputs.forEach(input => {

        if (isEmpty(input)) {

            markError(input);

            valid = false;

        } else {

            clearError(input);

        }

    });

    if (!validatePhone(phone.value)) {

        markError(phone);

        alert("Please enter a valid 10-digit mobile number.");

        valid = false;

    }

    return valid;

}

// ==========================================================
// STEP 2 VALIDATION
// ==========================================================

function validateStep2() {

    let valid = true;

    const inputs = [

        schoolName,

        sslcPercentage,

        sslcMedium,

        joiningClass,

        course,

        combination

    ];

    inputs.forEach(input => {

        if (isEmpty(input)) {

            markError(input);

            valid = false;

        } else {

            clearError(input);

        }

    });

    const percentage = Number(sslcPercentage.value);

    if (percentage < 0 || percentage > 100) {

        markError(sslcPercentage);

        alert("SSLC percentage should be between 0 and 100.");

        valid = false;

    }

    return valid;

}

// ==========================================================
// STEP 3 VALIDATION
// ==========================================================

function validateStep3() {

    let valid = true;

    const inputs = [

        state,

        district,

        taluk,

        village,

        pincode,

        fullAddress

    ];

    inputs.forEach(input => {

        if (isEmpty(input)) {

            markError(input);

            valid = false;

        } else {

            clearError(input);

        }

    });

    if (!validatePincode(pincode.value)) {

        markError(pincode);

        alert("Enter a valid 6-digit PIN code.");

        valid = false;

    }

    return valid;

}

// ==========================================================
// BUTTON EVENTS
// ==========================================================

nextStep1.addEventListener("click", () => {

    if (validateStep1()) {

        nextStep();

    }

});

nextStep2.addEventListener("click", () => {

    if (validateStep2()) {

        nextStep();

    }

});

nextStep3.addEventListener("click", () => {

    if (validateStep3()) {

        populateReview();

        nextStep();

    }

});

backStep2.addEventListener("click", previousStep);

backStep3.addEventListener("click", previousStep);

backStep4.addEventListener("click", previousStep);
// ==========================================================
// PART 3
// REVIEW + SAVE TO FIRESTORE
// ==========================================================

// ---------- Review Elements ----------

const reviewName = document.getElementById("reviewName");
const reviewEmail = document.getElementById("reviewEmail");
const reviewPhone = document.getElementById("reviewPhone");
const reviewDOB = document.getElementById("reviewDOB");
const reviewFather = document.getElementById("reviewFather");
const reviewMother = document.getElementById("reviewMother");

const reviewSchool = document.getElementById("reviewSchool");
const reviewPercentage = document.getElementById("reviewPercentage");
const reviewMedium = document.getElementById("reviewMedium");
const reviewJoining = document.getElementById("reviewJoining");
const reviewCourse = document.getElementById("reviewCourse");
const reviewCombination = document.getElementById("reviewCombination");

const reviewState = document.getElementById("reviewState");
const reviewDistrict = document.getElementById("reviewDistrict");
const reviewTaluk = document.getElementById("reviewTaluk");
const reviewVillage = document.getElementById("reviewVillage");
const reviewPincode = document.getElementById("reviewPincode");
const reviewAddress = document.getElementById("reviewAddress");

// ---------- UI ----------

const loadingOverlay = document.getElementById("loadingOverlay");
const successModal = document.getElementById("successModal");
const continueDashboard =
    document.getElementById("continueDashboard");

const agree = document.getElementById("agree");

// ==========================================================
// POPULATE REVIEW
// ==========================================================

function populateReview() {

    reviewName.textContent = fullName.value;

    reviewEmail.textContent = email.value;

    reviewPhone.textContent = phone.value;

    reviewDOB.textContent = dob.value;

    reviewFather.textContent = fatherName.value;

    reviewMother.textContent = motherName.value;

    reviewSchool.textContent = schoolName.value;

    reviewPercentage.textContent =
        sslcPercentage.value + "%";

    reviewMedium.textContent =
        sslcMedium.value;

    reviewJoining.textContent =
        joiningClass.value;

    reviewCourse.textContent =
        course.value;

    reviewCombination.textContent =
        combination.value;

    reviewState.textContent =
        state.value;

    reviewDistrict.textContent =
        district.value;

    reviewTaluk.textContent =
        taluk.value;

    reviewVillage.textContent =
        village.value;

    reviewPincode.textContent =
        pincode.value;

    reviewAddress.textContent =
        fullAddress.value;

}

// ==========================================================
// FORM SUBMIT
// ==========================================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!agree.checked) {

        alert("Please accept the declaration.");

        return;

    }

    loadingOverlay.classList.add("active");

    try {

        await setDoc(

            doc(db, "students", currentUser.uid),

            {

                uid: currentUser.uid,

                name: fullName.value,

                email: email.value,

                photo: currentUser.photoURL || "",

                phone: phone.value,

                dob: dob.value,

                fatherName: fatherName.value,

                motherName: motherName.value,

                schoolName: schoolName.value,

                sslcPercentage: Number(sslcPercentage.value),

                sslcRegisterNumber:
                    sslcRegisterNumber.value,

                sslcMedium: sslcMedium.value,

                joiningClass:
                    joiningClass.value,

                course: course.value,

                combination:
                    combination.value,

                state: state.value,

                district: district.value,

                taluk: taluk.value,

                village: village.value,

                pincode: pincode.value,

                fullAddress:
                    fullAddress.value,

                onboardingCompleted: true,

                createdAt:
                    serverTimestamp()

            }

        );

        loadingOverlay.classList.remove("active");

        successModal.classList.add("active");

    }

    catch (error) {

        loadingOverlay.classList.remove("active");

        console.error(error);

        alert("Failed to save your information. Please try again.");

    }

});

// ==========================================================
// CONTINUE BUTTON
// ==========================================================

continueDashboard.addEventListener("click", () => {

    window.location.href = "../fee/";

});
// ==========================================================
// PART 4
// DISTRICT & TALUK + INPUT HELPERS
// ==========================================================

// ==========================================================
// KARNATAKA DISTRICTS
// (Sample data - you can expand later)
// ==========================================================

const locationData = {

    "Ballari":[
        "Ballari",
        "Hosapete",
        "Hagaribommanahalli",
        "Hadagali",
        "Kudligi",
        "Siruguppa",
        "Sandur",
        "Kampli"
    ],

    "Vijayanagara":[
        "Hosapete",
        "Hagaribommanahalli",
        "Harapanahalli",
        "Hoovina Hadagali",
        "Kotturu"
    ],

    "Davanagere":[
        "Davanagere",
        "Harihar",
        "Honnali",
        "Channagiri",
        "Jagalur"
    ],

    "Chitradurga":[
        "Chitradurga",
        "Hiriyur",
        "Hosadurga",
        "Holalkere",
        "Molakalmuru",
        "Challakere"
    ]

};

// ==========================================================
// LOAD DISTRICTS
// ==========================================================

function loadDistricts(){

    district.innerHTML =
    '<option value="">Select District</option>';

    Object.keys(locationData).forEach(item=>{

        district.innerHTML +=
        `<option value="${item}">${item}</option>`;

    });

}

loadDistricts();

// ==========================================================
// LOAD TALUKS
// ==========================================================

district.addEventListener("change",()=>{

    taluk.innerHTML =
    '<option value="">Select Taluk</option>';

    const taluks =
    locationData[district.value];

    if(!taluks) return;

    taluks.forEach(item=>{

        taluk.innerHTML +=
        `<option value="${item}">${item}</option>`;

    });

});

// ==========================================================
// PHONE FORMAT
// ==========================================================

phone.addEventListener("input",()=>{

    phone.value =
    phone.value.replace(/\D/g,"");

    if(phone.value.length>10){

        phone.value =
        phone.value.slice(0,10);

    }

});

// ==========================================================
// PINCODE FORMAT
// ==========================================================

pincode.addEventListener("input",()=>{

    pincode.value =
    pincode.value.replace(/\D/g,"");

    if(pincode.value.length>6){

        pincode.value =
        pincode.value.slice(0,6);

    }

});

// ==========================================================
// AUTO CAPITALIZE
// ==========================================================

function capitalizeWords(input){

    input.addEventListener("input",()=>{

        input.value =
        input.value.replace(/\b\w/g,
        letter=>letter.toUpperCase());

    });

}

capitalizeWords(fatherName);

capitalizeWords(motherName);

capitalizeWords(schoolName);

capitalizeWords(village);

// ==========================================================
// PREVENT SPACES AT START
// ==========================================================

document.querySelectorAll("input,textarea")
.forEach(input=>{

    input.addEventListener("input",()=>{

        input.value =
        input.value.replace(/^\s+/,"");

    });

});

// ==========================================================
// PERCENTAGE LIMIT
// ==========================================================

sslcPercentage.addEventListener("input",()=>{

    if(Number(sslcPercentage.value)>100){

        sslcPercentage.value=100;

    }

});

// ==========================================================
// ENTER KEY
// ==========================================================

document.addEventListener("keydown",(event)=>{

    if(event.key==="Enter"){

        if(currentStep!==4){

            event.preventDefault();

        }

    }

});
// ==========================================================
// PART 5
// FINAL INITIALIZATION & UTILITIES
// ==========================================================

// ==========================================================
// TOAST
// ==========================================================

const toast = document.getElementById("toast");

function showToast(message, type = "success") {

    if (!toast) {
        console.log(message);
        return;
    }

    toast.textContent = message;

    toast.className = "toast show " + type;

    setTimeout(() => {

        toast.className = "toast";

    }, 3000);

}

// ==========================================================
// AUTOSAVE
// ==========================================================

const saveInputs = document.querySelectorAll(

    "input, select, textarea"

);

saveInputs.forEach((input) => {

    input.addEventListener("input", () => {

        localStorage.setItem(

            "zenovaOnboarding",

            JSON.stringify({

                phone: phone.value,

                dob: dob.value,

                fatherName: fatherName.value,

                motherName: motherName.value,

                schoolName: schoolName.value,

                sslcPercentage: sslcPercentage.value,

                sslcRegisterNumber: sslcRegisterNumber.value,

                sslcMedium: sslcMedium.value,

                joiningClass: joiningClass.value,

                course: course.value,

                combination: combination.value,

                state: state.value,

                district: district.value,

                taluk: taluk.value,

                village: village.value,

                pincode: pincode.value,

                fullAddress: fullAddress.value

            })

        );

    });

});

// ==========================================================
// RESTORE
// ==========================================================

const savedData = localStorage.getItem(

    "zenovaOnboarding"

);

if (savedData) {

    const data = JSON.parse(savedData);

    phone.value = data.phone || "";

    dob.value = data.dob || "";

    fatherName.value = data.fatherName || "";

    motherName.value = data.motherName || "";

    schoolName.value = data.schoolName || "";

    sslcPercentage.value = data.sslcPercentage || "";

    sslcRegisterNumber.value =
        data.sslcRegisterNumber || "";

    sslcMedium.value = data.sslcMedium || "";

    joiningClass.value = data.joiningClass || "";

    course.value = data.course || "";

    // Reload combinations

    if (course.value === "Science") {

        combination.innerHTML = `
        <option value="">Select Combination</option>
        <option value="PCMB">PCMB</option>
        <option value="PCMC">PCMC</option>
        `;

    }

    if (course.value === "Commerce") {

        combination.innerHTML = `
        <option value="">Select Combination</option>
        <option value="CEBA">CEBA</option>
        `;

    }

    combination.value = data.combination || "";

    state.value = data.state || "Karnataka";

    district.value = data.district || "";

    district.dispatchEvent(new Event("change"));

    taluk.value = data.taluk || "";

    village.value = data.village || "";

    pincode.value = data.pincode || "";

    fullAddress.value = data.fullAddress || "";

}

// ==========================================================
// ONLINE / OFFLINE
// ==========================================================

window.addEventListener("offline", () => {

    showToast(

        "No internet connection.",

        "error"

    );

});

window.addEventListener("online", () => {

    showToast(

        "Internet connected.",

        "success"

    );

});

// ==========================================================
// CLEAR LOCAL STORAGE AFTER SUCCESS
// ==========================================================

continueDashboard.addEventListener("click", () => {

    localStorage.removeItem(

        "zenovaOnboarding"

    );

});

// ==========================================================
// PAGE READY
// ==========================================================

window.addEventListener("load", () => {

    console.log(

        "Zenova Onboarding Ready"

    );

});
