import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Database } from '../types/supabase';
import gameData from '../data/civs.json';
import leaderData from '../data/leaders.json';
import souvenirData from '../data/souvenirs.json';

type Draft = Database['public']['Tables']['drafts']['Insert'];

const TEAM_MODES = ['2v2', '3v3', '4v4'] as const;

const CreateDraftPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedCivs, setSelectedCivs] = React.useState<string[]>([]);
  const [selectedLeaders, setSelectedLeaders] = React.useState<string[]>([]);
  const [selectedSouvenirs, setSelectedSouvenirs] = React.useState<string[]>([]);
  const [souvenirSearch, setSouvenirSearch] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const draft: Draft = {
      team_mode: formData.get('teamMode') as Draft['team_mode'],
      enable_souvenir_ban: formData.get('enableSouvenirBan') === 'on',
      timer_seconds: parseInt(formData.get('timerSeconds') as string, 10),
      team1_name: formData.get('team1Name') as string,
      auto_ban_civilizations: selectedCivs,
      auto_ban_leaders: selectedLeaders,
      auto_ban_souvenirs: selectedSouvenirs,
    };

    try {
      const { data, error: supabaseError } = await supabase
          .from('drafts')
          .insert(draft)
          .select('id')
          .single();

      if (supabaseError) throw supabaseError;
      if (!data?.id) throw new Error('Failed to create draft');

      navigate(`/draft/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create draft');
      setIsLoading(false);
    }
  };

  const handleCivSelection = (civId: string) => {
    setSelectedCivs(prev =>
        prev.includes(civId)
            ? prev.filter(id => id !== civId)
            : [...prev, civId]
    );
  };

  const handleLeaderSelection = (leaderId: string) => {
    setSelectedLeaders(prev =>
        prev.includes(leaderId)
            ? prev.filter(id => id !== leaderId)
            : [...prev, leaderId]
    );
  };

  const handleSouvenirSelection = (souvenirId: string) => {
    setSelectedSouvenirs(prev =>
        prev.includes(souvenirId)
            ? prev.filter(id => id !== souvenirId)
            : [...prev, souvenirId]
    );
  };

  const filteredSouvenirs = souvenirData.souvenirs.filter(souvenir =>
    souvenir.name.toLowerCase().includes(souvenirSearch.toLowerCase())
  );

  return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Draft Session</h1>

        <Card>
          <form onSubmit={handleSubmit}>
            <Card.Content className="space-y-6">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-300">Team Mode</span>
                  <select
                      name="teamMode"
                      className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-100"
                      defaultValue="2v2"
                  >
                    {TEAM_MODES.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-300">Enable Mementos Ban Phase</span>
                  <div className="mt-1">
                    <input
                        type="checkbox"
                        name="enableSouvenirBan"
                        className="rounded bg-gray-800 border-gray-700 text-blue-500"
                    />
                  </div>
                </label>

                <Input
                    label="Timer per Action (seconds)"
                    name="timerSeconds"
                    type="number"
                    min="30"
                    max="300"
                    defaultValue="90"
                    required
                />

                <Input
                    label="Team 1 Name"
                    name="team1Name"
                    required
                    placeholder="Enter your team name"
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Auto-Ban Civilizations
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-gray-800 rounded-md p-2">
                    {gameData.civilizations.map(civ => (
                        <label key={civ.id} className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                          <input
                              type="checkbox"
                              checked={selectedCivs.includes(civ.id)}
                              onChange={() => handleCivSelection(civ.id)}
                              className="rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-200">{civ.name}</span>
                        </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Auto-Ban Leaders
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-gray-800 rounded-md p-2">
                    {leaderData.leaders.map(leader => (
                        <label key={leader.id} className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                          <input
                              type="checkbox"
                              checked={selectedLeaders.includes(leader.id)}
                              onChange={() => handleLeaderSelection(leader.id)}
                              className="rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-200">{leader.name}</span>
                        </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Auto-Ban Mementos
                  </label>
                  <Input
                    label="Mementos search"
                    name="souvenirSearch"
                    value={souvenirSearch}
                    onChange={(e) => setSouvenirSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-gray-800 rounded-md p-2">
                    {filteredSouvenirs.map(souvenir => (
                        <label key={souvenir.id} className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                          <input
                              type="checkbox"
                              checked={selectedSouvenirs.includes(souvenir.id)}
                              onChange={() => handleSouvenirSelection(souvenir.id)}
                              className="rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-200">{souvenir.name}</span>
                        </label>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                  <div className="text-red-500 text-sm">{error}</div>
              )}
            </Card.Content>

            <Card.Footer className="flex justify-end">
              <Button type="submit" isLoading={isLoading}>
                Create Draft Session
              </Button>
            </Card.Footer>
          </form>
        </Card>
      </div>
  );
};

export default CreateDraftPage;