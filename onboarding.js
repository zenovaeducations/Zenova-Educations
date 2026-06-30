import { auth, db, storage } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";


// ----------------------------
// Elements
// ----------------------------

const form = document.getElementById("onboardingForm");

const stream = document.getElementById("stream");
const course = document.getElementById("course");

const photoInput = document.getElementById("studentPhoto");
const preview = document.getElementById("previewImage");
const photoText = document.getElementById("photoText");
const photoPreview = document.getElementById("photoPreview");

let currentUser = null;


// ----------------------------
// Logged In User
// ----------------------------

onAuthStateChanged(auth, (user)=>{

    if(!user){

        window.location.href="index.html";
        return;

    }

    currentUser=user;

    document.getElementById("name").value=user.displayName || "";

});


// ----------------------------
// Open Image Picker
// ----------------------------

photoPreview.addEventListener("click",()=>{

    photoInput.click();

});


// ----------------------------
// Image Preview
// ----------------------------

photoInput.addEventListener("change",(e)=>{

    const file=e.target.files[0];

    if(!file) return;

    preview.src=URL.createObjectURL(file);

    preview.hidden=false;

    photoText.style.display="none";

});


// ----------------------------
// Course Selection
// ----------------------------

stream.addEventListener("change",()=>{

    course.innerHTML='<option value="">Select Course</option>';

    if(stream.value==="Science"){

        course.innerHTML+=`
            <option value="PCMB">PCMB</option>
            <option value="PCMC">PCMC</option>
        `;

    }

    if(stream.value==="Commerce"){

        course.innerHTML+=`
            <option value="CEBA">CEBA</option>
        `;

    }

});


// ----------------------------
// Save Profile
// ----------------------------

form.addEventListener("submit",async(e)=>{

    e.preventDefault();

    try{

        const btn=document.getElementById("continueBtn");

        btn.disabled=true;

        btn.innerHTML="Saving...";

        let photoURL=currentUser.photoURL || "";

        // Upload Image

        if(photoInput.files.length>0){

            const file=photoInput.files[0];

            const storageRef=ref(storage,"students/"+currentUser.uid+"/profile.jpg");

            await uploadBytes(storageRef,file);

            photoURL=await getDownloadURL(storageRef);

        }


        // Save Firestore

        await updateDoc(doc(db,"students",currentUser.uid),{

            name:document.getElementById("name").value,

            phone:document.getElementById("phone").value,

            fatherName:document.getElementById("fatherName").value,

            motherName:document.getElementById("motherName").value,

            percentage:Number(document.getElementById("percentage").value),

            school:document.getElementById("school").value,

            currentClass:document.getElementById("currentClass").value,

            stream:stream.value,

            course:course.value,

            address:document.getElementById("address").value,

            photoURL:photoURL,

            profileComplete:true,

            updatedAt:serverTimestamp()

        });

        window.location.href="home.html";

    }

    catch(error){

        console.error(error);

        alert(error.message);

        document.getElementById("continueBtn").disabled=false;

        document.getElementById("continueBtn").innerHTML="Complete Profile →";

    }

});
