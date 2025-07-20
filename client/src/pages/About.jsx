

import React from 'react';

export default function About() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 px-4">
      <div className="max-w-4xl w-full bg-gray-900/80 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
        <h1 className="text-5xl font-semibold text-white mb-8">About AVN Estate</h1>
        <p className="text-lg text-gray-400 leading-relaxed mb-6">
          At AVN Estate, we are passionate about connecting people with their dream properties. 
          Specializing in buying, selling, and renting premium homes, we pride ourselves on delivering an effortless and rewarding real estate experience.
        </p>
        <p className="text-lg text-gray-400 leading-relaxed mb-6">
          Our mission is simple — to empower our clients with expert advice, personalized strategies, and a deep understanding of the market. 
          Whether you're searching for your next home or looking to make a profitable sale, AVN Estate stands by your side at every step.
        </p>
        <p className="text-lg text-gray-400 leading-relaxed">
          With a team of seasoned professionals, a passion for excellence, and an unwavering commitment to client success, 
          AVN Estate redefines what it means to buy, sell, and rent properties. Your journey deserves nothing less than the best.
        </p>
      </div>
    </section>
  );
}
