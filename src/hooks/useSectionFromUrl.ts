// hooks/useSectionFromUrl.ts
import { useParams } from 'next/navigation';

export function useSectionFromUrl() {
  const params = useParams();
  
  // Assuming your route is /enot-explora/[sectionCode]
  const sectionCode = params?.section as keyof typeof sectionCenters | undefined;
  
  return sectionCode || 'UYMO'; // Default to Montevideo if no section in URL
}