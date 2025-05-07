import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, Crown, Shield, Scroll, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ 
          backgroundImage: 'url(https://images.pexels.com/photos/4245826/pexels-photo-4245826.jpeg)',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto px-4"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                CivDraft VII
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Competitive civilization drafting made simple. Create, ban, and pick your way to victory.
            </p>
            <Link to="/create-draft">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border-2 border-amber-400/20 shadow-lg shadow-amber-900/20"
              >
                Start Draft
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-center mb-16"
            >
              <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Strategic Drafting System
              </span>
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Crown className="h-8 w-8 text-amber-500" />,
                  title: "Civilization Picks",
                  description: "Choose from a diverse roster of historical civilizations"
                },
                {
                  icon: <Shield className="h-8 w-8 text-amber-500" />,
                  title: "Strategic Bans",
                  description: "Counter your opponents through tactical civilization bans"
                },
                {
                  icon: <Swords className="h-8 w-8 text-amber-500" />,
                  title: "Team Battles",
                  description: "Engage in 2v2, 3v3, or 4v4 competitive matches"
                },
                {
                  icon: <Scroll className="h-8 w-8 text-amber-500" />,
                  title: "Draft History",
                  description: "Review and analyze your draft decisions"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-gray-800/50 backdrop-blur-sm border-amber-500/20 hover:border-amber-500/40 transition-colors">
                    <Card.Content className="text-center p-6">
                      <div className="bg-amber-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-amber-500">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300">
                        {feature.description}
                      </p>
                    </Card.Content>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto px-4"
          >
            <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-amber-500/20">
              <Card.Content className="text-center py-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-amber-500">
                  Ready to Begin Your Journey?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Create your first draft session and experience the strategic depth of civilization drafting.
                </p>
                <Link to="/create-draft">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border-2 border-amber-400/20"
                  >
                    Create Draft Session
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </Card.Content>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;