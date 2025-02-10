import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Modal,
    TextField,
    MenuItem,
    AppBar,
    Toolbar,
    useMediaQuery,
} from '@mui/material';
import { useNavigate } from "react-router-dom";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const PayrollMapping = () => {
    const [headers, setHeaders] = useState([]);
    const [mappedFields, setMappedFields] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [mappings, setMappings] = useState([]);
    const [logoutModal, setLogoutModal] = useState(false);
    const [isNewMapping, setIsNewMapping] = useState(false);
    const navigate = useNavigate();
    const isSmallScreen = useMediaQuery("(max-width:600px)");

    // Fetch payroll headers
    useEffect(() => {
        if (isNewMapping) {
            fetch("http://localhost:5000/api/headers")
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! Status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    setHeaders(data);
                })
                .catch((err) => console.error("Error fetching headers:", err));
        }
    }, [isNewMapping]);

    // Fetch existing mappings
    useEffect(() => {
        if (!isNewMapping) {
            fetch("http://localhost:5000/api/mappings")
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! Status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    setMappings(data);
                })
                .catch((err) => console.error("Error fetching mappings:", err));
        }
    }, [isNewMapping]);

    // Handle drag-and-drop
    const onDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) return;

        if (source.droppableId === destination.droppableId) {
            const items =
                source.droppableId === "payroll-headers" ? Array.from(headers) : Array.from(mappedFields);
            const [movedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, movedItem);

            source.droppableId === "payroll-headers"
                ? setHeaders(items)
                : setMappedFields(items);
        } else {
            const sourceList =
                source.droppableId === "payroll-headers" ? Array.from(headers) : Array.from(mappedFields);
            const destList =
                destination.droppableId === "payroll-headers" ? Array.from(headers) : Array.from(mappedFields);

            const [movedItem] = sourceList.splice(source.index, 1);
            destList.splice(destination.index, 0, movedItem);

            setHeaders(source.droppableId === "payroll-headers" ? sourceList : destList);
            setMappedFields(source.droppableId === "payroll-headers" ? destList : sourceList);
        }
    };

    // Handle save
    const handleSave = () => {
        if (!categoryName.trim() || mappedFields.length === 0) {
            alert("Category name and mapped fields are required");
            return;
        }

        const payrollColumnList = JSON.stringify(mappedFields);

        fetch("http://localhost:5000/api/save-mapping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoryName, payrollColumnList }),
        })
            .then((res) => res.json())
            .then((data) => {
                alert(data.message);
                setIsNewMapping(false);
            })
            .catch((err) => {
                console.error("Error saving mapping:", err);
                alert("Failed to save mapping");
            });
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            {!isNewMapping ? (
                <div>
                    <h1>Category Mappings</h1>
                    <button
                        onClick={() => setIsNewMapping(true)}
                        style={{
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: "5px",
                            backgroundColor: "#007bff",
                            color: "white",
                            cursor: "pointer",
                            marginBottom: "20px",
                        }}
                    >
                        New
                    </button>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #ccc" }}>
                                <th style={{ padding: "10px", textAlign: "left" }}>Category Name</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>Payroll Columns</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mappings.map((mapping, index) => (
                                <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
                                    <td style={{ padding: "10px" }}>{mapping.category_name}</td>
                                    <td style={{ padding: "10px" }}>
                                        {JSON.parse(mapping.payroll_column_list).join(", ")}
                                    </td>
                                    <td style={{ padding: "10px" }}>{new Date(mapping.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div>
                    <h1>Category Mapping</h1>

                    <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="categoryName">Category Name: </label>
                        <input
                            type="text"
                            id="categoryName"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            style={{
                                padding: "5px",
                                border: "1px solid #ccc",
                                borderRadius: "3px",
                                width: "200px",
                            }}
                        />
                    </div>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "20px",
                            }}
                        >
                            <Droppable droppableId="payroll-headers">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        style={{
                                            border: "1px solid #007bff",
                                            borderRadius: "5px",
                                            width: "45%",
                                            padding: "10px",
                                            backgroundColor: "#f8f9fa",
                                        }}
                                    >
                                        <h3>Payroll Headers</h3>
                                        {headers.map((header, index) => (
                                            <Draggable
                                                key={header}
                                                draggableId={header}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            padding: "8px",
                                                            margin: "5px 0",
                                                            border: "1px solid #007bff",
                                                            borderRadius: "3px",
                                                            backgroundColor: "#e9ecef",
                                                            ...provided.draggableProps.style,
                                                        }}
                                                    >
                                                        {header}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>

                            <Droppable droppableId="mapping-fields">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        style={{
                                            border: "1px solid #28a745",
                                            borderRadius: "5px",
                                            width: "45%",
                                            padding: "10px",
                                            backgroundColor: "#f8f9fa",
                                        }}
                                    >
                                        <h3>Mapping Fields</h3>
                                        {mappedFields.map((field, index) => (
                                            <Draggable
                                                key={field}
                                                draggableId={field}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            padding: "8px",
                                                            margin: "5px 0",
                                                            border: "1px solid #28a745",
                                                            borderRadius: "3px",
                                                            backgroundColor: "#d4edda",
                                                            ...provided.draggableProps.style,
                                                        }}
                                                    >
                                                        {field}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    </DragDropContext>

                    <div style={{ marginTop: "20px" }}>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: "10px 20px",
                                border: "none",
                                borderRadius: "5px",
                                backgroundColor: "#007bff",
                                color: "white",
                                cursor: "pointer",
                            }}
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
            
           
        </div>
    );
};

export default PayrollMapping;
