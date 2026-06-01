import { auth, db } from "./firebase-config.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
doc,
onSnapshot
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="index.html";
return;

}

onSnapshot(
doc(db,"students",user.uid),

(snapshot)=>{

const data=snapshot.data();

document
.getElementById("studentName")
.innerText=data.name;

document
.getElementById("studentEmail")
.innerText=data.email;

document
.getElementById("studentPhoto")
.src=data.photo;

});

});
