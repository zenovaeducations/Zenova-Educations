import { auth, db } from "./firebase-config.js";

import {
GoogleAuthProvider,
signInWithPopup
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
doc,
setDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const provider = new GoogleAuthProvider();

document
.getElementById("googleLogin")
.addEventListener("click", async ()=>{

try{

const result =
await signInWithPopup(auth,provider);

const user = result.user;

await setDoc(
doc(db,"students",user.uid),
{
name:user.displayName,
email:user.email,
photo:user.photoURL,
approved:false,
createdAt:new Date()
},
{merge:true}
);

window.location="dashboard.html";

}
catch(err){
alert(err.message);
}

});
