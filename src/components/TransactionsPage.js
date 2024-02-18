import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { PieChart, Pie } from 'recharts';
import api from '../api/dataAPI';

const COLORS = ['#ff1a1a', '#0088FE', '#00C49F', '#FF8042', '#AF19FF', '#FF8E43', '#FF19FF'];

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('March');
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [data, setData] = useState([]);
    const [pieData, setPieData] = useState([]);


    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchTransactions();
        fetchStatistics();
        fetchChartData();
        fetchPieData();
    }, [selectedMonth, searchText, currentPage]);


    const fetchTransactions = async () => {
        const response = await api.get(`/transactions/?month=${selectedMonth}&search=${searchText}&page=${currentPage}`)
        if (response.status !== 200) {
            throw new Error('Failed to fetch transactions');
        }

        const { data, totalPages } = response.data;
        console.log(response.data)
        setTransactions(data);
        setTotalPages(totalPages);
    };

    const fetchStatistics = async () => {
        try {
            const response = await api.get(`transaction-statistics/?month=${selectedMonth}`);

            if (response.status !== 200) {
                throw new Error('Failed to fetch statistics');
            }

            // console.log(response.data)
            setStatistics(response.data);

        } catch (error) {
            console.error('Error fetching transaction  statistics:', error);
        }
    };

    const fetchChartData = async () => {
        try {

            const response = await api.get(`/bar-chart?month=${selectedMonth}`);

            if (response.status !== 200) {
                throw new Error('Failed to fetch chart data');
            }
            // console.log(response.data)
            setData(response.data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    const fetchPieData = async () => {
        try {
            const response = await api.get(`/pie-chart?month=${selectedMonth}`);
            setPieData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleMonthChange = (e) => {
        const month = e.target.value;
        setSelectedMonth(month);
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        const searchText = e.target.value;
        setSearchText(searchText);
        setCurrentPage(1);

        const filteredTransactions = transactions.filter(transaction =>
            transaction.title.toLowerCase().includes(searchText.toLowerCase()) ||
            transaction.description.toLowerCase().includes(searchText.toLowerCase()) ||
            transaction.price.toString().includes(searchText)
        );
        setTransactions(filteredTransactions);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            const previousPage = currentPage - 1;
            setCurrentPage(previousPage);
        }
    };


    return (
        <div className='container-fluid'>
            <div className="row justify-content-between">
                <div className="col-sm-12  col-md-3 ">

                    {/*  search box */}
                    <input type="text"
                        value={searchText}
                        onChange={handleSearch}
                        placeholder="Search transaction..."
                        className='form-control' />
                </div>
                <div className="col-sm-12 col-md-3 mt-3 mt-md-0">

                    {/* Month dropdown */}
                    <select className="form-select" value={selectedMonth} onChange={handleMonthChange}>
                        {months.map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Display Table Data */}
            <div className="row mt-4 mb-4">
                <div className="col-md-12">
                    <div className="table-responsive">
                        <table className="table table-striped table-dark  table-bordered border-light align-content-center">
                            <thead className='text-center fs-6'>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Category</th>
                                    <th>Sold</th>
                                    <th>Image</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions && transactions.map((transaction, index) => (
                                    <tr key={`${transaction.id}-${index}`} >
                                        <td>{index + 1}</td>
                                        <td>{transaction.title}</td>
                                        <td>{transaction.description}</td>
                                        <td>{transaction.price}</td>
                                        <td>{transaction.category}</td>
                                        <td>{transaction.sold ? '1' : '0'}</td>
                                        <td><img className="transaction-image rounded" src={transaction.image} alt="Transaction" style={{ width: '50px', height: '50px' }} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Display Pagination Button */}
            <div className="row justify-content-between justify-content-md-evenly">
                <div className="col-12 col-md-4 mb-3 mb-md-0">
                    <button className="btn  w-100">Page  No: {currentPage} of {totalPages}</button>
                </div>
                <div className="col-12 col-md-4 mb-3 mb-md-0 d-flex justify-content-center">
                    {/* Pagination buttons */}
                    <button className="btn btn-primary me-3" disabled={currentPage === 1} onClick={handlePreviousPage}>Previous</button>
                    <button className="btn btn-success" disabled={currentPage === totalPages} onClick={handleNextPage}>Next</button>
                </div>
                <div className="col-12 col-md-4 d-flex justify-content-end">
                    <button className="btn w-100">Per Page: 10</button>
                </div>
            </div>

            {/* Display statistics */}
            <div className="row justify-content-center">
                <div className="col-md-6 bg-light">
                    <div className="p-4 bg-light">
                        <h2 className="text-center mb-4">Transaction Statistics</h2>
                        {statistics ? (
                            <div className='bg-warning p-4 rounded '>
                                <h4 className="mb-3">Statistics - {selectedMonth}</h4>
                                <p className='text-black mb-3'>Total Amount of Sale : {statistics.totalAmount}</p>
                                <p className='text-black mb-3'>Total Sold Items : {statistics.totalSoldItems}</p>
                                <p className='text-black mb-0'>Total Not Sold Items : {statistics.totalNotSoldItems}</p>
                            </div>
                        ) : (
                            <p>Loading statistics...</p>
                        )}
                    </div>
                </div>
            </div>


            {/* Display Bar */}
            <div className="row justify-content-center mt-3 mb-5">
                <div className="col-md-6">
                    <div>
                        <h2 className="text-center mb-4">Transactions Bar Chart</h2>
                        <h4 className="mb-3 text-danger">Bar Chart Stats - {selectedMonth}</h4>
                        <BarChart
                            width={800}
                            height={400}
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="priceRange" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#cc00cc" />
                        </BarChart>
                    </div>
                </div>
            </div>

            {/* Display Pie Data */}
            <div className="row justify-content-center mt-3 mb-5">
                <div className="col-md-6">
                    <div>
                        <h2 className="text-center mb-4">Pie Chart</h2>
                        <h4 className="mb-3 text-danger">Pie Chart Stats - {selectedMonth}</h4>
                        <PieChart width={800} height={400}>
                            <Pie data={pieData} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={100} label>
                                {
                                    pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))
                                }
                            </Pie>

                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default TransactionsPage

