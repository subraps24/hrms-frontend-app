import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import axios from "axios";

const PayrollProcessing = () => {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [payrollData, setPayrollData] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleProcessData = async () => {
    setError("");
    setSuccessMessage("");

    if (!year || !month) {
      setError("Please select both Month and Year.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/process-payroll", {
        year,
        month,
      });

      if (response.data.success) {
        // Use the backend-calculated data directly
        setPayrollData(response.data.data);
        setSuccessMessage("Payroll data processed successfully.");
      } else {
        setError("An error occurred while processing payroll.");
      }
    } catch (err) {
      console.error("Error processing payroll:", err);
      setError("Failed to process payroll. Please try again.");
    }
  };

  const handleSavePayroll = async () => {
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/save-payroll", {
        payrollData,
        month,
        year,
      });

      if (response.data.success) {
        setSuccessMessage("Payroll data saved successfully.");
      } else {
        setError("An error occurred while saving payroll data.");
      }
    } catch (err) {
      console.error("Error saving payroll:", err);
      setError("Failed to save payroll. Please try again.");
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Payroll Processing
      </Typography>

      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <TextField
              select
              label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              fullWidth
            >
              {years.map((yearOption) => (
                <MenuItem key={yearOption} value={yearOption}>
                  {yearOption}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              select
              label="Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              fullWidth
            >
              {months.map((monthOption, index) => (
                <MenuItem key={index} value={monthOption}>
                  {monthOption}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleProcessData}
              fullWidth
            >
              Process Data
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}

      {successMessage && (
        <Typography color="primary" sx={{ marginBottom: 2 }}>
          {successMessage}
        </Typography>
      )}

      <Box sx={{ overflowX: "auto", marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Month Days</TableCell>
              <TableCell>Weekend</TableCell>
              <TableCell>Total Present Days</TableCell>
              <TableCell>Total OT Hours</TableCell>
              <TableCell>Payable Days</TableCell>
              <TableCell>Basic Salary</TableCell>
              <TableCell>HRA</TableCell>
              <TableCell>Conveyance Allowance</TableCell>
              <TableCell>Medical Allowance</TableCell>
              <TableCell>Bonus</TableCell>
              <TableCell>Special Allowance</TableCell>
              <TableCell>Gross Salary</TableCell>
              <TableCell>PF Contribution</TableCell>
              <TableCell>ESI Contribution</TableCell>
              <TableCell>Income Tax</TableCell>
              <TableCell>Loan Deduction</TableCell>
              <TableCell>Unpaid Leave Deduction</TableCell>
              <TableCell>Penalties</TableCell>
              <TableCell>Deductions</TableCell>
              <TableCell>Reimbursements</TableCell>
              <TableCell>Incentives</TableCell>
              <TableCell>Net Salary</TableCell>
              <TableCell>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payrollData.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.employee_id}</TableCell>
                <TableCell>{record.employee_name}</TableCell>
                <TableCell>{record.month}</TableCell>
                <TableCell>{record.year}</TableCell>
                <TableCell>{record.month_days}</TableCell>
                <TableCell>{record.weekend}</TableCell>
                <TableCell>{record.total_present_days}</TableCell>
                <TableCell>{record.total_ot_hours}</TableCell>
                <TableCell>{record.payable_days}</TableCell>
                <TableCell>{record.basic_salary}</TableCell>
                <TableCell>{record.hra}</TableCell>
                <TableCell>{record.conveyance_allowance}</TableCell>
                <TableCell>{record.medical_allowance}</TableCell>
                <TableCell>{record.bonus}</TableCell>
                <TableCell>{record.special_allowance}</TableCell>
                <TableCell>{record.gross_salary}</TableCell>
                <TableCell>{record.pf_contribution}</TableCell>
                <TableCell>{record.esi_contribution}</TableCell>
                <TableCell>{record.income_tax}</TableCell>
                <TableCell>{record.loan_deduction}</TableCell>
                <TableCell>{record.unpaid_leave_deduction}</TableCell>
                <TableCell>{record.penalties}</TableCell>
                <TableCell>{record.deductions}</TableCell>
                <TableCell>{record.reimbursements}</TableCell>
                <TableCell>{record.incentives}</TableCell>
                <TableCell>{record.net_salary}</TableCell>
                <TableCell>{record.remarks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {payrollData.length > 0 && (
        <Box sx={{ textAlign: "center", marginTop: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSavePayroll}
          >
            Save
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PayrollProcessing;