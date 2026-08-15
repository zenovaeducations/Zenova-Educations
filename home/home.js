// ==========================================================
// ZENOVA EDUCATIONS
// HOME DASHBOARD
// home.js — PART 1
// ==========================================================

import { auth, db } from "../firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    getDoc
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

const studentClass =
    document.getElementById("studentClass");

const studentBatch =
    document.getElementById("studentBatch");


// ==========================================================
// QUICK STATS
// ==========================================================

const classesToday =
    document.getElementById("classesToday");

const upcomingTests =
    document.getElementById("upcomingTests");

const feesPending =
    document.getElementById("feesPending");

const improvement =
    document.getElementById("improvement");


// ==========================================================
// PERFORMANCE
// ==========================================================

const overallPerformance =
    document.getElementById("overallPerformance");

const overallProgress =
    document.getElementById("overallProgress");

const physicsProgress =
    document.getElementById("physicsProgress");

const chemistryProgress =
    document.getElementById("chemistryProgress");

const mathsProgress =
    document.getElementById("mathsProgress");

const biologyProgress =
    document.getElementById("biologyProgress");

const physicsBar =
    document.getElementById("physicsBar");

const chemistryBar =
    document.getElementById("chemistryBar");

const mathsBar =
    document.getElementById("mathsBar");

const biologyBar =
    document.getElementById("biologyBar");


// ==========================================================
// SCHEDULE / TESTS
// ==========================================================

const todaySchedule =
    document.getElementById("todaySchedule");

const tomorrowSchedule =
    document.getElementById("tomorrowSchedule");

const recentTests =
    document.getElementById("recentTests");


// ==========================================================
// SIDE MENU
// ==========================================================

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

const sideStudentPhoto =
    document.getElementById("sideStudentPhoto");

const sideStudentName =
    document.getElementById("sideStudentName");

const sideStudentClass =
    document.getElementById("sideStudentClass");


// ==========================================================
// AUTH CHECK
// ==========================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "../";

        return;
    }

    currentUser = user;

    await loadStudent();

});


// ==========================================================
// LOAD STUDENT
// ==========================================================

async function loadStudent() {

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


        // ------------------------------------------
        // ONBOARDING CHECK
        // ------------------------------------------

        if (
            studentData.onboardingCompleted !== true
        ) {

            window.location.href =
                "../onboarding/";

            return;
        }


        // ------------------------------------------
        // FEE CHECK
        // ------------------------------------------

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
            "Unable to load your dashboard."
        );

    }

}


// ==========================================================
// RENDER STUDENT
// ==========================================================

function renderStudent() {

    const data = studentData;


    // ------------------------------------------
    // PHOTO
    // ------------------------------------------

    const photo =
        data.photo ||
        "../assets/images/profile.png";

    studentPhoto.src = photo;

    sideStudentPhoto.src = photo;


    // ------------------------------------------
    // NAME
    // ------------------------------------------

    const name =
        data.name || "Student";

    studentName.textContent = name;

    sideStudentName.textContent = name;


    // ------------------------------------------
    // CLASS + COMBINATION
    // ------------------------------------------

    const studentClassValue =
        data.joiningClass || "Student";

    const combination =
        data.combination || "";

    studentClass.textContent =
        combination
            ? `${studentClassValue} • ${combination}`
            : studentClassValue;


    sideStudentClass.textContent =
        combination
            ? `${studentClassValue} • ${combination}`
            : studentClassValue;


    // ------------------------------------------
    // BATCH
    // ------------------------------------------

    studentBatch.textContent =
        "Zenova Integrated Batch";


    // ------------------------------------------
    // FEE PENDING
    // ------------------------------------------

    /*
       We currently know only the amount paid.

       Until a total course fee is added to
       Firestore, pending amount cannot be
       calculated accurately.

       Therefore display ₹0 for now.
    */

    feesPending.textContent =
        "₹0";


    // ------------------------------------------
    // INITIAL EMPTY STATS
    // ------------------------------------------

    classesToday.textContent =
        "0";

    upcomingTests.textContent =
        "0";

    improvement.textContent =
        "—";


    // ------------------------------------------
    // PERFORMANCE
    // ------------------------------------------

    resetPerformance();

}


// ==========================================================
// RESET PERFORMANCE
// ==========================================================

function resetPerformance() {

    overallPerformance.textContent =
        "—";

    overallProgress.style.width =
        "0%";


    physicsProgress.textContent =
        "—";

    chemistryProgress.textContent =
        "—";

    mathsProgress.textContent =
        "—";

    biologyProgress.textContent =
        "—";


    physicsBar.style.width =
        "0%";

    chemistryBar.style.width =
        "0%";

    mathsBar.style.width =
        "0%";

    biologyBar.style.width =
        "0%";

}


// ==========================================================
// SCHEDULE
// ==========================================================

// For now these are UI placeholders.
// Later the teacher portal will create the actual
// schedule documents in Firestore.

function showNoSchedule() {

    todaySchedule.innerHTML = `
        <div class="empty-card">

            <i class="ri-calendar-line"></i>

            <strong>No classes scheduled</strong>

            <p>
                Your today's classes will appear here.
            </p>

        </div>
    `;


    tomorrowSchedule.innerHTML = `
        <p>No classes uploaded yet.</p>
    `;

}


// ==========================================================
// TESTS
// ==========================================================

function showNoTests() {

    recentTests.innerHTML = `
        <div class="empty-card">

            <i class="ri-file-list-3-line"></i>

            <strong>No tests yet</strong>

            <p>
                Your completed tests will appear here.
            </p>

        </div>
    `;

}


// ==========================================================
// INITIAL DASHBOARD DATA
// ==========================================================

function initializeAcademicSections() {

    // Until teacher data is connected,
    // keep the sections empty rather than
    // displaying fake information.

    showNoSchedule();

    showNoTests();

}


// ==========================================================
// SIDE MENU
// ==========================================================

function openMenu() {

    sideMenu.classList.add("active");

    menuOverlay.classList.add("active");

    document.body.style.overflow = "hidden";

}


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
// CLOSE MENU
// ==========================================================

closeMenu.addEventListener("click", () => {

    closeSideMenu();

});


// ==========================================================
// OVERLAY
// ==========================================================

menuOverlay.addEventListener("click", () => {

    closeSideMenu();

});


// ==========================================================
// ESCAPE KEY
// ==========================================================

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeSideMenu();

    }

});


// ==========================================================
// CLOSE MENU AFTER LINK CLICK
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
            "Logout error:",
            error
        );

        alert(
            "Unable to logout. Please try again."
        );

    }

});


// ==========================================================
// IMAGE FALLBACK
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
// START ACADEMIC SECTIONS
// ==========================================================

initializeAcademicSections();


// ==========================================================
// DASHBOARD READY
// ==========================================================

console.log(
    "Zenova Home Dashboard loaded successfully."
);
