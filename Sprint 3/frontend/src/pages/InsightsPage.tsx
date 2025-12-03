import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from "recharts";
import { TrendingUp, Utensils, Zap, Loader2 } from "lucide-react";
// Corrected import paths
import { useAuth } from "../context/AuthContext";
import { apiGetCorrelationData, CorrelationLogEntry, FoodServings } from "../api";
import { FOOD_GROUPS, POSITIVE_HABITS, NEGATIVE_HABITS } from "../constants"; // Using imported constants

// Helper function to calculate the average mood change for a habit
const calculateHabitMoodAverages = (data: CorrelationLogEntry[], habitsList: string[], type: 'positive' | 'negative') => {
    const habitStats: { [key: string]: { totalMood: number; count: number } } = {};
    const netMoodsWithoutHabit: number[] = [];
    
    // Initialize stats for all habits
    habitsList.forEach(habit => {
        habitStats[habit] = { totalMood: 0, count: 0 };
    });

    data.forEach(entry => {
        const habitsPresent = type === 'positive' ? entry.positiveHabits : entry.negativeHabits;
        let isHabitPresent = false;
        
        // Check if any monitored habit was present in this entry
        habitsPresent.forEach(habit => {
            if (habitStats[habit]) {
                habitStats[habit].totalMood += entry.netMoodScore;
                habitStats[habit].count += 1;
                isHabitPresent = true;
            }
        });

        // Record mood score if none of the *monitored* positive/negative habits were present
        if (!isHabitPresent) {
            netMoodsWithoutHabit.push(entry.netMoodScore);
        }
    });

    // Calculate the average mood score without the habit(s) to serve as a baseline
    const avgMoodWithoutHabit = netMoodsWithoutHabit.length > 0
        ? netMoodsWithoutHabit.reduce((a, b) => a + b, 0) / netMoodsWithoutHabit.length
        : 0;

    // Calculate the difference from the baseline (average mood without the habit)
    return habitsList.map(habit => {
        const stats = habitStats[habit];
        const avgMoodWithHabit = stats.count > 0 ? stats.totalMood / stats.count : avgMoodWithoutHabit;
        const moodDelta = avgMoodWithHabit - avgMoodWithoutHabit;

        return {
            name: habit,
            avgMood: avgMoodWithHabit,
            baseline: avgMoodWithoutHabit,
            moodDelta: parseFloat(moodDelta.toFixed(2)), // Difference from baseline
            count: stats.count,
        };
    }).filter(h => h.count > 0); // Only show habits that were logged
};

// --- Main Component ---
const InsightsPage: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<CorrelationLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      apiGetCorrelationData(token)
        .then((correlationData) => {
          setData(correlationData);
          setIsLoading(false);
        })
        .catch((e) => {
          setError("Failed to fetch correlation data.");
          console.error(e);
          setIsLoading(false);
        });
    }
  }, [token]);

  // --- Data Transformation for Charts ---

  // 1. Food Correlation Data (Scatter Plot for each food group)
  // We use the raw data directly, plotting food servings (X) vs netMoodScore (Y)
  const foodCorrelationData = useMemo(() => {
    if (data.length === 0) return [];
    
    // Create an array of objects for each logged day, suitable for the ScatterChart
    return data.map(entry => {
        // Ensure timestamp is a valid string/date before calling toLocaleDateString
        const date = new Date(entry.timestamp).toLocaleDateString(undefined, {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
        return {
            date: date, // Label for tooltip
            netMoodScore: entry.netMoodScore,
            ...entry.foodServings, // vegetables, protein, grains, etc.
        };
    });
  }, [data]);

  // 2. Habit Correlation Data (Bar Chart for mood delta)
  const positiveHabitDeltas = useMemo(() => {
    return calculateHabitMoodAverages(data, POSITIVE_HABITS, 'positive');
  }, [data]);
  
  const negativeHabitDeltas = useMemo(() => {
    return calculateHabitMoodAverages(data, NEGATIVE_HABITS, 'negative');
  }, [data]);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
        <Loader2 className="animate-spin text-purple-600 h-10 w-10 mb-4" />
        <p className="text-xl text-gray-700">Analyzing your data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 p-4">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  if (data.length < 5) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
              <TrendingUp className="text-purple-500 h-16 w-16 mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Need More Data</h1>
              <p className="text-lg text-gray-600 max-w-md">
                  We need at least 5 log entries to start generating meaningful correlation insights. 
                  Keep logging your mood, food, and habits!
              </p>
          </div>
      );
  }

  // Common styling classes
  const cardClass = "bg-white p-6 rounded-xl shadow-2xl border border-gray-100 mb-8";
  const titleClass = "text-2xl font-bold text-gray-700 mb-6 flex items-center gap-3 border-b pb-2";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-green-600">
            Correlation Insights
          </span>
        </h1>

        {/* --- 1. Food Group vs. Mood Correlation --- */}
        <div className={cardClass}>
          <h2 className={titleClass}>
            <Utensils className="text-orange-500" />
            Food Servings vs. Net Mood Score
          </h2>
          <p className="text-gray-600 mb-6">
              This scatter plot shows the relationship between the total number of servings of each food group you log on a day (X-axis) and your Net Mood Score (Y-axis). 
              A higher mood score suggests a better mood. Look for clusters or clear trends: for example, are your mood scores generally higher on days with more vegetable servings?
          </p>
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" dataKey="value" name="Servings" unit=" portions" />
                <YAxis type="number" dataKey="netMoodScore" name="Net Mood Score" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                    formatter={(value, name, props) => [`${value} ${name === 'netMoodScore' ? '' : 'portions'}`, name]}
                    labelFormatter={(label, props) => `Logged on: ${props[0]?.payload?.date || ''}`}
                />
                <Legend />
                
                {/* Dynamically draw scatter points for each food group */}
                {Object.keys(FOOD_GROUPS).map((key, index) => {
                    const foodKey = key as keyof FoodServings;
                    const color = ["#00B894", "#E17055", "#0984E3", "#6C5CE7", "#FDCB6E"][index % 5]; // Distinct colors
                    
                    // Map the foodCorrelationData to include the specific food value for the X-axis
                    const scatterData = foodCorrelationData
                        .filter(d => d[foodKey] > 0) // Only plot days where the food was logged
                        .map(d => ({
                            value: d[foodKey], // This will be X
                            netMoodScore: d.netMoodScore, // This will be Y
                            date: d.date // Keep date for tooltip
                        }));

                    return (
                        <Scatter 
                            key={foodKey} 
                            name={foodKey.charAt(0).toUpperCase() + foodKey.slice(1)} // Capitalize name
                            data={scatterData} 
                            fill={color} 
                            dataKey="value" 
                        />
                    );
                })}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* --- 2. Habit Correlation (Positive) --- */}
        <div className={cardClass}>
          <h2 className={titleClass}>
            <Zap className="text-green-500" />
            Positive Habits: Average Mood Change (vs. Baseline)
          </h2>
          <p className="text-gray-600 mb-6">
             This chart shows how much your Net Mood Score changes (the "Mood Delta") on days you log a specific positive habit compared to your average mood on all other days (the baseline). Positive bars indicate a mood boost.
          </p>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={positiveHabitDeltas} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} stroke="#4A5568" />
                    <YAxis dataKey="moodDelta" name="Mood Delta" />
                    <Tooltip 
                        formatter={(value, name) => [value, "Mood Delta"]}
                        labelFormatter={(label) => label}
                    />
                    <Legend />
                    <Bar dataKey="moodDelta" name="Mood Boost" fill="#059669" />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- 3. Habit Correlation (Negative) --- */}
        <div className={cardClass}>
          <h2 className={titleClass}>
            <Zap className="text-red-500" />
            Negative Habits: Average Mood Change (vs. Baseline)
          </h2>
           <p className="text-gray-600 mb-6">
             This chart shows the change in your Net Mood Score on days you log a negative habit. Negative bars suggest that the habit is associated with a lower mood compared to your baseline.
          </p>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={negativeHabitDeltas} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} stroke="#4A5568" />
                    <YAxis dataKey="moodDelta" name="Mood Delta" />
                    <Tooltip 
                        formatter={(value, name) => [value, "Mood Delta"]}
                        labelFormatter={(label) => label}
                    />
                    <Legend />
                    <Bar dataKey="moodDelta" name="Mood Drop" fill="#EF4444" />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
            <p>Data reflects all logged entries since account creation.</p>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;