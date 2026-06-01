import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  collection,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* -------------------------
   AUTH CHECK
------------------------- */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  loadStudent(user.uid);

  loadFees(user.uid);

  loadAttendance(user.uid);

  loadResults(user.uid);

  loadNotifications(user.uid);

});

/* -------------------------
   STUDENT DATA
------------------------- */

function loadStudent(uid){

  onSnapshot(
    doc(db,"students",uid),

    (snapshot)=>{

      if(!snapshot.exists()) return;

      const data = snapshot.data();

      // Approval Check

      if(data.approved === false){

        window.location.href="pending.html";
        return;

      }

      document.getElementById("studentName").innerText =
      data.name || "Student";

      document.getElementById("welcomeName").innerText =
      "Welcome, " + (data.name || "Student") + " 👋";

      document.getElementById("studentId").innerText =
      "ID : " + (data.studentId || "Not Assigned");

      document.getElementById("studentDob").innerText =
      "🎂 DOB : " + (data.dob || "-");

      document.getElementById("studentStream").innerText =
      "🎓 Stream : " + (data.stream || "-");

      document.getElementById("courseName").innerText =
      data.course || "Integrated Program";

      if(data.photo){

        document.getElementById("studentPhoto").src =
        data.photo;

      }

      document.getElementById("scholarshipStatus").innerText =
      data.scholarshipApproved
      ? "🏆 SCHOLARSHIP APPROVED"
      : "⏳ UNDER REVIEW";

    }

  );

}

/* -------------------------
   FEES
------------------------- */

function loadFees(uid){

  onSnapshot(

    doc(db,"fees",uid),

    (snapshot)=>{

      if(!snapshot.exists()) return;

      const fee = snapshot.data();

      const actualFee =
      fee.actualFee || 0;

      const zenovaScholarship =
      fee.zenovaScholarship || 0;

      const trustScholarship =
      fee.trustScholarship || 0;

      const paid =
      fee.paid || 0;

      const balance =
      fee.balance || 0;

      document.getElementById("actualFee").innerText =
      formatCurrency(actualFee);

      document.getElementById("zenovaScholarship").innerText =
      formatCurrency(zenovaScholarship);

      document.getElementById("trustScholarship").innerText =
      formatCurrency(trustScholarship);

      document.getElementById("paidFee").innerText =
      formatCurrency(paid);

      document.getElementById("balanceFee").innerText =
      formatCurrency(balance);

      document.getElementById("pendingFee").innerText =
      formatCurrency(balance);

    }

  );

}

/* -------------------------
   ATTENDANCE
------------------------- */

function loadAttendance(uid){

  onSnapshot(

    doc(db,"attendance",uid),

    (snapshot)=>{

      if(!snapshot.exists()) return;

      const data = snapshot.data();

      document.getElementById("attendance").innerText =
      (data.percentage || 0) + "%";

    }

  );

}

/* -------------------------
   RESULTS
------------------------- */

function loadResults(uid){

  onSnapshot(

    doc(db,"results",uid),

    (snapshot)=>{

      if(!snapshot.exists()) return;

      const result = snapshot.data();

      document.getElementById("mockTestName").innerText =
      result.latestTest || "No Test";

      document.getElementById("resultScore").innerText =
      result.score || 0;

      document.getElementById("resultRank").innerText =
      result.rank || 0;

      document.getElementById("rank").innerText =
      result.rank || 0;

    }

  );

}

/* -------------------------
   NOTIFICATIONS
------------------------- */

function loadNotifications(uid){

  const container =
  document.getElementById("notificationContainer");

  const q =
  query(
    collection(db,"notifications"),
    where("studentId","in",[uid,"all"])
  );

  onSnapshot(q,(snapshot)=>{

    container.innerHTML = "";

    if(snapshot.empty){

      container.innerHTML = `
      <div class="notification">
      No Notifications
      </div>
      `;

      return;

    }

    snapshot.forEach((docItem)=>{

      const data = docItem.data();

      container.innerHTML += `

      <div class="notification">

      <strong>
      ${data.title || ""}
      </strong>

      <br>

      ${data.message || ""}

      </div>

      `;

    });

  });

}

/* -------------------------
   FORMAT
------------------------- */

function formatCurrency(amount){

  return "₹" +
  Number(amount)
  .toLocaleString("en-IN");

}

/* -------------------------
   OPTIONAL LOGOUT
------------------------- */

window.logout = async function(){

  await signOut(auth);

  location.href = "index.html";

        }
