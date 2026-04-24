/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KnowledgePoint, RAW_CSV_DATA, CATEGORY_MAP } from './constants';

export function parseKnowledgePoints(): KnowledgePoint[] {
  const lines = RAW_CSV_DATA.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map((line, index) => {
    const parts = line.split(',');
    const rawCategory = parts[0];
    const category = CATEGORY_MAP[rawCategory] || rawCategory;
    const itemName = parts[2];
    
    return {
      id: `${category}-${parts[1]}-${itemName}-${index}`,
      category,
      subcategory: parts[1],
      name: itemName,
      grade: parts[3] || '不限'
    };
  });
}

import { useState, useEffect } from 'react';
import { ProgressState } from './constants';

export function usePersistence() {
  const [progress, setProgress] = useState<ProgressState>(() => {
    const saved = localStorage.getItem('math_leaning_progress');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('math_leaning_progress', JSON.stringify(progress));
  }, [progress]);

  const togglePoint = (id: string) => {
    setProgress(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return { progress, togglePoint };
}
