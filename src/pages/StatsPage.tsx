import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  ResponsiveContainer
} from 'recharts';
import { BarChart as ChartBar, PieChart as PieChartIcon, TrendingUp, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import civData from '../data/civs.json';
import leaderData from '../data/leaders.json';
import souvenirData from '../data/souvenirs.json';

interface DraftStats {
  totalDrafts: number;
  draftsByMode: { mode: string; count: number; }[];
  mostPickedCivs: { name: string; count: number; }[];
  mostBannedCivs: { name: string; count: number; }[];
  mostPickedLeaders: { name: string; count: number; }[];
  mostBannedLeaders: { name: string; count: number; }[];
  mostBannedSouvenirs: { name: string; count: number; }[];
  draftsOverTime: { date: string; count: number; }[];
}

const COLORS = ['#f59e0b', '#0ea5e9', '#10b981', '#8b5cf6', '#ec4899'];

const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<DraftStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all drafts
        const { data: drafts, error: draftsError } = await supabase
          .from('drafts')
          .select('*')
          .order('created_at', { ascending: true });

        if (draftsError) throw draftsError;

        // Fetch all actions
        const { data: actions, error: actionsError } = await supabase
          .from('draft_actions')
          .select('*');

        if (actionsError) throw actionsError;

        // Process draft modes
        const draftsByMode = drafts.reduce((acc: { [key: string]: number }, draft) => {
          acc[draft.team_mode] = (acc[draft.team_mode] || 0) + 1;
          return acc;
        }, {});

        // Process civilizations
        const civPicks: { [key: string]: number } = {};
        const civBans: { [key: string]: number } = {};
        const leaderPicks: { [key: string]: number } = {};
        const leaderBans: { [key: string]: number } = {};
        const souvenirBans: { [key: string]: number } = {};

        actions.forEach(action => {
          if (action.category === 'civ') {
            if (action.action_type === 'pick') {
              civPicks[action.choice_id] = (civPicks[action.choice_id] || 0) + 1;
            } else {
              civBans[action.choice_id] = (civBans[action.choice_id] || 0) + 1;
            }
          } else if (action.category === 'leader') {
            if (action.action_type === 'pick') {
              leaderPicks[action.choice_id] = (leaderPicks[action.choice_id] || 0) + 1;
            } else {
              leaderBans[action.choice_id] = (leaderBans[action.choice_id] || 0) + 1;
            }
          } else if (action.category === 'souvenir') {
            souvenirBans[action.choice_id] = (souvenirBans[action.choice_id] || 0) + 1;
          }
        });

        // Process drafts over time
        const draftsOverTime = drafts.reduce((acc: { [key: string]: number }, draft) => {
          const date = new Date(draft.created_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        // Transform data for charts
        const stats: DraftStats = {
          totalDrafts: drafts.length,
          draftsByMode: Object.entries(draftsByMode).map(([mode, count]) => ({
            mode,
            count,
          })),
          mostPickedCivs: Object.entries(civPicks)
            .map(([id, count]) => ({
              name: civData.civilizations.find(c => c.id === id)?.name || id,
              count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          mostBannedCivs: Object.entries(civBans)
            .map(([id, count]) => ({
              name: civData.civilizations.find(c => c.id === id)?.name || id,
              count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          mostPickedLeaders: Object.entries(leaderPicks)
            .map(([id, count]) => ({
              name: leaderData.leaders.find(l => l.id === id)?.name || id,
              count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          mostBannedLeaders: Object.entries(leaderBans)
            .map(([id, count]) => ({
              name: leaderData.leaders.find(l => l.id === id)?.name || id,
              count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          mostBannedSouvenirs: Object.entries(souvenirBans)
            .map(([id, count]) => ({
              name: souvenirData.souvenirs.find(s => s.id === id)?.name || id,
              count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          draftsOverTime: Object.entries(draftsOverTime)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        };

        setStats(stats);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-500">{error || 'Failed to load statistics'}</p>
      </Card>
    );
  }

  if (stats.totalDrafts === 0) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold text-amber-500 mb-4">No Draft Data Yet</h2>
        <p className="text-gray-400">
          Start creating drafts to see statistics and insights here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4"
        >
          <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
            Draft Statistics
          </span>
        </motion.h1>
        <p className="text-gray-400">
          Insights and trends from {stats.totalDrafts} completed drafts
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20">
            <Card.Content className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-400">Total Drafts</p>
                <p className="text-3xl font-bold text-amber-500">{stats.totalDrafts}</p>
              </div>
              <ChartBar className="w-8 h-8 text-amber-500" />
            </Card.Content>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20">
            <Card.Content className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-400">Most Popular Mode</p>
                <p className="text-3xl font-bold text-blue-500">
                  {stats.draftsByMode[0]?.mode || 'N/A'}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </Card.Content>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20">
            <Card.Content className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-400">Top Civilization</p>
                <p className="text-3xl font-bold text-green-500">
                  {stats.mostPickedCivs[0]?.name || 'N/A'}
                </p>
              </div>
              <PieChartIcon className="w-8 h-8 text-green-500" />
            </Card.Content>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/20 to-violet-900/20">
            <Card.Content className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-400">Top Leader</p>
                <p className="text-3xl font-bold text-purple-500">
                  {stats.mostPickedLeaders[0]?.name || 'N/A'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </Card.Content>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Drafts Over Time */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Drafts Over Time</h2>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.draftsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Draft Modes Distribution */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Draft Modes Distribution</h2>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.draftsByMode}
                    dataKey="count"
                    nameKey="mode"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {stats.draftsByMode.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Most Picked Civilizations */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Most Picked Civilizations</h2>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.mostPickedCivs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Most Banned Civilizations */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Most Banned Civilizations</h2>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.mostBannedCivs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Most Picked Leaders */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Most Picked Leaders</h2>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.mostPickedLeaders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Most Banned Leaders */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Most Banned Leaders</h2>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.mostBannedLeaders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar dataKey="count" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;