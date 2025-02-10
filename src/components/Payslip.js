import React, { useState } from 'react';
import axios from 'axios';

const Payslip = () => {
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const years = Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index);

    const handleSendPayslip = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/send-payslip', { month, year });
            setStatusMessage(response.data.message || 'Payslips sent successfully');
        } catch (error) {
            console.error(error);
            setStatusMessage('Error sending payslips');
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ marginBottom: '20px' }}>Payslip Generation</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Year</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        style={{
                            padding: '8px',
                            width: '150px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                        }}
                    >
                        <option value="" disabled>Select Year</option>
                        {years.map((yr) => (
                            <option key={yr} value={yr}>
                                {yr}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Month</label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        style={{
                            padding: '8px',
                            width: '150px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                        }}
                    >
                        <option value="" disabled>Select Month</option>
                        {months.map((mon) => (
                            <option key={mon} value={mon}>
                                {mon}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ alignSelf: 'end' }}>
                    <button
                        onClick={handleSendPayslip}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        SEND PAYSLIP
                    </button>
                </div>
            </div>
            <p>{statusMessage}</p>
        </div>
    );
};

export default Payslip;
