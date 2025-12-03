import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGetInsights, DailyInsight } from "../api";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const InsightsPage: React.FC = () => {
    const [insight, setInsight] = useState<string>("");
    const [chartData, setChartData] = useState<DailyInsight[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const [visibleLines, setVisibleLines] = useState<{ [key: string]: boolean }>({
        vegetables: true,
        protein: true,
        grains: false,
        dairy: false,
        fruits: false,
    });

    useEffect(() => {
        if (token) {
            apiGetInsights(token)
                .then(response => {
                    setInsight(response.insight);
                    setChartData(response.chartData);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [token]);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setVisibleLines(prevState => ({
            ...prevState,
            [name]: checked
        }));
    };
    
    if (loading) {
        return <div>Loading insights...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const allPositiveStates = Array.from(new Set(chartData.flatMap(d => Object.keys(d.positiveStates))));
    const allFoodGroups = ["vegetables", "protein", "grains", "dairy", "fruits"];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Your Insights</h1>
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
                <p className="font-bold">Insight</p>
                <p>{insight}</p>
            </div>

            <h2 className="text-xl font-semibold mb-2">Moods vs. Food Intake Over Time</h2>
            
            <div className="mb-4">
                <p className="font-semibold">Toggle Food Groups:</p>
                {allFoodGroups.map(group => (
                    <label key={group} className="inline-flex items-center mr-4">
                        <input
                            type="checkbox"
                            name={group}
                            checked={visibleLines[group]}
                            onChange={handleCheckboxChange}
                            className="form-checkbox"
                        />
                        <span className="ml-2 capitalize">{group}</span>
                    </label>
                ))}
            </div>

            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        
                        {allPositiveStates.map((state, index) => (
                             <Line key={state} type="monotone" dataKey={(payload: DailyInsight) => payload.positiveStates[state]} name={state} stroke={COLORS[index % COLORS.length]} />
                        ))}

                        {allFoodGroups.map((group, index) => (
                           visibleLines[group] && <Line key={group} type="monotone" dataKey={(payload: DailyInsight) => payload.foodServings[group as keyof typeof payload.foodServings]} name={group} stroke={COLORS[(allPositiveStates.length + index) % COLORS.length]} strokeDasharray="5 5" />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default InsightsPage;

