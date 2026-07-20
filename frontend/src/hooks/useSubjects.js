import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { FALLBACK_SUBJECTS } from '../constants/subjects';

export function useSubjects() {
  const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get('/api/subjects', { auth: false })
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setSubjects(data);
        }
      })
      .catch(() => {
        // no /api/subjects endpoint yet — keep the fallback list
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return subjects;
}
