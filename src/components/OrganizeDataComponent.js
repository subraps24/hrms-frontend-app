// import React, { useState } from "react";
// import axios from "axios";

// const OrganizeDataComponent = () => {
//   const [file, setFile] = useState(null);
//   const [organizedData, setOrganizedData] = useState([]);
//   const [downloadLink, setDownloadLink] = useState("");
//   const [error, setError] = useState("");

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       setError("Please select a file to upload.");
//       return;
//     }

//     setError("");
//     setOrganizedData([]);
//     setDownloadLink("");

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const response = await axios.post("http://localhost:3000/api/organize-data", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setOrganizedData(response.data.data || []);
//       setDownloadLink(response.data.downloadLink || "");
//     } catch (err) {
//       setError(err.response?.data?.message || "An error occurred while processing the file.");
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>Organize Attendance Data</h1>
//       <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
//       <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
//         Upload and Organize
//       </button>

//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {organizedData.length > 0 && (
//         <div>
//           <h2>Organized Data</h2>
//           <table border="1" style={{ width: "100%", marginTop: "20px", textAlign: "left" }}>
//             <thead>
//               <tr>
//                 <th>Employee Code</th>
//                 <th>Employee Name</th>
//                 <th>Date</th>
//                 <th>In Time</th>
//                 <th>Out Time</th>
//                 <th>Shift</th>
//                 <th>Late By</th>
//                 <th>OT Hours</th>
//                 <th>Final OT Hours</th>
//                 <th>Total Present Days</th>
//               </tr>
//             </thead>
//             <tbody>
//               {organizedData.map((row, index) => (
//                 <tr key={index}>
//                   {row.map((cell, cellIndex) => (
//                     <td key={cellIndex}>{cell}</td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {downloadLink && (
//         <div style={{ marginTop: "20px" }}>
//           <a href={downloadLink} target="_blank" rel="noopener noreferrer">
//             Download Organized File
//           </a>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrganizeDataComponent;
