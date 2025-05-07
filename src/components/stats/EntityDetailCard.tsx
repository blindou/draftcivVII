import React from 'react';
import Card from '../ui/Card';

interface EntityDetailCardProps {
  name: string;
  image: string;
  description?: string;
  stats: {
    label: string;
    value: string | number;
  }[];
}

const EntityDetailCard: React.FC<EntityDetailCardProps> = ({
  name,
  image,
  description,
  stats,
}) => {
  return (
    <Card>
      <Card.Content className="flex gap-6">
        <div className="w-48 h-48 shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{name}</h2>
          {description && (
            <p className="text-gray-400 mb-4">{description}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400">{stat.label}</div>
                <div className="text-xl font-bold text-amber-500">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default EntityDetailCard;