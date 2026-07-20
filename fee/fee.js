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

// =============================
// HTML ELEMENTS
// =============================

const studentPhoto = document.getElementById("studentPhoto");
const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const studentPhone = document.getElementById("studentPhone");
const studentCourse = document.getElementById("studentCourse");
const studentCombination = document.getElementById("studentCombination");
const studentJoining = document.getElementById("studentJoining");

const advanceAmount = document.getElementById("advanceAmount");
const firstInstallment = document.getElementById("firstInstallment");

const summaryAdvance = document.getElementById("summaryAdvance");
const summaryInstallment = document.getElementById("summaryInstallment");
const summaryTotal = document.getElementById("summaryTotal");

const confirmFee = document.getElementById("confirmFee");

const feeForm = document.getElementById("feeForm");

const loadingOverlay = document.getElementById("loadingOverlay");

const backButton = document.getElementById("backButton");

let currentUser = null;

// =============================
// LOGIN CHECK
// =============================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="../";

        return;

    }

    currentUser=user;

    await loadStudent();

});

// =============================
// LOAD STUDENT
// =============================

async function loadStudent(){

    try{

        const ref=doc(db,"students",currentUser.uid);

        const snap=await getDoc(ref);

        if(!snap.exists()){

            window.location.href="../onboarding/";

            return;

        }

        const data=snap.data();

        studentPhoto.src=data.photo || "../assets/images/profile.png";

        studentName.textContent=data.name;

        studentEmail.textContent=data.email;

        studentPhone.textContent=data.phone;

        studentCourse.textContent=data.course;

        studentCombination.textContent=data.combination;

        studentJoining.textContent=data.joiningClass;

        if(data.feeCompleted){

            window.location.href="../student/";

        }

    }

    catch(error){

        console.error(error);

        alert("Unable to load student.");

    }

}

// =============================
// LIVE CALCULATION
// =============================

function updateSummary(){

    const advance=Number(advanceAmount.value)||0;

    const installment=Number(firstInstallment.value)||0;

    const total=advance+installment;

    summaryAdvance.textContent="₹"+advance.toLocaleString();

    summaryInstallment.textContent="₹"+installment.toLocaleString();

    summaryTotal.textContent="₹"+total.toLocaleString();

}

advanceAmount.addEventListener("input",updateSummary);

firstInstallment.addEventListener("input",updateSummary);

// =============================
// BACK BUTTON
// =============================

backButton.addEventListener("click",()=>{

    history.back();

});

// =============================
// SAVE
// =============================

feeForm.addEventListener("submit",async(e)=>{

    e.preventDefault();

    if(!confirmFee.checked){

        alert("Please confirm the details.");

        return;

    }

    loadingOverlay.classList.add("active");

    try{

        const advance=Number(advanceAmount.value)||0;

        const installment=Number(firstInstallment.value)||0;

        const total=advance+installment;

        await updateDoc(

            doc(db,"students",currentUser.uid),

            {

                fee:{

                    advancePaid:advance,

                    firstInstallment:installment,

                    totalPaid:total,

                    updatedAt:serverTimestamp()

                },

                feeCompleted:true

            }

        );

        loadingOverlay.classList.remove("active");

        window.location.href="../student/";

    }

    catch(error){

        loadingOverlay.classList.remove("active");

        console.error(error);

        alert("Failed to save.");

    }

});
