
import { useNavigate } from 'react-router-dom';
import { UcoPlanPageHeader } from '@/components/uco/UcoPlanPageHeader';
import { UcoPlanForm } from '@/components/uco/UcoPlanForm';

const NewUcoPlanPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/uco/dashboard');
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <UcoPlanPageHeader onBack={handleBack} />
        <UcoPlanForm onCancel={handleBack} />
      </div>
    </div>
  );
};

export default NewUcoPlanPage;
