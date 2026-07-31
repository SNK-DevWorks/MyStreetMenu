'use client';

import React from 'react';

export function PizzaLoader() {
  return (
    <div className="pizza-loader-wrapper">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="pizza-slice">
          <div className="tomato" />
          <div className="tomato" />
          <div className="olive" />
        </div>
      ))}
    </div>
  );
}

export default PizzaLoader;
