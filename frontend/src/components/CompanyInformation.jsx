import { useDebounce } from '../hooks/useDebounce';
import { comprehensiveTrialAnalyzer } from '../services/ComprehensiveTrialAnalyzer';

export const CompanyInformation = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const debouncedAnalyze = useDebounce(async (name) => {
    if (name.length < 3) return;
    setIsAnalyzing(true);
    try {
      const analysis = await comprehensiveTrialAnalyzer.analyzeCompanyTrials(name);
      await api.saveTrialAnalysis(company.id, analysis);
      // Update company data with new info
    } catch (error) {
      toast.error("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  }, 1000);

  const handleCompanyNameChange = (event) => {
    const newName = event.target.value;
    setCompanyData(prev => ({ ...prev, name: newName }));
    debouncedAnalyze(newName);
  };

  return (
    <>
      {/* Existing form fields */}
      {isAnalyzing && (
        <SearchProgressIndicator message="AI Analysis in Progress..." />
      )}
    </>
  );
}; 