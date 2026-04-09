import React, { createContext, useState, useContext, ReactNode } from 'react';
import { JobPost } from '../types';

interface JobContextType {
  activeJobs: JobPost[];
  addJob: (job: JobPost) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [activeJobs, setActiveJobs] = useState<JobPost[]>([]);

  const addJob = (job: JobPost) => {
    setActiveJobs(prev => [job, ...prev]);
  };

  return (
    <JobContext.Provider value={{ activeJobs, addJob }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
