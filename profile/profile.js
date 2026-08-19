// ==========================================================
// ZENOVA EDUCATIONS
// STUDENT DASHBOARD
// student.js — PART 1
// ==========================================================

import { auth, db } from "../firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ==========================================================
// GLOBAL
// ==========================================================

let currentUser = null;
let studentData = null;


// ==========================================================
// ELEMENTS
// ==========================================================

const studentPhoto =
    document.getElementById("studentPhoto");

const studentName =
    document.getElementById("studentName");

const studentCourse =
    document.getElementById("studentCourse");

const studentBatch =
    document.getElementById("studentBatch");


// Personal

const detailName =
    document.getElementById("detailName");

const detailEmail =
    document.getElementById("detailEmail");

const detailPhone =
    document.getElementById("detailPhone");

const detailDOB =
    document.getElementById("detailDOB");

const detailFather =
    document.getElementById("detailFather");

const detailMother =
    document.getElementById("detailMother");


// Academic

const detailSchool =
    document.getElementById("detailSchool");

const detailPercentage =
    document.getElementById("detailPercentage");

const detailRegister =
    document.getElementById("detailRegister");

const detailMedium =
    document.getElementById("detailMedium");

const detailClass =
    document.getElementById("detailClass");

const detailCourse =
    document.getElementById("detailCourse");

const detailCombination =
    document.getElementById("detailCombination");


// Address

const detailState =
    document.getElementById("detailState");

const detailDistrict =
    document.getElementById("detailDistrict");

const detailTaluk =
    document.getElementById("detailTaluk");

const detailVillage =
    document.getElementById("detailVillage");

const detailPincode =
    document.getElementById("detailPincode");

const detailAddress =
    document.getElementById("detailAddress");


// Fees

const feeAdvance =
    document.getElementById("feeAdvance");

const feeInstallment =
    document.getElementById("feeInstallment");

const feeTotal =
    document.getElementById("feeTotal");


// Status

const accountStatus =
    document.getElementById("accountStatus");


// Side menu

const menuBtn =
    document.getElementById("menuBtn");

const moreButton =
    document.getElementById("moreButton");

const closeMenu =
    document.getElementById("closeMenu");

const sideMenu =
    document.getElementById("sideMenu");

const menuOverlay =
    document.getElementById("menuOverlay");

const logoutButton =
    document.getElementById("logoutButton");


// Side profile

const sideStudentPhoto =
    document.getElementById("sideStudentPhoto");

const sideStudentName =
    document.getElementById("sideStudentName");

const sideStudentClass =
    document.getElementById("sideStudentClass");


const editProfileBtn =
    document.getElementById("editProfileBtn");

const editOverlay =
    document.getElementById("editOverlay");

const closeEditProfile =
    document.getElementById("closeEditProfile");

const editProfileForm =
    document.getElementById("editProfileForm");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");
// ==========================================================
// AUTHENTICATION
// ==========================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "../";

        return;

    }

    currentUser = user;

    await loadStudentData();

});


// ==========================================================
// LOAD STUDENT FROM FIRESTORE
// ==========================================================

async function loadStudentData() {

    try {

        const studentRef =
            doc(db, "students", currentUser.uid);

        const snapshot =
            await getDoc(studentRef);


        if (!snapshot.exists()) {

            window.location.href =
                "../onboarding/";

            return;

        }


        studentData =
            snapshot.data();


        // Make sure onboarding is completed

        if (
            studentData.onboardingCompleted !== true
        ) {

            window.location.href =
                "../onboarding/";

            return;

        }


        // Make sure fee is completed

        if (
            studentData.feeCompleted !== true
        ) {

            window.location.href =
                "../fee/";

            return;

        }


        renderStudent();

    }

    catch (error) {

        console.error(
            "Student loading error:",
            error
        );

        alert(
            "Unable to load your student profile."
        );

    }

}


// ==========================================================
// RENDER STUDENT
// ==========================================================

function renderStudent() {

    const data = studentData;


    // =========================
    // PROFILE
    // =========================

    studentPhoto.src =
        data.photo ||
        "../assets/images/profile.png";


    studentName.textContent =
        data.name || "Student";


    studentCourse.textContent =
        `${data.joiningClass || ""} • ${data.combination || ""}`;


    studentBatch.textContent =
        "Zenova Integrated Batch";


    // =========================
    // PERSONAL DETAILS
    // =========================

    detailName.textContent =
        data.name || "—";

    detailEmail.textContent =
        data.email || "—";

    detailPhone.textContent =
        data.phone || "—";

    detailDOB.textContent =
        data.dob || "—";

    detailFather.textContent =
        data.fatherName || "—";

    detailMother.textContent =
        data.motherName || "—";


    // =========================
    // ACADEMIC DETAILS
    // =========================

    detailSchool.textContent =
        data.schoolName || "—";

    detailPercentage.textContent =
        data.sslcPercentage !== undefined
            ? `${data.sslcPercentage}%`
            : "—";

    detailRegister.textContent =
        data.sslcRegisterNumber || "—";

    detailMedium.textContent =
        data.sslcMedium || "—";

    detailClass.textContent =
        data.joiningClass || "—";

    detailCourse.textContent =
        data.course || "—";

    detailCombination.textContent =
        data.combination || "—";


    // =========================
    // ADDRESS
    // =========================

    detailState.textContent =
        data.state || "—";

    detailDistrict.textContent =
        data.district || "—";

    detailTaluk.textContent =
        data.taluk || "—";

    detailVillage.textContent =
        data.village || "—";

    detailPincode.textContent =
        data.pincode || "—";

    detailAddress.textContent =
        data.fullAddress || "—";


    // =========================
    // FEE DETAILS
    // =========================

    const fee =
        data.fee || {};


    feeAdvance.textContent =
        formatCurrency(fee.advancePaid);


    feeInstallment.textContent =
        formatCurrency(
            fee.firstInstallment
        );


    feeTotal.textContent =
        formatCurrency(
            fee.totalPaid
        );


    // =========================
    // SIDE PROFILE
    // =========================

    sideStudentPhoto.src =
        data.photo ||
        "../assets/images/profile.png";


    sideStudentName.textContent =
        data.name || "Student";


    sideStudentClass.textContent =
        `${data.joiningClass || ""} • ${data.combination || ""}`;


    // =========================
    // STATUS
    // =========================

    accountStatus.textContent =
        "Active Student";

}


// ==========================================================
// CURRENCY FORMAT
// ==========================================================

function formatCurrency(amount) {

    const value =
        Number(amount) || 0;

    return "₹" +
        value.toLocaleString("en-IN");

                                        }
// ==========================================================
// STUDENT.JS — PART 2
// MENU + LOGOUT + UI CONTROLS
// ==========================================================


// ==========================================================
// OPEN SIDE MENU
// ==========================================================

function openMenu() {

    sideMenu.classList.add("active");

    menuOverlay.classList.add("active");

    document.body.style.overflow = "hidden";

}


// ==========================================================
// CLOSE SIDE MENU
// ==========================================================

function closeSideMenu() {

    sideMenu.classList.remove("active");

    menuOverlay.classList.remove("active");

    document.body.style.overflow = "";

}


// ==========================================================
// MENU BUTTON
// ==========================================================

menuBtn.addEventListener("click", () => {

    openMenu();

});


// ==========================================================
// MORE BUTTON
// ==========================================================

moreButton.addEventListener("click", () => {

    openMenu();

});


// ==========================================================
// CLOSE BUTTON
// ==========================================================

closeMenu.addEventListener("click", () => {

    closeSideMenu();

});


// ==========================================================
// OVERLAY CLICK
// ==========================================================

menuOverlay.addEventListener("click", () => {

    closeSideMenu();

});


// ==========================================================
// ESC KEY
// ==========================================================

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeSideMenu();

    }

});


// ==========================================================
// CLOSE MENU WHEN LINK IS CLICKED
// ==========================================================

const menuLinks =
    document.querySelectorAll(".menu-links a");

menuLinks.forEach((link) => {

    link.addEventListener("click", () => {

        closeSideMenu();

    });

});


// ==========================================================
// LOGOUT
// ==========================================================

logoutButton.addEventListener("click", async () => {

    const confirmLogout =
        confirm("Are you sure you want to logout?");

    if (!confirmLogout) {

        return;

    }

    try {

        await signOut(auth);

        window.location.href = "../";

    }

    catch (error) {

        console.error(
            "Logout failed:",
            error
        );

        alert(
            "Unable to logout. Please try again."
        );

    }

});


// ==========================================================
// PROFILE IMAGE FALLBACK
// ==========================================================

studentPhoto.addEventListener("error", () => {

    studentPhoto.src =
        "../assets/images/profile.png";

});


sideStudentPhoto.addEventListener("error", () => {

    sideStudentPhoto.src =
        "../assets/images/profile.png";

});


// ==========================================================
// PREVENT BROKEN IMAGE ICON
// ==========================================================

studentPhoto.addEventListener("load", () => {

    studentPhoto.style.opacity = "1";

});


// ==========================================================
// PAGE INITIALIZATION
// ==========================================================

function initializeDashboard() {

    console.log(
        "Zenova Student Dashboard initialized."
    );

}


// ==========================================================
// START
// ==========================================================

// ==========================================================
// EDIT PROFILE
// ==========================================================

const editProfileBtn =
    document.getElementById("editProfileBtn");

const editOverlay =
    document.getElementById("editOverlay");

const closeEditProfile =
    document.getElementById("closeEditProfile");

const editProfileForm =
    document.getElementById("editProfileForm");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");


// ==========================================================
// OPEN EDIT PROFILE
// ==========================================================

if (editProfileBtn) {

    editProfileBtn.addEventListener("click", () => {

        console.log("Edit Profile clicked");

        if (!studentData) {

            alert("Student details are still loading.");

            return;

        }

        fillEditForm();

        editOverlay.classList.add("active");

        document.body.style.overflow = "hidden";

    });

}


// ==========================================================
// FILL FORM
// ==========================================================

function fillEditForm() {

    document.getElementById("editName").value =
        studentData.name || "";

    document.getElementById("editPhone").value =
        studentData.phone || "";

    document.getElementById("editDOB").value =
        studentData.dob || "";

    document.getElementById("editFather").value =
        studentData.fatherName || "";

    document.getElementById("editMother").value =
        studentData.motherName || "";

    document.getElementById("editSchool").value =
        studentData.schoolName || "";

    document.getElementById("editMedium").value =
        studentData.sslcMedium || "";

    document.getElementById("editState").value =
        studentData.state || "";

    document.getElementById("editDistrict").value =
        studentData.district || "";

    document.getElementById("editTaluk").value =
        studentData.taluk || "";

    document.getElementById("editVillage").value =
        studentData.village || "";

    document.getElementById("editPincode").value =
        studentData.pincode || "";

    document.getElementById("editAddress").value =
        studentData.fullAddress || "";

}


// ==========================================================
// CLOSE EDIT
// ==========================================================

function closeEdit() {

    editOverlay.classList.remove("active");

    document.body.style.overflow = "";

}


if (closeEditProfile) {

    closeEditProfile.addEventListener(
        "click",
        closeEdit
    );

}


if (editOverlay) {

    editOverlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target === editOverlay
            ) {

                closeEdit();

            }

        }
    );

}


// ==========================================================
// SAVE PROFILE
// ==========================================================

if (editProfileForm) {

    editProfileForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            if (!currentUser) {

                alert("User not found.");

                return;

            }


            saveProfileBtn.disabled = true;

            saveProfileBtn.innerHTML = `
                <i class="ri-loader-4-line"></i>
                Saving...
            `;


            try {

                const updatedData = {

                    name:
                        document
                        .getElementById("editName")
                        .value
                        .trim(),

                    phone:
                        document
                        .getElementById("editPhone")
                        .value
                        .trim(),

                    dob:
                        document
                        .getElementById("editDOB")
                        .value,

                    fatherName:
                        document
                        .getElementById("editFather")
                        .value
                        .trim(),

                    motherName:
                        document
                        .getElementById("editMother")
                        .value
                        .trim(),

                    schoolName:
                        document
                        .getElementById("editSchool")
                        .value
                        .trim(),

                    sslcMedium:
                        document
                        .getElementById("editMedium")
                        .value,

                    state:
                        document
                        .getElementById("editState")
                        .value
                        .trim(),

                    district:
                        document
                        .getElementById("editDistrict")
                        .value
                        .trim(),

                    taluk:
                        document
                        .getElementById("editTaluk")
                        .value
                        .trim(),

                    village:
                        document
                        .getElementById("editVillage")
                        .value
                        .trim(),

                    pincode:
                        document
                        .getElementById("editPincode")
                        .value
                        .trim(),

                    fullAddress:
                        document
                        .getElementById("editAddress")
                        .value
                        .trim()

                };


                await updateDoc(

                    doc(
                        db,
                        "students",
                        currentUser.uid
                    ),

                    updatedData

                );


                studentData = {

                    ...studentData,

                    ...updatedData

                };


                renderStudent();

                closeEdit();


                alert(
                    "Profile updated successfully."
                );


            }

            catch (error) {

                console.error(
                    "PROFILE UPDATE ERROR:",
                    error
                );

                alert(
                    "Unable to save changes."
                );

            }

            finally {

                saveProfileBtn.disabled = false;

                saveProfileBtn.innerHTML = `
                    <i class="ri-save-line"></i>
                    Save Changes
                `;

            }

        }
    );

}


// ==========================================================
// ESCAPE KEY
// ==========================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            editOverlay &&
            editOverlay.classList.contains("active")
        ) {

            closeEdit();

        }

    }
);
