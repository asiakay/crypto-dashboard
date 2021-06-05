import { Line } from "react-chartjs-2";
// import Button from '@material-ui/core/Button';


function Dashboard({ price, data }) {
    const opts = {
        tooltips: {
            intersect: false,
            maintainAspectRatio: false
        },
        responsive: true,
        maintainAspectRatio: false
    };
    if (price === "0.00") {
        return <div>
            <h2>Please... Select a currency pair!</h2></div>
    }
    return (
        <div className="dashboard">
            <h2>{`$${price}`}</h2>
            <div className="chart-container">
            <Line data={data} options={opts} />
            </div>
        </div>
    );
}

export default Dashboard;
