import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";

const ConsolidatedAttendance = () => {
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [employeeNameFilter, setEmployeeNameFilter] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Fetch consolidated attendance data
  const fetchAttendanceData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/consolidated-attendance-data"); // Replace with your backend endpoint
      const data = await response.json();
      setAttendanceData(data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Filter attendance data
  const filteredData = attendanceData.filter((row) => {
    return (
      (!yearFilter || row.year.toString() === yearFilter) &&
      (!monthFilter || row.month === monthFilter) &&
      (!employeeIdFilter || row.employee_id.toLowerCase().includes(employeeIdFilter.toLowerCase())) &&
      (!employeeNameFilter || row.employee_name.toLowerCase().includes(employeeNameFilter.toLowerCase()))
    );
  });

  return (
    <Box sx={{ padding: 2, maxWidth: 1200, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Consolidated Attendance Data
      </Typography>

      {/* Filters */}
      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <TextField
              select
              label="Year"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              fullWidth
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <TextField
              select
              label="Month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              fullWidth
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={month}>
                  {month}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Employee ID"
              value={employeeIdFilter}
              onChange={(e) => setEmployeeIdFilter(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Employee Name"
              value={employeeNameFilter}
              onChange={(e) => setEmployeeNameFilter(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
        <Box sx={{ textAlign: "right", marginTop: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              setYearFilter("");
              setMonthFilter("");
              setEmployeeIdFilter("");
              setEmployeeNameFilter("");
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Year</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Total Present Days</TableCell>
              <TableCell>Total OT Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{row.employee_id}</TableCell>
                  <TableCell>{row.employee_name}</TableCell>
                  <TableCell>{row.total_present_days}</TableCell>
                  <TableCell>{row.total_ot_hours}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ConsolidatedAttendance;
