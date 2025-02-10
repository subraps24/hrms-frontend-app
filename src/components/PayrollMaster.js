import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Typography,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Modal,
  TextField,
  Paper,
  MenuItem,
} from "@mui/material";
import axios from "axios";


const PayrollMaster = () => {
  const [payrollData, setPayrollData] = useState([]); // Payroll records
  const [employees, setEmployees] = useState([]); // Employee data for dropdown
  const [categories, setCategories] = useState([]); // Categories from payroll_mapping
  const [filteredEmployees, setFilteredEmployees] = useState([]); // Employees not in payroll_master
  const [availableColumns, setAvailableColumns] = useState([]); // Payroll columns for selected category
  const [openModal, setOpenModal] = useState(false); // Modal state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openUploadModal, setOpenUploadModal] = useState(false); // Modal for uploaded data
  const [uploadedData, setUploadedData] = useState([]); // Data from uploaded file
  const [currentRecord, setCurrentRecord] = useState(null); // Current record for editing
  const [newRecord, setNewRecord] = useState({
    employee_id: "",
    employee_name: "",
    category_name: "",

  });
  const [error, setError] = useState("");

  // Fetch payroll data and employees on load
  useEffect(() => {
    fetchPayrollData();
    fetchEmployees();
    fetchCategories();
  }, []);

  const fetchPayrollData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/payroll");
      setPayrollData(response.data);
    } catch (error) {
      console.error("Error fetching payroll data:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategoryC = async (e) => {
    const category = e.target.value;
    setSelectedCategory(category);

    try {
      // Fetch available columns for the selected category
      const columnsResponse = await axios.get(
        `http://localhost:5000/api/category-columns/${category}`
      );
      setAvailableColumns(columnsResponse.data);

      // Filter employees not in payroll_master for the selected category
      const filtered = employees.filter(
        (emp) =>
          !payrollData.some(
            (record) =>
              record.employee_id === emp.employee_id &&
              record.category_name === category
          )
      );
      setFilteredEmployees(filtered);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const exportToExcel = () => {
    if (!selectedCategory) {
      alert("Please select a category first.");
      return;
    }

    // Prepare data for Excel
    const excelData = filteredEmployees.map((emp) => {
      const row = { Employee_ID: emp.employee_id, Employee_Name: emp.employee_name };

      // Add category-specific headers as empty columns
      availableColumns.forEach((col) => {
        row[col.replace(/_/g, " ")] = ""; // Header with spaces
      });

      return row;
    });

    // Convert JSON data to Excel workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Employees");

    // Trigger file download
    XLSX.writeFile(workbook, `Filtered_Employees_${selectedCategory}.xlsx`);
  };


  const handleCategoryChange = async (e) => {
    const selectedCategory = e.target.value;
    setNewRecord((prev) => ({ ...prev, category_name: selectedCategory }));

    try {
      const response = await axios.get(
        `http://localhost:5000/api/category-columns/${selectedCategory}`
      );
      setAvailableColumns(response.data);
    } catch (error) {
      console.error("Error fetching category columns:", error);
    }
  };

  const downloadTemplate = () => {
    const template = availableColumns.reduce((acc, col) => {
      acc[col] = "";
      return acc;
    }, {});
    const csvContent = [
      Object.keys(template).join(","),
      Object.values(template).join(","),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCategory}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result); // Convert file content to array
        const workbook = XLSX.read(data, { type: "array" }); // Read Excel file

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]; // Get the first sheet
        const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }); // Parse sheet data

        setUploadedData(sheetData); // Store parsed data
        setOpenUploadModal(true); // Open modal to show the data
      };

      reader.readAsArrayBuffer(file); // Read the file as array buffer
    }
  };


 const handleSaveUploadedData = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/upload-payroll-data',
      { payrollData: uploadedData } // Replace `uploadedData` with your parsed Excel data
    );
    alert(response.data.message);
  } catch (error) {
    console.error('Error saving data:', error);
    alert('Failed to save payroll data');
  }
};

  
  



  const handleInputChange = (e) => {
    const { name, value } = e.target;
 // Update newRecord state
 setNewRecord((prev) => {
  const updatedRecord = { ...prev, [name]: value };

  // Calculate derived values
  updatedRecord.gross_salary = calculateGrossSalary(updatedRecord);
  updatedRecord.deductions = calculateDeductions(updatedRecord);
  updatedRecord.net_salary = calculateNetSalary(updatedRecord);

  return updatedRecord;
});
};
const calculateGrossSalary = (record) => {
  const {
    basic_salary,
    hra,
    conveyance_allowance,
    medical_allowance,
    bonus,
    special_allowance,
    dearness_allowance,
    shift_allowance,
    city_compensatory_allowance,
    project_allowance,
    educational_allowance,
    relocation_allowance,
    joining_bonus,
    retention_bonus,
    project_compensation_bonus,
  } = record;
  return (
    Number(basic_salary || 0) +
    Number(hra || 0) +
    Number(conveyance_allowance || 0) +
    Number(medical_allowance || 0) +
    Number(bonus || 0) +
    Number(special_allowance || 0) +
    Number(dearness_allowance || 0) +
    Number(shift_allowance || 0) +
    Number(city_compensatory_allowance || 0) +
    Number(project_allowance || 0) +
    Number(educational_allowance || 0) +
    Number(relocation_allowance || 0) +
    Number(joining_bonus || 0) +
    Number(retention_bonus || 0) +
    Number(project_compensation_bonus || 0)
  );
};

const calculateDeductions = (record) => {
  const {
    pf_contribution,
    esi_contribution,
    income_tax,
    loan_deduction,
    unpaid_leave_deduction,
    penalties,
    gratuity_contribution,
    meal_plan_deduction,
    transport_facility_deduction,
    attendance_penalty,
    loss_of_pay,
  } = record;
  return (
    Number(pf_contribution || 0) +
    Number(esi_contribution || 0) +
    Number(income_tax || 0) +
    Number(loan_deduction || 0) +
    Number(unpaid_leave_deduction || 0) +
    Number(penalties || 0) +
    Number(gratuity_contribution || 0) +
    Number(meal_plan_deduction || 0) +
    Number(transport_facility_deduction || 0) +
    Number(attendance_penalty || 0) +
    Number(loss_of_pay || 0)
  );
};

const calculateNetSalary = (record) => {
  return calculateGrossSalary(record) - calculateDeductions(record);
};


  const handleEmployeeChange = (e) => {
    const selectedEmployee = employees.find(
      (emp) => emp.employee_id === e.target.value
    );
    setNewRecord((prev) => ({
      ...prev,
      employee_id: selectedEmployee.employee_id,
      employee_name: selectedEmployee.employee_name,
    }));
  };
  //***FROM HERE NEED TO CHANGE
  // const handleAddRecord = async () => {
  //   // Validate required fields
  //   if (!newRecord.employee_id || !newRecord.category_name) {
  //     setError("Employee and category_name are required");
  //     return;
  //   }

  //   // Prepare data for saving, excluding gross_salary
  //   const recordToSave = {
  //     ...newRecord,
  //     basic_salary: Number(newRecord.basic_salary || 0),
  //     hra: Number(newRecord.hra || 0),
  //     conveyance_allowance: Number(newRecord.conveyance_allowance || 0),
  //     medical_allowance: Number(newRecord.medical_allowance || 0),
  //     bonus: Number(newRecord.bonus || 0),
  //     special_allowance: Number(newRecord.special_allowance || 0),
  //     dearness_allowance: Number(newRecord.dearness_allowance || 0),
  //     shift_allowance: Number(newRecord.shift_allowance || 0),
  //     city_compensatory_allowance: Number(newRecord.city_compensatory_allowance || 0),
  //     project_allowance: Number(newRecord.project_allowance || 0),
  //     educational_allowance: Number(newRecord.educational_allowance || 0),
  //     relocation_allowance: Number(newRecord.relocation_allowance || 0),
  //     joining_bonus: Number(newRecord.joining_bonus || 0),
  //     retention_bonus: Number(newRecord.retention_bonus || 0),
  //     project_compensation_bonus: Number(newRecord.project_compensation_bonus || 0),
  //     pf_contribution: Number(newRecord.pf_contribution || 0),
  //     esi_contribution: Number(newRecord.esi_contribution || 0),
  //     income_tax: Number(newRecord.income_tax || 0),
  //     loan_deduction: Number(newRecord.loan_deduction || 0),
  //     unpaid_leave_deduction: Number(newRecord.unpaid_leave_deduction || 0),
  //     penalties: Number(newRecord.penalties || 0),
  //     gratuity_contribution: Number(newRecord.gratuity_contribution || 0),
  //     meal_plan_deduction: Number(newRecord.meal_plan_deduction || 0),
  //     transport_facility_deduction:Number(newRecord.transport_facility_deduction || 0),
  //     attendance_penalty: Number(newRecord.attendance_penalty || 0),
  //     loss_of_pay:Number(newRecord.loss_of_pay || 0),
  //     deductions: calculateDeductions(),
  //     reimbursements: Number(newRecord.reimbursements || 0),
  //     incentives: Number(newRecord.incentives || 0),
  //     net_salary: calculateNetSalary(),
  //   };

  //   try {
  //     if (currentRecord) {
  //       // Update existing record
  //       await axios.put(
  //         `http://localhost:5000/api/payroll/${currentRecord.payroll_id}`,
  //         recordToSave
  //       );
  //       alert("Payroll record updated successfully!");
  //     } else {
  //       // Add new record
  //       await axios.post("http://localhost:5000/api/payroll", recordToSave);
  //       alert("Payroll record added successfully!");
  //     }
  //     fetchPayrollData();
  //     setOpenModal(false);
  //     resetForm();
  //   } catch (error) {
  //     console.error("Error saving payroll record:", error.response?.data || error.message);
  //     alert("Failed to save payroll record");
  //   }
  // };


  const handleAddRecord = async () => {
    if (!newRecord.employee_id || !newRecord.category_name) {
      setError("Employee and Category Name are required");
      return;
    }
  
    const recordToSave = {
      ...newRecord,
      gross_salary: calculateGrossSalary(newRecord),
      deductions: calculateDeductions(newRecord),
      net_salary: calculateNetSalary(newRecord),
    };
  
    try {
      if (currentRecord) {
        await axios.put(
          `http://localhost:5000/api/payroll/${currentRecord.payroll_id}`,
          recordToSave
        );
        alert("Payroll record updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/payroll", recordToSave);
        alert("Payroll record added successfully!");
      }
      fetchPayrollData();
      setOpenModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving payroll record:", error);
      alert("Failed to save payroll record");
    }
  };
  
  const handleEditRecord = (record) => {
    setCurrentRecord(record);
    setNewRecord(record);
    setOpenModal(true);
  };

  const resetForm = () => {
    setNewRecord({
      employee_id: "",
      employee_name: "",
      category_name: "",
      basic_salary: "",
      hra: "",
      conveyance_allowance: "",
      medical_allowance: "",
      bonus: "",
      special_allowance: "",
      dearness_allowance: "",
      shift_allowance: "",
      city_compensatory_allowance: "",
      project_allowance: "",
      educational_allowance: "",
      relocation_allowance: "",
      joining_bonus: "",
      retention_bonus: "",
      project_compensation_bonus: "",
      pf_contribution: "",
      esi_contribution: "",
      income_tax: "",
      loan_deduction: "",
      unpaid_leave_deduction: "",
      penalties: "",
      gratuity_contribution: "",
      meal_plan_deduction: "",
      transport_facility_deduction: "",
      attendance_penalty: "",
      loss_of_pay: "",
      reimbursements: "",
      incentives: "",
      net_salary: "",
      remarks: "",
    });
    setError("");
    setCurrentRecord(null);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Payroll Master
      </Typography>  

{/* Category Dropdown */}
<TextField
        select
        fullWidth
        label="Category"
        value={selectedCategory}
        onChange={handleCategoryC}
        sx={{ marginBottom: 2 }}
      >
        {categories.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
     </TextField>


 {/* Export to Excel Button */}
 <Button
        variant="contained"
        color="primary"
        onClick={exportToExcel}
        sx={{ marginBottom: 2 }}
      >
        Export to Excel
      </Button>
      <Button variant="contained" component="label">
            Upload Excel
            <input
              type="file"
              accept=".xlsx"
              hidden
              onChange={handleFileUpload}
            />
          </Button>





{/* Uploaded Data Modal */}
<Modal open={openUploadModal} onClose={() => setOpenUploadModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Uploaded Data
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {Object.keys(uploadedData[0] || {}).map((key) => (
                    <TableCell key={key}>{key}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {uploadedData.map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value, i) => (
                      <TableCell key={i}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
          <Button
  variant="contained"
  color="primary"
  onClick={handleSaveUploadedData}
  sx={{ marginRight: 2 }}
>
  Save
</Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenUploadModal(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>



      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          resetForm();
          setOpenModal(true);
        }}
      >
        Add Payroll Record
      </Button>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Gross Salary</TableCell>
              <TableCell>Total Deductions</TableCell>
              <TableCell>Net Salary</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payrollData.map((record) => (
              <TableRow key={record.payroll_id}>
                <TableCell>{record.employee_id}</TableCell>
                <TableCell>{record.employee_name}</TableCell>
                <TableCell>{record.category_name}</TableCell>
                <TableCell>{record.gross_salary}</TableCell>
                <TableCell>{record.deductions}</TableCell>
                <TableCell>{record.net_salary}</TableCell>

                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEditRecord(record)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Payroll Modal */}
      {/* <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
            maxHeight: "80vh", // Limit height to 80% of viewport height
            overflowY: "auto", // Enable vertical scroll if content overflows
          }}
        >
          <Typography variant="h6" gutterBottom>
            {currentRecord ? "Edit Payroll Record" : "Add Payroll Record"}
          </Typography>
          <Box component="form">
            <TextField
              select
              fullWidth
              label="Employee"
              name="employee_id"
              value={newRecord.employee_id || ""}
              onChange={handleEmployeeChange}
              sx={{ marginBottom: 2 }}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.employee_id} value={emp.employee_id}>
                  {emp.employee_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Category Name"
              name="category_name"
              value={newRecord.category_name || ""}
              onChange={handleCategoryChange}
              sx={{ marginBottom: 2 }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>


            <Typography variant="h6">Payroll Columns:</Typography>
            <ul>
            {availableColumns.map((col) => (
              <TextField
                key={col}
                fullWidth
                label={col}
                name={col}
                value={newRecord[col] || ""}
                onChange={handleInputChange}
                sx={{ marginBottom: 2 }}
              />
            ))}
            </ul>


            <TextField
              fullWidth
              label="Basic Salary"
              name="basic_salary"
              value={newRecord.basic_salary || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="HRA"
              name="hra"
              value={newRecord.hra || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Conveyance Allowance"
              name="conveyance_allowance"
              value={newRecord.conveyance_allowance || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Medical Allowance"
              name="medical_allowance"
              value={newRecord.medical_allowance || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Bonus"
              name="bonus"
              value={newRecord.bonus || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Special Allowance"
              name="special_allowance"
              value={newRecord.special_allowance || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Dearness Allowance"
              name="dearness_allowance"
              value={newRecord.dearness_allowance || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Shift Allowance"
              name="shift_allowance"
              value={newRecord.shift_allowance || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="City Compensatory Allowance"
              name="city_compensatory_allowance"
              value={newRecord.city_compensatory_allowance || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Project Allowance"
              name="project_allowance"
              value={newRecord.project_allowance || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Educational Allowance"
              name="educational_allowance"
              value={newRecord.educational_allowance || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />

            <TextField
              fullWidth
              label="Relocation Allowance"
              name="relocation_allowance"
              value={newRecord.relocation_allowance || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Joining Bonus"
              name="joining_bonus"
              value={newRecord.joining_bonus || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Retention Bonus"
              name="retention_bonus"
              value={newRecord.retention_bonus || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Project Compensation Bonus"
              name="project_compensation_bonus"
              value={newRecord.project_compensation_bonus || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Gross Salary"
              value={calculateGrossSalary()}
              InputProps={{ readOnly: true }}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="PF Contribution"
              name="pf_contribution"
              value={newRecord.pf_contribution || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="ESI Contribution"
              name="esi_contribution"
              value={newRecord.esi_contribution || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Income Tax"
              name="income_tax"
              value={newRecord.income_tax || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Loan Deduction"
              name="loan_deduction"
              value={newRecord.loan_deduction || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Unpaid Leave Deduction"
              name="unpaid_leave_deduction"
              value={newRecord.unpaid_leave_deduction || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Penalties"
              name="penalties"
              value={newRecord.penalties || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
 <TextField
              fullWidth
              label="Gratuity Contribution"
              name="gratuity_contribution"
              value={newRecord.gratuity_contribution || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
 <TextField
              fullWidth
              label="Meal Plan Deduction"
              name="meal_plan_deduction"
              value={newRecord.meal_plan_deduction || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />

<TextField
              fullWidth
              label="Transport Facility Deduction"
              name="transport_facility_deduction"
              value={newRecord.transport_facility_deduction || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
<TextField
              fullWidth
              label="Attendance Penalty"
              name="attendance_penalty"
              value={newRecord.attendance_penalty || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
<TextField
              fullWidth
              label="Loss Of Pay"
              name="loss_of_pay"
              value={newRecord.loss_of_pay || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Total Deduction"
              value={calculateDeductions()}
              InputProps={{ readOnly: true }}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Reimbursements"
              name="reimbursements"
              value={newRecord.reimbursements || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Incentives"
              name="incentives"
              value={newRecord.incentives || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Net Salary"
              value={calculateNetSalary()}
              InputProps={{ readOnly: true }}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Remarks"
              name="remarks"
              value={newRecord.remarks || ""}
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            />
          </Box>
          {error && <Typography color="error">{error}</Typography>}
          <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
            <Button variant="contained" color="primary" onClick={handleAddRecord}>
              {currentRecord ? "Update" : "Save"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setOpenModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal> */



      
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50%",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
          maxHeight: "80vh", // Limit height to 80% of viewport height
          overflowY: "auto", // Enable vertical scroll if content overflows
        }}
      >
        <Typography variant="h6" gutterBottom>
          {currentRecord ? "Edit Payroll Record" : "Add Payroll Record"}
        </Typography>
        <Box component="form">
          {/* Employee Dropdown */}
          <TextField
            select
            fullWidth
            label="Employee"
            name="employee_id"
            value={newRecord.employee_id || ""}
            onChange={handleEmployeeChange}
            sx={{ marginBottom: 2 }}
          >
            {employees.map((emp) => (
              <MenuItem key={emp.employee_id} value={emp.employee_id}>
                {emp.employee_name}
              </MenuItem>
            ))}
          </TextField>
    
          {/* Category Dropdown */}
          <TextField
            select
            fullWidth
            label="Category Name"
            name="category_name"
            value={newRecord.category_name || ""}
            onChange={handleCategoryChange}
            sx={{ marginBottom: 2 }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
    
          {/* Conditional Rendering of Payroll Columns */}
          {newRecord.category_name && (
            <>
              <Typography variant="h6" gutterBottom>
                Payroll Columns:
              </Typography>
              {availableColumns.length > 0 ? (
                availableColumns.map((col) => (
                  <TextField
                    key={col}
                    fullWidth
                    label={col.replace(/_/g, " ").toUpperCase()} // Convert column names to readable labels
                    name={col}
                    value={newRecord[col] || ""}
                    onChange={handleInputChange}
                    sx={{ marginBottom: 2 }}
                  />
                ))
              ) : (
                <Typography color="textSecondary">
                  No fields available for the selected category.
                </Typography>
              )}
    
              {/* Conditionally Render Gross Salary, Total Deductions, and Net Salary */}
              {/* {availableColumns.includes("gross_salary") && (
                <TextField
                  fullWidth
                  label="Gross Salary"
                  value={newRecord.gross_salary || 0}
                  InputProps={{ readOnly: true }}
                  sx={{ marginBottom: 2 }}
                />
              )} */}
              {/* {availableColumns.includes("deductions") && (
                <TextField
                  fullWidth
                  label="Total Deductions"
                  value={newRecord.deductions || 0}
                  InputProps={{ readOnly: true }}
                  sx={{ marginBottom: 2 }}
                />
              )} */}
              {/* {availableColumns.includes("net_salary") && (
                <TextField
                  fullWidth
                  label="Net Salary"
                  value={newRecord.net_salary || 0}
                  InputProps={{ readOnly: true }}
                  sx={{ marginBottom: 2 }}
                />
              )} */}
            </>
          )}
        </Box>
        {error && <Typography color="error">{error}</Typography>}
        <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={handleAddRecord}>
            {currentRecord ? "Update" : "Save"}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setOpenModal(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
    
      }

    </Box>
  );
};

export default PayrollMaster;
