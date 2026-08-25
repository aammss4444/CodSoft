'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RegistrationPage from '../../../registration/page';

export default function InstituteRegisterAthlete() {
  const router = useRouter();
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstituteData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/');
          return;
        }

        const res = await fetch('http://localhost:5000/api/institutes/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          router.push('/');
          return;
        }

        const data = await res.json();
        if (data.success) {
          setInstitute(data.data);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error('Failed to fetch institute data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstituteData();
  }, [router]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC' }}>Loading Registration Form...</div>;
  }

  if (!institute) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC' }}>Unable to load Institute details.</div>;
  }

  // Determine Source Type based on Institute Type
  let sourceId = 'academy'; // Default to Academy
  if (institute.organization_type) {
    const type = institute.organization_type.toLowerCase();
    if (type.includes('school') || type.includes('college') || type.includes('university')) sourceId = 'school';
    if (type.includes('government')) sourceId = 'gov';
  }

  const prefillData = {
    source: sourceId,
    orgName: institute.org_name,
    instituteId: institute.id.toString(),
    linkedInstituteId: institute.id,
    instituteRegistrationId: institute.institute_registration_id,
    createdByRole: 'Institute',
    createdByUserId: null // Can be linked to the current logged in user if available via context
  };

  return (
    <div>
      <RegistrationPage prefillData={prefillData} />
    </div>
  );
}
