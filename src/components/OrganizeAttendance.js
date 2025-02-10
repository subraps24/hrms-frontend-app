import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  AppBar,
  Toolbar,
  TableBody,
  useMediaQuery,
  Modal
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../OrganizeAttendance.css"

const OrganizeAttendance = () => {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationNameOptions, setLocationNameOptions] = useState([]);
  const [file, setFile] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [organizedData, setOrganizedData] = useState([]); // Store organized data
  const [shifts, setShifts] = useState([]); // Available shifts
  const [isConsolidated, setIsConsolidated] = useState(false);
  const [consolidatedData, setConsolidatedData] = useState([]);
  const [showConsolidatedModal, setShowConsolidatedModal] = useState(false);
  const modalStyles = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    width: "90%",
  };
  const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];


  const fetchLocations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/locations");
      const result = await response.json();
      setLocationNameOptions(Array.isArray(result) ? result : []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocationNameOptions([]); // Set as an empty array on error
    }
  };

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  // const isTabletScreen = useMediaQuery("(max-width:960px)");
  const navigate = useNavigate();

  useEffect(() => {
    fetchShifts();
    fetchLocations();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/shifts");
      const result = await response.json();
      setShifts(result);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  };
  const calculateOTHoursWithLateBy = (endTime, outTime, lateBy) => {
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    const [outHours, outMinutes] = outTime.split(":").map(Number);

    const endTotalMinutes = endHours * 60 + endMinutes;
    const outTotalMinutes = outHours * 60 + outMinutes;

    if (outTotalMinutes > endTotalMinutes) {
      let diffMinutes = outTotalMinutes - endTotalMinutes;

      // Subtract Late By if it's not "On Time"
      if (lateBy !== "On Time") {
        const [lateHours, lateMinutes] = lateBy.split(":").map(Number);
        const lateTotalMinutes = lateHours * 60 + lateMinutes;
        diffMinutes -= lateTotalMinutes;
      }

      // Ensure OT Hours doesn't go negative
      diffMinutes = Math.max(0, diffMinutes);

      const hours = Math.floor(diffMinutes / 60).toString().padStart(2, "0");
      const minutes = (diffMinutes % 60).toString().padStart(2, "0");

      return `${hours}:${minutes}`;
    }

    return "00:00"; // Default if no OT
  };
  // Function to calculate time difference (returns "On Time" if negative)
  const calculateLateBy = (expected, actual) => {
    const [expectedHours, expectedMinutes] = expected.split(":").map(Number);
    const [actualHours, actualMinutes] = actual.split(":").map(Number);

    const expectedTotalMinutes = expectedHours * 60 + expectedMinutes;
    const actualTotalMinutes = actualHours * 60 + actualMinutes;

    const diffMinutes = actualTotalMinutes - expectedTotalMinutes;

    if (diffMinutes <= 0) return "On Time"; // If the difference is negative or zero

    const hours = Math.floor(diffMinutes / 60).toString().padStart(2, "0");
    const minutes = (diffMinutes % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const handleOrganize = async () => {
    if (!year || !month || !file || !locationName) {
      setError("Year, Month, File, and Location are required!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("year", year);
    formData.append("month", month);
    formData.append("location_name", locationName); // Use the selected location name

    try {
      const response = await fetch("http://localhost:5000/api/organize-attendance", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setOrganizedData(result.data);
        setSuccessMessage(result.message);
      } else {
        setError("Failed to organize attendance data. Please try again.");
      }
    } catch (error) {
      console.error("Error organizing attendance data:", error);
      setError("An error occurred while organizing attendance data.");
    }
  };



  const handleConsolidateAttendance = async () => {
    if (!year || !month || !locationName || !organizedData.length) {
      setError("Year, Month, Location, and Organized Data are required for consolidation!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/consolidate-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, location_name: locationName, organizedData }),
      });

      if (response.ok) {
        const result = await response.json();
        setConsolidatedData(result.consolidatedData);
        setIsConsolidated(true);
        setShowConsolidatedModal(true);
        setSuccessMessage(result.message);
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || "Failed to consolidate attendance data.");
      }
    } catch (error) {
      console.error("Error consolidating attendance data:", error);
      setError("An error occurred while consolidating attendance data.");
    }
  };



  // Calculate Final OT Hours based on logic
  const calculateFinalOTHours = (otHours) => {
    const [hours, minutes] = otHours.split(":").map(Number);

    if (minutes >= 55) {
      return (hours + 1).toFixed(1);
    } else if (minutes >= 30) {
      return (hours + 0.5).toFixed(1);
    }
    return hours.toFixed(1);
  };


  const handleShiftChange = async (empCode, date, shiftId) => {
    try {
      const response = await fetch("http://localhost:5000/api/update-shift-change", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shift_id: shiftId }),
      });

      if (response.ok) {
        const { start_time: newStartTime, end_time: newEndTime } = await response.json();

        // Find the row to update
        const row = organizedData.find((r) => r.empCode === empCode && r.date === date);
        const { inTime, outTime } = row;

        // Recalculate Late By
        const lateBy = calculateLateBy(newStartTime, inTime);

        // Recalculate OT Hours and Final OT Hours
        const otHours = calculateOTHoursWithLateBy(newEndTime, outTime, lateBy);
        const finalOTHours = calculateFinalOTHours(otHours);

        // Update the organized data
        setOrganizedData((prevData) =>
          prevData.map((row) =>
            row.empCode === empCode && row.date === date
              ? {
                ...row,
                shiftName: "", // Clear Shift
                shiftChange: shiftId,
                lateBy,
                otHours,
                finalOTHours, // Update Final OT Hours
              }
              : row
          )
        );

        setSuccessMessage("Shift updated successfully!");
      } else {
        setError("Failed to update shift.");
      }
    } catch (error) {
      console.error("Error updating shift:", error);
      setError("Failed to update shift.");
    }
  };



  return (
    <Box sx={{ padding: 2, maxWidth: 1100, margin: "0 auto" }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ marginBottom: 2, backgroundColor: "#1e88e5" }}>
        <Toolbar
          sx={{
            justifyContent: "space-between",
            flexDirection: isSmallScreen ? "column" : "row",
            alignItems: isSmallScreen ? "stretch" : "center",
            gap: 1,
            padding: 2,
          }}
        >
          <Typography
            variant={isSmallScreen ? "h6" : "h5"}
            sx={{ textAlign: isSmallScreen ? "center" : "left", flexGrow: 1, fontWeight: "bold" }}
          >
            Organize Attendance Data
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: isSmallScreen ? "center" : "flex-end",
              width: isSmallScreen ? "100%" : "auto",
            }}
          >
            <Button
              variant="contained"
              sx={{
                fontSize: isSmallScreen ? "0.8rem" : "1rem",
                padding: "6px 12px",
                width: isSmallScreen ? "100%" : "auto",
                backgroundColor: "#FFD700",
                color: "black",
                fontWeight: "bold",
              }}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => setLogoutModal(true)}
              sx={{
                fontSize: isSmallScreen ? "0.8rem" : "1rem",
                padding: "6px 12px",
                width: isSmallScreen ? "100%" : "auto",
                backgroundColor: "#b23b3b",
                color: "White",
                fontWeight: "bold",
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Paper sx={{ padding: 1, marginTop: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={2}>
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

          <Grid item xs={2}>
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
          <Grid item xs={2}>

            <TextField
              select
              label="Location"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)} // Correctly update locationName
              fullWidth
            >
              {Array.isArray(locationNameOptions) &&
                locationNameOptions.map((location) => (
                  <MenuItem key={location.id} value={location.name}>
                    {location.name} {/* Use location.name for display */}
                  </MenuItem>
                ))}
            </TextField>

          </Grid>

          <Grid item xs={2}>
            <Button variant="contained" component="label" fullWidth>
              Upload File
              <input
                type="file"
                hidden
                onChange={handleFileUpload}
                accept=".csv, .xlsx, .xls"
              />
            </Button>
            {file && (
              <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
                {file.name}
              </Typography>
            )}
          </Grid>

          <Grid item xs={2}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleOrganize}
            >
              Organize
            </Button>
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="contained"
              color="primary" // Updated to match the "Organize" button
              fullWidth
              onClick={handleConsolidateAttendance}
              disabled={isConsolidated} // Disable after consolidation
            >
              Consolidate Attendance Data
            </Button>
          </Grid>

        </Grid>
      </Paper>

      {error && (
        <Typography className="error-message">
          {error}
        </Typography>
      )}

      {successMessage && (
        <Typography className="success-message">
          {successMessage}
        </Typography>
      )}

      {organizedData.length > 0 && (
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead className="table-head">
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>In Time</TableCell>
                <TableCell>Out Time</TableCell>
                <TableCell>Shift</TableCell>
                <TableCell>Shift Change</TableCell>
                <TableCell>Late By</TableCell>
                <TableCell>OT Hours</TableCell>
                <TableCell>Final OT Hours</TableCell>
                <TableCell>Present Days</TableCell> {/* Add Present Days */}
              </TableRow>
            </TableHead>

            <TableBody>
              {organizedData.map((row, index) => (
                <TableRow key={index} className="table-row">
                  <TableCell>{row.empCode}</TableCell>
                  <TableCell>{row.empName}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.inTime}</TableCell>
                  <TableCell>{row.outTime}</TableCell>
                  <TableCell>{row.shiftName || ""}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      value={row.shiftChange || ""}
                      onChange={(e) => handleShiftChange(row.empCode, row.date, e.target.value)}
                      fullWidth
                    >
                      {shifts.map((shift) => (
                        <MenuItem key={shift.shift_id} value={shift.shift_id}>
                          {shift.shift_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>{row.lateBy || "On Time"}</TableCell>
                  <TableCell>{row.otHours}</TableCell>
                  <TableCell>{row.finalOTHours}</TableCell>
                  <TableCell>{row.presentDays}</TableCell> {/* Add Present Days */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}


      {/* Logout Modal */}
      <Modal open={logoutModal} onClose={() => setLogoutModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: isSmallScreen ? 2 : 4,
            boxShadow: 24,
            borderRadius: 2,
            textAlign: 'center',
            width: { xs: '90%', sm: '400px' },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              marginBottom: 2,
            }}
          >
            Confirm Logout
          </Typography>
          <Typography variant="h6" gutterBottom>
            Are you sure you want to log out?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                localStorage.clear();
                navigate('/');
              }}
            >
              Yes, I Confirm
            </Button>
            <Button variant="outlined" onClick={() => setLogoutModal(false)}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={showConsolidatedModal} onClose={() => setShowConsolidatedModal(false)}>
        <Box sx={{ ...modalStyles }}>
          <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: "bold" }}>
            Consolidated Attendance Data
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Employee ID</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Total Present Days</TableCell>
                <TableCell>Total OT Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consolidatedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.employee_id}</TableCell>
                  <TableCell>{row.employee_name}</TableCell>
                  <TableCell>{row.total_present_days}</TableCell>
                  <TableCell>{row.total_ot_hours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={() => setShowConsolidatedModal(false)} variant="outlined" sx={{ marginTop: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>

    </Box>
  );
};

export default OrganizeAttendance;
