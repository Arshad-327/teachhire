import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

export function useOwnTeacherProfileId(role) {
  const [teacherProfileId, setTeacherProfileId] = useState(null);

  useEffect(() => {
    if (role !== 'TEACHER') {
      setTeacherProfileId(null);
      return;
    }

    let cancelled = false;
    apiClient
      .get('/api/teachers/me/profile')
      .then((data) => {
        if (!cancelled) setTeacherProfileId(data.id);
      })
      .catch(() => {
        if (!cancelled) setTeacherProfileId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [role]);

  return teacherProfileId;
}
